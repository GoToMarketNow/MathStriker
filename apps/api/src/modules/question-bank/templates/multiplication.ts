import { computeHash } from '../hash.js';
import {
  BankItem, Difficulty, SOURCE, makeRng, clampDiff, pickOne, shuffle,
  formatId, gradeBand, choices4,
} from './common.js';

export function generateMultiplication(version = 'v1', seed = 1337, count = 1200): BankItem[] {
  const rng = makeRng(seed ^ 0x51f1c0de);
  const items: BankItem[] = [];

  const skills = [
    { tag: 'mult_facts', sub: ['facts_0_12'] },
    { tag: 'mult_missing_factor', sub: ['missing_factor'] },
    { tag: 'mult_arrays', sub: ['arrays_visual'] },
    { tag: 'mult_properties', sub: ['commutative', 'distributive'] },
    { tag: 'mult_compare', sub: ['greater_less'] },
  ] as const;

  for (let i = 0; i < count; i++) {
    const sk = pickOne(rng, skills);
    const diff = clampDiff(1 + Math.floor(rng() * 6));
    const max = diff <= 2 ? 10 : diff <= 4 ? 12 : 15;
    const a = 1 + Math.floor(rng() * max);
    const b = 1 + Math.floor(rng() * max);
    const correct = a * b;

    let prompt = '';
    let choices: string[] | undefined;
    let correctAnswer: string | string[] = String(correct);
    let qType: BankItem['questionType'] = 'mcq_single';
    let visual: unknown | undefined;
    let explanation = '';

    if (sk.tag === 'mult_facts') {
      prompt = `What is ${a} × ${b}?`;
      choices = choices4(rng, correct, (a + 1) * b, a * (b + 1), (a - 1) * b);
      explanation = `${a} × ${b} means ${a} groups of ${b}. That equals ${correct}.`;
    } else if (sk.tag === 'mult_missing_factor') {
      const left = rng() < 0.5;
      const missing = left ? a : b;
      const known = left ? b : a;
      prompt = left
        ? `□ × ${known} = ${correct}. What goes in the box?`
        : `${known} × □ = ${correct}. What goes in the box?`;
      choices = choices4(rng, missing, missing + 1, missing - 1, missing + 2);
      correctAnswer = String(missing);
      explanation = `${correct} ÷ ${known} = ${missing}.`;
    } else if (sk.tag === 'mult_arrays') {
      qType = 'visual';
      const rows = Math.min(a, 10);
      const cols = Math.min(b, 10);
      const total = rows * cols;
      prompt = `This array has ${rows} rows and ${cols} columns. How many dots total?`;
      visual = { type: 'arraysMultiplication', rows, cols };
      choices = choices4(rng, total, (rows + 1) * cols, rows * (cols + 1));
      correctAnswer = String(total);
      explanation = `${rows} rows × ${cols} columns = ${total}.`;
    } else if (sk.tag === 'mult_properties') {
      // commutative: a×b = b×a confirmation
      prompt = `Is ${a} × ${b} the same as ${b} × ${a}?`;
      choices = shuffle(rng, ['Yes, they are equal', `No, ${a} × ${b} is bigger`, `No, ${b} × ${a} is bigger`]);
      correctAnswer = 'Yes, they are equal';
      explanation = `Multiplication is commutative: ${a} × ${b} = ${b} × ${a} = ${correct}.`;
    } else {
      // mult_compare
      const a2 = 1 + Math.floor(rng() * max);
      const b2 = 1 + Math.floor(rng() * max);
      const p2 = a2 * b2;
      if (correct === p2) { continue; }
      const bigger = correct > p2 ? `${a} × ${b}` : `${a2} × ${b2}`;
      prompt = `Which is greater: ${a} × ${b} or ${a2} × ${b2}?`;
      choices = shuffle(rng, [`${a} × ${b}`, `${a2} × ${b2}`, 'They are equal']);
      correctAnswer = bigger;
      explanation = `${a} × ${b} = ${correct}. ${a2} × ${b2} = ${p2}. ${bigger} is greater.`;
    }

    const id = formatId([sk.tag, `d${diff}`, version, String(i + 1).padStart(4, '0')]);
    const hash = computeHash({ domain: 'multiplication', skillTag: sk.tag, questionType: qType, prompt, choices, correctAnswer, visual });

    items.push({
      id, version, domain: 'multiplication', skillTag: sk.tag,
      subskillTags: [...sk.sub], gradeBand: gradeBand(diff),
      questionType: qType, globalDifficulty: diff, skillDifficulty: diff,
      prompt, choices, correctAnswer, visual, explanation, source: SOURCE, hash,
    });
  }

  return items;
}
