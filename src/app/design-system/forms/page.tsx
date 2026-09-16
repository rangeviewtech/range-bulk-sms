"use client";
import { Button } from '@/components/ui/button';

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Forms</h1>
      <form className="max-w-md space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input</label>
          <input className="w-full p-2 border rounded-md" placeholder="Enter text..." />
        </div>
        <Button type="button">Submit</Button>
      </form>
    </div>
  );
}
