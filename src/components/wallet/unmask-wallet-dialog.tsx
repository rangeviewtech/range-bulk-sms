'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Smartphone, ShieldCheck, KeyRound, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAvailableAuthMethods, verifyWalletUnmask } from '@/app/actions/wallet';

interface UnmaskWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type AuthMethod = 'password' | 'otp' | 'pin' | 'telegram';

const ICON_MAP: Record<string, React.ElementType> = {
  password: KeyRound,
  otp: Smartphone,
  pin: Lock,
  telegram: MessageCircle,
};

export function UnmaskWalletDialog({ open, onOpenChange, onSuccess }: UnmaskWalletDialogProps) {
  const [method, setMethod] = useState<AuthMethod | null>(null);
  const [availableMethods, setAvailableMethods] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [value, setValue] = useState('');

  // Fetch available auth methods when dialog opens
  useEffect(() => {
    if (open) {
      setFetching(true);
      getAvailableAuthMethods()
        .then((methods) => {
          setAvailableMethods(methods);
          if (methods.length > 0) {
            setMethod(methods[0].id as AuthMethod);
          }
        })
        .catch(() => {
          toast.error('Failed to load verification methods');
        })
        .finally(() => {
          setFetching(false);
        });
    } else {
      setValue('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !method) return;

    setLoading(true);
    try {
      const res = await verifyWalletUnmask(method, value);
      if (res.success) {
        toast.success('Authentication successful');
        setValue('');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.error || 'Verification failed');
      }
    } catch (err) {
      toast.error('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-blue dark:text-brand-yellow" />
            Unmask Wallet Balance
          </DialogTitle>
          <DialogDescription>
            Please verify your identity to view your wallet balance.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Checking security settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {availableMethods.length > 0 && (
              <div className="space-y-3">
                <Label>Select Verification Method</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableMethods.map((m) => {
                    const Icon = ICON_MAP[m.id] || KeyRound;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMethod(m.id as AuthMethod);
                          setValue('');
                        }}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          method === m.id
                            ? 'border-brand-blue bg-brand-blue/5 text-brand-blue dark:border-brand-yellow dark:bg-brand-yellow/10 dark:text-brand-yellow'
                            : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] text-center font-semibold uppercase tracking-wider leading-tight">
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          <div className="space-y-2">
            <Label htmlFor="auth-input">
              {method === 'password' && 'Enter your password'}
              {method === 'otp' && 'Enter 6-digit OTP code'}
              {method === 'pin' && 'Enter your security PIN'}
            </Label>
            <Input
              id="auth-input"
              type={method === 'password' ? 'password' : 'text'}
              autoComplete="off"
              autoFocus
              maxLength={method === 'otp' || method === 'pin' ? 6 : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                method === 'password' ? '••••••••' : method === 'otp' ? '123456' : '••••'
              }
              className="font-mono text-center tracking-widest text-lg h-12"
            />
          </div>

          <Button type="submit" className="w-full" disabled={!value || loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Verify & Unmask
          </Button>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
