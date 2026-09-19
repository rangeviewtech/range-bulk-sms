'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/(auth)/actions';
import { Clock, AlertTriangle, ShieldCheck, LogOut } from 'lucide-react';

export interface SessionIdleTrackerProps {
  rememberMe?: boolean;
  idleExpiresAt?: string | null;
  expiresAt?: string | null;
  timeoutMinutes?: number; // Total idle timeout (default: 15)
  warningMinutes?: number; // Warning threshold before expiration (default: 2 minutes -> warn at 13m)
  children?: React.ReactNode;
}

type SessionBroadcastMessage =
  | { type: 'SESSION_HEARTBEAT'; timestamp: number }
  | { type: 'SESSION_LOGOUT' }
  | { type: 'SESSION_EXPIRED' };

const BROADCAST_CHANNEL_NAME = 'range_session_channel';

export function SessionIdleTracker({
  rememberMe = false,
  timeoutMinutes = 15,
  warningMinutes = 2,
  children,
}: SessionIdleTrackerProps) {
  const router = useRouter();

  // Dialog state
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(warningMinutes * 60);
  const [isExtending, setIsExtending] = useState(false);

  // Timing references
  const lastActivityRef = useRef<number>(0);
  const lastHeartbeatRef = useRef<number>(0);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const totalTimeoutMs = timeoutMinutes * 60 * 1000;
  const warningThresholdMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

  // Broadcast helper
  const broadcast = useCallback((msg: SessionBroadcastMessage) => {
    try {
      if (channelRef.current) {
        channelRef.current.postMessage(msg);
      }
    } catch (_err) {
      // BroadcastChannel unavailable in this context
    }
  }, []);

  // Graceful redirection to expired login
  const handleSessionExpired = useCallback(() => {
    setShowWarning(false);
    broadcast({ type: 'SESSION_EXPIRED' });
    router.replace('/login?expired=1');
  }, [broadcast, router]);

  // Extend session (Heartbeat)
  const extendSession = useCallback(async () => {
    setIsExtending(true);
    try {
      const res = await fetch('/api/auth/session/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        lastActivityRef.current = Date.now();
        lastHeartbeatRef.current = Date.now();
        setShowWarning(false);
        setSecondsRemaining(warningMinutes * 60);
        broadcast({ type: 'SESSION_HEARTBEAT', timestamp: Date.now() });
      } else {
        handleSessionExpired();
      }
    } catch {
      handleSessionExpired();
    } finally {
      setIsExtending(false);
    }
  }, [broadcast, handleSessionExpired, warningMinutes]);

  // Explicit logout
  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    broadcast({ type: 'SESSION_LOGOUT' });
    try {
      await logout();
    } catch {
      router.replace('/login');
    }
  }, [broadcast, router]);

  // Setup cross-tab BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<SessionBroadcastMessage>) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'SESSION_HEARTBEAT') {
        lastActivityRef.current = msg.timestamp;
        setShowWarning(false);
        setSecondsRemaining(warningMinutes * 60);
      } else if (msg.type === 'SESSION_LOGOUT') {
        router.replace('/login');
      } else if (msg.type === 'SESSION_EXPIRED') {
        router.replace('/login?expired=1');
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [router, warningMinutes]);

  // Inactivity tracking & warning interval (Active only for non-remembered sessions)
  useEffect(() => {
    // 30-day persistent sessions do not expire after 15 minutes of idle
    if (rememberMe) return;

    lastActivityRef.current = Date.now();
    lastHeartbeatRef.current = Date.now();

    // Interaction listener for throttled activity renewal
    const handleUserInteraction = () => {
      const now = Date.now();
      lastActivityRef.current = now;

      // If warning modal is currently shown, user must explicitly click "Stay signed in"
      if (showWarning) return;

      // Throttled background heartbeat: at most once every 60s
      if (now - lastHeartbeatRef.current >= 60 * 1000) {
        lastHeartbeatRef.current = now;
        fetch('/api/auth/session/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).then((res) => {
          if (res.ok) {
            broadcast({ type: 'SESSION_HEARTBEAT', timestamp: now });
          }
        }).catch(() => {});
      }
    };

    const trackedEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    trackedEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    // Check interval every 1 second
    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;

      if (idleTime >= totalTimeoutMs) {
        // 15 minutes passed -> Expire
        clearInterval(interval);
        handleSessionExpired();
      } else if (idleTime >= warningThresholdMs) {
        // 13 minutes passed -> Show warning modal & count down
        const remaining = Math.max(0, Math.ceil((totalTimeoutMs - idleTime) / 1000));
        setShowWarning(true);
        setSecondsRemaining(remaining);
      } else {
        // Active and before warning threshold
        if (showWarning) setShowWarning(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      trackedEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction);
      });
    };
  }, [
    rememberMe,
    showWarning,
    totalTimeoutMs,
    warningThresholdMs,
    broadcast,
    handleSessionExpired,
  ]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      {children}

      {/* Accessible Inactivity Warning Modal */}
      {showWarning && !rememberMe && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="session-warning-title"
          aria-describedby="session-warning-desc"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              borderRadius: '12px',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              padding: '24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Header with Warning Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'hsl(var(--destructive) / 0.15)',
                  color: 'hsl(var(--destructive))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3
                  id="session-warning-title"
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  Session Expiring Soon
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                >
                  Due to 15 minutes of inactivity
                </p>
              </div>
            </div>

            {/* Countdown Display */}
            <div
              id="session-warning-desc"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <Clock size={20} color="hsl(var(--destructive))" />
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: 'hsl(var(--destructive))',
                }}
              >
                {formatCountdown(secondsRemaining)}
              </span>
              <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                remaining
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: 'hsl(var(--muted-foreground))', lineHeight: '1.5' }}>
              For your security, non-persistent sessions automatically log out after 15 minutes of inactivity. Click below to continue working.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '6px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'transparent',
                  color: 'hsl(var(--foreground))',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <LogOut size={15} />
                Sign Out Now
              </button>

              <button
                type="button"
                onClick={extendSession}
                disabled={isExtending}
                style={{
                  flex: 2,
                  height: '40px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isExtending ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: isExtending ? 0.7 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                <ShieldCheck size={16} />
                {isExtending ? 'Refreshing...' : 'Stay Signed In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
