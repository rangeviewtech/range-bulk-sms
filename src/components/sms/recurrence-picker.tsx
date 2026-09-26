'use client';

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Repeat,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  RecurrenceRule,
  RecurrenceFrequency,
  RecurrenceEndType,
  DAY_NAMES_SHORT,
  describeRecurrence,
} from '@/lib/sms/recurrence';

export interface RecurrencePickerProps {
  isRecurring: boolean;
  onIsRecurringChange: (enabled: boolean) => void;
  rule: RecurrenceRule;
  onRuleChange: (rule: RecurrenceRule) => void;
  timeStr?: string; // HH:mm
  className?: string;
}

export function RecurrencePicker({
  isRecurring,
  onIsRecurringChange,
  rule,
  onRuleChange,
  timeStr = '09:00',
  className,
}: RecurrencePickerProps) {
  const handleFrequencyChange = (frequency: RecurrenceFrequency) => {
    let daysOfWeek = rule.daysOfWeek;
    if (frequency === 'WEEKLY' && (!daysOfWeek || daysOfWeek.length === 0)) {
      daysOfWeek = [1]; // Default to Monday
    } else if (frequency === 'WEEKDAYS') {
      daysOfWeek = [1, 2, 3, 4, 5];
    }

    onRuleChange({
      ...rule,
      frequency,
      daysOfWeek,
    });
  };

  const toggleDayOfWeek = (dayIdx: number) => {
    const currentDays = rule.daysOfWeek || [1];
    let nextDays: number[];
    if (currentDays.includes(dayIdx)) {
      // Keep at least one day selected
      if (currentDays.length > 1) {
        nextDays = currentDays.filter((d) => d !== dayIdx);
      } else {
        nextDays = currentDays;
      }
    } else {
      nextDays = [...currentDays, dayIdx].sort((a, b) => a - b);
    }

    onRuleChange({
      ...rule,
      daysOfWeek: nextDays,
    });
  };

  const handleEndTypeChange = (endType: RecurrenceEndType) => {
    onRuleChange({
      ...rule,
      endType,
      endDate: endType === 'ON_DATE' && !rule.endDate ? new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0] : rule.endDate,
      maxOccurrences: endType === 'AFTER_COUNT' && !rule.maxOccurrences ? 10 : rule.maxOccurrences,
    });
  };

  return (
    <div className={cn("space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5 transition-all", className)}>
      {/* Recurrence Toggle Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0",
            isRecurring ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <Repeat className="w-3.5 h-3.5" />
          </div>
          <div>
            <Label htmlFor="toggle-recurring" className="text-xs font-semibold text-foreground cursor-pointer">
              Recurring Delivery
            </Label>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Automatically repeat this message on a schedule
            </p>
          </div>
        </div>
        <Switch
          id="toggle-recurring"
          checked={isRecurring}
          onCheckedChange={onIsRecurringChange}
        />
      </div>

      {/* Recurrence Options Panel */}
      {isRecurring && (
        <div className="pt-2 border-t border-border/50 space-y-3 animate-in fade-in-50 duration-200">
          {/* Frequency & Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Frequency</Label>
              <Select
                value={rule.frequency}
                onValueChange={(val) => handleFrequencyChange(val as RecurrenceFrequency)}
              >
                <SelectTrigger className="h-8.5 text-xs bg-background">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="z-[150]">
                  <SelectItem value="DAILY" className="text-xs">Daily (Every day)</SelectItem>
                  <SelectItem value="WEEKDAYS" className="text-xs">Every Weekday (Mon–Fri)</SelectItem>
                  <SelectItem value="WEEKLY" className="text-xs">Weekly (Selected days)</SelectItem>
                  <SelectItem value="BIWEEKLY" className="text-xs">Bi-weekly (Every 2 weeks)</SelectItem>
                  <SelectItem value="MONTHLY" className="text-xs">Monthly (Day of month)</SelectItem>
                  <SelectItem value="YEARLY" className="text-xs">Yearly (Annually)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interval */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Repeat Every
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={rule.interval || 1}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                    onRuleChange({ ...rule, interval: val });
                  }}
                  className="h-8.5 text-xs w-20 bg-background"
                />
                <span className="text-xs text-muted-foreground">
                  {rule.frequency === 'DAILY' && ((rule.interval || 1) > 1 ? 'days' : 'day')}
                  {rule.frequency === 'WEEKDAYS' && 'weekday(s)'}
                  {(rule.frequency === 'WEEKLY' || rule.frequency === 'BIWEEKLY') && ((rule.interval || 1) > 1 ? 'weeks' : 'week')}
                  {rule.frequency === 'MONTHLY' && ((rule.interval || 1) > 1 ? 'months' : 'month')}
                  {rule.frequency === 'YEARLY' && ((rule.interval || 1) > 1 ? 'years' : 'year')}
                </span>
              </div>
            </div>
          </div>

          {/* Days of Week (when Weekly) */}
          {rule.frequency === 'WEEKLY' && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Repeat On Days
              </Label>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {DAY_NAMES_SHORT.map((name, idx) => {
                  const isSelected = (rule.daysOfWeek || [1]).includes(idx);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleDayOfWeek(idx)}
                      className={cn(
                        "h-8 w-full rounded-lg text-xs font-medium transition-all cursor-pointer border flex items-center justify-center",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                          : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* End Condition */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Ends</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleEndTypeChange('NEVER')}
                className={cn(
                  "p-2 rounded-lg text-left text-xs border transition-all cursor-pointer flex flex-col justify-center",
                  rule.endType === 'NEVER'
                    ? "bg-primary/10 border-primary text-foreground font-medium"
                    : "bg-background border-border text-muted-foreground hover:bg-accent"
                )}
              >
                <span className="font-semibold text-[11px]">Never</span>
                <span className="text-[10px] opacity-75">Runs until paused</span>
              </button>

              <button
                type="button"
                onClick={() => handleEndTypeChange('ON_DATE')}
                className={cn(
                  "p-2 rounded-lg text-left text-xs border transition-all cursor-pointer flex flex-col justify-center",
                  rule.endType === 'ON_DATE'
                    ? "bg-primary/10 border-primary text-foreground font-medium"
                    : "bg-background border-border text-muted-foreground hover:bg-accent"
                )}
              >
                <span className="font-semibold text-[11px]">On Date</span>
                <span className="text-[10px] opacity-75">Specific end cutoff</span>
              </button>

              <button
                type="button"
                onClick={() => handleEndTypeChange('AFTER_COUNT')}
                className={cn(
                  "p-2 rounded-lg text-left text-xs border transition-all cursor-pointer flex flex-col justify-center",
                  rule.endType === 'AFTER_COUNT'
                    ? "bg-primary/10 border-primary text-foreground font-medium"
                    : "bg-background border-border text-muted-foreground hover:bg-accent"
                )}
              >
                <span className="font-semibold text-[11px]">After Count</span>
                <span className="text-[10px] opacity-75">Fixed occurrences</span>
              </button>
            </div>

            {/* Conditional input for ON_DATE */}
            {rule.endType === 'ON_DATE' && (
              <div className="pt-1.5 flex items-center gap-2">
                <Label htmlFor="recurrence-end-date" className="text-xs text-muted-foreground shrink-0">
                  End Date:
                </Label>
                <Input
                  id="recurrence-end-date"
                  type="date"
                  value={rule.endDate || ''}
                  onChange={(e) => onRuleChange({ ...rule, endDate: e.target.value })}
                  className="h-8 text-xs bg-background max-w-[200px]"
                />
              </div>
            )}

            {/* Conditional input for AFTER_COUNT */}
            {rule.endType === 'AFTER_COUNT' && (
              <div className="pt-1.5 flex items-center gap-2">
                <Label htmlFor="recurrence-max-count" className="text-xs text-muted-foreground shrink-0">
                  End after:
                </Label>
                <Input
                  id="recurrence-max-count"
                  type="number"
                  min={1}
                  max={500}
                  value={rule.maxOccurrences || 10}
                  onChange={(e) => onRuleChange({ ...rule, maxOccurrences: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="h-8 text-xs bg-background w-24"
                />
                <span className="text-xs text-muted-foreground">occurrences</span>
              </div>
            )}
          </div>

          {/* Live Recurrence Summary Banner */}
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/25 text-xs text-primary flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-[11px] leading-tight">
              {describeRecurrence(rule, timeStr)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
