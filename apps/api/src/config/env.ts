import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || Number(process.env.API_PORT) || 3001,
  host: process.env.API_HOST || '0.0.0.0',
  databaseUrl:
    process.env.DATABASE_URL || 'postgresql://mathstriker:mathstriker@localhost:5432/mathstriker',
  nodeEnv: process.env.NODE_ENV || 'development',
  version: '0.2.0',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminSeedToken: process.env.ADMIN_SEED_TOKEN || '',
} as const;
