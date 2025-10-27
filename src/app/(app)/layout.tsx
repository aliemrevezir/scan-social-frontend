import type { Metadata } from 'next';
import { AppHeader } from '@/components/header/AppHeader';

export const metadata: Metadata = {
  title: {
    default: 'App',
    template: '%s | Scan Social',
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}