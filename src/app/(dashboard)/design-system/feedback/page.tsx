"use client";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Feedback</h1>
      <div className="flex gap-4">
        <Button onClick={() => toast.success('Success!')}>Toast Success</Button>
        <Button onClick={() => toast.error('Error!')} variant="destructive">Toast Error</Button>
      </div>
    </div>
  );
}
