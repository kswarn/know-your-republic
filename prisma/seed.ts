import 'dotenv/config';

import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaClient } from '@/generated/prisma';
import { normalizeIndiaCodeRecord, upsertLaw } from '@/lib/sources/indiacode';

/**
 * Phase 0 proof-of-pipeline seed: one real, manually verified record, inserted
 * through the same adapter code path (`upsertLaw`) that automated ingestion will use.
 *
 * The URL and fields below were confirmed against India Code's own indexed content
 * (see docs/SOURCES_LEGAL.md — item-page fetches are not yet automatable end to end,
 * so this record was verified by a human rather than scraped live). Re-running this
 * script is safe: `upsertLaw` keys on `officialTextUrl`, so it updates the same row
 * in place instead of duplicating it.
 */

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set.');

  const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

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

  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
