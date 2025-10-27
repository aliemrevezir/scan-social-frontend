import { Button } from '@/components/atoms/Button';

interface CTA {
  label: string;
  href: string;
  variant?: 'primary' | 'ghost';
  tracking?: {
    event: string;
    payload?: Record<string, unknown>;
  };
}

export interface HeroPanelProps {
  title: string;
  subtitle: string;
  heroImageUrl: string;
  primaryCta: CTA;
  secondaryCta: CTA;
  highlights: string[];
}

export function HeroPanel({
  title,
  subtitle,
  heroImageUrl,
  primaryCta,
  secondaryCta,
  highlights,
}: HeroPanelProps) {
  return (
    <div className="hero-grid">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5">
          <span className="badge green w-fit">TikTok Campaign Intelligence</span>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl" style={{ lineHeight: 'var(--leading-tight)', color: 'var(--color-text)' }}>
            {title}
          </h1>
          <p className="text-lg md:text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button {...primaryCta} variant={primaryCta.variant ?? 'primary'} size="lg">
            {primaryCta.label}
          </Button>
          <Button {...secondaryCta} variant={secondaryCta.variant ?? 'ghost'} size="lg">
            {secondaryCta.label}
          </Button>
        </div>
        <ul className="grid gap-3 text-sm sm:grid-cols-2" style={{ color: 'var(--color-text-secondary)' }}>
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 translate-y-1 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="hero-visual"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(20, 121, 81, 0.25), rgba(109, 213, 222, 0.25)), url(${heroImageUrl})`,
        }}
        role="img"
        aria-label="Scan Social dashboard mockup"
      />
    </div>
  );
}
