import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { db } from './index.js';
import { questionBankItems } from './schema.js';
import { sql } from 'drizzle-orm';

const currentDir = dirname(fileURLToPath(import.meta.url));

const BANK_PATHS = [
  join(currentDir, '../../../../packages/question-bank/v1'),
  join(currentDir, '../../../packages/question-bank/v1'),
  join(process.cwd(), 'packages/question-bank/v1'),
  join(process.cwd(), '../../packages/question-bank/v1'),
];

function findBankDir() {
  for (const p of BANK_PATHS) {
    if (existsSync(join(p, 'index.json'))) return p;
  }
  return null;
}

function hashQuestion(q: any) {
  return createHash('sha256')
    .update(q.id + ':' + q.version + ':' + q.domain + ':' + q.prompt)
    .digest('hex')
    .slice(0, 16);
}

export async function autoSeed(force: boolean = false) {
  const rows = await db.select({ count: sql<number>`count(*)::int` }).from(questionBankItems);
  const currentCount = rows[0].count;

  if (currentCount > 0 && !force) {
    return { seeded: false, count: currentCount };
  }

  if (force && currentCount > 0) {
    await db.delete(questionBankItems);
  }

  const bankDir = findBankDir();
  if (!bankDir) {
    return { seeded: false, count: currentCount };
  }

  const domains = ['multiplication', 'division', 'fractions', 'patterns', 'word_problems'];
  let totalInserted = 0;

  for (const domain of domains) {
    const filePath = join(bankDir, domain + '.ndjson');
    if (!existsSync(filePath)) continue;

    const raw = readFileSync(filePath, 'utf-8');
    const lines = raw.trim().split('\n').filter(Boolean);

    for (const line of lines) {
      const q = JSON.parse(line);
      try {
        await db.insert(questionBankItems).values({
          id: q.id,
          version: q.version,
          domain: q.domain,
          skillTag: q.skillTag,
          subskillTags: q.subskillTags || [],
          gradeBand: String(q.gradeBand),
          questionType: q.questionType,
          globalDifficulty: q.globalDifficulty,
          skillDifficulty: q.skillDifficulty,
          prompt: q.prompt,
          choices: q.choices || [],
          correctAnswer: q.correctAnswer,
          visual: q.visual || null,
          explanation: q.explanation,
          source: { kind: 'generated', origin: 'template-v1', license: 'proprietary' },
          hash: hashQuestion(q),
        }).onConflictDoNothing();
      } catch (e) {
        // skip duplicates
      }
    }

    totalInserted += lines.length;
  }

  return { seeded: true, count: totalInserted };
}
