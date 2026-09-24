'use client';
import { cn } from '@/lib/utils';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InputError } from '@/components/ui/input-error';
import { TemplateHighlighter } from '@/components/sms/template-highlighter';
import { QuickAddVariable } from '@/components/sms/quick-add-variable';

import { VariableTextarea, getVariableColorTheme } from '@/components/sms/variable-textarea';
import { GrammarCheckModal } from '@/components/sms/grammar-check-modal';
import { SmsVariable } from '@/lib/sms/custom-variables';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

import { getAllVariablesList } from '@/lib/sms/custom-variables';
import {
  Sparkles,
  Plus,
  ExternalLink,
  Smartphone,
  Loader2,
  Calendar,
  Send,
} from 'lucide-react';
import Link from 'next/link';

export interface CampaignEditData {
  id: string;
  name: string;
  status: 'COMPLETED' | 'PROCESSING' | 'SCHEDULED' | 'DRAFT';
  recipients: number;
  sent: number;
  failed: number;
  progress: number;
  date: string;
  message?: string;
  senderId?: string;
  scheduledAt?: string;
  groupName?: string;
}

export interface EditCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignEditData | null;
  onSave: (updated: Partial<CampaignEditData>) => Promise<void> | void;
}

interface SenderOption {
  id: string;
  senderId: string;
  status: string;
}

export function EditCampaignDialog({
  open,
  onOpenChange,
  campaign,
  onSave,
}: EditCampaignDialogProps) {
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [senderId, setSenderId] = useState('RANGESMS');
  const [senderOptions, setSenderOptions] = useState<SenderOption[]>([]);
  const [message, setMessage] = useState('');
  const [messageTouched, setMessageTouched] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [saving, setSaving] = useState(false);
  const [showAddVar, setShowAddVar] = useState(false);
  const [showGrammarCheck, setShowGrammarCheck] = useState(false);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [availableVariables, setAvailableVariables] = useState<SmsVariable[]>([]);

  // Sync state when campaign changes
  useEffect(() => {
    if (campaign && open) {
      setName(campaign.name || '');
      setNameTouched(false);
      setSenderId(campaign.senderId || 'RANGESMS');
      setMessage(campaign.message || '');
      setMessageTouched(false);
      setShowAddVar(false);

      if (campaign.status === 'SCHEDULED' || campaign.scheduledAt) {
        setIsScheduled(true);
        const scheduledDateObj = campaign.scheduledAt
          ? new Date(campaign.scheduledAt)
          : campaign.date && campaign.date !== '-'
          ? new Date(campaign.date)
          : new Date();

        const dateStr = !isNaN(scheduledDateObj.getTime())
          ? scheduledDateObj.toISOString().split('T')[0]
          : '';
        const timeStr = !isNaN(scheduledDateObj.getTime())
          ? scheduledDateObj.toTimeString().substring(0, 5)
          : '09:00';

        setScheduleDate(dateStr);
        setScheduleTime(timeStr);
      } else {
        setIsScheduled(false);
        setScheduleDate('');
        setScheduleTime('09:00');
      }
    }
  }, [campaign, open]);

  // Load sender IDs and variables
  useEffect(() => {
    async function loadSenders() {
      try {
        const res = await fetch('/api/sender-ids');
        if (res.ok) {
          const json = await res.json();
          const list: SenderOption[] = json.data || [];
          const approved = list.filter((s) => s.status === 'APPROVED');
          if (approved.length > 0) {
            setSenderOptions(approved);
          }
        }
      } catch {
        // Fallback to static
      }
    }
    loadSenders();

    const refreshVars = () => {
      try {
        setAvailableVariables(getAllVariablesList());
      } catch {
        // keep fallback
      }
    };
    refreshVars();
  }, []);

  // Validation
  const nameError = nameTouched
    ? !name.trim()
      ? 'Campaign name is required.'
      : name.trim().length < 2
      ? 'Campaign name must be at least 2 characters.'
      : name.length > 100
      ? 'Campaign name cannot exceed 100 characters.'
      : ''
    : '';

  const messageError = messageTouched
    ? !message.trim()
      ? 'SMS message content is required.'
      : message.length > 3200
      ? 'Message cannot exceed 3,200 characters.'
      : ''
    : '';

  // Metrics computation
  const charCount = message.length;
  const isUnicode = /[^\x00-\x7F]/.test(message);
  const maxPerSegment = isUnicode ? 70 : 160;
  const segments = charCount > 0 ? Math.ceil(charCount / maxPerSegment) : 1;
  const ratePerSms = 35; // UGX standard
  const estimatedCost = (campaign?.recipients || 0) * segments * ratePerSms;

  const handleInsertVariable = (variableName: string) => {
    const textarea = document.getElementById(
      'edit-campaign-message-body'
    ) as HTMLTextAreaElement | null;
    if (!textarea) {
      setMessage((prev) => `${prev} {{${variableName}}}`);
      if (!messageTouched) setMessageTouched(true);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = message.substring(0, start);
    const after = message.substring(end);
    const insertion = `{{${variableName}}}`;
    const newText = `${before}${insertion}${after}`;

    setMessage(newText);
    if (!messageTouched) setMessageTouched(true);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleVariableCreated = (newVar: SmsVariable) => {
    setAvailableVariables((prev) => { if (prev.some(v => v.key === newVar.key)) return prev; return [...prev, newVar]; });
    setShowAddVar(false);
    handleInsertVariable(newVar.key);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    setMessageTouched(true);

    if (!name.trim() || name.trim().length < 2 || name.length > 100) return;
    if (!message.trim() || message.length > 3200) return;

    setSaving(true);
    try {
      let scheduledAtIso: string | undefined;
      let targetStatus = campaign?.status;

      if (isScheduled && scheduleDate) {
        const fullDateStr = `${scheduleDate}T${scheduleTime || '09:00'}:00`;
        const dt = new Date(fullDateStr);
        if (!isNaN(dt.getTime())) {
          scheduledAtIso = dt.toISOString();
          targetStatus = 'SCHEDULED';
        }
      } else if (!isScheduled && campaign?.status === 'SCHEDULED') {
        targetStatus = 'DRAFT';
      }

      await onSave({
        name: name.trim(),
        senderId,
        message,
        status: targetStatus,
        scheduledAt: scheduledAtIso,
        date: scheduleDate || campaign?.date,
      });

      onOpenChange(false);
    } catch {
      // Handled in parent
    } finally {
      setSaving(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92dvh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-lg font-bold">Edit Campaign</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update campaign settings, SMS content, or scheduled delivery time.
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className="font-medium text-xs tracking-tight shrink-0 mr-6"
            >
              {campaign.status}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogBody className="space-y-4 px-6 py-4 flex-1 overflow-y-auto">
            {/* Campaign Name & Sender ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-campaign-name" className="text-xs font-semibold">
                  Campaign Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-campaign-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!nameTouched) setNameTouched(true);
                  }}
                  onBlur={() => setNameTouched(true)}
                  placeholder="e.g. Summer Promo Blast"
                  error={!!nameError}
                  aria-describedby={nameError ? 'edit-name-error' : undefined}
                />
                {nameError && <InputError id="edit-name-error" message={nameError} />}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-sender-id" className="text-xs font-semibold">
                  Sender ID <span className="text-destructive">*</span>
                </Label>
                <Select value={senderId} onValueChange={setSenderId}>
                  <SelectTrigger id="edit-sender-id">
                    <SelectValue placeholder="Select Sender ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {senderOptions.length > 0 ? (
                      senderOptions.map((s) => (
                        <SelectItem key={s.id} value={s.senderId}>
                          {s.senderId} (Approved)
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="RANGESMS">RANGESMS (Default Approved)</SelectItem>
                        <SelectItem value="INFO">INFO (Transactional)</SelectItem>
                        <SelectItem value="PROMO">PROMO (Promotional)</SelectItem>
                        <SelectItem value="RANGE">RANGE (Alphanumeric)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Alphanumeric sender ID registered with telecom carriers.
                </p>
              </div>
            </div>

            {/* Target Audience Overview */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Audience:</span>
                <span className="font-semibold text-foreground">
                  {campaign.groupName || 'Target Audience'}
                </span>
                <Badge variant="secondary" className="text-[11px] font-medium">
                  {campaign.recipients.toLocaleString()} Recipients
                </Badge>
              </div>
              <div className="text-muted-foreground">
                Est. Cost:{' '}
                <span className="font-semibold text-secondary dark:text-primary">
                  {estimatedCost.toLocaleString()} UGX
                </span>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="p-3.5 bg-muted/20 rounded-xl border border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-secondary dark:text-primary" />
                  <span className="text-xs font-semibold text-foreground">Schedule Broadcast</span>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-muted-foreground font-medium">
                    {isScheduled ? 'Scheduled for later' : 'Save as Draft / Send manually'}
                  </span>
                </label>
              </div>

              {isScheduled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="schedule-date" className="text-[11px] text-muted-foreground">
                      Dispatch Date
                    </Label>
                    <div className="relative">
                      <Input
                        id="schedule-date"
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="text-xs"
                        min={new Date().toISOString().split('T')[0]}
                        required={isScheduled}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="schedule-time" className="text-[11px] text-muted-foreground">
                      Dispatch Time (EAT)
                    </Label>
                    <div className="relative">
                      <Input
                        id="schedule-time"
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="text-xs"
                        required={isScheduled}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Body Section */}
            <div className="space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="edit-campaign-message-body" className="text-xs font-semibold">
                    SMS Message Body <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-medium gap-1.5 rounded-md"
                      onClick={() => setShowGrammarCheck(true)}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Grammar Check</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs font-medium gap-1.5 rounded-md transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Insert Variable</span>
                          <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                        <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                          <span>Variables</span>
                          <Link href="/sms/variables" target="_blank" rel="noopener noreferrer" className="text-secondary dark:text-primary hover:underline flex items-center gap-0.5 lowercase text-[10px]">
                            manage all <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                        
                        <div className="px-2 py-1 mt-1 text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
                          Built-in
                        </div>
                        {availableVariables.filter(v => v.isSystem).map((v) => {
                          const theme = getVariableColorTheme(v.key);
                          return (
                            <DropdownMenuItem
                              key={v.key}
                              onClick={() => handleInsertVariable(v.key)}
                              className="flex items-center justify-between text-xs cursor-pointer py-1.5 font-mono"
                              title={v.label}
                            >
                              <span>{`{{${v.key}}}`}</span>
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-sans font-medium', theme.badgeClass)}>
                                Built-in
                              </span>
                            </DropdownMenuItem>
                          );
                        })}

                        <DropdownMenuSeparator />
                        <div className="px-2 py-1 text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
                          Custom
                        </div>
                        {availableVariables.filter(v => !v.isSystem).map((v) => {
                          const theme = getVariableColorTheme(v.key);
                          return (
                            <DropdownMenuItem
                              key={v.key}
                              onClick={() => handleInsertVariable(v.key)}
                              className="flex items-center justify-between text-xs cursor-pointer py-1.5 font-mono"
                              title={v.label}
                            >
                              <span>{`{{${v.key}}}`}</span>
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-sans font-medium', theme.badgeClass)}>
                                Custom
                              </span>
                            </DropdownMenuItem>
                          );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setShowAddVar(true)}
                          className="text-xs font-sans text-secondary dark:text-primary cursor-pointer flex items-center gap-1.5 py-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Custom Variable</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <QuickAddVariable isOpen={showAddVar} onClose={() => setShowAddVar(false)} onSuccess={handleVariableCreated} />
                <GrammarCheckModal isOpen={showGrammarCheck} onClose={() => setShowGrammarCheck(false)} originalText={message} onApply={(corrected) => { setMessage(corrected); setShowGrammarCheck(false); }} />

              <VariableTextarea
                ref={messageTextareaRef}
                id="edit-campaign-message-body"
                rows={5}
                placeholder="Type campaign message here..."
                value={message}
                onChange={(val) => setMessage(val)}
                onBlur={() => setMessageTouched(true)}
                error={!!messageError}
                className="resize-y min-h-[120px]"
                required
              />
              {messageError && <InputError id="edit-message-error" message={messageError} />}
              </div>


            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-muted/30 rounded-lg border text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Characters</span>
                <span className="font-semibold text-sm">{charCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Segments</span>
                <span className="font-semibold text-sm">
                  {segments} {segments === 1 ? 'part' : 'parts'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Encoding</span>
                <span className="font-semibold text-sm">
                  {isUnicode ? 'Unicode (UCS-2)' : 'GSM-7'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Unit Cost</span>
                <span className="font-semibold text-sm">{segments * ratePerSms} UGX</span>
              </div>
            </div>

            {/* Handset Recipient Live Preview */}
            <div className="space-y-1 pt-1">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-secondary dark:text-primary" />
                Handset Recipient Live Preview
              </Label>
              <div className="p-3.5 rounded-xl border bg-muted/30 dark:bg-slate-950/40 flex flex-col items-start">
                <div className="max-w-[90%] p-3.5 rounded-2xl rounded-bl-xs bg-primary text-primary-foreground shadow-xs text-sm whitespace-pre-wrap leading-relaxed">
                  <TemplateHighlighter
                    text={message || 'Your campaign message will appear here...'}
                    variant="on-primary"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1.5 pl-1">
                  Sender: {senderId} • Just now
                </span>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="px-6 py-3.5 border-t bg-muted/20 flex flex-col sm:flex-row sm:justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isScheduled ? 'Update Schedule' : 'Save Changes'}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
