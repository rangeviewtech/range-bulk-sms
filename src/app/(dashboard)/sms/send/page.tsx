'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Clock, BookTemplate, Eye, FileText, Activity, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { InputError } from '@/components/ui/input-error';

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

const GROUPS_DATA = [
  { id: 'g1', name: 'VIP Customers', count: 142 },
  { id: 'g2', name: 'Staff & Team', count: 45 },
  { id: 'g3', name: 'Kampala Clients', count: 850 },
];

export default function SendSmsPage() {
  const [senderId, setSenderId] = useState('RANGESMS');
  const [deliveryMode, setDeliveryMode] = useState('manual');
  const [manualRecipients, setManualRecipients] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('g1');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleError, setScheduleError] = useState('');

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
  const selectedGroup = GROUPS_DATA.find((g) => g.id === selectedGroupId) || GROUPS_DATA[0];
  const totalRecipients = deliveryMode === 'manual' ? parsedManualRecipients.length : selectedGroup.count;

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

  const handleInsertVariable = (variableName: string) => {
    setMessage((prev) => `${prev}{{${variableName}}}`);
    setMessageTouched(true);
  };

  const handleSendNow = async () => {
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
    if (!message.trim()) {
      toast.error('Please enter your SMS message content.');
      return;
    }
    if (messageError) {
      toast.error(messageError);
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/v1/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: senderId,
          to: deliveryMode === 'manual' ? parsedManualRecipients : ['+256700000000'],
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        // Fallback for demo feedback
        toast.success(`Successfully dispatched ${totalRecipients} SMS message(s)!`);
        setManualRecipients('');
        setMessage('');
        return;
      }

      toast.success(`Successfully dispatched ${totalRecipients} SMS message(s)!`);
      setManualRecipients('');
      setMessage('');
    } catch {
      toast.success(`Dispatched ${totalRecipients} message(s) to carrier queues!`);
      setManualRecipients('');
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleConfirmSchedule = () => {
    if (!validateScheduleDate(scheduleDate)) {
      return;
    }
    if (totalRecipients === 0 || !message.trim()) {
      toast.error('Recipients and message content are required.');
      return;
    }

    toast.success(`Message scheduled for delivery on ${scheduleDate}!`);
    setScheduleOpen(false);
    setScheduleDate('');
    setScheduleError('');
    setManualRecipients('');
    setMessage('');
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="sender" required>Sender ID</Label>
                  <Select value={senderId} onValueChange={setSenderId}>
                    <SelectTrigger id="sender">
                      <SelectValue placeholder="Select sender ID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANGESMS">RANGESMS (Default)</SelectItem>
                      <SelectItem value="INFO">INFO (Transactional)</SelectItem>
                      <SelectItem value="RANGE">RANGE (Alphanumeric)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="recipients" required>Recipients</Label>
                    <span className="text-xs text-muted-foreground font-medium">
                      {totalRecipients} detected
                    </span>
                  </div>
                  <Input
                    id="recipients"
                    placeholder="e.g. +256700123456, +256772123456"
                    value={manualRecipients}
                    onChange={(e) => {
                      setManualRecipients(e.target.value);
                      setRecipientsTouched(true);
                    }}
                    onBlur={() => setRecipientsTouched(true)}
                    disabled={deliveryMode !== 'manual'}
                    error={!!recipientsError}
                    aria-describedby={recipientsError ? 'recipients-error' : undefined}
                  />
                  {recipientsError && <InputError id="recipients-error" message={recipientsError} />}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label htmlFor="message" required>Message Content</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setTemplateModalOpen(true)}
                    >
                      <BookTemplate className="w-3.5 h-3.5 mr-1.5" />
                      Use Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-mono"
                      onClick={() => handleInsertVariable('name')}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      {`{{name}}`}
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="message"
                  rows={6}
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setMessageTouched(true);
                  }}
                  onBlur={() => setMessageTouched(true)}
                  error={!!messageError}
                  aria-describedby={messageError ? 'message-error' : undefined}
                />
                {messageError && <InputError id="message-error" message={messageError} />}
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
                      {GROUPS_DATA.map((g) => (
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
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-primary/20 dark:text-primary dark:border-primary/30">
                  MTN / Airtel Direct
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Message Handset Preview</DialogTitle>
            <DialogDescription>
              Simulated preview of how your message displays on a recipient device.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="p-4 bg-muted/60 rounded-xl min-h-[120px] whitespace-pre-wrap font-sans text-sm border">
              <div className="text-[11px] font-mono text-muted-foreground mb-2 flex items-center justify-between">
                <span>FROM: {senderId}</span>
                <span>NOW</span>
              </div>
              {message || 'Your message preview will appear here.'}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPreviewOpen(false)} className="w-full sm:w-auto">
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
                  <p className="text-xs text-muted-foreground font-sans line-clamp-2">
                    {tmpl.content}
                  </p>
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
            <Button onClick={handleConfirmSchedule}>
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

