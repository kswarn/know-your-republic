/**
 * Adapter for sansad.in — the official website of the Parliament of India, and
 * the primary source for sitting Lok Sabha and Rajya Sabha members (build plan
 * §5, "MPs"). Both endpoints are genuine JSON REST APIs backing the site's own
 * member-directory pages (found by inspecting the page's own network requests,
 * not documented publicly), reachable with an honest, non-browser User-Agent —
 * no WAF/bot-detection encountered here, unlike several other .gov.in sources
 * this project has hit. See docs/SOURCES_LEGAL.md.
 *
 * Deliberately thin: name, party, state/constituency, and public contact
 * details only. No bios — 784 individually-researched biographies is a
 * separate, much larger undertaking than "get every sitting MP into the
 * directory," the same scoping split already applied to the Union Cabinet
 * (structure now, prose later).
 */

const USER_AGENT = 'KnowYourRepublicBot/0.1 (+https://github.com/; civic reference directory)';

export const LOK_SABHA_SOURCE_NAME = 'Lok Sabha, Parliament of India';
export const LOK_SABHA_SOURCE_URL = 'https://sansad.in/ls/members';
export const RAJYA_SABHA_SOURCE_NAME = 'Rajya Sabha, Parliament of India';
export const RAJYA_SABHA_SOURCE_URL = 'https://sansad.in/rs/members';

export type LegislatorRecord = {
  sourceKey: string;
  fullName: string;
  partyName: string;
  partyAbbreviation: string;
  /** Matches a seeded Jurisdiction.name after normalizeStateName(); undefined for RS's "Nominated" members. */
  stateName?: string;
  /** Lok Sabha only — Rajya Sabha seats aren't individually named. */
  constituency?: string;
  email?: string;
  phone?: string;
  officeAddress?: string;
  photoUrl?: string;
};

/**
 * The two APIs spell a handful of state/UT names differently from each other
 * and from this project's own seeded Jurisdiction.name values. Everything not
 * listed here already matches.
 */
const STATE_NAME_FIXES: Record<string, string> = {
  'NCT of Delhi': 'Delhi',
  'National Capital Territory of Delhi': 'Delhi',
  'Jammu & Kashmir': 'Jammu and Kashmir',
};

function normalizeStateName(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'Nominated') return undefined;
  return STATE_NAME_FIXES[trimmed] ?? trimmed;
}

/** sansad.in obfuscates Rajya Sabha email addresses as "name[dot]here[at]sansad[dot]nic[dot]in". */
function deobfuscateEmail(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/\[dot\]/gi, '.').replace(/\[at\]/gi, '@').trim();
  return cleaned || undefined;
}

function firstNonEmpty(...values: (string | undefined | null)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

type LSApiMember = {
  mpsno: number;
  mpFirstLastName: string;
  partyFname: string;
  partySname: string;
  stateName: string;
  constName: string;
  email?: string[];
  delhiPhone?: string;
  personalPhone?: string;
  permanentFaddr?: string;
  permanentLaddr?: string;
  imageUrl?: string;
};

export async function fetchLokSabhaMembers(): Promise<LegislatorRecord[]> {
  const url =
    'https://sansad.in/api_ls/member?loksabha=18&state=&party=&gender=&ageFrom=&ageTo=&noOfTerms=' +
    '&page=1&size=600&searchText=&constituency=&sitting=1&locale=en&month=&profession=' +
    '&otherProfession=&constituencyCategory=&positionCode=&qualification=&noOfChildren=' +
    '&isFreedomFighter=&memberStatus=s';

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Lok Sabha member API returned ${response.status} for ${url}. Fail closed.`);
  }
  const data = (await response.json()) as { membersDtoList: LSApiMember[] };

  return data.membersDtoList.map((m) => ({
    sourceKey: `sansad-ls:${m.mpsno}`,
    fullName: m.mpFirstLastName,
    partyName: m.partyFname,
    partyAbbreviation: m.partySname,
    stateName: normalizeStateName(m.stateName),
    constituency: m.constName?.trim() || undefined,
    email: deobfuscateEmail(m.email?.[0]),
    phone: firstNonEmpty(m.delhiPhone, m.personalPhone),
    officeAddress: firstNonEmpty(
      [m.permanentFaddr, m.permanentLaddr].filter(Boolean).join(', '),
    ),
    photoUrl: firstNonEmpty(m.imageUrl),
  }));
}

type RSApiMember = {
  mpsno: number;
  name: string;
  party: string;
  partyCode: string;
  state: string;
  emailID?: string;
  localTele?: string;
  localAdd?: string;
  imageUrl?: string;
};

export async function fetchRajyaSabhaMembers(): Promise<LegislatorRecord[]> {
  const url =
    'https://sansad.in/api_rs/member/sitting-members?state=&party=&gender=&page=1&size=300' +
    '&mpFlag=1&ageFrom=&ageTo=&terms=&search=&locale=en&month=&ministership=&membershipFrom=' +
    '&membershipTo=&educationLevelCode=&degreeCode=&subjectCode=&profession1=&profession2=' +
    '&profession3=&noOfChildren=&nominated=';

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Rajya Sabha member API returned ${response.status} for ${url}. Fail closed.`);
  }
  const data = (await response.json()) as { records: RSApiMember[] };

  return data.records.map((m) => ({
    sourceKey: `sansad-rs:${m.mpsno}`,
    // "Abdul Wahab, Shri " -> "Shri Abdul Wahab" reads more naturally as a display name.
    fullName: reorderRSName(m.name),
    partyName: m.party.trim(),
    partyAbbreviation: m.partyCode.trim(),
    stateName: normalizeStateName(m.state),
    email: deobfuscateEmail(m.emailID),
    phone: firstNonEmpty(m.localTele),
    officeAddress: firstNonEmpty(m.localAdd),
    photoUrl: firstNonEmpty(m.imageUrl),
  }));
}

function reorderRSName(raw: string): string {
  const [last, rest] = raw.split(',').map((part) => part.trim());
  if (!rest) return last;
  return `${rest} ${last}`;
}
