import os
import re
import asyncio
from collections import Counter
from typing import List

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates

from telethon import TelegramClient

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Environment configuration
API_ID = os.getenv("TELEGRAM_API_ID")
API_HASH = os.getenv("TELEGRAM_API_HASH")
DEST_CHANNEL = os.getenv("DEST_CHANNEL")  # channel username or id, e.g. "mychannel"

STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "have",
    "are",
    "was",
    "were",
    "they",
    "you",
    "your",
    "not",
}


def extract_keypoints(text: str, top_n: int = 5) -> List[str]:
    # collect explicit hashtags and quoted phrases first
    tags = []
    tags += re.findall(r"#(\w+)", text)
    tags += re.findall(r'"([^"]+)"', text)

    # basic tokenization and frequency (fallback)
    words = re.findall(r"\b[a-zA-Z0-9_-]{3,}\b", text.lower())
    words = [w for w in words if w not in STOPWORDS and not w.isdigit()]
    freq = Counter(words)
    for w, _ in freq.most_common(top_n):
        if w not in tags:
            tags.append(w)
    return tags[: max(top_n, 10)]


async def search_telegram(query: str, limit: int = 50):
    if not API_ID or not API_HASH or not DEST_CHANNEL:
        return {"error": "Missing TELEGRAM_API_ID, TELEGRAM_API_HASH or DEST_CHANNEL in environment"}

    try:
        api_id = int(API_ID)
    except Exception:
        return {"error": "TELEGRAM_API_ID must be an integer"}

    async with TelegramClient("web_session", api_id, API_HASH) as client:
        try:
            entity = await client.get_entity(DEST_CHANNEL)
        except Exception as e:
            return {"error": f"Failed to resolve DEST_CHANNEL: {e}"}

        # use Telethon search support
        try:
            messages = await client.get_messages(entity, limit=limit, search=query)
        except Exception:
            # some servers may not support search param; fallback to recent messages filter
            all_msgs = await client.get_messages(entity, limit=200)
            messages = [m for m in all_msgs if query.lower() in (m.message or "").lower()]

        results = []
        for m in messages:
            text = m.message or ""
            msg_id = m.id
            # build t.me link if channel has username
            try:
                username = getattr(entity, "username", None)
                if username:
                    link = f"https://t.me/{username}/{msg_id}"
                else:
                    link = None
            except Exception:
                link = None

            results.append({"id": msg_id, "text": text, "date": str(m.date), "link": link})

        return {"count": len(results), "messages": results}


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/query")
async def handle_query(payload: dict):
    q = payload.get("query", "")
    if not q:
        return JSONResponse({"error": "No query provided"}, status_code=400)

    keypoints = extract_keypoints(q)
    # build search query: join hashtags or words
    search_q = " ".join(keypoints) if keypoints else q

    telegram_res = await search_telegram(search_q)

    return {"query": q, "keypoints": keypoints, "search_query": search_q, "telegram": telegram_res}
