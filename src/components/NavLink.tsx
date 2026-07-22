"use client";

import type { ReactNode } from "react";

import { Link, usePathname } from "@/i18n/navigation";

/**
 * A top-nav link that marks itself active against the current, locale-stripped
 * pathname — so /people and any future /people/[id] detail route both highlight
 * "People". Client-only because active state depends on the current URL, which
 * a server-rendered header has no reason to know otherwise.
 */
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "text-brand decoration-brand text-small font-medium underline underline-offset-4"
          : "text-ink-muted hover:text-gray-400 text-small no-underline"
      }
    >
      {children}
    </Link>
  );
}
