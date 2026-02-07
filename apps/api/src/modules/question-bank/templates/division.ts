import { computeHash } from '../hash.js';
import {
  BankItem, SOURCE, makeRng, clampDiff, pickOne, shuffle,
  formatId, gradeBand, choices4,
} from './common.js';

export function generateDivision(version = 'v1', seed = 1337, count = 900): BankItem[] {
  const rng = makeRng(seed ^ 0x2ad3b10f);
  const items: BankItem[] = [];

  const skills = [
    { tag: 'div_facts', sub: ['facts_within_100'] },
    { tag: 'div_interpretation', sub: ['grouping_sharing'] },
    { tag: 'div_inverse', sub: ['fact_family'] },
    { tag: 'div_remainders', sub: ['simple_remainder'] },
  ] as const;

  const shareItems = ['stickers', 'soccer cards', 'marbles', 'cones', 'juice boxes', 'pencils'] as const;

  for (let i = 0; i < count; i++) {
    const sk = pickOne(rng, skills);
    const diff = clampDiff(1 + Math.floor(rng() * 6));
    const maxDiv = diff <= 2 ? 10 : 12;
    const divisor = 2 + Math.floor(rng() * (maxDiv - 1));
    const qMax = diff <= 2 ? 10 : diff <= 4 ? 12 : 15;
    const quotient = 1 + Math.floor(rng() * qMax);
    const dividend = divisor * quotient;

    let prompt = '';
    let choices: string[] | undefined;
    let correctAnswer: string | string[] = String(quotient);
    let qType: BankItem['questionType'] = 'mcq_single';
    let explanation = '';

    if (sk.tag === 'div_facts') {
      prompt = `What is ${dividend} ÷ ${divisor}?`;
      choices = choices4(rng, quotient, quotient + 1, quotient - 1, divisor);
      explanation = `${dividend} ÷ ${divisor} = ${quotient}. Think: ${divisor} × ${quotient} = ${dividend}.`;
    } else if (sk.tag === 'div_interpretation') {
      const item = pickOne(rng, shareItems);
      prompt = `You have ${dividend} ${item} to share equally among ${divisor} friends. How many does each friend get?`;
      choices = choices4(rng, quotient, quotient + 1, quotient - 1, quotient + 2);
      explanation = `Sharing equally means divide: ${dividend} ÷ ${divisor} = ${quotient}.`;
      qType = 'word';
    } else if (sk.tag === 'div_inverse') {
      prompt = `If ${divisor} × □ = ${dividend}, what is □?`;
      choices = choices4(rng, quotient, quotient + 1, quotient - 1, divisor);
      explanation = `Division undoes multiplication: ${dividend} ÷ ${divisor} = ${quotient}.`;
    } else {
      // remainders — only at D4+
      if (diff < 4) { continue; }
      const rem = 1 + Math.floor(rng() * (divisor - 1));
      const divWithRem = dividend + rem;
      const ans = `${quotient} R${rem}`;
      prompt = `What is ${divWithRem} ÷ ${divisor}?`;
      choices = shuffle(rng, [
        `${quotient} R${rem}`,
        `${quotient}`,
        `${quotient + 1}`,
        `${quotient} R${Math.max(1, (rem + 1) % divisor || 1)}`,
      ]);
      correctAnswer = ans;
      explanation = `${divisor} × ${quotient} = ${dividend}. ${divWithRem} - ${dividend} = ${rem} left over.`;
    }

    const id = formatId([sk.tag, `d${diff}`, version, String(i + 1).padStart(4, '0')]);
    const hash = computeHash({ domain: 'division', skillTag: sk.tag, questionType: qType, prompt, choices, correctAnswer });

    items.push({
      id, version, domain: 'division', skillTag: sk.tag,
      subskillTags: [...sk.sub], gradeBand: gradeBand(diff),
      questionType: qType, globalDifficulty: diff, skillDifficulty: diff,
      prompt, choices, correctAnswer, explanation, source: SOURCE, hash,
    });
  }

  return items;
}
