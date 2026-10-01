/**
 * Timezone-aware date/time formatting utilities.
 *
 * Strategy:
 * - Database stores ALL DateTime values in UTC (PostgreSQL / Prisma default).
 * - The User model has a `timezone` field (IANA identifier, e.g. "Africa/Kampala").
 * - On the client, we detect the browser timezone via `Intl.DateTimeFormat`.
 * - All display functions accept an optional `timeZone` parameter.
 * - When no `timeZone` is provided, we fall back to the browser's detected timezone.
 *
 * This means every timestamp the user sees is displayed in their own timezone.
 */

// ---------------------------------------------------------------------------
// Browser timezone detection (client-side only, safe for SSR)
// ---------------------------------------------------------------------------

let _detectedTimezone: string | null = null;

/**
 * Returns the IANA timezone identifier detected from the user's browser.
 * Falls back to "Africa/Kampala" (EAT, UTC+3) if detection fails.
 * Safe to call during SSR — returns the fallback on the server.
 */
export function getClientTimezone(): string {
  if (_detectedTimezone) return _detectedTimezone;
  try {
    _detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    _detectedTimezone = 'Africa/Kampala';
  }
  return _detectedTimezone;
}

// ---------------------------------------------------------------------------
// Core formatting helpers using Intl.DateTimeFormat
// ---------------------------------------------------------------------------

/**
 * Format a UTC date to a locale-aware string in a specific timezone.
 *
 * @param date  - Any date-like value (ISO string, Date, epoch ms).
 * @param options - Intl.DateTimeFormat options.
 * @param timeZone - IANA timezone identifier (default: client browser timezone).
 * @param locale - BCP 47 locale string (default: "en-UG" for Uganda).
 */
export function formatInTimezone(
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions,
  timeZone?: string,
  locale: string = 'en-UG',
): string {
  const tz = timeZone || getClientTimezone();
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: tz }).format(d);
}

// ---------------------------------------------------------------------------
// Pre-built format functions (drop-in replacements for src/utils/date.ts)
// ---------------------------------------------------------------------------

/** "Sep 29, 2026" */
export function formatDateTz(date: Date | number | string, timeZone?: string): string {
  return formatInTimezone(date, { year: 'numeric', month: 'short', day: '2-digit' }, timeZone);
}

/** "Sep 29, 2026 14:33" */
export function formatDateTimeTz(date: Date | number | string, timeZone?: string): string {
  return formatInTimezone(
    date,
    { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false },
    timeZone,
  );
}

/** "Sep 29, 2026 02:33 PM" */
export function formatDateTimeTz12h(date: Date | number | string, timeZone?: string): string {
  return formatInTimezone(
    date,
    { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true },
    timeZone,
  );
}

/** "14:33" (24h) */
export function formatTimeTz(date: Date | number | string, timeZone?: string): string {
  return formatInTimezone(date, { hour: '2-digit', minute: '2-digit', hour12: false }, timeZone);
}

/** "2:33 PM" (12h) */
export function formatTimeTz12h(date: Date | number | string, timeZone?: string): string {
  return formatInTimezone(date, { hour: '2-digit', minute: '2-digit', hour12: true }, timeZone);
}

/** "Monday, September 29, 2026" */
export function formatFullDateTz(date: Date | number | string, timeZone?: string): string {
  return formatInTimezone(date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, timeZone);
}

/** "EAT" or "GMT+3" — the abbreviation for the timezone */
export function getTimezoneAbbreviation(timeZone?: string): string {
  const tz = timeZone || getClientTimezone();
  try {
    const parts = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart?.value ?? tz;
  } catch {
    return tz;
  }
}

/** "Africa/Kampala (EAT, UTC+3)" — human-readable label for settings UI */
export function getTimezoneLabel(tz: string): string {
  try {
    const now = new Date();
    const short = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(now)
      .find((p) => p.type === 'timeZoneName')?.value ?? '';
    const offsetMs = getTimezoneOffsetMs(tz);
    const offsetHours = Math.round(offsetMs / 3_600_000);
    const sign = offsetHours >= 0 ? '+' : '';
    return `${tz} (${short}, UTC${sign}${offsetHours})`;
  } catch {
    return tz;
  }
}

/** Returns the offset in ms from UTC for the given timezone at the current moment. */
function getTimezoneOffsetMs(tz: string): number {
  const now = new Date();
  const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = now.toLocaleString('en-US', { timeZone: tz });
  return new Date(tzStr).getTime() - new Date(utcStr).getTime();
}

// ---------------------------------------------------------------------------
// Common timezone list for settings dropdown
// ---------------------------------------------------------------------------

export const COMMON_TIMEZONES: string[] = [
  'Africa/Kampala',
  'Africa/Nairobi',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Accra',
  'Africa/Dar_es_Salaam',
  'Africa/Kigali',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Buenos_Aires',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Jakarta',
  'Asia/Bangkok',
  'Asia/Karachi',
  'Asia/Riyadh',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Europe/Amsterdam',
  'Europe/Rome',
  'Europe/Madrid',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'Pacific/Honolulu',
  'UTC',
];
