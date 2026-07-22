import { ShieldCheck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { LastVerified } from '@/components/LastVerified';
import { SourceLink } from '@/components/SourceLink';
import { TTSButton } from '@/components/TTSButton';
import { Link } from '@/i18n/navigation';
import { db } from '@/lib/db';

async function getRight(slug: string) {
  const right = await db.right.findUnique({ where: { slug } });
  if (!right || right.explanationStatus !== 'PUBLISHED') return null;

  const citations = await db.citation.findMany({
    where: { entityType: 'RIGHT', entityId: right.id, isPrimary: true },
  });

  return { right, citations };
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const found = await getRight(slug);
  if (!found) return {};
  return { title: found.right.title, description: found.right.appliesTo ?? undefined };
}

export default async function RightDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const found = await getRight(slug);
  if (!found) notFound();
  const { right, citations } = found;

  const rc = await getTranslations('rightCategory');
  const rt = await getTranslations('rights');

  return (
    <article className="max-w-measure space-y-6">
      <Link
        href="/rights"
        className="text-small text-accent inline-block underline underline-offset-2"
      >
        {rt('backToRights')}
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="border-rule bg-paper-raised inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
            <ShieldCheck aria-hidden="true" className="text-ink-muted size-5" />
          </span>
          <h1 className="text-display font-semibold">{right.title}</h1>
        </div>
        <p className="text-small text-ink-muted">
          {rc(right.category)} · {right.articleCitation}
        </p>
        {right.appliesTo && (
          <p className="text-small text-ink-muted">
            <span className="font-medium">{rt('appliesTo')}:</span> {right.appliesTo}
          </p>
        )}
        <TTSButton />
      </header>

      {right.plainExplanation && (
        <p className="text-body whitespace-pre-line">{right.plainExplanation}</p>
      )}

      <div className="border-rule space-y-2 border-t pt-4">
        <SourceLink citations={citations} />
        <LastVerified date={right.lastVerifiedAt} />
      </div>
    </article>
  );
}
