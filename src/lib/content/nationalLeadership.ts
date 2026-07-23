import type { PrismaClient, RoleType } from '@/generated/prisma';
import { resolvePublishStatus } from '@/lib/publish';

import {
  CABINET_MINISTERS,
  CABINET_SOURCE_URL,
  PARTIES,
  PM_SOURCE_URL,
  PRIME_MINISTER,
  type CabinetMinisterSeed,
  type PartyKey,
} from '../../../content/people/union-cabinet';
import { PMO_NAME } from '../../../content/institutions/national';

/**
 * Writes a Person's `bio` plus its primary Citation in a single transaction —
 * same shape as upsertFundamentalRight (src/lib/content/rights.ts). Reused
 * across the Union Cabinet, Karnataka government, and judiciary seeds.
 */
export async function upsertPersonBio(
  db: PrismaClient,
  personId: string,
  bio: string,
  sourceUrl: string,
  sourceName: string,
  isPrimary: boolean = true,
) {
  return db.$transaction(async (tx) => {
    await tx.citation.upsert({
      where: {
        entityType_entityId_field_sourceUrl: {
          entityType: 'PERSON',
          entityId: personId,
          field: 'bio',
          sourceUrl,
        },
      },
      create: {
        entityType: 'PERSON',
        entityId: personId,
        field: 'bio',
        sourceName,
        sourceUrl,
        isPrimary,
      },
      update: { retrievedAt: new Date() },
    });

    // Only a primary citation can reach PUBLISHED (assertPublishable's contract) —
    // a non-primary source (e.g. the Karnataka HC judges' Wikipedia citation)
    // correctly stays DRAFT rather than being misrepresented as sourced-and-shipped.
    const bioStatus = await resolvePublishStatus(tx, 'PERSON', personId, isPrimary ? 'PUBLISHED' : 'DRAFT');
    return tx.person.update({ where: { id: personId }, data: { bio, bioStatus } });
  });
}

/**
 * `officialUrl` (and the other contact fields) carry no `*Status` column in the
 * schema — they aren't "explained content" gated by publish.ts, just a link, so
 * this is a plain write.
 */
export async function upsertPersonContact(db: PrismaClient, personId: string, officialUrl: string) {
  return db.person.update({ where: { id: personId }, data: { officialUrl } });
}

/**
 * Ingests the Prime Minister and the 30 Cabinet Ministers as Person + Position +
 * Tenure, each backed by a Citation to the official source they were verified
 * against (content/people/union-cabinet.ts). Also draws a HierarchyEdge from the
 * PM's Position to every Cabinet Minister's Position, so the org-chart mind-map
 * has real data to render.
 *
 * `field: 'currentPosition'` on the Citation marks "this backs the fact that this
 * person currently holds this office" — distinct from a `bio` citation, which
 * would back prose content not yet written for these records. No prose bio means
 * Person.bioStatus stays DRAFT, correctly: nothing claims a bio exists yet.
 *
 * Idempotent: Person keys on `sourceKey`, Position on its compound unique
 * `[title, institutionId, jurisdictionId]`, HierarchyEdge on
 * `[superiorId, subordinateId]`. Tenure and Citation go through find-then-create
 * rather than a compound-unique upsert, because both compound uniques include a
 * nullable column (`Tenure.startDate`, `Citation.field`) that Prisma's generated
 * upsert input can't target with `null` — the same limitation worked around in
 * seedGeographyAndInstitutions for Jurisdiction's root row.
 */

export async function upsertPartyByName(
  db: PrismaClient,
  seed: { name: string; abbreviation: string },
) {
  return db.party.upsert({
    where: { name: seed.name },
    create: seed,
    update: {},
  });
}

async function upsertParty(db: PrismaClient, key: PartyKey) {
  return upsertPartyByName(db, PARTIES[key]);
}

export async function upsertPerson(
  db: PrismaClient,
  fullName: string,
  sourceKey: string,
  partyId?: string,
) {
  return db.person.upsert({
    where: { sourceKey },
    create: { fullName, sourceKey, partyId, lastVerifiedAt: new Date() },
    update: { fullName, partyId, lastVerifiedAt: new Date() },
  });
}

export async function upsertPosition(
  db: PrismaClient,
  data: { title: string; roleType: RoleType; institutionId: string; jurisdictionId: string },
) {
  return db.position.upsert({
    where: {
      title_institutionId_jurisdictionId: {
        title: data.title,
        institutionId: data.institutionId,
        jurisdictionId: data.jurisdictionId,
      },
    },
    create: data,
    update: {},
  });
}

export async function ensureCurrentTenure(db: PrismaClient, personId: string, positionId: string) {
  const existing = await db.tenure.findFirst({ where: { personId, positionId } });
  if (existing) return existing;
  return db.tenure.create({ data: { personId, positionId, isCurrent: true } });
}

export async function ensurePersonCitation(
  db: PrismaClient,
  entityId: string,
  sourceUrl: string,
  sourceName: string,
) {
  const existing = await db.citation.findFirst({
    where: { entityType: 'PERSON', entityId, field: 'currentPosition', sourceUrl },
  });
  if (existing) {
    await db.citation.update({ where: { id: existing.id }, data: { retrievedAt: new Date() } });
    return existing;
  }
  return db.citation.create({
    data: {
      entityType: 'PERSON',
      entityId,
      field: 'currentPosition',
      sourceName,
      sourceUrl,
      isPrimary: true,
    },
  });
}

async function ensureHierarchyEdge(db: PrismaClient, superiorId: string, subordinateId: string) {
  return db.hierarchyEdge.upsert({
    where: { superiorId_subordinateId: { superiorId, subordinateId } },
    create: { superiorId, subordinateId, relationLabel: 'member of the Union Cabinet' },
    update: {},
  });
}

async function resolveMinistryId(db: PrismaClient, portfolio: string): Promise<string> {
  const name = `Ministry of ${portfolio}`;
  const institution = await db.institution.findFirst({ where: { name, type: 'MINISTRY' } });
  if (!institution) {
    throw new Error(
      `No seeded Institution found for portfolio "${portfolio}" (looked for "${name}"). ` +
        `Add it to UNION_MINISTRIES in content/institutions/national.ts and re-run the geography seed first.`,
    );
  }
  return institution.id;
}

async function seedCabinetMinister(
  db: PrismaClient,
  nationId: string,
  seed: CabinetMinisterSeed,
): Promise<string[]> {
  const party = await upsertParty(db, seed.party);
  const person = await upsertPerson(db, seed.fullName, seed.sourceKey, party.id);
  await ensurePersonCitation(db, person.id, CABINET_SOURCE_URL, 'Prime Minister’s Office');
  if (seed.bio) {
    await upsertPersonBio(db, person.id, seed.bio, CABINET_SOURCE_URL, 'Prime Minister’s Office');
  }
  if (seed.officialUrl) {
    await upsertPersonContact(db, person.id, seed.officialUrl);
  }

  const positionIds: string[] = [];
  for (const portfolio of seed.portfolios) {
    const institutionId = await resolveMinistryId(db, portfolio);
    const position = await upsertPosition(db, {
      title: `Union Minister of ${portfolio}`,
      roleType: 'MINISTER',
      institutionId,
      jurisdictionId: nationId,
    });
    await ensureCurrentTenure(db, person.id, position.id);
    positionIds.push(position.id);
  }
  return positionIds;
}

export async function seedUnionCabinet(db: PrismaClient) {
  const nation = await db.jurisdiction.findFirst({ where: { type: 'NATION', name: 'India' } });
  if (!nation) {
    throw new Error('Nation jurisdiction not found — run seedGeographyAndInstitutions first.');
  }

  const pmo = await db.institution.findFirst({ where: { name: PMO_NAME } });
  if (!pmo) {
    throw new Error('PMO institution not found — run seedGeographyAndInstitutions first.');
  }

  const pmParty = await upsertParty(db, PRIME_MINISTER.party);
  const pm = await upsertPerson(db, PRIME_MINISTER.fullName, PRIME_MINISTER.sourceKey, pmParty.id);
  await ensurePersonCitation(db, pm.id, PM_SOURCE_URL, 'Prime Minister’s Office');
  await upsertPersonBio(db, pm.id, PRIME_MINISTER.bio, PM_SOURCE_URL, 'Prime Minister’s Office');
  await upsertPersonContact(db, pm.id, PRIME_MINISTER.officialUrl);
  const pmPosition = await upsertPosition(db, {
    title: 'Prime Minister of India',
    roleType: 'HEAD_OF_GOVERNMENT',
    institutionId: pmo.id,
    jurisdictionId: nation.id,
  });
  await ensureCurrentTenure(db, pm.id, pmPosition.id);

  let ministerCount = 0;
  let positionCount = 0;
  for (const seed of CABINET_MINISTERS) {
    const positionIds = await seedCabinetMinister(db, nation.id, seed);
    for (const positionId of positionIds) {
      await ensureHierarchyEdge(db, pmPosition.id, positionId);
      positionCount += 1;
    }
    ministerCount += 1;
  }

  return { ministerCount, positionCount };
}
