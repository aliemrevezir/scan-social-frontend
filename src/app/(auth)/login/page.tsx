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
      <main className="relative min-h-[calc(100vh-64px)] bg-[color:var(--color-primary-subtle)]/40 px-4 pb-24 pt-16 dark:bg-[#0f1d18]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/70 via-white/40 to-transparent blur-3xl dark:from-[#143928]/50 dark:via-transparent" />
        <section className="login-shell relative z-10">
          <div className="login-layout">
            <div className="space-y-10">
              <div className="text-left sm:text-center lg:text-left">
                <span className="badge green mb-4 inline-flex w-fit">
                  Secure access
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  Welcome back
                </h1>
                <p className="mt-3 login-subtle">
                  Sign in to manage campaigns, approve submissions, and keep your creator pipeline moving forward.
                </p>
              </div>
              <LoginCard />
            </div>
            <aside className="login-aside">
              <div className="login-aside-card">
                <h2>Why teams rely on Scan Social</h2>
                <ul>
                  <li>
                    <span className="icon">✓</span>
                    <span>Approve creator submissions with transcript-level insights in minutes.</span>
                  </li>
                  <li>
                    <span className="icon">✓</span>
                    <span>Track campaign health with live KPIs and automated status alerts.</span>
                  </li>
                  <li>
                    <span className="icon">✓</span>
                    <span>Centralise briefs, feedback, and approvals so your team stays aligned.</span>
                  </li>
                </ul>
              </div>
              <div className="login-aside-footer">
                <span className="font-semibold text-[color:var(--color-primary)]">New to Scan Social?</span>
                <span>
                  Create your workspace in a few steps and invite collaborators instantly.
                </span>
                <a
                  href="/signup"
                  className="font-semibold text-[color:var(--color-primary)] hover:opacity-80"
                >
                  Create your account in 1 minute →
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>
      </RedirectIfAuthenticated>
    </>
  );
}
