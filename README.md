# ⚽ Math Striker

A mobile-first adaptive math & soccer learning game for Grades 2–4. Players answer math problems to earn soccer shots, unlock leagues, collect badges, and progress through a full soccer season.

## Architecture Overview

```
math-striker/
├── apps/
│   ├── api/                        # Fastify + TypeScript backend
│   │   └── src/
│   │       ├── config/env.ts       # Environment config
│   │       ├── db/
│   │       │   ├── schema.ts       # Drizzle ORM (users, profiles, progress, attempts, rewards, assessments)
│   │       │   └── index.ts        # DB connection
│   │       ├── modules/
│   │       │   ├── identity/       # POST /users, POST /profile, GET /progress/:userId
│   │       │   ├── session/        # POST /session/start, POST /session/end
│   │       │   ├── question-engine/ # POST /game/next-question + generator + seeded RNG
│   │       │   ├── skill-engine/   # POST /assessment/start, /answer, /game/submit-answer
│   │       │   ├── rewards/        # GET /badges, GET /rewards/:userId
│   │       │   ├── analytics/      # GET /parent/:userId/stats, POST /parent/:userId/reset
│   │       │   └── ai-orchestrator/ # (Phase 2: LLM coach, question flavor)
│   │       └── server.ts           # Fastify entry point
│   └── web/                        # React + Vite + Tailwind frontend
│       └── src/
│           ├── design-system/
│           │   ├── tokens/         # Colors, leagues, motion, sizing
│           │   └── components/     # 12 components: AppBarHUD, QuestionCard, AnswerTile, etc.
│           ├── screens/            # 11 screens: Welcome → Setup → Assessment → Game → Soccer → Progress → Parent
│           ├── store/gameStore.ts  # Zustand state management
│           └── lib/api.ts          # Typed fetch client
├── packages/
│   └── shared/                     # Zod schemas + TypeScript types (Question, Answer, Reward, etc.)
├── docker-compose.yml              # Postgres + Redis
└── pnpm-workspace.yaml
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Docker** (for Postgres + Redis)

## Quick Start

```bash
# 1. Clone and install
git clone <repo> && cd math-striker
pnpm install

# 2. Environment
cp .env.example .env

# 3. Start databases
docker compose up -d

# 4. Build shared types
pnpm build:shared

# 5. Push DB schema
pnpm db:push

# 6. Start dev servers
pnpm dev
```

Web: **http://localhost:5173** | API: **http://localhost:3001**

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + API in parallel |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm db:push` | Push schema to Postgres |
| `pnpm db:studio` | Open Drizzle Studio |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/users` | Create user + profile + progress |
| POST | `/profile` | Update profile |
| GET | `/progress/:userId` | Get user progress |
| POST | `/session/start` | Start game session (returns seed) |
| POST | `/session/end` | End session |
| POST | `/assessment/start` | Begin skill assessment |
| POST | `/assessment/answer` | Submit assessment answer |
| POST | `/game/next-question` | Get next question (adaptive) |
| POST | `/game/submit-answer` | Submit answer (returns rewards, shot params) |
| GET | `/badges` | Badge catalog |
| GET | `/rewards/:userId` | User's earned rewards |
| GET | `/parent/:userId/stats` | Parent dashboard stats |
| POST | `/parent/:userId/reset` | Reset assessment |

## Data Models

**Users** → **Profiles** (1:1) → **Progress** (1:1, league/xp/coins/skillModel)
**Attempts** (per-question results) → feeds adaptive difficulty
**Assessments** (initial placement) → determines starting league
**Rewards** (badges, league promotions, skins)

## How Adaptive Difficulty Works

1. **Assessment** (15 questions): scores accuracy + speed → maps to league (U8–College) and difficulty (1–6)
2. **Rolling window**: tracks last 20 attempts
3. **Every 5 questions**: ≥85% → difficulty +1, <60% → difficulty -1, else stable
4. **Skill model**: exponential moving average per skill, biases questions toward weak skills 40% of the time
5. **League promotion**: checks XP + average mastery thresholds

## How Soccer Shot System Works

- Every correct answer triggers a shot attempt
- **Power** = base 50 + difficulty bonus + streak bonus
- **Accuracy** = base 60 + speed bonus + streak bonus
- **Keeper level** = scales with player difficulty
- Outcomes: Goal (most likely), Saved, Post, Miss
- Goals award bonus coins

## Design System

12 components: AppBarHUD, PrimaryButton (4 variants × 4 states), AnswerTile (5 states), QuestionCard, LeagueBadge (6 leagues), ScoreCounter, StreakMeter (compact/expanded), FeedbackToast, RewardModal, ProgressTimeline, VisualMathRenderer (fractions/patterns/arrays), ScreenContainer

Visit `/design` to see the full gallery with interactive demos.

## How to Add New Question Templates

1. Open `apps/api/src/modules/question-engine/generator.ts`
2. Add a new generator function following the pattern of `genMultiplication`
3. Register it in the `generators` record
4. Add the skill tag to `packages/shared/src/schemas.ts` → `SkillTagEnum`

## Deployment

**Web:** Vercel (`apps/web` → framework: Vite, build: `pnpm build`, output: `dist`)
**API:** Render/Fly (`apps/api` → build: `pnpm build`, start: `node dist/server.js`)
**DB:** Managed Postgres (Neon, Supabase, or Railway)
**Redis:** Upstash (optional for MVP)

### Environment Variables for Production

```
DATABASE_URL=postgresql://...
API_PORT=3001
VITE_API_URL=https://your-api.onrender.com
NODE_ENV=production
```

## Implementation Checklist

- [x] Sprint 0: Monorepo scaffold, Docker, shared types
- [x] Sprint 1: Design system (12 components, tokens, gallery)
- [x] Sprint 2: Domain models, DB schema, API contracts, typed client
- [x] Sprint 3: Math question engine (5 skills, 6 difficulty tiers, seeded RNG)
- [x] Sprint 4: Adaptive difficulty (assessment, rolling window, skill model, league promotion)
- [x] Sprint 5: Full gameplay flow UI (Welcome → Setup → Assessment → Game Loop)
- [x] Sprint 6: Soccer shot mini-game (power/accuracy/keeper, 4 outcomes)
- [x] Sprint 7: Rewards, badges, league promotions, progress screen
- [x] Sprint 8: Parent gate, settings, accessibility toggles, analytics endpoint
- [x] Sprint 9: Production README, docs, deployment guide

## Troubleshooting

**`pnpm dev` fails with shared package errors** → Run `pnpm build:shared` first
**DB connection refused** → Ensure `docker compose up -d` is running
**Types out of sync** → Run `pnpm typecheck` to find mismatches
**Questions repeat** → Check session seed is unique per session start

## Future Extensions (Phase 2+)

- AI Coach (LLM-powered hints & encouragement)
- Question flavor text (LLM-generated soccer-themed word problems)
- Multiplayer co-play mode
- Voice math challenges
- Offline math pack mode
- Piano + math rhythm mode

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, Framer Motion, Zustand, React Router
**Backend:** Fastify, TypeScript, Drizzle ORM, PostgreSQL, Zod
**Shared:** Zod schemas + TypeScript types
**Infra:** Docker Compose, pnpm workspaces


