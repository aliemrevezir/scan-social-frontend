import { Container } from '@/components/atoms/Container';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { BrandTile } from '@/components/molecules/BrandTile';

interface Brand {
  name: string;
  logoUrl: string;
}

interface TrustedBySectionProps {
  logos: Brand[];
}

export function TrustedBySection({ logos }: TrustedBySectionProps) {
  return (
    <section id="solutions" className="section">
      <Container>
        <SectionTitle
          eyebrow="Trusted by marketers"
          title="Funnel clarity for growth, brand, and creator teams"
          description="Scan Social powers modern social squads — from lean startups testing TikTok awareness to global brands scaling community-driven programs across every network."
          alignment="center"
        />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {logos.map((logo) => (
            <BrandTile key={logo.name} {...logo} />
          ))}
        </div>
      </Container>
    </section>
  );
}
