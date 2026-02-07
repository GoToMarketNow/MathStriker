import { computeHash } from '../hash.js';
import {
  BankItem, SOURCE, makeRng, clampDiff, pickOne, shuffle,
  formatId, gradeBand, choices4,
} from './common.js';

const NAMES = ['Alex', 'Jordan', 'Mia', 'Liam', 'Addie', 'Kai', 'Zara', 'Noah', 'Priya', 'Diego', 'Amara', 'Yuki', 'Ravi', 'Lena', 'Omar'] as const;
const SOCCER_OBJ = ['cones', 'balls', 'shin guards', 'pennies', 'water bottles', 'jerseys'] as const;
const NEUTRAL_OBJ = ['stickers', 'pencils', 'books', 'markers', 'snacks', 'marbles'] as const;

export function generateWordProblems(version = 'v1', seed = 1337, count = 900): BankItem[] {
  const rng = makeRng(seed ^ 0x19f0a8a3);
  const items: BankItem[] = [];

  const skills = [
    { tag: 'wp_mult', sub: ['single_step'] },
    { tag: 'wp_div', sub: ['single_step'] },
    { tag: 'wp_frac', sub: ['fraction_of_set'] },
    { tag: 'wp_multi_step', sub: ['two_step'] },
  ] as const;

  for (let i = 0; i < count; i++) {
    const sk = pickOne(rng, skills);
    const diff = clampDiff(1 + Math.floor(rng() * 6));
    const name = pickOne(rng, NAMES);
    const soccer = rng() < 0.55;
    const obj = soccer ? pickOne(rng, SOCCER_OBJ) : pickOne(rng, NEUTRAL_OBJ);

    let prompt = '';
    let choices: string[] | undefined;
    let correctAnswer = '';
    const qType: BankItem['questionType'] = 'word';
    let explanation = '';

    if (sk.tag === 'wp_mult') {
      const a = diff <= 2 ? pickOne(rng, [2, 3, 4, 5]) : pickOne(rng, [4, 5, 6, 7, 8]);
      const b = diff <= 2 ? pickOne(rng, [3, 4, 5, 6]) : pickOne(rng, [5, 6, 7, 8, 9]);
      const total = a * b;
      const templates = soccer
        ? [`${name} practices ${a} days. Each day they set up ${b} ${obj}. How many total?`,
           `There are ${a} teams. Each team gets ${b} ${obj}. How many ${obj} total?`,
           `${name} scores ${b} goals in each of ${a} games. How many goals total?`]
        : [`${name} has ${a} bags with ${b} ${obj} each. How many total?`,
           `There are ${a} boxes with ${b} ${obj} each. How many total?`,
           `${name} reads ${b} pages for ${a} days. How many pages total?`];
      prompt = pickOne(rng, templates);
      choices = choices4(rng, total, total + b, total - b, a + b);
      correctAnswer = String(total);
      explanation = `${a} × ${b} = ${total}.`;
    } else if (sk.tag === 'wp_div') {
      const groups = diff <= 2 ? pickOne(rng, [2, 3, 4]) : pickOne(rng, [3, 4, 5, 6]);
      const per = diff <= 2 ? pickOne(rng, [3, 4, 5, 6]) : pickOne(rng, [5, 6, 7, 8]);
      const total = groups * per;
      prompt = soccer
        ? `${total} ${obj} are shared equally among ${groups} players. How many does each player get?`
        : `${total} ${obj} shared equally among ${groups} kids. How many each?`;
      choices = choices4(rng, per, per + 1, per - 1, groups);
      correctAnswer = String(per);
      explanation = `${total} ÷ ${groups} = ${per}.`;
    } else if (sk.tag === 'wp_frac') {
      if (diff < 2) { continue; }
      const den = diff <= 3 ? pickOne(rng, [2, 3, 4]) : pickOne(rng, [4, 5, 6, 8]);
      const num = diff <= 3 ? 1 : pickOne(rng, [1, 2, 3]);
      const total = den * pickOne(rng, [2, 3, 4, 5]);
      const ans = (total / den) * num;
      prompt = soccer
        ? `${num}/${den} of ${name}'s ${total} ${obj} are red. How many red ${obj}?`
        : `${num}/${den} of ${total} ${obj} are new. How many new ${obj}?`;
      choices = choices4(rng, ans, ans + 1, ans - 1, total / den);
      correctAnswer = String(ans);
      explanation = `${total} ÷ ${den} = ${total / den}. × ${num} = ${ans}.`;
    } else {
      // multi-step — D4+
      if (diff < 4) { continue; }
      const a = pickOne(rng, [3, 4, 5, 6]);
      const b = pickOne(rng, [4, 5, 6, 7]);
      const c = pickOne(rng, [2, 3, 4, 5]);
      const useAdd = rng() < 0.6;
      const ans = useAdd ? a * b + c : a * b - c;
      if (ans <= 0) { continue; }
      prompt = useAdd
        ? `${name} buys ${a} packs of ${b} ${obj}, then gets ${c} more. Total ${obj}?`
        : `${name} has ${a} bags of ${b} ${obj} but gives away ${c}. How many left?`;
      choices = choices4(rng, ans, a * b, ans + c, ans - c);
      correctAnswer = String(ans);
      explanation = useAdd
        ? `${a} × ${b} = ${a * b}. + ${c} = ${ans}.`
        : `${a} × ${b} = ${a * b}. - ${c} = ${ans}.`;
    }

    const subTags = [...sk.sub, soccer ? 'soccer' : 'neutral'];
    const id = formatId([sk.tag, `d${diff}`, version, String(i + 1).padStart(4, '0')]);
    const hash = computeHash({ domain: 'word_problems', skillTag: sk.tag, questionType: qType, prompt, choices, correctAnswer });

    items.push({
      id, version, domain: 'word_problems', skillTag: sk.tag,
      subskillTags: subTags, gradeBand: gradeBand(diff),
      questionType: qType, globalDifficulty: diff, skillDifficulty: diff,
      prompt, choices, correctAnswer, explanation, source: SOURCE, hash,
    });
  }

  return items;
}
