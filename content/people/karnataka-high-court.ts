/**
 * Judges of the High Court of Karnataka — biography-only, per the guardrail
 * that judiciary content never includes case, judgment, or cause-list data.
 *
 * Unlike the Supreme Court list (content/people/supreme-court.ts), no primary
 * source could be reached for this one: the Court's own site
 * (karnatakajudiciary.kar.nic.in / judiciary.karnataka.gov.in) doesn't resolve
 * from this environment, and the Department of Justice's per-court page
 * (doj.gov.in/karnataka-high-court-5) is Akamai-blocked for both a plain
 * fetch and headless Chromium. The only reachable source was Wikipedia's
 * "List of sitting judges of the high courts of India" (Karnataka section) —
 * a tertiary aggregator, not the Court's own record. Per user direction
 * (2026-07-22), ingested anyway with that citation explicitly marked
 * non-primary (`isPrimary: false`), rather than waiting indefinitely or
 * misrepresenting it as official. See docs/SOURCES_LEGAL.md. Re-verify
 * against the Court's own record once reachable, or replace with a supplied
 * official document.
 *
 * No dates of birth/appointment are recorded — Wikipedia's list didn't carry
 * them, and guessing would be worse than leaving them blank.
 */

export const KARNATAKA_HC_SOURCE_URL =
  'https://en.wikipedia.org/wiki/List_of_sitting_judges_of_the_high_courts_of_India';
export const KARNATAKA_HC_SOURCE_NAME = 'Wikipedia, List of sitting judges of the high courts of India';

export type KarnatakaHCJudgeSeed = {
  fullName: string;
  sourceKey: string;
  bio?: string;
};

export const KARNATAKA_HC_CHIEF_JUSTICE: KarnatakaHCJudgeSeed = {
  fullName: 'Vibhu Bakhru',
  sourceKey: 'karnatakahc:vibhu-bakhru',
  bio: 'Vibhu Bakhru has been Chief Justice of the Karnataka High Court since 19 July 2025. He previously served as a judge of the Delhi High Court, including a period as its Acting Chief Justice.',
};

export const KARNATAKA_HC_JUDGES: KarnatakaHCJudgeSeed[] = [
  { fullName: 'Anu Sivaraman', sourceKey: 'karnatakahc:anu-sivaraman' },
  { fullName: 'Jayant Banerji', sourceKey: 'karnatakahc:jayant-banerji' },
  { fullName: 'Dinesh Kumar Singh', sourceKey: 'karnatakahc:dinesh-kumar-singh' },
  { fullName: 'Shankar Ganapathi Pandit', sourceKey: 'karnatakahc:shankar-ganapathi-pandit' },
  { fullName: 'Ramakrishna Devdas', sourceKey: 'karnatakahc:ramakrishna-devdas' },
  { fullName: 'Bhotanhosur Mallikarjuna Shyam Prasad', sourceKey: 'karnatakahc:bm-shyam-prasad' },
  { fullName: 'Siddappa Sunil Dutt Yadav', sourceKey: 'karnatakahc:ss-dutt-yadav' },
  { fullName: 'Mohammad Nawaz', sourceKey: 'karnatakahc:mohammad-nawaz' },
  {
    fullName: 'Harekoppa Thimmanna Gowda Narendra Prasad',
    sourceKey: 'karnatakahc:htg-narendra-prasad',
  },
  { fullName: 'Hethur Puttaswamygowda Sandesh', sourceKey: 'karnatakahc:hp-sandesh' },
  {
    fullName: 'Singapuram Raghavachar Krishna Kumar',
    sourceKey: 'karnatakahc:sr-krishna-kumar',
  },
  { fullName: 'Ashok Subhashchandra Kinagi', sourceKey: 'karnatakahc:as-kinagi' },
  { fullName: 'Suraj Govindaraj', sourceKey: 'karnatakahc:suraj-govindaraj' },
  { fullName: 'Sachin Shankar Magadum', sourceKey: 'karnatakahc:sachin-shankar-magadum' },
  { fullName: 'Jyoti Mulimani', sourceKey: 'karnatakahc:jyoti-mulimani' },
  { fullName: 'Nataraj Rangaswamy', sourceKey: 'karnatakahc:nataraj-rangaswamy' },
  { fullName: 'Pradeep Singh Yerur', sourceKey: 'karnatakahc:pradeep-singh-yerur' },
  { fullName: 'Maheshan Nagaprasan', sourceKey: 'karnatakahc:m-nagaprasanna' },
  { fullName: 'Maralur Indrakumar Arun', sourceKey: 'karnatakahc:mi-arun' },
  {
    fullName: 'Engalaguppe Seetharamaiah Indiresh',
    sourceKey: 'karnatakahc:es-indiresh',
  },
  { fullName: 'Ravi Venkappa Hosmani', sourceKey: 'karnatakahc:rv-hosmani' },
  { fullName: 'Savanur Vishwajith Shetty', sourceKey: 'karnatakahc:sv-shetty' },
  { fullName: 'Lalitha Kanneganti', sourceKey: 'karnatakahc:lalitha-kanneganti' },
  { fullName: 'Shivashankar Amarannavar', sourceKey: 'karnatakahc:shivashankar-amarannavar' },
  { fullName: 'Vedavyasachar Srishananda', sourceKey: 'karnatakahc:v-srishananda' },
  { fullName: 'Hanchate Sanjeev Kumar', sourceKey: 'karnatakahc:h-sanjeev-kumar' },
  {
    fullName: 'Mohammed Ghouse Shukure Kamal',
    sourceKey: 'karnatakahc:mgs-kamal',
  },
  { fullName: 'Perugu Sree Sudha', sourceKey: 'karnatakahc:p-sree-sudha' },
  { fullName: 'Chillakur Sumalatha', sourceKey: 'karnatakahc:c-sumalatha' },
  { fullName: 'Anant Ramanath Hegde', sourceKey: 'karnatakahc:ar-hegde' },
  { fullName: 'Siddaiah Rachaiah', sourceKey: 'karnatakahc:siddaiah-rachaiah' },
  {
    fullName: 'Kannakuzhyil Sreedharan Hemalekha',
    sourceKey: 'karnatakahc:ks-hemalekha',
  },
  { fullName: 'Kumbhajadala Manmadha Rao', sourceKey: 'karnatakahc:km-rao' },
  { fullName: 'Tara Vitasta Ganju', sourceKey: 'karnatakahc:tara-vitasta-ganju' },
  {
    fullName: 'Cheppudira Monappa Poonacha',
    sourceKey: 'karnatakahc:cm-poonacha',
  },
  { fullName: 'Gurusiddaiah Basavaraja', sourceKey: 'karnatakahc:g-basavaraja' },
  {
    fullName: 'Venkatesh Naik Thavaryanaik',
    sourceKey: 'karnatakahc:vn-thavaryanaik',
  },
  { fullName: 'Vijaykumar Adagouda Patil', sourceKey: 'karnatakahc:va-patil' },
  { fullName: 'Rajesh Rai Kallangala', sourceKey: 'karnatakahc:rajesh-rai-kallangala' },
  {
    fullName: 'Kurubarahalli Venkataramareddy Aravind',
    sourceKey: 'karnatakahc:kv-aravind',
  },
  // Additional judges (a distinct judicial appointment tier under Article 224).
  { fullName: 'Taj Ali Moulasab Nadaf', sourceKey: 'karnatakahc:tam-nadaf' },
  {
    fullName: 'Geetha Kadaba Bharatharaja Setty',
    sourceKey: 'karnatakahc:gkb-setty',
  },
  { fullName: 'Borkatte Muralidhara Pai', sourceKey: 'karnatakahc:bm-pai' },
  { fullName: 'Tyagaraja Narayan Inavally', sourceKey: 'karnatakahc:tn-inavally' },
  { fullName: 'Rajeshwari Narayana Hegde', sourceKey: 'karnatakahc:rn-hegde' },
  { fullName: 'Kedambadi Ganesh Shanthi', sourceKey: 'karnatakahc:kg-shanthi' },
  { fullName: 'Brungesh Mahadevappa', sourceKey: 'karnatakahc:brungesh-mahadevappa' },
];
