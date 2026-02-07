#!/usr/bin/env node
/* eslint-disable no-console */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { generateQuestionBankFiles } from '../src/modules/question-bank/generateBank.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const version = process.env.QB_VERSION ?? 'v1';
const seed = Number(process.env.QB_SEED ?? '1337');
const outDir = resolve(__dirname, '..', '..', '..', 'packages', 'question-bank', version);

console.log(`[question-bank] generating: version=${version} seed=${seed}`);
console.log(`[question-bank] output: ${outDir}`);

const manifest = generateQuestionBankFiles({ version, seed, outDir });

console.log(`[question-bank] done:`, manifest.totals);
