import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";

/**
 * The one container in the kit. A record summary, optionally the whole thing a link.
 * Essentials first: title, then a single line of context, then provenance in `footer`.
 */
export function Card({
  title,
  context,
  href,
  children,
  footer,
}: {
  title: ReactNode;
  context?: ReactNode;
  href?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const heading = <h3 className="text-heading font-semibold">{title}</h3>;

  return (
    <article className="border-rule bg-paper-raised hover:border-accent/50 border p-5 transition-colors">
      {href ? (
        <Link href={href} className="text-ink hover:text-accent no-underline">
          {heading}
        </Link>
      ) : (
        heading
      )}
      {context && <p className="text-small text-ink-muted mt-1">{context}</p>}
      {children && <div className="text-body mt-3">{children}</div>}
      {footer && <div className="border-rule mt-4 border-t pt-3">{footer}</div>}
    </article>
  );
}
