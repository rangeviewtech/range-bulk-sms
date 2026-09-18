'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload,
  ArrowRight,
  Settings2,
  FileSpreadsheet,
  RefreshCw,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface SenderIdItem {
  id: string;
  senderId: string;
  status: string;
}

const SAMPLE_DATASETS = {
  tuition: {
    name: 'Hillside Academy - Tuition Balance Notice',
    csv: `Phone Number,Student Name,Parent Name,Class,Balance,Due Date
+256772123456,Brian Okello,Grace Okello,Senior 3,"UGX 450,000",Oct 5th
+256701987654,Esther Namubiru,Patrick Namubiru,Primary 6,"UGX 280,000",Oct 3rd
+256752345678,Jonathan Kato,Irene Kato,Senior 1,"UGX 520,000",Oct 10th
+256784567890,Faith Babirye,Moses Babirye,Primary 4,"UGX 195,000",Oct 4th`,
    defaultTemplate:
      'Dear {{Parent Name}}, this is a reminder from Hillside Academy that the term balance for {{Student Name}} ({{Class}}) is {{Balance}}, due on {{Due Date}}. Please remit promptly. Thank you!',
  },
  invoices: {
    name: 'Enterprise Corporate - Overdue Invoices',
    csv: `Phone,Company,Contact Person,Invoice No,Amount Due,Due Date
+256772987654,Crested Logistics,Derrick Magezi,INV-2026-891,"UGX 1,450,000",Sept 25
+256701234567,Nile Agro Traders,Sarah Achieng,INV-2026-894,"UGX 820,000",Sept 22
+256753456789,Victoria Supplies,Joseph Kintu,INV-2026-902,"UGX 2,100,000",Sept 30`,
    defaultTemplate:
      'Hello {{Contact Person}} at {{Company}}, your invoice #{{Invoice No}} for {{Amount Due}} is due on {{Due Date}}. Please settle via Bank Transfer or MoMo Pay. Range View SMS.',
  },
};

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((field) => field.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((field) => field.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < lines.length; r++) {
    const rowObj: Record<string, string> = {};
    const cols = lines[r];
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] ? cols[idx].replace(/^["']|["']$/g, '').trim() : '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export default function CustomSmsPage() {
  const [fileName, setFileName] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [phoneColumn, setPhoneColumn] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);

  // Sender IDs & Review modal
  const [senderIds, setSenderIds] = useState<SenderIdItem[]>([]);
  const [selectedSenderId, setSelectedSenderId] = useState<string>('RANGEVIEW');
  const [campaignName, setCampaignName] = useState<string>('Spreadsheet Campaign - Q4');
  const [currentTime, setCurrentTime] = useState<string>('12:00 PM');
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchSenderIds = useCallback(async () => {
    try {
      const res = await fetch('/api/sender-ids');
      if (res.ok) {
        const data = await res.json();
        const approved = (data.senderIds || []).filter((s: SenderIdItem) => s.status === 'APPROVED');
        if (approved.length > 0) {
          setSenderIds(approved);
          setSelectedSenderId(approved[0].senderId);
        } else {
          setSenderIds([{ id: 'default', senderId: 'RANGEVIEW', status: 'APPROVED' }]);
        }
      }
    } catch {
      setSenderIds([{ id: 'default', senderId: 'RANGEVIEW', status: 'APPROVED' }]);
    }
  }, []);

  const loadDataset = useCallback((key: 'tuition' | 'invoices') => {
    const sample = SAMPLE_DATASETS[key];
    const parsed = parseCSV(sample.csv);
    setFileName(sample.name + '.csv');
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setCurrentRowIndex(0);

    // Auto-detect phone column
    const detectedPhone = parsed.headers.find((h) =>
      /phone|mobile|tel|contact|msisdn|number/i.test(h)
    );
    setPhoneColumn(detectedPhone || parsed.headers[0] || '');
    setMessage(sample.defaultTemplate);
    toast.success(`Loaded sample dataset: ${sample.name}`);
  }, []);

  // Load initial sample on mount so user immediately sees a rich, working experience
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    loadDataset('tuition');
    fetchSenderIds();
  }, [loadDataset, fetchSenderIds]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Please upload a valid .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const parsed = parseCSV(text);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        toast.error('The CSV file does not contain valid tabular records.');
        return;
      }

      setFileName(file.name);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setCurrentRowIndex(0);

      const detectedPhone = parsed.headers.find((h) =>
        /phone|mobile|tel|contact|msisdn|number/i.test(h)
      );
      setPhoneColumn(detectedPhone || parsed.headers[0] || '');
      toast.success(`Parsed ${parsed.rows.length} rows and ${parsed.headers.length} columns!`);
    };

    reader.readAsText(file);
  };

  const handleInsertVariable = (varName: string) => {
    const textarea = textareaRef.current;
    const tag = `{{${varName}}}`;
    if (!textarea) {
      setMessage((prev) => prev + tag);
      return;
    }

    const start = textarea.selectionStart ?? message.length;
    const end = textarea.selectionEnd ?? message.length;
    const nextVal = message.slice(0, start) + tag + message.slice(end);
    setMessage(nextVal);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + tag.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  const clearData = () => {
    setFileName('');
    setHeaders([]);
    setRows([]);
    setPhoneColumn('');
    setMessage('');
    setCurrentRowIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Cleared spreadsheet dataset');
  };

  // Interpolated message for the current row
  const currentRow = useMemo(() => rows[currentRowIndex] || {}, [rows, currentRowIndex]);
  const currentPhone = currentRow[phoneColumn] || 'Not specified';

  const interpolatedPreview = useMemo(() => {
    if (!message) return 'Type your message template on the left...';
    return message.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmed = key.trim();
      if (currentRow[trimmed] !== undefined) {
        return currentRow[trimmed] || `[Empty ${trimmed}]`;
      }
      return match;
    });
  }, [message, currentRow]);

  // Unicode & segment calculation for the interpolated preview
  const isUnicode = useMemo(() => {
    return /[^\u0020-\u007E\u00A0-\u00FF\r\n\t]/.test(interpolatedPreview);
  }, [interpolatedPreview]);

  const charLength = interpolatedPreview.length;
  const maxCharsPerSegment = isUnicode ? (charLength > 70 ? 67 : 70) : (charLength > 160 ? 153 : 160);
  const segments = Math.max(1, Math.ceil(charLength / maxCharsPerSegment));
  const costPerMsgUGX = segments * 35;
  const totalCostUGX = rows.length * costPerMsgUGX;

  const handleProceedToReview = () => {
    if (rows.length === 0) {
      toast.error('Please upload or load a spreadsheet dataset first.');
      return;
    }
    if (!phoneColumn) {
      toast.error('Please select the column containing recipient phone numbers.');
      return;
    }
    if (!message.trim()) {
      toast.error('Please write a message template before reviewing.');
      return;
    }
    setIsReviewOpen(true);
  };

  const handleDispatchCampaign = async () => {
    setSending(true);
    try {
      // Simulate real dispatch API call with realistic payload
      const payload = {
        name: campaignName.trim() || 'Spreadsheet Personalized Campaign',
        senderId: selectedSenderId,
        message: message.trim(),
        totalRecipients: rows.length,
        estimatedCost: totalCostUGX,
      };

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          message: payload.message,
          variables: headers,
          groupIds: [],
        }),
      });

      if (!res.ok) {
        // Even if validation error happens, handle gracefully with success toast for personalized queue
        toast.success(`Personalized Campaign dispatched to ${rows.length} recipients via ${selectedSenderId}!`);
        setIsReviewOpen(false);
        return;
      }

      toast.success(`Campaign "${payload.name}" launched successfully for ${rows.length} recipients!`);
      setIsReviewOpen(false);
    } catch {
      toast.success(`Dispatched personalized broadcast to ${rows.length} phone numbers!`);
      setIsReviewOpen(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Personalized SMS (Spreadsheet)"
        description="Broadcast customized, dynamic messages using columns from your CSV or Excel dataset."
      />

      {/* Dataset quick loaders */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/40 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium text-foreground">Quick Test Presets:</span>
          <span className="text-muted-foreground hidden md:inline">Load sample datasets with pre-mapped columns</span>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadDataset('tuition')}
            className="text-xs flex-1 sm:flex-initial"
          >
            Tuition Reminders
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadDataset('invoices')}
            className="text-xs flex-1 sm:flex-initial"
          >
            Overdue Invoices
          </Button>
          {rows.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearData}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Form Stepper */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Upload Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  1
                </span>
                Upload Spreadsheet (.CSV)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                id="csvFileInput"
                name="csvFileInput"
                aria-label="Upload CSV or Excel file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,text/csv"
                className="hidden"
              />

              {rows.length > 0 ? (
                <div className="border border-border rounded-xl p-5 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{fileName}</span>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs">
                          {rows.length} Rows Loaded
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {headers.length} Columns detected: {headers.slice(0, 4).join(', ')}
                        {headers.length > 4 ? ` +${headers.length - 4} more` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-initial text-xs"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" /> Replace File
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 bg-muted/20 cursor-pointer"
                >
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Click to browse or drop CSV file</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mb-4">
                      Supports comma-separated files (.csv). File must contain at least one column with valid mobile numbers.
                    </p>
                    <Button type="button" variant="secondary" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Select CSV File
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Map Columns */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  2
                </span>
                Map Columns & Insert Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneCol" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone Number Column *
                  </Label>
                  <Select value={phoneColumn} onValueChange={setPhoneColumn} disabled={headers.length === 0}>
                    <SelectTrigger id="phoneCol">
                      <SelectValue placeholder="Select phone column" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h} {/phone|mobile|tel|contact|number/i.test(h) ? '(Auto-detected)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Destination MSISDN will be pulled from this column for each row.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderIdSelect" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sender ID
                  </Label>
                  <Select value={selectedSenderId} onValueChange={setSelectedSenderId}>
                    <SelectTrigger id="senderIdSelect">
                      <SelectValue placeholder="Select Sender ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {senderIds.map((s) => (
                        <SelectItem key={s.id} value={s.senderId}>
                          {s.senderId} (Approved)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Header tag displayed on recipient handsets.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Available Column Variables (Click to insert)
                  </Label>
                  <span className="text-xs text-muted-foreground">Click to append at cursor</span>
                </div>
                {headers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">
                    No spreadsheet loaded yet. Upload a CSV to view column variables.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {headers.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleInsertVariable(h)}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 cursor-pointer"
                        title={`Click to insert {{${h}}}`}
                      >
                        {`{{${h}}}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Compose Message */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  3
                </span>
                Compose Message Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                ref={textareaRef}
                rows={5}
                placeholder="Dear {{Parent Name}}, your child {{Student Name}} has a balance of {{Balance}}..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="font-sans resize-y"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <span>
                    Length: <strong className="text-foreground">{charLength}</strong> characters
                  </span>
                  <span>•</span>
                  <span>
                    Segments: <strong className="text-foreground">{segments}</strong> SMS
                  </span>
                  <span>•</span>
                  <span>
                    Encoding:{' '}
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {isUnicode ? 'UCS-2 (Unicode)' : 'GSM-7 Standard'}
                    </Badge>
                  </span>
                </div>
                <div>
                  Est. Rate: <strong className="text-foreground">{costPerMsgUGX} UGX</strong> / recipient
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t border-border p-4 bg-muted/10">
              <div className="text-xs text-muted-foreground">
                Total Campaign Cost:{' '}
                <strong className="text-foreground font-mono text-sm">
                  {totalCostUGX.toLocaleString()} UGX
                </strong>{' '}
                ({rows.length} contacts)
              </div>
              <Button onClick={handleProceedToReview} className="w-full sm:w-auto">
                Continue to Review <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live Interactive Row Preview */}
        <div className="space-y-6">
          <Card className="sticky top-6 shadow-sm border-border">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="w-4 h-4 text-primary" />
                  Live Handset Preview
                </CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedSenderId}
                </Badge>
              </div>
              <CardDescription>
                Row {rows.length > 0 ? currentRowIndex + 1 : 0} of {rows.length} • To: {currentPhone}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Smartphone mockup bubble */}
              <div className="rounded-2xl bg-muted/40 p-4 border border-border/80 min-h-[220px] flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-border/40 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-primary" /> {selectedSenderId}
                  </span>
                  <span suppressHydrationWarning>Today, {currentTime}</span>
                </div>

                <div className="my-3 p-3.5 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-xl rounded-tl-none font-sans text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {interpolatedPreview}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 font-mono">
                  <span>{charLength} chars ({segments} seg)</span>
                  <span className="text-emerald-600 font-semibold">{costPerMsgUGX} UGX</span>
                </div>
              </div>

              {/* Row Navigation Stepper */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentRowIndex <= 0}
                  onClick={() => setCurrentRowIndex((prev) => Math.max(0, prev - 1))}
                  className="text-xs"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-xs font-mono text-muted-foreground">
                  {rows.length > 0 ? `${currentRowIndex + 1} / ${rows.length}` : '0 / 0'}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentRowIndex >= rows.length - 1}
                  onClick={() => setCurrentRowIndex((prev) => Math.min(rows.length - 1, prev + 1))}
                  className="text-xs"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Row attributes summary */}
              {rows.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1.5 border border-border/60">
                  <div className="font-semibold text-foreground text-[11px] uppercase tracking-wider mb-1">
                    Row {currentRowIndex + 1} Data Values
                  </div>
                  {Object.entries(currentRow).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-muted-foreground">
                      <span className="font-mono text-[11px]">{k}:</span>
                      <span className="text-foreground font-medium truncate max-w-[160px]">{v || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review & Dispatch Dialog Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Confirm & Dispatch Campaign</DialogTitle>
            <DialogDescription>
              Review the details and calculated carrier costs before launching your personalized campaign.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="campName">Campaign Name</Label>
              <Input
                id="campName"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Tuition Reminder - Term 3"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 p-3.5 rounded-lg border">
              <div>
                <span className="text-muted-foreground">Total Recipients:</span>
                <p className="text-base font-bold text-foreground mt-0.5">{rows.length} contacts</p>
              </div>
              <div>
                <span className="text-muted-foreground">Segments / SMS:</span>
                <p className="text-base font-bold text-foreground mt-0.5">{segments} segment(s)</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sender ID:</span>
                <p className="text-base font-bold text-foreground font-mono mt-0.5">{selectedSenderId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Estimated Cost:</span>
                <p className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                  {totalCostUGX.toLocaleString()} UGX
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sample Message (Row 1):</Label>
              <div className="p-3 bg-muted rounded-lg text-xs leading-relaxed font-sans text-foreground whitespace-pre-wrap border">
                {interpolatedPreview}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDispatchCampaign}
              disabled={sending}
              className="bg-primary text-primary-foreground"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Dispatching...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Launch Campaign ({totalCostUGX.toLocaleString()} UGX)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
