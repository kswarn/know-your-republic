import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

import { LanguageSwitcher } from './LanguageSwitcher';

const SECTIONS = [
  { href: '/people', key: 'people' },
  { href: '/laws', key: 'laws' },
  { href: '/rights', key: 'rights' },
  { href: '/judiciary', key: 'judiciary' },
  { href: '/me', key: 'me' },
] as const;

export async function SiteHeader() {
  const t = await getTranslations('nav');
  const site = await getTranslations('site');

  return (
    <header className="border-rule border-b">
      <div className="mx-auto flex w-full max-w-page flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-brand text-heading font-semibold no-underline">
          {site('name')}
        </Link>
        <nav aria-label={site('name')} className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {SECTIONS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="text-ink-muted hover:text-accent text-small no-underline"
            >
              {t(key)}
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
