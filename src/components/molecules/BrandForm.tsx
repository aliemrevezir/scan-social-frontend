'use client';

import { z } from 'zod';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/ui/FormField';
import { useRegistrationForm } from '@/hooks/useRegistrationForm';

const brandSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must include at least 8 characters.'),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions.',
  }),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

export function BrandForm() {
  const { register, onSubmit, errors, isSubmitting } = useRegistrationForm(
    brandSchema,
    'BRAND',
    {
      companyName: '',
      email: '',
      password: '',
      acceptedTerms: false,
    }
  );

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <FormField label="Company name" htmlFor="companyName" error={errors.companyName?.message}>
        <Input id="companyName" placeholder="Acme Co." autoComplete="organization" {...register('companyName')} />
      </FormField>

      <FormField label="Work email" htmlFor="brand-email" error={errors.email?.message}>
        <Input
          id="brand-email"
          type="email"
          placeholder="john.smith@acme.com"
          autoComplete="email"
          {...register('email')}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="brand-password"
        helperText="Minimum 8 characters."
        error={errors.password?.message}
      >
        <Input
          id="brand-password"
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
