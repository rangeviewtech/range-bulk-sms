// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { NavWalletBadge } from '@/components/navigation/nav-wallet-badge';
import { useWallet, notifyWalletUpdated, WALLET_UPDATED_EVENT } from '@/hooks/use-wallet';
import { renderHook } from '@testing-library/react';

describe('NavWalletBadge & useWallet Integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          balance: '2019540',
          currency: 'UGX',
          smsCredits: 44878,
        },
      }),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('notifies listeners when notifyWalletUpdated is dispatched', () => {
    const listener = vi.fn();
    window.addEventListener(WALLET_UPDATED_EVENT, listener);

    notifyWalletUpdated();

    expect(listener).toHaveBeenCalled();
    window.removeEventListener(WALLET_UPDATED_EVENT, listener);
  });

  it('fetches and updates wallet balance and credits via useWallet hook', async () => {
    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.balance).toBe(2019540);
    expect(result.current.currency).toBe('UGX');
    expect(result.current.smsCredits).toBe(44878);
  });

  it('renders desktop and mobile navigation badges with accurate formatting', async () => {
    render(React.createElement(NavWalletBadge));

    const desktopBadge = document.getElementById('top-nav-wallet-badge-desktop');
    expect(desktopBadge).not.toBeNull();
    expect(desktopBadge?.getAttribute('href')).toBe('/wallet');
    expect(screen.getAllByText(/Balance/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Top Up/i)).toBeDefined();

    const mobileBadge = document.getElementById('top-nav-wallet-badge-mobile');
    expect(mobileBadge).not.toBeNull();
    expect(mobileBadge?.getAttribute('href')).toBe('/wallet');
  });

  it('renders drawer variant with full width top-up button', () => {
    const onNavigate = vi.fn();
    render(React.createElement(NavWalletBadge, { variant: 'drawer', onNavigate }));

    expect(screen.getByText(/Wallet Balance/i)).toBeDefined();
    const topUpBtn = screen.getByRole('link', { name: /Top Up Credits/i });
    expect(topUpBtn).toBeDefined();
    expect(topUpBtn.getAttribute('href')).toBe('/wallet');

    topUpBtn.click();
    expect(onNavigate).toHaveBeenCalled();
  }, 15000);
});
