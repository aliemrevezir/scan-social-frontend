import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="card flex h-full flex-col gap-4 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </h3>
        <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      </div>
    </article>
  );
}
