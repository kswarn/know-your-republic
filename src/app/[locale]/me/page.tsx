import { MapPin } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { DomainShell } from '@/components/DomainShell';
import { IndiaMap } from '@/components/IndiaMap';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'domain.me' });
  return { title: t('title'), description: t('description') };
}

export default async function MePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('domain.me');
  const m = await getTranslations('me');

  return (
    <DomainShell title={t('title')} icon={MapPin}>
      <section aria-labelledby="map-heading">
        <h2 id="map-heading" className="text-heading font-semibold">
          {m('mapHeading')}
        </h2>
        <p className="text-small text-ink-muted mt-1 max-w-measure">{m('mapDescription')}</p>
        <div className="mt-6">
          <IndiaMap />
        </div>
      </section>
    </DomainShell>
  );
}
