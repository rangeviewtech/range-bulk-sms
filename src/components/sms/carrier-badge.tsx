'use client';

import * as React from 'react';
import { Radio, Signal, Globe, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzePhone } from '@/lib/sms/phone-analyzer';
import { Badge } from '@/components/ui/badge';

export interface PhoneCarrierInfo {
  brand: string;
  operator: string;
  countryName: string;
  iso2: string;
  isValid: boolean;
  error?: string;
}

const carrierCache = new Map<string, PhoneCarrierInfo>();

/**
 * Extracts normalized carrier and operator information from a telephone number.
 * Uses an in-memory cache for ultra-fast table rendering.
 */
export function getPhoneCarrierInfo(
  rawPhone: string,
  defaultRegion: string = 'UG'
): PhoneCarrierInfo {
  const trimmed = (rawPhone || '').trim();
  if (!trimmed) {
    return {
      brand: 'Unknown',
      operator: 'Unknown Network',
      countryName: 'Unknown',
      iso2: '',
      isValid: false,
      error: 'Empty phone number',
    };
  }

  const cacheKey = `${trimmed}:${defaultRegion}`;
  if (carrierCache.has(cacheKey)) {
    return carrierCache.get(cacheKey)!;
  }

  try {
    const res = analyzePhone(trimmed, { defaultRegion });
    const brand =
      res.original_allocation?.retailBrand ||
      res.metadata_carrier ||
      (res.country ? res.country.name : 'Unknown');

    const operator =
      res.original_allocation?.operator ||
      brand ||
      'Unknown Network';

    const info: PhoneCarrierInfo = {
      brand,
      operator,
      countryName: res.country?.name || 'International',
      iso2: res.country?.iso2?.toLowerCase() || '',
      isValid: res.validity === 'valid_pattern',
      error: res.error,
    };

    carrierCache.set(cacheKey, info);
    return info;
  } catch {
    const fallback: PhoneCarrierInfo = {
      brand: 'Unknown',
      operator: 'Unknown Network',
      countryName: 'Unknown',
      iso2: '',
      isValid: false,
      error: 'Invalid format',
    };
    carrierCache.set(cacheKey, fallback);
    return fallback;
  }
}

export interface CarrierBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  phone?: string;
  brand?: string;
  network?: string;
  defaultRegion?: string;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

/**
 * Brand-tailored visual design tokens and iconography matching contacts table.
 */
export function getCarrierBrandStyles(brandName: string): {
  styleClasses: string;
  IconComponent: React.ComponentType<{ className?: string }>;
} {
  const brandLower = (brandName || '').toLowerCase();
  let styleClasses = 'bg-muted/40 text-muted-foreground border-border/80';
  let IconComponent = Globe;

  if (brandLower.includes('mtn')) {
    styleClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    IconComponent = Signal;
  } else if (brandLower.includes('airtel') || brandLower.includes('vodacom')) {
    styleClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    IconComponent = Radio;
  } else if (brandLower.includes('safaricom') || brandLower.includes('glo')) {
    styleClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    IconComponent = Signal;
  } else if (
    brandLower.includes('tigo') ||
    brandLower.includes('telkom') ||
    brandLower.includes('utcl') ||
    brandLower.includes('lycamobile') ||
    brandLower.includes('9mobile')
  ) {
    styleClasses = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    IconComponent = Radio;
  }

  return { styleClasses, IconComponent };
}

export interface NetworkBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  network: string;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

/**
 * Visual badge displaying a telecom operator network directly (e.g. MTN, Airtel, Safaricom)
 * with identical brand colors, typography, and borders as the contacts table.
 */
export function NetworkBadge({
  network,
  showIcon = false,
  size = 'sm',
  className,
  title,
  ...props
}: NetworkBadgeProps) {
  const { styleClasses, IconComponent } = getCarrierBrandStyles(network);

  const sizeClass = {
    xs: showIcon ? 'text-[10px] px-1.5 py-0 h-4 gap-1' : 'text-[10px] px-2 py-0 h-4',
    sm: showIcon ? 'text-[11px] px-2 py-0.5 h-5 gap-1.5' : 'text-[11px] px-2.5 py-0.5 h-5',
    md: showIcon ? 'text-xs px-2.5 py-1 h-6 gap-2' : 'text-xs px-3 py-0.5 h-6',
  }[size];

  return (
    <div
      className={cn('inline-flex items-center font-medium', className)}
      title={title || `${network} Network`}
      {...props}
    >
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center justify-center font-semibold tracking-tight rounded-md transition-colors shadow-2xs',
          sizeClass,
          styleClasses
        )}
      >
        {showIcon && <IconComponent className="w-3 h-3 shrink-0" />}
        <span className="truncate max-w-[130px]">{network}</span>
      </Badge>
    </div>
  );
}

/**
 * Visual badge displaying the detected telecom operator and carrier network
 * for a telephone number with brand-specific visual tokens.
 */
export function CarrierBadge({
  phone,
  brand: explicitBrand,
  network: explicitNetwork,
  defaultRegion = 'UG',
  showIcon = false,
  size = 'sm',
  className,
  ...props
}: CarrierBadgeProps) {
  const info = React.useMemo(() => {
    const directBrand = explicitBrand || explicitNetwork;
    if (directBrand) {
      return {
        brand: directBrand,
        operator: directBrand,
        countryName: '',
        iso2: '',
        isValid: true,
      };
    }
    return getPhoneCarrierInfo(phone || '', defaultRegion);
  }, [phone, explicitBrand, explicitNetwork, defaultRegion]);

  const { styleClasses, IconComponent: BrandIcon } = getCarrierBrandStyles(info.brand);

  let style = styleClasses;
  let Icon = BrandIcon;
  if (!info.isValid) {
    style = 'bg-destructive/10 text-destructive border-destructive/30';
    Icon = AlertCircle;
  }

  const sizeClass = {
    xs: showIcon ? 'text-[10px] px-1.5 py-0 h-4 gap-1' : 'text-[10px] px-2 py-0 h-4',
    sm: showIcon ? 'text-[11px] px-2 py-0.5 h-5 gap-1.5' : 'text-[11px] px-2.5 py-0.5 h-5',
    md: showIcon ? 'text-xs px-2.5 py-1 h-6 gap-2' : 'text-xs px-3 py-0.5 h-6',
  }[size];

  return (
    <div
      className={cn('inline-flex items-center font-medium', className)}
      title={
        info.operator
          ? `${info.operator}${info.countryName ? ` (${info.countryName})` : ''}`
          : info.brand
      }
      {...props}
    >
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center justify-center font-semibold tracking-tight rounded-md transition-colors shadow-2xs',
          sizeClass,
          style
        )}
      >
        {showIcon && <Icon className="w-3 h-3 shrink-0" />}
        <span className="truncate max-w-[130px]">{info.brand}</span>
      </Badge>
    </div>
  );
}
