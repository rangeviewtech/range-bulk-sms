/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { Globe, ChevronDown, CheckCircle2, Phone, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CarrierBadge,
  getPhoneCarrierInfo,
} from '@/components/sms/carrier-badge';
import {
  getPhoneCountry,
} from '@/components/sms/country-flag-phone';
import {
  analyzePhone,
} from '@/lib/sms/phone-analyzer';
import {
  handlePhoneInputKeyDown,
  extractValidCountryCode,
} from '@/lib/sms/normalizer';
import {
  getAllSupportedRegions,
  getRegionByAlpha2,
  getRegionsByDialCode,
  searchRegions,
  RegionRecord,
} from '@/lib/sms/country-registry';
import {
  detectDeviceCountrySync,
  fetchDeviceCountry,
} from '@/lib/sms/device-country';

export interface SinglePhoneInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  defaultRegion?: string;
  showDetails?: boolean;
  'aria-describedby'?: string;
}

/**
 * Format sample national digits into readable grouped format
 * e.g. "712345678" -> "700 123 456"
 */
function getNationalSample(region: RegionRecord): string {
  if (region.alpha2 === 'UG') {
    return '700 123 456';
  }
  const cleanSample = (region.sampleE164 || '').replace(region.dialCode, '').replace(/\D/g, '');
  if (!cleanSample) return '700 123 456';

  if (cleanSample.length === 9) {
    return `${cleanSample.slice(0, 3)} ${cleanSample.slice(3, 6)} ${cleanSample.slice(6)}`;
  }
  if (cleanSample.length === 10) {
    return `${cleanSample.slice(0, 3)} ${cleanSample.slice(3, 6)} ${cleanSample.slice(6)}`;
  }
  if (cleanSample.length === 8) {
    return `${cleanSample.slice(0, 4)} ${cleanSample.slice(4)}`;
  }
  return cleanSample;
}

export const SinglePhoneInput = React.forwardRef<HTMLInputElement, SinglePhoneInputProps>(
  (
    {
      id,
      name,
      value = '',
      onChange,
      onBlur,
      placeholder,
      error = false,
      disabled = false,
      required = false,
      autoFocus = false,
      className,
      defaultRegion = 'UG',
      showDetails = true,
      'aria-describedby': ariaDescribedBy,
    },
    ref
  ) => {
    // 1. Resolve initial country from device detection
    const [selectedAlpha2, setSelectedAlpha2] = React.useState<string>(() => {
      // If value already has a country code, detect it
      if (value.trim()) {
        const detectedCode = extractValidCountryCode(value.trim());
        if (detectedCode) {
          const match = getRegionsByDialCode(detectedCode)[0];
          if (match) return match.alpha2;
        }
      }
      return detectDeviceCountrySync(defaultRegion);
    });

    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [flagError, setFlagError] = React.useState(false);
    const [displayNumber, setDisplayNumber] = React.useState('');

    const hasUserSelectedRef = React.useRef(false);

    // Fetch IP-based location asynchronously once on mount to refine initial region
    React.useEffect(() => {
      let isMounted = true;
      fetchDeviceCountry(defaultRegion).then((detected) => {
        if (!isMounted || hasUserSelectedRef.current) return;
        // Only update if value is empty and user hasn't manually picked a country
        if (!value.trim() && detected) {
          setSelectedAlpha2(detected);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [defaultRegion, value]);

    // Active region record
    const activeRegion = React.useMemo(() => {
      return getRegionByAlpha2(selectedAlpha2) || getRegionByAlpha2('UG') || getAllSupportedRegions()[0];
    }, [selectedAlpha2]);

    // Synchronize local display number when external value changes
    React.useEffect(() => {
      setFlagError(false);
      const trimmed = value.trim();

      if (!trimmed) {
        setDisplayNumber('');
        return;
      }

      // Check if value starts with a known international calling code
      const detectedCode = extractValidCountryCode(trimmed);
      if (detectedCode && trimmed.startsWith(detectedCode)) {
        const matchingRegions = getRegionsByDialCode(detectedCode);
        if (matchingRegions.length > 0) {
          // If current region doesn't match this dial code, switch active region
          if (activeRegion.dialCode !== detectedCode) {
            setSelectedAlpha2(matchingRegions[0].alpha2);
          }
          const national = trimmed.slice(detectedCode.length);
          setDisplayNumber(national);
          return;
        }
      }

      // If value starts with 0 (domestic format in Uganda/East Africa)
      if (trimmed.startsWith('0')) {
        setDisplayNumber(trimmed);
        return;
      }

      // Fallback: stripped of active dialCode if present
      if (trimmed.startsWith(activeRegion.dialCode)) {
        setDisplayNumber(trimmed.slice(activeRegion.dialCode.length));
      } else {
        setDisplayNumber(trimmed);
      }
    }, [value, activeRegion.dialCode]);

    // Analyze phone number dynamically
    const analysis = React.useMemo(() => {
      if (!value.trim()) return null;
      return analyzePhone(value.trim(), { defaultRegion: activeRegion.alpha2 });
    }, [value, activeRegion.alpha2]);

    const countryMeta = React.useMemo(() => {
      return getPhoneCountry(value, activeRegion.alpha2);
    }, [value, activeRegion.alpha2]);

    const carrierInfo = React.useMemo(() => {
      if (!value.trim()) return null;
      return getPhoneCarrierInfo(value, activeRegion.alpha2);
    }, [value, activeRegion.alpha2]);

    const isValid = analysis?.validity === 'valid_pattern';
    const isComplete = value.trim().length >= 9;

    // Filter regions in dropdown
    const filteredRegions = React.useMemo(() => {
      if (!searchQuery.trim()) {
        return getAllSupportedRegions();
      }
      return searchRegions(searchQuery.trim());
    }, [searchQuery]);

    // Handle user selecting a country from the dropdown
    const handleSelectCountry = (region: RegionRecord) => {
      hasUserSelectedRef.current = true;
      setSelectedAlpha2(region.alpha2);
      setDropdownOpen(false);
      setSearchQuery('');

      // If there's an existing national number, re-normalize with the new dial code
      const cleanDigits = displayNumber.replace(/^0/, '').replace(/\D/g, '');
      if (cleanDigits) {
        onChange(`${region.dialCode}${cleanDigits}`);
      } else if (value.trim()) {
        onChange(region.dialCode);
      }
    };

    // Handle national number input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Handle copy-pasting an international number starting with +
      if (raw.startsWith('+')) {
        const detectedCode = extractValidCountryCode(raw);
        if (detectedCode) {
          const matchingRegions = getRegionsByDialCode(detectedCode);
          if (matchingRegions.length > 0) {
            setSelectedAlpha2(matchingRegions[0].alpha2);
            const national = raw.slice(detectedCode.length).replace(/\D/g, '');
            setDisplayNumber(national);
            onChange(`${detectedCode}${national}`);
            return;
          }
        }
      }

      // Regular national input: allow digits and spaces
      const cleaned = raw.replace(/[^\d\s]/g, '');
      setDisplayNumber(cleaned);

      const digitsOnly = cleaned.replace(/\D/g, '');
      if (!digitsOnly) {
        onChange('');
        return;
      }

      // If typed with leading domestic zero (e.g. 0700123456)
      const nationalDigits = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
      onChange(`${activeRegion.dialCode}${nationalDigits}`);
    };

    // Derive placeholder to show only the rest of the phone number
    const resolvedPlaceholder = React.useMemo(() => {
      if (placeholder && !placeholder.includes('+') && !placeholder.includes('0700')) {
        return placeholder;
      }
      return `e.g. ${getNationalSample(activeRegion)}`;
    }, [placeholder, activeRegion]);

    return (
      <div className="space-y-1.5 w-full">
        {/* Input with Country Selection Dropdown embedded */}
        <div className="relative flex items-center">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                className={cn(
                  'absolute left-1 z-10 h-8 px-2 py-0 gap-1.5 rounded-md text-xs font-medium border-r border-border/50 hover:bg-muted/80 shrink-0 text-muted-foreground hover:text-foreground transition-colors'
                )}
                title={`Country: ${activeRegion.name} (${activeRegion.dialCode})`}
                aria-label={`Select country code. Current: ${activeRegion.name} ${activeRegion.dialCode}`}
              >
                {!flagError ? (
                  <img
                    src={`https://flagcdn.com/20x15/${activeRegion.alpha2.toLowerCase()}.png`}
                    alt={activeRegion.name}
                    className="h-3 w-4 min-w-4 object-cover rounded-[1.5px] shadow-2xs border border-border/40 pointer-events-none"
                    onError={() => setFlagError(true)}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {activeRegion.dialCode}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground/70 shrink-0" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              sideOffset={6}
              className="w-72 sm:w-80 p-1.5 rounded-xl border bg-popover text-popover-foreground shadow-xl z-[150]"
            >
              {/* Search Header - Matching language-toggle.tsx */}
              <div className="relative px-1 pt-1 pb-2">
                <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search country or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-muted/60 py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-[#04648C] dark:focus:ring-[#FBCA07] focus:bg-muted transition-all"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>

              {/* Country Selection List */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scroll">
                {filteredRegions.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    No countries found
                  </div>
                ) : (
                  filteredRegions.map((region) => {
                    const isSelected = region.alpha2 === activeRegion.alpha2;
                    return (
                      <DropdownMenuItem
                        key={`${region.alpha2}-${region.id}`}
                        onClick={() => handleSelectCountry(region)}
                        className={cn(
                          'flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground',
                          isSelected && 'bg-primary/10 font-medium'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={`https://flagcdn.com/20x15/${region.alpha2.toLowerCase()}.png`}
                            alt={region.name}
                            loading="lazy"
                            className="h-3 w-4 rounded-[2px] object-cover shadow-2xs border border-border/40 shrink-0"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="flex flex-col text-left min-w-0">
                            <span
                              className={cn(
                                'truncate',
                                isSelected ? 'text-[#04648C] dark:text-[#FBCA07] font-semibold' : 'text-foreground'
                              )}
                            >
                              {region.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {region.alpha2} • {region.dialCode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {region.dialCode}
                          </span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-[#04648C] dark:text-[#FBCA07]" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* National Phone Number Input */}
          <Input
            ref={ref}
            id={id}
            name={name}
            type="tel"
            value={displayNumber}
            onChange={handleInputChange}
            onKeyDown={(e) => handlePhoneInputKeyDown(e, false)}
            onBlur={onBlur}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            aria-describedby={ariaDescribedBy}
            className={cn(
              'pl-22 pr-8 h-10 font-mono text-sm transition-all',
              isValid && 'border-emerald-500/50 focus-visible:ring-emerald-500/30',
              error && 'border-destructive focus-visible:ring-destructive/30',
              className
            )}
          />

          {/* Validation Status Indicator Icon */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            {isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in fade-in zoom-in-75 duration-200" />
            ) : isComplete && error ? (
              <Phone className="w-4 h-4 text-destructive/70" />
            ) : null}
          </div>
        </div>

        {/* Real-Time Telecom Carrier Route & Allocation Detection Details */}
        {showDetails && value.trim().length > 3 && (
          <div className="pt-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-muted-foreground">
                Detected Network:
              </span>
              <CarrierBadge phone={value} defaultRegion={activeRegion.alpha2} showIcon={false} size="sm" />

              {/* Country Name Pill */}
              {countryMeta?.name && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground bg-muted/30">
                  {countryMeta.name}
                </Badge>
              )}

              {/* Line Type Pill */}
              {analysis?.line_type && analysis.line_type !== 'UNKNOWN' && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5 font-mono text-muted-foreground border-border/70"
                >
                  {analysis.line_type.replace(/_/g, ' ')}
                </Badge>
              )}

              {/* Validation Pattern Indicator */}
              {isValid ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 ml-auto">
                  <CheckCircle2 className="w-3 h-3" />
                  Valid E.164
                </span>
              ) : isComplete ? (
                <span className="text-[11px] text-muted-foreground italic ml-auto">
                  Verifying pattern...
                </span>
              ) : null}
            </div>

            {/* Regulatory Number Portability Disclaimer */}
            {carrierInfo?.isValid && (
              <p className="text-[10px] text-muted-foreground/80 italic">
                * Originally allocated network (may differ from current network due to number portability).
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

SinglePhoneInput.displayName = 'SinglePhoneInput';
