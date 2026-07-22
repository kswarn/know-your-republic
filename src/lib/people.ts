/**
 * Person has no stored `slug` (unlike Right) — its URL identity is derived from
 * `sourceKey` (e.g. "pmindia:amit-shah" → "amit-shah"). Shared here so the list
 * page and the detail page derive/resolve it identically.
 */
export function personSlug(sourceKey: string | null): string | null {
  if (!sourceKey) return null;
  const separatorIndex = sourceKey.indexOf(':');
  return separatorIndex === -1 ? sourceKey : sourceKey.slice(separatorIndex + 1);
}
