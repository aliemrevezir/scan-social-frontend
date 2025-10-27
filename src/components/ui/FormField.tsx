import type { ReactNode } from 'react';

import { Label } from '@/components/atoms/Label';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  helperText?: string;
  error?: string;
}

export function FormField({ label, htmlFor, children, helperText, error }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {helperText ? <p className="helper">{helperText}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
