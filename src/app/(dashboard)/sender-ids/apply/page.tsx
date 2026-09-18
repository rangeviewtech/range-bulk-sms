import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SenderIdApplyPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3 sm:gap-4 mb-2">
        <Link href="/sender-ids">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Request Sender ID</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Submit a new Sender ID for approval.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sender ID Details</CardTitle>
          <CardDescription>
            Sender IDs must be between 3 and 11 characters, containing only letters and numbers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="senderId">Desired Sender ID</Label>
            <Input id="senderId" placeholder="e.g. MYCOMPANY" maxLength={11} className="font-mono uppercase text-lg" />
            <p className="text-sm text-muted-foreground">
              Maximum 11 characters. No spaces or special characters allowed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Usage</Label>
            <Textarea 
              id="purpose" 
              placeholder="Please explain what kind of messages you will send using this Sender ID (e.g. transactional alerts, OTPs, marketing updates)." 
              rows={4}
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg flex gap-3 text-sm border">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="font-medium mb-1">Approval Process</p>
              <p className="text-muted-foreground">
                Sender IDs are manually reviewed by our team and network operators to prevent spam and fraud. 
                Approval typically takes 24-48 business hours. You will receive an email notification once approved.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-3 border-t p-4 sm:p-6">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/sender-ids">Cancel</Link>
          </Button>
          <Button className="w-full sm:w-auto">Submit Request</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
