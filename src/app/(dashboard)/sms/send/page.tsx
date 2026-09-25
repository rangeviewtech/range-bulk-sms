'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { extractVariablesFromText, renderPreviewWithSamples } from '@/lib/sms/custom-variables';

const VariableResolutionModal = dynamic(
  () => import('@/components/sms/variable-resolution-modal').then((mod) => mod.VariableResolutionModal),
  { ssr: false }
);

const GrammarCheckModal = dynamic(
  () => import('@/components/sms/grammar-check-modal').then((mod) => mod.GrammarCheckModal),
  { ssr: false }
);
import { VariableDropdown } from '@/components/sms/variable-dropdown';
import { PhoneRecipientsInput, type PhoneRecipientsInputHandle, getCachedBadgeMeta } from '@/components/sms/phone-recipients-input';
import { CountryPickerDropdown } from '@/components/sms/country-picker-dropdown';
import { NetworkBadge } from '@/components/sms/carrier-badge';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Sparkles,
  Send,
  Clock,
  BookTemplate,
  Eye,
  Activity,
  Loader2,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  VariableTextarea,
  insertVariableAtCursor,
  getVariableColorTheme,
} from '@/components/sms/variable-textarea';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { InputError } from '@/components/ui/input-error';
import { TemplateHighlighter } from '@/components/sms/template-highlighter';

const TEMPLATES = [
  {
    id: 't1',
    name: 'Order Confirmation',
    content: 'Hi {{name}}, your order #{{orderId}} has been confirmed and is being processed for dispatch.',
    category: 'Transactional',
  },
  {
    id: 't2',
    name: 'Weekend Flash Promo',
    content: 'VIP Special: Enjoy 20% OFF your next order this weekend only with promo code VIP2026!',
    category: 'Marketing',
  },
  {
    id: 't3',
    name: 'Appointment Reminder',
    content: 'Hello {{name}}, reminder for your upcoming appointment on {{date}} at {{time}}. Reply 1 to confirm.',
    category: 'Reminders',
  },
  {
    id: 't4',
    name: 'Payment Receipt',
    content: 'Payment Received: UGX {{amount}} received for account {{account}}. Thank you for choosing us!',
    category: 'Billing',
  },
  {
    id: 't5',
    name: 'General Customer Notice',
    content: 'Important update for {{customer}}: We are upgrading our platform on {{date}}. Contact {{support}} with any questions.',
    category: 'Others',
  },
];

interface SenderOption {
  id: string;
  senderId: string;
  status: string;
}

interface GroupOption {
  id: string;
  name: string;
  count: number;
}

const INITIAL_GROUPS: GroupOption[] = [
  { id: 'g1', name: 'VIP Customers', count: 142 },
  { id: 'g2', name: 'Staff & Team', count: 45 },
  { id: 'g3', name: 'Kampala Clients', count: 850 },
];

export default function SendSmsPage() {
  const [senderId, setSenderId] = useState('RANGESMS');
  const [senderOptions, setSenderOptions] = useState<SenderOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>(INITIAL_GROUPS);
  const [deliveryMode, setDeliveryMode] = useState('manual');
  const [manualRecipients, setManualRecipients] = useState('');
  const recipientsInputRef = useRef<PhoneRecipientsInputHandle>(null);
  const [selectedDialCode, setSelectedDialCode] = useState<string | undefined>(undefined);
  const [isGroupLoading, setIsGroupLoading] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState('g1');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<'send' | 'schedule' | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

      const [showGrammarCheck, setShowGrammarCheck] = useState(false);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'sample' | 'realistic' | 'raw'>('sample');
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  const handleCopyPreview = () => {
    const textToCopy = renderPreviewWithSamples(message || '');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPreview(true);
    toast.success('Sample preview text copied to clipboard');
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  useEffect(() => {
    async function loadResources() {
      try {
        const [sendersRes, groupsRes] = await Promise.all([
          fetch('/api/sender-ids'),
          fetch('/api/contacts/groups'),
        ]);

        if (sendersRes.ok) {
          const json = await sendersRes.json();
          const list: SenderOption[] = json.data || [];
          const approved = list.filter((s) => s.status === 'APPROVED');
          if (approved.length > 0) {
            setSenderOptions(approved);
            setSenderId(approved[0].senderId);
          }
        }

        if (groupsRes.ok) {
          const json = await groupsRes.json();
          const list: Array<{ id: string; name: string; memberCount?: number }> = json.data || [];
          if (list.length > 0) {
            const mapped = list.map((g) => ({
              id: g.id,
              name: g.name,
              count: g.memberCount ?? 0,
            }));
            setGroups(mapped);
            setSelectedGroupId(mapped[0].id);
          }
        }
      } catch {
        // Retain default fallback data gracefully
      }
    }
    loadResources();
  }, []);

  const validateScheduleDate = (dateStr: string) => {
    if (!dateStr) {
      setScheduleError('Please select a delivery date and time.');
      return false;
    }
    if (new Date(dateStr).getTime() <= Date.now()) {
      setScheduleError('Delivery date and time must be set in the future.');
      return false;
    }
    setScheduleError('');
    return true;
  };

  // Calculate recipients
  const parsedManualRecipients = manualRecipients
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0] || { id: 'default', name: 'Default', count: 0 };
  const totalRecipients = deliveryMode === 'manual' ? parsedManualRecipients.length : (manualRecipients ? parsedManualRecipients.length : selectedGroup.count);

  const currentGroupName = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId)?.name || 'Group';
  }, [groups, selectedGroupId]);

  useEffect(() => {
    if (deliveryMode === 'groups') {
      let isCurrent = true;
      setIsGroupLoading(true);

      async function loadGroupContacts() {
        let phones: string[] = [];
        try {
          const res = await fetch(`/api/contacts?groupId=${selectedGroupId}&limit=5000`);
          if (res.ok) {
            const json = await res.json();
            const items: Array<{ phone?: string; normalizedPhone?: string }> = json.data?.items || json.data || [];
            phones = items.map((c) => c.phone || c.normalizedPhone).filter(Boolean) as string[];
          }
        } catch {
          // ignore
        }

        const targetGroup = groups.find((g) => g.id === selectedGroupId);
        const targetCount = targetGroup?.count ?? (selectedGroupId === 'g1' ? 142 : selectedGroupId === 'g2' ? 45 : 850);

        if (phones.length < targetCount) {
          let prefix = '+256700';
          let start = 111111;
          if (selectedGroupId === 'g2') {
            prefix = '+256772';
            start = 222221;
          } else if (selectedGroupId === 'g3') {
            prefix = '+256750';
            start = 100000;
          }

          const needed = targetCount - phones.length;
          const generated = Array.from(
            { length: needed },
            (_, i) => `${prefix}${(start + phones.length + i).toString()}`
          );
          phones = [...phones, ...generated];
        }

        await new Promise((resolve) => setTimeout(resolve, 600));

        if (isCurrent) {
          setManualRecipients(phones.join(', '));
          setIsGroupLoading(false);
        }
      }
      loadGroupContacts();

      return () => {
        isCurrent = false;
      };
    } else {
      setIsGroupLoading(false);
    }
  }, [selectedGroupId, deliveryMode, groups]);

  const validatedRecipients = useMemo(() => {
    return parsedManualRecipients.filter((p) => getCachedBadgeMeta(p).isValid);
  }, [parsedManualRecipients]);

  const carrierRouteSummary = useMemo(() => {
    if (validatedRecipients.length === 0) return [];

    const map = new Map<
      string,
      { carrier: string; count: number; countryIso?: string; countryName?: string }
    >();

    for (const phone of validatedRecipients) {
      const meta = getCachedBadgeMeta(phone);
      const carrier = meta.carrier || 'Detected Carrier';
      const existing = map.get(carrier);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(carrier, {
          carrier,
          count: 1,
          countryIso: meta.countryIso,
          countryName: meta.countryName,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [validatedRecipients]);


  // SMS encoding and segment computation
  const charCount = message.length;
  const isUnicode = /[^\x00-\x7F]/.test(message);
  const encoding = isUnicode ? 'Unicode (UCS-2)' : 'GSM-7';
  const maxPerSegment = isUnicode ? 70 : 160;
  const segments = charCount > 0 ? Math.ceil(charCount / maxPerSegment) : 1;
  const ratePerSms = 35; // UGX
  const cost = totalRecipients * segments * ratePerSms;

  // Validation state
  const [recipientsTouched, setRecipientsTouched] = useState(false);
  const [messageTouched, setMessageTouched] = useState(false);

  // Validate recipients in real-time
  let recipientsError = '';
  if (deliveryMode === 'manual') {
    if (recipientsTouched && parsedManualRecipients.length === 0) {
      recipientsError = 'At least one recipient phone number is required';
    } else if (recipientsTouched) {
      const invalidNumber = parsedManualRecipients.find((p) => !/^\+?[0-9]{9,15}$/.test(p));
      if (invalidNumber) {
        recipientsError = `Invalid phone format: "${invalidNumber}" (use e.g. +256700123456)`;
      }
    }
  }

  // Validate message in real-time
  let messageError = '';
  if (messageTouched && !message.trim()) {
    messageError = 'Message content is required';
  } else if (message.length > 3200) {
    messageError = 'Message cannot exceed 3,200 characters';
  }

  const handleSelectTemplate = (templateContent: string) => {
    setMessage(templateContent);
    setMessageTouched(true);
    setTemplateModalOpen(false);
    toast.success('Template applied to message body');
  };

  const detectedVariablesList = useMemo(() => {
    return extractVariablesFromText(message);
  }, [message]);

  const handleInsertVariable = (variableName: string) => {
    insertVariableAtCursor(
      messageTextareaRef.current,
      message,
      variableName,
      (newVal) => {
        setMessage(newVal);
        setMessageTouched(true);
      }
    );
  };

  const resolveRecipients = async (): Promise<string[]> => {
    if (deliveryMode === 'manual') {
      return parsedManualRecipients;
    }
    try {
      const res = await fetch('/api/contacts?limit=500');
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.data || [];
        const phones = items.map((c: { phone?: string; normalizedPhone?: string }) => c.phone || c.normalizedPhone).filter(Boolean);
        if (phones.length > 0) return phones;
      }
    } catch {
      // Fallback
    }
    return ['+256700000001'];
  };

  const handleConfirmVariableResolution = (
    personalizedMessages: { phone: string; message: string }[],
    _hasFallback: boolean
  ) => {
    const resolvedMessage = personalizedMessages[0]?.message || message;
    setMessage(resolvedMessage);
    setShowVariableModal(false);
    
    if (pendingAction === 'schedule') {
      handleConfirmSchedule(resolvedMessage, personalizedMessages);
    } else {
      handleSendNow(resolvedMessage, personalizedMessages);
    }
  };

  const handleSendNow = async (
    resolvedMsg?: string | React.MouseEvent<HTMLButtonElement>,
    personalizedList?: { phone: string; message: string }[]
  ) => {
    recipientsInputRef.current?.commit();
    setRecipientsTouched(true);
    setMessageTouched(true);

    if (totalRecipients === 0) {
      toast.error('Please enter at least one recipient phone number.');
      return;
    }
    if (recipientsError) {
      toast.error(recipientsError);
      return;
    }
    
    const msgToUse = typeof resolvedMsg === 'string' ? resolvedMsg : message.trim();
    if (!msgToUse) {
      toast.error('Please enter your SMS message content.');
      return;
    }
    if (messageError) {
      toast.error(messageError);
      return;
    }

    if (typeof resolvedMsg !== 'string' && !personalizedList) {
      const vars = extractVariablesFromText(message);
      if (vars.length > 0) {
        setDetectedVariables(vars);
        setPendingAction('send');
        setShowVariableModal(true);
        return;
      }
    }

    setSending(true);
    try {
      const recipientsToSend = personalizedList && personalizedList.length > 0
        ? personalizedList.map((p) => p.phone)
        : await resolveRecipients();

      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          recipients: recipientsToSend,
          message: msgToUse,
          personalizedMessages: personalizedList && personalizedList.length > 0 ? personalizedList : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Failed to dispatch SMS message');
        return;
      }

      toast.success(`Successfully dispatched ${recipientsToSend.length} SMS message(s)!`);
      setManualRecipients('');
      setMessage('');
      setRecipientsTouched(false);
      setMessageTouched(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Network error dispatching SMS');
    } finally {
      setSending(false);
    }
  };

  const handleConfirmSchedule = async (
    resolvedMsg?: string | React.MouseEvent<HTMLButtonElement>,
    personalizedList?: { phone: string; message: string }[]
  ) => {
    recipientsInputRef.current?.commit();
    if (!validateScheduleDate(scheduleDate)) {
      return;
    }
    
    const msgToUse = typeof resolvedMsg === 'string' ? resolvedMsg : message.trim();
    if (totalRecipients === 0 || !msgToUse) {
      toast.error('Recipients and message content are required.');
      return;
    }

    if (typeof resolvedMsg !== 'string' && !personalizedList) {
      const vars = extractVariablesFromText(message);
      if (vars.length > 0) {
        setDetectedVariables(vars);
        setPendingAction('schedule');
        setShowVariableModal(true);
        return;
      }
    }

    setScheduling(true);
    try {
      const recipientsToSend = personalizedList && personalizedList.length > 0
        ? personalizedList.map((p) => p.phone)
        : await resolveRecipients();

      const res = await fetch('/api/sms/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          recipients: recipientsToSend,
          message: msgToUse,
          scheduledAt: new Date(scheduleDate).toISOString(),
          personalizedMessages: personalizedList && personalizedList.length > 0 ? personalizedList : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Failed to schedule SMS message');
        return;
      }

      toast.success(`Message scheduled for delivery on ${new Date(scheduleDate).toLocaleString()}!`);
      setScheduleOpen(false);
      setScheduleDate('');
      setScheduleError('');
      setManualRecipients('');
      setMessage('');
      setRecipientsTouched(false);
      setMessageTouched(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Network error scheduling message');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="Send SMS"
        description="Compose and send bulk SMS messages to your contacts."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
              <CardDescription>Configure your message sender and recipients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center min-h-8">
                    <Label htmlFor="sender" required>Sender ID</Label>
                  </div>
                  <Select value={senderId} onValueChange={setSenderId}>
                    <SelectTrigger id="sender">
                      <SelectValue placeholder="Select sender ID" />
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
                          <SelectItem value="RANGESMS">RANGESMS (Default)</SelectItem>
                          <SelectItem value="INFO">INFO (Transactional)</SelectItem>
                          <SelectItem value="RANGE">RANGE (Alphanumeric)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <div className="flex justify-between items-center min-h-8">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="recipients" required>Recipients</Label>
                      <CountryPickerDropdown
                        disabled={isGroupLoading}
                        selectedCountryCode={selectedDialCode}
                        onSelectRegion={(region) => {
                          if (!region.dialCode) return;
                          setSelectedDialCode(region.dialCode);
                          recipientsInputRef.current?.insertCountryCode(region.dialCode);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {isGroupLoading ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                          Loading contacts...
                        </span>
                      ) : (
                        <>
                          {validatedRecipients.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {validatedRecipients.length} validated
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground font-medium">
                            {totalRecipients} detected
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <PhoneRecipientsInput
                    ref={recipientsInputRef}
                    id="recipients"
                    placeholder="e.g. +256700123456, +256772123456"
                    value={manualRecipients}
                    onChange={(val) => {
                      setManualRecipients(val);
                      setRecipientsTouched(true);
                    }}
                    onBlur={() => setRecipientsTouched(true)}
                    readOnly={isGroupLoading}
                    disabled={isGroupLoading}
                    isLoading={isGroupLoading}
                    loadingMessage={`Loading contacts from ${currentGroupName}...`}
                    error={!isGroupLoading && !!recipientsError}
                    aria-describedby={recipientsError ? 'recipients-error' : undefined}
                  />
                  {recipientsError && !isGroupLoading && <InputError id="recipients-error" message={recipientsError} />}

                  {/* Verified Routes Badges */}
                  {carrierRouteSummary.length > 0 && !isGroupLoading && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Verified Routes:
                        </span>
                        {carrierRouteSummary.map((item) => (
                          <Badge
                            key={item.carrier}
                            variant="outline"
                            className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 flex items-center gap-1.5"
                            title={`Originally allocated network: ${item.carrier} (${item.count} ${item.count === 1 ? 'number' : 'numbers'})`}
                          >
                            <span className="font-medium text-foreground">
                              {item.carrier}:
                            </span>
                            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                              {item.count} {item.count === 1 ? 'number' : 'numbers'}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label htmlFor="message" required>Message Content</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-medium gap-1.5 rounded-md"
                      onClick={() => setShowGrammarCheck(true)}
                      type="button"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Grammar Check</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-medium gap-1.5 rounded-md"
                      onClick={() => setTemplateModalOpen(true)}
                      type="button"
                    >
                      <BookTemplate className="w-3.5 h-3.5" />
                      <span>Use Template</span>
                    </Button>
                    <VariableDropdown onSelect={handleInsertVariable} />
                  </div>
                </div>
                <VariableTextarea
                  ref={messageTextareaRef}
                  id="message"
                  rows={6}
                  placeholder="Type your message here, e.g. Hello {{firstName}}, your order #{{orderId}} of {{amount}} is ready..."
                  value={message}
                  onChange={(val) => {
                    setMessage(val);
                    setMessageTouched(true);
                  }}
                  onBlur={() => setMessageTouched(true)}
                  error={!!messageError}
                  aria-describedby={messageError ? 'message-error' : undefined}
                />
                {messageError && <InputError id="message-error" message={messageError} />}

                {/* Detected Variables Breakdown matching /sms/variables */}
                {detectedVariablesList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                    <span className="text-muted-foreground font-medium text-[11px]">
                      Detected Tags ({detectedVariablesList.length}):
                    </span>
                    {detectedVariablesList.map((varName) => {
                      const theme = getVariableColorTheme(varName);
                      return (
                        <span
                          key={varName}
                          className={cn(
                            'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono border font-medium',
                            theme.badgeClass
                          )}
                        >
                          {`{{${varName}}}`}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border text-xs">
                <div>
                  <div className="text-muted-foreground">Characters</div>
                  <div className="font-semibold text-sm mt-0.5">{charCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Segments</div>
                  <div className="font-semibold text-sm mt-0.5">{segments}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Encoding</div>
                  <div className="font-semibold text-sm mt-0.5">{encoding}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Est. Cost</div>
                  <div className="font-semibold text-sm text-[#04648C] dark:text-[#FBCA07] mt-0.5">
                    {cost.toLocaleString()} UGX
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border p-4 sm:p-6 bg-muted/10">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => setScheduleOpen(true)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
                <Button
                  onClick={handleSendNow}
                  disabled={sending}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Now
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={deliveryMode}
                onValueChange={setDeliveryMode}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                  <TabsTrigger value="import">Import</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="mt-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enter numbers manually or copy-paste a list of comma-separated phone numbers in the recipient box.
                  </p>
                  <div className="p-3 bg-muted/30 rounded-md border text-xs text-muted-foreground font-mono">
                    Format: +256700123456, 0772123456
                  </div>
                </TabsContent>
                <TabsContent value="groups" className="mt-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Select a targeted contact group to broadcast this message to.
                  </p>
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Groups" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name} ({g.count.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>
                <TabsContent value="import" className="mt-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Upload a CSV or Excel spreadsheet containing recipient phone numbers.
                  </p>
                  <Input type="file" accept=".csv, .xlsx" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground">Wallet Balance</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  45,000 UGX
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground">Estimated SMS Capacity</span>
                <span className="font-semibold">
                  {Math.floor(45000 / ratePerSms).toLocaleString()} SMS
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Carrier Route</span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {carrierRouteSummary.length > 0 ? (
                    carrierRouteSummary.map((item) => (
                      <NetworkBadge
                        key={item.carrier}
                        network={item.carrier}
                        size="sm"
                        showIcon={false}
                        title={`${item.carrier} Direct Route (${item.count} ${item.count === 1 ? 'recipient' : 'recipients'})`}
                      />
                    ))
                  ) : (
                    <>
                      <NetworkBadge
                        network="MTN"
                        size="sm"
                        showIcon={false}
                        title="MTN Direct Route"
                      />
                      <NetworkBadge
                        network="Airtel"
                        size="sm"
                        showIcon={false}
                        title="Airtel Direct Route"
                      />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-5 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Message Handset Preview
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Simulated preview of how your message displays on a recipient device with sample variable values.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="p-4 sm:p-5 pt-2 space-y-3">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-muted/40 border text-xs">
              <span className="text-[11px] font-medium text-muted-foreground px-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Preview Mode:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode('sample')}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer',
                    previewMode === 'sample'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Render message with highlighted sample values"
                >
                  Sample Data
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('realistic')}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer',
                    previewMode === 'realistic'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Simulate realistic handset text with resolved samples"
                >
                  Realistic SMS
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('raw')}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer',
                    previewMode === 'raw'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="View original template tags"
                >
                  Raw Tags
                </button>
              </div>
            </div>

            {/* Handset Message Bubble */}
            <div className="p-4 bg-muted/60 dark:bg-slate-900/60 rounded-xl min-h-[120px] whitespace-pre-wrap font-sans text-sm border shadow-inner">
              <div className="text-[11px] font-mono text-muted-foreground mb-3 pb-2 border-b border-border/50 flex items-center justify-between">
                <span className="font-semibold text-foreground">FROM: {senderId}</span>
                <span className="text-[10px]">NOW</span>
              </div>
              <div className="text-foreground leading-relaxed">
                {message ? (
                  <TemplateHighlighter
                    text={message}
                    resolveSampleValues={previewMode !== 'raw'}
                    variant={previewMode === 'realistic' ? 'plain' : 'badge'}
                  />
                ) : (
                  <span className="text-muted-foreground italic">Your message preview will appear here.</span>
                )}
              </div>
            </div>

            {/* Recipient & Metric Details */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-muted/20 p-2.5 rounded-lg border">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Simulated Recipient
                </span>
                <span className="font-medium text-foreground truncate block">
                  John Doe (+256 700 123456)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Rendered Length
                </span>
                <span className="font-medium text-foreground block">
                  {renderPreviewWithSamples(message || '').length} chars • {Math.max(1, Math.ceil(renderPreviewWithSamples(message || '').length / (isUnicode ? 70 : 160)))} segment
                </span>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 sm:p-5 pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t bg-muted/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPreview}
              disabled={!message}
              className="text-xs h-8 gap-1.5"
            >
              {copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedPreview ? 'Copied' : 'Copy Sample Text'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(false)} className="h-8 text-xs">
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selector Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Message Template</DialogTitle>
            <DialogDescription>
              Choose a pre-approved template to populate into your message composer.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3">
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl.content)}
                  className="p-3 bg-card hover:bg-muted/50 rounded-lg border border-border cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{tmpl.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {tmpl.category}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-sans line-clamp-2">
                    <TemplateHighlighter text={tmpl.content} />
                  </div>
                </div>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Schedule Message Dispatch</DialogTitle>
            <DialogDescription>
              Pick a future date and time when our automated queue will deliver this broadcast.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="schedule-time" required>Delivery Date &amp; Time</Label>
                <Input
                  id="schedule-time"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => {
                    setScheduleDate(e.target.value);
                    validateScheduleDate(e.target.value);
                  }}
                  onBlur={() => {
                    validateScheduleDate(scheduleDate);
                  }}
                  error={!!scheduleError}
                  aria-describedby={scheduleError ? 'schedule-time-error' : undefined}
                />
                {scheduleError && <InputError id="schedule-time-error" message={scheduleError} />}
              </div>
              <p className="text-xs text-muted-foreground">
                Scheduled broadcasts will queue in the background and deduct wallet credits at dispatch time.
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSchedule} disabled={scheduling}>
              {scheduling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Confirm Schedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      

      <GrammarCheckModal isOpen={showGrammarCheck} onClose={() => setShowGrammarCheck(false)} originalText={message} onApply={(corrected) => { setMessage(corrected); setMessageTouched(true); setShowGrammarCheck(false); }} />

      <VariableResolutionModal
        open={showVariableModal}
        onOpenChange={setShowVariableModal}
        recipients={parsedManualRecipients}
        variables={detectedVariables}
        templateMessage={message}
        onConfirm={handleConfirmVariableResolution}
      />

    </div>
  );
}

