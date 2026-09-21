'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useFormValidation } from '@/hooks/use-form-validation';
import { z } from 'zod';
import { toast } from '@/lib/notifications/toast';

const wizardSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
});

export function WizardAuth() {
  const [step, setStep] = useState(1);

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useFormValidation({
    initialValues: { email: '', password: '', name: '', company: '' },
    schema: wizardSchema,
    onSubmit: async (data) => {
      toast.success(`Account created for ${data.name} (${data.email})`);
      setStep(1);
    },
  });

  const handleStep1Next = () => {
    handleBlur('email');
    if (!values.email || errors.email) return;
    setStep(2);
  };

  const handleStep2Next = () => {
    handleBlur('password');
    if (!values.password || errors.password) return;
    setStep(3);
  };

  return (
    <div className="flex min-h-[600px] h-full w-full items-center justify-center bg-muted/30 p-4 rounded-xl border shadow-inner">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border shadow-sm space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between relative mb-8">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -translate-y-1/2" />
          <div
            className="absolute left-0 top-1/2 h-1 bg-primary -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors duration-300 border-2 ${
                s < step
                  ? 'bg-primary border-primary text-primary-foreground'
                  : s === step
                  ? 'bg-background border-primary text-primary'
                  : 'bg-background border-muted text-muted-foreground'
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : <span className="text-sm font-semibold">{s}</span>}
            </div>
          ))}
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Let&apos;s get started</h1>
              <p className="text-muted-foreground text-sm">What is your email address?</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="wizard-email" required>
                Email
              </Label>
              <Input
                id="wizard-email"
                type="email"
                placeholder="m@example.com"
                value={values.email}
                onChange={(e) => setFieldValue('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={touched.email && !!errors.email}
                aria-describedby={errors.email ? 'wizard-email-error' : undefined}
              />
              {touched.email && errors.email && (
                <InputError id="wizard-email-error" message={errors.email} />
              )}
            </div>
            <Button className="w-full" onClick={handleStep1Next}>
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Password */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Secure your account</h1>
              <p className="text-muted-foreground text-sm">Choose a strong password</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="wizard-password" required>
                Password
              </Label>
              <Input
                id="wizard-password"
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={(e) => setFieldValue('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                error={touched.password && !!errors.password}
                aria-describedby={errors.password ? 'wizard-password-error' : undefined}
              />
              {touched.password && errors.password && (
                <InputError id="wizard-password-error" message={errors.password} />
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button className="w-full flex-1" onClick={handleStep2Next}>
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <form className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Almost there</h1>
              <p className="text-muted-foreground text-sm">Tell us a bit about yourself</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="wizard-name" required>
                  Full Name
                </Label>
                <Input
                  id="wizard-name"
                  type="text"
                  placeholder="John Doe"
                  value={values.name}
                  onChange={(e) => setFieldValue('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  error={touched.name && !!errors.name}
                  aria-describedby={errors.name ? 'wizard-name-error' : undefined}
                />
                {touched.name && errors.name && (
                  <InputError id="wizard-name-error" message={errors.name} />
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="wizard-company">Company (Optional)</Label>
                <Input
                  id="wizard-company"
                  type="text"
                  placeholder="Acme Inc."
                  value={values.company}
                  onChange={(e) => setFieldValue('company', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button type="submit" className="w-full flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>
        )}

        <div className="text-center text-sm pt-4 border-t">
          Already have an account?{' '}
          <Link href="#" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
