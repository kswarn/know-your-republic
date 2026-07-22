import { Landmark, MapPin, ScrollText, ShieldCheck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SearchBar } from '@/components/SearchBar';
import { Link } from '@/i18n/navigation';

const DOORS = [
  { key: 'people', href: '/people', Icon: Landmark },
  { key: 'laws', href: '/laws', Icon: ScrollText },
  { key: 'rights', href: '/rights', Icon: ShieldCheck },
] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');

  return (
    <div className="space-y-20">
      <section>
        <h1 className="text-display text-brand font-semibold">{t('heading')}</h1>
        <p className="text-body text-ink-muted mt-4 max-w-measure">{t('intro')}</p>
      </section>

      {/* The three doors. Each is a section with its own search bar, not a tab or a
          card grid — a reader arrives knowing which of the three questions they have. */}
      <div className="grid gap-14 md:grid-cols-3">
        {DOORS.map(({ key, href, Icon }) => (
          <section key={key} aria-labelledby={`door-${key}`}>
            <div className="flex items-center gap-3">
              <span className="border-rule bg-paper-raised inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
                <Icon aria-hidden="true" className="text-ink-muted size-5" />
              </span>
              <h2 id={`door-${key}`} className="text-title font-semibold">
                <Link href={href} className="text-ink hover:text-accent no-underline">
                  {t(`doors.${key}.title`)}
                </Link>
              </h2>
            </div>
            <div className="mt-4">
              <SearchBar
                action={`/${locale}${href}`}
                label={t(`doors.${key}.searchLabel`)}
                placeholder={t(`doors.${key}.searchPlaceholder`)}
                size="compact"
              />
            </div>
            <p className="text-small text-ink-muted mt-3">{t(`doors.${key}.description`)}</p>
          </section>
        ))}
      </div>

      <section
        aria-labelledby="locality"
        className="border-rule bg-paper-raised border p-6 md:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="border-rule bg-paper-raised inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
            <MapPin aria-hidden="true" className="text-ink-muted size-5" />
          </span>
          <h2 id="locality" className="text-title font-semibold">
            {t('locality.heading')}
          </h2>
        </div>
        <div className="mt-5">
          <SearchBar
            action={`/${locale}/me`}
            name="where"
            label={t('locality.label')}
            placeholder={t('locality.placeholder')}
          />
        </div>
        <p className="text-small text-ink-muted mt-3">{t('locality.description')}</p>
      </section>
    </div>
  );
}
