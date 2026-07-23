import type { Institution, Jurisdiction, Party, Person, Position, Tenure } from '@/generated/prisma';
import { personSlug } from '@/lib/people';

export type House = 'Lok Sabha' | 'Rajya Sabha' | 'Government';

export type RepresentativePoint = {
  id: string;
  slug: string | null;
  fullName: string;
  photoUrl: string | null;
  partyName: string | null;
  partyAbbreviation: string | null;
  house: House;
  state: string | null;
  constituency: string | null;
};

type TenureWithPosition = Tenure & {
  position: Position & { institution: Institution; jurisdiction: Jurisdiction | null };
};

type PersonWithTenures = Person & { party: Party | null; tenures: TenureWithPosition[] };

const CONSTITUENCY_PATTERN = /\(([^)]+)\)\s*$/;

/**
 * Flattens a Person + current Tenures into the flat shape the representatives
 * chart needs. A Lok Sabha seat (named constituency) takes precedence over a
 * Rajya Sabha one (state-wide, no constituency) for "house"/"state" if someone
 * somehow held both; falls back to whatever tenure exists (e.g. a state
 * minister with no Lok Sabha/Rajya Sabha seat) for people who aren't MPs.
 */
export function toRepresentativePoint(person: PersonWithTenures): RepresentativePoint {
  const lsTenure = person.tenures.find((t) => t.position.institution.name === 'Lok Sabha');
  const rsTenure = person.tenures.find((t) => t.position.institution.name === 'Rajya Sabha');
  const primaryTenure = lsTenure ?? rsTenure ?? person.tenures[0];

  const house: House = lsTenure ? 'Lok Sabha' : rsTenure ? 'Rajya Sabha' : 'Government';
  const constituencyMatch = lsTenure?.position.title.match(CONSTITUENCY_PATTERN);

  return {
    id: person.id,
    slug: personSlug(person.sourceKey),
    fullName: person.fullName,
    photoUrl: person.photoUrl,
    partyName: person.party?.name ?? null,
    partyAbbreviation: person.party?.abbreviation ?? null,
    house,
    state: primaryTenure?.position.jurisdiction?.name ?? null,
    constituency: constituencyMatch?.[1] ?? null,
  };
}
