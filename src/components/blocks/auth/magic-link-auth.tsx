'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Sparkles } from 'lucide-react';
import { useFormValidation } from '@/hooks/use-form-validation';
import { z } from 'zod';
import { toast } from '@/lib/notifications/toast';

const magicLinkSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

export function MagicLinkAuth() {
  const { values, errors, touched, setFieldValue, handleBlur, handleSubmit, isSubmitting } =
    useFormValidation({
      initialValues: { email: '' },
      schema: magicLinkSchema,
      onSubmit: async (data) => {
        toast.success(`Magic link sent to ${data.email}`);
      },
    });

  return (
    <div className="flex min-h-[600px] h-full w-full items-center justify-center bg-muted/30 p-4 rounded-xl border shadow-inner">
      <div className="w-full max-w-sm bg-card p-8 rounded-xl border shadow-sm space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Magic Link</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email and we&apos;ll send you a magic link to sign in instantly. No password required.
          </p>
        </div>

        <form className="space-y-4 pt-2" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <Label htmlFor="magic-email" required>
              Email Address
            </Label>
            <Input
              id="magic-email"
              type="email"
              placeholder="name@example.com"
              value={values.email}
              onChange={(e) => setFieldValue('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={touched.email && !!errors.email}
              aria-describedby={errors.email ? 'magic-email-error' : undefined}
            />
            {touched.email && errors.email && (
              <InputError id="magic-email-error" message={errors.email} />
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link href="#" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
            Back to standard login
          </Link>
        </div>
      </div>
    </div>
  );
}
