"use client";
import Link from 'next/link';
import Image from 'next/image';

interface EmptyStateProps {
  illustrationUrl?: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
}

export default function EmptyState({ illustrationUrl, title, subtitle, ctaLabel, href }: EmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-surface-elevated rounded-full flex items-center justify-center mb-4">
        {illustrationUrl ? (
          <Image src={illustrationUrl} alt="" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" />
        ) : (
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-text-secondary mb-6">{subtitle}</p>
      <Link href={href} className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm sm:text-base shadow-button inline-block">
        {ctaLabel}
      </Link>
    </div>
  );
}