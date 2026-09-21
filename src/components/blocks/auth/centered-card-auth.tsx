'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { useFormValidation } from '@/hooks/use-form-validation';
import { z } from 'zod';
import { toast } from '@/lib/notifications/toast';

const centeredAuthSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function CenteredCardAuth() {
  const { values, errors, touched, setFieldValue, handleBlur, handleSubmit, isSubmitting } =
    useFormValidation({
      initialValues: { email: '', password: '' },
      schema: centeredAuthSchema,
      onSubmit: async (data) => {
        toast.success(`Signed in as ${data.email}`);
      },
    });

  return (
    <div className="flex min-h-[600px] h-full w-full items-center justify-center bg-muted/30 p-4 rounded-xl border shadow-inner">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <Label htmlFor="centered-email" required>
              Email
            </Label>
            <Input
              id="centered-email"
              type="email"
              placeholder="m@example.com"
              value={values.email}
              onChange={(e) => setFieldValue('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={touched.email && !!errors.email}
              aria-describedby={errors.email ? 'centered-email-error' : undefined}
            />
            {touched.email && errors.email && (
              <InputError id="centered-email-error" message={errors.email} />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="centered-password" required>
                Password
              </Label>
              <Link href="#" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="centered-password"
              type="password"
              placeholder="••••••••"
              value={values.password}
              onChange={(e) => setFieldValue('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password && !!errors.password}
              aria-describedby={errors.password ? 'centered-password-error' : undefined}
            />
            {touched.password && errors.password && (
              <InputError id="centered-password-error" message={errors.password} />
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="#" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
