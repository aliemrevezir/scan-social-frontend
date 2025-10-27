'use client';

import { forwardRef, useId } from 'react';
import clsx from 'clsx';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, description, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={clsx('flex items-start gap-3', className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border border-[color:var(--color-border)] text-[color:var(--color-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)]"
        {...props}
      />
      <div className="space-y-1 text-sm">
        {label ? (
          <label htmlFor={inputId} className="font-medium text-slate-700 dark:text-slate-200">
            {label}
          </label>
        ) : null}
        {description ? <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
    </div>
  );
});
