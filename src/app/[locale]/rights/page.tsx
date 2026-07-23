import { ShieldCheck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { Card } from '@/components/Card';
import { DomainShell } from '@/components/DomainShell';
import { FilterChip } from '@/components/FilterChip';
import { LastVerified } from '@/components/LastVerified';
import { SearchBar } from '@/components/SearchBar';
import { SourceLink } from '@/components/SourceLink';
import { db } from '@/lib/db';
import { parseFilterValues, toggleFilterValue } from '@/lib/filterToggle';

// Article order — not every category has a Right seeded yet (Directive
// Principles and statutory rights currently live as Law records instead, not
// Right ones), so this is filtered down to categories actually in use before
// being offered as a filter; a chip that always returns zero results isn't a
// filter, it's a dead end.
const CATEGORY_ORDER = [
  'EQUALITY',
  'FREEDOM',
  'AGAINST_EXPLOITATION',
  'FREEDOM_OF_RELIGION',
  'CULTURAL_EDUCATIONAL',
  'CONSTITUTIONAL_REMEDIES',
  'DIRECTIVE_PRINCIPLE',
  'STATUTORY',
] as const;
type Category = (typeof CATEGORY_ORDER)[number];

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'domain.rights' });
  return { title: t('title'), description: t('description') };
}

/** Plain excerpt for the list view — the full text lives on the detail page. */
function excerpt(text: string, maxLength = 180): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export default async function RightsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { q, category: categoryParam } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('domain.rights');
  const s = await getTranslations('home.doors.rights');
  const rc = await getTranslations('rightCategory');
  const search = await getTranslations('search');

  const categoriesInUse = await db.right.findMany({
    where: { explanationStatus: 'PUBLISHED' },
    select: { category: true },
    distinct: ['category'],
  });
  const availableCategories = CATEGORY_ORDER.filter((key) =>
    categoriesInUse.some((r) => r.category === key),
  );
  // An empty selection is "All" — no filter applied, not "match nothing".
  const categories = parseFilterValues<Category>(categoryParam, availableCategories);

  const rights = await db.right.findMany({
    where: {
      explanationStatus: 'PUBLISHED',
      ...(categories.length > 0 ? { category: { in: categories } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { plainExplanation: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'asc' },
  });

  const citations = rights.length
    ? await db.citation.findMany({
        where: { entityType: 'RIGHT', entityId: { in: rights.map((r) => r.id) }, isPrimary: true },
      })
    : [];
  const citationsByRight = new Map<string, typeof citations>();
  for (const citation of citations) {
    const list = citationsByRight.get(citation.entityId) ?? [];
    list.push(citation);
    citationsByRight.set(citation.entityId, list);
  }

  const categoryQuery = (next: Category[]): Record<string, string> => (next.length > 0 ? { category: next.join(',') } : {});

  return (
    <DomainShell
      title={t('title')}
      icon={ShieldCheck}
      search={
        <SearchBar
          action={`/${locale}/rights`}
          label={s('searchLabel')}
          placeholder={s('searchPlaceholder')}
          defaultValue={q}
          hiddenFields={categoryQuery(categories)}
        />
      }
    >
      <div className="flex flex-wrap gap-2" role="group" aria-label={search('filters')}>
        <FilterChip
          label={rc('all')}
          href={{ pathname: '/rights', query: { ...(q ? { q } : {}) } }}
          selected={categories.length === 0}
        />
        {availableCategories.map((key) => (
          <FilterChip
            key={key}
            label={rc(key)}
            href={{
              pathname: '/rights',
              query: { ...categoryQuery(toggleFilterValue(categories, key, availableCategories)), ...(q ? { q } : {}) },
            }}
            selected={categories.includes(key)}
          />
        ))}
      </div>

      {rights.length > 0 ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {rights.map((right) => (
            <Card
              key={right.id}
              href={`/rights/${right.slug}`}
              title={right.title}
              context={`${rc(right.category)} · ${right.articleCitation}`}
              footer={
                <div className="space-y-1">
                  <SourceLink citations={citationsByRight.get(right.id) ?? []} />
                  <LastVerified date={right.lastVerifiedAt} />
                </div>
              }
            >
              {right.plainExplanation && excerpt(right.plainExplanation)}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-body text-ink-muted mt-6">{search('noResults')}</p>
      )}
    </DomainShell>
  );
}
