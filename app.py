import os
import re
import asyncio
import logging
from collections import Counter
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates

from telethon import TelegramClient

app = FastAPI()
templates = Jinja2Templates(directory="templates")
logging.basicConfig(level=logging.INFO)

# Environment configuration
API_ID = os.getenv("TELEGRAM_API_ID")
API_HASH = os.getenv("TELEGRAM_API_HASH")
DEST_CHANNEL = os.getenv("DEST_CHANNEL")  # channel username or id, e.g. "mychannel"

# session directory for Telethon persistence
SESS_DIR = Path("sessions")
SESS_DIR.mkdir(exist_ok=True)

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

# spaCy optional
_spacy_nlp = None
try:
    import spacy

    try:
        _spacy_nlp = spacy.load("en_core_web_sm")
    except Exception:
        try:
            import spacy.cli

            spacy.cli.download("en_core_web_sm")
            _spacy_nlp = spacy.load("en_core_web_sm")
        except Exception:
            logging.warning("spaCy model en_core_web_sm not available; falling back to simple extractor")
except Exception:
    logging.info("spaCy not installed; using fallback extractor")


def extract_keypoints(text: str, top_n: int = 6) -> List[str]:
    tags = []
    tags += re.findall(r"#(\w+)", text)
    tags += re.findall(r'"([^"]+)"', text)

    if _spacy_nlp:
        doc = _spacy_nlp(text)
        # entities and noun chunks
        for ent in doc.ents:
            if ent.text.lower() not in tags:
                tags.append(ent.text)
        for nc in doc.noun_chunks:
            t = nc.text.strip()
            if t.lower() not in (x.lower() for x in tags) and len(t) > 2:
                tags.append(t)
    # fallback frequency-based
    words = re.findall(r"\b[a-zA-Z0-9_-]{3,}\b", text.lower())
    words = [w for w in words if w not in STOPWORDS and not w.isdigit()]
    freq = Counter(words)
    for w, _ in freq.most_common(top_n):
        if w not in tags:
            tags.append(w)

    # normalize tags to strings and limit
    out = []
    for t in tags:
        s = str(t).strip()
        if s and s.lower() not in (x.lower() for x in out):
            out.append(s)
    return out[: max(top_n, 10)]


async def search_telegram(query: str, limit: int = 50, offset_id: Optional[int] = None):
    if not API_ID or not API_HASH or not DEST_CHANNEL:
        return {"error": "Missing TELEGRAM_API_ID, TELEGRAM_API_HASH or DEST_CHANNEL in environment"}

    try:
        api_id = int(API_ID)
    except Exception:
        return {"error": "TELEGRAM_API_ID must be an integer"}

    session_file = str(SESS_DIR / f"session_{api_id}")

    async with TelegramClient(session_file, api_id, API_HASH) as client:
        try:
            entity = await client.get_entity(DEST_CHANNEL)
        except Exception as e:
            return {"error": f"Failed to resolve DEST_CHANNEL: {e}"}

        # use Telethon search support; support offset-based pagination
        try:
            if offset_id:
                messages = await client.get_messages(entity, limit=limit, offset_id=offset_id, search=query)
            else:
                messages = await client.get_messages(entity, limit=limit, search=query)
        except Exception:
            all_msgs = await client.get_messages(entity, limit=500)
            messages = [m for m in all_msgs if query.lower() in (m.message or "").lower()]

        results = []
        for m in messages:
            text = m.message or ""
            msg_id = m.id
            try:
                username = getattr(entity, "username", None)
                if username:
                    link = f"https://t.me/{username}/{msg_id}"
                else:
                    link = None
            except Exception:
                link = None

            results.append({"id": msg_id, "text": text, "date": str(m.date), "link": link})

        # next_offset_id for pagination: use last message id - 1 to fetch older
        next_offset = None
        if results:
            next_offset = results[-1]["id"] - 1

        return {"count": len(results), "messages": results, "next_offset_id": next_offset}


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/query")
async def handle_query(payload: dict):
    q = payload.get("query", "")
    if not q:
        return JSONResponse({"error": "No query provided"}, status_code=400)

    limit = int(payload.get("limit", 50))
    offset_id = payload.get("offset_id")

    keypoints = extract_keypoints(q)
    search_q = " ".join(keypoints) if keypoints else q

    telegram_res = await search_telegram(search_q, limit=limit, offset_id=offset_id)

    return {"query": q, "keypoints": keypoints, "search_query": search_q, "telegram": telegram_res}
