import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { avatars, catalogItems, inventory, equipped } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { CATALOG_SEED } from '../catalog/seed.js';

// ─── Profanity filter (simple blocklist) ────────────
const BLOCKED_WORDS = ['damn', 'hell', 'crap', 'stupid', 'idiot', 'hate', 'kill', 'die', 'butt', 'poop'];
function isCleanName(name: string): boolean {
  const lower = name.toLowerCase();
  return !BLOCKED_WORDS.some((w) => lower.includes(w));
}

// ─── Team name generator ────────────────────────────
const ADJECTIVES = ['Mighty', 'Swift', 'Golden', 'Thunder', 'Royal', 'Brave', 'Blazing', 'Storm', 'Steel', 'Rising'];
const ANIMALS = ['Lions', 'Eagles', 'Wolves', 'Panthers', 'Falcons', 'Sharks', 'Dragons', 'Hawks', 'Tigers', 'Vipers'];
function generateTeamName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}

export async function avatarRoutes(app: FastifyInstance) {
  // ─── Get Avatar ───────────────────────────────────
  app.get('/avatar/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const [avatar] = await db.select().from(avatars).where(eq(avatars.userId, userId));
    if (!avatar) return reply.code(404).send({ error: 'Avatar not found' });
    return reply.send(avatar);
  });

  // ─── Create / Update Avatar ───────────────────────
  app.post('/avatar/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const body = req.body as Record<string, unknown>;

    // Validate team name
    if (body.teamName && !isCleanName(body.teamName as string)) {
      return reply.code(400).send({ error: 'Team name contains inappropriate language.' });
    }

    const [existing] = await db.select().from(avatars).where(eq(avatars.userId, userId));

    if (existing) {
      await db.update(avatars).set({ ...body, updatedAt: new Date() }).where(eq(avatars.userId, userId));
    } else {
      await db.insert(avatars).values({ userId, ...body } as any);
      // Grant starter items
      const starters = CATALOG_SEED.filter((i) => i.isStarter);
      for (const item of starters) {
        await db.insert(inventory).values({ userId, itemId: item.id, source: 'starter' }).onConflictDoNothing();
      }
      // Initialize equipped
      const starterEquip: Record<string, string> = {};
      for (const item of starters) {
        starterEquip[item.category] = item.id;
      }
      await db.insert(equipped).values({ userId, equippedByCategory: starterEquip, activeSkills: [] }).onConflictDoNothing();
    }

    const [updated] = await db.select().from(avatars).where(eq(avatars.userId, userId));
    return reply.send(updated);
  });

  // ─── Generate team name ───────────────────────────
  app.get('/avatar/team-name/generate', async (_req, reply) => {
    return reply.send({ teamName: generateTeamName() });
  });

  // ─── Catalog ──────────────────────────────────────
  app.get('/catalog', async (_req, reply) => {
    const items = await db.select().from(catalogItems);
    if (items.length === 0) {
      // Auto-seed if empty
      for (const item of CATALOG_SEED) {
        await db.insert(catalogItems).values(item).onConflictDoNothing();
      }
      const seeded = await db.select().from(catalogItems);
      return reply.send(seeded);
    }
    return reply.send(items);
  });

  // ─── Inventory ────────────────────────────────────
  app.get('/inventory/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const items = await db.select().from(inventory).where(eq(inventory.userId, userId));

    // Join with catalog
    const allCatalog = await db.select().from(catalogItems);
    const catalogMap = new Map(allCatalog.map((c) => [c.id, c]));

    const enriched = items.map((inv) => ({
      ...inv,
      item: catalogMap.get(inv.itemId) || null,
    }));

    return reply.send(enriched);
  });

  // ─── Equip ────────────────────────────────────────
  app.post('/equip/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const { itemId, category, isSkill } = req.body as {
      itemId: string;
      category?: string;
      isSkill?: boolean;
    };

    // Verify ownership
    const [owned] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.userId, userId), eq(inventory.itemId, itemId)));

    if (!owned) return reply.code(403).send({ error: 'Item not owned' });

    const [current] = await db.select().from(equipped).where(eq(equipped.userId, userId));

    if (!current) {
      await db.insert(equipped).values({
        userId,
        equippedByCategory: category ? { [category]: itemId } : {},
        activeSkills: isSkill ? [itemId] : [],
      });
    } else {
      if (isSkill) {
        const skills = (current.activeSkills as string[]) || [];
        const newSkills = skills.includes(itemId)
          ? skills.filter((s) => s !== itemId) // toggle off
          : [...skills.slice(-2), itemId]; // max 3: keep last 2 + new
        await db.update(equipped).set({ activeSkills: newSkills, updatedAt: new Date() }).where(eq(equipped.userId, userId));
      } else if (category) {
        const cats = (current.equippedByCategory as Record<string, string>) || {};
        cats[category] = itemId;
        await db.update(equipped).set({ equippedByCategory: cats, updatedAt: new Date() }).where(eq(equipped.userId, userId));
      }
    }

    const [updated] = await db.select().from(equipped).where(eq(equipped.userId, userId));
    return reply.send(updated);
  });

  // ─── Get Equipped ─────────────────────────────────
  app.get('/equipped/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const [equip] = await db.select().from(equipped).where(eq(equipped.userId, userId));
    if (!equip) return reply.send({ equippedByCategory: {}, activeSkills: [] });
    return reply.send(equip);
  });

  // ─── Unlock Item (internal - called by rewards engine) ──
  app.post('/unlock/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const { itemId, source } = req.body as { itemId: string; source: string };

    // Check not already owned
    const [existing] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.userId, userId), eq(inventory.itemId, itemId)));

    if (existing) return reply.send({ alreadyOwned: true });

    await db.insert(inventory).values({ userId, itemId, source });

    const [item] = await db.select().from(catalogItems).where(eq(catalogItems.id, itemId));

    return reply.send({
      unlocked: true,
      item,
      rewardEvent: {
        type: 'cosmetic',
        itemId: item?.id,
        itemName: item?.name,
        category: item?.category,
        rarity: item?.rarity,
        assetKey: item?.assetKey,
      },
    });
  });
}
