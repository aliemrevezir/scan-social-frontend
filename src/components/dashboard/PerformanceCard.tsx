import type { ReactNode } from 'react';

interface PerformanceCardProps {
  children?: ReactNode;
}

export default function PerformanceCard({ children }: PerformanceCardProps) {
  return (
    <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card border border-border-light">
      <h3 className="text-base sm:text-lg font-semibold text-text mb-4">Performance Overview</h3>
      <div className="h-48 sm:h-64 bg-surface-elevated rounded-lg flex items-center justify-center overflow-hidden">
        {children || <p className="text-text-muted">Chart placeholder</p>}
      </div>
    </div>
  );
}