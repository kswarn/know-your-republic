/**
 * The Chief Justice of India and all sitting judges of the Supreme Court of
 * India — biography-only, per the guardrail that judiciary content never
 * includes case, judgment, or cause-list data.
 *
 * Verified live against the official source on 2026-07-21 (see
 * SUPREME_COURT_SOURCE_URL below), not recalled — the Chief Justice changed
 * (Surya Kant, sworn in 24 November 2025) well after this assistant's training
 * cutoff, and five judges took oath as recently as 2 June 2026. High Court
 * judges are deliberately out of scope for this pass — 25 courts' worth of
 * benches is a separate, much larger ingestion left for a follow-up, the same
 * way Ministers of State were left out of the Union Cabinet pass.
 *
 * Dates are dd-mm-yyyy on the source page; stored here as ISO (yyyy-mm-dd).
 *
 * `photoUrl` is each judge's official photo, extracted from the same source
 * page (2026-07-22) — matched to a name via the page's own "View Profile"
 * link slug (e.g. "justice-vikram-nath"), then cross-checked so no two judges
 * ended up sharing a photo file before this was written down.
 */

export const SUPREME_COURT_SOURCE_URL = 'https://www.sci.gov.in/chief-justice-judges/';

export type JudgeSeed = {
  fullName: string;
  sourceKey: string;
  photoUrl?: string;
  dateOfBirth?: string;
  dateOfAppointment?: string;
  bio?: string;
};

export const CHIEF_JUSTICE: JudgeSeed = {
  fullName: 'Surya Kant',
  sourceKey: 'scindia:surya-kant',
  photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2025102910.jpg',
  dateOfBirth: '1962-02-10',
  dateOfAppointment: '2019-05-24',
  bio: 'Surya Kant has been Chief Justice of India since 24 November 2025. He was elevated to the Supreme Court in 2019 after serving as a judge of the Punjab and Haryana High Court and, briefly, as Chief Justice of the Himachal Pradesh High Court.',
};

export const SUPREME_COURT_JUDGES: JudgeSeed[] = [
  { fullName: 'Vikram Nath', sourceKey: 'scindia:vikram-nath', dateOfBirth: '1962-10-30', dateOfAppointment: '2021-08-31', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2025110998.jpg' },
  { fullName: 'B.V. Nagarathna', sourceKey: 'scindia:bv-nagarathna', dateOfBirth: '1962-07-21', dateOfAppointment: '2021-08-31', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/01/2024011390.jpg' },
  { fullName: 'M.M. Sundresh', sourceKey: 'scindia:mm-sundresh', dateOfBirth: '1963-05-03', dateOfAppointment: '2021-08-31', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/01/2024011338.jpg' },
  { fullName: 'Pamidighantam Sri Narasimha', sourceKey: 'scindia:pamidighantam-sri-narasimha', dateOfBirth: '1965-08-12', dateOfAppointment: '2022-05-09', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011184.jpg' },
  { fullName: 'J.B. Pardiwala', sourceKey: 'scindia:jb-pardiwala', dateOfBirth: '1965-02-09', dateOfAppointment: '2022-12-12', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011184-1.jpg' },
  { fullName: 'Dipankar Datta', sourceKey: 'scindia:dipankar-datta', dateOfBirth: '1961-08-23', dateOfAppointment: '2023-02-06', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011141.jpg' },
  { fullName: 'Sanjay Karol', sourceKey: 'scindia:sanjay-karol', dateOfBirth: '1963-08-14', dateOfAppointment: '2023-02-06', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011112.jpg' },
  { fullName: 'Sanjay Kumar', sourceKey: 'scindia:sanjay-kumar', dateOfBirth: '1963-05-11', dateOfAppointment: '2023-02-06', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011172.jpg' },
  { fullName: 'Ahsanuddin Amanullah', sourceKey: 'scindia:ahsanuddin-amanullah', dateOfBirth: '1965-06-02', dateOfAppointment: '2023-02-06', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/01/2025090883.jpg' },
  { fullName: 'Manoj Misra', sourceKey: 'scindia:manoj-misra', dateOfBirth: '1962-07-14', dateOfAppointment: '2023-02-13', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011127.jpg' },
  { fullName: 'Aravind Kumar', sourceKey: 'scindia:aravind-kumar', dateOfBirth: '1964-08-29', dateOfAppointment: '2023-05-19', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011116.jpg' },
  { fullName: 'Prashant Kumar Mishra', sourceKey: 'scindia:prashant-kumar-mishra', dateOfBirth: '1966-05-26', dateOfAppointment: '2023-05-19', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011162.jpg' },
  { fullName: 'K.V. Viswanathan', sourceKey: 'scindia:kv-viswanathan', dateOfBirth: '1964-08-02', dateOfAppointment: '2023-07-14', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011127-1.jpg' },
  { fullName: 'Ujjal Bhuyan', sourceKey: 'scindia:ujjal-bhuyan', dateOfBirth: '1962-05-06', dateOfAppointment: '2023-07-14', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2024011177.jpg' },
  { fullName: 'Sarasa Venkatanarayana Bhatti', sourceKey: 'scindia:sarasa-venkatanarayana-bhatti', dateOfBirth: '1961-11-30', dateOfAppointment: '2023-11-09', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/10/2026053045.jpg' },
  { fullName: 'Satish Chandra Sharma', sourceKey: 'scindia:satish-chandra-sharma', dateOfBirth: '1963-03-12', dateOfAppointment: '2023-11-09', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/12/2024011113.jpg' },
  { fullName: 'Augustine George Masih', sourceKey: 'scindia:augustine-george-masih', dateOfBirth: '1963-01-11', dateOfAppointment: '2023-11-09', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/12/2024011142.jpg' },
  { fullName: 'Sandeep Mehta', sourceKey: 'scindia:sandeep-mehta', dateOfBirth: '1962-06-23', dateOfAppointment: '2024-01-25', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2023/12/2024011135.jpg' },
  { fullName: 'Prasanna Bhalachandra Varale', sourceKey: 'scindia:prasanna-bhalachandra-varale', dateOfBirth: '1963-03-01', dateOfAppointment: '2024-07-18', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/01/2024021530-scaled-e1748753979960.jpg' },
  { fullName: 'N. Kotiswar Singh', sourceKey: 'scindia:n-kotiswar-singh', dateOfBirth: '1963-06-10', dateOfAppointment: '2024-07-18', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/07/2024080379-scaled-e1748754095610.jpg' },
  { fullName: 'R. Mahadevan', sourceKey: 'scindia:r-mahadevan', dateOfBirth: '1962-12-17', dateOfAppointment: '2024-12-05', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/07/2024120978-e1733723449364.jpg' },
  { fullName: 'Manmohan', sourceKey: 'scindia:manmohan', dateOfBirth: '1963-04-25', dateOfAppointment: '2025-01-16', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/12/2024121925.jpg' },
  { fullName: 'K. Vinod Chandran', sourceKey: 'scindia:k-vinod-chandran', dateOfBirth: '1966-10-03', dateOfAppointment: '2025-03-17', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2025/01/2025012065.jpg' },
  { fullName: 'Joymalya Bagchi', sourceKey: 'scindia:joymalya-bagchi', dateOfBirth: '1965-03-23', dateOfAppointment: '2025-05-30', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2025/03/2025032612-e1748754168828.jpeg' },
  { fullName: 'N.V. Anjaria', sourceKey: 'scindia:nv-anjaria', dateOfBirth: '1964-03-26', dateOfAppointment: '2025-05-30', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2025/05/2025061738.jpeg' },
  { fullName: 'Vijay Bishnoi', sourceKey: 'scindia:vijay-bishnoi', dateOfBirth: '1965-04-07', dateOfAppointment: '2025-05-30', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2025/05/2025080775.jpg' },
  { fullName: 'Atul Sharachchandra Chandurkar', sourceKey: 'scindia:atul-sharachchandra-chandurkar', dateOfBirth: '1964-04-13', dateOfAppointment: '2025-08-29', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2025/05/2025082310.jpg' },
  { fullName: 'Alok Aradhe', sourceKey: 'scindia:alok-aradhe', dateOfBirth: '1968-05-28', dateOfAppointment: '2025-08-29', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2025/08/2025091540.jpg' },
  { fullName: 'Vipul Manubhai Pancholi', sourceKey: 'scindia:vipul-manubhai-pancholi', dateOfBirth: '1965-01-01', dateOfAppointment: '2026-06-02', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2025/08/2025082950.jpg' },
  { fullName: 'Sheel Nagu', sourceKey: 'scindia:sheel-nagu', dateOfBirth: '1965-05-25', dateOfAppointment: '2026-06-02', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2026/06/2026060899.jpg' },
  { fullName: 'Shree Chandrashekhar', sourceKey: 'scindia:shree-chandrashekhar', dateOfBirth: '1964-12-26', dateOfAppointment: '2026-06-02', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2025/05/2025060110.jpg' },
  { fullName: 'Sanjeev Sachdeva', sourceKey: 'scindia:sanjeev-sachdeva', dateOfBirth: '1964-09-18', dateOfAppointment: '2026-06-02', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2026/06/2026072071.jpg' },
  { fullName: 'Arun Palli', sourceKey: 'scindia:arun-palli', dateOfBirth: '1966-06-27', dateOfAppointment: '2026-06-02', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2026/06/2026062491.jpg' },
  { fullName: 'V. Mohana', sourceKey: 'scindia:v-mohana', photoUrl: 'https://cdnbbsr.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2026/06/2026063046.jpeg' },
];
