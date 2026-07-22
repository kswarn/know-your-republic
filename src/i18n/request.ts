import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LOCALE } from './locales';
import { routing } from './routing';

/**
 * Loads the message catalog for the matched locale, falling back to English for any
 * key a catalog hasn't translated yet. Stubbed catalogs are therefore safe to ship:
 * a missing key renders English rather than the raw key path.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : DEFAULT_LOCALE;

  const fallback = (await import('../messages/en.json')).default;
  const messages =
    locale === DEFAULT_LOCALE
      ? fallback
      : { ...fallback, ...(await import(`../messages/${locale}.json`)).default };

  return { locale, messages };
});
