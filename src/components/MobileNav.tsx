'use client';

import { Menu, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { usePathname } from '@/i18n/navigation';

/**
 * Below `md`, the nav links + language switcher collapse behind a hamburger
 * toggle instead of wrapping onto a second row — the server-rendered links and
 * switcher are passed in as-is (both are already client components themselves;
 * this just controls which layout shows them and when).
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

  // Close the panel on navigation rather than leaving it open over the new page —
  // adjusting state during render (React's recommended pattern for this) rather
  // than in an effect, which would cause an extra render pass.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <div className="hidden items-center gap-x-5 gap-y-2 md:flex">
        {links}
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
          <div className="flex flex-col gap-4">{links}</div>
          {languageSwitcher}
        </div>
      )}
    </>
  );
}
