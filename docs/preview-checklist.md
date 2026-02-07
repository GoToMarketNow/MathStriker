# Math Striker — Deploy Preview Checklist

## Prerequisites
- GitHub repo: `GoToMarketNow/MathStriker`
- [Vercel account](https://vercel.com) (free tier works)
- [Render account](https://render.com) (free tier works)

---

## Step 1: Deploy Database + API on Render

### 1a. Create Blueprint
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New" → "Blueprint"**
3. Connect your GitHub repo `GoToMarketNow/MathStriker`
4. Render auto-detects `render.yaml` and creates:
   - `mathstriker-api` (Web Service)
   - `mathstriker-db` (PostgreSQL)
5. Click **"Apply"**
6. Wait ~3-5 min for first deploy

### 1b. Verify API
```bash
# Replace with your actual Render URL
curl https://mathstriker-api.onrender.com/health
# Should return: {"status":"ok","timestamp":"...","version":"0.2.0"}

curl https://mathstriker-api.onrender.com/question-bank/stats
# Should return: {"total":904,"byDomain":{...},"byDifficulty":{...}}
```

### 1c. Note Your URLs
- **API URL**: `https://mathstriker-api.onrender.com` (or whatever Render assigns)
- **ADMIN_SEED_TOKEN**: Find it in Render → mathstriker-api → Environment (auto-generated)

---

## Step 2: Deploy Web App on Vercel

### 2a. Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New" → "Project"**
3. Import `GoToMarketNow/MathStriker`
4. Vercel auto-detects `vercel.json`

### 2b. Set Environment Variable
- **Variable**: `VITE_API_URL`
- **Value**: `https://mathstriker-api.onrender.com` (your Render API URL from Step 1c)

### 2c. Deploy
1. Click **"Deploy"**
2. Wait ~2-3 min for build
3. Note your Vercel URL (e.g., `https://mathstriker.vercel.app`)

### 2d. Update Render CORS
1. Go to Render → mathstriker-api → Environment
2. Update `CORS_ORIGIN` to your Vercel URL: `https://mathstriker.vercel.app`
3. Click Save → Render auto-redeploys

---

## Step 3: Verify End-to-End

1. Open your Vercel URL on a mobile device (or Chrome DevTools mobile view)
2. Walk through the flow:
   - Welcome screen → Enter name → Continue
   - Avatar builder → Customize → Save
   - Assessment intro → Take assessment
   - Game loop → Answer questions → Soccer shots
   - Check Locker (if navigation exists)

---

## Step 4 (Optional): Reseed Question Bank

If you regenerate questions and need to reseed:

```bash
# Via protected endpoint
curl -X POST https://mathstriker-api.onrender.com/admin/seed \
  -H "Authorization: Bearer YOUR_ADMIN_SEED_TOKEN"

# Or via CLI (with your Render DATABASE_URL)
DATABASE_URL="postgresql://..." pnpm --filter @math-striker/api run question-bank:seed
```

---

## Troubleshooting

### API returns CORS error
- **Cause**: `CORS_ORIGIN` doesn't match the Vercel URL
- **Fix**: Update `CORS_ORIGIN` in Render environment to include your Vercel URL
- **Note**: Use full URL with protocol: `https://mathstriker.vercel.app`

### API health check fails on Render
- **Cause**: Build failed or wrong start command
- **Check**: Render → mathstriker-api → Logs
- **Common fix**: Ensure `pnpm install` completes (check if `pnpm-lock.yaml` is committed)

### Database connection refused
- **Cause**: `DATABASE_URL` not set or wrong format
- **Fix**: Render should auto-link via `render.yaml`. Check Environment tab.
- **Note**: Render Postgres has `?sslmode=require` auto-appended

### Question bank not seeded (0 questions)
- **Cause**: Auto-seed failed on startup (check Render logs for warnings)
- **Fix**: Call `POST /admin/seed` with your token
- **Check**: `GET /question-bank/stats` should show `"total":904`

### Vercel build fails
- **Cause**: Missing `pnpm-lock.yaml` or shared package build failure
- **Fix**: Ensure `pnpm-lock.yaml` is committed. Run `pnpm install` locally first.
- **Check**: Vercel → Deployments → Build Logs

### "Cannot find module @math-striker/shared"
- **Cause**: Shared package wasn't built before API/web build
- **Fix**: The build commands in `render.yaml` and `vercel.json` build shared first
- **Note**: Order matters: shared → api/web

### Render free tier spins down
- **Info**: Free tier services spin down after 15 min of inactivity
- **Effect**: First request after idle takes ~30 seconds (cold start)
- **Fix**: Upgrade to Starter ($7/mo) for always-on, or accept cold starts for preview

### Can't access /admin/seed
- **Cause**: Missing or wrong `ADMIN_SEED_TOKEN`
- **Fix**: Check Render → Environment → `ADMIN_SEED_TOKEN` value
- **Note**: Include `Bearer` prefix: `Authorization: Bearer your-token`

---

## Architecture Quick Reference

```
Vercel (Web SPA)          Render (API + DB)
├── React + Vite          ├── Fastify (Node 20)
├── Tailwind CSS          ├── Drizzle ORM
├── VITE_API_URL →────────┤── PostgreSQL 16
└── CDN edge delivery     └── Auto-seed on startup
```

## Useful Commands

```bash
# Local development
docker-compose up -d          # Start local Postgres
pnpm install                  # Install deps
pnpm db:push                  # Sync schema
pnpm --filter @math-striker/api run question-bank:seed  # Seed questions
pnpm dev                      # Start both apps

# Production seed
curl -X POST $API_URL/admin/seed -H "Authorization: Bearer $TOKEN"

# Check deployment health
curl $API_URL/health
curl $API_URL/question-bank/stats
```
