'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Hexagon } from 'lucide-react';

export function MinimalAuth() {
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
        
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="minimal-email">Email</Label>
            <Input id="minimal-email" type="email" placeholder="m@example.com" required className="bg-transparent" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="minimal-password">Password</Label>
              <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input id="minimal-password" type="password" required className="bg-transparent" />
          </div>
          
          <Button type="submit" className="w-full mt-2">
            Sign In
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
