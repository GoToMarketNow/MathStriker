import { pgTable, uuid, text, integer, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';

// ─── Users ──────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Profiles ───────────────────────────────────────
export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  displayName: text('display_name').notNull(),
  age: integer('age'),
  avatarKey: text('avatar_key'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Progress ───────────────────────────────────────
export const progress = pgTable('progress', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  currentLeague: text('current_league').notNull().default('U8'),
  xp: integer('xp').notNull().default(0),
  coins: integer('coins').notNull().default(0),
  streakCurrent: integer('streak_current').notNull().default(0),
  streakBest: integer('streak_best').notNull().default(0),
  skillModel: jsonb('skill_model').$type<Record<string, number>>().default({}),
  currentDifficulty: integer('current_difficulty').notNull().default(1),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Assessments ────────────────────────────────────
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  resultsJson: jsonb('results_json'),
});

// ─── Attempts ───────────────────────────────────────
export const attempts = pgTable(
  'attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    questionId: text('question_id').notNull(),
    correct: boolean('correct').notNull(),
    responseTimeMs: integer('response_time_ms').notNull(),
    skillTag: text('skill_tag').notNull(),
    difficulty: integer('difficulty').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('attempts_user_idx').on(table.userId),
    skillIdx: index('attempts_skill_idx').on(table.userId, table.skillTag),
  }),
);

// ─── Rewards ────────────────────────────────────────
export const rewards = pgTable(
  'rewards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: text('type').notNull(), // badge | league | skin | coins
    payloadJson: jsonb('payload_json'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('rewards_user_idx').on(table.userId),
  }),
);

// ─── Avatar ─────────────────────────────────────────
export const avatars = pgTable('avatars', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  skinToneKey: text('skin_tone_key').notNull().default('tone_04'),
  faceKey: text('face_key').notNull().default('face_01'),
  hairStyleKey: text('hair_style_key').notNull().default('hair_short_01'),
  hairColorKey: text('hair_color_key').notNull().default('color_brown'),
  eyeShapeKey: text('eye_shape_key').notNull().default('eyes_01'),
  eyeColorKey: text('eye_color_key').notNull().default('eye_brown'),
  browKey: text('brow_key').notNull().default('brow_01'),
  glassesKey: text('glasses_key'),
  freckles: boolean('freckles').notNull().default(false),
  facePaintKey: text('face_paint_key'),
  teamName: text('team_name').notNull().default('Strikers FC'),
  jerseyNumber: integer('jersey_number').notNull().default(10),
  teamPrimaryColorKey: text('team_primary_color_key').notNull().default('green'),
  teamSecondaryColorKey: text('team_secondary_color_key').notNull().default('white'),
  jerseyStyleKey: text('jersey_style_key').notNull().default('jersey_home_01'),
  shortsStyleKey: text('shorts_style_key').notNull().default('shorts_01'),
  socksStyleKey: text('socks_style_key').notNull().default('socks_01'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Catalog Items ──────────────────────────────────
export const catalogItems = pgTable('catalog_items', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // cleats | shinguards | socks | headbands | gloves | jerseys | balls | celebrations | stadiums | stickers | skills
  name: text('name').notNull(),
  rarity: text('rarity').notNull().default('common'), // common | rare | epic | legendary
  unlockRule: jsonb('unlock_rule'), // { type: 'league', league: 'U12' } etc.
  assetKey: text('asset_key').notNull(),
  statMods: jsonb('stat_mods'), // { power: 5 } etc. for skill items
  isStarter: boolean('is_starter').notNull().default(false),
});

// ─── Inventory (owned items) ────────────────────────
export const inventory = pgTable(
  'inventory',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    itemId: text('item_id')
      .notNull()
      .references(() => catalogItems.id),
    source: text('source').notNull().default('starter'), // starter | league | badge | streak | mastery | store
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('inventory_user_idx').on(table.userId),
    uniqueItem: index('inventory_unique_idx').on(table.userId, table.itemId),
  }),
);

// ─── Equipped (what's currently worn) ───────────────
export const equipped = pgTable('equipped', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  equippedByCategory: jsonb('equipped_by_category').$type<Record<string, string>>().default({}),
  activeSkills: jsonb('active_skills').$type<string[]>().default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Question Bank Items ─────────────────────────────
export const questionBankItems = pgTable(
  'question_bank_items',
  {
    id: text('id').primaryKey(),
    version: text('version').notNull().default('v1'),
    domain: text('domain').notNull(),
    skillTag: text('skill_tag').notNull(),
    subskillTags: jsonb('subskill_tags').$type<string[]>().default([]),
    gradeBand: text('grade_band').notNull(),
    questionType: text('question_type').notNull(),
    globalDifficulty: integer('global_difficulty').notNull(),
    skillDifficulty: integer('skill_difficulty').notNull(),
    prompt: text('prompt').notNull(),
    choices: jsonb('choices').$type<string[]>(),
    correctAnswer: jsonb('correct_answer').$type<string | string[]>().notNull(),
    visual: jsonb('visual'),
    explanation: text('explanation').notNull(),
    source: jsonb('source').$type<{ kind: string; origin: string; license: string }>().notNull(),
    hash: text('hash').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    skillDiffIdx: index('qbi_skill_diff_idx').on(table.skillTag, table.globalDifficulty, table.skillDifficulty),
    domainGradeIdx: index('qbi_domain_grade_idx').on(table.domain, table.gradeBand),
    diffIdx: index('qbi_difficulty_idx').on(table.globalDifficulty),
  }),
);
