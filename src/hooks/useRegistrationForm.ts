import { useRouter } from 'next/navigation';
import { useForm, DefaultValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { register as registerAccount } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export function useRegistrationForm<T extends Record<string, string | boolean | undefined>>(
  schema: z.ZodSchema<T>,
  userType: 'BRAND' | 'INFLUENCER',
  defaultValues: DefaultValues<T>
) {
  const router = useRouter();
  const { login } = useAuth();
  
  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await registerAccount({
        email: (values as Record<string, unknown>).email as string,
        password: (values as Record<string, unknown>).password as string,
        type: userType,
        displayName: ((values as Record<string, unknown>).displayName || (values as Record<string, unknown>).companyName) as string,
      });

      if (response.data.user) {
        login(response.data.user);
      }

      toast.success('Account created');
      reset(defaultValues);
      router.push('/?welcome=1');
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as { message?: string; fieldErrors?: Record<string, string> } | undefined;

        if (data?.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, message]) => {
            setError(field as Path<T>, {
              type: 'server',
              message,
            });
          });
        } else {
          setError('email' as Path<T>, {
            type: 'server',
            message: data?.message || 'Registration failed',
          });
        }
      } else {
        toast.error('Registration failed');
      }
    }
  });

  return {
    register: formRegister,
    onSubmit,
    errors,
    isSubmitting,
    setError,
  };
}
