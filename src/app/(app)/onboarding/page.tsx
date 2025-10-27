'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/atoms/Checkbox';
import { useBrands, useBrandStatus } from '@/lib/api/onboarding.hooks';
import {
  createBrand,
  updateBrand,
  upsertBrandProfile,
  updateCampaignPreferences,
  submitBrand,
  isBrandOnboarded,
  type Brand,
  type BrandProfile,
  type CampaignPreferences,
} from '@/lib/api/onboarding';
import { rqKeys } from '@/lib/api/onboarding.hooks';

const steps = [
  { key: 'welcome', title: 'Welcome', description: 'Get your workspace ready in a few guided steps.' },
  {
    key: 'connect',
    title: 'Connect accounts',
    description: 'Optional: link TikTok or other social accounts so we can enrich your campaigns automatically.',
  },
  {
    key: 'brand',
    title: 'Brand details',
    description: 'Tell us who you are so we can personalise recommendations.',
  },
  {
    key: 'preferences',
    title: 'Preferences & consents',
    description: 'Share goals, content types, and guardrails to tailor suggested campaigns.',
  },
  {
    key: 'summary',
    title: 'Review & submit',
    description: 'Confirm your details and submit to unlock recommendations.',
  },
] as const;

type StepKey = (typeof steps)[number]['key'];

const brandDetailsSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters long.'),
  website: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  industry: z.string().trim().optional(),
  company_size: z.string().trim().optional(),
  geography: z.string().trim().optional(),
  target_audience: z.string().trim().optional(),
  brand_description: z.string().trim().optional(),
});

type BrandDetailsFormValues = z.infer<typeof brandDetailsSchema>;

const preferencesSchema = z.object({
  budget_range: z.string().min(1, 'Choose a budget range.'),
  campaign_frequency: z.string().min(1, 'Select a campaign frequency.'),
  content_types: z.array(z.string()).min(1, 'Pick at least one content type.'),
  campaign_goals: z.array(z.string()).min(1, 'Pick at least one campaign goal.'),
  consents: z.object({
    marketing_updates: z.boolean().optional(),
    terms_ack: z.literal(true, {
      errorMap: () => ({ message: 'You must acknowledge the onboarding terms.' }),
    }),
  }),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

const contentTypeOptions = ['image', 'video', 'story', 'live', 'ugc'] as const;
const goalOptions = ['brand_awareness', 'lead_generation', 'sales', 'engagement', 'community_building'] as const;
const budgetOptions = ['<10000', '10000-50000', '50000-150000', '150000+'] as const;
const frequencyOptions = ['one-off', 'monthly', 'quarterly', 'always-on'] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandSnapshot, setBrandSnapshot] = useState<Brand | null>(null);

  const { data: brandList, isLoading: brandsLoading } = useBrands(true);
  const existingBrand = brandList?.[0];

  const brandForm = useForm<BrandDetailsFormValues>({
    resolver: zodResolver(brandDetailsSchema),
    defaultValues: {
      name: '',
      website: '',
      industry: '',
      company_size: '',
      geography: '',
      target_audience: '',
      brand_description: '',
    },
  });

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      budget_range: '10000-50000',
      campaign_frequency: 'monthly',
      content_types: ['image', 'video'],
      campaign_goals: ['brand_awareness', 'sales'],
      consents: {
        marketing_updates: true,
        terms_ack: true,
      },
    },
  });

  useEffect(() => {
    if (!existingBrand) return;
    setBrandId(existingBrand.id);
    setBrandSnapshot(existingBrand);
    brandForm.reset({
      name: existingBrand.name ?? '',
      website: existingBrand.website ?? '',
      industry: '',
      company_size: '',
      geography: '',
      target_audience: '',
      brand_description: '',
    });
  }, [existingBrand, brandForm]);

  const statusEnabled = useMemo(
    () => Boolean(brandId) && steps[activeStepIndex].key === 'summary',
    [brandId, activeStepIndex],
  );
  const statusQuery = useBrandStatus(brandId, statusEnabled);

  useEffect(() => {
    if (brandId && statusQuery.data && isBrandOnboarded(statusQuery.data)) {
      toast.success('Brand onboarding completed — redirecting to dashboard.');
      router.replace('/dashboard');
    }
  }, [brandId, router, statusQuery.data]);

  const goToStep = (index: number) => {
    setActiveStepIndex(Math.min(Math.max(index, 0), steps.length - 1));
  };

  const goNext = () => goToStep(activeStepIndex + 1);
  const goBack = () => goToStep(activeStepIndex - 1);

  const handleCreateOrUpdateBrand = async (values: BrandDetailsFormValues) => {
    const payload = {
      name: values.name.trim(),
      website: values.website?.trim() ?? null,
    };

    let brandRecord = brandSnapshot;
    try {
      if (!brandRecord) {
        const created = await createBrand(payload);
        brandRecord = created;
        setBrandId(created.id);
        setBrandSnapshot(created);
        toast.success('Brand created successfully.');
      } else {
        const updated = await updateBrand(brandRecord.id, payload);
        brandRecord = updated;
        setBrandSnapshot(updated);
        toast.success('Brand updated successfully.');
      }

      const profile: BrandProfile = {
        industry: values.industry || null,
        company_size: values.company_size || null,
        geography: values.geography ? values.geography.split(',').map((entry) => entry.trim()).filter(Boolean) : [],
        target_audience: values.target_audience || null,
        brand_description: values.brand_description || null,
      };

      if (!brandRecord?.id) {
        throw new Error('Missing brand identifier after create/update.');
      }

      await upsertBrandProfile(brandRecord.id, profile);
      toast.success('Brand profile saved.');

      queryClient.invalidateQueries({ queryKey: rqKeys.brands() });
      queryClient.invalidateQueries({ queryKey: rqKeys.brand(brandRecord.id) });
      setBrandId(brandRecord.id);
      goNext();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Unable to save brand details.');
    }
  };

  const handleSavePreferences = async (values: PreferencesFormValues) => {
    if (!brandId) {
      toast.error('Create your brand first.');
      return;
    }

    const payload: CampaignPreferences = {
      budget_range: values.budget_range,
      campaign_frequency: values.campaign_frequency,
      content_types: values.content_types,
      campaign_goals: values.campaign_goals,
      consents: values.consents,
    };

    try {
      await updateCampaignPreferences(brandId, payload);
      toast.success('Preferences saved.');

      queryClient.invalidateQueries({ queryKey: rqKeys.brand(brandId) });
      goNext();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Unable to save preferences.');
    }
  };

  const handleSubmitBrand = async () => {
    if (!brandId) {
      toast.error('Create your brand before submitting onboarding.');
      return;
    }
    try {
      await submitBrand(brandId);
      toast.success('Brand submitted. We will start processing shortly.');
      queryClient.invalidateQueries({ queryKey: rqKeys.brandStatus(brandId) });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Unable to submit onboarding right now.');
    }
  };

  const currentStep = steps[activeStepIndex];
  const disableBack = activeStepIndex === 0;

  const renderStepper = () => (
    <nav aria-label="Onboarding steps">
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isCompleted = index < activeStepIndex;
          return (
            <li key={step.key} className="flex items-center gap-3 text-sm">
              <span
                className={clsx(
                  'inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  isActive && 'border-primary bg-primary text-white shadow-soft',
                  isCompleted && !isActive && 'border-primary/40 bg-primary/10 text-primary',
                  !isActive && !isCompleted && 'border-border-light bg-white text-text-muted',
                )}
              >
                {index + 1}
              </span>
              <div className="hidden flex-col sm:flex">
                <span className={clsx('text-xs font-semibold uppercase tracking-[0.18em]', isActive ? 'text-primary' : 'text-text-muted')}>
                  Step {index + 1}
                </span>
                <span className={clsx('text-sm font-medium', isActive ? 'text-text' : 'text-text-secondary')}>
                  {step.title}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  const renderWelcomeStep = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-text md:text-4xl" style={{ lineHeight: 'var(--leading-tight)' }}>
        In a few steps, we’ll tailor Scan Social to your brand.
      </h1>
      <p className="text-base leading-relaxed text-text-secondary">
        We’ll capture your brand basics, goals, and collaboration guardrails. It takes about 2–3 minutes and unlocks personalised creator
        recommendations as well as your first campaign draft.
      </p>
      <ul className="grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
        <li className="rounded-2xl border border-border-light bg-primary/5 px-4 py-3">
          <span className="font-semibold text-primary">🧠 Smart suggestions</span>
          <p className="mt-2 leading-relaxed text-text-secondary">
            Match with creators that fit your goals, tone, and target audience.
          </p>
        </li>
        <li className="rounded-2xl border border-border-light bg-primary/5 px-4 py-3">
          <span className="font-semibold text-primary">🚀 Faster approvals</span>
          <p className="mt-2 leading-relaxed text-text-secondary">
            Use AI-enriched briefs and status tracking to keep every campaign on schedule.
          </p>
        </li>
      </ul>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button size="lg" onClick={goNext}>
          Start onboarding
        </Button>
        <Button variant="ghost" size="lg" onClick={() => router.push('/dashboard')}>
          Maybe later
        </Button>
      </div>
    </div>
  );

  const renderConnectAccountsStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-text">Connect social accounts (optional)</h2>
      <p className="text-base leading-relaxed text-text-secondary">
        Link TikTok or other social accounts now, or skip and connect later from settings. Connecting early helps us enrich insights and keep your
        campaign metrics up to date automatically.
      </p>
      <div className="rounded-3xl border border-dashed border-border-light bg-white/70 p-6 text-sm text-text-secondary">
        <p>
          Coming soon: native TikTok integration, Instagram insights, and Slack collaboration. For now, you can safely skip this step.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={goBack}>
          Back
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="ghost" onClick={goNext}>
            Skip for now
          </Button>
          <Button onClick={goNext}>Continue</Button>
        </div>
      </div>
    </div>
  );

  const renderBrandDetailsStep = () => {
    const {
      handleSubmit,
      register,
      formState: { errors, isSubmitting },
    } = brandForm;

    return (
      <form className="space-y-8" onSubmit={handleSubmit(handleCreateOrUpdateBrand)} noValidate>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Brand name" htmlFor="brand-name" error={errors.name?.message}>
            <Input id="brand-name" placeholder="Scan Social" {...register('name')} />
          </FormField>
          <FormField label="Website" htmlFor="brand-website" helperText="Include https://" error={errors.website?.message}>
            <Input id="brand-website" placeholder="https://example.com" {...register('website')} />
          </FormField>
        </div>
        <FormField label="Industry" htmlFor="brand-industry" helperText="e.g. Beauty, Fintech, Consumer Electronics" error={errors.industry?.message}>
          <Input id="brand-industry" placeholder="Industry" {...register('industry')} />
        </FormField>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Company size" htmlFor="brand-company" helperText="Approximate team size" error={errors.company_size?.message}>
            <Input id="brand-company" placeholder="11-50" {...register('company_size')} />
          </FormField>
          <FormField label="Primary geography" htmlFor="brand-geography" helperText="Comma separated list" error={errors.geography?.message}>
            <Input id="brand-geography" placeholder="United States, Canada" {...register('geography')} />
          </FormField>
        </div>
        <FormField label="Target audience" htmlFor="brand-audience" error={errors.target_audience?.message}>
          <Input id="brand-audience" placeholder="Gen Z skincare enthusiasts, 18-24" {...register('target_audience')} />
        </FormField>
        <FormField label="Brand description" htmlFor="brand-description" error={errors.brand_description?.message}>
          <textarea
            id="brand-description"
            {...register('brand_description')}
            placeholder="Tell us about your brand voice, key differentiators, and brand story."
            className="input min-h-[140px] resize-vertical"
          />
        </FormField>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" type="button" onClick={goBack} disabled={disableBack}>
            Back
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="ghost" type="button" onClick={goNext}>
              Skip for now
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save & continue
            </Button>
          </div>
        </div>
      </form>
    );
  };

  const renderPreferencesStep = () => {
    const {
      handleSubmit,
      register,
      watch,
      setValue,
      formState: { errors, isSubmitting },
    } = preferencesForm;

    const selectedContentTypes = watch('content_types');
    const selectedGoals = watch('campaign_goals');

    const toggleSelection = (field: 'content_types' | 'campaign_goals', value: string) => {
      const current = new Set(watch(field));
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      setValue(field, Array.from(current), { shouldValidate: true });
    };

    return (
      <form className="space-y-8" onSubmit={handleSubmit(handleSavePreferences)}>
        <FormField label="Typical campaign budget" htmlFor="budget">
          <div className="grid gap-3 sm:grid-cols-2">
            {budgetOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={clsx(
                  'rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                  watch('budget_range') === option
                    ? 'border-primary bg-primary/10 text-primary shadow-soft'
                    : 'border-border-light bg-white text-text-secondary hover:border-primary/40',
                )}
                onClick={() => setValue('budget_range', option, { shouldValidate: true })}
              >
                {option === '<10000' ? 'Under $10k' : option === '150000+' ? '$150k+' : `$${option.replace('-', ' - $')}`}
              </button>
            ))}
          </div>
          {errors.budget_range ? <p className="error">{errors.budget_range.message}</p> : null}
        </FormField>

        <FormField label="Campaign frequency" htmlFor="frequency">
          <div className="grid gap-3 sm:grid-cols-2">
            {frequencyOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={clsx(
                  'rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors capitalize',
                  watch('campaign_frequency') === option
                    ? 'border-primary bg-primary/10 text-primary shadow-soft'
                    : 'border-border-light bg-white text-text-secondary hover:border-primary/40',
                )}
                onClick={() => setValue('campaign_frequency', option, { shouldValidate: true })}
              >
                {option.replace('-', ' ')}
              </button>
            ))}
          </div>
          {errors.campaign_frequency ? <p className="error">{errors.campaign_frequency.message}</p> : null}
        </FormField>

        <div>
          <p className="mb-3 text-sm font-semibold text-text">Preferred content types</p>
          <div className="flex flex-wrap gap-3">
            {contentTypeOptions.map((option) => {
              const selected = selectedContentTypes.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors',
                    selected ? 'border-primary bg-primary text-white shadow-soft' : 'border-border-light bg-white text-text-secondary',
                  )}
                  onClick={() => toggleSelection('content_types', option)}
                >
                  {option.replace('_', ' ')}
                </button>
              );
            })}
          </div>
          {errors.content_types ? <p className="error">{errors.content_types.message}</p> : null}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-text">Campaign goals</p>
          <div className="flex flex-wrap gap-3">
            {goalOptions.map((option) => {
              const selected = selectedGoals.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors',
                    selected ? 'border-primary bg-primary text-white shadow-soft' : 'border-border-light bg-white text-text-secondary',
                  )}
                  onClick={() => toggleSelection('campaign_goals', option)}
                >
                  {option.replace('_', ' ')}
                </button>
              );
            })}
          </div>
          {errors.campaign_goals ? <p className="error">{errors.campaign_goals.message}</p> : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-border-light bg-white/80 p-4 text-sm">
          <Checkbox
            id="marketing-updates"
            label="Keep me posted on new product features and campaign ideas."
            {...register('consents.marketing_updates')}
          />
          <Checkbox
            id="terms-ack"
            label="I confirm that I have authority to share this information on behalf of my brand."
            {...register('consents.terms_ack')}
          />
          {errors.consents?.terms_ack ? <p className="error">{errors.consents.terms_ack.message}</p> : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" type="button" onClick={goBack}>
            Back
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save preferences
          </Button>
        </div>
      </form>
    );
  };

  const renderSummaryStep = () => {
    const status = statusQuery.data;
    const isProcessing = status ? !isBrandOnboarded(status) : true;
    const jobs = status?.jobs ?? [];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-text">Review & submit</h2>
        <p className="text-base leading-relaxed text-text-secondary">
          Submit your details to kick off enrichment. We’ll notify you when recommendations are ready. You can keep editing preferences anytime.
        </p>
        <div className="space-y-4 rounded-3xl border border-border-light bg-white/90 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text">Status</p>
              <p className="text-sm text-text-secondary">{status?.state ?? 'Not submitted'}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={goBack}>
                Back
              </Button>
              <Button onClick={handleSubmitBrand} disabled={!brandId}>
                Submit brand
              </Button>
            </div>
          </div>
          {jobs.length ? (
            <ul className="space-y-3 text-sm">
              {jobs.map((job) => (
                <li key={job.name} className="flex items-center justify-between rounded-2xl border border-border-light px-4 py-3">
                  <span className="font-medium text-text">{job.name}</span>
                  <span className="capitalize text-text-secondary">{job.status}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-sm text-text-muted">
            We’ll automatically refresh status every few seconds. You can safely leave this page — the onboarding modal will prompt you if we still
            need information.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            Go to dashboard
          </Button>
          <Button variant="ghost" onClick={() => router.push('/campaigns/new')} disabled={isProcessing}>
            Create a campaign
          </Button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep.key as StepKey) {
      case 'welcome':
        return renderWelcomeStep();
      case 'connect':
        return renderConnectAccountsStep();
      case 'brand':
        return renderBrandDetailsStep();
      case 'preferences':
        return renderPreferencesStep();
      case 'summary':
        return renderSummaryStep();
      default:
        return null;
    }
  };

  const ready = !brandsLoading;

  return (
    <main className="relative min-h-screen bg-transparent px-4 pb-20 pt-24 sm:px-6 lg:px-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/90 via-white/60 to-transparent blur-3xl" />
      <section className="container-app relative z-10 space-y-10">
        {renderStepper()}
        <div className="rounded-[32px] border border-border-light bg-white/80 p-8 shadow-soft backdrop-blur md:p-12">
          {ready ? renderCurrentStep() : <p className="text-sm text-text-secondary">Loading your onboarding progress…</p>}
        </div>
      </section>
    </main>
  );
}
