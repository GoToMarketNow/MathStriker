import type { League, SkillTag } from '@math-striker/shared';
import { LEAGUE_ORDER } from '@math-striker/shared';

// ─── Assessment scoring ─────────────────────────────
export interface AssessmentAttempt {
  skillTag: SkillTag;
  correct: boolean;
  responseTimeMs: number;
}

export interface AssessmentScoreResult {
  overallScore: number;
  perSkillScores: Record<string, number>;
  startingDifficulty: number;
  startingLeague: League;
}

export function scoreAssessment(attempts: AssessmentAttempt[]): AssessmentScoreResult {
  const totalCorrect = attempts.filter((a) => a.correct).length;
  const overallScore = Math.round((totalCorrect / attempts.length) * 100);

  // Per-skill accuracy
  const skillBuckets: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    if (!skillBuckets[a.skillTag]) skillBuckets[a.skillTag] = { correct: 0, total: 0 };
    skillBuckets[a.skillTag].total++;
    if (a.correct) skillBuckets[a.skillTag].correct++;
  }

  const perSkillScores: Record<string, number> = {};
  for (const [skill, bucket] of Object.entries(skillBuckets)) {
    perSkillScores[skill] = Math.round((bucket.correct / bucket.total) * 100);
  }

  // Speed bonus: fast correct answers bump score slightly
  const avgTime = attempts.reduce((sum, a) => sum + a.responseTimeMs, 0) / attempts.length;
  const speedBonus = avgTime < 5000 ? 5 : avgTime < 8000 ? 2 : 0;
  const adjustedScore = Math.min(100, overallScore + speedBonus);

  // Map score to difficulty and league
  const startingDifficulty = scoreToDifficulty(adjustedScore);
  const startingLeague = scoreToLeague(adjustedScore);

  return { overallScore: adjustedScore, perSkillScores, startingDifficulty, startingLeague };
}

function scoreToDifficulty(score: number): number {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

function scoreToLeague(score: number): League {
  if (score >= 90) return 'HS';
  if (score >= 75) return 'U14';
  if (score >= 60) return 'U12';
  if (score >= 40) return 'U10';
  return 'U8';
}

// ─── Rolling accuracy & difficulty adjustment ───────
export interface RollingWindow {
  attempts: { correct: boolean; skillTag: string }[];
}

export function computeRollingAccuracy(window: RollingWindow): number {
  if (window.attempts.length === 0) return 0.5;
  const correct = window.attempts.filter((a) => a.correct).length;
  return correct / window.attempts.length;
}

export function shouldAdjustDifficulty(questionsSinceAdjust: number): boolean {
  return questionsSinceAdjust >= 5;
}

/**
 * Returns new difficulty based on rolling accuracy.
 * ≥85% correct → +1 (max 6)
 * 60-85% → stable
 * <60% → -1 (min 1)
 */
export function adjustDifficulty(currentDifficulty: number, rollingAccuracy: number): number {
  if (rollingAccuracy >= 0.85) return Math.min(6, currentDifficulty + 1);
  if (rollingAccuracy < 0.60) return Math.max(1, currentDifficulty - 1);
  return currentDifficulty;
}

// ─── Skill model update ─────────────────────────────
export function updateSkillModel(
  skillModel: Record<string, number>,
  skillTag: string,
  correct: boolean,
): Record<string, number> {
  const current = skillModel[skillTag] ?? 0.5;
  // Exponential moving average with alpha = 0.15
  const alpha = 0.15;
  const newValue = current * (1 - alpha) + (correct ? 1 : 0) * alpha;
  return { ...skillModel, [skillTag]: Math.round(newValue * 1000) / 1000 };
}

// ─── League promotion check ─────────────────────────
export function checkLeaguePromotion(
  currentLeague: League,
  xp: number,
  skillModel: Record<string, number>,
): League | null {
  const thresholds: Record<League, { xp: number; avgMastery: number }> = {
    U8: { xp: 0, avgMastery: 0 },
    U10: { xp: 200, avgMastery: 0.4 },
    U12: { xp: 600, avgMastery: 0.55 },
    U14: { xp: 1200, avgMastery: 0.65 },
    HS: { xp: 2500, avgMastery: 0.75 },
    College: { xp: 5000, avgMastery: 0.85 },
  };

  const currentIdx = LEAGUE_ORDER.indexOf(currentLeague);
  if (currentIdx >= LEAGUE_ORDER.length - 1) return null;

  const nextLeague = LEAGUE_ORDER[currentIdx + 1];
  const req = thresholds[nextLeague];

  const skills = Object.values(skillModel);
  const avgMastery = skills.length > 0 ? skills.reduce((a, b) => a + b, 0) / skills.length : 0;

  if (xp >= req.xp && avgMastery >= req.avgMastery) {
    return nextLeague;
  }
  return null;
}

// ─── Weak skills detection ──────────────────────────
export function getWeakSkills(skillModel: Record<string, number>, threshold = 0.6): string[] {
  return Object.entries(skillModel)
    .filter(([, accuracy]) => accuracy < threshold)
    .sort((a, b) => a[1] - b[1])
    .map(([skill]) => skill);
}
