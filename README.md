# Telegram Search Web Interface

## Vercel Deployment

1. Push the `web/` folder to GitHub
2. Vercel dashboard → Import repo  
3. **Root directory: `web/`**
4. **Environment Variables** (Settings → Environment Variables):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app/api
   NEXT_PUBLIC_BOT_URL=https://t.me/your_search_bot
   ```
5. Deploy!

## Environment Variables

| Name | Required | Description | Example |
|------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API endpoint | `https://your-api.vercel.app/api` |
| `NEXT_PUBLIC_BOT_URL` | ✅ | Telegram bot link | `https://t.me/search_bot` |
| `BOT_TOKEN` | 🔄 | Bot token (server-side) | `123456:ABC...` |
| `TELEGRAM_CHANNEL_ID` | 🔄 | Channel ID | `-1001234567890` |

**✅ Client-side** (`NEXT_PUBLIC_*`) - available in browser  
**🔄 Server-side** - for future API routes (if adding `/api/search`)

**.env.local** created with examples - customize before deploy.


## Local Development (Windows)

```cmd
cd web
npm install
npm run dev
```

## Project Structure

```
web/
├── app/
│   ├── layout.tsx      - Root layout
│   ├── page.tsx        - Home page
│   └── globals.css     - Global styles
├── package.json        - Dependencies
├── vercel.json         - Vercel config
├── tailwind.config.js  - Tailwind config
├── postcss.config.js   - PostCSS config
└── next.config.mjs     - Next.js config
```

## API Integration

Add API routes in `app/api/` to connect with your Telegram bot:

```
app/api/search/route.ts
app/api/stats/route.ts
```

## Environment Variables (Vercel)

```
NEXT_PUBLIC_BOT_URL=https://your-bot-url
BOT_TOKEN=your_token
```

Ready for Vercel deployment 🚀

