import { computeHash } from '../hash.js';
import {
  BankItem, SOURCE, makeRng, clampDiff, pickOne, shuffle,
  formatId, gradeBand, choices4,
} from './common.js';

export function generatePatterns(version = 'v1', seed = 1337, count = 700): BankItem[] {
  const rng = makeRng(seed ^ 0x6caa9f11);
  const items: BankItem[] = [];

  const skills = [
    { tag: 'pattern_number', sub: ['skip_counting', 'growing'] },
    { tag: 'pattern_rule', sub: ['find_rule'] },
    { tag: 'function_machine', sub: ['input_output'] },
  ] as const;

  for (let i = 0; i < count; i++) {
    const sk = pickOne(rng, skills);
    const diff = clampDiff(1 + Math.floor(rng() * 6));

    let prompt = '';
    let choices: string[] | undefined;
    let correctAnswer: string | string[] = '';
    let qType: BankItem['questionType'] = 'mcq_single';
    let visual: unknown | undefined;
    let explanation = '';

    if (sk.tag === 'pattern_number') {
      const step = diff <= 2 ? pickOne(rng, [2, 3, 5, 10]) : pickOne(rng, [3, 4, 6, 7, 8]);
      const start = diff <= 3 ? pickOne(rng, [0, 1, 2, 3]) : pickOne(rng, [5, 6, 7, 8, 10]);
      const decreasing = diff >= 4 && rng() < 0.3;
      const seq = Array.from({ length: 5 }, (_, j) => decreasing ? start * step - step * j : start + step * j);
      const next = decreasing ? start * step - step * 5 : start + step * 5;

      if (rng() < 0.5) {
        // "what comes next?"
        prompt = `What comes next? ${seq.join(', ')}, ?`;
        choices = choices4(rng, next, next + step, next - step, next + 1);
        correctAnswer = String(next);
        explanation = decreasing
          ? `Subtract ${step} each time: ${seq[4]} - ${step} = ${next}.`
          : `Add ${step} each time: ${seq[4]} + ${step} = ${next}.`;
      } else {
        // "fill in the missing number"
        const mi = 2 + Math.floor(rng() * 2); // index 2 or 3
        const missing = seq[mi];
        const shown = seq.map((n, idx) => idx === mi ? '□' : String(n)).join(', ');
        prompt = `Fill in the missing number: ${shown}`;
        choices = choices4(rng, missing, missing + step, missing - step, missing + 1);
        correctAnswer = String(missing);
        explanation = `The pattern ${decreasing ? 'subtracts' : 'adds'} ${step} each time.`;
      }
    } else if (sk.tag === 'pattern_rule') {
      qType = 'mcq_multi';
      const step = diff <= 2 ? pickOne(rng, [2, 3, 5]) : diff <= 4 ? pickOne(rng, [3, 4, 6]) : pickOne(rng, [6, 7, 8]);
      const seq = Array.from({ length: 5 }, (_, j) => step * (j + 1));
      prompt = `Select ALL rules that match: ${seq.join(', ')}`;
      const correct = [`Add ${step} each time`, `Counting by ${step}s`];
      const wrong = [`Multiply by 2 each time`, `Counting by ${step - 1}s`, `Add ${step + 1} each time`];
      choices = shuffle(rng, [...correct, ...shuffle(rng, wrong).slice(0, 2)]);
      correctAnswer = correct;
      explanation = `Each number is ${step} more than the last = counting by ${step}s.`;
    } else {
      // function machine
      qType = 'visual';
      const op = diff <= 2 ? 'add' : diff <= 4 ? pickOne(rng, ['add', 'multiply'] as const) : pickOne(rng, ['add', 'multiply', 'two_op'] as const);
      const n = diff <= 2 ? pickOne(rng, [2, 3, 4]) : diff <= 4 ? pickOne(rng, [3, 4, 5]) : pickOne(rng, [4, 5, 6]);
      const n2 = pickOne(rng, [1, 2, 3]);

      const compute = (x: number) => op === 'add' ? x + n : op === 'multiply' ? x * n : x * n + n2;
      const inputs = [1, 2, 3, 4];
      const outputs = inputs.map(compute);
      const testIn = pickOne(rng, [5, 6, 7]);
      const testOut = compute(testIn);

      prompt = `In → Out: ${inputs.map((x, j) => `${x}→${outputs[j]}`).join(', ')}. If In = ${testIn}, Out = ?`;
      visual = { type: 'functionMachine', operation: op, n, examples: inputs.map((x, j) => ({ input: x, output: outputs[j] })) };
      choices = choices4(rng, testOut, testOut + 1, testOut - 1, testOut + n);
      correctAnswer = String(testOut);
      explanation = op === 'add' ? `Add ${n}: ${testIn} + ${n} = ${testOut}.`
        : op === 'multiply' ? `Multiply by ${n}: ${testIn} × ${n} = ${testOut}.`
        : `Multiply by ${n} then add ${n2}: ${testIn} × ${n} + ${n2} = ${testOut}.`;
    }

    const id = formatId([sk.tag, `d${diff}`, version, String(i + 1).padStart(4, '0')]);
    const hash = computeHash({ domain: 'patterns', skillTag: sk.tag, questionType: qType, prompt, choices, correctAnswer, visual });

    items.push({
      id, version, domain: 'patterns', skillTag: sk.tag,
      subskillTags: [...sk.sub], gradeBand: gradeBand(diff),
      questionType: qType, globalDifficulty: diff, skillDifficulty: diff,
      prompt, choices, correctAnswer, visual, explanation, source: SOURCE, hash,
    });
  }

  return items;
}
