import { Navbar } from '@/components/molecules/Navbar';

interface HeaderProps {
  ctaPrimaryHref: string;
  ctaSecondaryHref: string;
}

export function Header({ ctaPrimaryHref, ctaSecondaryHref }: HeaderProps) {
  return (
    <Navbar
      links={[
        { label: 'Product', href: '#product' },
        { label: 'How it works', href: '#how' },
        { label: 'Solutions', href: '#solutions' },
        { label: 'Resources', href: '#resources' },
      ]}
      ctaSecondary={{ label: 'Login', href: ctaSecondaryHref, variant: 'ghost' }}
      ctaPrimary={{ label: 'Get started', href: ctaPrimaryHref }}
    />
  );
}
