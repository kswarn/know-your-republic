import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Footer } from '@/components/Footer';
import { SiteHeader } from '@/components/SiteHeader';
import { TranslationFlag } from '@/components/TranslationFlag';
import { fontClassForScript } from '@/i18n/fonts';
import { ENABLED_LOCALES, localeMeta } from '@/i18n/locales';
import { routing } from '@/i18n/routing';

import '../globals.css';

export function generateStaticParams() {
  return ENABLED_LOCALES.map(({ code }) => ({ locale: code }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    title: { default: t('name'), template: `%s · ${t('name')}` },
    description: t('description'),
    // Every locale is a real alternate of the same record, not a duplicate.
    alternates: {
      languages: Object.fromEntries(ENABLED_LOCALES.map(({ code }) => [code, `/${code}`])),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for static rendering: without it every page opts into dynamic rendering.
  setRequestLocale(locale);

  const meta = localeMeta(locale);
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <html lang={locale} dir={meta.dir} className={fontClassForScript(meta.script)}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <a href="#main" className="skip-link">
            {t('skipToContent')}
          </a>
          <SiteHeader />
          <TranslationFlag locale={locale} />
          <main id="main" className="mx-auto w-full max-w-page flex-1 px-4 py-10">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
