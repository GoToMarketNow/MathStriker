import { createHash } from 'node:crypto';

/** Stable SHA-256 hash of normalized question fields for dedup. */
export function computeHash(input: {
  domain: string;
  skillTag: string;
  questionType: string;
  prompt: string;
  choices?: unknown;
  correctAnswer?: unknown;
  visual?: unknown;
}): string {
  const normalized = JSON.stringify({
    domain: input.domain,
    skillTag: input.skillTag,
    questionType: input.questionType,
    prompt: (input.prompt ?? '').trim().replace(/\s+/g, ' '),
    choices: input.choices ?? null,
    correctAnswer: input.correctAnswer ?? null,
    visual: input.visual ?? null,
  });
  return createHash('sha256').update(normalized).digest('hex');
}
