# Intel Graph Web

This folder is a Vercel-ready web app with:

- Search bar UI
- Particle background
- Magnetic action button
- Tilt cards for results
- Node graph visualization (D3 force graph)
- API route that fetches Telegram channel messages and uses OpenRouter for strict relevance filtering

## Required Vercel Environment Variables

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `DEST_CHANNEL`
- `BOT_TOKEN` (required when `DEST_CHANNEL` is a numeric ID; optional for public username channels)

## Notes on Message Source

- If `DEST_CHANNEL` is a public username, API tries `https://t.me/s/<channel>` scraping.
- If `DEST_CHANNEL` is numeric and `BOT_TOKEN` is set, API uses Telegram Bot API `getUpdates` and filters channel posts by `chat.id`.

## Local Run

```bash
cd web
npm install
npx vercel dev
```

Then open the local URL shown by Vercel.

## Deploy

```bash
cd web
npx vercel --prod
```