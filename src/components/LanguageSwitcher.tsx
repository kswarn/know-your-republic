'use client';

import { ChevronDown, Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { ENABLED_LOCALES, isReviewedLocale, localeMeta } from '@/i18n/locales';
import { usePathname, useRouter } from '@/i18n/navigation';

/**
 * A <select> sizes itself to its *widest* option in every browser tested
 * here, not the currently selected one — so with "English"/"हिन्दी"/"ಕನ್ನಡ"
 * all in the same element, every locale's pill would end up as wide as
 * "English" needs, leaving visible empty space next to the shorter scripts.
 * Measured per-locale widths (text + icon + padding) sidestep that; a locale
 * missing from this map falls back to the widest one measured so far.
 */
const COMPACT_SWITCHER_WIDTH: Record<string, number> = { en: 78, hi: 60, kn: 64 };
const COMPACT_SWITCHER_WIDTH_FALLBACK = 78;

/**
 * A native <select>, not a custom dropdown, in both variants below. It is
 * keyboard- and screen-reader-correct for free, and on Android it opens the
 * system picker — which is the fastest way for someone to find their
 * language in a list of twenty-three.
 *
 * Two separate <select> elements (not one reflowed by CSS): below `md` there
 * isn't room for the full pill (icon + native name + chevron) next to the
 * wordmark and the menu button, so a compact circle showing just the
 * language code (matching the hamburger button's own size and border)
 * replaces it — a genuinely different set of options (short codes, not
 * native names), not just a restyle of the same one. Each carries its own
 * `id`; giving both the same id would be invalid HTML.
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

  function handleChange(next: string) {
    startTransition(() => {
      // Keep the reader on the same record, just in another language.
      router.replace(pathname, { locale: next });
    });
    if (!isReviewedLocale(next)) setToastLanguage(localeMeta(next).nativeName);
  }

  return (
    <div className="relative">
      <div className="relative hidden w-40 md:block">
        <label htmlFor="language-switcher-full" className="sr-only">
          {t('chooseLanguage')}
        </label>
        <Languages
          aria-hidden="true"
          className="text-ink-muted pointer-events-none absolute inset-y-0 inset-s-3 my-auto size-4"
        />
        <select
          id="language-switcher-full"
          value={current}
          disabled={isPending}
          onChange={(event) => handleChange(event.target.value)}
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
      </div>

      <div className="relative md:hidden">
        <label htmlFor="language-switcher-compact" className="sr-only">
          {t('chooseLanguage')}
        </label>
        <select
          id="language-switcher-compact"
          value={current}
          disabled={isPending}
          onChange={(event) => handleChange(event.target.value)}
          style={{ width: COMPACT_SWITCHER_WIDTH[current] ?? COMPACT_SWITCHER_WIDTH_FALLBACK }}
          className="border-rule bg-paper-raised text-ink flex h-10 appearance-none items-center rounded-full border pe-3 ps-6 text-xs font-medium"
        >
          {ENABLED_LOCALES.map((locale) => (
            <option key={locale.code} value={locale.code} lang={locale.code}>
              {locale.nativeName}
            </option>
          ))}
          {/* Unlike the full desktop select, this one omits the "more languages"
              disabled option — a <select> sizes itself to its widest option
              (some browsers, regardless of which is selected), and that one
              long English sentence would blow out this compact pill's width
              on every locale, not just when it's the visible option. */}
        </select>
        <Languages
          aria-hidden="true"
          className="text-ink-muted pointer-events-none absolute inset-y-0 inset-s-2 my-auto size-3"
        />
      </div>

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
