import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { Card } from '@/components/Card';
import { DomainShell } from '@/components/DomainShell';
import { GavelIcon } from '@/components/icons/GavelIcon';
import { LastVerified } from '@/components/LastVerified';
import { SearchBar } from '@/components/SearchBar';
import { SourceLink } from '@/components/SourceLink';
import { db } from '@/lib/db';
import { personSlug } from '@/lib/people';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'domain.judiciary' });
  return { title: t('title'), description: t('description') };
}

export default async function JudiciaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('domain.judiciary');
  const s = await getTranslations('home.doors.people');
  const j = await getTranslations('judiciary');
  const search = await getTranslations('search');

  // Scoped to the Supreme Court only for now — High Court judges (Karnataka's
  // are seeded, the other 24 courts are not yet) get their own section once
  // every court has equivalent coverage, rather than mixing partial data in here.
  const judgeFilter = {
    isCurrent: true,
    position: { roleType: 'JUDGE' as const, institution: { name: 'Supreme Court of India' } },
  };

  const judges = await db.person.findMany({
    where: {
      tenures: { some: judgeFilter },
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { tenures: { some: { position: { title: { contains: q, mode: 'insensitive' } } } } },
            ],
          }
        : {}),
    },
    include: {
      tenures: {
        where: judgeFilter,
        include: { position: { include: { institution: true } } },
      },
    },
  });

  // Seniority order: Chief Justice first, then by date of appointment — the same
  // order the Supreme Court's own site lists judges in.
  judges.sort((a, b) => {
    const aIsChief = a.tenures.some((t) => t.position.title.startsWith('Chief Justice'));
    const bIsChief = b.tenures.some((t) => t.position.title.startsWith('Chief Justice'));
    if (aIsChief !== bIsChief) return aIsChief ? -1 : 1;
    const aDate = a.tenures[0]?.startDate?.getTime() ?? 0;
    const bDate = b.tenures[0]?.startDate?.getTime() ?? 0;
    return aDate - bDate;
  });

  const citations = judges.length
    ? await db.citation.findMany({
        where: {
          entityType: 'PERSON',
          entityId: { in: judges.map((judge) => judge.id) },
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
    <DomainShell
      title={t('title')}
      icon={GavelIcon}
      search={
        <SearchBar
          action={`/${locale}/judiciary`}
          label={s('searchLabel')}
          placeholder={s('searchPlaceholder')}
          defaultValue={q}
        />
      }
    >
      {judges.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {judges.map((judge) => {
            const slug = personSlug(judge.sourceKey);
            const tenure = judge.tenures[0];
            return (
              <Card
                key={judge.id}
                href={slug ? `/people/${slug}` : undefined}
                title={judge.fullName}
                photoUrl={judge.photoUrl}
                context={
                  tenure
                    ? `${tenure.position.title} · ${tenure.position.institution.name}`
                    : `${j('courtLabel')}`
                }
                footer={
                  <div className="space-y-1">
                    <SourceLink citations={citationsByPerson.get(judge.id) ?? []} />
                    <LastVerified date={judge.lastVerifiedAt} />
                  </div>
                }
              />
            );
          })}
        </div>
      ) : (
        q && <p className="text-body text-ink-muted">{search('noResults')}</p>
      )}
    </DomainShell>
  );
}
