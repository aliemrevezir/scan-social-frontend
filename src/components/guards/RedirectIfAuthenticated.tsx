'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { isAuthenticated } from '@/lib/api';

interface RedirectIfAuthenticatedProps {
  redirectTo?: string;
  children: ReactNode;
}

export function RedirectIfAuthenticated({ redirectTo = '/dashboard', children }: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(redirectTo);
      return;
    }

    setAllowed(true);
  }, [redirectTo, router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
