/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzePhone } from '@/lib/sms/phone-analyzer';

export interface PhoneCountryMeta {
  iso2: string;
  name: string;
  callingCode?: string;
}

export interface CountryFlagPhoneProps extends React.HTMLAttributes<HTMLDivElement> {
  phone: string;
  defaultRegion?: string;
  flagSize?: 'xs' | 'sm' | 'md' | 'lg';
  showPhoneIcon?: boolean;
  showPhoneIconFallback?: boolean;
  asLink?: boolean;
}

const phoneCountryCache = new Map<string, PhoneCountryMeta | null>();

/**
 * Resolves country metadata (ISO2, country name, calling code) from a raw phone number.
 * Uses an in-memory cache to guarantee sub-millisecond lookups.
 */
export function getPhoneCountry(
  rawPhone: string,
  defaultRegion: string = 'UG'
): PhoneCountryMeta | null {
  const trimmed = (rawPhone || '').trim();
  if (!trimmed) return null;

  const cacheKey = `${trimmed}:${defaultRegion}`;
  if (phoneCountryCache.has(cacheKey)) {
    return phoneCountryCache.get(cacheKey) || null;
  }

  try {
    const res = analyzePhone(trimmed, { defaultRegion });
    if (res.country?.iso2) {
      const data: PhoneCountryMeta = {
        iso2: res.country.iso2.toLowerCase(),
        name: res.country.name,
        callingCode: res.country.calling_code,
      };
      phoneCountryCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Graceful fallback on malformed input
  }

  phoneCountryCache.set(cacheKey, null);
  return null;
}

/**
 * Displays a telephone number accompanied by its official country flag and phone icon.
 * Features clickable tel: RFC-3966 links for one-tap calling and softphone integration.
 */
export function CountryFlagPhone({
  phone,
  defaultRegion = 'UG',
  flagSize = 'sm',
  showPhoneIcon = true,
  showPhoneIconFallback = true,
  asLink = true,
  className,
  ...props
}: CountryFlagPhoneProps) {
  const [imgError, setImgError] = React.useState(false);
  const country = React.useMemo(() => getPhoneCountry(phone, defaultRegion), [phone, defaultRegion]);

  const cleanPhone = React.useMemo(() => phone.replace(/[\s\(\)\-]/g, ''), [phone]);
  const telHref = `tel:${cleanPhone}`;

  const sizeClasses = {
    xs: 'h-2.5 w-3.5 min-w-3.5 rounded-[1px]',
    sm: 'h-3 w-4 min-w-4 rounded-[1.5px]',
    md: 'h-3.5 w-5 min-w-5 rounded-[2px]',
    lg: 'h-4 w-5.5 min-w-5.5 rounded-[2px]',
  }[flagSize];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap group',
        className
      )}
      {...props}
    >
      {country?.iso2 && !imgError ? (
        <img
          src={`https://flagcdn.com/24x18/${country.iso2}.png`}
          alt={country.name}
          title={`${country.name} (${country.callingCode || ''})`}
          onError={() => setImgError(true)}
          className={cn(
            'object-cover shrink-0 pointer-events-none shadow-2xs border border-border/40',
            sizeClasses
          )}
          loading="lazy"
        />
      ) : showPhoneIconFallback && !showPhoneIcon ? (
        <Phone className="w-3 h-3 text-muted-foreground/70 shrink-0" />
      ) : null}

      {showPhoneIcon && (
        <Phone className="w-3 h-3 text-muted-foreground/70 shrink-0" />
      )}

      {asLink ? (
        <a
          href={telHref}
          title={`Call ${phone}`}
          aria-label={`Call ${phone}`}
          className="hover:underline hover:text-primary transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {phone}
        </a>
      ) : (
        <span>{phone}</span>
      )}
    </div>
  );
}
