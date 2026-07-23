import type { PrismaClient } from '@/generated/prisma';

import {
  KARNATAKA_HC_CHIEF_JUSTICE,
  KARNATAKA_HC_JUDGES,
  KARNATAKA_HC_SOURCE_NAME,
  KARNATAKA_HC_SOURCE_URL,
  type KarnatakaHCJudgeSeed,
} from '../../../content/people/karnataka-high-court';
import {
  CHIEF_JUSTICE,
  SUPREME_COURT_JUDGES,
  SUPREME_COURT_SOURCE_URL,
  type JudgeSeed,
} from '../../../content/people/supreme-court';
import { SUPREME_COURT_NAME } from '../../../content/institutions/national';
import { upsertPersonBio } from './nationalLeadership';

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
    create: {
      fullName: seed.fullName,
      sourceKey: seed.sourceKey,
      dateOfBirth,
      photoUrl: seed.photoUrl,
      lastVerifiedAt: new Date(),
    },
    update: { fullName: seed.fullName, dateOfBirth, photoUrl: seed.photoUrl, lastVerifiedAt: new Date() },
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
  if (CHIEF_JUSTICE.bio) {
    await upsertPersonBio(db, cji.id, CHIEF_JUSTICE.bio, SUPREME_COURT_SOURCE_URL, 'Supreme Court of India');
  }
  await ensureTenure(db, cji.id, cjiPosition.id, CHIEF_JUSTICE.dateOfAppointment);

  for (const seed of SUPREME_COURT_JUDGES) {
    const person = await upsertPerson(db, seed);
    await ensurePersonCitation(db, person.id);
    await ensureTenure(db, person.id, judgePosition.id, seed.dateOfAppointment);
  }

  return { judgeCount: SUPREME_COURT_JUDGES.length + 1 };
}

async function upsertKarnatakaHCPerson(db: PrismaClient, seed: KarnatakaHCJudgeSeed) {
  return db.person.upsert({
    where: { sourceKey: seed.sourceKey },
    create: { fullName: seed.fullName, sourceKey: seed.sourceKey, lastVerifiedAt: new Date() },
    update: { fullName: seed.fullName, lastVerifiedAt: new Date() },
  });
}

/**
 * Marked `isPrimary: false` deliberately — no primary source was reachable for
 * this court's roster (see content/people/karnataka-high-court.ts and
 * docs/SOURCES_LEGAL.md). Not gated by assertPublishable (currentPosition isn't
 * one of publish.ts's GATED_FIELDS), so this doesn't block anything, but the
 * SourceLink component will correctly render it as a cross-check-only source
 * rather than implying it's official.
 */
async function ensureKarnatakaHCCitation(db: PrismaClient, entityId: string) {
  const existing = await db.citation.findFirst({
    where: {
      entityType: 'PERSON',
      entityId,
      field: 'currentPosition',
      sourceUrl: KARNATAKA_HC_SOURCE_URL,
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
      sourceName: KARNATAKA_HC_SOURCE_NAME,
      sourceUrl: KARNATAKA_HC_SOURCE_URL,
      isPrimary: false,
    },
  });
}

export async function seedKarnatakaHighCourt(db: PrismaClient) {
  const karnataka = await db.jurisdiction.findFirst({ where: { type: 'STATE', name: 'Karnataka' } });
  if (!karnataka) {
    throw new Error('Karnataka Jurisdiction not found — run seedGeographyAndInstitutions first.');
  }

  const highCourt = await db.institution.findFirst({
    where: { name: 'Karnataka High Court', type: 'COURT' },
  });
  if (!highCourt) {
    throw new Error('Karnataka High Court institution not found — run seedGeographyAndInstitutions first.');
  }

  const cjPosition = await db.position.upsert({
    where: {
      title_institutionId_jurisdictionId: {
        title: 'Chief Justice, Karnataka High Court',
        institutionId: highCourt.id,
        jurisdictionId: karnataka.id,
      },
    },
    create: {
      title: 'Chief Justice, Karnataka High Court',
      roleType: 'JUDGE',
      institutionId: highCourt.id,
      jurisdictionId: karnataka.id,
    },
    update: {},
  });

  const judgePosition = await db.position.upsert({
    where: {
      title_institutionId_jurisdictionId: {
        title: 'Judge, Karnataka High Court',
        institutionId: highCourt.id,
        jurisdictionId: karnataka.id,
      },
    },
    create: {
      title: 'Judge, Karnataka High Court',
      roleType: 'JUDGE',
      institutionId: highCourt.id,
      jurisdictionId: karnataka.id,
    },
    update: {},
  });

  const cj = await upsertKarnatakaHCPerson(db, KARNATAKA_HC_CHIEF_JUSTICE);
  await ensureKarnatakaHCCitation(db, cj.id);
  if (KARNATAKA_HC_CHIEF_JUSTICE.bio) {
    await upsertPersonBio(
      db,
      cj.id,
      KARNATAKA_HC_CHIEF_JUSTICE.bio,
      KARNATAKA_HC_SOURCE_URL,
      KARNATAKA_HC_SOURCE_NAME,
      false, // non-primary — see content/people/karnataka-high-court.ts
    );
  }
  await ensureTenure(db, cj.id, cjPosition.id);

  for (const seed of KARNATAKA_HC_JUDGES) {
    const person = await upsertKarnatakaHCPerson(db, seed);
    await ensureKarnatakaHCCitation(db, person.id);
    await ensureTenure(db, person.id, judgePosition.id);
  }

  return { judgeCount: KARNATAKA_HC_JUDGES.length + 1 };
}
