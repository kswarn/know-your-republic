import { ScrollText } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { LastVerified } from '@/components/LastVerified';
import { SourceLink } from '@/components/SourceLink';
import { TTSButton } from '@/components/TTSButton';
import { Link } from '@/i18n/navigation';
import { db } from '@/lib/db';

async function getLaw(id: string) {
  const law = await db.law.findUnique({ where: { id } });
  if (!law || law.summaryStatus !== 'PUBLISHED') return null;

  const [citations, relatedRights] = await Promise.all([
    db.citation.findMany({ where: { entityType: 'LAW', entityId: law.id, isPrimary: true } }),
    db.right.findMany({ where: { relatedLawId: law.id } }),
  ]);

  return { law, citations, relatedRights };
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const found = await getLaw(id);
  if (!found) return {};
  return { title: found.law.title, description: found.law.subjectArea ?? undefined };
}

export default async function LawDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const found = await getLaw(id);
  if (!found) notFound();
  const { law, citations, relatedRights } = found;

  const l = await getTranslations('laws');

  return (
    <article className="max-w-measure space-y-6">
      <Link href="/laws" className="text-small text-accent inline-block underline underline-offset-2">
        {l('backToLaws')}
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="border-rule bg-paper-raised inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
            <ScrollText aria-hidden="true" className="text-ink size-5" />
          </span>
          <h1 className="text-display font-semibold">{law.title}</h1>
        </div>
        <p className="text-small text-ink-muted">
          {[law.kind, law.level, law.subjectArea, law.year].filter(Boolean).join(' · ')}
        </p>
        <TTSButton />
      </header>

      {law.plainSummary && <p className="text-body whitespace-pre-line">{law.plainSummary}</p>}

      {relatedRights.length > 0 && (
        <section aria-labelledby="related-rights-heading">
          <h2 id="related-rights-heading" className="text-heading font-semibold">
            {l('relatedRights')}
          </h2>
          <ul className="mt-2 space-y-1">
            {relatedRights.map((right) => (
              <li key={right.id}>
                <Link
                  href={`/rights/${right.slug}`}
                  className="text-accent underline underline-offset-2"
                >
                  {right.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="border-rule space-y-2 border-t pt-4">
        <SourceLink citations={citations} />
        <LastVerified date={law.lastVerifiedAt} />
      </div>
    </article>
  );
}
