import type { PrismaClient } from '@/generated/prisma';

import {
  KARNATAKA_CABINET_MINISTERS,
  KARNATAKA_CABINET_SOURCE_NAME,
  KARNATAKA_CABINET_SOURCE_URL,
  KARNATAKA_CHIEF_MINISTER,
  KARNATAKA_DEPUTY_CM,
  KARNATAKA_PARTY,
  type KarnatakaMinisterSeed,
} from '../../../content/people/karnataka-cabinet';
import {
  ensureCurrentTenure,
  ensurePersonCitation,
  upsertPartyByName,
  upsertPerson,
  upsertPersonBio,
  upsertPosition,
} from './nationalLeadership';

/**
 * Ingests Karnataka's Chief Minister, Deputy Chief Minister, and Cabinet
 * Ministers — the state-level proof-of-pattern the build plan calls for before
 * fanning out to the other 35 states/UTs. Reuses the same generic upsert
 * helpers as the Union Cabinet (src/lib/content/nationalLeadership.ts); the
 * only state-specific pieces are which Jurisdiction/Institution rows this
 * resolves against.
 */

async function resolveDepartmentId(db: PrismaClient, portfolio: string): Promise<string> {
  const name = `Department of ${portfolio}, Government of Karnataka`;
  const institution = await db.institution.findFirst({ where: { name, type: 'DEPARTMENT' } });
  if (!institution) {
    throw new Error(
      `No seeded Institution found for portfolio "${portfolio}" (looked for "${name}"). ` +
        `Add it to KARNATAKA_DEPARTMENTS in content/institutions/karnataka.ts and re-run the geography seed first.`,
    );
  }
  return institution.id;
}

async function seedKarnatakaMinister(
  db: PrismaClient,
  stateId: string,
  partyId: string,
  seed: KarnatakaMinisterSeed,
): Promise<number> {
  const person = await upsertPerson(db, seed.fullName, seed.sourceKey, partyId);
  await ensurePersonCitation(db, person.id, KARNATAKA_CABINET_SOURCE_URL, KARNATAKA_CABINET_SOURCE_NAME);
  if (seed.bio) {
    await upsertPersonBio(db, person.id, seed.bio, KARNATAKA_CABINET_SOURCE_URL, KARNATAKA_CABINET_SOURCE_NAME);
  }

  let positionCount = 0;
  for (const portfolio of seed.portfolios) {
    const institutionId = await resolveDepartmentId(db, portfolio);
    const position = await upsertPosition(db, {
      title: `Karnataka Minister of ${portfolio}`,
      roleType: 'MINISTER',
      institutionId,
      jurisdictionId: stateId,
    });
    await ensureCurrentTenure(db, person.id, position.id);
    positionCount += 1;
  }
  return positionCount;
}

export async function seedKarnatakaGovernment(db: PrismaClient) {
  const karnataka = await db.jurisdiction.findFirst({ where: { type: 'STATE', name: 'Karnataka' } });
  if (!karnataka) {
    throw new Error('Karnataka Jurisdiction not found — run seedGeographyAndInstitutions first.');
  }

  const cmo = await db.institution.findFirst({
    where: { name: 'Office of the Chief Minister, Karnataka' },
  });
  if (!cmo) {
    throw new Error('Karnataka CMO institution not found — run seedGeographyAndInstitutions first.');
  }

  const party = await upsertPartyByName(db, {
    name: KARNATAKA_PARTY,
    abbreviation: 'INC',
  });

  const cm = await upsertPerson(
    db,
    KARNATAKA_CHIEF_MINISTER.fullName,
    KARNATAKA_CHIEF_MINISTER.sourceKey,
    party.id,
  );
  await ensurePersonCitation(db, cm.id, KARNATAKA_CABINET_SOURCE_URL, KARNATAKA_CABINET_SOURCE_NAME);
  if (KARNATAKA_CHIEF_MINISTER.bio) {
    await upsertPersonBio(
      db,
      cm.id,
      KARNATAKA_CHIEF_MINISTER.bio,
      KARNATAKA_CABINET_SOURCE_URL,
      KARNATAKA_CABINET_SOURCE_NAME,
    );
  }
  const cmPosition = await upsertPosition(db, {
    title: 'Chief Minister of Karnataka',
    roleType: 'HEAD_OF_GOVERNMENT',
    institutionId: cmo.id,
    jurisdictionId: karnataka.id,
  });
  await ensureCurrentTenure(db, cm.id, cmPosition.id);

  const deputyCm = await upsertPerson(
    db,
    KARNATAKA_DEPUTY_CM.fullName,
    KARNATAKA_DEPUTY_CM.sourceKey,
    party.id,
  );
  await ensurePersonCitation(
    db,
    deputyCm.id,
    KARNATAKA_CABINET_SOURCE_URL,
    KARNATAKA_CABINET_SOURCE_NAME,
  );
  if (KARNATAKA_DEPUTY_CM.bio) {
    await upsertPersonBio(
      db,
      deputyCm.id,
      KARNATAKA_DEPUTY_CM.bio,
      KARNATAKA_CABINET_SOURCE_URL,
      KARNATAKA_CABINET_SOURCE_NAME,
    );
  }
  const deputyCmTitlePosition = await upsertPosition(db, {
    title: KARNATAKA_DEPUTY_CM.title,
    roleType: 'MINISTER',
    institutionId: cmo.id,
    jurisdictionId: karnataka.id,
  });
  await ensureCurrentTenure(db, deputyCm.id, deputyCmTitlePosition.id);

  let positionCount = 1; // the CM's own position, counted above
  positionCount += 1; // the Deputy CM's title position
  for (const portfolio of KARNATAKA_DEPUTY_CM.portfolios) {
    const institutionId = await resolveDepartmentId(db, portfolio);
    const position = await upsertPosition(db, {
      title: `Karnataka Minister of ${portfolio}`,
      roleType: 'MINISTER',
      institutionId,
      jurisdictionId: karnataka.id,
    });
    await ensureCurrentTenure(db, deputyCm.id, position.id);
    positionCount += 1;
  }

  let ministerCount = 1; // the Deputy CM
  for (const seed of KARNATAKA_CABINET_MINISTERS) {
    positionCount += await seedKarnatakaMinister(db, karnataka.id, party.id, seed);
    ministerCount += 1;
  }

  return { ministerCount, positionCount };
}
