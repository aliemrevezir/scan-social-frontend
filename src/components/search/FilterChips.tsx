const baseClass =
  'inline-flex items-center gap-2 rounded-xl border border-border-light bg-surface-elevated px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary';

export function FilterChips() {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      <button type="button" className={baseClass} aria-label="Filter by date range">
        <span>Date range</span>
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>
      <button type="button" className={baseClass} aria-label="Filter by minimum views">
        <span>Min views</span>
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>
      <button type="button" className={baseClass} aria-label="Filter by hashtag">
        <span>Hashtag contains</span>
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>
    </div>
  );
}
