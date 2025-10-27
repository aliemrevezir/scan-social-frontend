import { formatDistanceToNow } from 'date-fns';

import { type RecentSearchItem } from '@/lib/api/search';

interface LatestSearchesProps {
  items: RecentSearchItem[];
  onSelect: (item: RecentSearchItem) => void;
}

export function LatestSearches({ items, onSelect }: LatestSearchesProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="mb-8 rounded-2xl border border-border-light bg-surface-elevated px-4 py-5 shadow-card">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Latest searches</h2>
      </header>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => {
          const relative = formatDistanceToNow(new Date(item.lastSearchedAt), { addSuffix: true });
          const hasCachedResults = Boolean(item.latestResponse?.items?.length);
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelect(item)}
              disabled={!hasCachedResults}
              className="group inline-flex items-center gap-2 rounded-2xl border border-border-light bg-white px-4 py-2 text-sm font-medium text-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{item.keyword}</span>
              <span className="text-xs font-normal text-text-secondary group-hover:text-primary/80">
                {hasCachedResults ? relative : 'No cached results'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
