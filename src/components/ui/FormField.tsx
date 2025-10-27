import clsx from 'clsx';
import type { ReactNode } from 'react';

import { Label } from '@/components/atoms/Label';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  helperText?: string;
  error?: string;
  className?: string;
}

export function FormField({ label, htmlFor, children, helperText, error, className }: FormFieldProps) {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {helperText ? <p className="text-sm text-text-muted">{helperText}</p> : null}
      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
    </div>
  );
}
