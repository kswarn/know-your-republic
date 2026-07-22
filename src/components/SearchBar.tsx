'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

type SearchBarProps = {
  /** Visible-to-AT label. Never rely on the placeholder alone. */
  label: string;
  placeholder: string;
  /** Route the GET form submits to, e.g. "/people". */
  action: string;
  name?: string;
  defaultValue?: string;
  size?: 'large' | 'compact';
};

/**
 * A plain GET form. Deliberately not a controlled, JS-driven combobox: search must
 * work with JavaScript unavailable or still loading, produce a shareable URL, and
 * stay usable on a slow connection.
 */
export function SearchBar({
  label,
  placeholder,
  action,
  name = 'q',
  defaultValue,
  size = 'large',
}: SearchBarProps) {
  const t = useTranslations('search');
  const id = `search-${action.replace(/\W+/g, '-')}`;

  return (
    <form action={action} role="search" className="w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="border-rule bg-paper-raised focus-within:border-accent flex items-stretch border transition-colors">
        <input
          id={id}
          type="search"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete="off"
          className={`text-ink placeholder:text-ink-muted min-w-0 flex-1 bg-transparent outline-none ${
            size === 'large' ? 'text-heading px-5 py-4' : 'text-body px-4 py-3'
          }`}
        />
        <button
          type="submit"
          className={`text-accent hover:bg-accent-soft border-rule border-s flex items-center gap-2 font-semibold whitespace-nowrap transition-colors ${
            size === 'large' ? 'px-6' : 'px-4'
          }`}
        >
          <Search aria-hidden="true" className="size-4" />
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
