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

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const defaultLanguages: Language[] = [
  { code: 'EN', name: 'English', flag: 'gb' },
  { code: 'DE', name: 'German', flag: 'de' },
  { code: 'ES', name: 'Spanish', flag: 'es' },
  { code: 'AE', name: 'Arabic', flag: 'sa' },
  { code: 'FR', name: 'French', flag: 'fr' },
  { code: 'FA', name: 'Persian', flag: 'ir' },
  { code: 'SQ', name: 'Albanian', flag: 'al' },
  { code: 'TH', name: 'Thai', flag: 'th' },
  { code: 'HE', name: 'Hebrew', flag: 'il' },
  { code: 'RU', name: 'Russian', flag: 'ru' },
  { code: 'PT', name: 'Portuguese', flag: 'pt' },
  { code: 'JA', name: 'Japanese', flag: 'jp' },
  { code: 'KO', name: 'Korean', flag: 'kr' },
  { code: 'ZH', name: 'Chinese', flag: 'cn' },
  { code: 'MN', name: 'Mongolian', flag: 'mn' },
  { code: 'NE', name: 'Nepali', flag: 'np' },
  { code: 'HI', name: 'Hindi', flag: 'in' },
  { code: 'IT', name: 'Italian', flag: 'it' },
  { code: 'MY', name: 'Burmese', flag: 'mm' },
  { code: 'TR', name: 'Turkish', flag: 'tr' },
  { code: 'SR', name: 'Serbian', flag: 'rs' },
  { code: 'HU', name: 'Hungarian', flag: 'hu' },
  { code: 'PL', name: 'Polish', flag: 'pl' },
  { code: 'DU', name: 'Dutch', flag: 'nl' },
  { code: 'TE', name: 'Telugu', flag: 'in' },
  { code: 'KM', name: 'Cambodian', flag: 'kh' },
  { code: 'IN', name: 'Indonesian', flag: 'id' },
  { code: 'GJ', name: 'Gujarati', flag: 'in' },
  { code: 'BN', name: 'Bengali', flag: 'bd' },
  { code: 'MR', name: 'Marathi', flag: 'in' },
  { code: 'KN', name: 'Kannada', flag: 'in' },
  { code: 'EL', name: 'Greek', flag: 'gr' },
  { code: 'BR', name: 'Portuguese Brazil', flag: 'br' },
  { code: 'CZ', name: 'Czech', flag: 'cz' },
  { code: 'MS', name: 'Malay', flag: 'my' },
  { code: 'TA', name: 'Tamil', flag: 'in' },
  { code: 'ML', name: 'Malayalam', flag: 'in' },
  { code: 'UR', name: 'Urdu', flag: 'pk' },
  { code: 'BS', name: 'Bosnian', flag: 'ba' },
  { code: 'HR', name: 'Croatian', flag: 'hr' },
  { code: 'GR', name: 'Greek Athens', flag: 'gr' },
  { code: 'AO', name: 'Portuguese AO', flag: 'ao' },
  { code: 'KU', name: 'Kurdish', flag: 'iq' },
  { code: 'AM', name: 'Amharic', flag: 'et' },
  { code: 'OM', name: 'Oromo', flag: 'et' },
  { code: 'TI', name: 'Tigrinya', flag: 'er' },
  { code: 'PA', name: 'Punjabi', flag: 'in' },
  { code: 'ET', name: 'Estonian', flag: 'ee' },
];

export function LanguageToggle() {
  const [selectedLang, setSelectedLang] = useState<string>('English');
  const [selectedFlag, setSelectedFlag] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const filtered = defaultLanguages.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
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
          {selectedFlag ? (
            <img
              src={`https://flagcdn.com/20x15/${selectedFlag}.png`}
              alt={selectedLang}
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
        className="w-56 p-1.5 rounded-xl border bg-popover text-popover-foreground shadow-xl"
      >
        {/* Search Header */}
        <div className="relative px-1 pt-1 pb-2">
          <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search language..."
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
              const isSelected = selectedLang === l.name;
              return (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => {
                    setSelectedLang(l.name);
                    setSelectedFlag(l.flag);
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
                    <span className={`font-medium ${isSelected ? 'text-[#29A4FF]' : 'text-foreground'}`}>
                      {l.name}
                    </span>
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
