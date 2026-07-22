import 'dotenv/config';

import { PrismaNeon } from '@prisma/adapter-neon';

import { FUNDAMENTAL_RIGHTS } from '../content/rights/fundamental-rights';
import { PrismaClient } from '@/generated/prisma';
import { seedGeographyAndInstitutions } from '@/lib/content/geography';
import { seedUnionCabinet } from '@/lib/content/nationalLeadership';
import { upsertFundamentalRight } from '@/lib/content/rights';
import { normalizeIndiaCodeRecord, upsertLaw } from '@/lib/sources/indiacode';

/**
 * Seeds two kinds of content through the same idempotent, publish-gated code paths
 * real ingestion will use:
 *
 *  - one real, manually verified Law record (Phase 0 proof-of-pipeline) — see
 *    docs/SOURCES_LEGAL.md for why this is a verified record rather than a live
 *    scrape of India Code's item pages.
 *  - the full Fundamental Rights content (content/rights/fundamental-rights.ts),
 *    Phase 1's Rights section.
 *
 * Safe to re-run: both upsert helpers key on a stable natural key (`officialTextUrl`
 * for Law, `slug` for Right), so this updates existing rows in place.
 */

async function seedIndiaCodeLaw(db: PrismaClient) {
  const record = normalizeIndiaCodeRecord({
    officialTextUrl: 'https://www.indiacode.nic.in/handle/123456789/2065',
    title: 'The Right to Information Act, 2005 (Act No. 22 of 2005)',
    year: 2005,
  });

  const law = await upsertLaw(db, record, {
    plainSummary:
      'The Right to Information Act, 2005 gives a citizen the right to request information ' +
      "held by a public authority. A public authority's designated officer must respond " +
      'within thirty days of a written request, or within 48 hours where the request ' +
      'concerns a threat to a person’s life or liberty. A request may be refused only on ' +
      'grounds listed in Section 8 of the Act.',
    publish: true,
  });

  console.log(`Seeded Law ${law.id}: "${law.title}" (${law.summaryStatus})`);
}

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

  await seedIndiaCodeLaw(db);
  await seedFundamentalRights(db);

  const geo = await seedGeographyAndInstitutions(db);
  console.log(
    `Seeded geography: nation + ${geo.stateCount} states/UTs, ${geo.ministryCount} ministries, ` +
      `${geo.highCourtCount} High Courts.`,
  );

  const cabinet = await seedUnionCabinet(db);
  console.log(
    `Seeded Union Cabinet: PM + ${cabinet.ministerCount} Cabinet Ministers, ` +
      `${cabinet.positionCount} ministerial Positions.`,
  );

  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
