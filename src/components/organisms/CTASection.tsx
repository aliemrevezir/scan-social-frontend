import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';

interface CTASectionProps {
  title: string;
  text: string;
  cta: {
    label: string;
    href: string;
    tracking?: {
      event: string;
      payload?: Record<string, unknown>;
    };
  };
}

export function CTASection({ title, text, cta }: CTASectionProps) {
  return (
    <section id="resources" className="section section-dark">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl" style={{ lineHeight: 'var(--leading-tight)' }}>
          {title}
        </h2>
        <p className="max-w-2xl text-base text-slate-200 sm:text-lg">{text}</p>
        <Button href={cta.href} variant="primary" tracking={cta.tracking} size="lg">
          {cta.label}
        </Button>
      </Container>
    </section>
  );
}
