'use client';

import { Volume2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Phase 0 stub. The real implementation (Phase 4) reads the page's main region via
 * the Web Speech API, with a cloud fallback for the locales no browser voice covers.
 *
 * It renders nothing until then rather than shipping a control that does not work —
 * a dead button is worse for a screen-reader user than no button.
 */
export function TTSButton({ enabled = false }: { enabled?: boolean }) {
  const t = useTranslations('tts');

  if (!enabled) return null;

  return (
    <button
      type="button"
      className="text-accent hover:bg-accent-soft text-small inline-flex items-center gap-1.5 border border-transparent px-2 py-1"
    >
      <Volume2 aria-hidden="true" className="size-4" />
      {t('listen')}
    </button>
  );
}
