import type { FastifyInstance } from 'fastify';
import { createRng } from './rng.js';
import { generateQuestion } from './generator.js';
import { selectFromBank, getBankStats, getBankCount } from '../question-bank/selector.js';
import { getSession, updateSession } from '../session/routes.js';
import { db } from '../../db/index.js';
import { progress } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { SkillTag } from '@math-striker/shared';

// In-memory session history for anti-repetition
const sessionHistory: Record<string, { ids: string[]; tags: string[] }> = {};

export async function questionEngineRoutes(app: FastifyInstance) {
  app.post('/game/next-question', async (req, reply) => {
    const { userId, sessionId } = req.body as { userId: string; sessionId: string };

    const session = getSession(sessionId);
    if (!session) return reply.code(404).send({ error: 'Session not found' });

    // Get user progress
    const [prog] = await db.select().from(progress).where(eq(progress.userId, userId));
    const difficulty = prog?.currentDifficulty ?? 1;
    const skillModel = (prog?.skillModel ?? {}) as Record<string, number>;

    const weakSkills = Object.entries(skillModel)
      .filter(([, accuracy]) => accuracy < 0.6)
      .map(([skill]) => skill as SkillTag);

    // Session history
    if (!sessionHistory[sessionId]) {
      sessionHistory[sessionId] = { ids: [], tags: [] };
    }
    const history = sessionHistory[sessionId];

    // 1) Try DB-backed question bank
    let bankCount = 0;
    try { bankCount = await getBankCount(); } catch { /* table may not exist yet */ }

    if (bankCount > 0) {
      try {
        const bankQ = await selectFromBank({
          globalDifficulty: difficulty,
          weakSkills,
          recentIds: history.ids,
          recentSkillTags: history.tags,
        });

        if (bankQ) {
          // Track history
          history.ids.push(bankQ.id);
          if (history.ids.length > 100) history.ids.shift();
          history.tags.push(bankQ.skillTag);
          if (history.tags.length > 5) history.tags.shift();

          updateSession(sessionId, { questionIndex: session.questionIndex + 1 });

          return reply.send({
            id: bankQ.id,
            skillTag: bankQ.skillTag,
            difficulty: bankQ.globalDifficulty,
            prompt: bankQ.prompt,
            choices: bankQ.choices,
            correctAnswer: bankQ.correctAnswer,
            questionType: bankQ.questionType,
            visual: bankQ.visual,
            explanation: bankQ.explanation,
            source: { kind: 'bank', version: bankQ.version },
          });
        }
      } catch (err) {
        console.warn('[next-question] Bank query failed, using fallback:', (err as Error).message);
      }
    }

    // 2) Fallback: procedural generator
    const rng = createRng(session.seed + session.questionIndex);
    const question = generateQuestion({
      difficulty,
      index: session.questionIndex,
      rng,
      weakSkills,
    });

    updateSession(sessionId, { questionIndex: session.questionIndex + 1 });
    return reply.send({ ...question, source: { kind: 'procedural' } });
  });

  // Bank stats endpoint
  app.get('/question-bank/stats', async (_req, reply) => {
    try {
      const stats = await getBankStats();
      return reply.send({ ok: true, ...stats });
    } catch {
      return reply.send({ ok: false, total: 0, error: 'Bank not seeded yet' });
    }
  });
}
