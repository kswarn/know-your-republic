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
 */

export const PM_SOURCE_URL = 'https://www.pmindia.gov.in/en/pms-profile/';
export const CABINET_SOURCE_URL =
  'https://www.pmindia.gov.in/en/news_updates/portfolios-of-the-union-council-of-ministers-2/';

export const PRIME_MINISTER = {
  fullName: 'Narendra Modi',
  sourceKey: 'pmindia:narendra-modi',
};

export type CabinetMinisterSeed = {
  fullName: string;
  sourceKey: string;
  portfolios: string[];
};

export const CABINET_MINISTERS: CabinetMinisterSeed[] = [
  { fullName: 'Raj Nath Singh', sourceKey: 'pmindia:raj-nath-singh', portfolios: ['Defence'] },
  {
    fullName: 'Amit Shah',
    sourceKey: 'pmindia:amit-shah',
    portfolios: ['Home Affairs', 'Cooperation'],
  },
  {
    fullName: 'Nitin Jairam Gadkari',
    sourceKey: 'pmindia:nitin-jairam-gadkari',
    portfolios: ['Road Transport and Highways'],
  },
  {
    fullName: 'Jagat Prakash Nadda',
    sourceKey: 'pmindia:jagat-prakash-nadda',
    portfolios: ['Health and Family Welfare', 'Chemicals and Fertilizers'],
  },
  {
    fullName: 'Shivraj Singh Chouhan',
    sourceKey: 'pmindia:shivraj-singh-chouhan',
    portfolios: ['Agriculture and Farmers Welfare', 'Rural Development'],
  },
  {
    fullName: 'Nirmala Sitharaman',
    sourceKey: 'pmindia:nirmala-sitharaman',
    portfolios: ['Finance', 'Corporate Affairs'],
  },
  {
    fullName: 'Subrahmanyam Jaishankar',
    sourceKey: 'pmindia:subrahmanyam-jaishankar',
    portfolios: ['External Affairs'],
  },
  {
    fullName: 'Manohar Lal',
    sourceKey: 'pmindia:manohar-lal',
    portfolios: ['Housing and Urban Affairs', 'Power'],
  },
  {
    fullName: 'H. D. Kumaraswamy',
    sourceKey: 'pmindia:hd-kumaraswamy',
    portfolios: ['Heavy Industries', 'Steel'],
  },
  {
    fullName: 'Piyush Goyal',
    sourceKey: 'pmindia:piyush-goyal',
    portfolios: ['Commerce and Industry'],
  },
  {
    fullName: 'Dharmendra Pradhan',
    sourceKey: 'pmindia:dharmendra-pradhan',
    portfolios: ['Education'],
  },
  {
    fullName: 'Jitan Ram Manjhi',
    sourceKey: 'pmindia:jitan-ram-manjhi',
    portfolios: ['Micro, Small and Medium Enterprises'],
  },
  {
    fullName: 'Rajiv Ranjan Singh (Lalan Singh)',
    sourceKey: 'pmindia:rajiv-ranjan-singh',
    portfolios: ['Panchayati Raj', 'Fisheries, Animal Husbandry and Dairying'],
  },
  {
    fullName: 'Sarbananda Sonowal',
    sourceKey: 'pmindia:sarbananda-sonowal',
    portfolios: ['Ports, Shipping and Waterways'],
  },
  {
    fullName: 'Virendra Kumar',
    sourceKey: 'pmindia:virendra-kumar',
    portfolios: ['Social Justice and Empowerment'],
  },
  {
    fullName: 'Kinjarapu Rammohan Naidu',
    sourceKey: 'pmindia:kinjarapu-rammohan-naidu',
    portfolios: ['Civil Aviation'],
  },
  {
    fullName: 'Pralhad Joshi',
    sourceKey: 'pmindia:pralhad-joshi',
    portfolios: ['Consumer Affairs, Food and Public Distribution', 'New and Renewable Energy'],
  },
  { fullName: 'Jual Oram', sourceKey: 'pmindia:jual-oram', portfolios: ['Tribal Affairs'] },
  { fullName: 'Giriraj Singh', sourceKey: 'pmindia:giriraj-singh', portfolios: ['Textiles'] },
  {
    fullName: 'Ashwini Vaishnaw',
    sourceKey: 'pmindia:ashwini-vaishnaw',
    portfolios: ['Railways', 'Information and Broadcasting', 'Electronics and Information Technology'],
  },
  {
    fullName: 'Jyotiraditya M. Scindia',
    sourceKey: 'pmindia:jyotiraditya-scindia',
    portfolios: ['Communications', 'Development of North Eastern Region'],
  },
  {
    fullName: 'Bhupender Yadav',
    sourceKey: 'pmindia:bhupender-yadav',
    portfolios: ['Environment, Forest and Climate Change'],
  },
  {
    fullName: 'Gajendra Singh Shekhawat',
    sourceKey: 'pmindia:gajendra-singh-shekhawat',
    portfolios: ['Culture', 'Tourism'],
  },
  {
    fullName: 'Annpurna Devi',
    sourceKey: 'pmindia:annpurna-devi',
    portfolios: ['Women and Child Development'],
  },
  {
    fullName: 'Kiren Rijiju',
    sourceKey: 'pmindia:kiren-rijiju',
    portfolios: ['Parliamentary Affairs', 'Minority Affairs'],
  },
  {
    fullName: 'Hardeep Singh Puri',
    sourceKey: 'pmindia:hardeep-singh-puri',
    portfolios: ['Petroleum and Natural Gas'],
  },
  {
    fullName: 'Mansukh Mandaviya',
    sourceKey: 'pmindia:mansukh-mandaviya',
    portfolios: ['Labour and Employment', 'Youth Affairs and Sports'],
  },
  {
    fullName: 'G. Kishan Reddy',
    sourceKey: 'pmindia:g-kishan-reddy',
    portfolios: ['Coal', 'Mines'],
  },
  {
    fullName: 'Chirag Paswan',
    sourceKey: 'pmindia:chirag-paswan',
    portfolios: ['Food Processing Industries'],
  },
  { fullName: 'C R Patil', sourceKey: 'pmindia:cr-patil', portfolios: ['Jal Shakti'] },
];
