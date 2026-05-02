const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const query = (body.query || "").trim();
    const limit = Math.min(Math.max(Number(body.limit) || 80, 20), 180);

    if (!query) {
      return res.status(400).json({ error: "query is required" });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openchat/openchat-7b";
    const destChannel = (process.env.DEST_CHANNEL || "").trim();

    if (!openrouterKey) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is missing" });
    }
    if (!destChannel) {
      return res.status(500).json({ error: "DEST_CHANNEL is missing" });
    }

    const rawMessages = await fetchChannelMessages({
      destChannel,
      botToken: (process.env.BOT_TOKEN || "").trim(),
      limit,
    });

    if (!rawMessages.length) {
      return res.status(200).json({
        channel: destChannel,
        nodes: [{ id: "query", label: query, type: "query" }],
        edges: [],
        messages: [],
      });
    }

    const strictCandidates = lexicalPrefilter(rawMessages, query).slice(0, 45);
    const intelligence = await rankWithOpenRouter({
      query,
      messages: strictCandidates,
      apiKey: openrouterKey,
      model,
    });

    return res.status(200).json({
      channel: destChannel,
      nodes: intelligence.nodes || [],
      edges: intelligence.edges || [],
      messages: intelligence.messages || [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Search failed" });
  }
}

async function fetchChannelMessages({ destChannel, botToken, limit }) {
  const parsedName = destChannel.replace(/^@/, "");
  const isNumeric = /^-?\d+$/.test(parsedName);

  if (!isNumeric) {
    const scraped = await fetchViaPublicChannelScrape(parsedName, limit);
    if (scraped.length) return scraped;
  }

  if (botToken && isNumeric) {
    const viaBotUpdates = await fetchViaBotUpdates(botToken, Number(parsedName), limit);
    if (viaBotUpdates.length) return viaBotUpdates;
  }

  return [];
}

async function fetchViaPublicChannelScrape(channelName, limit) {
  const url = `https://t.me/s/${encodeURIComponent(channelName)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 IntelGraph/1.0" },
  });
  if (!response.ok) return [];

  const html = await response.text();
  const blockRegex = /<div[^>]*class="[^"]*tgme_widget_message_text[^"]*"[\s\S]*?<\/div>/g;
  const dateRegex = /time[^>]*datetime="([^"]+)"/i;
  const blocks = html.match(blockRegex) || [];

  const messages = [];
  for (let i = 0; i < blocks.length && messages.length < limit; i += 1) {
    const text = stripHtml(blocks[i]).trim();
    if (!text) continue;

    const idx = html.indexOf(blocks[i]);
    const windowStart = Math.max(0, idx - 800);
    const windowEnd = Math.min(html.length, idx + blocks[i].length + 800);
    const surrounding = html.slice(windowStart, windowEnd);
    const dateMatch = surrounding.match(dateRegex);
    messages.push({
      id: `scrape-${i + 1}`,
      date: dateMatch ? dateMatch[1] : "unknown",
      text,
      category: inferCategoryFromTags(text),
    });
  }

  return messages;
}

async function fetchViaBotUpdates(botToken, channelId, limit) {
  const url = `https://api.telegram.org/bot${botToken}/getUpdates?allowed_updates=%5B%22channel_post%22%5D&limit=100`;
  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  if (!data.ok || !Array.isArray(data.result)) return [];

  const rows = data.result
    .map((item) => item.channel_post)
    .filter(Boolean)
    .filter((post) => post.chat && Number(post.chat.id) === channelId)
    .map((post) => ({
      id: post.message_id,
      date: post.date ? new Date(post.date * 1000).toISOString() : "unknown",
      text: (post.text || post.caption || "").trim(),
      category: inferCategoryFromTags(post.text || post.caption || ""),
    }))
    .filter((entry) => entry.text.length > 0)
    .slice(-limit)
    .reverse();

  return rows;
}

function lexicalPrefilter(messages, query) {
  const tokens = new Set(
    query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 3)
  );

  if (!tokens.size) return messages;

  const scored = messages
    .map((message) => {
      const text = message.text.toLowerCase();
      let matches = 0;
      for (const token of tokens) {
        if (text.includes(token)) matches += 1;
      }
      return { ...message, _lexScore: matches / tokens.size };
    })
    .filter((message) => message._lexScore > 0);

  if (!scored.length) {
    return messages.slice(0, Math.min(20, messages.length));
  }

  return scored.sort((a, b) => b._lexScore - a._lexScore);
}

async function rankWithOpenRouter({ query, messages, apiKey, model }) {
  const compact = messages.map((item) => ({
    id: String(item.id),
    date: item.date,
    text: item.text.slice(0, 1600),
    category: item.category,
  }));

  const prompt = [
    "Analyze the user query and the candidate Telegram messages.",
    "Return only strictly and directly relevant results.",
    "If a message is only loosely related, exclude it.",
    "Output STRICT JSON only with schema:",
    '{"messages":[{"id":"","date":"","text":"","category":"","relevance":0}],"nodes":[{"id":"","label":"","type":"query|message|entity|keyword|category|location|date"}],"edges":[{"source":"","target":"","label":"mentions|about|has_keyword|entity|location|time"}]}.',
    "Rules:",
    "- relevance is 0-100",
    "- include max 12 messages",
    "- keep only direct relevance to query",
    "- always include a query node with id=query",
    "- message nodes should use id=msg_<message id>",
    `User query: ${query}`,
    `Candidate messages JSON: ${JSON.stringify(compact)}`,
  ].join("\n");

  const payload = {
    model,
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You are an intelligence retrieval analyst. You must reject weakly relevant items. Return strict JSON only.",
      },
      { role: "user", content: prompt },
    ],
  };

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error: ${text.slice(0, 400)}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content || "{}";
  const parsed = extractJsonObject(content);

  const messagesOut = Array.isArray(parsed.messages)
    ? parsed.messages
        .map((message) => ({
          id: String(message.id || ""),
          date: String(message.date || "unknown"),
          text: String(message.text || ""),
          category: String(message.category || "other"),
          relevance: clampNumber(message.relevance, 0, 100),
        }))
        .filter((message) => message.id && message.text)
        .sort((a, b) => b.relevance - a.relevance)
    : [];

  const nodes = normalizeNodes(parsed.nodes, query, messagesOut);
  const edges = normalizeEdges(parsed.edges, nodes);
  return { messages: messagesOut, nodes, edges };
}

function normalizeNodes(nodes, query, messagesOut) {
  const out = [];
  out.push({ id: "query", label: query, type: "query" });

  if (Array.isArray(nodes)) {
    for (const node of nodes) {
      const id = String(node.id || "").trim();
      const label = String(node.label || "").trim();
      const type = String(node.type || "keyword").trim().toLowerCase();
      if (!id || !label) continue;
      out.push({ id, label, type });
    }
  }

  for (const message of messagesOut) {
    const id = `msg_${message.id}`;
    if (!out.some((node) => node.id === id)) {
      out.push({ id, label: message.text.slice(0, 42), type: "message" });
    }
  }

  return dedupeBy(out, (node) => node.id);
}

function normalizeEdges(edges, nodes) {
  const validIds = new Set(nodes.map((node) => node.id));
  const out = [];
  if (!Array.isArray(edges)) return out;

  for (const edge of edges) {
    const source = String(edge.source || "").trim();
    const target = String(edge.target || "").trim();
    const label = String(edge.label || "relates").trim();
    if (!source || !target) continue;
    if (!validIds.has(source) || !validIds.has(target)) continue;
    out.push({ source, target, label });
  }

  return dedupeBy(out, (edge) => `${edge.source}->${edge.target}:${edge.label}`);
}

function extractJsonObject(text) {
  const trimmed = String(text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model returned no JSON");
    return JSON.parse(match[0]);
  }
}

function inferCategoryFromTags(text) {
  const lower = (text || "").toLowerCase();
  if (lower.includes("terror") || lower.includes("militant")) return "terrorism";
  if (lower.includes("cyber") || lower.includes("ransom")) return "cybersecurity";
  if (lower.includes("stock") || lower.includes("market")) return "stock_market";
  if (lower.includes("protest")) return "protest";
  if (lower.includes("military") || lower.includes("drone") || lower.includes("strike")) return "military";
  if (lower.includes("crime") || lower.includes("arrest")) return "crime";
  return "other";
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function dedupeBy(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function clampNumber(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}