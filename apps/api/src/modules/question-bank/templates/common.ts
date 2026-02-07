// ─── Shared types & helpers for deterministic question generation ───

export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6;
export type Domain = 'multiplication' | 'division' | 'fractions' | 'patterns' | 'word_problems';
export type QuestionType = 'mcq_single' | 'mcq_multi' | 'visual' | 'word';

export interface BankItem {
  id: string;
  version: string;
  domain: Domain;
  skillTag: string;
  subskillTags: string[];
  gradeBand: string;
  questionType: QuestionType;
  globalDifficulty: Difficulty;
  skillDifficulty: Difficulty;
  prompt: string;
  choices?: string[];
  correctAnswer: string | string[];
  visual?: unknown;
  explanation: string;
  source: { kind: 'generated'; origin: 'math_striker_templates'; license: 'proprietary_generated' };
  hash: string;
}

export const SOURCE: BankItem['source'] = {
  kind: 'generated',
  origin: 'math_striker_templates',
  license: 'proprietary_generated',
};

/** Mulberry32 — deterministic PRNG */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clampDiff(d: number): Difficulty {
  return Math.max(1, Math.min(6, Math.round(d))) as Difficulty;
}

export function pickOne<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function formatId(parts: string[]): string {
  return parts
    .map(p => p.toLowerCase().replace(/[^a-z0-9]+/g, '_'))
    .join('_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function gradeBand(d: Difficulty): string {
  if (d <= 1) return '2';
  if (d <= 2) return '2-3';
  if (d <= 4) return '3';
  return '3-4';
}

/** Produce 3 plausible distractors for an integer answer */
export function distractors(rng: () => number, correct: number, ...nearby: number[]): number[] {
  const s = new Set<number>();
  for (const n of nearby) { if (n > 0 && n !== correct) s.add(n); }
  // Add random offsets
  while (s.size < 6) {
    s.add(correct + pickOne(rng, [-3, -2, -1, 1, 2, 3, 5, 10]) * pickOne(rng, [1, 2]));
  }
  const arr = [...s].filter(n => n > 0 && n !== correct);
  return shuffle(rng, arr).slice(0, 3);
}

/** Build 4-choice MCQ array with correct + 3 distractors */
export function choices4(rng: () => number, correct: number, ...nearby: number[]): string[] {
  return shuffle(rng, [correct, ...distractors(rng, correct, ...nearby)]).map(String);
}
