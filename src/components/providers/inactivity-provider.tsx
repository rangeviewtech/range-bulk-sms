'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface InactivityProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
}

export function InactivityProvider({ children, timeoutMinutes = 15 }: InactivityProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only set inactivity lock if we are inside the dashboard
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings') || pathname.startsWith('/profile')) {
      timeoutRef.current = setTimeout(() => {
        // Set cookie manually in the browser
        document.cookie = "screen_locked=true; path=/; max-age=86400; SameSite=Lax";
        // Redirect to screen lock
        router.push('/screen-lock');
      }, timeoutMinutes * 60 * 1000);
    }
  };

  useEffect(() => {
    resetTimer();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [pathname]);

  return <>{children}</>;
}
