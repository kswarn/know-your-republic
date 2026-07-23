import { getTranslations } from 'next-intl/server';

import type { ComponentType, ReactNode } from 'react';

// Most domain icons are lucide-react components, but a section may supply a custom
// image-backed icon (e.g. a licensed asset) instead — both shapes only ever need to
// accept `className` and `aria-hidden` here.
type DomainIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

/**
 * The common frame for a domain landing page: icon + title, one line of scope, a
 * prominent search bar, then results. Phase 0 ships the frame with an honest empty
 * state — records appear here only once they carry an official source.
 */
export async function DomainShell({
  title,
  icon: Icon,
  search,
  children,
}: {
  title: string;
  icon: DomainIcon;
  search?: ReactNode;
  children?: ReactNode;
}) {
  const t = await getTranslations('empty');

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-start gap-4">
          <span className="border-rule bg-paper-raised inline-flex size-11 shrink-0 items-center justify-center rounded-full border md:size-14">
            <Icon aria-hidden="true" className="text-ink size-6 md:size-7" />
          </span>
          <h1 className="text-display font-semibold">{title}</h1>
        </div>
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
