import type { PrismaClient } from '@/generated/prisma';

import {
  fetchLokSabhaMembers,
  fetchRajyaSabhaMembers,
  LOK_SABHA_SOURCE_NAME,
  LOK_SABHA_SOURCE_URL,
  RAJYA_SABHA_SOURCE_NAME,
  RAJYA_SABHA_SOURCE_URL,
  type LegislatorRecord,
} from '@/lib/sources/sansad';
import { LOK_SABHA_NAME, RAJYA_SABHA_NAME } from '../../../content/institutions/national';
import { ensureCurrentTenure, upsertPerson } from './nationalLeadership';

/**
 * Ingests every sitting Lok Sabha and Rajya Sabha member as Person + Position +
 * Tenure + Citation, live from the sansad.in APIs (src/lib/sources/sansad.ts) —
 * ~784 people, by far the largest single ingestion pass so far. In-memory
 * caches for Party and Jurisdiction lookups (a few dozen distinct values shared
 * across hundreds of members) keep this from re-querying the same row hundreds
 * of times.
 *
 * Cabinet Ministers are, almost without exception, also sitting MPs — sansad.in
 * has no shared ID with the Union/Karnataka cabinet ingestion (different source,
 * different sourceKey namespace), so a same-person name match against the
 * already-seeded ministers is done before creating a Person, adding the MP
 * Position/Tenure onto the existing minister record instead of a duplicate.
 * (A first run of this adapter shipped without this check and produced 28
 * duplicate Person rows, cleaned up by hand — this is the fix, not a
 * theoretical concern.)
 *
 * Rajya Sabha seats aren't individually named the way Lok Sabha constituencies
 * are, so every RS member from the same state shares one Position row (title
 * "Member of Parliament, Rajya Sabha (State)") via separate Tenure rows — a
 * deliberate simplification, not a data-loss bug: each member is still their
 * own Person record either way.
 */

/** Strips honorifics and punctuation so "Shri Rajnath Singh" matches "Raj Nath Singh". */
function normalizePersonName(name: string): string {
  return name
    .replace(/\b(shri|smt|dr|kumari|km|prof|shrimati)\b/gi, '')
    .replace(/[\s.,()]+/g, '')
    .toLowerCase();
}

/**
 * Name variants the normalizer above can't bridge (an abbreviated first name,
 * etc.) — verified by hand against the actual seeded minister records.
 * Keyed by the legislator's sansad sourceKey.
 */
const MANUAL_NAME_OVERRIDES: Record<string, string> = {
  'sansad-rs:2426': 'pmindia:subrahmanyam-jaishankar', // "S. Jaishankar"
  'sansad-ls:5551': 'pmindia:piyush-goyal', // "Piyush Vedprakash Goyal"
  'sansad-ls:4134': 'pmindia:rajiv-ranjan-singh', // "Rajiv Ranjan Singh" vs. cabinet's "Rajiv Ranjan Singh (Lalan Singh)"
  'sansad-ls:4452': 'pmindia:cr-patil', // "Chandrakant Raghunath Patil"
};

async function upsertPartyCached(
  db: PrismaClient,
  cache: Map<string, string>,
  name: string,
  abbreviation: string,
): Promise<string> {
  const cached = cache.get(name);
  if (cached) return cached;
  const party = await db.party.upsert({ where: { name }, create: { name, abbreviation }, update: {} });
  cache.set(name, party.id);
  return party.id;
}

async function resolveStateJurisdictionId(
  db: PrismaClient,
  cache: Map<string, string>,
  stateName: string | undefined,
  nationId: string,
): Promise<string> {
  if (!stateName) return nationId;
  const cached = cache.get(stateName);
  if (cached) return cached;
  const jurisdiction = await db.jurisdiction.findFirst({
    where: { name: stateName, type: { in: ['STATE', 'UT'] } },
  });
  if (!jurisdiction) {
    throw new Error(
      `No seeded Jurisdiction found named "${stateName}" — check STATE_NAME_FIXES in src/lib/sources/sansad.ts.`,
    );
  }
  cache.set(stateName, jurisdiction.id);
  return jurisdiction.id;
}

async function upsertLegislatorPosition(
  db: PrismaClient,
  cache: Map<string, string>,
  title: string,
  institutionId: string,
  jurisdictionId: string,
): Promise<string> {
  const cacheKey = `${title}::${institutionId}::${jurisdictionId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const position = await db.position.upsert({
    where: { title_institutionId_jurisdictionId: { title, institutionId, jurisdictionId } },
    create: { title, roleType: 'LEGISLATOR', institutionId, jurisdictionId },
    update: {},
  });
  cache.set(cacheKey, position.id);
  return position.id;
}

async function ensureLegislatorCitation(
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
    return;
  }
  await db.citation.create({
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

type MinisterInfo = {
  id: string;
  email: string | null;
  phone: string | null;
  officeAddress: string | null;
  photoUrl: string | null;
};

/**
 * Resolves the Person a legislator record should attach to: an already-seeded
 * minister sharing their name (backfilling any contact fields the minister
 * record is missing, but never overwriting their name/party), or — the common
 * case — a freshly upserted Person keyed on the sansad sourceKey.
 */
async function resolveLegislatorPerson(
  db: PrismaClient,
  ministersByNormalizedName: Map<string, MinisterInfo>,
  record: LegislatorRecord,
  partyId: string,
): Promise<string> {
  const overrideTarget = MANUAL_NAME_OVERRIDES[record.sourceKey];
  const minister = overrideTarget
    ? [...ministersByNormalizedName.values()].find((m) => m.id === overrideTarget) ??
      (await (async () => {
        const p = await db.person.findUnique({ where: { sourceKey: overrideTarget } });
        return p
          ? {
              id: p.id,
              email: p.email,
              phone: p.phone,
              officeAddress: p.officeAddress,
              photoUrl: p.photoUrl,
            }
          : undefined;
      })())
    : ministersByNormalizedName.get(normalizePersonName(record.fullName));

  if (minister) {
    const contactUpdate: Record<string, string> = {};
    if (!minister.email && record.email) contactUpdate.email = record.email;
    if (!minister.phone && record.phone) contactUpdate.phone = record.phone;
    if (!minister.officeAddress && record.officeAddress) contactUpdate.officeAddress = record.officeAddress;
    if (!minister.photoUrl && record.photoUrl) contactUpdate.photoUrl = record.photoUrl;
    if (Object.keys(contactUpdate).length > 0) {
      await db.person.update({ where: { id: minister.id }, data: contactUpdate });
    }
    return minister.id;
  }

  const person = await upsertPerson(db, record.fullName, record.sourceKey, partyId);
  if (record.email || record.phone || record.officeAddress || record.photoUrl) {
    await db.person.update({
      where: { id: person.id },
      data: {
        email: record.email,
        phone: record.phone,
        officeAddress: record.officeAddress,
        photoUrl: record.photoUrl,
      },
    });
  }
  return person.id;
}

async function seedHouse(
  db: PrismaClient,
  records: LegislatorRecord[],
  opts: {
    institutionId: string;
    nationId: string;
    sourceUrl: string;
    sourceName: string;
    positionTitle: (r: LegislatorRecord) => string;
  },
  ministersByNormalizedName: Map<string, MinisterInfo>,
  partyCache: Map<string, string>,
  jurisdictionCache: Map<string, string>,
  positionCache: Map<string, string>,
): Promise<number> {
  for (const record of records) {
    const partyId = await upsertPartyCached(db, partyCache, record.partyName, record.partyAbbreviation);
    const personId = await resolveLegislatorPerson(db, ministersByNormalizedName, record, partyId);
    await ensureLegislatorCitation(db, personId, opts.sourceUrl, opts.sourceName);

    const jurisdictionId = await resolveStateJurisdictionId(
      db,
      jurisdictionCache,
      record.stateName,
      opts.nationId,
    );
    const positionId = await upsertLegislatorPosition(
      db,
      positionCache,
      opts.positionTitle(record),
      opts.institutionId,
      jurisdictionId,
    );
    await ensureCurrentTenure(db, personId, positionId);
  }
  return records.length;
}

export async function seedLegislature(db: PrismaClient) {
  const nation = await db.jurisdiction.findFirst({ where: { type: 'NATION', name: 'India' } });
  if (!nation) throw new Error('Nation jurisdiction not found — run seedGeographyAndInstitutions first.');

  const lokSabha = await db.institution.findFirst({ where: { name: LOK_SABHA_NAME } });
  const rajyaSabha = await db.institution.findFirst({ where: { name: RAJYA_SABHA_NAME } });
  if (!lokSabha || !rajyaSabha) {
    throw new Error('Lok Sabha / Rajya Sabha institutions not found — run seedGeographyAndInstitutions first.');
  }

  const ministers = await db.person.findMany({
    where: { tenures: { some: { position: { roleType: { in: ['HEAD_OF_GOVERNMENT', 'MINISTER'] } } } } },
    select: { id: true, fullName: true, email: true, phone: true, officeAddress: true, photoUrl: true },
  });
  const ministersByNormalizedName = new Map<string, MinisterInfo>(
    ministers.map((m) => [
      normalizePersonName(m.fullName),
      { id: m.id, email: m.email, phone: m.phone, officeAddress: m.officeAddress, photoUrl: m.photoUrl },
    ]),
  );

  const partyCache = new Map<string, string>();
  const jurisdictionCache = new Map<string, string>();
  const positionCache = new Map<string, string>();

  const [lsMembers, rsMembers] = await Promise.all([fetchLokSabhaMembers(), fetchRajyaSabhaMembers()]);

  const lsCount = await seedHouse(
    db,
    lsMembers,
    {
      institutionId: lokSabha.id,
      nationId: nation.id,
      sourceUrl: LOK_SABHA_SOURCE_URL,
      sourceName: LOK_SABHA_SOURCE_NAME,
      positionTitle: (r) => `Member of Parliament, Lok Sabha (${r.constituency})`,
    },
    ministersByNormalizedName,
    partyCache,
    jurisdictionCache,
    positionCache,
  );

  const rsCount = await seedHouse(
    db,
    rsMembers,
    {
      institutionId: rajyaSabha.id,
      nationId: nation.id,
      sourceUrl: RAJYA_SABHA_SOURCE_URL,
      sourceName: RAJYA_SABHA_SOURCE_NAME,
      positionTitle: (r) => `Member of Parliament, Rajya Sabha (${r.stateName ?? 'Nominated'})`,
    },
    ministersByNormalizedName,
    partyCache,
    jurisdictionCache,
    positionCache,
  );

  return { lsCount, rsCount };
}
