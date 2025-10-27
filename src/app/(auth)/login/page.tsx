import type { Metadata } from 'next';

import { SignupHeader } from '@/components/molecules/SignupHeader';
import { LoginCard } from '@/components/molecules/LoginCard';
import { RedirectIfAuthenticated } from '@/components/guards/RedirectIfAuthenticated';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Access your Scan Social workspace to manage campaigns and creator collaborations.',
};

export default function LoginPage() {
  return (
    <>
      <SignupHeader />
      <RedirectIfAuthenticated>
        <main className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-transparent px-4 pb-24 pt-20 sm:px-6 lg:px-0">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/75 via-white/40 to-transparent blur-3xl" />
          <section className="container-app relative z-10 grid gap-12 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:items-start">
            <div className="flex flex-col gap-10">
              <div className="max-w-xl space-y-4 text-left lg:text-left">
                <span className="inline-flex w-fit items-center rounded-full border border-border-light bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Secure access
                </span>
                <h1 className="text-3xl font-semibold tracking-tight text-text md:text-4xl" style={{ lineHeight: 'var(--leading-tight)' }}>
                  Welcome back
                </h1>
                <p className="text-base leading-relaxed text-text-secondary">
                  Sign in to manage campaigns, approve submissions, and keep your creator pipeline moving forward with clarity.
                </p>
              </div>
              <LoginCard />
            </div>
            <aside className="hidden rounded-[32px] border border-border-light bg-white/80 p-8 shadow-soft backdrop-blur lg:flex lg:flex-col lg:gap-8">
              <div className="login-aside-card">
                <h2 className="text-2xl font-semibold text-text">Why teams rely on Scan Social</h2>
                <ul className="mt-6 space-y-4 text-sm leading-relaxed text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="icon mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      ✓
                    </span>
                    <span>Approve creator submissions with transcript-level insights in minutes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      ✓
                    </span>
                    <span>Track campaign health with live KPIs and automated status alerts.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      ✓
                    </span>
                    <span>Centralise briefs, feedback, and approvals so your team stays aligned.</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-border-light bg-primary/5 p-6 text-sm text-text-secondary shadow-card">
                <span className="block font-semibold text-primary">New to Scan Social?</span>
                <span className="mt-3 block">
                  Create your workspace in a few steps and invite collaborators instantly.
                </span>
                <a
                  href="/signup"
                  className="mt-4 inline-flex items-center gap-1 font-semibold text-primary transition-opacity hover:opacity-80"
                >
                  Create your account in 1 minute →
                </a>
              </div>
            </aside>
          </section>
        </main>
      </RedirectIfAuthenticated>
    </>
  );
}
