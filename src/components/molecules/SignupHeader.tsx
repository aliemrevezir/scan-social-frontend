import Link from 'next/link';

import { Button } from '@/components/atoms/Button';
import { Logo } from '@/components/atoms/Logo';

export function SignupHeader() {
  return (
    <header className="header">
      <div className="container-app flex items-center gap-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-text-secondary md:flex">
          <Link href="/#product" className="transition-colors hover:text-primary">
            Product
          </Link>
          <Link href="/#how" className="transition-colors hover:text-primary">
            How it works
          </Link>
          <Link href="/#solutions" className="transition-colors hover:text-primary">
            Solutions
          </Link>
          <Link href="/#resources" className="transition-colors hover:text-primary">
            Resources
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Button href="/login" variant="ghost" size="md">
            Log in
          </Button>
          <Button href="/signup" variant="primary" size="md">
            Create account
          </Button>
        </div>
      </div>
    </header>
  );
}
