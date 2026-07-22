import { ExternalLink, TriangleAlert } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export type CitationView = {
  sourceName: string;
  sourceUrl: string;
  isPrimary: boolean;
};

/**
 * The single component every explained fact renders its provenance through.
 *
 * If a fact has no citation it must not be published at all, so this component has
 * no "unsourced" state by design — an empty list is a bug in the publish gate, and
 * it says so rather than rendering a bare, authoritative-looking claim.
 */
export async function SourceLink({ citations }: { citations: CitationView[] }) {
  const t = await getTranslations('record');

  if (citations.length === 0) {
    return (
      <p className="text-meta text-flag inline-flex items-center gap-1.5">
        {/* Should be unreachable: see assertPublishable in src/lib/publish.ts */}
        <TriangleAlert aria-hidden="true" className="size-4" />
        Unsourced — not publishable.
      </p>
    );
  }

  return (
    <div className="text-meta text-ink-muted">
      <span className="me-2">{citations.length === 1 ? t('source') : t('sources')}:</span>
      <ul className="inline list-none p-0">
        {citations.map((c) => (
          <li key={c.sourceUrl} className="inline after:content-['_·_'] last:after:content-none">
            <a
              href={c.sourceUrl}
              className="text-accent inline-flex items-center gap-1 underline underline-offset-2"
              rel="noreferrer nofollow"
              target="_blank"
            >
              {c.sourceName}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
            {!c.isPrimary && <span className="text-ink-muted"> ({t('secondarySource')})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
