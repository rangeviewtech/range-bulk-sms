'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Smartphone, ShieldCheck, KeyRound, Loader2, MessageCircle, ShieldAlert } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  // Fetch available auth methods when dialog opens
  useEffect(() => {
    if (open) {
      setFetching(true);
      setError(null);
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
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !method) return;

    setLoading(true);
    setError(null);
    try {
      const res = await verifyWalletUnmask(method, value);
      if (res.success) {
        toast.success('Authentication successful');
        setValue('');
        onSuccess();
        onOpenChange(false);
      } else {
        setError(res.error || 'Verification failed');
      }
    } catch (_err) {
      setError('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20 dark:bg-muted/10">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="w-5 h-5 text-brand-blue dark:text-brand-yellow" />
            Unmask Wallet Balance
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Please verify your identity to view your wallet balance securely.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <DialogBody className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Checking security settings...</p>
          </DialogBody>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <DialogBody className="space-y-6 px-6 py-5">
              {availableMethods.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-blue dark:text-brand-yellow" />
                    Verification Method
                  </Label>
                  <div className="p-3.5 rounded-2xl border bg-muted/30 dark:bg-slate-950/40 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {availableMethods.map((m) => {
                      const Icon = ICON_MAP[m.id] || KeyRound;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setMethod(m.id as AuthMethod);
                            setValue('');
                            setError(null);
                          }}
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                            method === m.id
                              ? 'border-brand-blue bg-brand-blue/5 text-brand-blue dark:border-brand-yellow dark:bg-brand-yellow/10 dark:text-brand-yellow shadow-xs'
                              : 'border-border/60 bg-background text-muted-foreground hover:border-border hover:bg-muted/50'
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
                <Label htmlFor="auth-input" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                  {method === 'password' && 'Enter your password'}
                  {method === 'otp' && 'Enter 6-digit OTP code'}
                  {method === 'pin' && 'Enter your security PIN'}
                  {method === 'telegram' && 'Enter Telegram code'}
                </Label>
                <div className="p-3.5 rounded-2xl border bg-muted/30 dark:bg-slate-950/40 flex flex-col items-center justify-center">
                  <Input
                    id="auth-input"
                    type={method === 'password' ? 'password' : 'text'}
                    autoComplete="off"
                    autoFocus
                    maxLength={method === 'otp' || method === 'pin' ? 6 : undefined}
                    value={value}
                    onChange={(e) => { setValue(e.target.value); setError(null); }}
                    placeholder={
                      method === 'password' ? '••••••••' : method === 'otp' ? '123456' : '••••'
                    }
                    aria-invalid={!!error}
                    aria-describedby={error ? "auth-error" : undefined}
                    className="font-mono text-center tracking-widest text-xl h-14 bg-background rounded-xl shadow-xs transition-all focus-visible:ring-brand-blue/30 w-full"
                  />
                  {error && (
                    <div id="auth-error" className="text-xs font-medium text-destructive mt-2 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="px-6 py-4 border-t bg-muted/20 dark:bg-muted/10 sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!value || loading} className="min-w-[140px] rounded-xl h-10">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verify & Unmask
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
