import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SessionIdleTracker } from '@/components/auth/session-idle-tracker';
import { vi } from 'vitest';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

vi.mock('@/app/(auth)/actions', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

describe('SessionIdleTracker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children properly', () => {
    render(
      <SessionIdleTracker rememberMe={false}>
        <div data-testid="dashboard-content">Dashboard Active</div>
      </SessionIdleTracker>
    );

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('does NOT trigger warning or timeout when rememberMe is true', () => {
    render(
      <SessionIdleTracker rememberMe={true} timeoutMinutes={15} warningMinutes={2}>
        <div data-testid="persistent-content">Persistent Dashboard</div>
      </SessionIdleTracker>
    );

    // Fast-forward 14 minutes (past warning threshold)
    act(() => {
      vi.advanceTimersByTime(14 * 60 * 1000);
    });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    // Fast-forward past 15 minutes
    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows warning alertdialog at 13 minutes (2 minutes before expiration) for non-remembered sessions', () => {
    render(
      <SessionIdleTracker rememberMe={false} timeoutMinutes={15} warningMinutes={2}>
        <div>Active Session</div>
      </SessionIdleTracker>
    );

    // Fast forward 13 minutes (780,000 ms)
    act(() => {
      vi.advanceTimersByTime(13 * 60 * 1000);
    });

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Session Expiring Soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Due to 15 minutes of inactivity/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stay Signed In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out Now/i })).toBeInTheDocument();
  });

  it('redirects to /login?expired=1 after 15 minutes of inactivity', () => {
    render(
      <SessionIdleTracker rememberMe={false} timeoutMinutes={15} warningMinutes={2}>
        <div>Active Session</div>
      </SessionIdleTracker>
    );

    // Fast forward 15 minutes + 1 second
    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000 + 1000);
    });

    expect(mockReplace).toHaveBeenCalledWith('/login?expired=1');
  });
});
