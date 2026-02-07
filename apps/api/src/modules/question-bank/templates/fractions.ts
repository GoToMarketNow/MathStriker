import { computeHash } from '../hash.js';
import {
  BankItem, SOURCE, makeRng, clampDiff, pickOne, shuffle,
  formatId, gradeBand,
} from './common.js';

const frac = (n: number, d: number) => `${n}/${d}`;

function fracChoices(rng: () => number, correct: string, parts: number): string[] {
  const s = new Set<string>([correct]);
  let attempts = 0;
  while (s.size < 4 && attempts < 20) {
    const n = 1 + Math.floor(rng() * (parts - 1));
    s.add(frac(n, parts));
    attempts++;
  }
  // Pad if needed
  while (s.size < 4) s.add(frac(Math.max(1, Math.floor(rng() * parts)), parts + pickOne(rng, [0, 1, 2])));
  return shuffle(rng, [...s]);
}

export function generateFractions(version = 'v1', seed = 1337, count = 1400): BankItem[] {
  const rng = makeRng(seed ^ 0x9b77a1cd);
  const items: BankItem[] = [];

  const skills = [
    { tag: 'frac_identify', sub: ['fraction_bars'] },
    { tag: 'frac_equivalent', sub: ['equivalence'] },
    { tag: 'frac_compare', sub: ['compare'] },
    { tag: 'frac_numberline', sub: ['number_line'] },
    { tag: 'frac_of_set', sub: ['fraction_of_set'] },
  ] as const;

  for (let i = 0; i < count; i++) {
    const sk = pickOne(rng, skills);
    const diff = clampDiff(1 + Math.floor(rng() * 6));

    let prompt = '';
    let choices: string[] | undefined;
    let correctAnswer: string | string[] = '';
    let qType: BankItem['questionType'] = 'visual';
    let visual: unknown | undefined;
    let explanation = '';

    if (sk.tag === 'frac_identify') {
      const parts = diff <= 2 ? pickOne(rng, [2, 3, 4]) : diff <= 4 ? pickOne(rng, [4, 5, 6, 8]) : pickOne(rng, [6, 8, 10, 12]);
      const shaded = 1 + Math.floor(rng() * (parts - 1));
      const ans = frac(shaded, parts);
      const shape = rng() < 0.5 ? 'fractionBars' : 'fractionCircle';
      prompt = `What fraction of the ${shape === 'fractionBars' ? 'bar' : 'circle'} is shaded?`;
      visual = { type: shape, parts, shaded };
      choices = fracChoices(rng, ans, parts);
      correctAnswer = ans;
      explanation = `${parts} equal parts, ${shaded} shaded = ${ans}.`;
    } else if (sk.tag === 'frac_equivalent') {
      qType = 'mcq_single';
      const baseDen = diff <= 2 ? pickOne(rng, [2, 3, 4]) : pickOne(rng, [3, 4, 5, 6]);
      const baseNum = 1 + Math.floor(rng() * (baseDen - 1));
      const mult = diff <= 2 ? pickOne(rng, [2, 3]) : diff <= 4 ? pickOne(rng, [2, 3, 4]) : pickOne(rng, [3, 4, 5]);
      const correct = frac(baseNum * mult, baseDen * mult);
      prompt = `Which fraction is equivalent to ${frac(baseNum, baseDen)}?`;
      const dists = new Set<string>();
      let at = 0;
      while (dists.size < 3 && at < 20) {
        const m2 = pickOne(rng, [2, 3, 4, 5]);
        const n2 = Math.max(1, Math.min(baseDen * m2 - 1, baseNum * m2 + pickOne(rng, [-1, 1, 2, -2])));
        dists.add(frac(n2, baseDen * m2));
        at++;
      }
      choices = shuffle(rng, [correct, ...[...dists]].slice(0, 4));
      correctAnswer = correct;
      explanation = `Multiply top and bottom by ${mult}: ${baseNum}×${mult}/${baseDen}×${mult} = ${correct}.`;
    } else if (sk.tag === 'frac_compare') {
      qType = 'mcq_single';
      const d1 = diff <= 2 ? pickOne(rng, [2, 3, 4]) : pickOne(rng, [4, 5, 6, 8]);
      const n1 = 1 + Math.floor(rng() * (d1 - 1));
      let n2 = 1 + Math.floor(rng() * (d1 - 1));
      if (n2 === n1) n2 = Math.max(1, n2 - 1);
      const f1 = frac(n1, d1);
      const f2 = frac(n2, d1);
      prompt = `Which is greater: ${f1} or ${f2}?`;
      choices = shuffle(rng, [f1, f2, 'They are equal']);
      correctAnswer = n1 > n2 ? f1 : n2 > n1 ? f2 : 'They are equal';
      explanation = `Same denominator: bigger numerator = bigger fraction.`;
    } else if (sk.tag === 'frac_numberline') {
      qType = 'visual';
      const den = diff <= 2 ? 4 : diff <= 4 ? pickOne(rng, [4, 5, 6]) : pickOne(rng, [6, 8]);
      const num = 1 + Math.floor(rng() * (den - 1));
      const ans = frac(num, den);
      prompt = `What fraction is marked on the number line?`;
      visual = { type: 'numberLine', min: 0, max: 1, divisions: den, marked: num };
      choices = fracChoices(rng, ans, den);
      correctAnswer = ans;
      explanation = `The line splits into ${den} parts. The mark is at ${num} parts = ${ans}.`;
    } else {
      // frac_of_set
      qType = 'mcq_single';
      if (diff < 3) { continue; } // not appropriate at D1-2
      const den = pickOne(rng, [2, 3, 4, 5, 8]);
      const num = 1 + Math.floor(rng() * Math.min(den - 1, 3));
      const setSize = den * pickOne(rng, [2, 3, 4, 5]);
      const ans = (num / den) * setSize;
      prompt = `What is ${frac(num, den)} of ${setSize}?`;
      choices = shuffle(rng, [ans, ans + 1, ans - 1, setSize / den + 1].filter(n => n > 0)).map(String).slice(0, 4);
      correctAnswer = String(ans);
      explanation = `${setSize} ÷ ${den} = ${setSize / den}. Then × ${num} = ${ans}.`;
    }

    const id = formatId([sk.tag, `d${diff}`, version, String(i + 1).padStart(4, '0')]);
    const hash = computeHash({ domain: 'fractions', skillTag: sk.tag, questionType: qType, prompt, choices, correctAnswer, visual });

    items.push({
      id, version, domain: 'fractions', skillTag: sk.tag,
      subskillTags: [...sk.sub], gradeBand: gradeBand(diff),
      questionType: qType, globalDifficulty: diff, skillDifficulty: diff,
      prompt, choices, correctAnswer, visual, explanation, source: SOURCE, hash,
    });
  }

  return items;
}
