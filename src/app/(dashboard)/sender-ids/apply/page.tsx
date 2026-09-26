'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Loader2, AlertTriangle, ShieldCheck, FileText, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useFormValidation } from '@/hooks/use-form-validation';
import { senderIdApplicationSchema } from '@/lib/validations/sender-id';
import { InputError } from '@/components/ui/input-error';
import { AIRTEL_SETUP_FEES, AIRTEL_ONBOARDING_CHECKLIST } from '@/lib/telecom/airtel-rates';
import { Badge } from '@/components/ui/badge';

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
    // Telecom standard: alphanumeric, underscore, and dash allowed; max 11 chars
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase().slice(0, 11);
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 sm:gap-4 mb-2">
        <Link href="/sender-ids">
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to sender IDs">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Request Sender ID</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submit a custom alphanumeric Sender ID for Airtel Uganda and UCC regulatory approval.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Application Form (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle>Sender ID Registration</CardTitle>
                    <CardDescription>
                      The alphanumeric brand name displayed as the SMS sender on customer handsets.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit font-mono text-xs">
                    SMPP v3.4 Compliant
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Telecom Setup Fee Disclosure Banner */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-3 text-sm">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">Operator Setup Fee:</span>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 font-semibold">
                        {AIRTEL_SETUP_FEES.SENDER_ID_REGISTRATION_UGX.toLocaleString()} {AIRTEL_SETUP_FEES.CURRENCY} (VAT Incl.)
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Official network operator fee for direct SMSC whitelist activation and routing configuration across Airtel Uganda infrastructure.
                    </p>
                  </div>
                </div>

                {/* Desired Sender ID Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="senderId" required>Desired Sender ID</Label>
                    <span className={`text-xs font-mono ${formValues.senderId.length === 11 ? 'text-amber-500 font-semibold' : 'text-muted-foreground'}`}>
                      {formValues.senderId.length}/11 characters
                    </span>
                  </div>

                  <Input
                    id="senderId"
                    placeholder="e.g. RANGE_TECH"
                    value={formValues.senderId}
                    onChange={handleSenderIdChange}
                    onBlur={() => handleBlur('senderId')}
                    error={formTouched.senderId && Boolean(formErrors.senderId)}
                    maxLength={11}
                    className="font-mono uppercase text-lg tracking-wider"
                    autoFocus
                    required
                    aria-describedby="sender-id-rules"
                  />
                  <InputError message={formTouched.senderId ? formErrors.senderId : undefined} />

                  {/* Dynamic Regulatory & Format Guidance */}
                  {formValues.senderId.length > 0 && /^\d+$/.test(formValues.senderId) && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <div className="space-y-0.5">
                        <p className="font-semibold">UCC Regulatory Clearance Required for Numeric Sender IDs</p>
                        <p className="leading-relaxed opacity-90">
                          Numeric sender IDs and short codes are strictly regulated by the Uganda Communications Commission (UCC). 
                          You must attach an official UCC number assignment certificate before telecom whitelisting.
                        </p>
                      </div>
                    </div>
                  )}

                  {formValues.senderId.length >= 3 && !/^\d+$/.test(formValues.senderId) && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Alphanumeric format valid for Airtel SMSC direct interconnect (TON 5, NPI 0).</span>
                    </div>
                  )}

                  {/* Character Format Guidelines */}
                  <div id="sender-id-rules" className="pt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Permitted:</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">A-Z</Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">0-9</Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">_ (underscore)</Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">- (dash)</Badge>
                    <span className="text-[11px] text-muted-foreground ml-1">
                      (Spaces and brackets <code className="text-foreground font-mono">()[]</code> prohibited)
                    </span>
                  </div>
                </div>

                {/* Handset Mock Preview */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Mobile Handset Preview
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">GSM 03.38 Alphanumeric</span>
                  </div>
                  <div className="max-w-sm mx-auto bg-card border rounded-xl p-3 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {(formValues.senderId || 'RANGE')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate font-mono text-foreground">
                          {formValues.senderId || 'RANGE_SMS'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Direct SMS Route</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Now</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5 text-xs text-foreground/90 leading-relaxed font-sans">
                      Your verification OTP is 584920. Valid for 10 minutes. Do not share this code with anyone.
                    </div>
                  </div>
                </div>

                {/* Purpose of Usage */}
                <div className="space-y-1.5">
                  <Label htmlFor="purpose" required>Purpose of Usage & Message Samples</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Provide details on message types: Transactional alerts, OTPs, booking confirmations, or customer account notices. Include 1 or 2 typical message samples."
                    rows={4}
                    value={formValues.purpose}
                    onChange={(e) => setFieldValue('purpose', e.target.value)}
                    onBlur={() => handleBlur('purpose')}
                    error={formTouched.purpose && Boolean(formErrors.purpose)}
                    required
                  />
                  <InputError message={formTouched.purpose ? formErrors.purpose : undefined} />
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters. Explaining your use case helps telecom compliance expedite verification.
                  </p>
                </div>

                {/* Approval Timeline Note */}
                <div className="bg-muted/40 p-3.5 rounded-lg flex gap-3 text-xs border text-muted-foreground">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Sender IDs are verified against registered company documentation to protect brand identity and prevent fraudulent impersonation. Approvals typically take 24–48 business hours.
                  </p>
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
                  Submit Application
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Regulatory & Onboarding Checklist (1 column on lg) */}
        <div className="space-y-6">
          {/* KYC Documentation Card */}
          <Card className="border-secondary/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Telecom KYC Checklist</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Official documents required by Airtel Uganda & UCC for corporate onboarding:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <ul className="space-y-2.5 text-xs">
                {AIRTEL_ONBOARDING_CHECKLIST.map((item) => (
                  <li key={item.id} className="p-2.5 rounded-md border bg-muted/30 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{item.title}</span>
                      {item.required ? (
                        <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Conditional
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* SMPP v3.4 Gateway Specs */}
          <Card className="border-secondary/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-secondary dark:text-primary" />
                <CardTitle className="text-base">SMPP v3.4 Technical Specs</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Direct SMSC gateway routing parameters:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground pt-0">
              <div className="flex justify-between py-1 border-b">
                <span>Protocol</span>
                <span className="font-mono text-foreground font-semibold">SMPP v3.4 Binary</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Bind Mode</span>
                <span className="font-mono text-foreground font-semibold">bind_transmitter / transceiver</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Source TON / NPI</span>
                <span className="font-mono text-foreground font-semibold">TON 5 (Alphanumeric) / NPI 0</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Destination TON / NPI</span>
                <span className="font-mono text-foreground font-semibold">TON 1 (International) / NPI 1</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Max Header Length</span>
                <span className="font-mono text-foreground font-semibold">11 Characters (GSM 03.38)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>IP Whitelisting</span>
                <span className="font-mono text-foreground font-semibold">Static Production IP Firewall</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

