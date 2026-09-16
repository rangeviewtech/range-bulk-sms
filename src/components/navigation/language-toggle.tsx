/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useState } from "react";
import { Globe, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/use-language";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, setLanguage, currentLanguageMeta, dict } = useLanguage();
  const [search, setSearch] = useState<string>('');

  const filtered = SUPPORTED_LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.nativeName && l.nativeName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full transition-transform active:scale-95"
          aria-label="Select language"
        >
          {currentLanguageMeta.flag ? (
            <img
              src={`https://flagcdn.com/20x15/${currentLanguageMeta.flag}.png`}
              alt={currentLanguageMeta.name}
              className="h-3.5 w-5 rounded-[2px] object-cover shadow-sm"
            />
          ) : (
            <Globe className="h-[1.2rem] w-[1.2rem] text-foreground" />
          )}
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 p-1.5 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50"
      >
        {/* Search Header */}
        <div className="relative px-1 pt-1 pb-2">
          <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={dict.common.searchPlaceholder || "Search language..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-muted/60 py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-[#29A4FF] focus:bg-muted transition-all"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        {/* Language Options */}
        <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scroll">
          {filtered.length === 0 ? (
            <div className="py-3 text-center text-xs text-muted-foreground">
              No languages found
            </div>
          ) : (
            filtered.map((l) => {
              const isSelected = language === l.code;
              return (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code as LanguageCode);
                  }}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="flex items-center gap-2.5">
                    {l.flag ? (
                      <img
                        src={`https://flagcdn.com/20x15/${l.flag}.png`}
                        alt={l.name}
                        className="h-3 w-4 rounded-[2px] object-cover shadow-sm"
                      />
                    ) : (
                      <span className="h-3 w-4 rounded-[2px] bg-muted inline-block" />
                    )}
                    <div className="flex flex-col text-left">
                      <span className={`font-medium ${isSelected ? 'text-[#29A4FF]' : 'text-foreground'}`}>
                        {l.name}
                      </span>
                      {l.nativeName && l.nativeName !== l.name && (
                        <span className="text-[10px] text-muted-foreground">
                          {l.nativeName}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[#29A4FF]" />}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
