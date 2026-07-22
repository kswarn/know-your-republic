import type { RightCategory } from '@/generated/prisma';

/**
 * Fundamental Rights — Part III of the Constitution of India (Articles 12–35).
 *
 * Editorial content, not scraped data: this is the reviewable seed file the
 * CLAUDE.md editorial flow describes — changes to this file are the review unit,
 * not a runtime admin surface. Every entry cites the Legislative Department's
 * official Constitution page; see docs/SOURCES_LEGAL.md for why that citation was
 * verified via search rather than a live fetch (the host currently times out from
 * this environment).
 *
 * Register: plain-but-professional per docs/STYLE_GUIDE.md — the mechanism, not
 * just the label; exact article citations; no adjectives of approval or
 * disapproval.
 */

const CONSTITUTION_URL = 'https://lddashboard.legislative.gov.in/constitution-of-india';

export type FundamentalRightSeed = {
  slug: string;
  title: string;
  category: RightCategory;
  articleCitation: string;
  appliesTo: string;
  plainExplanation: string;
  officialSourceUrl: string;
};

export const FUNDAMENTAL_RIGHTS: FundamentalRightSeed[] = [
  {
    slug: 'right-to-equality-before-law',
    title: 'Equality Before Law',
    category: 'EQUALITY',
    articleCitation: 'Article 14',
    appliesTo: 'Every person within the territory of India, not only citizens',
    plainExplanation:
      'The State may not deny any person equality before the law or the equal protection of the ' +
      'laws. This has two distinct guarantees: no person is above the law, and the law must treat ' +
      'people alike in like circumstances. The State may still classify people into groups for a ' +
      'law to apply differently to each — a classification is permitted only where it rests on a ' +
      'real difference relevant to the purpose of the law.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'prohibition-of-discrimination',
    title: 'Prohibition of Discrimination on Certain Grounds',
    category: 'EQUALITY',
    articleCitation: 'Article 15',
    appliesTo: 'Citizens of India',
    plainExplanation:
      'The State may not discriminate against a citizen on grounds only of religion, race, caste, ' +
      'sex, or place of birth — in access to shops, public restaurants, hotels, places of public ' +
      'entertainment, or the use of wells, roads, and places of public resort maintained wholly or ' +
      'partly out of State funds. The State may make special provision for women, children, and for ' +
      'socially and educationally backward classes, Scheduled Castes, and Scheduled Tribes.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'equality-of-opportunity-in-public-employment',
    title: 'Equality of Opportunity in Public Employment',
    category: 'EQUALITY',
    articleCitation: 'Article 16',
    appliesTo: 'Citizens of India',
    plainExplanation:
      'Every citizen has equal opportunity in matters of employment or appointment to any office ' +
      'under the State. The State may not discriminate on grounds only of religion, race, caste, ' +
      'sex, descent, place of birth, or residence in respect of any such employment. Parliament may ' +
      'set residence requirements for particular classes of employment, and the State may reserve ' +
      'posts for backward classes it considers inadequately represented in State services.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'abolition-of-untouchability',
    title: 'Abolition of Untouchability',
    category: 'EQUALITY',
    articleCitation: 'Article 17',
    appliesTo: 'Every person',
    plainExplanation:
      'Untouchability is abolished, and its practice in any form is forbidden. Enforcing any ' +
      'disability arising from untouchability is an offence punishable by law. This is given effect ' +
      'through statute, principally the Protection of Civil Rights Act, 1955.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'abolition-of-titles',
    title: 'Abolition of Titles',
    category: 'EQUALITY',
    articleCitation: 'Article 18',
    appliesTo: 'Citizens of India and the State',
    plainExplanation:
      'The State may not confer any title other than a military or academic distinction. A citizen ' +
      'may not accept a title from a foreign State. A person holding an office of profit or trust ' +
      'under the State may not accept, without the President’s consent, any present, ' +
      'emolument, or office from or under a foreign State.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'protection-of-certain-freedoms',
    title: 'Protection of Certain Freedoms',
    category: 'FREEDOM',
    articleCitation: 'Article 19',
    appliesTo: 'Citizens of India',
    plainExplanation:
      'Every citizen has the right to freedom of speech and expression; to assemble peaceably and ' +
      'without arms; to form associations or unions; to move freely throughout the territory of ' +
      'India; to reside and settle in any part of the territory of India; and to practise any ' +
      'profession, or carry on any occupation, trade, or business. The State may impose reasonable ' +
      'restrictions on each of these freedoms by law, on grounds the Constitution specifies for that ' +
      'freedom — among them the sovereignty and integrity of India, State security, public order, ' +
      'decency, morality, and relations with foreign States.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'protection-in-respect-of-conviction-for-offences',
    title: 'Protection in Respect of Conviction for Offences',
    category: 'FREEDOM',
    articleCitation: 'Article 20',
    appliesTo: 'Every person',
    plainExplanation:
      'A person may not be convicted of an offence except for violating a law in force at the time ' +
      'the act was committed, nor be subjected to a penalty greater than the law in force at that ' +
      'time provided. A person may not be prosecuted and punished for the same offence more than ' +
      'once. A person accused of an offence may not be compelled to be a witness against themself.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'right-to-life-and-personal-liberty',
    title: 'Right to Life and Personal Liberty',
    category: 'FREEDOM',
    articleCitation: 'Article 21',
    appliesTo: 'Every person',
    plainExplanation:
      'No person may be deprived of life or personal liberty except according to a procedure ' +
      'established by law. Courts have interpreted this procedure as one that must itself be fair, ' +
      'just, and reasonable, and have read into this article protections that are not separately ' +
      'named in the constitutional text, including personal dignity, privacy, and livelihood.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'right-to-education',
    title: 'Right to Education',
    category: 'FREEDOM',
    articleCitation: 'Article 21A',
    appliesTo: 'Children between six and fourteen years of age',
    plainExplanation:
      'The State shall provide free and compulsory education to every child between the ages of six ' +
      'and fourteen, in a manner the State determines by law. This article was added by the ' +
      'Constitution (Eighty-sixth Amendment) Act, 2002, and is given effect through the Right of ' +
      'Children to Free and Compulsory Education Act, 2009.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'protection-against-arrest-and-detention',
    title: 'Protection Against Arrest and Detention in Certain Cases',
    category: 'FREEDOM',
    articleCitation: 'Article 22',
    appliesTo: 'Every person who is arrested or detained',
    plainExplanation:
      'A person who is arrested must be informed, as soon as possible, of the grounds for the ' +
      'arrest, and has the right to consult and be defended by a legal practitioner of their choice. ' +
      'An arrested person must be produced before the nearest magistrate within twenty-four hours of ' +
      'the arrest, excluding travel time, and may not be detained beyond that period without the ' +
      'magistrate’s authority. These particular protections do not extend to an enemy alien, or ' +
      'to a person arrested or detained under a law providing for preventive detention, for whom the ' +
      'Constitution sets out separate, more limited safeguards.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'prohibition-of-traffic-in-human-beings-and-forced-labour',
    title: 'Prohibition of Traffic in Human Beings and Forced Labour',
    category: 'AGAINST_EXPLOITATION',
    articleCitation: 'Article 23',
    appliesTo: 'Every person',
    plainExplanation:
      'Traffic in human beings, begar, and other similar forms of forced labour are prohibited, and ' +
      'any contravention of this prohibition is an offence punishable by law. This article does not ' +
      'prevent the State from imposing compulsory service for public purposes, provided it does not ' +
      'discriminate on grounds only of religion, race, caste, or class in imposing that service.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'prohibition-of-child-labour',
    title: 'Prohibition of Child Labour in Hazardous Employment',
    category: 'AGAINST_EXPLOITATION',
    articleCitation: 'Article 24',
    appliesTo: 'Children below fourteen years of age',
    plainExplanation:
      'No child below the age of fourteen may be employed in any factory, mine, or other hazardous ' +
      'employment.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'freedom-of-conscience-and-religion',
    title: 'Freedom of Conscience and Free Profession, Practice, and Propagation of Religion',
    category: 'FREEDOM_OF_RELIGION',
    articleCitation: 'Article 25',
    appliesTo: 'Every person',
    plainExplanation:
      'Every person has freedom of conscience and the right freely to profess, practise, and ' +
      'propagate religion, subject to public order, morality, health, and the other provisions of ' +
      'this part of the Constitution. This right does not prevent the State from regulating or ' +
      'restricting any economic, financial, political, or other secular activity associated with ' +
      'religious practice, or from providing for social welfare and reform.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'freedom-to-manage-religious-affairs',
    title: 'Freedom to Manage Religious Affairs',
    category: 'FREEDOM_OF_RELIGION',
    articleCitation: 'Article 26',
    appliesTo: 'Every religious denomination or section of one',
    plainExplanation:
      'Every religious denomination, or section of one, has the right to establish and maintain ' +
      'institutions for religious and charitable purposes; to manage its own affairs in matters of ' +
      'religion; to own and acquire movable and immovable property; and to administer that property ' +
      'in accordance with law.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'freedom-from-taxation-for-religion',
    title: 'Freedom from Taxation for Promotion of a Particular Religion',
    category: 'FREEDOM_OF_RELIGION',
    articleCitation: 'Article 27',
    appliesTo: 'Every person',
    plainExplanation:
      'No person may be compelled to pay any tax whose proceeds are specifically appropriated to ' +
      'the payment of expenses for the promotion or maintenance of any particular religion or ' +
      'religious denomination.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'freedom-from-religious-instruction',
    title: 'Freedom from Religious Instruction in Certain Educational Institutions',
    category: 'FREEDOM_OF_RELIGION',
    articleCitation: 'Article 28',
    appliesTo: 'Students in certain educational institutions',
    plainExplanation:
      'No religious instruction may be provided in any educational institution wholly maintained ' +
      'out of State funds. This does not apply to an institution administered by the State but ' +
      'established under an endowment or trust that requires religious instruction to be imparted. A ' +
      'person attending a State-recognised institution, or one receiving State aid, may not be ' +
      'required to take part in religious instruction or worship there without their consent, or, if ' +
      'a minor, without their guardian’s consent.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'protection-of-interests-of-minorities',
    title: 'Protection of the Interests of Minorities',
    category: 'CULTURAL_EDUCATIONAL',
    articleCitation: 'Article 29',
    appliesTo: 'Any section of citizens with a distinct language, script, or culture',
    plainExplanation:
      'A section of citizens with a distinct language, script, or culture of its own has the right ' +
      'to conserve it. No citizen may be denied admission to any educational institution maintained ' +
      'or aided by the State on grounds only of religion, race, caste, or language.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'right-of-minorities-to-establish-educational-institutions',
    title: 'Right of Minorities to Establish and Administer Educational Institutions',
    category: 'CULTURAL_EDUCATIONAL',
    articleCitation: 'Article 30',
    appliesTo: 'Religious and linguistic minorities',
    plainExplanation:
      'All religious and linguistic minorities have the right to establish and administer ' +
      'educational institutions of their choice. In granting aid to educational institutions, the ' +
      'State may not discriminate against an institution on the ground that it is under the ' +
      'management of a religious or linguistic minority.',
    officialSourceUrl: CONSTITUTION_URL,
  },
  {
    slug: 'right-to-constitutional-remedies',
    title: 'Right to Constitutional Remedies',
    category: 'CONSTITUTIONAL_REMEDIES',
    articleCitation: 'Articles 32–35',
    appliesTo: 'Every person whose Fundamental Rights have been violated',
    plainExplanation:
      'A person may move the Supreme Court directly to enforce the rights conferred by this part of ' +
      'the Constitution, and the Supreme Court has the power to issue directions, orders, or writs — ' +
      'including habeas corpus, mandamus, prohibition, quo warranto, and certiorari — for that ' +
      'purpose. Parliament may extend this power to any other court. Parliament may by law determine ' +
      'the extent to which the rights conferred by this part apply to members of the armed forces or ' +
      'forces charged with maintaining public order, and may provide for restricting or abrogating ' +
      'them while martial law is in force in an area. This right was described in the Constituent ' +
      'Assembly by Dr. B. R. Ambedkar as the article he would never be able to part with, calling it ' +
      'the heart and soul of the Constitution.',
    officialSourceUrl: CONSTITUTION_URL,
  },
];
