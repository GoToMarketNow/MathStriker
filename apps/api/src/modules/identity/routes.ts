import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { users, profiles, progress } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { CreateUserRequestSchema } from '@math-striker/shared';

export async function identityRoutes(app: FastifyInstance) {
  // Create user + profile + progress in one transaction
  app.post('/users', async (req, reply) => {
    const body = CreateUserRequestSchema.parse(req.body);

    const [user] = await db.insert(users).values({}).returning();

    await db.insert(profiles).values({
      userId: user.id,
      displayName: body.displayName,
      age: body.age ?? null,
      avatarKey: body.avatarKey ?? null,
    });

    await db.insert(progress).values({
      userId: user.id,
      currentLeague: 'U8',
      xp: 0,
      coins: 0,
      streakCurrent: 0,
      streakBest: 0,
      skillModel: {},
      currentDifficulty: 1,
    });

    const profile = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    const prog = await db.select().from(progress).where(eq(progress.userId, user.id));

    return reply.code(201).send({
      id: user.id,
      displayName: profile[0].displayName,
      age: profile[0].age,
      avatarKey: profile[0].avatarKey,
      currentLeague: prog[0].currentLeague,
      xp: prog[0].xp,
      coins: prog[0].coins,
      streakBest: prog[0].streakBest,
      createdAt: user.createdAt.toISOString(),
    });
  });

  // Update profile
  app.post('/profile', async (req, reply) => {
    const { userId, displayName, avatarKey } = req.body as {
      userId: string;
      displayName?: string;
      avatarKey?: string;
    };

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (displayName) updates.displayName = displayName;
    if (avatarKey) updates.avatarKey = avatarKey;

    await db.update(profiles).set(updates).where(eq(profiles.userId, userId));
    return reply.send({ ok: true });
  });

  // Get progress
  app.get('/progress/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const [prof] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    const [prog] = await db.select().from(progress).where(eq(progress.userId, userId));

    if (!prof || !prog) return reply.code(404).send({ error: 'User not found' });

    return reply.send({
      id: userId,
      displayName: prof.displayName,
      age: prof.age,
      avatarKey: prof.avatarKey,
      currentLeague: prog.currentLeague,
      xp: prog.xp,
      coins: prog.coins,
      streakBest: prog.streakBest,
      streakCurrent: prog.streakCurrent,
      currentDifficulty: prog.currentDifficulty,
      skillModel: prog.skillModel,
    });
  });
}
