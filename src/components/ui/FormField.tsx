import clsx from 'clsx';
import {
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Label } from '@/components/atoms/Label';

type Variant = 'default' | 'inside';

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  htmlFor: string;
  children: ReactNode;
  helperText?: string;
  error?: string;
  infoText?: string;
  variant?: Variant;
}

export function FormField({
  label,
  htmlFor,
  children,
  helperText,
  error,
  infoText,
  className,
  variant = 'default',
  ...rest
}: FormFieldProps) {
  if (variant === 'inside') {
    const control = isValidElement(children)
      ? cloneElement(children as ReactElement, { 'data-inside-label': true })
      : children;

    return (
      <div className={clsx('relative flex flex-col', className)} {...rest}>
        {control}
        <Label
          htmlFor={htmlFor}
          className="pointer-events-none absolute left-4 top-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]"
        >
          {label}
        </Label>
        {infoText ? <InfoIcon text={infoText} className="absolute right-4 top-2" /> : null}
        {helperText ? <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">{helperText}</p> : null}
        {error ? <p className="mt-2 text-sm font-medium text-[color:var(--color-error)]">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col gap-2', className)} {...rest}>
      <div className="flex items-center gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {infoText ? <InfoIcon text={infoText} /> : null}
      </div>
      {children}
      {helperText ? <p className="text-sm text-[color:var(--color-text-muted)]">{helperText}</p> : null}
      {error ? <p className="text-sm font-medium text-[color:var(--color-error)]">{error}</p> : null}
    </div>
  );
}

interface InfoIconProps {
  text: string;
  className?: string;
}

function InfoIcon({ text, className }: InfoIconProps) {
  return (
    <div className={clsx('group relative inline-flex', className)}>
      <button
        type="button"
        className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/30"
        aria-label="Field information"
      >
        <span className="material-symbols-outlined text-[16px] leading-none">info</span>
      </button>
      <div className="pointer-events-none absolute left-1/2 top-full z-50 hidden w-64 -translate-x-1/2 translate-y-2 rounded-2xl border border-[color:var(--color-border)] bg-white px-3 py-2 text-left text-xs text-[color:var(--color-text-secondary)] shadow-dropdown group-hover:flex group-focus-within:flex">
        {text}
      </div>
    </div>
  );
}
