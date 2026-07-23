'use client';

import { Menu, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { usePathname } from '@/i18n/navigation';

/**
 * Below `md`, the nav links collapse behind a hamburger toggle instead of
 * wrapping onto a second row — the server-rendered links are passed in as-is.
 * The language switcher is rendered exactly once, always visible (not
 * duplicated between a desktop row and a mobile panel) — two elements both
 * carrying the switcher's `id="language-switcher"` would be invalid HTML, and
 * on some mobile browsers can make label/focus association pick the wrong
 * (hidden) instance.
 *
 * On the home page, the nav links are skipped entirely: they're the exact
 * same five sections already shown as cards in the page body, so repeating
 * them here would just be a second, redundant way to reach the same thing.
 */
export function MobileNav({
  links,
  languageSwitcher,
  menuLabel,
  closeLabel,
}: {
  links: ReactNode;
  languageSwitcher: ReactNode;
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Close the panel on navigation rather than leaving it open over the new page —
  // adjusting state during render (React's recommended pattern for this) rather
  // than in an effect, which would cause an extra render pass.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  if (isHome) {
    return <div className="flex items-center">{languageSwitcher}</div>;
  }

  return (
    <>
      <div className="flex items-center gap-x-5">
        <div className="hidden items-center gap-x-5 md:flex">{links}</div>
        {languageSwitcher}
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="border-rule bg-paper-raised inline-flex size-10 shrink-0 items-center justify-center rounded-full border md:hidden"
      >
        {open ? (
          <X aria-hidden="true" className="text-ink size-5" />
        ) : (
          <Menu aria-hidden="true" className="text-ink size-5" />
        )}
        <span className="sr-only">{open ? closeLabel : menuLabel}</span>
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="border-rule bg-paper absolute inset-x-0 top-full z-20 flex flex-col gap-4 border-t p-4 md:hidden"
        >
          {links}
        </div>
      )}
    </>
  );
}
