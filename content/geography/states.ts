/**
 * The 28 states and 8 Union Territories of India, current as of the January 2020
 * reorganisation (Jammu & Kashmir's bifurcation into the J&K and Ladakh UTs, and
 * the merger of Dadra & Nagar Haveli with Daman & Diu). Stable, well-documented
 * structural fact — not the kind of thing that needs live verification the way a
 * current office-holder does.
 *
 * `capital` seeds one CITY jurisdiction per state/UT (build plan §7, Phase 1).
 * Punjab and Haryana share a capital (Chandigarh, itself a separate UT) — both
 * list it for description purposes, but no duplicate Chandigarh jurisdiction is
 * created under either state; Chandigarh already exists as its own UT entry.
 */

export type StateOrUT = {
  name: string;
  type: 'STATE' | 'UT';
  capital: string;
  /** True where the capital is a separate jurisdiction (e.g. Chandigarh) and should not be seeded as a child city. */
  capitalIsExternal?: boolean;
};

export const STATES_AND_UTS: StateOrUT[] = [
  { name: 'Andhra Pradesh', type: 'STATE', capital: 'Amaravati' },
  { name: 'Arunachal Pradesh', type: 'STATE', capital: 'Itanagar' },
  { name: 'Assam', type: 'STATE', capital: 'Dispur' },
  { name: 'Bihar', type: 'STATE', capital: 'Patna' },
  { name: 'Chhattisgarh', type: 'STATE', capital: 'Raipur' },
  { name: 'Goa', type: 'STATE', capital: 'Panaji' },
  { name: 'Gujarat', type: 'STATE', capital: 'Gandhinagar' },
  { name: 'Haryana', type: 'STATE', capital: 'Chandigarh', capitalIsExternal: true },
  { name: 'Himachal Pradesh', type: 'STATE', capital: 'Shimla' },
  { name: 'Jharkhand', type: 'STATE', capital: 'Ranchi' },
  { name: 'Karnataka', type: 'STATE', capital: 'Bengaluru' },
  { name: 'Kerala', type: 'STATE', capital: 'Thiruvananthapuram' },
  { name: 'Madhya Pradesh', type: 'STATE', capital: 'Bhopal' },
  { name: 'Maharashtra', type: 'STATE', capital: 'Mumbai' },
  { name: 'Manipur', type: 'STATE', capital: 'Imphal' },
  { name: 'Meghalaya', type: 'STATE', capital: 'Shillong' },
  { name: 'Mizoram', type: 'STATE', capital: 'Aizawl' },
  { name: 'Nagaland', type: 'STATE', capital: 'Kohima' },
  { name: 'Odisha', type: 'STATE', capital: 'Bhubaneswar' },
  { name: 'Punjab', type: 'STATE', capital: 'Chandigarh', capitalIsExternal: true },
  { name: 'Rajasthan', type: 'STATE', capital: 'Jaipur' },
  { name: 'Sikkim', type: 'STATE', capital: 'Gangtok' },
  { name: 'Tamil Nadu', type: 'STATE', capital: 'Chennai' },
  { name: 'Telangana', type: 'STATE', capital: 'Hyderabad' },
  { name: 'Tripura', type: 'STATE', capital: 'Agartala' },
  { name: 'Uttar Pradesh', type: 'STATE', capital: 'Lucknow' },
  { name: 'Uttarakhand', type: 'STATE', capital: 'Dehradun' },
  { name: 'West Bengal', type: 'STATE', capital: 'Kolkata' },

  { name: 'Andaman and Nicobar Islands', type: 'UT', capital: 'Port Blair' },
  { name: 'Chandigarh', type: 'UT', capital: 'Chandigarh', capitalIsExternal: true },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'UT', capital: 'Daman' },
  { name: 'Delhi', type: 'UT', capital: 'New Delhi' },
  { name: 'Jammu and Kashmir', type: 'UT', capital: 'Srinagar' },
  { name: 'Ladakh', type: 'UT', capital: 'Leh' },
  { name: 'Lakshadweep', type: 'UT', capital: 'Kavaratti' },
  { name: 'Puducherry', type: 'UT', capital: 'Puducherry', capitalIsExternal: true },
];
