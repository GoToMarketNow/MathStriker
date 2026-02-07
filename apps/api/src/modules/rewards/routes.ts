import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { rewards, progress } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export const BADGE_CATALOG = [
  { id: 'multiplication_master', name: 'Multiplication Master', description: 'Master multiplication with 85%+ accuracy', iconKey: '✖️', skill: 'multiplication', threshold: 0.85 },
  { id: 'division_champ', name: 'Division Champion', description: 'Master division with 80%+ accuracy', iconKey: '➗', skill: 'division', threshold: 0.8 },
  { id: 'fraction_pro', name: 'Fraction Pro', description: 'Master fractions with 80%+ accuracy', iconKey: '📐', skill: 'fractions', threshold: 0.8 },
  { id: 'pattern_genius', name: 'Pattern Genius', description: 'Master patterns with 80%+ accuracy', iconKey: '🔢', skill: 'patterns', threshold: 0.8 },
  { id: 'word_problem_wizard', name: 'Word Problem Wizard', description: 'Master word problems with 80%+ accuracy', iconKey: '📝', skill: 'word_problems', threshold: 0.8 },
  { id: 'streak_5', name: 'On Fire', description: 'Get a 5-answer streak', iconKey: '🔥', skill: null, threshold: 5 },
  { id: 'streak_10', name: 'Unstoppable', description: 'Get a 10-answer streak', iconKey: '⚡', skill: null, threshold: 10 },
  { id: 'first_goal', name: 'First Goal', description: 'Score your first goal', iconKey: '⚽', skill: null, threshold: 1 },
  { id: 'century', name: 'Century', description: 'Reach 100 XP', iconKey: '💯', skill: null, threshold: 100 },
];

export async function rewardsRoutes(app: FastifyInstance) {
  // Get badge catalog
  app.get('/badges', async (_req, reply) => {
    return reply.send(BADGE_CATALOG);
  });

  // Get user rewards
  app.get('/rewards/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const userRewards = await db.select().from(rewards).where(eq(rewards.userId, userId));
    return reply.send(userRewards);
  });

  // Get full progress
  app.get('/progress/:userId/full', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const [prog] = await db.select().from(progress).where(eq(progress.userId, userId));
    const userRewards = await db.select().from(rewards).where(eq(rewards.userId, userId));

    if (!prog) return reply.code(404).send({ error: 'User not found' });

    const earnedBadgeIds = userRewards
      .filter((r) => r.type === 'badge')
      .map((r) => (r.payloadJson as any)?.badgeId);

    const badgesWithStatus = BADGE_CATALOG.map((b) => ({
      ...b,
      earned: earnedBadgeIds.includes(b.id),
    }));

    return reply.send({
      progress: prog,
      badges: badgesWithStatus,
      rewardHistory: userRewards,
    });
  });
}
