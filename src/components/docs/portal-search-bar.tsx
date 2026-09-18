'use client';

import * as React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { PORTAL_COLORS } from './portal-tokens';

interface PortalSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
}

export function PortalSearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
}: PortalSearchBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="w-full flex flex-col sm:flex-row items-center gap-3 p-1.5 sm:p-2 rounded-2xl border shadow-sm transition-all"
      style={{
        backgroundColor: PORTAL_COLORS.cardBg,
        borderColor: PORTAL_COLORS.border,
      }}
    >
      {/* Search Input */}
      <div className="flex-1 flex items-center gap-3 px-3 w-full">
        <Search
          className="h-4 w-4 shrink-0"
          style={{ color: PORTAL_COLORS.secondaryText }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search endpoints, parameters, or topics..."
          className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground/60"
          style={{ color: PORTAL_COLORS.primaryText }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-xs px-1.5 py-0.5 rounded hover:opacity-80"
            style={{ color: PORTAL_COLORS.secondaryText }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="relative w-full sm:w-auto" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full sm:w-44 flex items-center justify-between gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:opacity-90"
          style={{
            backgroundColor: PORTAL_COLORS.elevatedBg,
            borderColor: PORTAL_COLORS.borderLight,
            color: PORTAL_COLORS.primaryText,
          }}
        >
          <span className="truncate">{selectedCategory}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div
            className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-48 rounded-xl border shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
            style={{
              backgroundColor: PORTAL_COLORS.cardBg,
              borderColor: PORTAL_COLORS.border,
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:opacity-90"
                style={{
                  color: selectedCategory === cat ? PORTAL_COLORS.accentBlue : PORTAL_COLORS.secondaryText,
                  backgroundColor: selectedCategory === cat ? PORTAL_COLORS.elevatedBg : 'transparent',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
