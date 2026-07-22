import type { Prisma, PrismaClient } from '@/generated/prisma';
import { LawKind, LawLevel, LawStatus } from '@/generated/prisma';
import { resolvePublishStatus } from '@/lib/publish';

/**
 * Adapter for India Code (indiacode.nic.in) — the primary source for the full text
 * of central and state Acts (build plan §5).
 *
 * India Code's item pages currently return 403 / time out for automated HTTP clients
 * that don't present as a full browser session — see docs/SOURCES_LEGAL.md for what
 * was checked and what remains open. `fetchIndiaCodeRecord` is written against the
 * site's real DSpace page structure so it is ready to run once that access path is
 * resolved (headless browser or a confirmed session flow), but it fails closed: any
 * response shape it doesn't recognize throws rather than producing a guessed record.
 *
 * Until then, `normalizeIndiaCodeRecord` + `upsertLaw` are exercised directly with a
 * manually verified record (see prisma/seed.ts) — the human has confirmed the URL
 * resolves to the real Act and the fields match, which is what "cited" requires.
 */

export const SOURCE_NAME = 'India Code';

export type IndiaCodeRecord = {
  /** e.g. "https://www.indiacode.nic.in/handle/123456789/2065" — the citation + idempotency key. */
  officialTextUrl: string;
  title: string;
  actNumber: string;
  year: number;
  kind: LawKind;
  status: LawStatus;
  level: LawLevel;
  subjectArea?: string;
};

/**
 * Fetches and parses one India Code item page. Throws on anything but a clean,
 * recognized response — see the file header on why this can't silently degrade.
 */
export async function fetchIndiaCodeRecord(url: string): Promise<IndiaCodeRecord> {
  const response = await fetch(url, {
    headers: {
      // Identify honestly, per docs/SOURCES_LEGAL.md — never impersonate a browser.
      'User-Agent': 'KnowYourRepublicBot/0.1 (+https://github.com/; civic reference directory)',
    },
  });

  if (!response.ok) {
    throw new Error(
      `India Code returned ${response.status} for ${url}. Fail closed: not inserting a partial record. ` +
        `See docs/SOURCES_LEGAL.md — item pages currently need a browser-session-aware fetch.`,
    );
  }

  const html = await response.text();
  return parseIndiaCodeHtml(html, url);
}

/**
 * DSpace (the platform India Code runs on) renders item metadata as
 * `<meta name="DC.title" content="…">`-style tags. This parses those rather than
 * scraping visible markup, which is more stable across template changes.
 */
function parseIndiaCodeHtml(html: string, url: string): IndiaCodeRecord {
  const meta = (name: string): string | undefined => {
    const match = html.match(
      new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    );
    return match?.[1];
  };

  const title = meta('DC.title') ?? meta('citation_title');
  const dateIssued = meta('DC.date.issued') ?? meta('citation_date');

  if (!title || !dateIssued) {
    throw new Error(
      `Could not find expected DSpace metadata tags at ${url}. Fail closed: refusing to guess ` +
        `title or year from unstructured HTML.`,
    );
  }

  const year = Number.parseInt(dateIssued.slice(0, 4), 10);
  if (!Number.isFinite(year)) {
    throw new Error(`Unparseable year "${dateIssued}" at ${url}.`);
  }

  const actNumberMatch = title.match(/Act No\.?\s*(\d+)\s*of\s*(\d{4})/i);

  return {
    officialTextUrl: url,
    title: title.trim(),
    actNumber: actNumberMatch ? actNumberMatch[1] : '',
    year,
    kind: LawKind.ACT,
    status: LawStatus.ENACTED,
    level: LawLevel.CENTRAL,
  };
}

/**
 * Builds an `IndiaCodeRecord` from a manually verified minimal input, applying the
 * same parsing rules `parseIndiaCodeHtml` would (e.g. extracting the Act number from
 * the title). Used by `prisma/seed.ts` for the Phase 0 proof record, where a human —
 * not the live fetcher — confirmed the URL and title are correct (see the file
 * header and docs/SOURCES_LEGAL.md).
 */
export function normalizeIndiaCodeRecord(input: {
  officialTextUrl: string;
  title: string;
  year: number;
  kind?: LawKind;
  status?: LawStatus;
  level?: LawLevel;
  subjectArea?: string;
}): IndiaCodeRecord {
  const actNumberMatch = input.title.match(/Act No\.?\s*(\d+)\s*of\s*(\d{4})/i);

  return {
    officialTextUrl: input.officialTextUrl,
    title: input.title.trim(),
    actNumber: actNumberMatch ? actNumberMatch[1] : '',
    year: input.year,
    kind: input.kind ?? LawKind.ACT,
    status: input.status ?? LawStatus.ENACTED,
    level: input.level ?? LawLevel.CENTRAL,
    subjectArea: input.subjectArea,
  };
}

/**
 * Writes one India Code record into the schema: the Law row plus its primary
 * Citation, in a single transaction, and re-runs cleanly (upsert on
 * `officialTextUrl`, which is unique) so ingestion stays idempotent — the auto-
 * currency guardrail depends on this updating a record in place, never duplicating it.
 *
 * `publish: true` requests PUBLISHED once a plain-language summary is authored and
 * passes the gate in src/lib/publish.ts; Phase 0 leaves the summary unwritten and the
 * record at DRAFT, which is correct — the citation proves sourcing, not authorship.
 */
export async function upsertLaw(
  db: PrismaClient,
  record: IndiaCodeRecord,
  options: { plainSummary?: string; publish?: boolean } = {},
) {
  return db.$transaction(async (tx) => {
    const law = await tx.law.upsert({
      where: { officialTextUrl: record.officialTextUrl },
      create: {
        title: record.title,
        kind: record.kind,
        status: record.status,
        level: record.level,
        year: record.year,
        subjectArea: record.subjectArea,
        officialTextUrl: record.officialTextUrl,
        plainSummary: options.plainSummary,
        lastVerifiedAt: new Date(),
      },
      update: {
        title: record.title,
        status: record.status,
        year: record.year,
        subjectArea: record.subjectArea,
        plainSummary: options.plainSummary,
        lastVerifiedAt: new Date(),
      },
    });

    await tx.citation.upsert({
      where: {
        entityType_entityId_field_sourceUrl: {
          entityType: 'LAW',
          entityId: law.id,
          field: 'plainSummary',
          sourceUrl: record.officialTextUrl,
        },
      },
      create: {
        entityType: 'LAW',
        entityId: law.id,
        field: 'plainSummary',
        sourceName: SOURCE_NAME,
        sourceUrl: record.officialTextUrl,
        isPrimary: true,
      },
      // Re-running the adapter refreshes retrievedAt rather than inserting a duplicate.
      update: { retrievedAt: new Date() },
    });

    if (options.publish) {
      const summaryStatus = await resolvePublishStatus(tx, 'LAW', law.id, 'PUBLISHED');
      return tx.law.update({ where: { id: law.id }, data: { summaryStatus } });
    }

    return law;
  });
}

export type { Prisma };
