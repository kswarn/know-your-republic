import { getFormatter, getTranslations } from 'next-intl/server';

/**
 * The only time signal in the product. This is deliberately not a "published" or
 * "updated" date: records change in place, and what a reader needs to know is when
 * a human or an adapter last confirmed the fact against its official source.
 */
export async function LastVerified({ date }: { date: Date | null }) {
  const t = await getTranslations('record');

  if (!date) {
    return <p className="text-meta text-ink-muted">{t('notVerified')}</p>;
  }

  const format = await getFormatter();

  return (
    <p className="text-meta text-ink-muted flex items-center gap-1.5">
      {/* Green marks a verified state — and only this state — throughout the app. */}
      <span aria-hidden="true" className="bg-success inline-block size-1.5 rounded-full" />
      <time dateTime={date.toISOString()}>
        {t('lastVerified', { date: format.dateTime(date, { dateStyle: 'long' }) })}
      </time>
    </p>
  );
}
