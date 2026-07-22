import { ScrollText } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { DomainShell } from '@/components/DomainShell';
import { SearchBar } from '@/components/SearchBar';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'domain.laws' });
  return { title: t('title'), description: t('description') };
}

export default async function LawsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('domain.laws');
  const s = await getTranslations('home.doors.laws');

  return (
    <DomainShell title={t('title')} icon={ScrollText}
      search={
        <SearchBar
          action={`/${locale}/laws`}
          label={s('searchLabel')}
          placeholder={s('searchPlaceholder')}
        />
      } />
  );
}
