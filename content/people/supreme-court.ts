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
 */

export const SUPREME_COURT_SOURCE_URL = 'https://www.sci.gov.in/chief-justice-judges/';

export type JudgeSeed = {
  fullName: string;
  sourceKey: string;
  dateOfBirth?: string;
  dateOfAppointment?: string;
};

export const CHIEF_JUSTICE: JudgeSeed = {
  fullName: 'Surya Kant',
  sourceKey: 'scindia:surya-kant',
  dateOfBirth: '1962-02-10',
  dateOfAppointment: '2019-05-24',
};

export const SUPREME_COURT_JUDGES: JudgeSeed[] = [
  { fullName: 'Vikram Nath', sourceKey: 'scindia:vikram-nath', dateOfBirth: '1962-10-30', dateOfAppointment: '2021-08-31' },
  { fullName: 'B.V. Nagarathna', sourceKey: 'scindia:bv-nagarathna', dateOfBirth: '1962-07-21', dateOfAppointment: '2021-08-31' },
  { fullName: 'M.M. Sundresh', sourceKey: 'scindia:mm-sundresh', dateOfBirth: '1963-05-03', dateOfAppointment: '2021-08-31' },
  { fullName: 'Pamidighantam Sri Narasimha', sourceKey: 'scindia:pamidighantam-sri-narasimha', dateOfBirth: '1965-08-12', dateOfAppointment: '2022-05-09' },
  { fullName: 'J.B. Pardiwala', sourceKey: 'scindia:jb-pardiwala', dateOfBirth: '1965-02-09', dateOfAppointment: '2022-12-12' },
  { fullName: 'Dipankar Datta', sourceKey: 'scindia:dipankar-datta', dateOfBirth: '1961-08-23', dateOfAppointment: '2023-02-06' },
  { fullName: 'Sanjay Karol', sourceKey: 'scindia:sanjay-karol', dateOfBirth: '1963-08-14', dateOfAppointment: '2023-02-06' },
  { fullName: 'Sanjay Kumar', sourceKey: 'scindia:sanjay-kumar', dateOfBirth: '1963-05-11', dateOfAppointment: '2023-02-06' },
  { fullName: 'Ahsanuddin Amanullah', sourceKey: 'scindia:ahsanuddin-amanullah', dateOfBirth: '1965-06-02', dateOfAppointment: '2023-02-06' },
  { fullName: 'Manoj Misra', sourceKey: 'scindia:manoj-misra', dateOfBirth: '1962-07-14', dateOfAppointment: '2023-02-13' },
  { fullName: 'Aravind Kumar', sourceKey: 'scindia:aravind-kumar', dateOfBirth: '1964-08-29', dateOfAppointment: '2023-05-19' },
  { fullName: 'Prashant Kumar Mishra', sourceKey: 'scindia:prashant-kumar-mishra', dateOfBirth: '1966-05-26', dateOfAppointment: '2023-05-19' },
  { fullName: 'K.V. Viswanathan', sourceKey: 'scindia:kv-viswanathan', dateOfBirth: '1964-08-02', dateOfAppointment: '2023-07-14' },
  { fullName: 'Ujjal Bhuyan', sourceKey: 'scindia:ujjal-bhuyan', dateOfBirth: '1962-05-06', dateOfAppointment: '2023-07-14' },
  { fullName: 'Sarasa Venkatanarayana Bhatti', sourceKey: 'scindia:sarasa-venkatanarayana-bhatti', dateOfBirth: '1961-11-30', dateOfAppointment: '2023-11-09' },
  { fullName: 'Satish Chandra Sharma', sourceKey: 'scindia:satish-chandra-sharma', dateOfBirth: '1963-03-12', dateOfAppointment: '2023-11-09' },
  { fullName: 'Augustine George Masih', sourceKey: 'scindia:augustine-george-masih', dateOfBirth: '1963-01-11', dateOfAppointment: '2023-11-09' },
  { fullName: 'Sandeep Mehta', sourceKey: 'scindia:sandeep-mehta', dateOfBirth: '1962-06-23', dateOfAppointment: '2024-01-25' },
  { fullName: 'Prasanna Bhalachandra Varale', sourceKey: 'scindia:prasanna-bhalachandra-varale', dateOfBirth: '1963-03-01', dateOfAppointment: '2024-07-18' },
  { fullName: 'N. Kotiswar Singh', sourceKey: 'scindia:n-kotiswar-singh', dateOfBirth: '1963-06-10', dateOfAppointment: '2024-07-18' },
  { fullName: 'R. Mahadevan', sourceKey: 'scindia:r-mahadevan', dateOfBirth: '1962-12-17', dateOfAppointment: '2024-12-05' },
  { fullName: 'Manmohan', sourceKey: 'scindia:manmohan', dateOfBirth: '1963-04-25', dateOfAppointment: '2025-01-16' },
  { fullName: 'K. Vinod Chandran', sourceKey: 'scindia:k-vinod-chandran', dateOfBirth: '1966-10-03', dateOfAppointment: '2025-03-17' },
  { fullName: 'Joymalya Bagchi', sourceKey: 'scindia:joymalya-bagchi', dateOfBirth: '1965-03-23', dateOfAppointment: '2025-05-30' },
  { fullName: 'N.V. Anjaria', sourceKey: 'scindia:nv-anjaria', dateOfBirth: '1964-03-26', dateOfAppointment: '2025-05-30' },
  { fullName: 'Vijay Bishnoi', sourceKey: 'scindia:vijay-bishnoi', dateOfBirth: '1965-04-07', dateOfAppointment: '2025-05-30' },
  { fullName: 'Atul Sharachchandra Chandurkar', sourceKey: 'scindia:atul-sharachchandra-chandurkar', dateOfBirth: '1964-04-13', dateOfAppointment: '2025-08-29' },
  { fullName: 'Alok Aradhe', sourceKey: 'scindia:alok-aradhe', dateOfBirth: '1968-05-28', dateOfAppointment: '2025-08-29' },
  { fullName: 'Vipul Manubhai Pancholi', sourceKey: 'scindia:vipul-manubhai-pancholi', dateOfBirth: '1965-01-01', dateOfAppointment: '2026-06-02' },
  { fullName: 'Sheel Nagu', sourceKey: 'scindia:sheel-nagu', dateOfBirth: '1965-05-25', dateOfAppointment: '2026-06-02' },
  { fullName: 'Shree Chandrashekhar', sourceKey: 'scindia:shree-chandrashekhar', dateOfBirth: '1964-12-26', dateOfAppointment: '2026-06-02' },
  { fullName: 'Sanjeev Sachdeva', sourceKey: 'scindia:sanjeev-sachdeva', dateOfBirth: '1964-09-18', dateOfAppointment: '2026-06-02' },
  { fullName: 'Arun Palli', sourceKey: 'scindia:arun-palli', dateOfBirth: '1966-06-27', dateOfAppointment: '2026-06-02' },
  { fullName: 'V. Mohana', sourceKey: 'scindia:v-mohana' },
];
