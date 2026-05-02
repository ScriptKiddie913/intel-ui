# Vercel Environment Variables

**Copy these to Vercel Dashboard → Project Settings → Environment Variables:**

```
BOT_TOKEN=8687376275:AAFHDpQJQnFJ7tDCxNgGru8aPsgFR4avbJI
DEST_CHANNEL=-1003711244488
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
SOURCE_CHANNEL=-1003717431935
TELEGRAM_API_ID=33395168
TELEGRAM_API_HASH=3e74c03941a220d04bb8768a1f5585ae
TELEGRAM_SESSION=1BVtsOL4Bu6qus9koMJ4sSAkxEcuMAt2K2vHWV28AY5LLBNJrZfVx2IuMUsdH7qrnIaXeCNfQottOirR_Gn_FNLYEle9ZQ9UalcJQeOBHt868zVhgnG9vEdZHzHJuV68JJqSBzC81J9nTgePPIypdVlxNFB2ATDaoWuEBB6nIMy_rqwyaVf325YCqzbsOfVkvlgFFpwcXlXPhYqhk8X59eAzGqKLwJVlFw3nnkULc0v62FrVuXISWDMR39dNrusG6Reou4YlSpNwHOGCyXrZipb9n7NvSuvIdbpp5wX9LwbZBoJh-LFjp47UqYF0bM9LUuCn9aZHnuCRnLfXwQjqTdkOGVZ0xggA=
```

## Deployment Steps

1. **Git push** `web/` folder
2. **Vercel** → Import repo → **Root: `web/`**
3. **Settings** → **Environment Variables** → Paste above
4. **Deploy** ✅

**Security:** All sensitive keys are server-side only (no `NEXT_PUBLIC_` prefix).

