import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const OVERALL_TIMEOUT_MS = 10000;
const CLEANUP_TIMEOUT_MS = 3000;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('[ERROR] DATABASE_URL environment variable is not defined.');
  process.exit(1);
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

let isFinished = false;

const overallTimer = setTimeout(() => {
  if (!isFinished) {
    console.error(`[TIMEOUT] Database connectivity check exceeded ${OVERALL_TIMEOUT_MS}ms limit.`);
    process.exit(1);
  }
}, OVERALL_TIMEOUT_MS);
overallTimer.unref();

async function run() {
  try {
    console.log('[INFO] Connecting to MySQL database...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('[SUCCESS] Database connectivity verified successfully.');
    isFinished = true;
    await safeDisconnect();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Database connectivity failed:', error instanceof Error ? error.message : error);
    isFinished = true;
    await safeDisconnect();
    process.exit(1);
  }
}

async function safeDisconnect() {
  const disconnectPromise = prisma.$disconnect();
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, CLEANUP_TIMEOUT_MS));
  await Promise.race([disconnectPromise, timeoutPromise]);
}

run();
