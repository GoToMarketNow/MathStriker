import { execSync } from 'child_process';
import { config } from '../config/env.js';

/**
 * Programmatic schema push using drizzle-kit.
 * Safe to run repeatedly — additive only (won't drop).
 */
export async function autoMigrate(): Promise<void> {
  if (config.nodeEnv === 'production') {
    // In production, run drizzle-kit push directly
    try {
      execSync(
        `npx drizzle-kit push --config=drizzle.config.ts`,
        {
          cwd: process.cwd(),
          env: { ...process.env, DATABASE_URL: config.databaseUrl },
          stdio: 'pipe',
          timeout: 30_000,
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // drizzle-kit push may warn but still succeed
      if (msg.includes('Nothing to push')) return;
      console.warn('drizzle-kit push output:', msg);
    }
  } else {
    console.log('ℹ️ Skipping auto-migrate in dev (use `pnpm db:push` manually)');
  }
}
