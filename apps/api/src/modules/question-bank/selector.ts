import { db } from '../../db/index.js';
import { questionBankItems } from '../../db/schema.js';
import { eq, and, between, notInArray, inArray, sql, count } from 'drizzle-orm';

export type League = 'U8' | 'U10' | 'U12' | 'U14' | 'HS' | 'College';

export function leagueToDifficultyBand(league: string): { min: number; max: number } {
  switch (league) {
    case 'U8': return { min: 1, max: 2 };
    case 'U10': return { min: 2, max: 3 };
    case 'U12': return { min: 3, max: 4 };
    case 'U14': return { min: 4, max: 5 };
    case 'HS': return { min: 5, max: 5 };
    case 'College': return { min: 6, max: 6 };
    default: return { min: 1, max: 3 };
  }
}

export interface SelectionCriteria {
  globalDifficulty: number;
  skillTag?: string;
  weakSkills?: string[];
  recentIds: string[];
  recentSkillTags: string[];
}

export async function selectFromBank(criteria: SelectionCriteria) {
  const { globalDifficulty, recentIds, recentSkillTags } = criteria;

  // Determine target skill
  let targetSkill = criteria.skillTag;
  if (!targetSkill && criteria.weakSkills?.length && Math.random() < 0.4) {
    targetSkill = criteria.weakSkills[Math.floor(Math.random() * criteria.weakSkills.length)];
  }
  // Anti-repetition: don't serve same skill 3+ times
  if (targetSkill && recentSkillTags.length >= 2 && recentSkillTags.slice(-2).every(t => t === targetSkill)) {
    targetSkill = undefined;
  }

  const minDiff = Math.max(1, globalDifficulty - 1);
  const maxDiff = Math.min(6, globalDifficulty + 1);

  // Build conditions
  const conditions = [
    between(questionBankItems.globalDifficulty, minDiff, maxDiff),
  ];

  if (targetSkill) {
    conditions.push(eq(questionBankItems.skillTag, targetSkill));
  }

  if (recentIds.length > 0) {
    conditions.push(notInArray(questionBankItems.id, recentIds));
  }

  // Fetch a pool of candidates
  const candidates = await db
    .select()
    .from(questionBankItems)
    .where(and(...conditions))
    .limit(50);

  if (candidates.length === 0) {
    // Relax constraints
    const relaxed = await db
      .select()
      .from(questionBankItems)
      .where(between(questionBankItems.globalDifficulty, minDiff, maxDiff))
      .limit(50);
    if (relaxed.length === 0) return null;
    return pickWeighted(relaxed, globalDifficulty);
  }

  return pickWeighted(candidates, globalDifficulty);
}

function pickWeighted(candidates: any[], targetDiff: number) {
  // Weight exact difficulty matches 3x
  const weighted = candidates.map(q => ({
    q,
    weight: q.globalDifficulty === targetDiff ? 3 : 1,
  }));
  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const { q, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) return q;
  }
  return candidates[0];
}

export async function getBankCount(): Promise<number> {
  const result = await db.select({ value: count() }).from(questionBankItems);
  return result[0]?.value ?? 0;
}

export async function getBankStats() {
  const total = await getBankCount();
  // Quick domain breakdown
  const byDomain = await db
    .select({
      domain: questionBankItems.domain,
      count: count(),
    })
    .from(questionBankItems)
    .groupBy(questionBankItems.domain);

  const byDifficulty = await db
    .select({
      difficulty: questionBankItems.globalDifficulty,
      count: count(),
    })
    .from(questionBankItems)
    .groupBy(questionBankItems.globalDifficulty);

  return {
    total,
    byDomain: Object.fromEntries(byDomain.map(r => [r.domain, r.count])),
    byDifficulty: Object.fromEntries(byDifficulty.map(r => [r.difficulty, r.count])),
  };
}
