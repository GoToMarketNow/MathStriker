#!/usr/bin/env node
/* eslint-disable no-console */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../src/db/index.js';
import { questionBankItems } from '../src/db/schema.js';
import { count } from 'drizzle-orm';
import { generateQuestionBankFiles } from '../src/modules/question-bank/generateBank.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const version = process.env.QB_VERSION ?? 'v1';
const seed = Number(process.env.QB_SEED ?? '1337');
const outDir = resolve(__dirname, '..', '..', '..', 'packages', 'question-bank', version);

async function main() {
  // Step 1: Generate NDJSON if not skipped
  if (!process.env.QB_SKIP_GENERATE) {
    console.log(`[seed] Generating NDJSON into ${outDir}`);
    const manifest = generateQuestionBankFiles({ version, seed, outDir });
    console.log(`[seed] Generated:`, manifest.totals);
  }

  // Step 2: Count existing
  const [{ value: before }] = await db.select({ value: count() }).from(questionBankItems);
  console.log(`[seed] Items before import: ${before}`);

  // Step 3: Import each file
  const files = ['multiplication', 'division', 'fractions', 'patterns', 'word_problems'];
  let imported = 0;
  let skipped = 0;

  for (const domain of files) {
    const filePath = resolve(outDir, `${domain}.ndjson`);
    let raw: string;
    try {
      raw = readFileSync(filePath, 'utf-8');
    } catch {
      console.warn(`[seed] ⚠️ ${filePath} not found, skipping`);
      continue;
    }

    const lines = raw.trim().split('\n').filter(Boolean);
    console.log(`[seed] Importing ${domain}: ${lines.length} lines`);

    for (const line of lines) {
      const q = JSON.parse(line);
      try {
        await db.insert(questionBankItems).values({
          id: q.id,
          version: q.version,
          domain: q.domain,
          skillTag: q.skillTag,
          subskillTags: q.subskillTags ?? [],
          gradeBand: String(q.gradeBand),
          questionType: q.questionType,
          globalDifficulty: q.globalDifficulty,
          skillDifficulty: q.skillDifficulty,
          prompt: q.prompt,
          choices: q.choices ?? null,
          correctAnswer: q.correctAnswer,
          visual: q.visual ?? null,
          explanation: q.explanation,
          source: q.source,
          hash: q.hash,
        }).onConflictDoNothing({ target: questionBankItems.hash });
        imported++;
      } catch (err: any) {
        if (err?.code === '23505') { skipped++; } // unique violation
        else { console.error(`[seed] Error on ${q.id}:`, err.message); }
      }
    }
  }

  const [{ value: after }] = await db.select({ value: count() }).from(questionBankItems);
  console.log(`[seed] Done. Imported: ${imported}, Skipped (dupes): ${skipped}`);
  console.log(`[seed] Total in DB: ${after}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
