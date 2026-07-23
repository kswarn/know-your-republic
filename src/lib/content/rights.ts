import type { PrismaClient } from '@/generated/prisma';
import { resolvePublishStatus } from '@/lib/publish';

import type { FundamentalRightSeed } from '../../../content/rights/fundamental-rights';

/**
 * Writes one editorially authored Right record: the Right row plus its primary
 * Citation, in a single transaction, upserting on `slug` so re-running the seed
 * (after an edit to content/rights/fundamental-rights.ts) updates the record in
 * place rather than duplicating it — the same idempotency contract as the source
 * adapters in src/lib/sources/, even though this content has no live fetch step.
 */
export async function upsertFundamentalRight(db: PrismaClient, seed: FundamentalRightSeed) {
  return db.$transaction(async (tx) => {
    const right = await tx.right.upsert({
      where: { slug: seed.slug },
      create: {
        slug: seed.slug,
        title: seed.title,
        category: seed.category,
        articleCitation: seed.articleCitation,
        appliesTo: seed.appliesTo,
        officialSourceUrl: seed.officialSourceUrl,
        plainExplanation: seed.plainExplanation,
        lastVerifiedAt: new Date(),
      },
      update: {
        title: seed.title,
        category: seed.category,
        articleCitation: seed.articleCitation,
        appliesTo: seed.appliesTo,
        officialSourceUrl: seed.officialSourceUrl,
        plainExplanation: seed.plainExplanation,
        lastVerifiedAt: new Date(),
      },
    });

    await tx.citation.upsert({
      where: {
        entityType_entityId_field_sourceUrl: {
          entityType: 'RIGHT',
          entityId: right.id,
          field: 'plainExplanation',
          sourceUrl: seed.officialSourceUrl,
        },
      },
      create: {
        entityType: 'RIGHT',
        entityId: right.id,
        field: 'plainExplanation',
        sourceName: 'Constitution of India, Legislative Department',
        sourceUrl: seed.officialSourceUrl,
        isPrimary: true,
      },
      update: { retrievedAt: new Date() },
    });

    const explanationStatus = await resolvePublishStatus(tx, 'RIGHT', right.id, 'PUBLISHED');
    return tx.right.update({ where: { id: right.id }, data: { explanationStatus } });
  });
}
