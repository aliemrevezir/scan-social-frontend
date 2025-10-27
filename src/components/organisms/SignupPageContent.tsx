'use client';

import { useState } from 'react';
import Link from 'next/link';

import { RoleTabs, type RoleValue } from '@/components/molecules/RoleTabs';
import { BrandForm } from '@/components/molecules/BrandForm';
import { InfluencerForm } from '@/components/molecules/InfluencerForm';

export function SignupPageContent() {
  const [role, setRole] = useState<RoleValue>('brand');

  return (
    <main className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-transparent px-4 pb-24 pt-20 sm:px-6 lg:px-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/75 via-white/40 to-transparent blur-3xl" />
      <section className="container-app relative z-10 grid gap-12 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-8">
          <div className="space-y-4 text-left">
            <span className="inline-flex w-fit items-center rounded-full border border-border-light bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Create your workspace
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-text md:text-4xl" style={{ lineHeight: 'var(--leading-tight)' }}>
              Create your Scan Social account
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-text-secondary">
              Choose your role to tailor onboarding and surface the right workflows for your team.
            </p>
          </div>

          <RoleTabs value={role} onChange={setRole} />

          <div
            className="rounded-3xl border border-border-light bg-white/90 p-8 shadow-soft backdrop-blur"
            role="tabpanel"
            id={`signup-${role}`}
            aria-labelledby={`tab-${role}`}
          >
            {role === 'brand' ? <BrandForm /> : <InfluencerForm />}
          </div>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:opacity-80">
              Sign in
            </Link>
          </p>
        </div>

        <aside className="hidden flex-col gap-6 lg:flex">
          <div className="rounded-[32px] border border-border-light bg-white/80 p-8 shadow-soft backdrop-blur">
            <h2 className="text-2xl font-semibold text-text">What you unlock</h2>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  1
                </span>
                <span>Guided onboarding that captures your brand voice, goals, and preferences in minutes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  2
                </span>
                <span>Creator search tuned to your budgets, industries, and campaign objectives.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  3
                </span>
                <span>AI summarised briefs, approvals, and performance reporting — all in one workspace.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-[32px] border border-border-light bg-primary/5 p-8 text-sm text-text-secondary shadow-card">
            <h3 className="text-lg font-semibold text-primary">Need help getting started?</h3>
            <p className="mt-3 leading-relaxed">
              Book a 20 minute walkthrough with our team and we’ll configure your first campaign live.
            </p>
            <a
              href="mailto:hello@scansocial.app"
              className="mt-4 inline-flex items-center gap-1 font-semibold text-primary transition-opacity hover:opacity-80"
            >
              Talk to us →
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
