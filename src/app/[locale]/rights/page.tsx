import { ShieldCheck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { Card } from '@/components/Card';
import { DomainShell } from '@/components/DomainShell';
import { LastVerified } from '@/components/LastVerified';
import { SearchBar } from '@/components/SearchBar';
import { SourceLink } from '@/components/SourceLink';
import { db } from '@/lib/db';

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
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('domain.rights');
  const s = await getTranslations('home.doors.rights');
  const rc = await getTranslations('rightCategory');

  const rights = await db.right.findMany({
    where: {
      explanationStatus: 'PUBLISHED',
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
        />
      }
    >
      {rights.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
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
      ) : undefined}
    </DomainShell>
  );
}
