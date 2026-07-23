import { MapPin } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Card } from '@/components/Card';
import { LastVerified } from '@/components/LastVerified';
import { SourceLink } from '@/components/SourceLink';
import { Link } from '@/i18n/navigation';
import { db } from '@/lib/db';
import { findJurisdictionBySlug } from '@/lib/geography';
import { personSlug } from '@/lib/people';

async function getRepresentatives(slug: string) {
  const jurisdiction = await findJurisdictionBySlug(db, slug);
  if (!jurisdiction) return null;

  const positions = await db.position.findMany({
    where: { jurisdictionId: jurisdiction.id },
    include: {
      institution: true,
      tenures: { where: { isCurrent: true }, include: { person: true } },
    },
  });

  // One card per person, not one per position — someone holding several
  // portfolios (e.g. a Deputy CM who is also Minister of Revenue and Sports)
  // is still a single representative, not three.
  const peopleById = new Map<
    string,
    { person: (typeof positions)[number]['tenures'][number]['person']; positionTitles: string[] }
  >();
  for (const position of positions) {
    for (const tenure of position.tenures) {
      const existing = peopleById.get(tenure.person.id);
      const label = `${position.title} · ${position.institution.name}`;
      if (existing) {
        existing.positionTitles.push(label);
      } else {
        peopleById.set(tenure.person.id, { person: tenure.person, positionTitles: [label] });
      }
    }
  }
  const people = [...peopleById.values()];

  const citations = people.length
    ? await db.citation.findMany({
        where: {
          entityType: 'PERSON',
          entityId: { in: people.map((p) => p.person.id) },
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

  // "Sourced or it doesn't ship": a person with no *primary* citation for
  // their current position (e.g. Karnataka High Court judges, ingested from a
  // secondary source pending an official one — see docs/SOURCES_LEGAL.md)
  // doesn't appear here, even though the record exists in the database.
  const confirmedPeople = people.filter((p) => citationsByPerson.has(p.person.id));

  return { jurisdiction, people: confirmedPeople, citationsByPerson };
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; state: string }>;
}): Promise<Metadata> {
  const { state } = await props.params;
  const found = await getRepresentatives(state);
  if (!found) return {};
  return { title: found.jurisdiction.name };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ locale: string; state: string }>;
}) {
  const { locale, state } = await params;
  setRequestLocale(locale);

  const found = await getRepresentatives(state);
  if (!found) notFound();
  const { jurisdiction, people, citationsByPerson } = found;

  const m = await getTranslations('me');

  return (
    <div className="max-w-page space-y-6">
      <Link href="/me" className="text-small text-accent inline-block underline underline-offset-2">
        {m('backToMap')}
      </Link>

      <header className="flex items-center gap-3">
        <span className="border-rule bg-paper-raised inline-flex size-8 shrink-0 items-center justify-center rounded-full border md:size-10">
          <MapPin aria-hidden="true" className="text-ink size-4 md:size-5" />
        </span>
        <h1 className="text-display font-semibold">{jurisdiction.name}</h1>
      </header>

      {people.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {people.map(({ person, positionTitles }) => {
            const slug = personSlug(person.sourceKey);
            return (
              <Card
                key={person.id}
                href={slug ? `/people/${slug}` : undefined}
                title={person.fullName}
                photoUrl={person.photoUrl}
                context={positionTitles.join(' · ')}
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
        <p className="text-body text-ink-muted">{m('noResults', { state: jurisdiction.name })}</p>
      )}
    </div>
  );
}
