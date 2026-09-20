'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';

export function SplitScreenAuth() {
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
          
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email" required>Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" required>Password</Label>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            
            <Button type="submit" className="w-full">
              Sign In
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
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Enterprise Grade Security
          </h2>
          <p className="text-muted-foreground">
            Our platform uses industry-leading encryption and security practices to ensure your data is always protected.
          </p>
        </div>
      </div>
    </div>
  );
}
