'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Clock,
  Calendar,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RecurrencePicker } from '@/components/sms/recurrence-picker';
import {
  type RecurrenceRule,
  parseRecurrence,
  serializeRecurrence,
} from '@/lib/sms/recurrence';

export interface ScheduledMessageData {
  id: string;
  name: string;
  message: string;
  senderId?: string;
  senderName?: string;
  recipients: number;
  scheduledAt: string; // ISO or YYYY-MM-DD HH:mm
  status: 'SCHEDULED' | 'PAUSED';
  isEditingPaused?: boolean;
  isRecurring?: boolean;
  cronExpression?: string | null;
}

export interface EditScheduledMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ScheduledMessageData | null;
  onSave: (updated: {
    id: string;
    message: string;
    scheduledAt: string;
    status: 'SCHEDULED' | 'PAUSED';
    senderId?: string;
    isRecurring?: boolean;
    cronExpression?: string | null;
  }) => Promise<void>;
}

export function EditScheduledMessageDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: EditScheduledMessageDialogProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [senderId, setSenderId] = useState('RANGESMS');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [targetStatus, setTargetStatus] = useState<'SCHEDULED' | 'PAUSED'>('SCHEDULED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>({
    frequency: 'WEEKLY',
    interval: 1,
    daysOfWeek: [1],
    endType: 'NEVER',
  });

  // Keep a 1-second ticker to accurately compute the 10-second rule and remaining time
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [open]);

  // Initialize fields when item changes or modal opens
  useEffect(() => {
    if (item && open) {
      setName(item.name || 'Scheduled Broadcast');
      setMessage(item.message || '');
      setSenderId(item.senderName || item.senderId || 'RANGESMS');
      setTargetStatus('SCHEDULED');

      if (item.isRecurring) {
        setIsRecurring(true);
        setRecurrenceRule(parseRecurrence(item.cronExpression));
      } else {
        setIsRecurring(false);
        setRecurrenceRule({
          frequency: 'WEEKLY',
          interval: 1,
          daysOfWeek: [1],
          endType: 'NEVER',
        });
      }

      const dt = new Date(item.scheduledAt);
      if (!isNaN(dt.getTime())) {
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');

        setScheduleDate(`${year}-${month}-${day}`);
        setScheduleTime(`${hours}:${minutes}`);
      } else {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        setScheduleDate(tomorrow.toISOString().split('T')[0]);
        setScheduleTime('09:00');
      }
    }
  }, [item, open]);

  // Calculate parsed candidate scheduled date/time
  const candidateDateTime = useMemo(() => {
    if (!scheduleDate || !scheduleTime) return null;
    const dt = new Date(`${scheduleDate}T${scheduleTime}:00`);
    return isNaN(dt.getTime()) ? null : dt;
  }, [scheduleDate, scheduleTime]);

  const candidateMs = candidateDateTime ? candidateDateTime.getTime() : 0;
  const msFromNow = candidateMs - now;
  const isTimeInPastOrTooClose = candidateMs <= now + 10_000;

  // Real-time metrics
  const charCount = message.length;
  const isUnicode = /[^\x00-\x7F]/.test(message);
  const maxPerSegment = isUnicode ? 70 : 160;
  const segmentCount = charCount > 0 ? Math.ceil(charCount / maxPerSegment) : 1;
  const ratePerSms = 35; // UGX standard
  const estimatedTotalCost = (item?.recipients || 1) * segmentCount * ratePerSms;

  // Quick preset handlers
  const handleSetQuickTime = (minutesAhead: number) => {
    const target = new Date(Date.now() + minutesAhead * 60 * 1000);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const minutes = String(target.getMinutes()).padStart(2, '0');

    setScheduleDate(`${year}-${month}-${day}`);
    setScheduleTime(`${hours}:${minutes}`);
    setTargetStatus('SCHEDULED');
    toast.success(`Rescheduled to +${minutesAhead >= 60 ? `${minutesAhead / 60}h` : `${minutesAhead}m`} (${hours}:${minutes})`);
  };

  const handleSetTomorrowMorning = () => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(9, 0, 0, 0);

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');

    setScheduleDate(`${year}-${month}-${day}`);
    setScheduleTime('09:00');
    setTargetStatus('SCHEDULED');
    toast.success('Rescheduled to Tomorrow at 09:00 AM');
  };

  const handleInsertVariable = (varName: string) => {
    setMessage((prev) => `${prev} {{${varName}}}`);
  };

  const handleSave = async (statusOverride?: 'SCHEDULED' | 'PAUSED') => {
    if (!item) return;

    if (!message.trim()) {
      toast.error('Message content cannot be empty.');
      return;
    }

    if (!candidateDateTime) {
      toast.error('Please specify a valid scheduled date and time.');
      return;
    }

    const finalStatus = statusOverride || targetStatus;

    // Enforce requirement: If saving with SCHEDULED status, user is required to update time if it has passed
    if (finalStatus === 'SCHEDULED' && isTimeInPastOrTooClose) {
      toast.error(
        'The scheduled time has passed or is within 10 seconds. You are required to update the date and time to a future time before scheduling.',
        { duration: 5000 }
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const cronExpression = isRecurring ? serializeRecurrence(recurrenceRule, scheduleTime) : null;
      await onSave({
        id: item.id,
        message: message.trim(),
        scheduledAt: candidateDateTime.toISOString(),
        status: finalStatus,
        senderId,
        isRecurring,
        cronExpression,
      });

      onOpenChange(false);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update scheduled message.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92dvh] flex flex-col p-0 overflow-hidden border border-border/80 dark:border-white/10 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-border/50 bg-muted/20 dark:bg-white/[0.02]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Edit Scheduled Message
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Update SMS copy, template variables, or reschedule transmission time.
                </DialogDescription>
              </div>
            </div>

            {/* Auto-Pause indicator pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-semibold self-start sm:self-auto shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>Paused for Editing</span>
            </div>
          </div>
        </DialogHeader>

        {/* Informational Auto-Pause Safety Banner */}
        <div className="px-5 py-2.5 bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <PauseCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold">Transmission Paused:</span> This scheduled message is safely held on pause while you edit. It will never be dispatched until you save and reschedule.
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form & Time Configuration */}
            <div className="lg:col-span-7 space-y-5">
              {/* Campaign / Reference */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-scheduled-name" className="text-xs font-semibold text-foreground">
                  Campaign / Message Name
                </Label>
                <Input
                  id="edit-scheduled-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Weekend Flash Sale Promo"
                  className="h-9 text-xs"
                />
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-scheduled-body" className="text-xs font-semibold text-foreground">
                    SMS Message Content <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      {charCount} / {isUnicode ? 70 : 160} chars
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 h-4">
                      {segmentCount} {segmentCount === 1 ? 'segment' : 'segments'} ({isUnicode ? 'Unicode' : 'GSM-7'})
                    </Badge>
                  </div>
                </div>

                <Textarea
                  id="edit-scheduled-body"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={5}
                  className="text-xs leading-relaxed resize-none focus-visible:ring-primary/40 font-mono"
                />

                {/* Variable helper chips */}
                <div className="flex items-center flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" /> Insert:
                  </span>
                  {['firstName', 'lastName', 'company', 'orderId', 'code'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/50 transition-colors"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduled Time Section with Validation & Presets */}
              <div
                className={cn(
                  'p-4 rounded-xl border transition-all space-y-3.5',
                  isTimeInPastOrTooClose
                    ? 'bg-destructive/5 border-destructive/30 dark:border-destructive/40 shadow-xs'
                    : 'bg-muted/30 dark:bg-white/[0.02] border-border/60'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Scheduled Delivery Time</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Timezone: Africa/Kampala (EAT, UTC+3)
                      </p>
                    </div>
                  </div>

                  {/* Relative Countdown or Alert Pill */}
                  {isTimeInPastOrTooClose ? (
                    <Badge variant="destructive" className="text-[10px] font-semibold gap-1 py-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      Past Due — Reschedule Required
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      ⏰ In {Math.round(msFromNow / 60000)} mins
                    </Badge>
                  )}
                </div>

                {/* Mandatory Warning if Time Passed */}
                {isTimeInPastOrTooClose && (
                  <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive dark:text-red-400 text-xs flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <span className="font-semibold">Rescheduling Required:</span> The original scheduled time has already passed or is within 10 seconds of delivery. You must pick a new future date and time to schedule this message.
                    </div>
                  </div>
                )}

                {/* Quick 1-Click Reschedule Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">Quick Reschedule:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetQuickTime(15)}
                      className="h-7 text-xs px-2.5 bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                    >
                      +15 Mins
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetQuickTime(60)}
                      className="h-7 text-xs px-2.5 bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                    >
                      +1 Hour
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSetTomorrowMorning}
                      className="h-7 text-xs px-2.5 bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                    >
                      Tomorrow 09:00 AM
                    </Button>
                  </div>
                </div>

                {/* Inputs for Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="edit-scheduled-date" className="text-[11px] font-medium text-foreground">
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-scheduled-date"
                      type="date"
                      min={todayIso}
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className={cn(
                        'h-9 text-xs',
                        isTimeInPastOrTooClose && 'border-destructive/60 focus-visible:ring-destructive'
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-scheduled-time" className="text-[11px] font-medium text-foreground">
                      Time (24h) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-scheduled-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className={cn(
                        'h-9 text-xs',
                        isTimeInPastOrTooClose && 'border-destructive/60 focus-visible:ring-destructive'
                      )}
                    />
                  </div>
                </div>

                {/* Recurrence Configuration */}
                <RecurrencePicker
                  isRecurring={isRecurring}
                  onIsRecurringChange={setIsRecurring}
                  rule={recurrenceRule}
                  onRuleChange={setRecurrenceRule}
                  timeStr={scheduleTime}
                />
              </div>
            </div>

            {/* Right Column: Smartphone Live Preview & Cost Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-primary" />
                Live Handset Preview
              </div>

              {/* Smartphone Chassis */}
              <div className="mx-auto w-full max-w-[280px] bg-slate-900 text-slate-100 rounded-[32px] p-3 shadow-xl border-4 border-slate-700/80 relative">
                {/* Speaker Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-800 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                </div>

                {/* Status Bar */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 px-3 pt-3 pb-1">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <span>5G</span>
                    <span className="w-3.5 h-2 border border-slate-400 rounded-xs inline-block relative">
                      <span className="absolute inset-0 bg-slate-400 m-0.5" />
                    </span>
                  </div>
                </div>

                {/* Sender Header */}
                <div className="text-center py-2 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto text-xs font-bold mb-1">
                    RA
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-200">
                    <span>{senderId || 'RANGESMS'}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="text-[9px] text-slate-500">Text Message • Scheduled</div>
                </div>

                {/* SMS Speech Bubble Area */}
                <div className="py-4 min-h-[140px] flex flex-col justify-end">
                  <div className="bg-[#1f2937] border border-slate-700 text-slate-100 p-2.5 rounded-2xl rounded-bl-xs text-xs leading-relaxed break-words shadow-sm">
                    {message.trim() ? (
                      message
                    ) : (
                      <span className="text-slate-500 italic">Message preview will appear live as you type...</span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 text-right mt-1 px-1">
                    {scheduleTime} • {segmentCount} SMS
                  </div>
                </div>

                {/* Home Indicator Bar */}
                <div className="w-20 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
              </div>

              {/* Recipient & Cost Summary */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Target Recipients:</span>
                  <span className="font-semibold text-foreground">
                    {item.recipients.toLocaleString()} contacts
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Calculated Units:</span>
                  <span className="font-semibold text-foreground">
                    {(item.recipients * segmentCount).toLocaleString()} units
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground pt-1 border-t border-border/40 font-medium">
                  <span>Estimated Total:</span>
                  <span className="font-bold text-primary">
                    ~{estimatedTotalCost.toLocaleString()} UGX
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-3 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            {isTimeInPastOrTooClose ? (
              <span className="text-destructive font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Future date/time required to schedule
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for scheduled transmission
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>

            {/* Save as Paused (Keeps paused for future scheduling) */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSave('PAUSED')}
              disabled={isSubmitting}
              className="text-xs gap-1.5"
            >
              <PauseCircle className="w-3.5 h-3.5 text-muted-foreground" />
              Save as Paused
            </Button>

            {/* Save and Schedule (Requires future time >= 10s) */}
            <Button
              type="button"
              size="sm"
              onClick={() => handleSave('SCHEDULED')}
              disabled={isSubmitting || isTimeInPastOrTooClose}
              className={cn(
                'text-xs font-semibold gap-1.5 shadow-sm',
                isTimeInPastOrTooClose
                  ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Save &amp; Schedule
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
