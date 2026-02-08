import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env.js';
import type { HealthResponse } from '@math-striker/shared';
import { identityRoutes } from './modules/identity/routes.js';
import { sessionRoutes } from './modules/session/routes.js';
import { questionEngineRoutes } from './modules/question-engine/routes.js';
import { skillEngineRoutes } from './modules/skill-engine/routes.js';
import { rewardsRoutes } from './modules/rewards/routes.js';
import { analyticsRoutes } from './modules/analytics/routes.js';
import { avatarRoutes } from './modules/avatar/routes.js';
import { autoMigrate } from './db/migrate.js';
import { autoSeed } from './db/auto-seed.js';

const app = Fastify({
  logger: { level: config.nodeEnv === 'development' ? 'info' : 'warn' },
});

// ─── Plugins ────────────────────────────────────────
const corsOrigins = config.corsOrigin === '*'
  ? true
  : config.corsOrigin.split(',').map((o) => o.trim());

await app.register(cors, {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
});

// ─── Health ─────────────────────────────────────────
app.get('/health', async (): Promise<HealthResponse> => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: config.version,
}));

// ─── Admin Endpoints ────────────────────────────────
app.all('/admin/seed', async (req, reply) => {
  const auth = (req.headers.authorization || '').replace('Bearer ', '');
  if (!config.adminSeedToken || auth !== config.adminSeedToken) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  try {
    const result = await autoSeed(true);
    return reply.send(result);
  } catch (err) {
    return reply.code(500).send({ error: String(err) });
  }
});

app.post('/admin/migrate', async (req, reply) => {
  const auth = (req.headers.authorization || '').replace('Bearer ', '');
  if (!config.adminSeedToken || auth !== config.adminSeedToken) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  try {
    await autoMigrate();
    return reply.send({ ok: true, message: 'Schema pushed' });
  } catch (err) {
    return reply.code(500).send({ error: String(err) });
  }
});

// ─── Module Routes ──────────────────────────────────
await app.register(identityRoutes);
await app.register(sessionRoutes);
await app.register(questionEngineRoutes);
await app.register(skillEngineRoutes);
await app.register(rewardsRoutes);
await app.register(analyticsRoutes);
await app.register(avatarRoutes);

// ─── Startup Lifecycle ──────────────────────────────
async function startup() {
  // 1. Push DB schema (safe — Drizzle push is additive)
  try {
    await autoMigrate();
    console.log('✅ Database schema synced');
  } catch (err) {
    console.error('⚠️ Schema push failed (may need manual db:push):', err);
  }

  // 2. Auto-seed question bank if empty
  try {
    const result = await autoSeed();
    if (result.seeded) {
      console.log(`✅ Question bank seeded: ${result.count} questions`);
    } else {
      console.log(`📚 Question bank already populated (${result.count} questions)`);
    }
  } catch (err) {
    console.error('⚠️ Auto-seed failed (use /admin/seed to retry):', err);
  }

  // 3. Start server
  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`⚽ Math Striker API v${config.version} running at http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startup();
