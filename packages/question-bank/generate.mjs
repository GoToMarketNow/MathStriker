#!/usr/bin/env node
/**
 * Math Striker Question Bank Generator v1
 * Generates 200+ questions per domain in NDJSON format
 * Run: node generate.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'v1');

// ─── Helpers ────────────────────────────────────────
let counter = 0;
const uid = (prefix) => `${prefix}_${String(++counter).padStart(4, '0')}`;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const unique4 = (correct, generator) => {
  const s = new Set([String(correct)]);
  while (s.size < 4) s.add(String(generator()));
  return shuffle([...s]);
};

const names = ['Alex', 'Jordan', 'Mia', 'Liam', 'Addie', 'Kai', 'Zara', 'Noah', 'Priya', 'Diego', 'Amara', 'Yuki', 'Ravi', 'Lena', 'Omar'];

// ─── MULTIPLICATION ─────────────────────────────────
function genMultiplication() {
  const qs = [];

  // D1: facts 0-5 (both orderings)
  for (let a = 0; a <= 5; a++) {
    for (let b = 0; b <= 5; b++) {
      const ans = a * b;
      qs.push({
        id: uid('mult_facts_d1'), version: 'v1', domain: 'multiplication',
        skillTag: 'mult_facts', subskillTags: ['facts_0_5'], gradeBand: '2',
        questionType: 'mcq_single', globalDifficulty: 1, skillDifficulty: 1,
        prompt: `What is ${a} × ${b}?`,
        choices: unique4(ans, () => Math.max(0, ans + pick([-2, -1, 1, 2, 3, 5]))),
        correctAnswer: String(ans),
        explanation: `${a} groups of ${b} is ${ans}.`
      });
    }
  }

  // D2: facts 0-10
  for (let a = 2; a <= 10; a++) {
    for (let b = 2; b <= 10; b++) {
      if (a < b || (a <= 5 && b <= 5)) continue;
      const ans = a * b;
      qs.push({
        id: uid('mult_facts_d2'), version: 'v1', domain: 'multiplication',
        skillTag: 'mult_facts', subskillTags: ['facts_6_9'], gradeBand: '2-3',
        questionType: 'mcq_single', globalDifficulty: 2, skillDifficulty: 2,
        prompt: `What is ${a} × ${b}?`,
        choices: unique4(ans, () => ans + pick([-3, -2, -1, 1, 2, 3, 6, 10])),
        correctAnswer: String(ans),
        explanation: `${a} × ${b} = ${ans}. Think of ${a} groups of ${b}.`
      });
    }
  }

  // D3: facts 0-12 + missing factor
  for (let a = 7; a <= 12; a++) {
    for (let b = 7; b <= 12; b++) {
      if (a < b) continue;
      const ans = a * b;
      qs.push({
        id: uid('mult_facts_d3'), version: 'v1', domain: 'multiplication',
        skillTag: 'mult_facts', subskillTags: ['facts_10_12'], gradeBand: '3',
        questionType: 'mcq_single', globalDifficulty: 3, skillDifficulty: 3,
        prompt: `What is ${a} × ${b}?`,
        choices: unique4(ans, () => ans + pick([-5, -3, -1, 1, 2, 4, 6])),
        correctAnswer: String(ans),
        explanation: `${a} × ${b} = ${ans}.`
      });
    }
  }

  // D3: missing factor
  for (let i = 0; i < 25; i++) {
    const a = pick([3, 4, 5, 6, 7, 8, 9]);
    const b = pick([3, 4, 5, 6, 7, 8]);
    const prod = a * b;
    qs.push({
      id: uid('mult_missing_d3'), version: 'v1', domain: 'multiplication',
      skillTag: 'mult_missing_factor', subskillTags: ['missing_first'], gradeBand: '3',
      questionType: 'mcq_single', globalDifficulty: 3, skillDifficulty: 3,
      prompt: `□ × ${b} = ${prod}. What number goes in the box?`,
      choices: unique4(a, () => a + pick([-2, -1, 1, 2, 3])),
      correctAnswer: String(a),
      explanation: `${a} × ${b} = ${prod}, so the missing number is ${a}.`
    });
  }

  // D4: arrays visual
  for (let i = 0; i < 20; i++) {
    const rows = pick([2, 3, 4, 5, 6]);
    const cols = pick([3, 4, 5, 6, 7]);
    const ans = rows * cols;
    qs.push({
      id: uid('mult_arrays_d4'), version: 'v1', domain: 'multiplication',
      skillTag: 'mult_arrays', subskillTags: ['array_model'], gradeBand: '3-4',
      questionType: 'visual', globalDifficulty: 4, skillDifficulty: 4,
      prompt: `How many dots are in this array?`,
      choices: unique4(ans, () => ans + pick([-4, -2, -1, 1, 2, 3, 5])),
      correctAnswer: String(ans),
      visual: { type: 'arraysMultiplication', rows, cols },
      explanation: `${rows} rows × ${cols} columns = ${ans} dots total.`
    });
  }

  // D4: compare
  for (let i = 0; i < 15; i++) {
    const a1 = pick([6, 7, 8, 9]); const b1 = pick([5, 6, 7, 8]);
    const a2 = pick([5, 6, 7, 8]); const b2 = pick([6, 7, 8, 9]);
    const p1 = a1 * b1; const p2 = a2 * b2;
    if (p1 === p2) continue;
    const bigger = p1 > p2 ? `${a1} × ${b1}` : `${a2} × ${b2}`;
    qs.push({
      id: uid('mult_compare_d4'), version: 'v1', domain: 'multiplication',
      skillTag: 'mult_compare', subskillTags: ['greater_less'], gradeBand: '3-4',
      questionType: 'mcq_single', globalDifficulty: 4, skillDifficulty: 4,
      prompt: `Which is greater: ${a1} × ${b1} or ${a2} × ${b2}?`,
      choices: [`${a1} × ${b1}`, `${a2} × ${b2}`, 'They are equal'],
      correctAnswer: bigger,
      explanation: `${a1} × ${b1} = ${p1} and ${a2} × ${b2} = ${p2}. ${bigger} is greater.`
    });
  }

  // D5: multi-step
  for (let i = 0; i < 15; i++) {
    const a = pick([4, 5, 6, 7, 8]); const b = pick([3, 4, 5, 6]);
    const c = pick([2, 3, 4, 5]);
    const ans = a * b + c;
    qs.push({
      id: uid('mult_multistep_d5'), version: 'v1', domain: 'multiplication',
      skillTag: 'mult_facts', subskillTags: ['facts_6_9'], gradeBand: '4',
      questionType: 'mcq_single', globalDifficulty: 5, skillDifficulty: 5,
      prompt: `What is (${a} × ${b}) + ${c}?`,
      choices: unique4(ans, () => ans + pick([-5, -3, -1, 1, 2, 4])),
      correctAnswer: String(ans),
      explanation: `First: ${a} × ${b} = ${a * b}. Then add ${c}: ${a * b} + ${c} = ${ans}.`
    });
  }

  // D6: distributive property
  for (let i = 0; i < 10; i++) {
    const a = pick([12, 13, 14, 15]); const b = pick([6, 7, 8]);
    const ans = a * b;
    const a1 = 10; const a2 = a - 10;
    qs.push({
      id: uid('mult_distrib_d6'), version: 'v1', domain: 'multiplication',
      skillTag: 'mult_properties', subskillTags: ['distributive'], gradeBand: '4',
      questionType: 'mcq_single', globalDifficulty: 6, skillDifficulty: 6,
      prompt: `What is ${a} × ${b}? (Hint: break ${a} into ${a1} + ${a2})`,
      choices: unique4(ans, () => ans + pick([-8, -4, -2, 2, 4, 6, 10])),
      correctAnswer: String(ans),
      explanation: `${a} × ${b} = (${a1} × ${b}) + (${a2} × ${b}) = ${a1 * b} + ${a2 * b} = ${ans}.`
    });
  }

  return qs;
}

// ─── DIVISION ───────────────────────────────────────
function genDivision() {
  const qs = [];

  // D1: simple facts within 25
  for (let d = 1; d <= 5; d++) {
    for (let q = 1; q <= 5; q++) {
      const dividend = d * q;
      qs.push({
        id: uid('div_facts_d1'), version: 'v1', domain: 'division',
        skillTag: 'div_facts', subskillTags: ['facts_small'], gradeBand: '2-3',
        questionType: 'mcq_single', globalDifficulty: 1, skillDifficulty: 1,
        prompt: `What is ${dividend} ÷ ${d}?`,
        choices: unique4(q, () => q + pick([-2, -1, 1, 2, 3])),
        correctAnswer: String(q),
        explanation: `${dividend} ÷ ${d} = ${q}. ${d} × ${q} = ${dividend}.`
      });
    }
  }

  // D2: facts within 50
  for (let d = 2; d <= 9; d++) {
    for (let q = 2; q <= Math.min(9, Math.floor(50 / d)); q++) {
      const dividend = d * q;
      qs.push({
        id: uid('div_facts_d2'), version: 'v1', domain: 'division',
        skillTag: 'div_facts', subskillTags: ['facts_large'], gradeBand: '3',
        questionType: 'mcq_single', globalDifficulty: 2, skillDifficulty: 2,
        prompt: `What is ${dividend} ÷ ${d}?`,
        choices: unique4(q, () => Math.max(1, q + pick([-3, -1, 1, 2, 4]))),
        correctAnswer: String(q),
        explanation: `${dividend} ÷ ${d} = ${q}. Think: ${d} × ? = ${dividend}.`
      });
    }
  }

  // D3: facts within 100
  for (let d = 6; d <= 12; d++) {
    for (let q = 6; q <= Math.min(12, Math.floor(100 / d)); q++) {
      const dividend = d * q;
      qs.push({
        id: uid('div_facts_d3'), version: 'v1', domain: 'division',
        skillTag: 'div_facts', subskillTags: ['facts_large'], gradeBand: '3-4',
        questionType: 'mcq_single', globalDifficulty: 3, skillDifficulty: 3,
        prompt: `What is ${dividend} ÷ ${d}?`,
        choices: unique4(q, () => q + pick([-3, -2, -1, 1, 2, 3])),
        correctAnswer: String(q),
        explanation: `${dividend} ÷ ${d} = ${q}.`
      });
    }
  }

  // D3: sharing/grouping interpretation
  for (let i = 0; i < 20; i++) {
    const total = pick([12, 15, 18, 20, 24, 30]);
    const groups = pick([2, 3, 4, 5, 6]);
    if (total % groups !== 0) continue;
    const each = total / groups;
    const isSharing = Math.random() > 0.5;
    qs.push({
      id: uid('div_interp_d3'), version: 'v1', domain: 'division',
      skillTag: 'div_interpretation', subskillTags: [isSharing ? 'sharing' : 'grouping'], gradeBand: '3',
      questionType: 'mcq_single', globalDifficulty: 3, skillDifficulty: 3,
      prompt: isSharing
        ? `${total} stickers shared equally among ${groups} friends. How many each?`
        : `${total} balls put into groups of ${groups}. How many groups?`,
      choices: unique4(isSharing ? each : total / groups, () => each + pick([-2, -1, 1, 2, 3])),
      correctAnswer: String(isSharing ? each : total / groups),
      explanation: `${total} ÷ ${groups} = ${each}.`
    });
  }

  // D4: inverse multiplication
  for (let i = 0; i < 20; i++) {
    const a = pick([4, 5, 6, 7, 8, 9]);
    const b = pick([3, 4, 5, 6, 7, 8]);
    const prod = a * b;
    qs.push({
      id: uid('div_inverse_d4'), version: 'v1', domain: 'division',
      skillTag: 'div_inverse', subskillTags: ['fact_family'], gradeBand: '3-4',
      questionType: 'mcq_single', globalDifficulty: 4, skillDifficulty: 4,
      prompt: `If ${a} × ${b} = ${prod}, what is ${prod} ÷ ${a}?`,
      choices: unique4(b, () => b + pick([-2, -1, 1, 2])),
      correctAnswer: String(b),
      explanation: `Since ${a} × ${b} = ${prod}, then ${prod} ÷ ${a} = ${b}.`
    });
  }

  // D5: remainders
  for (let i = 0; i < 25; i++) {
    const divisor = pick([3, 4, 5, 6, 7]);
    const quotient = pick([4, 5, 6, 7, 8, 9]);
    const remainder = pick([1, 2, 3].filter(r => r < divisor));
    const dividend = divisor * quotient + remainder;
    const ans = `${quotient} R${remainder}`;
    qs.push({
      id: uid('div_remain_d5'), version: 'v1', domain: 'division',
      skillTag: 'div_remainders', subskillTags: ['simple_remainder'], gradeBand: '4',
      questionType: 'mcq_single', globalDifficulty: 5, skillDifficulty: 5,
      prompt: `What is ${dividend} ÷ ${divisor}?`,
      choices: [`${quotient} R${remainder}`, `${quotient}`, `${quotient + 1}`, `${quotient} R${(remainder + 1) % divisor}`],
      correctAnswer: ans,
      explanation: `${divisor} × ${quotient} = ${divisor * quotient}. ${dividend} - ${divisor * quotient} = ${remainder} left over. So ${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}.`
    });
  }

  // D6: interpret remainder in context
  for (let i = 0; i < 10; i++) {
    const total = pick([25, 29, 31, 34, 37, 43]);
    const perGroup = pick([4, 5, 6]);
    const quotient = Math.floor(total / perGroup);
    const remainder = total % perGroup;
    if (remainder === 0) continue;
    const ans = quotient + 1; // need extra group
    qs.push({
      id: uid('div_context_d6'), version: 'v1', domain: 'division',
      skillTag: 'div_remainders', subskillTags: ['interpret_remainder'], gradeBand: '4',
      questionType: 'mcq_single', globalDifficulty: 6, skillDifficulty: 6,
      prompt: `${total} players need to ride in vans. Each van fits ${perGroup} players. How many vans are needed?`,
      choices: unique4(ans, () => ans + pick([-2, -1, 1, 2])),
      correctAnswer: String(ans),
      explanation: `${total} ÷ ${perGroup} = ${quotient} R${remainder}. The ${remainder} extra players need another van, so ${ans} vans total.`
    });
  }

  return qs;
}

// ─── FRACTIONS ──────────────────────────────────────
function genFractions() {
  const qs = [];

  // D1: identify halves and fourths from bar
  for (const denom of [2, 4]) {
    for (let shaded = 1; shaded <= denom; shaded++) {
      qs.push({
        id: uid('frac_id_d1'), version: 'v1', domain: 'fractions',
        skillTag: 'frac_identify', subskillTags: ['from_bar'], gradeBand: '2',
        questionType: 'visual', globalDifficulty: 1, skillDifficulty: 1,
        prompt: 'What fraction of the bar is shaded?',
        choices: Array.from({ length: denom }, (_, i) => `${i + 1}/${denom}`),
        correctAnswer: `${shaded}/${denom}`,
        visual: { type: 'fractionBars', parts: denom, shaded },
        explanation: `The bar is split into ${denom} equal parts. ${shaded} are shaded, so it's ${shaded}/${denom}.`
      });
      // Circle variant
      qs.push({
        id: uid('frac_id_d1_circ'), version: 'v1', domain: 'fractions',
        skillTag: 'frac_identify', subskillTags: ['from_circle'], gradeBand: '2',
        questionType: 'visual', globalDifficulty: 1, skillDifficulty: 1,
        prompt: 'What fraction of the circle is shaded?',
        choices: Array.from({ length: denom }, (_, i) => `${i + 1}/${denom}`),
        correctAnswer: `${shaded}/${denom}`,
        visual: { type: 'fractionCircle', parts: denom, shaded },
        explanation: `The circle has ${denom} equal slices. ${shaded} are shaded = ${shaded}/${denom}.`
      });
    }
  }

  // D2: identify thirds, sixths, eighths, fifths
  for (const denom of [3, 5, 6, 8]) {
    for (let shaded = 1; shaded < denom; shaded++) {
      qs.push({
        id: uid('frac_id_d2'), version: 'v1', domain: 'fractions',
        skillTag: 'frac_identify', subskillTags: ['from_bar'], gradeBand: '2-3',
        questionType: 'visual', globalDifficulty: 2, skillDifficulty: 2,
        prompt: 'What fraction of the bar is shaded?',
        choices: [`${shaded}/${denom}`, `${Math.min(shaded + 1, denom - 1)}/${denom}`, `${shaded}/${denom + 1}`, `${Math.max(1, shaded - 1)}/${denom}`],
        correctAnswer: `${shaded}/${denom}`,
        visual: { type: 'fractionBars', parts: denom, shaded },
        explanation: `${denom} equal parts, ${shaded} shaded = ${shaded}/${denom}.`
      });
    }
  }
  // D2 circle variants
  for (const denom of [3, 5, 6]) {
    for (let shaded = 1; shaded <= Math.ceil(denom / 2); shaded++) {
      qs.push({
        id: uid('frac_id_d2_circ'), version: 'v1', domain: 'fractions',
        skillTag: 'frac_identify', subskillTags: ['from_circle'], gradeBand: '2-3',
        questionType: 'visual', globalDifficulty: 2, skillDifficulty: 2,
        prompt: 'What fraction of the circle is shaded?',
        choices: [`${shaded}/${denom}`, `${Math.min(shaded + 1, denom)}/${denom}`, `${shaded}/${denom + 1}`, `${Math.max(1, shaded - 1)}/${denom}`],
        correctAnswer: `${shaded}/${denom}`,
        visual: { type: 'fractionCircle', parts: denom, shaded },
        explanation: `${denom} equal slices, ${shaded} shaded = ${shaded}/${denom}.`
      });
    }
  }

  // D3: equivalent fractions
  const equivPairs = [
    [1, 2, 2, 4], [1, 2, 3, 6], [1, 3, 2, 6], [2, 3, 4, 6], [1, 4, 2, 8],
    [2, 4, 1, 2], [3, 6, 1, 2], [1, 2, 4, 8], [2, 3, 6, 9], [3, 4, 6, 8],
    [1, 3, 3, 9], [2, 5, 4, 10], [1, 4, 3, 12], [3, 5, 6, 10], [1, 6, 2, 12],
    [2, 4, 3, 6], [1, 5, 2, 10], [4, 6, 2, 3], [2, 8, 1, 4], [3, 9, 1, 3],
  ];
  for (const [n1, d1, n2, d2] of equivPairs) {
    qs.push({
      id: uid('frac_equiv_d3'), version: 'v1', domain: 'fractions',
      skillTag: 'frac_equivalent', subskillTags: ['general'], gradeBand: '3',
      questionType: 'mcq_single', globalDifficulty: 3, skillDifficulty: 3,
      prompt: `Which fraction is equal to ${n1}/${d1}?`,
      choices: shuffle([`${n2}/${d2}`, `${n2 + 1}/${d2}`, `${n1}/${d1 + 1}`, `${n2}/${d2 + 2}`]),
      correctAnswer: `${n2}/${d2}`,
      explanation: `${n1}/${d1} = ${n2}/${d2} because both represent the same amount.`
    });
  }

  // D3: compare fractions (same denominator)
  for (let i = 0; i < 30; i++) {
    const d = pick([3, 4, 5, 6, 8]);
    const n1 = pick(Array.from({ length: d - 1 }, (_, i) => i + 1));
    let n2 = pick(Array.from({ length: d - 1 }, (_, i) => i + 1));
    if (n1 === n2) n2 = Math.min(n1 + 1, d - 1);
    const bigger = n1 > n2 ? `${n1}/${d}` : `${n2}/${d}`;
    qs.push({
      id: uid('frac_compare_d3'), version: 'v1', domain: 'fractions',
      skillTag: 'frac_compare', subskillTags: ['same_denom'], gradeBand: '3',
      questionType: 'mcq_single', globalDifficulty: 3, skillDifficulty: 3,
      prompt: `Which is greater: ${n1}/${d} or ${n2}/${d}?`,
      choices: [`${n1}/${d}`, `${n2}/${d}`, 'They are equal'],
      correctAnswer: bigger,
      explanation: `With the same denominator (${d}), the bigger numerator means a bigger fraction. ${bigger} is greater.`
    });
  }

  // D4: number line
  for (let i = 0; i < 30; i++) {
    const d = pick([2, 3, 4, 5, 8]);
    const n = pick(Array.from({ length: d }, (_, i) => i + 1));
    qs.push({
      id: uid('frac_numline_d4'), version: 'v1', domain: 'fractions',
      skillTag: 'frac_numberline', subskillTags: ['identify'], gradeBand: '3-4',
      questionType: 'visual', globalDifficulty: 4, skillDifficulty: 4,
      prompt: `What fraction does the arrow point to on the number line?`,
      choices: [`${n}/${d}`, `${Math.max(1, n - 1)}/${d}`, `${n}/${d + 1}`, `${Math.min(n + 1, d)}/${d}`],
      correctAnswer: `${n}/${d}`,
      visual: { type: 'numberLine', min: 0, max: 1, divisions: d, marked: n },
      explanation: `The number line is divided into ${d} equal parts. The arrow points to ${n}/${d}.`
    });
  }

  // D5: fraction of a set
  for (let i = 0; i < 35; i++) {
    const d = pick([2, 3, 4, 5, 8]);
    const n = pick(Array.from({ length: d - 1 }, (_, i) => i + 1));
    const setSize = d * pick([2, 3, 4, 5]);
    const ans = (n / d) * setSize;
    qs.push({
      id: uid('frac_of_set_d5'), version: 'v1', domain: 'fractions',
      skillTag: 'frac_of_set', subskillTags: [n === 1 ? 'unit_fraction' : 'non_unit'], gradeBand: '4',
      questionType: 'mcq_single', globalDifficulty: 5, skillDifficulty: 5,
      prompt: `What is ${n}/${d} of ${setSize}?`,
      choices: unique4(ans, () => ans + pick([-4, -2, -1, 1, 2, 4])),
      correctAnswer: String(ans),
      explanation: `${setSize} ÷ ${d} = ${setSize / d}. Then ${setSize / d} × ${n} = ${ans}.`
    });
  }

  // D6: compare fractions different denominators
  for (let i = 0; i < 25; i++) {
    const d1 = pick([3, 4, 5, 6]);
    const d2 = pick([3, 4, 5, 8].filter(x => x !== d1));
    const n1 = pick(Array.from({ length: d1 - 1 }, (_, i) => i + 1));
    const n2 = pick(Array.from({ length: d2 - 1 }, (_, i) => i + 1));
    const v1 = n1 / d1; const v2 = n2 / d2;
    if (Math.abs(v1 - v2) < 0.01) continue;
    const bigger = v1 > v2 ? `${n1}/${d1}` : `${n2}/${d2}`;
    qs.push({
      id: uid('frac_compare_d6'), version: 'v1', domain: 'fractions',
      skillTag: 'frac_compare', subskillTags: ['benchmark_half'], gradeBand: '4',
      questionType: 'mcq_single', globalDifficulty: 6, skillDifficulty: 6,
      prompt: `Which is greater: ${n1}/${d1} or ${n2}/${d2}?`,
      choices: [`${n1}/${d1}`, `${n2}/${d2}`, 'They are equal'],
      correctAnswer: bigger,
      explanation: `${n1}/${d1} ≈ ${v1.toFixed(2)} and ${n2}/${d2} ≈ ${v2.toFixed(2)}. ${bigger} is greater.`
    });
  }

  return qs;
}

// ─── PATTERNS ───────────────────────────────────────
function genPatterns() {
  const qs = [];

  // D1: simple skip counting
  for (const step of [2, 5, 10]) {
    for (let start = 0; start <= 10; start += step || 1) {
      const seq = Array.from({ length: 4 }, (_, i) => start + step * i);
      const ans = start + step * 4;
      qs.push({
        id: uid('pat_skip_d1'), version: 'v1', domain: 'patterns',
        skillTag: 'pattern_number', subskillTags: ['skip_count'], gradeBand: '2',
        questionType: 'mcq_single', globalDifficulty: 1, skillDifficulty: 1,
        prompt: `What comes next? ${seq.join(', ')}, ?`,
        choices: unique4(ans, () => ans + pick([-step, -1, 1, step, step * 2])),
        correctAnswer: String(ans),
        explanation: `The pattern adds ${step} each time. ${seq[3]} + ${step} = ${ans}.`
      });
      if (qs.length > 15 && step === 10) break;
    }
  }

  // D2: skip counting by 3, 4, 6
  for (const step of [3, 4, 6]) {
    for (let start = step; start <= step * 3; start += step) {
      const seq = Array.from({ length: 4 }, (_, i) => start + step * i);
      const ans = start + step * 4;
      qs.push({
        id: uid('pat_skip_d2'), version: 'v1', domain: 'patterns',
        skillTag: 'pattern_number', subskillTags: ['skip_count'], gradeBand: '2-3',
        questionType: 'mcq_single', globalDifficulty: 2, skillDifficulty: 2,
        prompt: `What comes next? ${seq.join(', ')}, ?`,
        choices: unique4(ans, () => ans + pick([-3, -1, 1, 2, step])),
        correctAnswer: String(ans),
        explanation: `Adding ${step} each time: ${seq[3]} + ${step} = ${ans}.`
      });
    }
  }

  // D3: growing patterns
  for (let i = 0; i < 30; i++) {
    const start = pick([1, 2, 3]);
    const step = pick([3, 4, 5, 7]);
    const seq = Array.from({ length: 5 }, (_, i) => start + step * i);
    const ans = start + step * 5;
    qs.push({
      id: uid('pat_grow_d3'), version: 'v1', domain: 'patterns',
      skillTag: 'pattern_number', subskillTags: ['growing'], gradeBand: '3',
      questionType: 'mcq_single', globalDifficulty: 3, skillDifficulty: 3,
      prompt: `What comes next? ${seq.join(', ')}, ?`,
      choices: unique4(ans, () => ans + pick([-step, -2, -1, 1, 2, step])),
      correctAnswer: String(ans),
      explanation: `The rule is: add ${step}. ${seq[4]} + ${step} = ${ans}.`
    });
  }

  // D3: decreasing patterns
  for (let i = 0; i < 25; i++) {
    const start = pick([50, 40, 36, 30, 28]);
    const step = pick([2, 3, 4, 5]);
    const seq = Array.from({ length: 5 }, (_, i) => start - step * i);
    const ans = start - step * 5;
    qs.push({
      id: uid('pat_decr_d3'), version: 'v1', domain: 'patterns',
      skillTag: 'pattern_number', subskillTags: ['decreasing'], gradeBand: '3',
      questionType: 'mcq_single', globalDifficulty: 3, skillDifficulty: 3,
      prompt: `What comes next? ${seq.join(', ')}, ?`,
      choices: unique4(ans, () => ans + pick([-3, -1, 1, 2, step])),
      correctAnswer: String(ans),
      explanation: `Subtract ${step} each time: ${seq[4]} - ${step} = ${ans}.`
    });
  }

  // D4: find the rule (multi-select)
  for (let i = 0; i < 20; i++) {
    const step = pick([3, 4, 5, 6]);
    const seq = Array.from({ length: 5 }, (_, i) => step * (i + 1));
    qs.push({
      id: uid('pat_rule_d4'), version: 'v1', domain: 'patterns',
      skillTag: 'pattern_rule', subskillTags: ['additive'], gradeBand: '3-4',
      questionType: 'mcq_multi', globalDifficulty: 4, skillDifficulty: 4,
      prompt: `Select ALL rules that match: ${seq.join(', ')}`,
      choices: [`Add ${step} each time`, `Multiply by 2 each time`, `Counting by ${step}s`, `Counting by ${step - 1}s`],
      correctAnswer: [`Add ${step} each time`, `Counting by ${step}s`],
      explanation: `Each number is ${step} more than the last, which is counting by ${step}s.`
    });
  }

  // D4: function machine (single op)
  for (let i = 0; i < 30; i++) {
    const op = pick(['+', '×']);
    const val = op === '+' ? pick([3, 4, 5, 7, 10]) : pick([2, 3, 4, 5]);
    const inputs = [1, 2, 3, 5];
    const outputs = inputs.map(x => op === '+' ? x + val : x * val);
    const testIn = pick([4, 6, 7]);
    const ans = op === '+' ? testIn + val : testIn * val;
    qs.push({
      id: uid('pat_func_d4'), version: 'v1', domain: 'patterns',
      skillTag: 'function_machine', subskillTags: ['single_op'], gradeBand: '3-4',
      questionType: 'mcq_single', globalDifficulty: 4, skillDifficulty: 4,
      prompt: `In → Out: ${inputs.map((inp, j) => `${inp}→${outputs[j]}`).join(', ')}. If In = ${testIn}, Out = ?`,
      choices: unique4(ans, () => ans + pick([-3, -1, 1, 2, 4])),
      correctAnswer: String(ans),
      explanation: `The rule is: ${op === '+' ? 'add' : 'multiply by'} ${val}. ${testIn} ${op} ${val} = ${ans}.`
    });
  }

  // D5: two-op function machine
  for (let i = 0; i < 25; i++) {
    const m = pick([2, 3]); const a = pick([1, 2, 3]);
    const inputs = [1, 2, 3, 4];
    const outputs = inputs.map(x => x * m + a);
    const testIn = pick([5, 6, 7]);
    const ans = testIn * m + a;
    qs.push({
      id: uid('pat_func2_d5'), version: 'v1', domain: 'patterns',
      skillTag: 'function_machine', subskillTags: ['two_op'], gradeBand: '4',
      questionType: 'mcq_single', globalDifficulty: 5, skillDifficulty: 5,
      prompt: `In → Out: ${inputs.map((inp, j) => `${inp}→${outputs[j]}`).join(', ')}. If In = ${testIn}, Out = ?`,
      choices: unique4(ans, () => ans + pick([-4, -2, -1, 1, 2, 3])),
      correctAnswer: String(ans),
      explanation: `The rule is: multiply by ${m}, then add ${a}. ${testIn} × ${m} + ${a} = ${ans}.`
    });
  }

  // D6: multiplicative patterns
  for (let i = 0; i < 15; i++) {
    const base = pick([2, 3]);
    const seq = Array.from({ length: 5 }, (_, i) => base ** (i + 1));
    const ans = base ** 6;
    qs.push({
      id: uid('pat_mult_d6'), version: 'v1', domain: 'patterns',
      skillTag: 'pattern_rule', subskillTags: ['multiplicative'], gradeBand: '4',
      questionType: 'mcq_single', globalDifficulty: 6, skillDifficulty: 6,
      prompt: `What comes next? ${seq.join(', ')}, ?`,
      choices: unique4(ans, () => ans + pick([-10, -5, 5, 10, base ** 5])),
      correctAnswer: String(ans),
      explanation: `Each number is multiplied by ${base}. ${seq[4]} × ${base} = ${ans}.`
    });
  }

  return qs;
}

// ─── WORD PROBLEMS ──────────────────────────────────
function genWordProblems() {
  const qs = [];

  // D1: simple multiplication word problems
  for (let i = 0; i < 30; i++) {
    const a = pick([2, 3, 4, 5]);
    const b = pick([2, 3, 4, 5]);
    const ans = a * b;
    const name = pick(names);
    const templates = [
      `${name} has ${a} bags with ${b} apples in each bag. How many apples in all?`,
      `There are ${a} teams. Each team has ${b} players. How many players total?`,
      `${name} reads ${b} pages every day for ${a} days. How many pages?`,
    ];
    qs.push({
      id: uid('wp_mult_d1'), version: 'v1', domain: 'word_problems',
      skillTag: 'wp_mult', subskillTags: ['equal_groups'], gradeBand: '2',
      questionType: 'word', globalDifficulty: 1, skillDifficulty: 1,
      prompt: pick(templates),
      choices: unique4(ans, () => ans + pick([-3, -1, 1, 2, 5])),
      correctAnswer: String(ans),
      explanation: `${a} × ${b} = ${ans}.`
    });
  }

  // D2: multiplication WP with bigger numbers
  for (let i = 0; i < 35; i++) {
    const a = pick([3, 4, 5, 6, 7]);
    const b = pick([4, 5, 6, 7, 8]);
    const ans = a * b;
    const name = pick(names);
    const templates = [
      `${name} scores ${b} goals in each of ${a} games. How many goals total?`,
      `A team has ${a} rows of ${b} seats. How many seats?`,
      `${name} packs ${b} water bottles for each of ${a} practice days. How many bottles?`,
      `There are ${a} boxes with ${b} soccer balls each. Total balls?`,
    ];
    qs.push({
      id: uid('wp_mult_d2'), version: 'v1', domain: 'word_problems',
      skillTag: 'wp_mult', subskillTags: ['equal_groups'], gradeBand: '2-3',
      questionType: 'word', globalDifficulty: 2, skillDifficulty: 2,
      prompt: pick(templates),
      choices: unique4(ans, () => ans + pick([-5, -2, -1, 1, 3, 5])),
      correctAnswer: String(ans),
      explanation: `${a} × ${b} = ${ans}.`
    });
  }

  // D3: division word problems
  for (let i = 0; i < 35; i++) {
    const groups = pick([3, 4, 5, 6]);
    const each = pick([3, 4, 5, 6, 7]);
    const total = groups * each;
    const name = pick(names);
    const templates = [
      `${name} has ${total} stickers to share equally among ${groups} friends. How many does each get?`,
      `${total} players are split into ${groups} equal teams. How many on each team?`,
      `A coach puts ${total} cones into ${groups} equal rows. How many per row?`,
    ];
    qs.push({
      id: uid('wp_div_d3'), version: 'v1', domain: 'word_problems',
      skillTag: 'wp_div', subskillTags: ['sharing_context'], gradeBand: '3',
      questionType: 'word', globalDifficulty: 3, skillDifficulty: 3,
      prompt: pick(templates),
      choices: unique4(each, () => each + pick([-3, -1, 1, 2, 4])),
      correctAnswer: String(each),
      explanation: `${total} ÷ ${groups} = ${each}.`
    });
  }

  // D3: fraction word problems
  for (let i = 0; i < 30; i++) {
    const denom = pick([2, 3, 4]);
    const total = denom * pick([3, 4, 5, 6]);
    const numer = 1;
    const ans = total / denom;
    const name = pick(names);
    qs.push({
      id: uid('wp_frac_d3'), version: 'v1', domain: 'word_problems',
      skillTag: 'wp_frac', subskillTags: ['part_of_set'], gradeBand: '3',
      questionType: 'word', globalDifficulty: 3, skillDifficulty: 3,
      prompt: `${name} has ${total} marbles. ${numer}/${denom} of them are blue. How many blue marbles?`,
      choices: unique4(ans, () => ans + pick([-2, -1, 1, 2, 3])),
      correctAnswer: String(ans),
      explanation: `${total} ÷ ${denom} = ${ans} blue marbles.`
    });
  }

  // D4: two-sentence word problems
  for (let i = 0; i < 35; i++) {
    const a = pick([3, 4, 5, 6]);
    const b = pick([4, 5, 6, 7]);
    const extra = pick([2, 3, 5]);
    const ans = a * b + extra;
    const name = pick(names);
    const templates = [
      `${name} buys ${a} packs of ${b} trading cards. Then gets ${extra} bonus cards. Total cards?`,
      `A team practices ${a} days a week, doing ${b} drills each day. They add ${extra} extra drills on Friday. How many drills that week?`,
      `${name} has ${a} shelves with ${b} books each, plus ${extra} more on the desk. How many books?`,
    ];
    qs.push({
      id: uid('wp_twostep_d4'), version: 'v1', domain: 'word_problems',
      skillTag: 'wp_multi_step', subskillTags: ['two_step'], gradeBand: '3-4',
      questionType: 'word', globalDifficulty: 4, skillDifficulty: 4,
      prompt: pick(templates),
      choices: unique4(ans, () => ans + pick([-5, -2, -1, 1, 3, 5])),
      correctAnswer: String(ans),
      explanation: `First: ${a} × ${b} = ${a * b}. Then add ${extra}: ${a * b} + ${extra} = ${ans}.`
    });
  }

  // D5: multi-step with division
  for (let i = 0; i < 30; i++) {
    const total = pick([24, 30, 36, 40, 48]);
    const groups = pick([3, 4, 5, 6]);
    if (total % groups !== 0) continue;
    const each = total / groups;
    const extra = pick([2, 3, 4]);
    const ans = each + extra;
    const name = pick(names);
    qs.push({
      id: uid('wp_multi_d5'), version: 'v1', domain: 'word_problems',
      skillTag: 'wp_multi_step', subskillTags: ['mixed_ops'], gradeBand: '4',
      questionType: 'word', globalDifficulty: 5, skillDifficulty: 5,
      prompt: `${name} shares ${total} stickers among ${groups} friends, then gets ${extra} more. How many does ${name} have now?`,
      choices: unique4(ans, () => ans + pick([-4, -2, -1, 1, 2, 3])),
      correctAnswer: String(ans),
      explanation: `${total} ÷ ${groups} = ${each}. Then ${each} + ${extra} = ${ans}.`
    });
  }

  // D6: multi-step with irrelevant info
  for (let i = 0; i < 15; i++) {
    const a = pick([5, 6, 7, 8]);
    const b = pick([4, 5, 6]);
    const c = pick([3, 4]);
    const distract = pick([12, 15, 20]);
    const ans = a * b - c;
    const name = pick(names);
    qs.push({
      id: uid('wp_adv_d6'), version: 'v1', domain: 'word_problems',
      skillTag: 'wp_multi_step', subskillTags: ['two_step'], gradeBand: '4',
      questionType: 'word', globalDifficulty: 6, skillDifficulty: 6,
      prompt: `${name}'s team has ${distract} players. They buy ${a} packs of ${b} water bottles but ${c} bottles break. How many good bottles?`,
      choices: unique4(ans, () => ans + pick([-5, -2, -1, 1, 3, distract])),
      correctAnswer: String(ans),
      explanation: `${a} × ${b} = ${a * b}. Minus ${c} broken = ${ans}. (The ${distract} players is extra info.)`
    });
  }

  return qs;
}

// ─── Generate all + write NDJSON ────────────────────
const domains = {
  multiplication: genMultiplication(),
  division: genDivision(),
  fractions: genFractions(),
  patterns: genPatterns(),
  word_problems: genWordProblems(),
};

const manifest = {
  version: 'v1',
  generatedAt: new Date().toISOString(),
  domains: {},
  totalQuestions: 0,
};

for (const [domain, questions] of Object.entries(domains)) {
  const ndjson = questions.map(q => JSON.stringify(q)).join('\n') + '\n';
  writeFileSync(join(OUT, `${domain}.ndjson`), ndjson);

  // Count by difficulty
  const byDiff = {};
  for (const q of questions) {
    byDiff[q.globalDifficulty] = (byDiff[q.globalDifficulty] || 0) + 1;
  }

  manifest.domains[domain] = {
    file: `${domain}.ndjson`,
    count: questions.length,
    byDifficulty: byDiff,
  };
  manifest.totalQuestions += questions.length;

  console.log(`✅ ${domain}: ${questions.length} questions`);
}

writeFileSync(join(OUT, 'index.json'), JSON.stringify(manifest, null, 2));
console.log(`\n📦 Total: ${manifest.totalQuestions} questions generated`);
