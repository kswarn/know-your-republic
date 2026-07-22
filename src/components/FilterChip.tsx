import { Link } from '@/i18n/navigation';

/**
 * A filter is a link, not a button: it changes the URL, so the filtered view is
 * shareable, bookmarkable, and works without JavaScript. `aria-pressed` is wrong
 * for a link, so selection is conveyed with `aria-current` instead.
 */
export function FilterChip({
  label,
  href,
  selected = false,
}: {
  label: string;
  href: string;
  selected?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={selected ? 'true' : undefined}
      className={`text-small inline-block border px-3 py-1.5 no-underline transition-colors ${
        selected
          ? 'border-accent bg-accent-soft text-accent font-semibold'
          : 'border-rule text-ink-muted hover:border-accent hover:text-accent'
      }`}
    >
      {label}
    </Link>
  );
}
