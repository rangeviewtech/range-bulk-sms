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

export default function SenderIdApplyPage() {
  const router = useRouter();
  const [senderId, setSenderId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSenderIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters and force uppercase
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 11);
    setSenderId(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senderId.length < 3) {
      toast.error('Sender ID must be at least 3 characters.');
      return;
    }
    if (purpose.trim().length < 10) {
      toast.error('Please provide a descriptive purpose (at least 10 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sender-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: senderId.trim(),
          purpose: purpose.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit Sender ID request');
      }

      toast.success(`Sender ID "${senderId}" submitted for approval!`);
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
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="senderId" required>Desired Sender ID</Label>
                <span className="text-xs text-muted-foreground font-mono">{senderId.length}/11 chars</span>
              </div>
              <Input
                id="senderId"
                placeholder="e.g. MYCOMPANY"
                value={senderId}
                onChange={handleSenderIdChange}
                maxLength={11}
                className="font-mono uppercase text-lg tracking-wider"
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum 11 characters. No spaces or special characters allowed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose" required>Purpose of Usage</Label>
              <Textarea
                id="purpose"
                placeholder="Please explain what kind of messages you will send using this Sender ID (e.g. transactional alerts, OTPs, customer updates)."
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
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
              disabled={loading || senderId.length < 3 || purpose.trim().length < 10}
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

