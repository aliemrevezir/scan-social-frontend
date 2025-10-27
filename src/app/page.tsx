import { Header } from '@/components/organisms/Header';
import { FeaturesSection } from '@/components/organisms/FeaturesSection';
import { HowItWorksSection } from '@/components/organisms/HowItWorksSection';
import { TrustedBySection } from '@/components/organisms/TrustedBySection';
import { CTASection } from '@/components/organisms/CTASection';
import { Footer } from '@/components/organisms/Footer';
import { Container } from '@/components/atoms/Container';
import { HeroPanel } from '@/components/molecules/HeroPanel';
import { landingContent } from './(marketing)/landing.content';

export default function Home() {
  const { hero, features, steps, logos, footerColumns, social, finalCta } = landingContent;

  return (
    <>
      <Header ctaPrimaryHref="/signup" ctaSecondaryHref="/login" />
      <main className="main-with-header">
        <section className="hero section">
          <Container>
            <HeroPanel {...hero} />
          </Container>
        </section>
        <FeaturesSection items={features} />
        <HowItWorksSection steps={steps} />
        <TrustedBySection logos={logos} />
        <CTASection {...finalCta} />
      </main>
      <Footer columns={footerColumns} social={social} />
    </>
  );
}
