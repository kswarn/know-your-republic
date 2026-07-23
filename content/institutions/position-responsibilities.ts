/**
 * Plain-language descriptions of what each Union-level position is responsible
 * for — the office's mandate, not the current holder's biography or record.
 *
 * Source: the Government of India (Allocation of Business) Rules, 1961 (as
 * amended), which is the legal instrument assigning subjects to each Ministry —
 * the single authoritative source for "what does this office actually do",
 * cited identically for every ministerial entry below rather than guessing at
 * each ministry's own website domain. The Prime Minister's and Supreme Court
 * judges' entries describe their constitutional role instead (Articles 74-75
 * and 124-141), since neither is a "ministry" under the AOB Rules.
 *
 * Verified reachable 2026-07-22 (200, correct content-type) — see
 * docs/SOURCES_LEGAL.md.
 */

export const AOB_RULES_SOURCE_URL =
  'https://cabsec.gov.in/writereaddata/allocationbusinessrule/completeaobrules/english/1_Upload_1187.pdf';
export const AOB_RULES_SOURCE_NAME = 'Government of India (Allocation of Business) Rules, 1961, Cabinet Secretariat';

export const CONSTITUTION_SOURCE_URL = 'https://www.legislative.gov.in/constitution-of-india';
export const CONSTITUTION_SOURCE_NAME = 'Constitution of India, Legislative Department';

export type ResponsibilitySeed = {
  positionTitle: string;
  responsibilities: string;
  sourceUrl: string;
  sourceName: string;
};

const ministry = (portfolio: string, responsibilities: string): ResponsibilitySeed => ({
  positionTitle: `Union Minister of ${portfolio}`,
  responsibilities,
  sourceUrl: AOB_RULES_SOURCE_URL,
  sourceName: AOB_RULES_SOURCE_NAME,
});

export const POSITION_RESPONSIBILITIES: ResponsibilitySeed[] = [
  {
    positionTitle: 'Prime Minister of India',
    responsibilities:
      'Heads the Union government: chairs the Cabinet, leads and coordinates the work of every Ministry, and advises the President on the appointment of other ministers. The Prime Minister also directly holds any subject not otherwise allocated to a Minister: currently the Ministry of Personnel, Public Grievances and Pensions, the Department of Atomic Energy, and the Department of Space.',
    sourceUrl: CONSTITUTION_SOURCE_URL,
    sourceName: CONSTITUTION_SOURCE_NAME,
  },
  {
    positionTitle: 'Chief Justice of India',
    responsibilities:
      'Heads the Supreme Court of India and, by convention, presides over its largest and most significant constitutional benches. The Chief Justice allocates cases among the Court’s judges and, under Article 124, is consulted by the President on the appointment of other Supreme Court and High Court judges.',
    sourceUrl: CONSTITUTION_SOURCE_URL,
    sourceName: CONSTITUTION_SOURCE_NAME,
  },
  {
    positionTitle: 'Judge, Supreme Court of India',
    responsibilities:
      'Hears appeals from every High Court and tribunal as the final court of appeal, rules on disputes between the Union and the States or between States, and enforces Fundamental Rights under Article 32. Supreme Court rulings on the meaning of the Constitution bind every other court in the country.',
    sourceUrl: CONSTITUTION_SOURCE_URL,
    sourceName: CONSTITUTION_SOURCE_NAME,
  },
  ministry(
    'Agriculture and Farmers Welfare',
    'Responsible for agricultural policy and production, crop insurance and price support schemes, farm credit, and welfare programmes for farmers.',
  ),
  ministry(
    'Chemicals and Fertilizers',
    'Oversees the chemicals, petrochemicals and pharmaceuticals industries, and administers fertiliser production, pricing, and subsidy for farmers.',
  ),
  ministry(
    'Civil Aviation',
    'Regulates civil air transport, airports and airline safety, and oversees regional air connectivity schemes.',
  ),
  ministry(
    'Coal',
    'Oversees coal exploration, production and allocation, including the regulation of coal-mining companies and blocks.',
  ),
  ministry(
    'Commerce and Industry',
    'Sets trade and export-import policy, promotes industrial development and foreign investment, and negotiates India’s position in international trade agreements.',
  ),
  ministry(
    'Communications',
    'Oversees telecommunications policy and regulation and the postal service, including spectrum allocation and rural connectivity.',
  ),
  ministry(
    'Consumer Affairs, Food and Public Distribution',
    'Protects consumer rights and regulates weights and measures, and administers food-grain procurement, buffer stocks, and the public distribution system.',
  ),
  ministry(
    'Cooperation',
    'Oversees the cooperative sector, including cooperative banks, credit societies, and cooperative farming and marketing bodies.',
  ),
  ministry(
    'Corporate Affairs',
    'Administers company and insolvency law, regulates corporate governance, and oversees professional bodies for accountants and company secretaries.',
  ),
  ministry(
    'Culture',
    'Preserves and promotes India’s cultural heritage, including museums, archives, archaeology, and the fine and performing arts.',
  ),
  ministry(
    'Defence',
    'Oversees the defence of India, commanding the Army, Navy and Air Force through the Ministry, and manages defence production and procurement.',
  ),
  ministry(
    'Development of North Eastern Region',
    'Coordinates and funds infrastructure and development schemes specific to India’s north-eastern states.',
  ),
  ministry(
    'Education',
    'Sets school and higher-education policy nationwide, and oversees national examinations, universities, and technical and skill education.',
  ),
  ministry(
    'Electronics and Information Technology',
    'Sets policy for electronics manufacturing, the IT industry, and digital infrastructure, including India’s digital identity and e-governance programmes.',
  ),
  ministry(
    'Environment, Forest and Climate Change',
    'Administers environmental protection and forest conservation law, regulates pollution and wildlife protection, and represents India in international climate negotiations.',
  ),
  ministry(
    'External Affairs',
    'Conducts India’s foreign policy and diplomatic relations, oversees Indian missions abroad, and is responsible for the welfare of Indians overseas.',
  ),
  ministry(
    'Finance',
    'Manages the Union Budget, taxation, public borrowing, banking and financial-sector regulation, and India’s economic and fiscal policy.',
  ),
  ministry(
    'Fisheries, Animal Husbandry and Dairying',
    'Supports fisheries, livestock, and dairy development, including veterinary services and welfare schemes for fishers and dairy farmers.',
  ),
  ministry(
    'Food Processing Industries',
    'Promotes the food-processing sector, including cold-chain infrastructure and investment in food-processing capacity.',
  ),
  ministry(
    'Health and Family Welfare',
    'Sets national health policy, runs public health and disease-control programmes, and regulates medical education, hospitals, and pharmaceuticals safety.',
  ),
  ministry(
    'Heavy Industries',
    'Oversees heavy engineering and capital-goods industries, including public-sector manufacturing and the promotion of electric-vehicle manufacturing.',
  ),
  ministry(
    'Home Affairs',
    'Responsible for internal security, the police and paramilitary forces, border management, citizenship and immigration, and Union Territory administration.',
  ),
  ministry(
    'Housing and Urban Affairs',
    'Sets urban development and housing policy, including urban infrastructure, metro rail, and affordable-housing schemes.',
  ),
  ministry(
    'Information and Broadcasting',
    'Regulates film, television, radio and print media, and manages the government’s own public-information and broadcasting services.',
  ),
  ministry(
    'Jal Shakti',
    'Oversees drinking-water supply and sanitation, irrigation, river conservation, and the regulation of India’s water resources.',
  ),
  ministry(
    'Labour and Employment',
    'Administers labour law, industrial relations, worker safety, and social-security schemes for organised and unorganised workers.',
  ),
  ministry(
    'Micro, Small and Medium Enterprises',
    'Supports small-business development through credit access, technology upgrades, and market-linkage schemes.',
  ),
  ministry(
    'Mines',
    'Regulates the exploration and mining of minerals other than coal and petroleum, including mineral royalties and mine safety.',
  ),
  ministry(
    'Minority Affairs',
    'Runs welfare, education and economic-empowerment schemes for India’s notified religious minority communities.',
  ),
  ministry(
    'New and Renewable Energy',
    'Promotes solar, wind and other renewable-energy generation and India’s clean-energy transition targets.',
  ),
  ministry(
    'Panchayati Raj',
    'Supports rural local self-government, strengthening the powers, finances and functioning of panchayats.',
  ),
  ministry(
    'Parliamentary Affairs',
    'Coordinates the government’s legislative business in Parliament, including the scheduling of bills and government responses in both Houses.',
  ),
  ministry(
    'Petroleum and Natural Gas',
    'Oversees the exploration, refining, distribution and pricing of petroleum and natural gas, including fuel subsidies.',
  ),
  ministry(
    'Ports, Shipping and Waterways',
    'Regulates major ports, shipping, and inland waterways, and oversees maritime trade infrastructure.',
  ),
  ministry(
    'Power',
    'Sets policy for electricity generation, transmission and distribution, and oversees rural electrification and grid reliability.',
  ),
  ministry(
    'Railways',
    'Runs and regulates the Indian Railways network, including rail safety, fares, and infrastructure expansion.',
  ),
  ministry(
    'Road Transport and Highways',
    'Builds and maintains national highways, and regulates motor-vehicle standards, road safety, and driving licences.',
  ),
  ministry(
    'Rural Development',
    'Runs rural employment guarantee, housing, and poverty-alleviation schemes, and funds rural roads and infrastructure.',
  ),
  ministry(
    'Social Justice and Empowerment',
    'Runs welfare and affirmative-action programmes for Scheduled Castes, backward classes, persons with disabilities, and senior citizens.',
  ),
  ministry(
    'Steel',
    'Oversees the steel industry, including production capacity, raw-material supply, and public-sector steel plants.',
  ),
  ministry(
    'Textiles',
    'Supports the textile and apparel industry, including handloom and handicraft weavers and cotton and jute production.',
  ),
  ministry(
    'Tourism',
    'Promotes domestic and international tourism, and funds tourist infrastructure and destination development.',
  ),
  ministry(
    'Tribal Affairs',
    'Runs welfare, education and livelihood schemes for Scheduled Tribes, and administers protections for tribal land and forest rights.',
  ),
  ministry(
    'Women and Child Development',
    'Runs welfare, nutrition, and protection schemes for women and children, including anganwadi services and child-protection law.',
  ),
  ministry(
    'Youth Affairs and Sports',
    'Runs national sports development and youth-welfare programmes, and oversees India’s Olympic and elite-athlete support schemes.',
  ),
];
