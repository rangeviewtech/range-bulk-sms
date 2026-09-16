'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { lockScreen } from '@/app/(auth)/actions';

interface InactivityProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
}

export function InactivityProvider({ children, timeoutMinutes = 15 }: InactivityProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const throttleRef = useRef<number>(0);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await lockScreen();
        router.replace(result.redirect);
      } catch {
        router.replace('/login');
      }
    }, timeoutMinutes * 60 * 1000);
  }, [router, timeoutMinutes]);

  useEffect(() => {
    resetTimer();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      const now = Date.now();
      // Throttle to max 1 reset per 5 seconds
      if (now - throttleRef.current > 5000) {
        throttleRef.current = now;
        resetTimer();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [pathname, resetTimer]);

  return <>{children}</>;
}
