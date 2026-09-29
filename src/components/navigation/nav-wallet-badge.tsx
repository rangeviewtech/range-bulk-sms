'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, Plus, Eye, EyeOff } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';
import { UnmaskWalletDialog } from '@/components/wallet/unmask-wallet-dialog';

interface NavWalletBadgeProps {
  className?: string;
  variant?: 'compact' | 'full' | 'drawer';
  onNavigate?: () => void;
}

export function NavWalletBadge({ className, variant = 'full', onNavigate }: NavWalletBadgeProps) {
  const { balance, currency, isLoading } = useWallet();
  const [isMasked, setIsMasked] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const router = useRouter();

  const formattedBalance = balance.toLocaleString();
  const compactBalance =
    balance >= 1_000_000
      ? `${(balance / 1_000_000).toFixed(1)}M`
      : balance >= 1_000
      ? `${Math.floor(balance / 1_000)}k`
      : formattedBalance;

  const displayBalance = isMasked ? '••••••' : formattedBalance;
  const displayCompact = isMasked ? '••••' : compactBalance;

  const handleToggleMask = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMasked) {
      setShowAuthDialog(true);
    } else {
      setIsMasked(true);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    router.push('/wallet');
    if (onNavigate) onNavigate();
  };

  if (variant === 'drawer') {
    return (
      <div className={cn('p-3.5 bg-card border border-border/80 rounded-xl space-y-2.5 shadow-xs', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Wallet Balance
                <button type="button" onClick={handleToggleMask} className="p-0.5 hover:bg-muted rounded text-muted-foreground transition-colors">
                  {isMasked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
              <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {displayBalance} {currency}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleContainerClick}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Top Up Credits</span>
        </button>

        <UnmaskWalletDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={() => setIsMasked(false)} />
      </div>
    );
  }

  return (
    <>
      {/* Desktop / Large Screen Pill */}
      <div
        id="top-nav-wallet-badge-desktop"
        onClick={handleContainerClick}
        className={cn(
          'group hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border/80 bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 shadow-2xs select-none cursor-pointer active:scale-95 shrink-0',
          className
        )}
        title="Wallet Balance — Click to manage billing and top up credits"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
          <Wallet className={cn('w-3.5 h-3.5', isLoading && 'animate-pulse')} />
        </div>
        
        <div className="flex items-center gap-1">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-semibold text-muted-foreground/80 leading-none tracking-wider">
              Balance
            </span>
            <span className="text-xs font-bold text-foreground font-mono leading-tight group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors">
              {displayBalance} <span className="text-[10px] text-muted-foreground font-sans font-normal">{currency}</span>
            </span>
          </div>
          <button 
            type="button" 
            onClick={handleToggleMask} 
            className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors ml-0.5"
            title={isMasked ? 'Unmask balance' : 'Mask balance'}
          >
            {isMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick Top-Up Action */}
        <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pl-2 ml-1 border-l border-border/60 hover:underline">
          <Plus className="w-3 h-3" /> Top Up
        </span>
      </div>

      {/* Mobile Screen Compact Badge */}
      <div
        id="top-nav-wallet-badge-mobile"
        onClick={handleContainerClick}
        className={cn(
          'flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/80 bg-card hover:bg-muted/50 text-xs font-mono font-bold text-foreground transition-all cursor-pointer active:scale-95 shrink-0',
          className
        )}
        title="Wallet Balance — Click to manage credits"
      >
        <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
          {displayCompact} <span className="text-[9px] text-muted-foreground font-sans font-normal">{currency}</span>
        </span>
        <button 
          type="button" 
          onClick={handleToggleMask} 
          className="p-0.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
        >
          {isMasked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      </div>

      <UnmaskWalletDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={() => setIsMasked(false)} />
    </>
  );
}
