import { Landmark } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { Card } from '@/components/Card';
import { DomainShell } from '@/components/DomainShell';
import { HierarchyMindMap, type HierarchyNode } from '@/components/HierarchyMindMap';
import { LastVerified } from '@/components/LastVerified';
import { SearchBar } from '@/components/SearchBar';
import { SourceLink } from '@/components/SourceLink';
import { Link } from '@/i18n/navigation';
import { db } from '@/lib/db';
import { personSlug } from '@/lib/people';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'domain.people' });
  return { title: t('title'), description: t('description') };
}

/** `href` is locale-qualified because it ends up on a plain `<a>` inside an SVG tree, not next-intl's `Link`. */
async function getHierarchyRoot(locale: string): Promise<HierarchyNode | null> {
  const pmPosition = await db.position.findFirst({
    where: { title: 'Prime Minister of India' },
    include: { tenures: { where: { isCurrent: true }, include: { person: true } } },
  });
  if (!pmPosition) return null;

  const edges = await db.hierarchyEdge.findMany({
    where: { superiorId: pmPosition.id },
    include: {
      subordinate: {
        include: { tenures: { where: { isCurrent: true }, include: { person: true } } },
      },
    },
  });

  const hrefFor = (sourceKey: string | null | undefined) => {
    const slug = personSlug(sourceKey ?? null);
    return slug ? `/${locale}/people/${slug}` : null;
  };

  return {
    id: pmPosition.id,
    title: pmPosition.title,
    personName: pmPosition.tenures[0]?.person.fullName ?? null,
    href: hrefFor(pmPosition.tenures[0]?.person.sourceKey),
    children: edges.map((edge) => ({
      id: edge.subordinate.id,
      title: edge.subordinate.title,
      personName: edge.subordinate.tenures[0]?.person.fullName ?? null,
      href: hrefFor(edge.subordinate.tenures[0]?.person.sourceKey),
    })),
  };
}

const TABS = ['hierarchy', 'people'] as const;
type Tab = (typeof TABS)[number];

export default async function PeoplePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { locale } = await params;
  const { q, tab } = await searchParams;
  setRequestLocale(locale);

  const activeTab: Tab = tab === 'people' ? 'people' : 'hierarchy';

  const t = await getTranslations('domain.people');
  const s = await getTranslations('home.doors.people');
  const p = await getTranslations('people');
  const search = await getTranslations('search');

  const [hierarchyRoot, people] = await Promise.all([
    getHierarchyRoot(locale),
    activeTab === 'people'
      ? db.person.findMany({
          where: q
            ? {
                OR: [
                  { fullName: { contains: q, mode: 'insensitive' } },
                  {
                    tenures: {
                      some: { position: { title: { contains: q, mode: 'insensitive' } } },
                    },
                  },
                ],
              }
            : undefined,
          orderBy: { createdAt: 'asc' },
          include: { tenures: { where: { isCurrent: true }, include: { position: true } } },
        })
      : Promise.resolve([]),
  ]);

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
        <div className="flex gap-6" role="tablist">
          {TABS.map((key) => {
            const isActive = key === activeTab;
            return (
              <Link
                key={key}
                href={{ pathname: '/people', query: key === 'hierarchy' ? {} : { tab: key } }}
                role="tab"
                aria-selected={isActive}
                className={
                  isActive
                    ? 'border-brand text-brand border-b-2 pb-2 text-small font-medium no-underline'
                    : 'text-ink-muted hover:text-gray-400 border-b-2 border-transparent pb-2 text-small no-underline'
                }
              >
                {p(`tabs.${key}`)}
              </Link>
            );
          })}
        </div>

        {activeTab === 'hierarchy' &&
          (hierarchyRoot ? (
            <section aria-labelledby="hierarchy-heading">
              <h2 id="hierarchy-heading" className="text-heading font-semibold">
                {p('hierarchyHeading')}
              </h2>
              <p className="text-small text-ink-muted mt-1 max-w-measure">
                {p('hierarchyDescription')}
              </p>
              <div className="mt-6">
                <HierarchyMindMap root={hierarchyRoot} />
              </div>
            </section>
          ) : (
            <p className="text-body text-ink-muted">{p('hierarchyEmpty')}</p>
          ))}

        {activeTab === 'people' && (
          <div className="space-y-8">
            <SearchBar
              action={`/${locale}/people`}
              label={s('searchLabel')}
              placeholder={s('searchPlaceholder')}
              defaultValue={q}
              hiddenFields={{ tab: 'people' }}
            />

            {people.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {people.map((person) => {
                  const slug = personSlug(person.sourceKey);
                  return (
                    <Card
                      key={person.id}
                      href={slug ? `/people/${slug}` : undefined}
                      title={person.fullName}
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
            ) : (
              q && <p className="text-body text-ink-muted">{search('noResults')}</p>
            )}
          </div>
        )}
      </div>
    </DomainShell>
  );
}
