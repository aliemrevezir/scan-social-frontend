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
    <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center rounded-full border border-border-light bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            TikTok Campaign Intelligence
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-text md:text-5xl" style={{ lineHeight: 'var(--leading-tight)' }}>
            {title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-text-secondary md:text-xl">
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
        <ul className="grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 translate-y-1 rounded-full bg-primary/80" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative isolate overflow-hidden rounded-[32px] border border-border-light bg-white/80 shadow-card">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-primary) 28%, transparent) 0%, transparent 55%), radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, transparent 50%)',
          }}
        />
        <div
          className="relative h-full w-full min-h-[320px] bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(140deg, rgba(238, 244, 255, 0.95), rgba(230, 238, 255, 0.75)), url(${heroImageUrl})`,
          }}
          role="img"
          aria-label="Scan Social dashboard mockup"
        />
      </div>
    </div>
  );
}
