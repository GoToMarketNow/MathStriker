import { z } from 'zod';

// ─── Leagues ────────────────────────────────────────
export const LeagueEnum = z.enum(['U8', 'U10', 'U12', 'U14', 'HS', 'College']);
export type League = z.infer<typeof LeagueEnum>;

export const LEAGUE_ORDER: League[] = ['U8', 'U10', 'U12', 'U14', 'HS', 'College'];

// ─── Skills ─────────────────────────────────────────
export const SkillTagEnum = z.enum([
  'multiplication',
  'division',
  'fractions',
  'patterns',
  'word_problems',
]);
export type SkillTag = z.infer<typeof SkillTagEnum>;

// ─── Question Types ─────────────────────────────────
export const QuestionTypeEnum = z.enum([
  'mcq',
  'multi_select',
  'visual_fraction',
  'pattern_completion',
  'word_problem',
]);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

// ─── Question Schema ────────────────────────────────
export const QuestionSchema = z.object({
  id: z.string(),
  skillTag: SkillTagEnum,
  difficulty: z.number().int().min(1).max(6),
  prompt: z.string(),
  choices: z.array(z.union([z.string(), z.number()])),
  correctAnswer: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]),
  questionType: QuestionTypeEnum,
  visual: z
    .object({
      type: z.string(),
      data: z.unknown(),
    })
    .optional(),
  explanation: z.string().optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

// ─── Submit Answer ──────────────────────────────────
export const SubmitAnswerRequestSchema = z.object({
  userId: z.string(),
  questionId: z.string(),
  answer: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]),
  responseTimeMs: z.number().int().min(0),
});
export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerRequestSchema>;

export const ShotParamsSchema = z.object({
  power: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  keeperLevel: z.number().int().min(1).max(6),
});
export type ShotParams = z.infer<typeof ShotParamsSchema>;

export const RewardEventSchema = z.object({
  type: z.enum(['coins', 'xp', 'badge', 'league', 'skin']),
  amount: z.number().optional(),
  badgeId: z.string().optional(),
  league: LeagueEnum.optional(),
});
export type RewardEvent = z.infer<typeof RewardEventSchema>;

export const CoachMessageSchema = z.object({
  title: z.string(),
  body: z.string(),
});
export type CoachMessage = z.infer<typeof CoachMessageSchema>;

export const SubmitAnswerResponseSchema = z.object({
  correct: z.boolean(),
  explanation: z.string().optional(),
  progress: z.object({
    score: z.number(),
    coins: z.number(),
    streak: z.number(),
    league: LeagueEnum,
  }),
  rewardEvents: z.array(RewardEventSchema),
  triggerSoccerShot: z.boolean(),
  shotParams: ShotParamsSchema.optional(),
  coachMessage: CoachMessageSchema.optional(),
});
export type SubmitAnswerResponse = z.infer<typeof SubmitAnswerResponseSchema>;

// ─── User / Profile ─────────────────────────────────
export const CreateUserRequestSchema = z.object({
  displayName: z.string().min(1).max(30),
  age: z.number().int().min(5).max(15).optional(),
  avatarKey: z.string().optional(),
});
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  age: z.number().nullable(),
  avatarKey: z.string().nullable(),
  currentLeague: LeagueEnum,
  xp: z.number(),
  coins: z.number(),
  streakBest: z.number(),
  createdAt: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

// ─── Assessment ─────────────────────────────────────
export const AssessmentResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  perSkillScores: z.record(SkillTagEnum, z.number()),
  startingDifficulty: z.number().int().min(1).max(6),
  startingLeague: LeagueEnum,
});
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

// ─── Health ─────────────────────────────────────────
export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
  version: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// ─── Avatar ─────────────────────────────────────────
export const AvatarSchema = z.object({
  userId: z.string(),
  skinToneKey: z.string(),
  faceKey: z.string(),
  hairStyleKey: z.string(),
  hairColorKey: z.string(),
  eyeShapeKey: z.string(),
  eyeColorKey: z.string(),
  browKey: z.string(),
  glassesKey: z.string().nullable().optional(),
  freckles: z.boolean(),
  facePaintKey: z.string().nullable().optional(),
  teamName: z.string().min(1).max(30),
  jerseyNumber: z.number().int().min(0).max(99),
  teamPrimaryColorKey: z.string(),
  teamSecondaryColorKey: z.string(),
  jerseyStyleKey: z.string(),
  shortsStyleKey: z.string(),
  socksStyleKey: z.string(),
});
export type Avatar = z.infer<typeof AvatarSchema>;

export const CosmeticCategoryEnum = z.enum([
  'cleats', 'shinguards', 'socks', 'headbands', 'gloves',
  'jerseys', 'balls', 'celebrations', 'stadiums', 'stickers', 'skills',
]);
export type CosmeticCategory = z.infer<typeof CosmeticCategoryEnum>;

export const RarityEnum = z.enum(['common', 'rare', 'epic', 'legendary']);
export type Rarity = z.infer<typeof RarityEnum>;

export const CatalogItemSchema = z.object({
  id: z.string(),
  category: CosmeticCategoryEnum,
  name: z.string(),
  rarity: RarityEnum,
  unlockRule: z.unknown().nullable(),
  assetKey: z.string(),
  statMods: z.record(z.string(), z.number()).nullable().optional(),
  isStarter: z.boolean(),
});
export type CatalogItem = z.infer<typeof CatalogItemSchema>;

export const InventoryItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  itemId: z.string(),
  source: z.string(),
  unlockedAt: z.string(),
  item: CatalogItemSchema.optional(),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export const EquippedSchema = z.object({
  userId: z.string(),
  equippedByCategory: z.record(z.string(), z.string()),
  activeSkills: z.array(z.string()),
});
export type Equipped = z.infer<typeof EquippedSchema>;

// ─── Avatar Options Catalogs ────────────────────────
export const SKIN_TONES = [
  'tone_01', 'tone_02', 'tone_03', 'tone_04', 'tone_05',
  'tone_06', 'tone_07', 'tone_08', 'tone_09', 'tone_10',
] as const;

export const HAIR_STYLES = [
  'hair_short_01', 'hair_short_02', 'hair_medium_01', 'hair_medium_02',
  'hair_long_01', 'hair_long_02', 'hair_curly_01', 'hair_curly_02',
  'hair_coily_01', 'hair_coily_02', 'hair_braids_01', 'hair_braids_02',
  'hair_twists_01', 'hair_locs_01', 'hair_locs_02', 'hair_afro_01',
  'hair_afro_02', 'hair_bun_01', 'hair_ponytail_01', 'hair_fade_01',
  'hair_fade_02', 'hair_mohawk_01', 'hair_buzz_01', 'hair_wavy_01',
] as const;

export const HAIR_COLORS = [
  'color_black', 'color_brown', 'color_dark_brown', 'color_blonde',
  'color_red', 'color_auburn', 'color_gray', 'color_platinum',
  'color_blue', 'color_pink', 'color_green', 'color_purple',
] as const;

export const EYE_SHAPES = [
  'eyes_01', 'eyes_02', 'eyes_03', 'eyes_04', 'eyes_05',
  'eyes_06', 'eyes_07', 'eyes_08', 'eyes_09', 'eyes_10',
] as const;

export const EYE_COLORS = [
  'eye_brown', 'eye_dark_brown', 'eye_hazel', 'eye_green',
  'eye_blue', 'eye_gray', 'eye_amber', 'eye_black',
] as const;

export const FACE_SHAPES = [
  'face_01', 'face_02', 'face_03', 'face_04', 'face_05',
  'face_06', 'face_07', 'face_08',
] as const;

export const BROW_STYLES = [
  'brow_01', 'brow_02', 'brow_03', 'brow_04', 'brow_05', 'brow_06',
] as const;

export const GLASSES_STYLES = [
  null, 'glasses_round', 'glasses_square', 'glasses_sport', 'glasses_goggles',
] as const;

export const TEAM_COLORS = [
  'green', 'blue', 'red', 'yellow', 'purple', 'orange',
  'white', 'black', 'teal', 'pink', 'navy', 'maroon',
] as const;
