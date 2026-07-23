import Image from "next/image";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";

/**
 * The one container in the kit. A record summary, optionally the whole thing a link.
 * Essentials first: photo (when there is one) and title, then a single line of
 * context, then provenance in `footer`.
 */
export function Card({
  title,
  photoUrl,
  context,
  href,
  children,
  footer,
}: {
  title: ReactNode;
  /** A person's photo — omitted entirely for records that don't have one (Rights, Laws). */
  photoUrl?: string | null;
  context?: ReactNode;
  href?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const heading = <h3 className="text-heading font-semibold">{title}</h3>;

  const titleBlock = (
    <div className="flex items-center gap-3">
      {photoUrl && (
        <Image
          src={photoUrl}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-full object-cover"
        />
      )}
      <div className="min-w-0">
        {href ? (
          <Link href={href} className="text-ink hover:text-accent no-underline">
            {heading}
          </Link>
        ) : (
          heading
        )}
        {context && <p className="text-small text-ink-muted mt-1">{context}</p>}
      </div>
    </div>
  );

  return (
    <article className="border-rule bg-paper-raised hover:border-accent/50 border p-5 transition-colors">
      {titleBlock}
      {children && <div className="text-body mt-3">{children}</div>}
      {footer && <div className="border-rule mt-4 border-t pt-3">{footer}</div>}
    </article>
  );
}
