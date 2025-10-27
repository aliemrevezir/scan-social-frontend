'use client';

import { useState } from 'react';
import Link from 'next/link';

import { RoleTabs, type RoleValue } from '@/components/molecules/RoleTabs';
import { BrandForm } from '@/components/molecules/BrandForm';
import { InfluencerForm } from '@/components/molecules/InfluencerForm';

export function SignupPageContent() {
  const [role, setRole] = useState<RoleValue>('brand');

  return (
    <div className="signup-shell">
      <h1 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        Create your Scan Social account
      </h1>
      <p className="mt-2 text-center helper">Choose your role to tailor the experience.</p>

      <RoleTabs value={role} onChange={setRole} />

      <div
        className="form-card mt-6"
        role="tabpanel"
        id={`signup-${role}`}
        aria-labelledby={`tab-${role}`}
      >
        {role === 'brand' ? <BrandForm /> : <InfluencerForm />}
      </div>

      <p className="mt-6 text-center helper">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[color:var(--color-primary)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
