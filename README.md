# Tactical Telegram Search (web)

Light FastAPI web UI that accepts user queries, extracts keypoints, and searches a configured Telegram channel for matching messages.

Setup

1. Create a Python virtualenv and install requirements:

```bash
python -m venv .venv
source .venv/bin/activate    # or .venv\Scripts\activate on Windows
pip install -r web/requirements.txt
```

2. Environment variables required:

- `TELEGRAM_API_ID` (integer from my.telegram.org)
- `TELEGRAM_API_HASH` (string from my.telegram.org)
- `DEST_CHANNEL` (channel username or ID to search, e.g. `mychannel`)

4. Optional: spaCy model

If you added `spacy` to `requirements.txt`, you should download the English model:

```bash
python -m spacy download en_core_web_sm
```

The app will attempt to download and load the model at startup if it's missing, but it's recommended to pre-install it.

5. Sessions and persistence

The app stores Telethon session files under `web/sessions/` so the authenticated session persists between restarts. Ensure the Render service (or host) can persist files or use a persistent volume.

6. Render

There is a sample Render manifest at `web/render.yaml`. Add your secret values for `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, and `DEST_CHANNEL` in the Render dashboard or replace the placeholders in the file before deploying.

3. Run locally:

```bash
uvicorn web.app:app --host 0.0.0.0 --port 8000
```

Notes

- The app uses `Telethon` and requires a valid Telegram API ID and hash.
- The configured `DEST_CHANNEL` must be accessible to the account used by Telethon (public username or a channel the account can read).
- For deployment to Render, provide the env vars in the Render dashboard and use the above start command.
