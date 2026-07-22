import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaClient } from '@/generated/prisma';

/**
 * Prisma 7 requires an explicit driver adapter. The Neon serverless driver speaks
 * Postgres over HTTP/WebSocket, which is what makes it viable from Vercel's
 * serverless functions — a pooled TCP client would exhaust connections under
 * per-request cold starts.
 */
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set.');
  }

  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

// The dev server re-evaluates modules on every change; without this each reload
// would open a fresh pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
