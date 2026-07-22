import { Landmark } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { LastVerified } from '@/components/LastVerified';
import { SourceLink } from '@/components/SourceLink';
import { TTSButton } from '@/components/TTSButton';
import { Link } from '@/i18n/navigation';
import { db } from '@/lib/db';

async function getPerson(slug: string) {
  const person = await db.person.findFirst({
    where: { sourceKey: { endsWith: `:${slug}` } },
    include: {
      party: true,
      tenures: {
        where: { isCurrent: true },
        include: { position: { include: { institution: true, jurisdiction: true } } },
      },
    },
  });
  if (!person) return null;

  const citations = await db.citation.findMany({
    where: { entityType: 'PERSON', entityId: person.id, isPrimary: true },
  });

  return { person, citations };
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const found = await getPerson(slug);
  if (!found) return {};
  return {
    title: found.person.fullName,
    description: found.person.tenures.map((t) => t.position.title).join(', '),
  };
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const found = await getPerson(slug);
  if (!found) notFound();
  const { person, citations } = found;

  const p = await getTranslations('people');

  return (
    <article className="max-w-measure space-y-6">
      <Link
        href={{ pathname: '/people', query: { tab: 'people' } }}
        className="text-small text-accent inline-block underline underline-offset-2"
      >
        {p('backToPeople')}
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="border-rule bg-paper-raised inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
            <Landmark aria-hidden="true" className="text-ink-muted size-5" />
          </span>
          <h1 className="text-display font-semibold">{person.fullName}</h1>
        </div>
        {person.party && (
          <p className="text-small text-ink-muted">
            <span className="font-medium">{p('party')}:</span> {person.party.name}
          </p>
        )}
        <TTSButton />
      </header>

      {person.tenures.length > 0 && (
        <section aria-labelledby="positions-heading">
          <h2 id="positions-heading" className="text-heading font-semibold">
            {p('positions')}
          </h2>
          <ul className="mt-2 space-y-2">
            {person.tenures.map((tenure) => (
              <li key={tenure.id} className="border-rule border-s-2 ps-3">
                <p className="text-body font-medium">{tenure.position.title}</p>
                <p className="text-small text-ink-muted">{tenure.position.institution.name}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {person.bio && <p className="text-body whitespace-pre-line">{person.bio}</p>}

      <div className="border-rule space-y-2 border-t pt-4">
        <SourceLink citations={citations} />
        <LastVerified date={person.lastVerifiedAt} />
      </div>
    </article>
  );
}
