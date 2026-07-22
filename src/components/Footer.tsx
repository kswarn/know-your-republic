import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer className="border-rule mt-16 border-t">
      <div className="mx-auto w-full max-w-page px-4 py-8 text-center">
        <p className="text-meta text-ink-muted mx-auto max-w-measure">{t('sourcing')}</p>
        <p className="text-meta text-ink-muted mt-2">{t('notNews')}</p>
      </div>
    </footer>
  );
}
