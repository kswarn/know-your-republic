import { EntityType, PublishStatus } from '@/generated/prisma';

/**
 * The publish gate.
 *
 * The single guardrail everything else rests on: no explained fact reaches a reader
 * without a link to the official source it came from. Enforcing that by review alone
 * fails the first time an ingestion job runs unattended, so publication goes through
 * this module and nowhere else.
 *
 * Callers must never write `{ summaryStatus: 'PUBLISHED' }` with a raw Prisma call.
 */

/** The publish-gated field on each entity, keyed by the status column that guards it. */
export const GATED_FIELDS = {
  PERSON: { field: 'bio', statusField: 'bioStatus' },
  POSITION: { field: 'responsibilities', statusField: 'responsibilitiesStatus' },
  INSTITUTION: { field: 'description', statusField: 'descriptionStatus' },
  LAW: { field: 'plainSummary', statusField: 'summaryStatus' },
  RIGHT: { field: 'plainExplanation', statusField: 'explanationStatus' },
} as const satisfies Partial<Record<EntityType, { field: string; statusField: string }>>;

export type GatedEntityType = keyof typeof GATED_FIELDS;

export class UnsourcedContentError extends Error {
  constructor(entityType: GatedEntityType, entityId: string, field: string) {
    super(
      `Refusing to publish ${entityType} ${entityId}: field "${field}" has no primary Citation. ` +
        `Sourced or it doesn't ship — attach a Citation with isPrimary=true first.`,
    );
    this.name = 'UnsourcedContentError';
  }
}

/**
 * A minimal structural type so this module can be unit-tested against a fake and
 * used with either the shared client or a transaction handle.
 */
type CitationReader = {
  citation: {
    count(args: {
      where: {
        entityType: EntityType;
        entityId: string;
        field?: string | null;
        isPrimary?: boolean;
      };
    }): Promise<number>;
  };
};

/**
 * Throws unless the entity's gated field is backed by at least one *primary* citation.
 *
 * Secondary sources (PRS, MyNeta) cross-check but never stand alone, so they do not
 * satisfy the gate — hence `isPrimary: true` rather than a bare count.
 */
export async function assertPublishable(
  client: CitationReader,
  entityType: GatedEntityType,
  entityId: string,
): Promise<void> {
  const { field } = GATED_FIELDS[entityType];

  const primaryCitations = await client.citation.count({
    where: { entityType: entityType as EntityType, entityId, field, isPrimary: true },
  });

  if (primaryCitations === 0) {
    throw new UnsourcedContentError(entityType, entityId, field);
  }
}

/**
 * The status to write for a gated field. `PUBLISHED` is only reachable through
 * `assertPublishable`, so this returns the requested status having already verified it.
 */
export async function resolvePublishStatus(
  client: CitationReader,
  entityType: GatedEntityType,
  entityId: string,
  requested: PublishStatus,
): Promise<PublishStatus> {
  if (requested === PublishStatus.PUBLISHED) {
    await assertPublishable(client, entityType, entityId);
  }
  return requested;
}
