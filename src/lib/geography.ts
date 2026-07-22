import type { PrismaClient } from '@/generated/prisma';

/** "Dadra and Nagar Haveli and Daman and Diu" -> "dadra-and-nagar-haveli-and-daman-and-diu" */
export function jurisdictionSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * Reverses `jurisdictionSlug`. Jurisdiction names aren't stored with a dedicated
 * slug column, so this reconstructs a spaced, lowercase name from the slug and
 * matches it case-insensitively — safe because dashes only ever replace spaces,
 * never appear inside a real jurisdiction name.
 */
export async function findJurisdictionBySlug(db: PrismaClient, slug: string) {
  const reconstructed = slug.replace(/-/g, ' ');
  return db.jurisdiction.findFirst({
    where: { name: { equals: reconstructed, mode: 'insensitive' } },
  });
}
