import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { DomainShell } from '@/components/DomainShell';
import { SearchBar } from '@/components/SearchBar';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'domain.rights' });
  return { title: t('title'), description: t('description') };
}

export default async function RightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('domain.rights');
  const s = await getTranslations('home.doors.rights');

  return (
    <DomainShell title={t('title')} description={t('description')}
      search={
        <SearchBar
          action={`/${locale}/rights`}
          label={s('searchLabel')}
          placeholder={s('searchPlaceholder')}
        />
      } />
  );
}
