/**
 * National-level institutions: the executive office, the Union ministries, both
 * houses of Parliament, and the Supreme Court. Structural fact, not current
 * office-holders — a ministry's existence is stable; who runs it is not, and is
 * deliberately left for a separately verified ingestion step (Position + Tenure).
 */

export const PMO_NAME = 'Prime Minister’s Office';

/**
 * Union ministry portfolios. Cross-checked against the official, currently live
 * "Portfolios of the Union Council of Ministers" page (pmindia.gov.in) at the time
 * the Union Cabinet was ingested (content/people/union-cabinet.ts) — every
 * portfolio held by a sitting Cabinet Minister on that page has an entry here, so
 * every Position created from that ingestion resolves to a real Institution.
 * Institution.description stays unwritten for now; filling it in is separate
 * editorial work, gated the same as any other content.
 */
export const UNION_MINISTRIES: string[] = [
  'Ministry of Finance',
  'Ministry of Home Affairs',
  'Ministry of Cooperation',
  'Ministry of External Affairs',
  'Ministry of Defence',
  'Ministry of Law and Justice',
  'Ministry of Health and Family Welfare',
  'Ministry of Chemicals and Fertilizers',
  'Ministry of Education',
  'Ministry of Agriculture and Farmers Welfare',
  'Ministry of Rural Development',
  'Ministry of Railways',
  'Ministry of Road Transport and Highways',
  'Ministry of Commerce and Industry',
  'Ministry of Corporate Affairs',
  'Ministry of Labour and Employment',
  'Ministry of Environment, Forest and Climate Change',
  'Ministry of Information and Broadcasting',
  'Ministry of Power',
  'Ministry of Petroleum and Natural Gas',
  'Ministry of Housing and Urban Affairs',
  'Ministry of Heavy Industries',
  'Ministry of Steel',
  'Ministry of Women and Child Development',
  'Ministry of Social Justice and Empowerment',
  'Ministry of Tribal Affairs',
  'Ministry of Minority Affairs',
  'Ministry of Culture',
  'Ministry of Tourism',
  'Ministry of Science and Technology',
  'Ministry of Electronics and Information Technology',
  'Ministry of Skill Development and Entrepreneurship',
  'Ministry of Textiles',
  'Ministry of Civil Aviation',
  'Ministry of Ports, Shipping and Waterways',
  'Ministry of Food Processing Industries',
  'Ministry of Consumer Affairs, Food and Public Distribution',
  'Ministry of Panchayati Raj',
  'Ministry of Jal Shakti',
  'Ministry of Micro, Small and Medium Enterprises',
  'Ministry of Fisheries, Animal Husbandry and Dairying',
  'Ministry of New and Renewable Energy',
  'Ministry of Communications',
  'Ministry of Development of North Eastern Region',
  'Ministry of Parliamentary Affairs',
  'Ministry of Youth Affairs and Sports',
  'Ministry of Coal',
  'Ministry of Mines',
];

export const LOK_SABHA_NAME = 'Lok Sabha';
export const RAJYA_SABHA_NAME = 'Rajya Sabha';
export const SUPREME_COURT_NAME = 'Supreme Court of India';
