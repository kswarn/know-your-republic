/**
 * Toggles `value` in/out of `current` for a multi-select filter chip row.
 * Selecting every real option is the same result as selecting none — an
 * empty array is the "All" state — so this collapses back to `[]` rather
 * than leaving every option individually (and redundantly) checked.
 */
export function toggleFilterValue<T extends string>(current: T[], value: T, allValues: readonly T[]): T[] {
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  return next.length === allValues.length ? [] : next;
}

/** Parses a comma-separated `?key=a,b` query value into a validated array,
 * dropping anything not in `allValues` — an empty/missing param means "All". */
export function parseFilterValues<T extends string>(param: string | undefined, allValues: readonly T[]): T[] {
  if (!param) return [];
  const values = param.split(',');
  return allValues.filter((v) => values.includes(v));
}
