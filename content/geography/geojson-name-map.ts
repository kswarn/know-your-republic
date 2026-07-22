/**
 * Maps `STNAME_SH` values in public/geo/india-states.geojson (source:
 * datta07/INDIAN-SHAPEFILES, MIT) to the exact `Jurisdiction.name` strings seeded
 * in content/geography/states.ts.
 *
 * Most names match verbatim. Four don't, for two different reasons:
 *  - the GeoJSON abbreviates "and" as "&" for three names;
 *  - it predates the January 2020 merger of Daman & Diu with Dadra & Nagar
 *    Haveli, so both legacy shapes are kept and mapped to the one current UT.
 */
export const GEOJSON_NAME_TO_JURISDICTION: Record<string, string> = {
  'Andaman & Nicobar': 'Andaman and Nicobar Islands',
  'Jammu & Kashmir': 'Jammu and Kashmir',
  'Daman & Diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'Dadra & Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
};

/** Resolves a GeoJSON feature's short state name to its Jurisdiction.name. */
export function jurisdictionNameForFeature(stnameSh: string): string {
  return GEOJSON_NAME_TO_JURISDICTION[stnameSh] ?? stnameSh;
}
