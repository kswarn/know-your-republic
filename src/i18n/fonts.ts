import {
  Noto_Nastaliq_Urdu,
  Noto_Sans,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Meetei_Mayek,
  Noto_Sans_Ol_Chiki,
  Noto_Sans_Oriya,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from 'next/font/google';

import type { Script } from './locales';

/**
 * One font per script, exposed through a single `--font-script` variable.
 *
 * Only the active locale's class reaches <html>, so a Kannada reader downloads the
 * Kannada face and nothing else. Shipping all thirteen Indic faces to every visitor
 * would cost several megabytes — unacceptable on the low-end Android devices most of
 * this audience uses. `preload` is therefore off for every script but Latin, which
 * every page needs for numerals, source URLs, and the language switcher.
 *
 * next/font's calls are statically analyzed at build time, so each one needs a
 * literal options object — no shared variable can be spread into it.
 */

const latin = Noto_Sans({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['latin'],
  preload: true,
});
const devanagari = Noto_Sans_Devanagari({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['devanagari'],
  preload: false,
});
const bengali = Noto_Sans_Bengali({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['bengali'],
  preload: false,
});
const gujarati = Noto_Sans_Gujarati({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['gujarati'],
  preload: false,
});
const gurmukhi = Noto_Sans_Gurmukhi({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['gurmukhi'],
  preload: false,
});
const kannada = Noto_Sans_Kannada({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['kannada'],
  preload: false,
});
const malayalam = Noto_Sans_Malayalam({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['malayalam'],
  preload: false,
});
const odia = Noto_Sans_Oriya({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['oriya'],
  preload: false,
});
const tamil = Noto_Sans_Tamil({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['tamil'],
  preload: false,
});
const telugu = Noto_Sans_Telugu({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['telugu'],
  preload: false,
});
const meeteiMayek = Noto_Sans_Meetei_Mayek({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['meetei-mayek'],
  preload: false,
});
const olChiki = Noto_Sans_Ol_Chiki({
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '600'],
  subsets: ['ol-chiki'],
  preload: false,
});

// Nastaliq is a display-weight-only family; it ships a single weight.
const arabic = Noto_Nastaliq_Urdu({
  variable: '--font-script',
  display: 'swap',
  subsets: ['arabic'],
  preload: false,
});

const BY_SCRIPT: Record<Script, { variable: string; className: string }> = {
  latin,
  devanagari,
  bengali,
  gujarati,
  gurmukhi,
  kannada,
  malayalam,
  odia,
  tamil,
  telugu,
  arabic,
  'meetei-mayek': meeteiMayek,
  'ol-chiki': olChiki,
};

/**
 * The class to put on <html> for a given script. Latin is always included so that
 * Latin-script text inside an Indic page (URLs, Act numbers, dates) renders in a
 * matching face rather than falling through to a system default.
 */
export function fontClassForScript(script: Script): string {
  const font = BY_SCRIPT[script];
  return script === 'latin' ? latin.variable : `${font.variable} ${latin.className}`;
}
