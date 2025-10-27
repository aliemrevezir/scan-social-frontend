'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { LoginSchema, type LoginInput } from '@/lib/validators/login';
import { devDefaults, loginBrand, loginInfluencer } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export function LoginCard() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const defaults = useMemo(() => devDefaults(), []);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isInfluencer = (params.get('role') || '').toLowerCase() === 'influencer';
  const redirectMessage = params.get('message');
  const redirectPath = params.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const dev = isInfluencer ? defaults.influencer : defaults.brand;
    if (dev.email) setValue('email', dev.email);
    if (dev.password) setValue('password', dev.password);
  }, [defaults, isInfluencer, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      setGlobalError(null);

      const response = isInfluencer ? await loginInfluencer(values) : await loginBrand(values);
      // Use the auth context login function to store user data
      login(response.user);

      toast.success('Signed in successfully');
      router.replace(redirectPath);
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as { message?: string; fieldErrors?: Record<string, string> } | undefined;

        if (data?.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, message]) => {
            if (field === 'email' || field === 'password') {
              setError(field as keyof LoginInput, { message });
            }
          });
        }

        const message = data?.message ?? error.message ?? 'Unable to sign in.';
        setGlobalError(message);
        toast.error(message);
        return;
      }

      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      setGlobalError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="card login-card space-y-8">
      <div className="space-y-4 text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
          Sign in
        </span>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Access your workspace
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Use the email linked to your Scan Social account. You can switch roles with <a href="/login?role=influencer"><code>?role=influencer</code></a> when testing.
        </p>
      </div>

      {globalError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10">
          {globalError}
        </div>
      ) : null}

      {redirectMessage ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10">
          {redirectMessage}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div className="space-y-3">
          <label htmlFor="email" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@brand.com"
            {...register('email')}
          />
          {errors.email ? <p className="error">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-3">
          <label htmlFor="password" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password ? <p className="error">{errors.password.message}</p> : null}
        </div>

        <div className="flex items-center justify-between text-sm pt-2">
          <a className="font-medium text-[color:var(--color-primary)] hover:opacity-80" href="/forgot-password">
            Forgot password?
          </a>
          <a className="font-medium text-[color:var(--color-primary)] hover:opacity-80" href="/signup">
            Create an account
          </a>
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting} className="mt-2">
          Sign in
        </Button>
      </form>

      <div className="relative pt-2">
        <div className="login-divider" />
        <div className="relative -mt-3 mb-4 flex justify-center">
          <span className="login-subtle bg-[color:var(--color-surface)] px-4 py-1 text-sm">Or continue with</span>
        </div>
      </div>

      <Button type="button" variant="ghost" fullWidth disabled className="mb-2">
        Continue with TikTok
      </Button>
    </div>
  );
}
