/**
 * The locales the directory ships in: English (the source language, and an official
 * language of the Union) plus all 22 languages of the Eighth Schedule.
 *
 * `script` drives per-locale font loading — we never ship every Indic font to every
 * visitor. `dir` drives the `dir` attribute on <html>; the Perso-Arabic locales are
 * right-to-left and must be laid out correctly from the first component, not retrofitted.
 */

export type Script =
  | 'latin'
  | 'devanagari'
  | 'bengali'
  | 'gujarati'
  | 'gurmukhi'
  | 'kannada'
  | 'malayalam'
  | 'odia'
  | 'tamil'
  | 'telugu'
  | 'arabic'
  | 'meetei-mayek'
  | 'ol-chiki';

export type LocaleMeta = {
  /** BCP 47 code used in the URL: /kn/laws */
  code: string;
  /** Name in English, for documentation and the a11y label. */
  englishName: string;
  /** Name in the language itself — what a speaker actually looks for in the switcher. */
  nativeName: string;
  script: Script;
  dir: 'ltr' | 'rtl';
  /** Eighth Schedule language? English is not, but is the source language. */
  scheduled: boolean;
};

export const LOCALES = [
  { code: 'en', englishName: 'English', nativeName: 'English', script: 'latin', dir: 'ltr', scheduled: false },
  { code: 'as', englishName: 'Assamese', nativeName: 'অসমীয়া', script: 'bengali', dir: 'ltr', scheduled: true },
  { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা', script: 'bengali', dir: 'ltr', scheduled: true },
  { code: 'brx', englishName: 'Bodo', nativeName: 'बड़ो', script: 'devanagari', dir: 'ltr', scheduled: true },
  { code: 'doi', englishName: 'Dogri', nativeName: 'डोगरी', script: 'devanagari', dir: 'ltr', scheduled: true },
  { code: 'gu', englishName: 'Gujarati', nativeName: 'ગુજરાતી', script: 'gujarati', dir: 'ltr', scheduled: true },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी', script: 'devanagari', dir: 'ltr', scheduled: true },
  { code: 'kn', englishName: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'kannada', dir: 'ltr', scheduled: true },
  { code: 'ks', englishName: 'Kashmiri', nativeName: 'کٲشُر', script: 'arabic', dir: 'rtl', scheduled: true },
  { code: 'kok', englishName: 'Konkani', nativeName: 'कोंकणी', script: 'devanagari', dir: 'ltr', scheduled: true },
  { code: 'mai', englishName: 'Maithili', nativeName: 'मैथिली', script: 'devanagari', dir: 'ltr', scheduled: true },
  { code: 'ml', englishName: 'Malayalam', nativeName: 'മലയാളം', script: 'malayalam', dir: 'ltr', scheduled: true },
  { code: 'mni', englishName: 'Manipuri', nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ', script: 'meetei-mayek', dir: 'ltr', scheduled: true },
  { code: 'mr', englishName: 'Marathi', nativeName: 'मराठी', script: 'devanagari', dir: 'ltr', scheduled: true },
  { code: 'ne', englishName: 'Nepali', nativeName: 'नेपाली', script: 'devanagari', dir: 'ltr', scheduled: true },
  { code: 'or', englishName: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'odia', dir: 'ltr', scheduled: true },
  { code: 'pa', englishName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'gurmukhi', dir: 'ltr', scheduled: true },
  { code: 'sa', englishName: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'devanagari', dir: 'ltr', scheduled: true },
  { code: 'sat', englishName: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'ol-chiki', dir: 'ltr', scheduled: true },
  { code: 'sd', englishName: 'Sindhi', nativeName: 'سنڌي', script: 'arabic', dir: 'rtl', scheduled: true },
  { code: 'ta', englishName: 'Tamil', nativeName: 'தமிழ்', script: 'tamil', dir: 'ltr', scheduled: true },
  { code: 'te', englishName: 'Telugu', nativeName: 'తెలుగు', script: 'telugu', dir: 'ltr', scheduled: true },
  { code: 'ur', englishName: 'Urdu', nativeName: 'اردو', script: 'arabic', dir: 'rtl', scheduled: true },
] as const satisfies readonly LocaleMeta[];

export type Locale = (typeof LOCALES)[number]['code'];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export const DEFAULT_LOCALE = 'en' satisfies Locale;

/**
 * Locales whose content has been human-reviewed. Everything else renders the
 * "unreviewed translation" flag. Phase 5 moves locales out of this list's complement.
 */
export const REVIEWED_LOCALES: readonly Locale[] = ['en', 'hi', 'kn'];

const BY_CODE = new Map(LOCALES.map((l) => [l.code as string, l as LocaleMeta]));

export function localeMeta(code: string): LocaleMeta {
  const meta = BY_CODE.get(code);
  if (!meta) throw new Error(`Unknown locale: ${code}`);
  return meta;
}

export function isReviewedLocale(code: string): boolean {
  return (REVIEWED_LOCALES as readonly string[]).includes(code);
}
