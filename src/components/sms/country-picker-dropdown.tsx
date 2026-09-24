/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { Search, Globe, Check, AlertCircle, Phone, Info, ChevronDown, X } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  RegionRecord,
  searchRegions,
  ALL_REGIONS,
} from '@/lib/sms/country-registry';

export interface CountryPickerDropdownProps {
  onSelectRegion: (region: RegionRecord) => void;
  selectedCountryCode?: string;
  disabled?: boolean;
  className?: string;
}

export function CountryPickerDropdown({
  onSelectRegion,
  selectedCountryCode,
  disabled = false,
  className,
}: CountryPickerDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterMode, setFilterMode] = React.useState<'all' | 'un' | 'territory'>('all');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Focus search input when popover opens and reset search/filter
  React.useEffect(() => {
    if (open) {
      setSearchQuery('');
      setFilterMode('all');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const filteredRegions = React.useMemo(() => {
    return searchRegions(searchQuery, {
      unOnly: filterMode === 'un',
      territoryOnly: filterMode === 'territory',
    });
  }, [searchQuery, filterMode]);

  const unCount = React.useMemo(() => ALL_REGIONS.filter((r) => !r.isTerritory).length, []);
  const territoryCount = React.useMemo(() => ALL_REGIONS.filter((r) => r.isTerritory).length, []);

  const handleSelect = (region: RegionRecord) => {
    if (!region.libphonenumberSupported) return;
    onSelectRegion(region);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            'h-8 px-3 text-xs font-medium gap-1.5 rounded-md transition-all',
            open && 'border-primary/40 bg-muted text-foreground',
            className
          )}
          title="Search and insert country calling code (195 countries & 50 territories)"
          aria-label="Insert country code"
        >
          <Globe className="w-3.5 h-3.5 text-foreground/80" />
          <span>Insert Country Code</span>
          <ChevronDown
            className={cn(
              'w-3 h-3 ml-0.5 opacity-60 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={12}
        className="w-[360px] sm:w-[420px] max-w-[calc(100vw-1.5rem)] p-0 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl z-[120] flex flex-col overflow-hidden"
      >
        {/* Header & Search */}
        <div className="p-3 pb-2 border-b border-border/70 bg-muted/20">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-foreground truncate">
                  Select Country or Region
                </h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  {unCount} countries &amp; {territoryCount} territories by name, ISO, or dial code
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium text-muted-foreground/80 px-1.5 py-0.5 rounded bg-muted border border-border/40 shrink-0">
              ITU-T E.164
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country, ISO (e.g. UG, US, GB), or +CC..."
              className="w-full rounded-lg bg-muted/60 py-1.5 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-[#04648C] dark:focus:ring-[#FBCA07] focus:bg-muted transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-1.5 mt-2 pt-0.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={cn(
                  'h-6 text-[11px] font-medium px-2 rounded-full transition-colors',
                  filterMode === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                All ({ALL_REGIONS.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('un')}
                className={cn(
                  'h-6 text-[11px] font-medium px-2 rounded-full transition-colors',
                  filterMode === 'un'
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                Countries ({unCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('territory')}
                className={cn(
                  'h-6 text-[11px] font-medium px-2 rounded-full transition-colors',
                  filterMode === 'territory'
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                Territories ({territoryCount})
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
              {filteredRegions.length} matches
            </span>
          </div>
        </div>

        {/* Region List */}
        <div className="overflow-y-auto max-h-64 sm:max-h-72 p-1.5 space-y-0.5 divide-y divide-border/20 custom-scroll">
          {filteredRegions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-1.5">
              <AlertCircle className="h-6 w-6 stroke-1 text-muted-foreground/60" />
              <p className="text-xs font-medium">No countries or territories found</p>
              <p className="text-[11px] text-muted-foreground/80">
                Try a different name, dial code, or clear the search filter.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterMode('all');
                }}
                className="mt-1 h-6 text-xs px-2 rounded-md"
              >
                Reset Search
              </Button>
            </div>
          ) : (
            filteredRegions.map((region) => {
              const isSelected = selectedCountryCode === region.dialCode;
              return (
                <button
                  key={`${region.alpha2}-${region.id}`}
                  type="button"
                  onClick={() => handleSelect(region)}
                  disabled={!region.libphonenumberSupported}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2.5 transition-colors group',
                    isSelected
                      ? 'bg-primary/10 border border-primary/20 text-primary font-medium'
                      : 'hover:bg-muted/80 text-foreground',
                    !region.libphonenumberSupported
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Country Flag */}
                    <div className="relative flex items-center justify-center shrink-0 w-5 h-3.5 rounded-[2px] overflow-hidden bg-muted border border-border/50 shadow-2xs">
                      <img
                        src={`https://flagcdn.com/20x15/${region.alpha2.toLowerCase()}.png`}
                        alt={region.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <span
                        style={{ display: 'none' }}
                        className="w-full h-full items-center justify-center text-[8px] font-mono font-bold text-muted-foreground uppercase bg-muted"
                      >
                        {region.alpha2}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                          {region.name}
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground font-semibold px-1 py-0.2 rounded bg-muted/60 border border-border/40 shrink-0">
                          {region.alpha2}
                        </span>
                        {region.isTerritory && (
                          <Badge
                            variant="outline"
                            className="text-[9px] py-0 px-1 font-normal text-muted-foreground"
                          >
                            Territory
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {region.dialCode || 'N/A'}
                        </span>
                        {region.sampleE164 && (
                          <span className="text-[10px] text-muted-foreground/70 font-mono truncate">
                            e.g. {region.sampleE164}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {region.notes && (
                      <span
                        title={region.notes}
                        className="text-muted-foreground/50 hover:text-muted-foreground"
                      >
                        <Info className="h-3 w-3" />
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info strip */}
        <div className="p-2 px-3 bg-muted/40 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Phone className="h-2.5 w-2.5" />
            Standard ITU-T E.164 Directory
          </span>
          <span>Coverage: 245 Global Regions</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
