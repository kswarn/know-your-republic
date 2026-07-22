import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { isReviewedLocale } from '@/i18n/locales';

/**
 * Shown on every page in a locale whose content has not been human-reviewed.
 *
 * It is a statement of provenance, not an apology: a reader in Santali is entitled
 * to know that what they are reading came from a machine and that the English is
 * authoritative, and to reach the English in one click.
 */
export async function TranslationFlag({ locale }: { locale: string }) {
  if (isReviewedLocale(locale)) return null;

  const t = await getTranslations('translation');

  return (
    <aside
      className="border-flag/40 bg-flag-soft text-flag mx-auto my-6 max-w-page border px-4 py-3"
      // Announced on load: this changes how the whole page should be read.
      role="note"
    >
      <p className="text-small">
        <strong className="font-semibold">{t('unreviewed')}.</strong>{' '}
        {t('unreviewedExplanation')}{' '}
        <Link href="/" locale="en" className="underline underline-offset-2">
          {t('viewInEnglish')}
        </Link>
      </p>
    </aside>
  );
}
