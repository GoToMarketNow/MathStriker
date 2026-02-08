import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { db } from './index.js';
import { questionBankItems } from './schema.js';
import { sql } from 'drizzle-orm';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BANK_PATHS = [
  join(__dirname, '../../../../packages/question-bank/v1'),
  join(__dirname, '../../../packages/question-bank/v1'),
  join(process.cwd(), 'packages/question-bank/v1'),
  join(process.cwd(), '../../packages/question-bank/v1'),
];

function findBankDir(): string | null {
  for (const p of BANK_PATHS) {
    if (existsSync(join(p, 'index.json'))) return p;
  }
  return null;
}

interface RawQuestion {
  id: string;
  version: string;
  domain: string;
  skillTag: string;
  subskillTags?: string[];
  gradeBand: string | number;
  questionType: string;
  globalDifficulty: number;
  skillDifficulty: number;
  prompt: string;
  choices?: string[];
  correctAnswer: string | string[];
  visual?: Record<string, unknown>;
  explanation: string;
}

function hashQuestion(q: RawQuestion): string {
  return createHash('sha256')
    .update(`${q.id}:${q.version}:${q.domain}:${q.prompt}`)
    .digest('hex')
    .slice(0, 16);
}

export async function autoSeed(force = false): Promise<{ seeded: boolean; count: number }> {
  const [{ count: currentCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(questionBankItems);

  if (currentCount > 0 && !force) {
    return { seeded: false, count: currentCount };
  }

  if (force && currentCount > 0) {
    console.log('  clearing existing question bank...');
    await db.delete(questionBankItems);
  }

  const bankDir = findBankDir();
  if (!bankDir) {
    console.warn('Question bank NDJSON not found, skipping seed');
    return { seeded: false, count: currentCount };
  }

  const domains = ['multiplication', 'division', 'fractions', 'patterns', 'word_problems'];
  let totalInserted = 0;

  for (const domain of domains) {
    const filePath = join(bankDir, `${domain}.ndjson`);
    if (!existsSync(filePath)) {
      console.warn(`Missing ${domain}.ndjson, skipping`);
      continue;
    }

    const raw = readFileSync(filePath, 'utf-8');
    const lines = raw.trim().split('\n').filter(Boolean);
    const batch: (typeof questionBankItems.$inferInsert)[] = [];

    for (const line of lines) {
      const q: RawQuestion = JSON.parse(line);
      batch.push({
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
      });
    }

    for (let i = 0; i < batch.length; i += 50) {
      const chunk = batch.slice(i, i + 50);
      try {
        await db
          .insert(questionBankItems)
          .values(chunk)
          .onConflictDoUpdate({
            target: questionBankItems.id,
            set: {
              prompt: sql`excluded.prompt`,
              choices: sql`excluded.choices`,
              correctAnswer: sql`excluded.correct_answer`,
              explanation: sql`excluded.explanation`,
              globalDifficulty: sql`excluded.global_difficulty`,
              skillDifficulty: sql`excluded.skill_difficulty`,
              hash: sql`excluded.hash`,
            },
          });
      } catch (err: unknown) {
        console.warn(`Batch conflict in ${domain}, inserting individually...`);
        for (const item of chunk) {
          try {
            await db
              .insert(questionBankItems)
              .values(item)
              .onConflictDoNothing();
          } catch {
            // skip
          }
        }
      }
    }

    totalInserted += batch.length;
    console.log(`  ${domain}: ${batch.length} questions`);
  }

  return { seeded: true, count: totalInserted };
}
