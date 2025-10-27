import type { ReactNode } from 'react';

import { Container } from '@/components/atoms/Container';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { FeatureCard } from '@/components/molecules/FeatureCard';

interface FeatureItem {
  title: string;
  description: string;
  icon: ReactNode;
}

interface FeaturesSectionProps {
  items: FeatureItem[];
}

export function FeaturesSection({ items }: FeaturesSectionProps) {
  return (
    <section id="product" className="section">
      <Container>
        <SectionTitle
          eyebrow="Why Scan Social"
          title="Everything you need to brief, launch, and learn from creator campaigns"
          description="From the first search query to post-campaign analytics, Scan Social gives marketing teams a single control center for working with every creator."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
