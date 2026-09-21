'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Shield } from 'lucide-react';
import { useFormValidation } from '@/hooks/use-form-validation';
import { z } from 'zod';
import { toast } from '@/lib/notifications/toast';

const splitAuthSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function SplitScreenAuth() {
  const { values, errors, touched, setFieldValue, handleBlur, handleSubmit, isSubmitting } =
    useFormValidation({
      initialValues: { email: '', password: '' },
      schema: splitAuthSchema,
      onSubmit: async (data) => {
        toast.success(`Logged in as ${data.email}`);
      },
    });

  return (
    <div className="flex min-h-[600px] h-full w-full bg-background rounded-xl overflow-hidden border shadow-sm">
      {/* Left Form Area */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-12">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access your account.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1">
              <Label htmlFor="split-email" required>
                Email
              </Label>
              <Input
                id="split-email"
                type="email"
                placeholder="m@example.com"
                value={values.email}
                onChange={(e) => setFieldValue('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={touched.email && !!errors.email}
                aria-describedby={errors.email ? 'split-email-error' : undefined}
              />
              {touched.email && errors.email && (
                <InputError id="split-email-error" message={errors.email} />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="split-password" required>
                  Password
                </Label>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="split-password"
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={(e) => setFieldValue('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                error={touched.password && !!errors.password}
                aria-describedby={errors.password ? 'split-password-error' : undefined}
              />
              {touched.password && errors.password && (
                <InputError id="split-password-error" message={errors.password} />
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center sm:text-left text-sm">
            Don&apos;t have an account?{' '}
            <Link href="#" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Right Visual Area */}
      <div className="hidden lg:flex flex-1 bg-muted relative items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute -left-12 -bottom-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        {/* Branded Content */}
        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Bank-Grade Infrastructure</h3>
            <p className="text-muted-foreground text-sm">
              Experience ultra-low latency routing, direct telco SS7 binds, and 99.99% system uptime across East Africa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
