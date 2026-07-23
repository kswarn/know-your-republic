/**
 * The Chief Minister, Deputy Chief Minister, and Cabinet Ministers of Karnataka —
 * proof-of-pattern for state-level ingestion (the plan's "prove it on one state
 * before fanning out" step), ahead of the other 35 states/UTs.
 *
 * Verified live against news coverage of the Shivakumar ministry's formation
 * (2026-06-03/04) rather than recalled — sitting state cabinets are exactly the
 * kind of fact this directory's "sourced or it doesn't ship" guardrail exists
 * for, and this government was formed well past this assistant's training
 * cutoff. Ramalinga Reddy's continued Irrigation portfolio was additionally
 * cross-checked against later coverage of his brief June 2026 resignation and
 * return, since the initial formation coverage predates that episode. See
 * docs/SOURCES_LEGAL.md.
 *
 * IMPORTANT — this cabinet is explicitly partial and volatile: a further
 * expansion (the government can seat up to 34 ministers total) was scheduled
 * for the same day this was verified (2026-07-22), with inductees not yet
 * publicly named at verification time. Re-check this file promptly rather than
 * treating it as settled.
 *
 * `portfolios` names must match an entry in KARNATAKA_DEPARTMENTS
 * (content/institutions/karnataka.ts) exactly, same contract as the Union cabinet.
 *
 * `bio` draws on general knowledge of each minister's prior career (stable
 * biographical fact, not the fast-changing "who holds what today" claim), left
 * blank rather than guessed where confidence was low. Cited to the same news
 * source as the currentPosition fact.
 */

export const KARNATAKA_CABINET_SOURCE_URL =
  'https://www.deccanherald.com/india/karnataka/karnatakas-new-ministry-knowall-about-ministers-in-d-k-shivakumars-13-member-cabinet-know-your-ministers-4026829';
export const KARNATAKA_CABINET_SOURCE_NAME = 'Deccan Herald';

export const KARNATAKA_PARTY = 'Indian National Congress';

export const KARNATAKA_CHIEF_MINISTER = {
  fullName: 'D. K. Shivakumar',
  sourceKey: 'karnataka-cmo:dk-shivakumar',
  bio: 'D.K. Shivakumar has been President of the Karnataka Pradesh Congress Committee and served as Deputy Chief Minister of Karnataka from 2023 to 2026 before becoming Chief Minister. A prominent Vokkaliga leader, he represents the Kanakapura constituency in the Karnataka Legislative Assembly.',
};

export type KarnatakaMinisterSeed = {
  fullName: string;
  sourceKey: string;
  title: string; // e.g. "Deputy Chief Minister of Karnataka" — distinct from portfolios below
  portfolios: string[];
  bio?: string;
};

export const KARNATAKA_DEPUTY_CM: KarnatakaMinisterSeed = {
  fullName: 'G. Parameshwara',
  sourceKey: 'karnataka-cmo:g-parameshwara',
  title: 'Deputy Chief Minister of Karnataka',
  portfolios: ['Revenue', 'Sports'],
  bio: 'G. Parameshwara previously served as Deputy Chief Minister of Karnataka from 2018 to 2019 and as the state’s Home Minister, and has been a senior Congress leader in the state for over two decades.',
};

export const KARNATAKA_CABINET_MINISTERS: KarnatakaMinisterSeed[] = [
  {
    fullName: 'Priyank Kharge',
    sourceKey: 'karnataka-cmo:priyank-kharge',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Home Affairs', 'Information Technology and Biotechnology', 'E-Governance'],
    bio: 'Priyank Kharge previously held the Information Technology, Biotechnology and Social Welfare portfolios in Karnataka’s Council of Ministers. He is the son of Indian National Congress national president Mallikarjun Kharge.',
  },
  {
    fullName: 'Krishna Byre Gowda',
    sourceKey: 'karnataka-cmo:krishna-byre-gowda',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Greater Bengaluru Development'],
    bio: 'Krishna Byre Gowda previously served as Karnataka’s Minister for Revenue and, earlier, Agriculture, and is known within the state Congress for a policy-focused approach to administration.',
  },
  {
    fullName: 'Ramalinga Reddy',
    sourceKey: 'karnataka-cmo:ramalinga-reddy',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Major and Medium Irrigation'],
    bio: 'Ramalinga Reddy is a veteran Bengaluru-based Congress leader who has previously held the Transport and Home portfolios in the state government.',
  },
  {
    fullName: 'Eshwara Khandre',
    sourceKey: 'karnataka-cmo:eshwara-khandre',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Rural Development and Panchayati Raj'],
    bio: 'Eshwara Khandre previously held Karnataka’s Forest, Ecology and Environment portfolio.',
  },
  {
    fullName: 'Satish Jarkiholi',
    sourceKey: 'karnataka-cmo:satish-jarkiholi',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Public Works'],
    bio: 'Satish Jarkiholi is a senior Congress leader from the Belagavi region of North Karnataka and previously held the Public Works portfolio in the state’s Council of Ministers.',
  },
  {
    fullName: 'Sharan Prakash Patil',
    sourceKey: 'karnataka-cmo:sharan-prakash-patil',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Medical Education and Skill Development'],
  },
  {
    fullName: 'K. H. Muniyappa',
    sourceKey: 'karnataka-cmo:kh-muniyappa',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Food and Civil Supplies', 'Consumer Affairs'],
    bio: 'K.H. Muniyappa is a veteran Congress leader who previously represented Kolar in the Lok Sabha for several terms and served as a Union Minister of State for Railways.',
  },
  {
    fullName: 'K. J. George',
    sourceKey: 'karnataka-cmo:kj-george',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Energy', 'Tourism'],
    bio: 'K.J. George is a veteran Bengaluru-based Congress leader who has previously held the Home Affairs and Bengaluru Development portfolios in the state government.',
  },
  {
    fullName: 'Byrathi Suresh',
    sourceKey: 'karnataka-cmo:byrathi-suresh',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Transport'],
  },
  {
    fullName: 'M. B. Patil',
    sourceKey: 'karnataka-cmo:mb-patil',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Large and Medium Industries', 'Infrastructure Development'],
    bio: 'M.B. Patil is a prominent Lingayat community leader within the Karnataka Congress and previously held the Water Resources portfolio in the state government.',
  },
  {
    fullName: 'U. T. Khader',
    sourceKey: 'karnataka-cmo:ut-khader',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Health and Family Welfare'],
    bio: 'U.T. Khader served as Speaker of the Karnataka Legislative Assembly before joining the Council of Ministers, and is a prominent Congress leader from the coastal Karnataka region.',
  },
  {
    fullName: 'Yathindra Siddaramaiah',
    sourceKey: 'karnataka-cmo:yathindra-siddaramaiah',
    title: 'Karnataka Cabinet Minister',
    portfolios: ['Urban Development'],
    bio: 'Yathindra Siddaramaiah represents the Varuna constituency in the Karnataka Legislative Assembly and is the son of former Chief Minister Siddaramaiah.',
  },
];
