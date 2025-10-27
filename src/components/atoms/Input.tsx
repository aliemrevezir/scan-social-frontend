'use client';

import { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** internal flag used by FormField to add top padding for inside label */
  'data-inside-label'?: string | boolean;
  /** compact = 44px, default = 48–52px */
  size?: 'compact' | 'default';
  /** optional trailing node rendered on the right inside the field */
  trailing?: ReactNode;
  /** optional class applied to the outer wrapper */
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    type = 'text',
    size = 'default',
    'data-inside-label': inside,
    trailing,
    wrapperClassName,
    ...props
  },
  ref,
) {
  const base =
    'w-full rounded-2xl border border-[color:var(--color-border)] bg-white text-[15px] text-[color:var(--color-text)] ' +
    'placeholder:text-[color:var(--color-muted-light)] px-4 shadow-[0_1px_2px_rgba(15,23,42,.08)] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]/15 ' +
    'focus-visible:border-[color:var(--color-primary)] transition-colors';

  const h = size === 'compact' ? 'h-11 md:h-11' : 'h-12 md:h-[52px]';
  const topPad = inside ? 'pt-6' : '';
  const trailingPadding = trailing ? 'pr-12' : '';

  return (
    <div className={clsx('relative', wrapperClassName)}>
      <input
        ref={ref}
        type={type}
        className={clsx(base, h, topPad, trailingPadding, className)}
        data-inside-label={inside ? 'true' : undefined}
        {...props}
      />
      {trailing ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="pointer-events-auto flex items-center">{trailing}</div>
        </div>
      ) : null}
    </div>
  );
});
