'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getClientTimezone } from '@/lib/timezone';

interface TimezoneContextValue {
  /** Current IANA timezone identifier (from user profile or browser detection) */
  timezone: string;
  /** Update the timezone (e.g. from settings page) */
  setTimezone: (tz: string) => void;
}

const TimezoneContext = createContext<TimezoneContextValue>({
  timezone: 'Africa/Kampala',
  setTimezone: () => {},
});

interface TimezoneProviderProps {
  /** The user's timezone from the database (passed from server component) */
  userTimezone?: string;
  children: React.ReactNode;
}

/**
 * Provides timezone context to the entire application.
 *
 * Priority:
 *   1. `userTimezone` prop (from DB / server component) — if the user set one explicitly.
 *   2. Browser-detected timezone via `Intl.DateTimeFormat`.
 *   3. Fallback: "Africa/Kampala".
 */
export function TimezoneProvider({ userTimezone, children }: TimezoneProviderProps) {
  const [timezone, setTimezoneState] = useState<string>(userTimezone || 'Africa/Kampala');

  // On mount (client only), detect browser timezone if no user preference exists
  useEffect(() => {
    if (!userTimezone) {
      const detected = getClientTimezone();
      if (detected) setTimezoneState(detected);
    }
  }, [userTimezone]);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(tz);
  }, []);

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
}

/**
 * Hook to access the current timezone.
 * Must be used within a `<TimezoneProvider>`.
 */
export function useTimezone(): TimezoneContextValue {
  return useContext(TimezoneContext);
}
