import { Landmark } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { Card } from '@/components/Card';
import { DomainShell } from '@/components/DomainShell';
import { FilterChip } from '@/components/FilterChip';
import { LastVerified } from '@/components/LastVerified';
import { SearchBar } from '@/components/SearchBar';
import { SourceLink } from '@/components/SourceLink';
import { db } from '@/lib/db';
import { personSlug } from '@/lib/people';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'domain.people' });
  return { title: t('title'), description: t('description') };
}

const CHAMBERS = ['all', 'government', 'lok-sabha', 'rajya-sabha'] as const;
type Chamber = (typeof CHAMBERS)[number];

const PAGE_SIZE = 24;

/** Prisma's Position.roleType/institution filter for a given chamber tab. */
function chamberWhere(chamber: Chamber) {
  switch (chamber) {
    case 'government':
      return { roleType: { in: ['HEAD_OF_GOVERNMENT' as const, 'MINISTER' as const] } };
    case 'lok-sabha':
      return { roleType: 'LEGISLATOR' as const, institution: { name: 'Lok Sabha' } };
    case 'rajya-sabha':
      return { roleType: 'LEGISLATOR' as const, institution: { name: 'Rajya Sabha' } };
    case 'all':
      return {
        roleType: { in: ['HEAD_OF_GOVERNMENT' as const, 'MINISTER' as const, 'LEGISLATOR' as const] },
      };
  }
}

export default async function PeoplePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; chamber?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { q, chamber: chamberParam, page: pageParam } = await searchParams;
  setRequestLocale(locale);

  const chamber: Chamber = (CHAMBERS as readonly string[]).includes(chamberParam ?? '')
    ? (chamberParam as Chamber)
    : 'all';
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const t = await getTranslations('domain.people');
  const s = await getTranslations('home.doors.people');
  const p = await getTranslations('people');
  const search = await getTranslations('search');
  const pagination = await getTranslations('pagination');

  const peopleWhere = {
    tenures: {
      // The People section covers the executive and the legislature — judges
      // have their own Judiciary section, never this one.
      some: { isCurrent: true, position: chamberWhere(chamber) },
    },
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' as const } },
            {
              tenures: {
                some: { position: { title: { contains: q, mode: 'insensitive' as const } } },
              },
            },
          ],
        }
      : {}),
  };

  const [totalCount, people] = await Promise.all([
    db.person.count({ where: peopleWhere }),
    db.person.findMany({
      where: peopleWhere,
      orderBy: { createdAt: 'asc' },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { tenures: { where: { isCurrent: true }, include: { position: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const citations = people.length
    ? await db.citation.findMany({
        where: {
          entityType: 'PERSON',
          entityId: { in: people.map((person) => person.id) },
          isPrimary: true,
        },
      })
    : [];
  const citationsByPerson = new Map<string, typeof citations>();
  for (const citation of citations) {
    const list = citationsByPerson.get(citation.entityId) ?? [];
    list.push(citation);
    citationsByPerson.set(citation.entityId, list);
  }

  return (
    <DomainShell title={t('title')} icon={Landmark}>
      <div className="space-y-8">
        <SearchBar
          action={`/${locale}/people`}
          label={s('searchLabel')}
          placeholder={s('searchPlaceholder')}
          defaultValue={q}
          hiddenFields={chamber !== 'all' ? { chamber } : {}}
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label={search('filters')}>
          {CHAMBERS.map((key) => (
            <FilterChip
              key={key}
              label={p(`chambers.${key}`)}
              href={{
                pathname: '/people',
                query: { ...(key !== 'all' ? { chamber: key } : {}), ...(q ? { q } : {}) },
              }}
              selected={chamber === key}
            />
          ))}
        </div>

        {people.length > 0 ? (
          <>
            <p className="text-meta text-ink-muted">{search('resultCount', { count: totalCount })}</p>
            <div className="grid gap-6 md:grid-cols-2">
              {people.map((person) => {
                const slug = personSlug(person.sourceKey);
                return (
                  <Card
                    key={person.id}
                    href={slug ? `/people/${slug}` : undefined}
                    title={person.fullName}
                    photoUrl={person.photoUrl}
                    context={person.tenures.map((tenure) => tenure.position.title).join(' · ')}
                    footer={
                      <div className="space-y-1">
                        <SourceLink citations={citationsByPerson.get(person.id) ?? []} />
                        <LastVerified date={person.lastVerifiedAt} />
                      </div>
                    }
                  />
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label={pagination('pageOf', { current: currentPage, total: totalPages })}
                className="flex items-center justify-between gap-4"
              >
                <FilterChip
                  label={pagination('previous')}
                  href={{
                    pathname: '/people',
                    query: {
                      ...(chamber !== 'all' ? { chamber } : {}),
                      ...(q ? { q } : {}),
                      page: String(Math.max(1, currentPage - 1)),
                    },
                  }}
                  selected={false}
                />
                <p className="text-small text-ink-muted">
                  {pagination('pageOf', { current: currentPage, total: totalPages })}
                </p>
                <FilterChip
                  label={pagination('next')}
                  href={{
                    pathname: '/people',
                    query: {
                      ...(chamber !== 'all' ? { chamber } : {}),
                      ...(q ? { q } : {}),
                      page: String(Math.min(totalPages, currentPage + 1)),
                    },
                  }}
                  selected={false}
                />
              </nav>
            )}
          </>
        ) : (
          q && <p className="text-body text-ink-muted">{search('noResults')}</p>
        )}
      </div>
    </DomainShell>
  );
}
