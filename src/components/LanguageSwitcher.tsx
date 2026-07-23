'use client';

import { ChevronDown, Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { ENABLED_LOCALES, isReviewedLocale, localeMeta } from '@/i18n/locales';
import { usePathname, useRouter } from '@/i18n/navigation';

/**
 * A native <select>, not a custom dropdown. It is keyboard- and screen-reader-correct
 * for free, and on Android it opens the system picker — which is the fastest way for
 * someone to find their language in a list of twenty-three.
 *
 * The native appearance is replaced with a fixed-width control plus two decorative
 * icons: the leading and trailing padding (`ps-9`, `pe-8`) reserve space for them so
 * neither icon — nor the browser's own caret, which `appearance-none` removes in
 * favour of the explicit `ChevronDown` — ever overlaps the selected text or sits
 * outside the control's border.
 *
 * Each option is labelled in its own language and carries `lang`, so assistive
 * technology switches voice per option instead of reading Kannada with an English one.
 */
export function LanguageSwitcher() {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [toastLanguage, setToastLanguage] = useState<string | null>(null);

  const current = (params.locale as string) ?? 'en';

  // Auto-dismiss — a toast that lingers forever stops being a toast.
  useEffect(() => {
    if (!toastLanguage) return;
    const timer = setTimeout(() => setToastLanguage(null), 5000);
    return () => clearTimeout(timer);
  }, [toastLanguage]);

  return (
    <div className="relative w-40">
      <label htmlFor="language-switcher" className="sr-only">
        {t('chooseLanguage')}
      </label>
      <Languages
        aria-hidden="true"
        className="text-ink-muted pointer-events-none absolute inset-y-0 inset-s-3 my-auto size-4"
      />
      <select
        id="language-switcher"
        value={current}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value;
          startTransition(() => {
            // Keep the reader on the same record, just in another language.
            router.replace(pathname, { locale: next });
          });
          if (!isReviewedLocale(next)) setToastLanguage(localeMeta(next).nativeName);
        }}
        className="border-rule bg-paper-raised text-ink text-small w-full appearance-none border py-2 ps-9 pe-8"
      >
        {ENABLED_LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code} lang={locale.code}>
            {locale.nativeName}
          </option>
        ))}
        <option disabled>{t('moreLanguagesComingSoon')}</option>
      </select>
      <ChevronDown
        aria-hidden="true"
        className="text-ink-muted pointer-events-none absolute inset-y-0 inset-e-2 my-auto size-4"
      />

      {toastLanguage && (
        <div
          role="status"
          className="border-rule bg-paper-raised text-ink text-small fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm border px-4 py-3 shadow-md sm:inset-x-auto sm:inset-e-4"
        >
          {t('translationInProgress', { language: toastLanguage })}
        </div>
      )}
    </div>
  );
}
