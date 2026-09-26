'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, AlertCircle, X, Copy } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isValidCalendarDate } from '@/lib/sms/variable-validation';

export interface VariableDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hasError?: boolean;
  isMissing?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  onApplyToAll?: (val: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function VariableDatePicker({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  hasError,
  isMissing,
  errorMessage,
  disabled,
  id,
  className,
  onApplyToAll,
}: VariableDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial view month/year from value or current date
  const initialDate = React.useMemo(() => {
    const check = isValidCalendarDate(value);
    if (check.isValid && check.isoDate) {
      const [y, m, d] = check.isoDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = React.useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initialDate.getMonth());

  // Keep view aligned when value changes
  React.useEffect(() => {
    const check = isValidCalendarDate(value);
    if (check.isValid && check.isoDate) {
      const [y, m] = check.isoDate.split('-').map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [value]);

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const yyyy = viewYear;
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(formatted);
    setOpen(false);
  };

  const handleQuickPreset = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  // Compare day with selected date
  const isDaySelected = (day: number) => {
    const check = isValidCalendarDate(value);
    if (!check.isValid || !check.isoDate) return false;
    const [y, m, d] = check.isoDate.split('-').map(Number);
    return y === viewYear && m - 1 === viewMonth && d === day;
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getFullYear() === viewYear &&
      now.getMonth() === viewMonth &&
      now.getDate() === day
    );
  };

  const cleanVal = (value || '').trim();
  const isEmpty = cleanVal.length === 0;
  const isActuallyValid = !isEmpty && isValidCalendarDate(cleanVal).isValid;

  return (
    <div className="space-y-1 w-full">
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-9 pl-3 pr-16 text-xs font-sans rounded-md border shadow-xs transition-colors bg-background text-foreground',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            isEmpty && isMissing && 'border-amber-500/60 focus-visible:ring-amber-500/60 bg-amber-500/[0.03]',
            hasError && !isEmpty && 'border-destructive focus-visible:ring-destructive bg-destructive/5',
            isActuallyValid && 'border-input hover:border-primary/50',
            className
          )}
        />

        {/* Right side indicators and trigger */}
        <div className="absolute right-1.5 flex items-center gap-1">
          {isEmpty && isMissing && (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 h-4 font-mono font-medium border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 pointer-events-none"
            >
              Missing
            </Badge>
          )}

          {hasError && !isEmpty && (
            <AlertCircle className="w-3.5 h-3.5 text-destructive pointer-events-none" />
          )}

          {isActuallyValid && (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500 pointer-events-none" />
              {onApplyToAll && (
                <button
                  type="button"
                  onClick={() => onApplyToAll(value)}
                  className="text-muted-foreground hover:text-primary p-0.5 rounded cursor-pointer transition-colors"
                  title={`Apply "${value}" to all rows`}
                  aria-label={`Apply "${value}" to all rows`}
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </>
          )}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                className={cn(
                  'h-7 w-7 p-0 rounded text-muted-foreground hover:text-foreground cursor-pointer',
                  open && 'text-primary bg-muted'
                )}
                title="Open calendar date picker"
                aria-label="Pick date"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-68 p-3 shadow-xl border-border bg-card rounded-xl space-y-3 z-50"
            >
              {/* Header: Month and Year Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">
                    {MONTH_NAMES[viewMonth]}
                  </span>
                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer border-b border-border/80 hover:border-primary"
                  >
                    {Array.from({ length: 15 }, (_, i) => 2024 + i).map((y) => (
                      <option key={y} value={y} className="bg-popover text-popover-foreground">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handlePrevMonth}
                    title="Previous month"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleNextMonth}
                    title="Next month"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleQuickPreset(0)}
                  className="px-1.5 py-1 rounded bg-muted/60 hover:bg-muted font-medium text-foreground text-center cursor-pointer transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(1)}
                  className="px-1.5 py-1 rounded bg-muted/60 hover:bg-muted font-medium text-foreground text-center cursor-pointer transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(7)}
                  className="px-1.5 py-1 rounded bg-muted/60 hover:bg-muted font-medium text-foreground text-center cursor-pointer transition-colors"
                >
                  +7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(30)}
                  className="px-1.5 py-1 rounded bg-muted/60 hover:bg-muted font-medium text-foreground text-center cursor-pointer transition-colors"
                >
                  +30 Days
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-1">
                {/* Day headers */}
                <div className="grid grid-cols-7 text-center">
                  {DAYS_OF_WEEK.map((d) => (
                    <span key={d} className="text-[10px] font-medium text-muted-foreground py-0.5">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Day numbers */}
                <div className="grid grid-cols-7 gap-0.5 text-center">
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-7 w-7" />
                  ))}

                  {/* Month days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const selected = isDaySelected(day);
                    const today = isToday(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={cn(
                          'h-7 w-7 rounded-md text-xs font-medium flex items-center justify-center transition-all cursor-pointer',
                          selected
                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                            : today
                              ? 'border border-primary text-primary font-semibold hover:bg-muted'
                              : 'text-foreground hover:bg-muted/80'
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
                {value ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setOpen(false);
                    }}
                    className="text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                ) : (
                  <span />
                )}

                {onApplyToAll && value && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyToAll(value);
                      setOpen(false);
                    }}
                    className="text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Apply to all rows
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Real-time inline validation error */}
      {hasError && errorMessage && !isEmpty && (
        <p className="text-[10px] text-destructive leading-tight flex items-center gap-1 px-0.5">
          <AlertCircle className="w-2.5 h-2.5 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
}
