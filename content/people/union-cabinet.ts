/**
 * The Prime Minister and the 30 Cabinet Ministers of the Union Council of
 * Ministers — the "Union Cabinet" proper, as distinct from Ministers of State.
 *
 * Verified live against the official source on 2026-07-21 (see PMINDIA_SOURCE_URL
 * below) rather than recalled — current office-holders are exactly the kind of
 * fact this directory's "sourced or it doesn't ship" guardrail exists for, and
 * this data sits well past this assistant's training cutoff. Ministers of State
 * (Independent Charge) and Ministers of State are a distinct administrative tier,
 * deliberately left for a follow-up ingestion pass rather than folded in here.
 *
 * `portfolios` names must match an entry in UNION_MINISTRIES
 * (content/institutions/national.ts) exactly — the seeding code resolves each one
 * to its Institution by name and throws if it can't find one, rather than silently
 * skipping a portfolio.
 *
 * `bio` is career history (prior offices, party role) — stable biographical fact,
 * not the fast-changing "who holds what today" claim, so it draws on general
 * knowledge rather than a fresh per-person search. Each is deliberately narrow to
 * well-established, undisputed facts (dates of prior office, constituency) rather
 * than anything that could be wrong in a way that matters. Cited to the same
 * official PMO portfolio page as the currentPosition fact (no per-person official
 * biography page could be found efficiently for all 31 people) — see
 * docs/SOURCES_LEGAL.md.
 */

export const PM_SOURCE_URL = 'https://www.pmindia.gov.in/en/pms-profile/';
export const CABINET_SOURCE_URL =
  'https://www.pmindia.gov.in/en/news_updates/portfolios-of-the-union-council-of-ministers-2/';

/**
 * Party affiliation isn't listed on the PMO's own portfolio page, so each
 * non-BJP entry below was individually verified against a dedicated source
 * (official party site, PIB, or the ministry's own channel) on 2026-07-22 —
 * an earlier aggregated web search wrongly attributed a second TDP cabinet
 * seat and misattributed Pralhad Joshi to TDP, so each coalition-partner
 * minister was re-checked one at a time rather than trusting that summary.
 * Everyone not listed as a coalition partner here is BJP.
 */
export type PartyKey = 'BJP' | 'JDS' | 'JDU' | 'HAM' | 'LJPRV' | 'TDP';

export const PARTIES: Record<PartyKey, { name: string; abbreviation: string }> = {
  BJP: { name: 'Bharatiya Janata Party', abbreviation: 'BJP' },
  JDS: { name: 'Janata Dal (Secular)', abbreviation: 'JD(S)' },
  JDU: { name: 'Janata Dal (United)', abbreviation: 'JD(U)' },
  HAM: { name: 'Hindustani Awam Morcha (Secular)', abbreviation: 'HAM(S)' },
  LJPRV: { name: 'Lok Janshakti Party (Ram Vilas)', abbreviation: 'LJP(RV)' },
  TDP: { name: 'Telugu Desam Party', abbreviation: 'TDP' },
};

export const PRIME_MINISTER = {
  fullName: 'Narendra Modi',
  sourceKey: 'pmindia:narendra-modi',
  party: 'BJP' as PartyKey,
  officialUrl: 'https://www.pmindia.gov.in/en/pms-profile/',
  bio: 'Narendra Modi has been Prime Minister of India since 26 May 2014, beginning a third consecutive term after the 2024 general election. He served as Chief Minister of Gujarat from 2001 to 2014 before entering national politics, and represents the Varanasi constituency in the Lok Sabha.',
};

export type CabinetMinisterSeed = {
  fullName: string;
  sourceKey: string;
  portfolios: string[];
  party: PartyKey;
  officialUrl?: string;
  bio?: string;
};

export const CABINET_MINISTERS: CabinetMinisterSeed[] = [
  {
    fullName: 'Raj Nath Singh',
    sourceKey: 'pmindia:raj-nath-singh',
    portfolios: ['Defence'],
    party: 'BJP',
    officialUrl: 'https://mod.gov.in/',
    bio: 'Raj Nath Singh has been Union Minister of Defence since 2019. He previously served as Union Home Minister (2014-2019), as national president of the Bharatiya Janata Party, and as Chief Minister of Uttar Pradesh (2000-2002). He represents the Lucknow constituency in the Lok Sabha.',
  },
  {
    fullName: 'Amit Shah',
    sourceKey: 'pmindia:amit-shah',
    portfolios: ['Home Affairs', 'Cooperation'],
    party: 'BJP',
    officialUrl: 'https://www.mha.gov.in/',
    bio: 'Amit Shah has been Union Minister of Home Affairs since 2019 and additionally holds the Cooperation portfolio, created in 2021. He served as national president of the Bharatiya Janata Party from 2014 to 2020 and represents the Gandhinagar constituency in the Lok Sabha.',
  },
  {
    fullName: 'Nitin Jairam Gadkari',
    sourceKey: 'pmindia:nitin-jairam-gadkari',
    portfolios: ['Road Transport and Highways'],
    party: 'BJP',
    officialUrl: 'https://morth.nic.in/',
    bio: 'Nitin Gadkari has held the Road Transport and Highways portfolio continuously since 2014, and previously served as national president of the Bharatiya Janata Party. He represents the Nagpur constituency in the Lok Sabha.',
  },
  {
    fullName: 'Jagat Prakash Nadda',
    sourceKey: 'pmindia:jagat-prakash-nadda',
    portfolios: ['Health and Family Welfare', 'Chemicals and Fertilizers'],
    party: 'BJP',
    bio: 'J.P. Nadda is the national president of the Bharatiya Janata Party and previously served as Union Minister of Health and Family Welfare from 2019 to 2021, a portfolio he returned to in 2024. He is a member of the Rajya Sabha.',
  },
  {
    fullName: 'Shivraj Singh Chouhan',
    sourceKey: 'pmindia:shivraj-singh-chouhan',
    portfolios: ['Agriculture and Farmers Welfare', 'Rural Development'],
    party: 'BJP',
    bio: 'Shivraj Singh Chouhan served as Chief Minister of Madhya Pradesh across four terms between 2005 and 2023, one of the longest tenures of any Indian state Chief Minister, before joining the Union Cabinet in 2024.',
  },
  {
    fullName: 'Nirmala Sitharaman',
    sourceKey: 'pmindia:nirmala-sitharaman',
    portfolios: ['Finance', 'Corporate Affairs'],
    party: 'BJP',
    officialUrl: 'https://www.finmin.nic.in/',
    bio: 'Nirmala Sitharaman has been Union Minister of Finance and Corporate Affairs since 2019, India’s first full-time woman to hold the finance portfolio. She previously served as Union Minister of Defence (2017-2019) and is a member of the Rajya Sabha.',
  },
  {
    fullName: 'Subrahmanyam Jaishankar',
    sourceKey: 'pmindia:subrahmanyam-jaishankar',
    portfolios: ['External Affairs'],
    party: 'BJP',
    officialUrl: 'https://www.mea.gov.in/',
    bio: 'S. Jaishankar has been Union Minister of External Affairs since 2019. Before entering politics he served as India’s Foreign Secretary and as Ambassador to the United States and China, and is a member of the Rajya Sabha.',
  },
  {
    fullName: 'Manohar Lal',
    sourceKey: 'pmindia:manohar-lal',
    portfolios: ['Housing and Urban Affairs', 'Power'],
    party: 'BJP',
    bio: 'Manohar Lal (Khattar) served as Chief Minister of Haryana from 2014 to 2024 before joining the Union Cabinet. He represents the Karnal constituency in the Lok Sabha.',
  },
  {
    fullName: 'H. D. Kumaraswamy',
    sourceKey: 'pmindia:hd-kumaraswamy',
    portfolios: ['Heavy Industries', 'Steel'],
    party: 'JDS',
    bio: 'H.D. Kumaraswamy has twice served as Chief Minister of Karnataka (2006-2007 and 2018-2019) and leads the Janata Dal (Secular). He is the son of former Prime Minister H.D. Deve Gowda and represents the Mandya constituency in the Lok Sabha.',
  },
  {
    fullName: 'Piyush Goyal',
    sourceKey: 'pmindia:piyush-goyal',
    portfolios: ['Commerce and Industry'],
    party: 'BJP',
    officialUrl: 'https://commerce.gov.in/',
    bio: 'Piyush Goyal has held the Commerce and Industry portfolio since 2019, and previously served as Union Minister of Railways and, on an additional-charge basis, Finance Minister. He is a member of the Rajya Sabha.',
  },
  {
    fullName: 'Dharmendra Pradhan',
    sourceKey: 'pmindia:dharmendra-pradhan',
    portfolios: ['Education'],
    party: 'BJP',
    officialUrl: 'https://www.education.gov.in/',
    bio: 'Dharmendra Pradhan has been Union Minister of Education since 2021, having previously held the Petroleum and Natural Gas portfolio, during which he oversaw the Pradhan Mantri Ujjwala Yojana LPG connection scheme. He is from Odisha.',
  },
  {
    fullName: 'Jitan Ram Manjhi',
    sourceKey: 'pmindia:jitan-ram-manjhi',
    portfolios: ['Micro, Small and Medium Enterprises'],
    party: 'HAM',
    bio: 'Jitan Ram Manjhi served as Chief Minister of Bihar from 2014 to 2015 and founded the Hindustani Awam Morcha (Secular) after leaving the Janata Dal (United). He represents the Gaya constituency in the Lok Sabha.',
  },
  {
    fullName: 'Rajiv Ranjan Singh (Lalan Singh)',
    sourceKey: 'pmindia:rajiv-ranjan-singh',
    portfolios: ['Panchayati Raj', 'Fisheries, Animal Husbandry and Dairying'],
    party: 'JDU',
    bio: 'Rajiv Ranjan Singh, widely known as Lalan Singh, is national president of the Janata Dal (United) and a longtime associate of Bihar Chief Minister Nitish Kumar. He represents the Munger constituency in the Lok Sabha.',
  },
  {
    fullName: 'Sarbananda Sonowal',
    sourceKey: 'pmindia:sarbananda-sonowal',
    portfolios: ['Ports, Shipping and Waterways'],
    party: 'BJP',
    bio: 'Sarbananda Sonowal served as Chief Minister of Assam from 2016 to 2021 before joining the Union Cabinet, where he has held the Ports, Shipping and Waterways portfolio since 2021. He represents the Dibrugarh constituency in the Lok Sabha.',
  },
  {
    fullName: 'Virendra Kumar',
    sourceKey: 'pmindia:virendra-kumar',
    portfolios: ['Social Justice and Empowerment'],
    party: 'BJP',
    bio: 'Virendra Kumar has represented the Tikamgarh constituency in Madhya Pradesh in the Lok Sabha across multiple terms and has held the Social Justice and Empowerment portfolio since 2021.',
  },
  {
    fullName: 'Kinjarapu Rammohan Naidu',
    sourceKey: 'pmindia:kinjarapu-rammohan-naidu',
    portfolios: ['Civil Aviation'],
    party: 'TDP',
    bio: 'Kinjarapu Rammohan Naidu is a Telugu Desam Party leader who, on joining the Union Cabinet in 2024, became one of its youngest-ever Cabinet Ministers. He represents the Srikakulam constituency in Andhra Pradesh in the Lok Sabha.',
  },
  {
    fullName: 'Pralhad Joshi',
    sourceKey: 'pmindia:pralhad-joshi',
    portfolios: ['Consumer Affairs, Food and Public Distribution', 'New and Renewable Energy'],
    party: 'BJP',
    bio: 'Pralhad Joshi has represented the Dharwad constituency in Karnataka in the Lok Sabha across five consecutive terms, and has previously held the Parliamentary Affairs, Coal, and Mines portfolios.',
  },
  {
    fullName: 'Jual Oram',
    sourceKey: 'pmindia:jual-oram',
    portfolios: ['Tribal Affairs'],
    party: 'BJP',
    bio: 'Jual Oram has held the Tribal Affairs portfolio across several BJP-led governments, including as its first-ever minister when the ministry was created in 1999. He represents a constituency in Odisha.',
  },
  {
    fullName: 'Giriraj Singh',
    sourceKey: 'pmindia:giriraj-singh',
    portfolios: ['Textiles'],
    party: 'BJP',
    bio: 'Giriraj Singh has previously held the Rural Development, Panchayati Raj, Animal Husbandry and Fisheries portfolios in the Union Cabinet. He represents the Begusarai constituency in Bihar in the Lok Sabha.',
  },
  {
    fullName: 'Ashwini Vaishnaw',
    sourceKey: 'pmindia:ashwini-vaishnaw',
    portfolios: ['Railways', 'Information and Broadcasting', 'Electronics and Information Technology'],
    party: 'BJP',
    officialUrl: 'https://indianrailways.gov.in/',
    bio: 'Ashwini Vaishnaw, a former IAS officer, has held the Railways portfolio since 2021 alongside Electronics and Information Technology, and additionally took on Information and Broadcasting in 2024. He is a member of the Rajya Sabha from Odisha.',
  },
  {
    fullName: 'Jyotiraditya M. Scindia',
    sourceKey: 'pmindia:jyotiraditya-scindia',
    portfolios: ['Communications', 'Development of North Eastern Region'],
    party: 'BJP',
    bio: 'Jyotiraditya Scindia, a member of the former royal family of Gwalior, joined the BJP in 2020 after previously serving as a Congress MP and Union Minister. He earlier held the Civil Aviation portfolio and is a member of the Rajya Sabha.',
  },
  {
    fullName: 'Bhupender Yadav',
    sourceKey: 'pmindia:bhupender-yadav',
    portfolios: ['Environment, Forest and Climate Change'],
    party: 'BJP',
    bio: 'Bhupender Yadav has held the Environment, Forest and Climate Change portfolio since 2021, having previously served as Union Minister of Labour and Employment. He is a member of the Rajya Sabha and a longtime BJP organisational strategist.',
  },
  {
    fullName: 'Gajendra Singh Shekhawat',
    sourceKey: 'pmindia:gajendra-singh-shekhawat',
    portfolios: ['Culture', 'Tourism'],
    party: 'BJP',
    bio: 'Gajendra Singh Shekhawat previously held the Jal Shakti portfolio from the ministry’s creation in 2019 until 2024. He represents the Jodhpur constituency in Rajasthan in the Lok Sabha.',
  },
  {
    fullName: 'Annpurna Devi',
    sourceKey: 'pmindia:annpurna-devi',
    portfolios: ['Women and Child Development'],
    party: 'BJP',
    bio: 'Annpurna Devi has held the Women and Child Development portfolio since 2024. She represents the Koderma constituency in Jharkhand in the Lok Sabha.',
  },
  {
    fullName: 'Kiren Rijiju',
    sourceKey: 'pmindia:kiren-rijiju',
    portfolios: ['Parliamentary Affairs', 'Minority Affairs'],
    party: 'BJP',
    bio: 'Kiren Rijiju has previously held the Law and Justice and Earth Sciences portfolios in the Union Cabinet, and represented India internationally as a national-level badminton player before entering politics. He represents the Arunachal West constituency in the Lok Sabha.',
  },
  {
    fullName: 'Hardeep Singh Puri',
    sourceKey: 'pmindia:hardeep-singh-puri',
    portfolios: ['Petroleum and Natural Gas'],
    party: 'BJP',
    bio: 'Hardeep Singh Puri, a former Indian Foreign Service officer, served as India’s Permanent Representative to the United Nations before entering politics. He has held the Petroleum and Natural Gas portfolio since 2021 and is a member of the Rajya Sabha.',
  },
  {
    fullName: 'Mansukh Mandaviya',
    sourceKey: 'pmindia:mansukh-mandaviya',
    portfolios: ['Labour and Employment', 'Youth Affairs and Sports'],
    party: 'BJP',
    bio: 'Mansukh Mandaviya previously served as Union Minister of Health and Family Welfare from 2021 to 2024, a period that included India’s COVID-19 vaccination programme. He is a member of the Rajya Sabha from Gujarat.',
  },
  {
    fullName: 'G. Kishan Reddy',
    sourceKey: 'pmindia:g-kishan-reddy',
    portfolios: ['Coal', 'Mines'],
    party: 'BJP',
    bio: 'G. Kishan Reddy previously held the Tourism, Culture, and Development of North Eastern Region portfolios. He represents the Secunderabad constituency in Telangana in the Lok Sabha.',
  },
  {
    fullName: 'Chirag Paswan',
    sourceKey: 'pmindia:chirag-paswan',
    portfolios: ['Food Processing Industries'],
    party: 'LJPRV',
    bio: 'Chirag Paswan leads the Lok Janshakti Party (Ram Vilas), which he founded following the death of his father, longtime Union Minister Ram Vilas Paswan. He represents the Hajipur constituency in Bihar in the Lok Sabha.',
  },
  {
    fullName: 'C R Patil',
    sourceKey: 'pmindia:cr-patil',
    portfolios: ['Jal Shakti'],
    party: 'BJP',
    bio: 'C.R. Patil has served as the Bharatiya Janata Party’s Gujarat state president and represents the Navsari constituency in the Lok Sabha, a seat he has held by large majorities since 2014.',
  },
];
