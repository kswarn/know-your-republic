import { MapPin } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { DomainShell } from '@/components/DomainShell';
import { OverviewMap } from '@/components/OverviewMap';
import { db } from '@/lib/db';
import { toRepresentativePoint } from '@/lib/representatives';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'domain.me' });
  return { title: t('title'), description: t('description') };
}

/** Every Minister/Head-of-Government/Legislator currently in office, flattened
 * for the map — the same population as the People directory, fetched in full
 * (not paginated) since the map plots everyone at once. */
async function getAllRepresentatives() {
  const people = await db.person.findMany({
    where: {
      tenures: {
        some: {
          isCurrent: true,
          position: { roleType: { in: ['HEAD_OF_GOVERNMENT', 'MINISTER', 'LEGISLATOR'] } },
        },
      },
    },
    include: {
      party: true,
      tenures: {
        where: { isCurrent: true },
        include: { position: { include: { institution: true, jurisdiction: true } } },
      },
    },
  });
  return people.map(toRepresentativePoint);
}

export default async function MePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('domain.me');
  const m = await getTranslations('me');
  const representatives = await getAllRepresentatives();

  return (
    <DomainShell title={t('title')} icon={MapPin}>
      <section aria-labelledby="map-heading">
        <h2 id="map-heading" className="text-heading font-semibold">
          {m('mapHeading')}
        </h2>
        <p className="text-small text-ink-muted mt-1 hidden max-w-measure md:block">{m('mapDescription')}</p>
        <p className="text-small text-ink-muted mt-1 max-w-measure md:hidden">{m('mapDescriptionTouch')}</p>
        <div className="mt-6">
          <OverviewMap people={representatives} />
        </div>
      </section>
    </DomainShell>
  );
}
