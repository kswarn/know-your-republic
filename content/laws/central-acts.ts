/**
 * A handful of well-known central Acts, in addition to the Right to Information
 * Act, 2005 seeded in Phase 0. Chosen for being stable, foundational statutes —
 * what they provide for is settled, unlike a current office-holder — and
 * verified against India Code via search-engine indexing rather than a live
 * fetch, for the same reason documented in docs/SOURCES_LEGAL.md (India Code's
 * item pages currently block automated fetches from this environment).
 *
 * `relatedRightSlug`, where present, matches a slug in
 * content/rights/fundamental-rights.ts — the seed script uses it to set
 * Right.relatedLawId after both are in the database.
 */

export type CentralActSeed = {
  officialTextUrl: string;
  title: string;
  year: number;
  subjectArea: string;
  plainSummary: string;
  relatedRightSlug?: string;
};

export const CENTRAL_ACTS: CentralActSeed[] = [
  {
    officialTextUrl: 'https://www.indiacode.nic.in/handle/123456789/2086',
    title: 'The Right of Children to Free and Compulsory Education Act, 2009 (Act No. 35 of 2009)',
    year: 2009,
    subjectArea: 'Education',
    relatedRightSlug: 'right-to-education',
    plainSummary:
      'This Act gives effect to Article 21A of the Constitution: every child between six and ' +
      'fourteen years of age has the right to free and compulsory education at a neighbourhood ' +
      "school, until they complete elementary education. It fixes the appropriate government's " +
      'and local authority\'s duty to establish such schools, sets minimum norms a school must ' +
      'meet — including a prescribed pupil-teacher ratio and infrastructure standards — and ' +
      'prohibits a school from holding back, expelling, or requiring a child to pass a board ' +
      'examination before completing elementary education.',
  },
  {
    officialTextUrl: 'https://www.indiacode.nic.in/handle/123456789/1544',
    title: 'The Protection of Civil Rights Act, 1955 (Act No. 22 of 1955)',
    year: 1955,
    subjectArea: 'Civil rights',
    relatedRightSlug: 'abolition-of-untouchability',
    plainSummary:
      'This Act gives effect to Article 17 of the Constitution, which abolishes untouchability. ' +
      'It makes it an offence to enforce a religious or social disability on grounds of ' +
      'untouchability — including refusing a person entry to a place of worship, a shop, a ' +
      'restaurant, or a hospital, or refusing to sell goods or render a service — and prescribes ' +
      'penalties for each such offence.',
  },
  {
    officialTextUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
    title: 'The Consumer Protection Act, 2019 (Act No. 35 of 2019)',
    year: 2019,
    subjectArea: 'Consumer protection',
    plainSummary:
      "This Act provides for the protection of a consumer's interests and establishes " +
      'authorities to resolve consumer disputes. It creates the Central Consumer Protection ' +
      'Authority, empowered to investigate and act against unfair trade practices and false or ' +
      'misleading advertisements, and a three-tier Consumer Disputes Redressal Commission — at ' +
      'district, state, and national level — where a consumer may file a complaint. It also ' +
      'introduces liability for a manufacturer or seller of a defective product that causes harm.',
  },
  {
    officialTextUrl: 'https://www.indiacode.nic.in/handle/123456789/1999',
    title: 'The Information Technology Act, 2000 (Act No. 21 of 2000)',
    year: 2000,
    subjectArea: 'Information technology',
    plainSummary:
      'This Act gives legal recognition to electronic records and digital signatures, so a ' +
      'transaction or record is not denied legal effect only because it is in electronic form. ' +
      'It establishes Certifying Authorities to issue digital signature certificates, creates a ' +
      'Cyber Appellate Tribunal for disputes arising under the Act, and defines offences ' +
      'including unauthorised access to a computer system, computer-related fraud, and cyber ' +
      'terrorism, with corresponding penalties.',
  },
];
