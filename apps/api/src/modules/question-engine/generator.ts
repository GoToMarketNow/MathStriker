import type { Rng } from './rng.js';
import type { SkillTag, QuestionType } from '@math-striker/shared';

export interface GeneratedQuestion {
  id: string;
  skillTag: SkillTag;
  difficulty: number;
  prompt: string;
  choices: (string | number)[];
  correctAnswer: string | number;
  questionType: QuestionType;
  visual?: { type: string; data: unknown };
  explanation?: string;
}

// ─── Difficulty ranges ──────────────────────────────
// Tier 1-2: single digit, Tier 3-4: two digit, Tier 5-6: larger
function diffRange(difficulty: number): { min: number; max: number } {
  if (difficulty <= 2) return { min: 2, max: 9 };
  if (difficulty <= 4) return { min: 3, max: 12 };
  return { min: 4, max: 15 };
}

// ─── Distractor generation ──────────────────────────
function generateDistractors(correct: number, rng: Rng, count = 3): number[] {
  const distractors = new Set<number>();
  const offsets = [-2, -1, 1, 2, 3, -3, 5, -5, 10, -10];
  let attempts = 0;
  while (distractors.size < count && attempts < 50) {
    const offset = rng.pick(offsets);
    const val = correct + offset;
    if (val > 0 && val !== correct && !distractors.has(val)) {
      distractors.add(val);
    }
    attempts++;
  }
  // Fill remaining with random nearby values
  while (distractors.size < count) {
    const val = correct + rng.int(-10, 10);
    if (val > 0 && val !== correct) distractors.add(val);
  }
  return [...distractors].slice(0, count);
}

// ─── Multiplication ─────────────────────────────────
function genMultiplication(difficulty: number, rng: Rng, idx: number): GeneratedQuestion {
  const r = diffRange(difficulty);
  const a = rng.int(r.min, r.max);
  const b = rng.int(r.min, r.max);
  const correct = a * b;
  const distractors = generateDistractors(correct, rng);
  const choices = rng.shuffle([correct, ...distractors]);

  return {
    id: `mult_${idx}`,
    skillTag: 'multiplication',
    difficulty,
    prompt: `What is ${a} × ${b}?`,
    choices,
    correctAnswer: correct,
    questionType: 'mcq',
    explanation: `${a} × ${b} = ${correct} because ${a} groups of ${b} makes ${correct}.`,
  };
}

// ─── Division ───────────────────────────────────────
function genDivision(difficulty: number, rng: Rng, idx: number): GeneratedQuestion {
  const r = diffRange(difficulty);
  const divisor = rng.int(r.min, Math.min(r.max, 12));
  const quotient = rng.int(r.min, r.max);
  const dividend = divisor * quotient;
  const distractors = generateDistractors(quotient, rng);
  const choices = rng.shuffle([quotient, ...distractors]);

  return {
    id: `div_${idx}`,
    skillTag: 'division',
    difficulty,
    prompt: `What is ${dividend} ÷ ${divisor}?`,
    choices,
    correctAnswer: quotient,
    questionType: 'mcq',
    explanation: `${dividend} ÷ ${divisor} = ${quotient} because ${divisor} × ${quotient} = ${dividend}.`,
  };
}

// ─── Fractions (Visual) ─────────────────────────────
function genFractions(difficulty: number, rng: Rng, idx: number): GeneratedQuestion {
  const denoms = difficulty <= 2 ? [2, 3, 4] : difficulty <= 4 ? [3, 4, 5, 6, 8] : [4, 5, 6, 8, 10, 12];
  const denominator = rng.pick(denoms);
  const numerator = rng.int(1, denominator - 1);
  const correct = `${numerator}/${denominator}`;

  // Generate fraction distractors
  const distractors = new Set<string>();
  let att = 0;
  while (distractors.size < 3 && att < 30) {
    const n = rng.int(1, denominator - 1);
    const d = rng.pick(denoms);
    const frac = `${n}/${d}`;
    if (frac !== correct) distractors.add(frac);
    att++;
  }
  while (distractors.size < 3) {
    distractors.add(`${rng.int(1, 5)}/${rng.int(2, 8)}`);
  }

  const choices = rng.shuffle([correct, ...[...distractors].slice(0, 3)]);

  return {
    id: `frac_${idx}`,
    skillTag: 'fractions',
    difficulty,
    prompt: 'What fraction is shaded?',
    choices,
    correctAnswer: correct,
    questionType: 'visual_fraction',
    visual: {
      type: 'fractionBars',
      data: { numerator, denominator },
    },
    explanation: `${numerator} out of ${denominator} parts are shaded, so the answer is ${correct}.`,
  };
}

// ─── Patterns ───────────────────────────────────────
function genPatterns(difficulty: number, rng: Rng, idx: number): GeneratedQuestion {
  // Number patterns: find the next number
  const start = rng.int(1, difficulty <= 2 ? 5 : 10);
  const step = rng.int(difficulty <= 2 ? 2 : 3, difficulty <= 4 ? 5 : 10);
  const len = difficulty <= 2 ? 4 : 5;
  const sequence = Array.from({ length: len }, (_, i) => start + step * i);
  const correct = start + step * len;

  const distractors = generateDistractors(correct, rng);
  const choices = rng.shuffle([correct, ...distractors]);

  return {
    id: `pat_${idx}`,
    skillTag: 'patterns',
    difficulty,
    prompt: `What comes next? ${sequence.join(', ')}, ?`,
    choices,
    correctAnswer: correct,
    questionType: 'pattern_completion',
    explanation: `The pattern adds ${step} each time. ${sequence[sequence.length - 1]} + ${step} = ${correct}.`,
  };
}

// ─── Word Problems ──────────────────────────────────
const wordTemplates = [
  {
    make: (a: number, b: number) => ({
      prompt: `${a} soccer teams each have ${b} players. How many players are there in total?`,
      correct: a * b,
      explanation: `${a} teams × ${b} players = ${a * b} players total.`,
    }),
  },
  {
    make: (a: number, b: number) => ({
      prompt: `You scored ${a * b} goals in ${a} games. How many goals per game on average?`,
      correct: b,
      explanation: `${a * b} goals ÷ ${a} games = ${b} goals per game.`,
    }),
  },
  {
    make: (a: number, b: number) => ({
      prompt: `A stadium has ${a} rows with ${b} seats each. How many seats are there?`,
      correct: a * b,
      explanation: `${a} rows × ${b} seats = ${a * b} seats total.`,
    }),
  },
  {
    make: (a: number, b: number) => ({
      prompt: `${a * b} fans need to split into ${b} equal groups. How many in each group?`,
      correct: a,
      explanation: `${a * b} fans ÷ ${b} groups = ${a} fans per group.`,
    }),
  },
];

function genWordProblem(difficulty: number, rng: Rng, idx: number): GeneratedQuestion {
  const r = diffRange(difficulty);
  const a = rng.int(r.min, r.max);
  const b = rng.int(r.min, Math.min(r.max, 10));
  const template = rng.pick(wordTemplates);
  const { prompt, correct, explanation } = template.make(a, b);
  const distractors = generateDistractors(correct, rng);
  const choices = rng.shuffle([correct, ...distractors]);

  return {
    id: `word_${idx}`,
    skillTag: 'word_problems',
    difficulty,
    prompt,
    choices,
    correctAnswer: correct,
    questionType: 'word_problem',
    explanation,
  };
}

// ─── Main generator ─────────────────────────────────
const generators: Record<SkillTag, (d: number, r: Rng, i: number) => GeneratedQuestion> = {
  multiplication: genMultiplication,
  division: genDivision,
  fractions: genFractions,
  patterns: genPatterns,
  word_problems: genWordProblem,
};

export interface GenerateOptions {
  difficulty: number;
  skillTag?: SkillTag;
  index: number;
  rng: Rng;
  weakSkills?: SkillTag[];
}

export function generateQuestion(opts: GenerateOptions): GeneratedQuestion {
  const { difficulty, index, rng, weakSkills } = opts;
  let skill = opts.skillTag;

  if (!skill) {
    const allSkills: SkillTag[] = ['multiplication', 'division', 'fractions', 'patterns', 'word_problems'];
    // Bias toward weak skills 40% of the time
    if (weakSkills && weakSkills.length > 0 && rng.next() < 0.4) {
      skill = rng.pick(weakSkills);
    } else {
      skill = rng.pick(allSkills);
    }
  }

  const gen = generators[skill];
  return gen(difficulty, rng, index);
}
