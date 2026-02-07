import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BANK_DIR = join(__dirname, '../../../../packages/question-bank/v1');

export interface BankQuestion {
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
  choices: string[];
  correctAnswer: string | string[];
  visual?: Record<string, unknown>;
  explanation?: string;
}

// ─── Load all questions from NDJSON ─────────────────
let _bank: BankQuestion[] | null = null;

function loadBank(): BankQuestion[] {
  if (_bank) return _bank;
  _bank = [];
  const domains = ['multiplication', 'division', 'fractions', 'patterns', 'word_problems'];
  for (const domain of domains) {
    try {
      const raw = readFileSync(join(BANK_DIR, `${domain}.ndjson`), 'utf-8');
      const lines = raw.trim().split('\n');
      for (const line of lines) {
        if (line.trim()) _bank.push(JSON.parse(line));
      }
    } catch {
      console.warn(`⚠️ Could not load ${domain}.ndjson — using procedural fallback`);
    }
  }
  console.log(`📚 Question bank loaded: ${_bank.length} questions`);
  return _bank;
}

// ─── Question Selector ──────────────────────────────
export interface SelectionCriteria {
  globalDifficulty: number;
  skillTag?: string;
  weakSkills?: string[];
  recentIds: string[];       // last 100 question IDs served
  recentSkillTags: string[]; // last 5 skill tags served
}

export function selectQuestion(criteria: SelectionCriteria): BankQuestion | null {
  const bank = loadBank();
  if (bank.length === 0) return null;

  const recentSet = new Set(criteria.recentIds);
  const lastTags = criteria.recentSkillTags;

  // Determine target skill with weak-skill bias
  let targetSkill = criteria.skillTag;
  if (!targetSkill && criteria.weakSkills?.length && Math.random() < 0.4) {
    targetSkill = criteria.weakSkills[Math.floor(Math.random() * criteria.weakSkills.length)];
  }

  // Anti-repetition: don't serve same skill 3+ times in a row
  if (targetSkill && lastTags.length >= 2 && lastTags.slice(-2).every(t => t === targetSkill)) {
    targetSkill = undefined; // force variety
  }

  // Filter candidates
  let candidates = bank.filter(q => {
    // Difficulty ±1
    if (Math.abs(q.globalDifficulty - criteria.globalDifficulty) > 1) return false;
    // Not recently seen
    if (recentSet.has(q.id)) return false;
    // Skill match if specified
    if (targetSkill && q.domain !== targetSkill && q.skillTag !== targetSkill) return false;
    return true;
  });

  // If too few candidates, relax skill constraint
  if (candidates.length < 3) {
    candidates = bank.filter(q => {
      if (Math.abs(q.globalDifficulty - criteria.globalDifficulty) > 1) return false;
      if (recentSet.has(q.id)) return false;
      return true;
    });
  }

  // If still too few, relax difficulty
  if (candidates.length < 3) {
    candidates = bank.filter(q => !recentSet.has(q.id));
  }

  if (candidates.length === 0) return null;

  // Weighted random: prefer exact difficulty match
  const weighted = candidates.map(q => ({
    q,
    weight: q.globalDifficulty === criteria.globalDifficulty ? 3 : 1,
  }));
  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const { q, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) return q;
  }

  return candidates[0];
}

// ─── Stats ──────────────────────────────────────────
export function getBankStats() {
  const bank = loadBank();
  const byDomain: Record<string, number> = {};
  const byDifficulty: Record<number, number> = {};
  for (const q of bank) {
    byDomain[q.domain] = (byDomain[q.domain] || 0) + 1;
    byDifficulty[q.globalDifficulty] = (byDifficulty[q.globalDifficulty] || 0) + 1;
  }
  return { total: bank.length, byDomain, byDifficulty };
}
