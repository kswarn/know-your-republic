import type { PrismaClient } from '@/generated/prisma';

import {
  CHIEF_JUSTICE,
  SUPREME_COURT_JUDGES,
  SUPREME_COURT_SOURCE_URL,
  type JudgeSeed,
} from '../../../content/people/supreme-court';
import { SUPREME_COURT_NAME } from '../../../content/institutions/national';

/**
 * Ingests the Chief Justice of India and all sitting Supreme Court judges as
 * Person + Position + Tenure, each backed by a Citation to the official source
 * (content/people/supreme-court.ts). Bio-only, per the judiciary guardrail — no
 * case, judgment, or cause-list data, and no prose biography is written here
 * either; that's separate editorial work, same as it is for the Union Cabinet.
 *
 * Idempotent the same way as seedUnionCabinet: Person on `sourceKey`, Position on
 * its compound unique, Citation via find-then-create (its compound unique
 * includes the nullable `field` column, which Prisma's generated upsert can't
 * target with null).
 */

async function upsertPerson(db: PrismaClient, seed: JudgeSeed) {
  const dateOfBirth = seed.dateOfBirth ? new Date(seed.dateOfBirth) : undefined;
  return db.person.upsert({
    where: { sourceKey: seed.sourceKey },
    create: { fullName: seed.fullName, sourceKey: seed.sourceKey, dateOfBirth, lastVerifiedAt: new Date() },
    update: { fullName: seed.fullName, dateOfBirth, lastVerifiedAt: new Date() },
  });
}

async function ensurePersonCitation(db: PrismaClient, entityId: string) {
  const existing = await db.citation.findFirst({
    where: {
      entityType: 'PERSON',
      entityId,
      field: 'currentPosition',
      sourceUrl: SUPREME_COURT_SOURCE_URL,
    },
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
      sourceName: 'Supreme Court of India',
      sourceUrl: SUPREME_COURT_SOURCE_URL,
      isPrimary: true,
    },
  });
}

async function ensureTenure(
  db: PrismaClient,
  personId: string,
  positionId: string,
  startDate?: string,
) {
  const existing = await db.tenure.findFirst({ where: { personId, positionId } });
  if (existing) return existing;
  return db.tenure.create({
    data: {
      personId,
      positionId,
      isCurrent: true,
      startDate: startDate ? new Date(startDate) : undefined,
    },
  });
}

export async function seedSupremeCourt(db: PrismaClient) {
  const nation = await db.jurisdiction.findFirst({ where: { type: 'NATION', name: 'India' } });
  if (!nation) {
    throw new Error('Nation jurisdiction not found — run seedGeographyAndInstitutions first.');
  }

  const supremeCourt = await db.institution.findFirst({ where: { name: SUPREME_COURT_NAME } });
  if (!supremeCourt) {
    throw new Error('Supreme Court institution not found — run seedGeographyAndInstitutions first.');
  }

  const cjiPosition = await db.position.upsert({
    where: {
      title_institutionId_jurisdictionId: {
        title: 'Chief Justice of India',
        institutionId: supremeCourt.id,
        jurisdictionId: nation.id,
      },
    },
    create: {
      title: 'Chief Justice of India',
      roleType: 'JUDGE',
      institutionId: supremeCourt.id,
      jurisdictionId: nation.id,
    },
    update: {},
  });

  const judgePosition = await db.position.upsert({
    where: {
      title_institutionId_jurisdictionId: {
        title: 'Judge, Supreme Court of India',
        institutionId: supremeCourt.id,
        jurisdictionId: nation.id,
      },
    },
    create: {
      title: 'Judge, Supreme Court of India',
      roleType: 'JUDGE',
      institutionId: supremeCourt.id,
      jurisdictionId: nation.id,
    },
    update: {},
  });

  const cji = await upsertPerson(db, CHIEF_JUSTICE);
  await ensurePersonCitation(db, cji.id);
  await ensureTenure(db, cji.id, cjiPosition.id, CHIEF_JUSTICE.dateOfAppointment);

  for (const seed of SUPREME_COURT_JUDGES) {
    const person = await upsertPerson(db, seed);
    await ensurePersonCitation(db, person.id);
    await ensureTenure(db, person.id, judgePosition.id, seed.dateOfAppointment);
  }

  return { judgeCount: SUPREME_COURT_JUDGES.length + 1 };
}
