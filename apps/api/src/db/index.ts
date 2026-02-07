import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://mathstriker:mathstriker@localhost:5432/mathstriker';

const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });
