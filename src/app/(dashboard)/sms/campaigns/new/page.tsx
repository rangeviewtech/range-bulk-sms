'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/ui/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Check, Send, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { VariableTextarea } from '@/components/sms/variable-textarea';
import { GrammarCheckModal } from '@/components/sms/grammar-check-modal';
import { VariableDropdown } from '@/components/sms/variable-dropdown';
import { cn } from '@/lib/utils';
import { TemplateHighlighter } from '@/components/sms/template-highlighter';

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
  { id: 'g1', name: 'All Customers', count: 15400 },
  { id: 'g2', name: 'VIP Members', count: 1200 },
  { id: 'g3', name: 'Leads & Inquiries', count: 5000 },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [campaignNameTouched, setCampaignNameTouched] = useState(false);
  const [senderId, setSenderId] = useState('RANGESMS');
  const [senderOptions, setSenderOptions] = useState<SenderOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>(INITIAL_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState('g1');
  const [message, setMessage] = useState('');
  const [messageTouched, setMessageTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
    const [showGrammarCheck, setShowGrammarCheck] = useState(false);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
  
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
        // Retain fallback data
      }
    }
    loadResources();
  }, []);

  const campaignNameError = campaignNameTouched
    ? !campaignName.trim()
      ? 'Campaign name is required.'
      : campaignName.trim().length < 2
      ? 'Campaign name must be at least 2 characters.'
      : campaignName.length > 100
      ? 'Campaign name cannot exceed 100 characters.'
      : ''
    : '';

  const messageError = messageTouched
    ? !message.trim()
      ? 'SMS message content is required.'
      : message.length > 3200
      ? 'Message is too long (maximum 3,200 characters).'
      : ''
    : '';

  const steps = [
    { id: 1, title: 'Details' },
    { id: 2, title: 'Recipients' },
    { id: 3, title: 'Message' },
    { id: 4, title: 'Review' },
  ];

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0] || { id: 'default', name: 'Default', count: 0 };
  const charCount = message.length;
  const isUnicode = /[^\x00-\x7F]/.test(message);
  const maxPerSegment = isUnicode ? 70 : 160;
  const segments = charCount > 0 ? Math.ceil(charCount / maxPerSegment) : 1;
  const ratePerSms = 35; // UGX standard
  const estimatedCost = selectedGroup.count * segments * ratePerSms;

  const handleInsertVariable = (variableName: string) => {
    const el = messageTextareaRef.current;
    if (!el) {
      setMessage((prev) => `${prev}{{${variableName}}}`);
      setMessageTouched(true);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = message;
    const before = current.substring(0, start);
    const after = current.substring(end, current.length);
    const newText = `${before}{{${variableName}}}${after}`;
    setMessage(newText);
    setMessageTouched(true);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + variableName.length + 4, start + variableName.length + 4);
    }, 0);
  };

  const handleNext = () => {
    if (step === 1) {
      setCampaignNameTouched(true);
      if (!campaignName.trim() || campaignName.trim().length < 2 || campaignName.length > 100) {
        toast.error('Please enter a valid campaign name to continue.');
        return;
      }
    }
    if (step === 3) {
      setMessageTouched(true);
      if (!message.trim() || message.length > 3200) {
        toast.error('Please enter your SMS message content.');
        return;
      }
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleLaunchCampaign = async () => {
    setSubmitting(true);
    try {
      const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const validGroupIds = selectedGroup && isUuid(selectedGroup.id) ? [selectedGroup.id] : [];

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName.trim(),
          senderId,
          message: message.trim(),
          groupIds: validGroupIds,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Failed to create campaign');
        return;
      }

      toast.success(`Campaign "${campaignName}" launched successfully!`);
      router.push('/sms/campaigns');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Network error launching campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="Create Campaign"
        description="Launch a new SMS marketing campaign in 4 easy steps."
      />

      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="relative px-2 sm:px-4">
          <div className="absolute top-4 sm:top-1/2 left-4 right-4 sm:left-6 sm:right-6 h-1 -translate-y-1/2 bg-muted rounded-full" />
          <div
            className="absolute top-4 sm:top-1/2 left-4 sm:left-6 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `calc(${((step - 1) / (steps.length - 1)) * 100}% - 12px)` }}
          />

          <div className="relative flex justify-between">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1.5 sm:gap-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-colors ${
                    step > s.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : step === s.id
                        ? 'bg-background border-secondary text-secondary dark:border-primary dark:text-primary font-bold'
                        : 'bg-background border-muted text-muted-foreground'
                  }`}
                >
                  {step > s.id ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s.id}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-medium ${
                    step >= s.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[step - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 min-h-[300px]">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="campaign-name" required>Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    placeholder="e.g. Summer Promo 2026"
                    value={campaignName}
                    onChange={(e) => {
                      setCampaignName(e.target.value);
                      if (!campaignNameTouched) setCampaignNameTouched(true);
                    }}
                    onBlur={() => setCampaignNameTouched(true)}
                    error={!!campaignNameError}
                    aria-describedby={campaignNameError ? 'campaign-name-error' : undefined}
                    autoFocus
                  />
                  {campaignNameError ? (
                    <InputError id="campaign-name-error" message={campaignNameError} />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      An internal label to identify this campaign in your delivery reports.
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sender-id-select" required>Sender ID</Label>
                  <Select value={senderId} onValueChange={setSenderId}>
                    <SelectTrigger id="sender-id-select">
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
                          <SelectItem value="RANGE">RANGE (Alphanumeric)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only approved sender IDs can be used for outbound broadcasts.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="contact-group-select" required>Select Contact Group</Label>
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger id="contact-group-select">
                      <SelectValue placeholder="Select groups" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name} ({g.count.toLocaleString()} contacts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target Audience:</span>
                    <span className="font-semibold text-foreground">{selectedGroup.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valid Phone Numbers:</span>
                    <span className="font-semibold text-foreground">
                      {selectedGroup.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Country Coverage:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Uganda (MTN / Airtel / Uganda Telecom)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="message-body" required>Message Content</Label>
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
                      <VariableDropdown onSelect={(key) => handleInsertVariable(key)} />
                    </div>
                  </div>
  
                  
                  <GrammarCheckModal isOpen={showGrammarCheck} onClose={() => setShowGrammarCheck(false)} originalText={message} onApply={(corrected) => { setMessage(corrected); setMessageTouched(true); setShowGrammarCheck(false); }} />
  
                  <VariableTextarea
                    ref={messageTextareaRef}
                    id="message-body"
                    rows={6}
                    placeholder="Type your campaign message here..."
                    value={message}
                    onChange={(val) => {
                      setMessage(val);
                      if (!messageTouched) setMessageTouched(true);
                    }}
                    onBlur={() => setMessageTouched(true)}
                    className={cn(
                      'resize-y min-h-[120px]',
                      messageError && 'border-destructive focus-visible:ring-destructive'
                    )}
                    required
                  />
                  {messageError && <InputError id="message-body-error" message={messageError} />}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg border text-xs">
                  <div>
                    <span className="text-muted-foreground block">Characters</span>
                    <span className="font-semibold text-sm">{charCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Segments</span>
                    <span className="font-semibold text-sm">{segments}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Encoding</span>
                    <span className="font-semibold text-sm">{isUnicode ? 'Unicode (UCS-2)' : 'GSM-7'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Unit Cost</span>
                    <span className="font-semibold text-sm">{segments * ratePerSms} UGX</span>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 bg-muted/20 p-5 rounded-xl border border-border">
                <h3 className="font-semibold text-lg pb-2 border-b border-border">
                  Campaign Order Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Campaign Name</span>
                    <span className="font-semibold text-foreground">
                      {campaignName || 'Untitled Campaign'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Sender ID</span>
                    <span className="font-mono font-bold text-secondary dark:text-primary">{senderId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Recipient Group</span>
                    <span className="font-medium text-foreground">
                      {selectedGroup.name} ({selectedGroup.count.toLocaleString()} recipients)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Message Segments</span>
                    <span className="font-medium text-foreground">
                      {segments} segment{segments > 1 ? 's' : ''} ({charCount} chars)
                    </span>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-border">
                    <span className="text-muted-foreground block text-xs mb-1">Message Preview</span>
                    <div className="p-3 bg-card rounded-md border font-sans text-xs sm:text-sm whitespace-pre-wrap">
                      {message ? (
                        <TemplateHighlighter text={message} />
                      ) : (
                        <span className="text-muted-foreground italic">No message provided.</span>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2 pt-2 flex items-baseline justify-between border-t border-border">
                    <div>
                      <span className="text-xs text-muted-foreground block">Total Estimated Cost</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedGroup.count.toLocaleString()} recipients × {segments} segment{segments > 1 ? 's' : ''} × {ratePerSms} UGX
                      </span>
                    </div>
                    <span className="text-2xl font-extrabold text-[#04648C] dark:text-[#FBCA07]">
                      {estimatedCost.toLocaleString()} UGX
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border p-4 sm:p-6 gap-3">
            <Button
              variant="outline"
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              disabled={step === 1 || submitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {step < 4 ? (
              <Button onClick={handleNext}>
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleLaunchCampaign}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Launching...
                  </>
                ) : (
                  <>
                    Launch Campaign <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

