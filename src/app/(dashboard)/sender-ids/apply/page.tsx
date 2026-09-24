'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useFormValidation } from '@/hooks/use-form-validation';
import { senderIdApplicationSchema } from '@/lib/validations/sender-id';
import { InputError } from '@/components/ui/input-error';

export default function SenderIdApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    values: formValues,
    errors: formErrors,
    touched: formTouched,
    setFieldValue,
    handleBlur,
    validateAll,
    setServerErrors,
    markClean,
  } = useFormValidation({
    initialValues: {
      senderId: '',
      purpose: '',
    },
    schema: senderIdApplicationSchema,
    protectUnsavedChanges: !isSubmitted,
    id: 'sender-id-apply',
    title: 'Unsaved changes',
    message: 'You have entered an unsaved Sender ID request. If you leave now, your application draft will be lost.',
  });

  const handleSenderIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters and force uppercase
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 11);
    setFieldValue('senderId', cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateAll();
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await fetch('/api/sender-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: formValues.senderId.trim(),
          purpose: formValues.purpose.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.details) {
          setServerErrors(data.details);
        }
        throw new Error(data.error?.message || data.error || 'Failed to submit Sender ID request');
      }

      setIsSubmitted(true);
      markClean();
      toast.success(`Sender ID "${formValues.senderId}" submitted for approval!`);
      router.push('/sender-ids');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting request';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4 mb-2">
        <Link href="/sender-ids">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Request Sender ID</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Submit a new Sender ID for regulatory approval.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Sender ID Details</CardTitle>
            <CardDescription>
              Sender IDs must be between 3 and 11 characters, containing only letters and numbers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="senderId" required>Desired Sender ID</Label>
                <span className="text-xs text-muted-foreground font-mono">{formValues.senderId.length}/11 chars</span>
              </div>
              <Input
                id="senderId"
                placeholder="e.g. MYCOMPANY"
                value={formValues.senderId}
                onChange={handleSenderIdChange}
                onBlur={() => handleBlur('senderId')}
                error={formTouched.senderId && Boolean(formErrors.senderId)}
                maxLength={11}
                className="font-mono uppercase text-lg tracking-wider"
                autoFocus
                required
              />
              <InputError message={formTouched.senderId ? formErrors.senderId : undefined} />
              <p className="text-xs text-muted-foreground">
                Maximum 11 characters. No spaces or special characters allowed.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="purpose" required>Purpose of Usage</Label>
              <Textarea
                id="purpose"
                placeholder="Please explain what kind of messages you will send using this Sender ID (e.g. transactional alerts, OTPs, customer updates)."
                rows={4}
                value={formValues.purpose}
                onChange={(e) => setFieldValue('purpose', e.target.value)}
                onBlur={() => handleBlur('purpose')}
                error={formTouched.purpose && Boolean(formErrors.purpose)}
                required
              />
              <InputError message={formTouched.purpose ? formErrors.purpose : undefined} />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters explaining your business use case.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg flex gap-3 text-sm border">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium mb-1">Approval Process</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Sender IDs are reviewed by telecom operators and UCC compliance to prevent brand spoofing.
                  Approvals typically process within 24 business hours. You will receive an email confirmation upon approval.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-3 border-t p-4 sm:p-6">
            <Button variant="outline" asChild className="w-full sm:w-auto" disabled={loading}>
              <Link href="/sender-ids">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

