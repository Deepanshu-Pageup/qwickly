import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().refine((url) => url.startsWith('mysql://'), {
    message: 'DATABASE_URL must be a valid MySQL connection string (mysql://...)',
  }),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DB_LOG_QUERIES: z.enum(['true', 'false']).optional().default('false'),
  ALLOWED_ORIGINS: z.string().optional().default(''),
});

export const env = envSchema.parse(process.env);
