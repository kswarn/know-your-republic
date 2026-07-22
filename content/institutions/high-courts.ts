/**
 * The 25 High Courts of India, current since the Andhra Pradesh High Court was
 * reconstituted in 2019 following the Telangana bifurcation.
 *
 * The schema gives an Institution a single `jurisdictionId`, but several High
 * Courts sit over more than one state/UT (e.g. the Punjab and Haryana High Court).
 * `primaryState` is the seat state used for that one jurisdiction link;
 * `alsoServes` is kept here for the description an editor writes later — it is
 * not enforced anywhere in the schema.
 */

export type HighCourtSeed = {
  name: string;
  primaryState: string;
  alsoServes?: string[];
};

export const HIGH_COURTS: HighCourtSeed[] = [
  { name: 'Allahabad High Court', primaryState: 'Uttar Pradesh' },
  { name: 'Andhra Pradesh High Court', primaryState: 'Andhra Pradesh' },
  {
    name: 'Bombay High Court',
    primaryState: 'Maharashtra',
    alsoServes: ['Goa', 'Dadra and Nagar Haveli and Daman and Diu'],
  },
  {
    name: 'Calcutta High Court',
    primaryState: 'West Bengal',
    alsoServes: ['Andaman and Nicobar Islands'],
  },
  { name: 'Chhattisgarh High Court', primaryState: 'Chhattisgarh' },
  { name: 'Delhi High Court', primaryState: 'Delhi' },
  {
    name: 'Gauhati High Court',
    primaryState: 'Assam',
    alsoServes: ['Nagaland', 'Mizoram', 'Arunachal Pradesh'],
  },
  { name: 'Gujarat High Court', primaryState: 'Gujarat' },
  { name: 'Himachal Pradesh High Court', primaryState: 'Himachal Pradesh' },
  {
    name: 'High Court of Jammu and Kashmir and Ladakh',
    primaryState: 'Jammu and Kashmir',
    alsoServes: ['Ladakh'],
  },
  { name: 'Jharkhand High Court', primaryState: 'Jharkhand' },
  { name: 'Karnataka High Court', primaryState: 'Karnataka' },
  { name: 'Kerala High Court', primaryState: 'Kerala', alsoServes: ['Lakshadweep'] },
  { name: 'Madhya Pradesh High Court', primaryState: 'Madhya Pradesh' },
  { name: 'Madras High Court', primaryState: 'Tamil Nadu', alsoServes: ['Puducherry'] },
  { name: 'Manipur High Court', primaryState: 'Manipur' },
  { name: 'Meghalaya High Court', primaryState: 'Meghalaya' },
  { name: 'Orissa High Court', primaryState: 'Odisha' },
  { name: 'Patna High Court', primaryState: 'Bihar' },
  {
    name: 'Punjab and Haryana High Court',
    primaryState: 'Punjab',
    alsoServes: ['Haryana', 'Chandigarh'],
  },
  { name: 'Rajasthan High Court', primaryState: 'Rajasthan' },
  { name: 'Sikkim High Court', primaryState: 'Sikkim' },
  { name: 'Telangana High Court', primaryState: 'Telangana' },
  { name: 'Tripura High Court', primaryState: 'Tripura' },
  { name: 'Uttarakhand High Court', primaryState: 'Uttarakhand' },
];
