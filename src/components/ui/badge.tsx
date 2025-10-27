import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-white shadow',
        secondary: 'border-transparent bg-gray-100 text-gray-900',
        accent: 'border-transparent bg-accent text-white shadow',
        success: 'border-transparent bg-primary text-white',
        warning: 'border-transparent bg-yellow-100 text-yellow-800',
        error: 'border-transparent bg-red-100 text-red-800',
        outline: 'text-foreground border-gray-300',
        // Campaign status badges
        draft: 'border-transparent bg-gray-200 text-gray-700',
        published: 'border-transparent bg-primary text-white',
        closed: 'border-transparent bg-gray-600 text-white',
        completed: 'border-transparent bg-primary-700 text-white',
        // Application status badges
        pending: 'border-transparent bg-gray-200 text-gray-700',
        approved: 'border-transparent bg-primary text-white',
        rejected: 'border-transparent bg-red-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
