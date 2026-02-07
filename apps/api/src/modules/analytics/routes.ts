import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { attempts, progress, profiles, assessments } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/parent/:userId/stats', async (req, reply) => {
    const { userId } = req.params as { userId: string };

    const [prof] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    const [prog] = await db.select().from(progress).where(eq(progress.userId, userId));

    if (!prof || !prog) return reply.code(404).send({ error: 'User not found' });

    // Last 20 attempts
    const recent = await db
      .select()
      .from(attempts)
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.createdAt))
      .limit(20);

    const totalAttempts = recent.length;
    const correctCount = recent.filter((a) => a.correct).length;
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    // Per-skill breakdown from recent
    const bySkill: Record<string, { correct: number; total: number }> = {};
    for (const a of recent) {
      if (!bySkill[a.skillTag]) bySkill[a.skillTag] = { correct: 0, total: 0 };
      bySkill[a.skillTag].total++;
      if (a.correct) bySkill[a.skillTag].correct++;
    }

    const skillBreakdown = Object.entries(bySkill).map(([skill, data]) => ({
      skill,
      accuracy: Math.round((data.correct / data.total) * 100),
      attempts: data.total,
    }));

    return reply.send({
      displayName: prof.displayName,
      currentLeague: prog.currentLeague,
      xp: prog.xp,
      coins: prog.coins,
      streakBest: prog.streakBest,
      currentDifficulty: prog.currentDifficulty,
      recentAccuracy: accuracy,
      recentAttempts: totalAttempts,
      skillBreakdown,
    });
  });

  // Reset assessment
  app.post('/parent/:userId/reset', async (req, reply) => {
    const { userId } = req.params as { userId: string };

    await db
      .update(progress)
      .set({
        currentLeague: 'U8',
        xp: 0,
        coins: 0,
        streakCurrent: 0,
        streakBest: 0,
        currentDifficulty: 1,
        skillModel: {},
        updatedAt: new Date(),
      })
      .where(eq(progress.userId, userId));

    return reply.send({ ok: true });
  });
}
