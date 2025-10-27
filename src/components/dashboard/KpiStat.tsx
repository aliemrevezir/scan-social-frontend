import type { ReactNode } from 'react';

export function KpiStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div 
      className="bg-surface rounded-lg p-4 sm:p-6 shadow-card border border-border-light focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-all duration-200"
      role="region"
      aria-labelledby={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-lg bg-primary-subtle flex-shrink-0" aria-hidden="true">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p 
            id={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-xs sm:text-sm text-text-secondary truncate"
          >
            {label}
          </p>
          <p 
            className="text-lg sm:text-2xl font-bold text-text truncate"
            aria-label={`${label}: ${value}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}