import { Container } from '@/components/atoms/Container';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { StepCard } from '@/components/molecules/StepCard';

interface StepItem {
  stepNumber: number;
  title: string;
  text: string;
  imageUrl: string;
}

interface HowItWorksSectionProps {
  steps: StepItem[];
}

export function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  return (
    <section id="how" className="section section-muted">
      <Container>
        <SectionTitle
          eyebrow="How it works"
          title="Plan, validate, and launch creator campaigns without guesswork"
          description="Follow a repeatable, insight-led workflow that moves from discovery to approval while your team stays aligned on every deliverable."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.stepNumber} className="relative group">
              <div className="absolute -top-4 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] font-semibold text-[#0f1a16] shadow-soft">
                {step.stepNumber}
              </div>
              <StepCard title={step.title} text={step.text} imageUrl={step.imageUrl} className="pt-12" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
