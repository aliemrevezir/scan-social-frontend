'use client';

import { z } from 'zod';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/ui/FormField';
import { useRegistrationForm } from '@/hooks/useRegistrationForm';

const influencerSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must include at least 8 characters.'),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions.',
  }),
});

export type InfluencerFormValues = z.infer<typeof influencerSchema>;

export function InfluencerForm() {
  const { register, onSubmit, errors, isSubmitting } = useRegistrationForm(
    influencerSchema,
    'INFLUENCER',
    {
      displayName: '',
      email: '',
      password: '',
      acceptedTerms: false,
    }
  );

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <FormField label="Display name" htmlFor="displayName" error={errors.displayName?.message}>
        <Input id="displayName" placeholder="Jane Creator" autoComplete="name" {...register('displayName')} />
      </FormField>

      <FormField label="Email" htmlFor="influencer-email" error={errors.email?.message}>
        <Input
          id="influencer-email"
          type="email"
          placeholder="jane.creator@email.com"
          autoComplete="email"
          {...register('email')}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="influencer-password"
        helperText="Minimum 8 characters."
        error={errors.password?.message}
      >
        <Input
          id="influencer-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('password')}
        />
      </FormField>

      <div className="space-y-2">
        <Checkbox
          label="I accept the terms and conditions"
          {...register('acceptedTerms')}
        />
        {errors.acceptedTerms ? <p className="error">{errors.acceptedTerms.message}</p> : null}
      </div>

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Create account
      </Button>
    </form>
  );
}
