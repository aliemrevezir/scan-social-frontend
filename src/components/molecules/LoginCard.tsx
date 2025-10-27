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
    <div
      className="relative flex flex-col gap-8 rounded-3xl border border-border-light bg-white/90 p-8 shadow-soft backdrop-blur"
      style={{
        backgroundImage:
          'linear-gradient(140deg, rgba(255,255,255,0.96), color-mix(in srgb, var(--color-primary) 8%, #ffffff))',
      }}
    >
      <div className="space-y-3 text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Sign in</span>
        <h2 className="text-2xl font-semibold text-text">Access your workspace</h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          Use the email linked to your Scan Social account. Switch roles quickly with{' '}
          <a href="/login?role=influencer" className="font-medium text-primary underline-offset-2 hover:underline">
            ?role=influencer
          </a>{' '}
          when testing.
        </p>
      </div>

      {globalError ? (
        <div className="rounded-xl border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
          {globalError}
        </div>
      ) : null}

      {redirectMessage ? (
        <div className="rounded-xl border border-info/20 bg-info-bg px-4 py-3 text-sm text-info">
          {redirectMessage}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-text">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@brand.com"
            {...register('email')}
          />
          {errors.email ? <p className="text-sm text-error">{errors.email.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-text">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password ? <p className="text-sm text-error">{errors.password.message}</p> : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-primary">
          <a className="font-medium transition-opacity hover:opacity-80" href="/forgot-password">
            Forgot password?
          </a>
          <a className="font-medium transition-opacity hover:opacity-80" href="/signup">
            Create an account
          </a>
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting} className="mt-2">
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span className="h-px flex-1 bg-border-light" />
        <span>Or continue with</span>
        <span className="h-px flex-1 bg-border-light" />
      </div>

      <Button type="button" variant="ghost" fullWidth disabled className="border-dashed text-text-muted">
        Continue with TikTok
      </Button>
    </div>
  );
}
