/**
 * Device Country & Geolocation Detection Engine
 * 
 * Accurately resolves the user's current machine country using multi-tier heuristics:
 * 1. Cached session detection
 * 2. Instantaneous local machine IANA Timezone resolution (0ms, offline-capable)
 * 3. Client navigator locale resolution (e.g. en-UG -> UG)
 * 4. Asynchronous IP geolocation check via /api/geo/detect
 * 5. Default fallback to primary East Africa hub ('UG' - Uganda)
 */

import { getRegionByAlpha2 } from './country-registry';

// Timezone to ISO 3166-1 alpha-2 mapping
export const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // East Africa
  'Africa/Kampala': 'UG',
  'Africa/Nairobi': 'KE',
  'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Kigali': 'RW',
  'Africa/Bujumbura': 'BI',
  'Africa/Juba': 'SS',
  'Africa/Addis_Ababa': 'ET',
  'Africa/Mogadishu': 'SO',
  'Africa/Djibouti': 'DJ',
  'Africa/Asmara': 'ER',

  // West & Central Africa
  'Africa/Lagos': 'NG',
  'Africa/Accra': 'GH',
  'Africa/Abidjan': 'CI',
  'Africa/Dakar': 'SN',
  'Africa/Kinshasa': 'CD',
  'Africa/Lubumbashi': 'CD',
  'Africa/Douala': 'CM',
  'Africa/Luanda': 'AO',

  // Southern Africa
  'Africa/Johannesburg': 'ZA',
  'Africa/Harare': 'ZW',
  'Africa/Lusaka': 'ZM',
  'Africa/Gaborone': 'BW',
  'Africa/Windhoek': 'NA',
  'Africa/Maputo': 'MZ',

  // North Africa & Middle East
  'Africa/Cairo': 'EG',
  'Africa/Casablanca': 'MA',
  'Africa/Tunis': 'TN',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'Asia/Amman': 'JO',
  'Asia/Beirut': 'LB',

  // Americas
  'America/New_York': 'US',
  'America/Detroit': 'US',
  'America/Kentucky/Louisville': 'US',
  'America/Indiana/Indianapolis': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Los_Angeles': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'America/Mexico_City': 'MX',
  'America/Cancun': 'MX',
  'America/Sao_Paulo': 'BR',
  'America/Buenos_Aires': 'AR',
  'America/Bogota': 'CO',
  'America/Lima': 'PE',
  'America/Santiago': 'CL',

  // Europe
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Helsinki': 'FI',
  'Europe/Copenhagen': 'DK',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO',
  'Europe/Athens': 'GR',
  'Europe/Lisbon': 'PT',
  'Europe/Kyiv': 'UA',

  // Asia & Oceania
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Dhaka': 'BD',
  'Asia/Karachi': 'PK',
  'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP',
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Jakarta': 'ID',
  'Asia/Bangkok': 'TH',
  'Asia/Manila': 'PH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Hong_Kong': 'HK',
  'Asia/Taipei': 'TW',
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Shanghai': 'CN',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU',
  'Pacific/Auckland': 'NZ',
};

const SESSION_STORAGE_KEY = 'range_device_country';

/**
 * Synchronously detects the user's machine country from local device context (0ms latency).
 */
export function detectDeviceCountrySync(defaultFallback: string = 'UG'): string {
  if (typeof window === 'undefined') {
    return defaultFallback;
  }

  // 1. Check Session Storage cache
  try {
    const cached = window.sessionStorage?.getItem(SESSION_STORAGE_KEY);
    if (cached && getRegionByAlpha2(cached)) {
      return cached.toUpperCase();
    }
  } catch {}

  // 2. Check IANA Timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      const country = TIMEZONE_TO_COUNTRY[tz];
      if (getRegionByAlpha2(country)) {
        return country;
      }
    }
  } catch {}

  // 3. Check Navigator Language/Locale (e.g. 'en-UG', 'sw-KE', 'en-US')
  try {
    const locale = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    if (locale.includes('-')) {
      const candidate = locale.split('-')[1]?.toUpperCase();
      if (candidate && candidate.length === 2 && getRegionByAlpha2(candidate)) {
        return candidate;
      }
    }
  } catch {}

  return defaultFallback;
}

/**
 * Asynchronously refines device country using server-side IP geolocation lookup.
 * Updates sessionStorage cache upon resolution.
 */
export async function fetchDeviceCountry(defaultFallback: string = 'UG'): Promise<string> {
  if (typeof window === 'undefined') {
    return defaultFallback;
  }

  // Check cache first
  try {
    const cached = window.sessionStorage?.getItem(SESSION_STORAGE_KEY);
    if (cached && getRegionByAlpha2(cached)) {
      return cached.toUpperCase();
    }
  } catch {}

  // Fast fetch from internal geolocation endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('/api/geo/detect', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.country && typeof data.country === 'string' && getRegionByAlpha2(data.country)) {
        const detected = data.country.toUpperCase();
        try {
          window.sessionStorage?.setItem(SESSION_STORAGE_KEY, detected);
        } catch {}
        return detected;
      }
    }
  } catch {}

  // Fallback to sync detection
  return detectDeviceCountrySync(defaultFallback);
}
