import { getTranslations } from 'next-intl/server';

import type { ReactNode } from 'react';

/**
 * The common frame for a domain landing page: title, one line of scope, a prominent
 * search bar, then results. Phase 0 ships the frame with an honest empty state —
 * records appear here only once they carry an official source.
 */
export async function DomainShell({
  title,
  description,
  search,
  children,
}: {
  title: string;
  description: string;
  search?: ReactNode;
  children?: ReactNode;
}) {
  const t = await getTranslations('empty');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-display font-semibold">{title}</h1>
        <p className="text-body text-ink-muted mt-3 max-w-measure">{description}</p>
      </header>

      {search}

      {children ?? (
        <section className="border-rule text-ink-muted border border-dashed p-8">
          <h2 className="text-heading text-ink font-semibold">{t('heading')}</h2>
          <p className="text-small mt-2 max-w-measure">{t('body')}</p>
        </section>
      )}
    </div>
  );
}
