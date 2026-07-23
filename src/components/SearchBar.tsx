'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

type SearchBarProps = {
  /** Visible-to-AT label. Never rely on the placeholder alone. */
  label: string;
  placeholder: string;
  /** The locale-prefixed route results render on, e.g. `/${locale}/people`. */
  action: string;
  name?: string;
  defaultValue?: string;
  size?: 'large' | 'compact';
  /**
   * Extra query params to carry through every update, e.g. `{ tab: 'people' }` —
   * so the active tab survives a search rather than resetting to the default.
   */
  hiddenFields?: Record<string, string>;
};

/**
 * Results update as the reader types (debounced, non-blocking) rather than waiting
 * for a submit — the query string is still the source of truth (shareable,
 * bookmarkable, and the page's own server-side filtering is unchanged), so this
 * only changes *when* the URL updates, not the data flow. It stays a real GET
 * form underneath: with JavaScript unavailable, pressing Enter still submits it
 * and produces the same URL a live update would have.
 */
export function SearchBar({
  label,
  placeholder,
  action,
  name = 'q',
  defaultValue = '',
  size = 'large',
  hiddenFields,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [, startTransition] = useTransition();
  const id = `search-${action.replace(/\W+/g, '-')}`;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  function scheduleUpdate(nextValue: string) {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(hiddenFields);
      if (nextValue) params.set(name, nextValue);
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${action}?${query}` : action, { scroll: false });
      });
    }, 300);
  }

  return (
    <form
      action={action}
      role="search"
      className="w-full"
      onSubmit={(e) => e.preventDefault()}
    >
      {hiddenFields &&
        Object.entries(hiddenFields).map(([key, fieldValue]) => (
          <input key={key} type="hidden" name={key} value={fieldValue} />
        ))}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="border-rule bg-paper-raised focus-within:border-ink relative flex items-stretch border transition-colors">
        <Search
          aria-hidden="true"
          className={`text-ink-muted pointer-events-none absolute inset-y-0 my-auto ${
            size === 'large' ? 'inset-s-4 size-4 md:inset-s-5 md:size-5' : 'inset-s-4 size-4'
          }`}
        />
        <input
          id={id}
          type="search"
          name={name}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            scheduleUpdate(e.target.value);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={`text-ink placeholder:text-ink-muted min-w-0 flex-1 bg-transparent outline-none ${
            size === 'large'
              ? 'text-body py-3 pe-4 ps-11 md:text-heading md:py-4 md:pe-5 md:ps-12'
              : 'text-small py-2.5 pe-4 ps-11'
          }`}
        />
      </div>
    </form>
  );
}
