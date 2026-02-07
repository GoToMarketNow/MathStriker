import type { FastifyInstance } from 'fastify';
import crypto from 'crypto';

// In-memory session store for MVP. Phase 2: persist to DB/Redis
const sessions = new Map<string, {
  userId: string;
  seed: number;
  questionIndex: number;
  streak: number;
  score: number;
  coins: number;
  startedAt: string;
}>();

export function getSession(sessionId: string) {
  return sessions.get(sessionId);
}

export function updateSession(sessionId: string, updates: Record<string, unknown>) {
  const session = sessions.get(sessionId);
  if (session) {
    Object.assign(session, updates);
  }
}

export async function sessionRoutes(app: FastifyInstance) {
  app.post('/session/start', async (req, reply) => {
    const { userId } = req.body as { userId: string };
    const sessionId = crypto.randomUUID();
    const seed = Math.floor(Math.random() * 1_000_000);

    sessions.set(sessionId, {
      userId,
      seed,
      questionIndex: 0,
      streak: 0,
      score: 0,
      coins: 0,
      startedAt: new Date().toISOString(),
    });

    return reply.code(201).send({ sessionId, seed });
  });

  app.post('/session/end', async (req, reply) => {
    const { sessionId } = req.body as { sessionId: string };
    const session = sessions.get(sessionId);
    if (!session) return reply.code(404).send({ error: 'Session not found' });

    sessions.delete(sessionId);
    return reply.send({ ok: true, finalScore: session.score, finalCoins: session.coins });
  });
}
