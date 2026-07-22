import type { PrismaClient, RoleType } from '@/generated/prisma';

import {
  CABINET_MINISTERS,
  CABINET_SOURCE_URL,
  PM_SOURCE_URL,
  PRIME_MINISTER,
  type CabinetMinisterSeed,
} from '../../../content/people/union-cabinet';
import { PMO_NAME } from '../../../content/institutions/national';

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

async function upsertPerson(db: PrismaClient, fullName: string, sourceKey: string) {
  return db.person.upsert({
    where: { sourceKey },
    create: { fullName, sourceKey, lastVerifiedAt: new Date() },
    update: { fullName, lastVerifiedAt: new Date() },
  });
}

async function upsertPosition(
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

async function ensureCurrentTenure(db: PrismaClient, personId: string, positionId: string) {
  const existing = await db.tenure.findFirst({ where: { personId, positionId } });
  if (existing) return existing;
  return db.tenure.create({ data: { personId, positionId, isCurrent: true } });
}

async function ensurePersonCitation(
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
  const person = await upsertPerson(db, seed.fullName, seed.sourceKey);
  await ensurePersonCitation(db, person.id, CABINET_SOURCE_URL, 'Prime Minister’s Office');

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

  const pm = await upsertPerson(db, PRIME_MINISTER.fullName, PRIME_MINISTER.sourceKey);
  await ensurePersonCitation(db, pm.id, PM_SOURCE_URL, 'Prime Minister’s Office');
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
