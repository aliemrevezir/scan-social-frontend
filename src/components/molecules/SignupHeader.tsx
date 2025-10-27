import Link from 'next/link';

import { Button } from '@/components/atoms/Button';
import { Logo } from '@/components/atoms/Logo';

export function SignupHeader() {
  return (
    <header className="header">
      <div className="container-app navbar">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted sm:flex">
          <Link href="/#product">Product</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#solutions">Solutions</Link>
          <Link href="/#resources">Resources</Link>
          <Link href="/#pricing">Pricing</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Button href="/signup" variant="ghost" size="md">
            Sign up
          </Button>
        </div>
      </div>
    </header>
  );
}
