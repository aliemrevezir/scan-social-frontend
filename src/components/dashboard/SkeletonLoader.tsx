import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton component for loading states
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for KPI stat cards
 */
export function KpiStatSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card border border-border-light animate-pulse">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-elevated rounded-lg flex-shrink-0"></div>
        <div className="min-w-0 flex-1">
          <div className="h-3 sm:h-4 bg-surface-elevated rounded w-20 sm:w-24 mb-2"></div>
          <div className="h-6 sm:h-8 bg-surface-elevated rounded w-16 sm:w-20 mb-1"></div>
          <div className="h-3 bg-surface-elevated rounded w-12 sm:w-16"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for performance chart card
 */
export function PerformanceCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card border border-border-light animate-pulse">
      <div className="h-4 sm:h-5 bg-surface-elevated rounded w-32 sm:w-40 mb-4"></div>
      <div className="h-48 sm:h-64 bg-surface-elevated rounded-lg"></div>
    </div>
  );
}

/**
 * Skeleton for campaign list item
 */
export function CampaignItemSkeleton() {
  return (
    <div className="flex items-center p-3 sm:p-4 bg-surface-elevated rounded-lg animate-pulse">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-border-light rounded-lg flex-shrink-0 mr-3 sm:mr-4"></div>
      <div className="min-w-0 flex-1">
        <div className="h-4 bg-border-light rounded w-32 sm:w-40 mb-2"></div>
        <div className="h-3 bg-border-light rounded w-16 sm:w-20 mb-1"></div>
        <div className="h-3 bg-border-light rounded w-24 sm:w-32"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton for campaign list
 */
export function CampaignListSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card border border-border-light">
      <div className="h-4 sm:h-5 bg-surface-elevated rounded w-32 sm:w-40 mb-3 sm:mb-4"></div>
      <div className="grid gap-3 sm:gap-4">
        {[...Array(3)].map((_, i) => (
          <CampaignItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Complete dashboard skeleton for loading state
 */
export function DashboardSkeleton() {
  return (
    <div className="container-app py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          <div className="h-6 sm:h-8 bg-surface-elevated rounded w-32 sm:w-48 animate-pulse"></div>
          <div className="h-4 bg-surface-elevated rounded w-48 sm:w-64 animate-pulse"></div>
        </div>
        <div className="h-9 sm:h-10 bg-surface-elevated rounded w-32 sm:w-40 animate-pulse"></div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <KpiStatSkeleton key={i} />
        ))}
      </div>

      {/* Performance and Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <PerformanceCardSkeleton />
        <CampaignListSkeleton />
      </div>
    </div>
  );
}