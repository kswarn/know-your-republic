import { defineRouting } from 'next-intl/routing';

import { DEFAULT_LOCALE, ENABLED_LOCALE_CODES } from './locales';

export const routing = defineRouting({
  locales: ENABLED_LOCALE_CODES,
  defaultLocale: DEFAULT_LOCALE,
  // Always show the locale in the URL. /en/laws is a real, shareable, indexable URL —
  // the same directory in every language, no hidden default.
  localePrefix: 'always',
});
