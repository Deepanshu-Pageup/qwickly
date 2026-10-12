import 'server-only';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaMariaDb(env.DATABASE_URL);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.DB_LOG_QUERIES === 'true' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
