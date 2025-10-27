import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white shadow hover:bg-primary-600 active:bg-primary-700',
        secondary:
          'bg-white text-primary border-2 border-primary hover:bg-primary-50',
        accent: 'bg-accent text-white shadow hover:bg-accent-600',
        outline:
          'border border-gray-300 bg-transparent hover:bg-gray-50 hover:text-primary',
        ghost: 'hover:bg-gray-100 hover:text-primary',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
        tiktok: 'bg-gradient-to-r from-[#ff0050] to-[#ff4081] text-white shadow-lg hover:from-[#e6004a] hover:to-[#e6396f] hover:shadow-xl focus-visible:ring-[#ff0050] transition-transform duration-200 hover:scale-[1.02]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
