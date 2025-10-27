'use client';

import Link from 'next/link';
import { useCallback, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

import { track } from '@/lib/analytics';

const variantClassMap: Record<'primary' | 'ghost', string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
};

const sizeClassMap: Record<'md' | 'lg', string> = {
  md: 'min-h-[2.75rem] px-6',
  lg: 'min-h-[3.125rem] px-7 text-base sm:min-h-[3.25rem] sm:px-8',
};

interface TrackingConfig {
  event: string;
  payload?: Record<string, unknown>;
}

interface BaseProps {
  variant?: 'primary' | 'ghost';
  size?: 'md' | 'lg';
  className?: string;
  tracking?: TrackingConfig;
  loading?: boolean;
  fullWidth?: boolean;
}

interface AnchorProps extends BaseProps {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface ButtonProps extends BaseProps, ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never;
}

type Props = AnchorProps | ButtonProps;

function getClasses({ variant, size, className, fullWidth }: BaseProps) {
  return clsx(
    'btn',
    variantClassMap[variant ?? 'primary'],
    sizeClassMap[size ?? 'md'],
    fullWidth && 'w-full justify-center',
    className,
  );
}

function LoadingSpinner({ variant }: { variant: 'primary' | 'ghost' }) {
  // Use the new button text color for the spinner
  const borderColor = variant === 'ghost' ? 'border-[color:var(--color-primary)]/40 border-t-[color:var(--color-primary)]/80' : 'border-[color:var(--color-primary)]/60 border-t-[color:var(--color-primary)]';
  return (
    <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${borderColor}`} />
  );
}

export function Button(props: Props) {
  const { variant = 'primary', size = 'md', className, tracking, loading = false, fullWidth } = props;
  const classes = getClasses({ variant, size, className, fullWidth });

  const handleTrack = useCallback(() => {
    if (!tracking) return;
    track(tracking.event, tracking.payload);
  }, [tracking]);

  if ('href' in props) {
    const { href, children, prefetch = true, onClick, ...rest } = props as AnchorProps & BaseProps;
    const safeRest = { ...(rest as Record<string, unknown>) };
    delete safeRest.variant;
    delete safeRest.size;
    delete safeRest.className;
    delete safeRest.tracking;
    delete safeRest.loading;
    delete safeRest.fullWidth;

    const ariaDisabled = loading || (safeRest as { 'aria-disabled'?: boolean })['aria-disabled'];

    return (
      <Link
        href={href}
        prefetch={prefetch}
        className={classes}
        onClick={(event) => {
          handleTrack();
          onClick?.(event);
        }}
        aria-disabled={ariaDisabled}
        {...safeRest}
      >
        {loading ? <LoadingSpinner variant={variant} /> : children}
      </Link>
    );
  }

  const { children, type = 'button', onClick, disabled, ...rest } = props as ButtonProps & BaseProps;
  const safeRest = { ...(rest as Record<string, unknown>) };
  delete safeRest.variant;
  delete safeRest.size;
  delete safeRest.className;
  delete safeRest.tracking;
  delete safeRest.loading;
  delete safeRest.fullWidth;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      onClick={(event) => {
        handleTrack();
        onClick?.(event);
      }}
      {...safeRest}
    >
      {loading ? <LoadingSpinner variant={variant} /> : children}
    </button>
  );
}
