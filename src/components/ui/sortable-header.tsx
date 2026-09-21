'use client';

import * as React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SortableHeaderProps {
  column: string;
  label: React.ReactNode;
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
  onSort: (column: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SortableHeader({
  column,
  label,
  currentSort,
  currentOrder = 'asc',
  onSort,
  align = 'left',
  className,
}: SortableHeaderProps) {
  const isSorted = currentSort === column;

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn(
        'group inline-flex items-center gap-1.5 font-semibold transition-colors select-none text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm',
        align === 'right' && 'justify-end w-full text-right',
        align === 'center' && 'justify-center w-full text-center',
        align === 'left' && 'justify-start',
        isSorted
          ? 'text-foreground font-bold'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
      aria-pressed={isSorted}
      aria-label={`Sort by ${typeof label === 'string' ? label : column}${
        isSorted ? ` (${currentOrder === 'asc' ? 'ascending' : 'descending'})` : ''
      }`}
    >
      <span>{label}</span>
      <span className="inline-flex items-center shrink-0">
        {isSorted ? (
          currentOrder === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-primary" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-primary" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </span>
    </button>
  );
}
