import type { PrismaClient } from '@/generated/prisma';
import { resolvePublishStatus } from '@/lib/publish';

import {
  POSITION_RESPONSIBILITIES,
  type ResponsibilitySeed,
} from '../../../content/institutions/position-responsibilities';

/**
 * Writes the `responsibilities` prose for one already-seeded Position, plus its
 * primary Citation, in a single transaction — mirrors upsertFundamentalRight's
 * shape (src/lib/content/rights.ts). Positions are seeded by nationalLeadership.ts
 * and judiciary.ts; this pass only adds prose to rows that already exist, so a
 * missing title is a real error, not something to skip past silently.
 */
async function upsertPositionResponsibilities(db: PrismaClient, seed: ResponsibilitySeed) {
  const position = await db.position.findFirst({ where: { title: seed.positionTitle } });
  if (!position) {
    throw new Error(
      `No seeded Position found titled "${seed.positionTitle}". Run the geography/cabinet/judiciary seeds first.`,
    );
  }

  return db.$transaction(async (tx) => {
    await tx.citation.upsert({
      where: {
        entityType_entityId_field_sourceUrl: {
          entityType: 'POSITION',
          entityId: position.id,
          field: 'responsibilities',
          sourceUrl: seed.sourceUrl,
        },
      },
      create: {
        entityType: 'POSITION',
        entityId: position.id,
        field: 'responsibilities',
        sourceName: seed.sourceName,
        sourceUrl: seed.sourceUrl,
        isPrimary: true,
      },
      update: { retrievedAt: new Date() },
    });

    const responsibilitiesStatus = await resolvePublishStatus(
      tx,
      'POSITION',
      position.id,
      'PUBLISHED',
    );
    return tx.position.update({
      where: { id: position.id },
      data: { responsibilities: seed.responsibilities, responsibilitiesStatus },
    });
  });
}

export async function seedPositionResponsibilities(db: PrismaClient) {
  let count = 0;
  for (const seed of POSITION_RESPONSIBILITIES) {
    await upsertPositionResponsibilities(db, seed);
    count += 1;
  }
  return count;
}
