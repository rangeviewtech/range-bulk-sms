/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Search, Globe, Check, AlertCircle, Phone, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RegionRecord,
  searchRegions,
  ALL_REGIONS,
} from "@/lib/sms/country-registry";

interface CountryPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCountryCode?: string;
  onSelectRegion: (region: RegionRecord) => void;
}

export function CountryPickerDialog({
  open,
  onOpenChange,
  selectedCountryCode,
  onSelectRegion,
}: CountryPickerDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "un" | "territory">("all");

  // Reset search and filter when dialog opens
  React.useEffect(() => {
    if (open) {
      setSearchQuery("");
      setFilterMode("all");
    }
  }, [open]);

  const filteredRegions = React.useMemo(() => {
    return searchRegions(searchQuery, {
      unOnly: filterMode === "un",
      territoryOnly: filterMode === "territory",
    });
  }, [searchQuery, filterMode]);

  const handleSelect = (region: RegionRecord) => {
    if (!region.libphonenumberSupported) return;
    onSelectRegion(region);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl p-0 gap-0 overflow-hidden sm:max-h-[85vh]"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="p-4 pb-2 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Select Country or Numbering Region
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Search 195 sovereign nations and 50 territories by name, ISO code, or dialing code.
              </DialogDescription>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country, ISO (e.g. UG, US, GB), or +CC..."
              className="pl-9 pr-4 h-9 text-sm bg-background"
              autoFocus
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 mt-2 pt-1">
            <Button
              type="button"
              variant={filterMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("all")}
              className="h-7 text-xs px-2.5 rounded-full"
            >
              All ({ALL_REGIONS.length})
            </Button>
            <Button
              type="button"
              variant={filterMode === "un" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("un")}
              className="h-7 text-xs px-2.5 rounded-full"
            >
              Countries (195)
            </Button>
            <Button
              type="button"
              variant={filterMode === "territory" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("territory")}
              className="h-7 text-xs px-2.5 rounded-full"
            >
              Territories (50)
            </Button>
            <span className="ml-auto text-[11px] text-muted-foreground font-mono">
              {filteredRegions.length} matches
            </span>
          </div>
        </DialogHeader>

        {/* Region List */}
        <div className="overflow-y-auto max-h-[50vh] p-2 space-y-1 divide-y divide-border/40">
          {filteredRegions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 stroke-1 text-muted-foreground/60" />
              <p className="text-sm font-medium">No countries or territories found</p>
              <p className="text-xs text-muted-foreground">Try a different name, dial code, or clear the search filter.</p>
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
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? "bg-primary/10 border border-primary/20 text-primary font-medium"
                      : "hover:bg-muted/60 text-foreground"
                  } ${!region.libphonenumberSupported ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Country Flag copied from language-toggle */}
                    <div className="relative flex items-center justify-center shrink-0 w-6 h-4.5 rounded-[2px] overflow-hidden bg-muted border border-border/50 shadow-xs">
                      <img
                        src={`https://flagcdn.com/24x18/${region.alpha2.toLowerCase()}.png`}
                        alt={region.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <span
                        style={{ display: "none" }}
                        className="w-full h-full items-center justify-center text-[9px] font-mono font-bold text-muted-foreground uppercase bg-muted"
                      >
                        {region.alpha2}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm truncate font-medium">{region.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground font-semibold px-1 py-0.5 rounded bg-muted/60 border border-border/40 shrink-0">
                          {region.alpha2}
                        </span>
                        {region.isTerritory && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-muted-foreground">
                            Territory
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {region.dialCode || "N/A"}
                        </span>
                        {region.sampleE164 && (
                          <span className="text-[11px] text-muted-foreground/80 truncate">
                            e.g. {region.sampleE164}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {region.notes && (
                      <span title={region.notes} className="text-muted-foreground/60 hover:text-muted-foreground">
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info strip */}
        <div className="p-2.5 px-4 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            Standard ITU-T E.164 Dialing Directory
          </span>
          <span>Coverage: 245 Global Regions</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CountryPickerDropdown, type CountryPickerDropdownProps } from './country-picker-dropdown';
