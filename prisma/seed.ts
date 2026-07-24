import 'dotenv/config';

import { PrismaNeon } from '@prisma/adapter-neon';

import { FUNDAMENTAL_RIGHTS } from '../content/rights/fundamental-rights';
import { PrismaClient } from '@/generated/prisma';
import { seedGeographyAndInstitutions } from '@/lib/content/geography';
import { seedKarnatakaGovernment } from '@/lib/content/karnataka';
import { seedSupremeCourt } from '@/lib/content/judiciary';
import { seedLegislature } from '@/lib/content/legislature';
import { seedUnionCabinet } from '@/lib/content/nationalLeadership';
import { seedPositionResponsibilities } from '@/lib/content/positionResponsibilities';
import { upsertFundamentalRight } from '@/lib/content/rights';

/**
 * Seeds the full Fundamental Rights content (content/rights/fundamental-rights.ts,
 * Phase 1's Rights section) through the same idempotent, publish-gated code path
 * real ingestion will use. Safe to re-run: `upsertFundamentalRight` keys on the
 * Right's stable `slug`, so this updates existing rows in place.
 */

async function seedFundamentalRights(db: PrismaClient) {
  for (const seed of FUNDAMENTAL_RIGHTS) {
    const right = await upsertFundamentalRight(db, seed);
    console.log(`Seeded Right ${right.id}: "${right.title}" (${right.explanationStatus})`);
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set.');

  const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

  await seedFundamentalRights(db);

  const geo = await seedGeographyAndInstitutions(db);
  console.log(
    `Seeded geography: nation + ${geo.stateCount} states/UTs, ${geo.ministryCount} ministries.`,
  );

  const cabinet = await seedUnionCabinet(db);
  console.log(
    `Seeded Union Cabinet: PM + ${cabinet.ministerCount} Cabinet Ministers, ` +
      `${cabinet.positionCount} ministerial Positions.`,
  );

  const scJudges = await seedSupremeCourt(db);
  console.log(`Seeded Supreme Court: ${scJudges.judgeCount} judges (incl. CJI).`);

  const karnataka = await seedKarnatakaGovernment(db);
  console.log(
    `Seeded Karnataka government: CM + Deputy CM + ${karnataka.ministerCount - 1} Cabinet Ministers, ` +
      `${karnataka.positionCount} Positions.`,
  );

  const responsibilityCount = await seedPositionResponsibilities(db);
  console.log(`Seeded responsibilities for ${responsibilityCount} Positions.`);

  const legislature = await seedLegislature(db);
  console.log(
    `Seeded legislature: ${legislature.lsCount} Lok Sabha + ${legislature.rsCount} Rajya Sabha members.`,
  );

  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
