import type { ReactNode } from 'react';

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  alignment?: 'left' | 'center';
  actions?: ReactNode;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  alignment = 'left',
  actions,
}: SectionTitleProps) {
  return (
    <div
      className={`flex flex-col gap-4 ${
        alignment === 'center' ? 'items-center text-center' : 'items-start text-left'
      }`}
    >
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
          {eyebrow}
        </span>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ lineHeight: 'var(--leading-tight)' }}>
            {title}
          </h2>
          {description ? (
            <p className="text-base sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
    </div>
  );
}
