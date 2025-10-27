'use client';

import { Button } from '@/components/atoms/Button';
import { Logo } from '@/components/atoms/Logo';
import { Container } from '@/components/atoms/Container';
import { useAuth } from '@/lib/auth-context';

interface NavLink {
  label: string;
  href: string;
}

interface CTA {
  label: string;
  href: string;
  variant?: 'primary' | 'ghost';
  tracking?: {
    event: string;
    payload?: Record<string, unknown>;
  };
}

interface NavbarProps {
  links: NavLink[];
  ctaPrimary: CTA;
  ctaSecondary?: CTA;
}

export function Navbar({ links, ctaPrimary, ctaSecondary }: NavbarProps) {
  const { isAuthenticated } = useAuth();

  const primaryCta = isAuthenticated
    ? { label: 'Dashboard', href: '/dashboard', variant: 'primary' as const }
    : ctaPrimary;

  const secondaryCta = isAuthenticated ? undefined : ctaSecondary;

  return (
    <header className="header">
      <Container className="flex items-center gap-6 py-4">
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-text-secondary md:flex">
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {secondaryCta ? (
            <Button {...secondaryCta} variant={secondaryCta.variant ?? 'ghost'} size="md">
              {secondaryCta.label}
            </Button>
          ) : null}
          <Button {...primaryCta} variant={primaryCta.variant ?? 'primary'} size="md">
            {primaryCta.label}
          </Button>
        </div>
      </Container>
    </header>
  );
}
