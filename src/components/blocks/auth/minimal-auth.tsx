'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Hexagon } from 'lucide-react';
import { useFormValidation } from '@/hooks/use-form-validation';
import { z } from 'zod';
import { toast } from '@/lib/notifications/toast';

const minimalAuthSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function MinimalAuth() {
  const { values, errors, touched, setFieldValue, handleBlur, handleSubmit, isSubmitting } =
    useFormValidation({
      initialValues: { email: '', password: '' },
      schema: minimalAuthSchema,
      onSubmit: async (data) => {
        toast.success(`Logged in as ${data.email}`);
      },
    });

  return (
    <div className="flex min-h-[600px] h-full w-full flex-col items-center justify-center bg-background p-4 rounded-xl border">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Hexagon className="w-10 h-10 text-primary" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Log in to Template</h1>
            <p className="text-muted-foreground text-sm">
              Welcome back! Please enter your details.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <Label htmlFor="minimal-email" required>
              Email
            </Label>
            <Input
              id="minimal-email"
              type="email"
              placeholder="m@example.com"
              className="bg-transparent"
              value={values.email}
              onChange={(e) => setFieldValue('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={touched.email && !!errors.email}
              aria-describedby={errors.email ? 'minimal-email-error' : undefined}
            />
            {touched.email && errors.email && (
              <InputError id="minimal-email-error" message={errors.email} />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="minimal-password" required>
                Password
              </Label>
              <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              id="minimal-password"
              type="password"
              className="bg-transparent"
              value={values.password}
              onChange={(e) => setFieldValue('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password && !!errors.password}
              aria-describedby={errors.password ? 'minimal-password-error' : undefined}
            />
            {touched.password && errors.password && (
              <InputError id="minimal-password-error" message={errors.password} />
            )}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="#" className="font-medium text-foreground hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
