import type { Jurisdiction, InstitutionType, JurisdictionType, PrismaClient } from '@/generated/prisma';

import { HIGH_COURTS } from '../../../content/institutions/high-courts';
import { KARNATAKA_DEPARTMENTS } from '../../../content/institutions/karnataka';
import {
  LOK_SABHA_NAME,
  PMO_NAME,
  RAJYA_SABHA_NAME,
  SUPREME_COURT_NAME,
  UNION_MINISTRIES,
} from '../../../content/institutions/national';
import { STATES_AND_UTS } from '../../../content/geography/states';

/**
 * Structural seeding for Phase 1: the nation, all 28 states + 8 UTs and their
 * capitals, and the institutions attached to each (PMO, Union ministries,
 * Parliament, Supreme Court, state CMOs/assemblies, High Courts).
 *
 * This is geography and institutional structure, not current office-holders —
 * stable enough to encode directly rather than needing live verification the way
 * a sitting minister's name would. Every upsert keys on the schema's natural
 * unique constraint (`[type, name, parentId]` for Jurisdiction, `[name,
 * jurisdictionId]` for Institution), so re-running this is safe.
 *
 * Union Territories with their own elected legislature (Delhi, Puducherry, and
 * Jammu and Kashmir) get a Chief Minister's office and a Legislative Assembly,
 * same as a state. The remaining, centrally administered UTs get only an
 * administrator's office.
 */
const LEGISLATURE_UTS = new Set(['Delhi', 'Puducherry', 'Jammu and Kashmir']);

/**
 * Prisma's generated compound-unique input for `[type, name, parentId]` requires
 * `parentId: string` — it can't target a `null` parentId, a limitation of how
 * nullable columns work in compound unique constraints. That only matters for the
 * single root Jurisdiction (the nation), which has no parent; every other
 * Jurisdiction this seeds has a real parentId and goes through the fast path.
 */
async function upsertJurisdiction(
  db: PrismaClient,
  data: {
    name: string;
    type: JurisdictionType;
    level: Jurisdiction['level'];
    parentId: string | null;
  },
) {
  if (data.parentId === null) {
    const existing = await db.jurisdiction.findFirst({
      where: { type: data.type, name: data.name, parentId: null },
    });
    return existing ?? db.jurisdiction.create({ data: { ...data, parentId: null } });
  }

  return db.jurisdiction.upsert({
    where: {
      type_name_parentId: { type: data.type, name: data.name, parentId: data.parentId },
    },
    create: data,
    update: {},
  });
}

async function upsertInstitution(
  db: PrismaClient,
  data: { name: string; type: InstitutionType; jurisdictionId: string },
) {
  return db.institution.upsert({
    where: { name_jurisdictionId: { name: data.name, jurisdictionId: data.jurisdictionId } },
    create: data,
    update: {},
  });
}

export async function seedGeographyAndInstitutions(db: PrismaClient) {
  const nation = await upsertJurisdiction(db, {
    name: 'India',
    type: 'NATION',
    level: 'NATIONAL',
    parentId: null,
  });

  const stateJurisdictions = new Map<string, Jurisdiction>();

  for (const entry of STATES_AND_UTS) {
    const jurisdiction = await upsertJurisdiction(db, {
      name: entry.name,
      type: entry.type === 'STATE' ? 'STATE' : 'UT',
      level: 'STATE',
      parentId: nation.id,
    });
    stateJurisdictions.set(entry.name, jurisdiction);

    if (!entry.capitalIsExternal) {
      await upsertJurisdiction(db, {
        name: entry.capital,
        type: 'CITY',
        level: 'CITY',
        parentId: jurisdiction.id,
      });
    }
  }

  // National institutions.
  await upsertInstitution(db, { name: PMO_NAME, type: 'EXECUTIVE_OFFICE', jurisdictionId: nation.id });
  for (const ministry of UNION_MINISTRIES) {
    await upsertInstitution(db, { name: ministry, type: 'MINISTRY', jurisdictionId: nation.id });
  }
  await upsertInstitution(db, {
    name: LOK_SABHA_NAME,
    type: 'LEGISLATIVE_HOUSE',
    jurisdictionId: nation.id,
  });
  await upsertInstitution(db, {
    name: RAJYA_SABHA_NAME,
    type: 'LEGISLATIVE_HOUSE',
    jurisdictionId: nation.id,
  });
  await upsertInstitution(db, {
    name: SUPREME_COURT_NAME,
    type: 'COURT',
    jurisdictionId: nation.id,
  });

  // Per-state / per-UT executive and legislative institutions.
  for (const entry of STATES_AND_UTS) {
    const jurisdiction = stateJurisdictions.get(entry.name);
    if (!jurisdiction) continue;

    const hasLegislature = entry.type === 'STATE' || LEGISLATURE_UTS.has(entry.name);

    await upsertInstitution(db, {
      name: hasLegislature
        ? `Office of the Chief Minister, ${entry.name}`
        : `Office of the Administrator, ${entry.name}`,
      type: 'EXECUTIVE_OFFICE',
      jurisdictionId: jurisdiction.id,
    });

    if (hasLegislature) {
      await upsertInstitution(db, {
        name: `${entry.name} Legislative Assembly`,
        type: 'LEGISLATIVE_HOUSE',
        jurisdictionId: jurisdiction.id,
      });
    }
  }

  // Karnataka state departments — proof-of-pattern for state-level government
  // ahead of the other 35 states/UTs (see src/lib/content/karnataka.ts).
  const karnataka = stateJurisdictions.get('Karnataka');
  if (!karnataka) {
    throw new Error('Karnataka not found in STATES_AND_UTS.');
  }
  for (const department of KARNATAKA_DEPARTMENTS) {
    await upsertInstitution(db, { name: department, type: 'DEPARTMENT', jurisdictionId: karnataka.id });
  }

  // High Courts.
  for (const hc of HIGH_COURTS) {
    const jurisdiction = stateJurisdictions.get(hc.primaryState);
    if (!jurisdiction) {
      throw new Error(`High Court "${hc.name}" references unknown state "${hc.primaryState}".`);
    }
    await upsertInstitution(db, { name: hc.name, type: 'COURT', jurisdictionId: jurisdiction.id });
  }

  return {
    nation,
    stateCount: STATES_AND_UTS.length,
    highCourtCount: HIGH_COURTS.length,
    ministryCount: UNION_MINISTRIES.length,
  };
}
