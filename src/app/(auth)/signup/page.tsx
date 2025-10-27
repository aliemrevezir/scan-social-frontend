import type { Metadata } from 'next';

import { SignupHeader } from '@/components/molecules/SignupHeader';
import { SignupPageContent } from '@/components/organisms/SignupPageContent';
import { RedirectIfAuthenticated } from '@/components/guards/RedirectIfAuthenticated';

export const metadata: Metadata = {
  title: 'Sign up | Scan Social',
  description: 'Create your Scan Social account to collaborate on TikTok campaigns with AI-powered insights.',
};

export default function SignupPage() {
  return (
    <>
      <SignupHeader />
      <RedirectIfAuthenticated>
        <SignupPageContent />
      </RedirectIfAuthenticated>
    </>
  );
}
