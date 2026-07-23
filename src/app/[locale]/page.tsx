import { ChevronRight, Landmark, MapPin, ScrollText, ShieldCheck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { GavelIcon } from '@/components/icons/GavelIcon';
import { Link } from '@/i18n/navigation';

const DOORS = [
  { key: 'people', href: '/people', Icon: Landmark },
  { key: 'laws', href: '/laws', Icon: ScrollText },
  { key: 'rights', href: '/rights', Icon: ShieldCheck },
  { key: 'me', href: '/me', Icon: MapPin },
  { key: 'judiciary', href: '/judiciary', Icon: GavelIcon },
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

      {/* The five doors into the directory — a reader arrives already knowing which
          of these questions they have. Each card is the whole clickable target,
          not just its title, and the fixed-height (3-line) description keeps every
          card the same height regardless of how much a given door's copy runs. */}
      <div className="grid gap-6 md:grid-cols-3">
        {DOORS.map(({ key, href, Icon }) => (
          <Link
            key={key}
            href={href}
            aria-labelledby={`door-${key}`}
            className="group border-rule bg-paper-raised hover:border-accent/50 block border p-5 no-underline transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="border-rule bg-paper inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
                <Icon aria-hidden="true" className="text-ink size-5" />
              </span>
              <h2 id={`door-${key}`} className="text-title text-ink flex-1 font-semibold">
                {t(`doors.${key}.title`)}
              </h2>
              <ChevronRight
                aria-hidden="true"
                className="text-ink-muted group-hover:text-accent size-5 shrink-0 transition-colors"
              />
            </div>
            <p className="text-small text-ink-muted mt-3 line-clamp-3">{t(`doors.${key}.description`)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
