import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { generateMultiplication } from './templates/multiplication.js';
import { generateDivision } from './templates/division.js';
import { generateFractions } from './templates/fractions.js';
import { generatePatterns } from './templates/patterns.js';
import { generateWordProblems } from './templates/wordProblems.js';

export interface GenerateOptions {
  version?: string;
  seed?: number;
  outDir: string;
}

function writeNdjson(filePath: string, rows: unknown[]) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, rows.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf-8');
}

export function generateQuestionBankFiles(opts: GenerateOptions) {
  const version = opts.version ?? 'v1';
  const seed = opts.seed ?? 1337;
  const outDir = opts.outDir;

  const multiplication = generateMultiplication(version, seed, 1200);
  const division = generateDivision(version, seed, 900);
  const fractions = generateFractions(version, seed, 1400);
  const patterns = generatePatterns(version, seed, 700);
  const wordProblems = generateWordProblems(version, seed, 900);

  writeNdjson(join(outDir, 'multiplication.ndjson'), multiplication);
  writeNdjson(join(outDir, 'division.ndjson'), division);
  writeNdjson(join(outDir, 'fractions.ndjson'), fractions);
  writeNdjson(join(outDir, 'patterns.ndjson'), patterns);
  writeNdjson(join(outDir, 'word_problems.ndjson'), wordProblems);

  // Dedup stats
  const allHashes = new Set<string>();
  const all = [...multiplication, ...division, ...fractions, ...patterns, ...wordProblems];
  let dupes = 0;
  for (const q of all) {
    if (allHashes.has((q as any).hash)) dupes++;
    else allHashes.add((q as any).hash);
  }

  const manifest = {
    version,
    seed,
    generatedAt: new Date().toISOString(),
    totals: {
      multiplication: multiplication.length,
      division: division.length,
      fractions: fractions.length,
      patterns: patterns.length,
      word_problems: wordProblems.length,
      all: all.length,
      uniqueByHash: allHashes.size,
      duplicates: dupes,
    },
  };

  writeFileSync(join(outDir, 'index.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  return manifest;
}
