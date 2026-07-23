/**
 * Static editorial content for the Constitution of India page. Not DB-backed — there
 * is no repeating "Constitution" entity, so this is a single reviewed content file per
 * the project's content/ convention, imported directly by the page.
 */

export type ConstitutionEdition = {
  languageCode: string; // BCP-47ish tag: 'en', 'hi', 'kn'
  languageName: string;
  fileUrl: string;
};

// Only editions with a verified, official (legislative.gov.in) PDF link ship here.
// See docs/SOURCES_LEGAL.md for the sourcing attempt log.
export const CONSTITUTION_EDITIONS: ConstitutionEdition[] = [
  {
    languageCode: 'en',
    languageName: 'English',
    fileUrl: 'https://www.legislative.gov.in/static/uploads/2025/07/359f70a69695affb9d72f8393102bd2e.pdf',
  },
  {
    languageCode: 'hi',
    languageName: 'Hindi',
    fileUrl: 'https://www.legislative.gov.in/static/uploads/2025/07/ca7ce5c746fa7480804bbdeb6cb704f0.pdf',
  },
  {
    // Same file as the English edition — a diglot (English–Kannada) printing,
    // not a separate PDF. Confirmed by manual inspection (2026-07-23); the
    // automated fetch used for English/Hindi couldn't verify this itself, see
    // docs/SOURCES_LEGAL.md.
    languageCode: 'kn',
    languageName: 'Kannada',
    fileUrl: 'https://www.legislative.gov.in/static/uploads/2025/07/359f70a69695affb9d72f8393102bd2e.pdf',
  },
];

export const CONSTITUTION_CITATION = {
  sourceName: 'Legislative Department, Ministry of Law and Justice, Government of India',
  sourceUrl: 'https://www.legislative.gov.in/constitution-of-india',
  isPrimary: true,
};

// The date this page's content and its PDF links were last checked against the
// official source, not a publication date of the Constitution itself.
export const CONSTITUTION_LAST_VERIFIED = new Date('2026-07-22');

export type ConstitutionPart = {
  part: string;
  subject: string;
};

// A representative, not exhaustive, list of the Constitution's major divisions —
// picked for what a citizen is most likely to look up, not a full reproduction of
// all 22 Parts and 12 Schedules.
export const CONSTITUTION_PARTS: ConstitutionPart[] = [
  { part: 'Preamble', subject: 'States the Constitution’s objectives and the values it is built on.' },
  { part: 'Part I', subject: 'The Union and its territory (Articles 1–4).' },
  { part: 'Part II', subject: 'Citizenship (Articles 5–11).' },
  { part: 'Part III', subject: 'Fundamental Rights (Articles 12–35).' },
  { part: 'Part IV', subject: 'Directive Principles of State Policy (Articles 36–51).' },
  { part: 'Part IV-A', subject: 'Fundamental Duties of every citizen (Article 51-A).' },
  { part: 'Part V', subject: 'The Union: the President, Parliament, and the Union judiciary (Articles 52–151).' },
  { part: 'Part VI', subject: 'The States: governors, state legislatures, and the High Courts (Articles 152–237).' },
  { part: 'Part IX', subject: 'Panchayats: rural local self-government (Articles 243–243-O).' },
  { part: 'Part IX-A', subject: 'Municipalities: urban local self-government (Articles 243-P–243-ZG).' },
  { part: 'Part XV', subject: 'Elections and the Election Commission (Articles 324–329-A).' },
  { part: 'Part XX', subject: 'Procedure for amending the Constitution (Article 368).' },
  {
    part: 'Schedules',
    subject:
      'Twelve Schedules, including the States and Union Territories (First), the division of law-making powers between the Union and the States (Seventh), and the 22 officially recognised languages (Eighth).',
  },
];
