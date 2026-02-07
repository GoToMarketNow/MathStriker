# Math Striker — Deployment Architecture

## Stack Overview

| Component | Service | Plan | Why |
|-----------|---------|------|-----|
| **Web App** | Vercel | Free/Pro | Zero-config Vite+React deploys, automatic PR previews, global CDN |
| **API** | Render | Free/Starter | Docker-free Node deploys, auto-deploy from GitHub, free tier has 750h/mo |
| **Database** | Render Postgres | Free/Starter | Co-located with API (same region), managed backups, no extra provider |
| **Question Bank** | NDJSON in repo + DB seed | — | Versioned in git, seeded to DB on deploy via script |

### Architecture Diagram

```
┌─────────────┐     HTTPS      ┌───────────────────┐    TCP     ┌──────────────┐
│   Vercel     │ ──────────────→│   Render           │ ─────────→│  Render      │
│   (Web SPA)  │  API calls     │   (Fastify API)    │  SQL      │  Postgres    │
│   CDN edge   │                │   Node 20          │           │  pg16        │
└─────────────┘                └───────────────────┘           └──────────────┘
     ^                              │
     │ VITE_API_URL env             │ DATABASE_URL env
     │ = https://api.mathstriker... │ = postgres://...
```

## Environment Variables

### Web App (Vercel)

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://mathstriker-api.onrender.com` | API base URL (no trailing slash) |

### API (Render)

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/mathstriker` | Postgres connection string |
| `NODE_ENV` | `production` | Environment mode |
| `API_PORT` | `3001` | (Render sets PORT; we map it) |
| `API_HOST` | `0.0.0.0` | Bind to all interfaces |
| `ADMIN_SEED_TOKEN` | `random-secret-token` | Protects `/admin/seed` endpoint |
| `CORS_ORIGIN` | `https://mathstriker.vercel.app` | Allowed CORS origin(s), comma-separated |

### Local Development

| Variable | Default | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://mathstriker:mathstriker@localhost:5432/mathstriker` | docker-compose |
| `VITE_API_URL` | `/api` | Vite proxy in dev mode |

## Database Migrations

Using **Drizzle Kit `push`** for schema management (introspects TS schema and syncs to DB).

- **Local**: `pnpm db:push` (uses docker-compose Postgres)
- **Production**: Runs automatically on API startup via `db:push` in the start script
- **Manual**: `DATABASE_URL=... pnpm db:push`

## Question Bank Seeding

Three seeding methods (all idempotent — safe to re-run):

1. **Automatic on first deploy**: API startup checks if question_bank_items is empty, seeds if so
2. **Protected endpoint**: `POST /admin/seed` with `Authorization: Bearer <ADMIN_SEED_TOKEN>`
3. **CLI**: `DATABASE_URL=... pnpm --filter @math-striker/api run question-bank:seed`

Seed reads NDJSON from `packages/question-bank/v1/` and upserts into `question_bank_items` table.

## Deploy Flow

### On merge to `main`:
1. **Vercel** auto-deploys web app (configured via Vercel GitHub integration)
2. **Render** auto-deploys API (configured via render.yaml blueprint)
3. API startup runs `db:push` to sync schema
4. API startup auto-seeds question bank if DB is empty

### On PR:
1. **Vercel** creates preview deployment (automatic)
2. **GitHub Actions** runs lint + typecheck
3. **Render** can optionally deploy preview (manual trigger)

## Security

- No secrets in repo — all via env vars
- `.env` and `.env.local` in `.gitignore`
- CORS locked to specific origins in production
- `/admin/seed` requires Bearer token
- Render Postgres only accessible from Render internal network
- Drizzle push is append-only safe (won't drop columns/tables)

## Monitoring & Health

- `GET /health` — API liveness check (Render health check path)
- `GET /question-bank/stats` — Question bank count and distribution
- Render provides automatic restart on crash
- Vercel provides edge analytics

## Local Development Quick Start

```bash
# 1. Start Postgres
docker-compose up -d

# 2. Push schema
pnpm db:push

# 3. Seed questions
pnpm --filter @math-striker/api run question-bank:seed

# 4. Start dev servers
pnpm dev
# Web: http://localhost:5173
# API: http://localhost:3001
```
