'use client';

import { useState, useEffect, useCallback } from 'react';

export interface WalletState {
  balance: number;
  currency: string;
  smsCredits: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const WALLET_UPDATED_EVENT = 'range:wallet-updated';

export function notifyWalletUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WALLET_UPDATED_EVENT));
  }
}

export function useWallet(): WalletState {
  const [balance, setBalance] = useState<number>(45000);
  const [currency, setCurrency] = useState<string>('UGX');
  const [smsCredits, setSmsCredits] = useState<number>(1285);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const parsedBal = parseFloat(json.data.balance);
          if (!isNaN(parsedBal)) {
            setBalance(parsedBal);
            const dbCredits = json.data.smsCredits;
            const credits =
              typeof dbCredits === 'number' && dbCredits > 0
                ? dbCredits
                : Math.floor(parsedBal / 45);
            setSmsCredits(credits);
          }
          if (json.data.currency) {
            setCurrency(json.data.currency);
          }
        }
      }
    } catch {
      // Retain graceful fallback state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();

    const handleUpdate = () => {
      fetchWallet();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(WALLET_UPDATED_EVENT, handleUpdate);
      window.addEventListener('focus', handleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(WALLET_UPDATED_EVENT, handleUpdate);
        window.removeEventListener('focus', handleUpdate);
      }
    };
  }, [fetchWallet]);

  return {
    balance,
    currency,
    smsCredits,
    isLoading,
    refresh: fetchWallet,
  };
}
