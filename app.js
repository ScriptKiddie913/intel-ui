const form = document.getElementById("search-form");
const input = document.getElementById("query-input");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const graphRoot = document.getElementById("graph-root");
const searchBtn = document.getElementById("search-btn");

initParticles();
initMagneticButton(searchBtn);
enableTilt(document.querySelectorAll(".tilt-card"));

renderEmpty();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  setStatus("Analyzing channel messages with OpenRouter...");
  searchBtn.disabled = true;

  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: 120 }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Search failed");
    }

    const nodes = payload.nodes || [];
    const edges = payload.edges || [];
    const messages = payload.messages || [];

    setStatus(
      `Done. ${messages.length} directly relevant messages from ${payload.channel || "DEST_CHANNEL"}.`
    );
    renderGraph(nodes, edges);
    renderResults(messages);
  } catch (error) {
    setStatus(`Error: ${error.message}`);
    renderGraph([], []);
    renderResults([]);
  } finally {
    searchBtn.disabled = false;
  }
});

function setStatus(text) {
  statusEl.textContent = text;
}

function renderEmpty() {
  resultsEl.innerHTML = '<div class="empty-note">Run a query to see directly relevant nodes and matched messages.</div>';
  renderGraph([], []);
}

function renderResults(messages) {
  if (!messages.length) {
    resultsEl.innerHTML = '<div class="empty-note">No direct matches found for this query.</div>';
    return;
  }

  resultsEl.innerHTML = messages
    .map((message) => {
      const score = Number.isFinite(message.relevance) ? `${Math.round(message.relevance)}%` : "n/a";
      const date = message.date || "unknown";
      const category = message.category || "other";
      const text = escapeHtml(message.text || "");
      return `
      <article class="result-card tilt-card" data-tilt="true">
        <div class="result-meta">
          <span class="pill">Relevance ${score}</span>
          <span>${date}</span>
          <span class="pill">${escapeHtml(category)}</span>
        </div>
        <div class="result-text">${text}</div>
      </article>`;
    })
    .join("");

  enableTilt(document.querySelectorAll('[data-tilt="true"]'));
}

function renderGraph(nodes, edges) {
  graphRoot.innerHTML = "";
  const width = graphRoot.clientWidth;
  const height = graphRoot.clientHeight;

  const svg = d3
    .select(graphRoot)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  if (!nodes.length) {
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("fill", "#9ec3b7")
      .attr("text-anchor", "middle")
      .attr("font-size", "14")
      .text("No nodes yet");
    return;
  }

  const color = d3
    .scaleOrdinal()
    .domain(["query", "message", "entity", "keyword", "category", "location", "date"])
    .range(["#ffb347", "#5de2c4", "#8bb9ff", "#f0d36a", "#ff8173", "#b4e48f", "#d8a8ff"]);

  const simulation = d3
    .forceSimulation(nodes)
    .force("link", d3.forceLink(edges).id((d) => d.id).distance(80).strength(0.45))
    .force("charge", d3.forceManyBody().strength(-220))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius((d) => (d.type === "message" ? 20 : 16)));

  const link = svg
    .append("g")
    .attr("stroke", "rgba(158, 195, 183, 0.34)")
    .attr("stroke-width", 1.2)
    .selectAll("line")
    .data(edges)
    .join("line");

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d) => (d.type === "query" ? 18 : d.type === "message" ? 11 : 8))
    .attr("fill", (d) => color(d.type || "keyword"))
    .attr("stroke", "rgba(255,255,255,0.6)")
    .attr("stroke-width", 0.8)
    .call(drag(simulation));

  node.append("title").text((d) => `${d.label}\nType: ${d.type}`);

  const labels = svg
    .append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text((d) => (d.label.length > 30 ? `${d.label.slice(0, 30)}...` : d.label))
    .attr("fill", "#d7ebe3")
    .attr("font-size", (d) => (d.type === "query" ? 12 : 10))
    .attr("font-family", "IBM Plex Mono")
    .attr("pointer-events", "none");

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    labels.attr("x", (d) => d.x + 10).attr("y", (d) => d.y + 3);
  });
}

function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
}

function initParticles() {
  const canvas = document.getElementById("particle-bg");
  const ctx = canvas.getContext("2d");
  const particles = [];
  const COUNT = 70;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawn() {
    particles.length = 0;
    for (let i = 0; i < COUNT; i += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.8 + 0.5,
      });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = "rgba(168, 252, 230, 0.33)";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  resize();
  spawn();
  frame();
  window.addEventListener("resize", () => {
    resize();
    spawn();
  });
}

function initMagneticButton(button) {
  if (!button) return;
  const force = 24;

  button.addEventListener("mousemove", (event) => {
    const rect = button.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    const tx = (dx / rect.width) * force;
    const ty = (dy / rect.height) * force;
    button.style.transform = `translate(${tx}px, ${ty}px)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translate(0px, 0px)";
  });
}

function enableTilt(elements) {
  elements.forEach((el) => {
    if (el.dataset.tiltBound === "1") return;
    el.dataset.tiltBound = "1";

    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
      const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 9;
      el.style.transform = `perspective(650px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "perspective(650px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}