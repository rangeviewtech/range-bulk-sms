'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Send,
  Sparkles,
  Upload,
  Download,
  Search,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  X,
  FileText,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import readXlsxFile from 'read-excel-file/browser';

export interface VariableResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: string[];
  variables: string[];
  templateMessage: string;
  onConfirm: (
    personalizedMessages: { phone: string; message: string }[],
    hasFallback: boolean
  ) => void | Promise<void>;
  isLoading?: boolean;
}

interface RecipientVariableData {
  phone: string;
  values: Record<string, string>;
  skipVariables: boolean;
  plainTextMessage?: string;
}

/**
 * Returns clean sample values for given variable key based on row index
 */
function getSampleValueForVariable(key: string, index: number): string {
  const normalized = key.toLowerCase().replace(/[{}\[\]_]/g, '');
  const names = ['Sarah Namubiru', 'John Okello', 'Brenda Akello', 'David Ssemwogerere', 'Grace Atuhaire'];
  const firstNames = ['Sarah', 'John', 'Brenda', 'David', 'Grace'];
  const lastNames = ['Namubiru', 'Okello', 'Akello', 'Ssemwogerere', 'Atuhaire'];
  const amounts = ['50,000 UGX', '120,000 UGX', '35,000 UGX', '85,000 UGX', '200,000 UGX'];
  const orders = ['ORD-8941', 'ORD-8942', 'ORD-8943', 'ORD-8944', 'ORD-8945'];
  const accounts = ['ACC-84920', 'ACC-84921', 'ACC-84922', 'ACC-84923', 'ACC-84924'];

  const idx = (index - 1) % 5;

  if (normalized === 'name' || normalized === 'fullname') return names[idx];
  if (normalized === 'firstname') return firstNames[idx];
  if (normalized === 'lastname') return lastNames[idx];
  if (normalized.includes('order')) return orders[idx];
  if (normalized.includes('amount') || normalized.includes('price') || normalized.includes('fee')) return amounts[idx];
  if (normalized.includes('account')) return accounts[idx];
  if (normalized.includes('date')) return '2026-09-24';
  if (normalized.includes('time')) return '14:30';
  if (normalized.includes('company') || normalized.includes('org')) return 'Range View Tech';
  if (normalized.includes('email')) return `client${index}@example.com`;
  if (normalized.includes('code') || normalized.includes('pin')) return `${1000 + index * 123}`;

  return `Sample ${key}`;
}

/**
 * Strip variable tags from template message to produce clean default plain text
 */
function stripVariables(text: string, variables: string[]): string {
  let cleaned = text;
  variables.forEach((v) => {
    cleaned = cleaned.replace(new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`, 'g'), '');
  });
  return cleaned.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Robust CSV/TSV text parser that handles quotes and line-breaks
 */
function parseCsvContent(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' || char === "'") {
      if (inQuotes && nextChar === char) {
        cell += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === '\t') && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      if (row.some((c) => c.length > 0)) {
        lines.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

export function VariableResolutionModal({
  open,
  onOpenChange,
  recipients,
  variables,
  templateMessage,
  onConfirm,
  isLoading,
}: VariableResolutionModalProps) {
  const [data, setData] = React.useState<RecipientVariableData[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterMode, setFilterMode] = React.useState<'all' | 'missing' | 'complete' | 'plain'>('all');
  const [firstEnteredPlainText, setFirstEnteredPlainText] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize data when modal opens
  React.useEffect(() => {
    if (open) {
      const defaultPlain = stripVariables(templateMessage, variables);
      setFirstEnteredPlainText('');
      setSearchQuery('');
      setFilterMode('all');
      setCurrentPage(1);

      const uniqueRecipients = Array.from(new Set(recipients)).filter(Boolean);
      const initialList = uniqueRecipients.length > 0 ? uniqueRecipients : ['+256700111111'];

      setData(
        initialList.map((phone) => ({
          phone,
          values: variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {}),
          skipVariables: false,
          plainTextMessage: defaultPlain,
        }))
      );
    }
  }, [open, recipients, variables, templateMessage]);

  // Update a specific variable value for a recipient
  const handleValueChange = (phone: string, variable: string, value: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.phone === phone
          ? { ...item, values: { ...item.values, [variable]: value } }
          : item
      )
    );
  };

  // Toggle "Send Plain" mode for a recipient
  const handleSkipChange = (phone: string, skip: boolean) => {
    setData((prev) => {
      // Determine what plain text should be assigned
      let defaultMsg = firstEnteredPlainText.trim();
      if (!defaultMsg) {
        const found = prev.find((r) => r.plainTextMessage && r.plainTextMessage.trim().length > 0);
        if (found?.plainTextMessage) {
          defaultMsg = found.plainTextMessage.trim();
        }
      }
      if (!defaultMsg) {
        defaultMsg = stripVariables(templateMessage, variables);
      }

      return prev.map((item) => {
        if (item.phone !== phone) return item;
        const currentPlain = item.plainTextMessage?.trim();
        return {
          ...item,
          skipVariables: skip,
          plainTextMessage: skip
            ? (currentPlain ? item.plainTextMessage : defaultMsg)
            : item.plainTextMessage,
        };
      });
    });
  };

  // Handle plain text content changes
  const handlePlainTextChange = (phone: string, text: string) => {
    setData((prev) => {
      const target = prev.find((p) => p.phone === phone);
      const wasFirstEmpty = !firstEnteredPlainText && text.trim().length > 0;

      const updated = prev.map((item) => {
        if (item.phone === phone) {
          return { ...item, plainTextMessage: text };
        }
        // If other recipients are in "plain" mode but haven't typed their own text yet,
        // sync the first entered text to them as requested
        if (wasFirstEmpty && item.skipVariables && (!item.plainTextMessage || item.plainTextMessage === target?.plainTextMessage)) {
          return { ...item, plainTextMessage: text };
        }
        return item;
      });

      return updated;
    });

    if (!firstEnteredPlainText && text.trim().length > 0) {
      setFirstEnteredPlainText(text);
    }
  };

  // 1-click action: Apply current plain text message to all other plain text recipients
  const handleApplyPlainToAll = (text: string) => {
    if (!text.trim()) {
      toast.warning('Please enter some text before copying to other recipients.');
      return;
    }
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        plainTextMessage: item.skipVariables ? text : item.plainTextMessage,
      }))
    );
    setFirstEnteredPlainText(text);
    toast.success('Applied message to all plain text recipients!');
  };

  // Master toggle: Switch all recipients to Plain Text or Variables
  const handleToggleAllMode = (toPlain: boolean) => {
    const defaultMsg = firstEnteredPlainText.trim() || stripVariables(templateMessage, variables);
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        skipVariables: toPlain,
        plainTextMessage: toPlain
          ? (item.plainTextMessage?.trim() ? item.plainTextMessage : defaultMsg)
          : item.plainTextMessage,
      }))
    );
    toast.info(toPlain ? 'Switched all recipients to plain text' : 'Switched all recipients to variable tags');
  };

  // Fill all empty variable inputs with realistic sample values
  const handleFillSamples = () => {
    setData((prev) =>
      prev.map((item, idx) => {
        const newValues: Record<string, string> = { ...item.values };
        variables.forEach((v) => {
          if (!newValues[v]?.trim()) {
            newValues[v] = getSampleValueForVariable(v, idx + 1);
          }
        });
        return {
          ...item,
          values: newValues,
        };
      })
    );
    toast.success('Filled empty variable inputs with sample data!');
  };

  // Reset variable values
  const handleClearVariables = () => {
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        values: variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {}),
      }))
    );
    toast.info('Cleared variable inputs.');
  };

  // Handle uploaded spreadsheet / CSV file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let headers: string[] = [];
      let rows: string[][] = [];

      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const rawResult = await readXlsxFile(file);
        let parsedExcelRows: unknown[][] = [];
        if (Array.isArray(rawResult) && rawResult.length > 0) {
          const first = rawResult[0];
          if (first && typeof first === 'object' && 'data' in first && Array.isArray((first as { data: unknown[][] }).data)) {
            parsedExcelRows = (first as { data: unknown[][] }).data;
          } else {
            parsedExcelRows = (rawResult as unknown) as unknown[][];
          }
        }
        if (parsedExcelRows.length > 0) {
          headers = (parsedExcelRows[0] || []).map((c) => String(c ?? ''));
          rows = parsedExcelRows.slice(1).map((r) => r.map((c) => String(c ?? '')));
        }
      } else {
        const text = await file.text();
        const parsed = parseCsvContent(text);
        if (parsed.length > 0) {
          headers = parsed[0] || [];
          rows = parsed.slice(1);
        }
      }

      if (headers.length === 0 || rows.length === 0) {
        toast.error('The selected file appears to be empty or unreadable.');
        return;
      }

      processUploadedRows(headers, rows, file.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse file. Ensure it is a valid CSV or Excel file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Match columns from file into modal state
  const processUploadedRows = (headers: string[], rows: string[][], filename: string) => {
    const cleanHeaders = headers.map((h) =>
      h.trim().toLowerCase().replace(/[{}\[\]_]/g, '')
    );

    // Locate phone column
    const phoneIdx = cleanHeaders.findIndex((h) =>
      ['phone', 'phonenumber', 'recipient', 'recipients', 'mobile', 'msisdn', 'number', 'contact', 'tel'].some((k) =>
        h.includes(k)
      )
    );

    // Locate variables
    const varIndices: Record<string, number> = {};
    variables.forEach((v) => {
      const vClean = v.toLowerCase().replace(/[{}\[\]_]/g, '');
      const idx = cleanHeaders.findIndex((h) => h === vClean || h.includes(vClean));
      if (idx !== -1) {
        varIndices[v] = idx;
      }
    });

    // Locate plain text column
    const plainIdx = cleanHeaders.findIndex((h) =>
      ['plaintext', 'plain', 'message', 'text', 'sms', 'custommessage', 'content'].some((k) =>
        h.includes(k)
      )
    );

    let updatedCount = 0;
    let newRecipientsCount = 0;

    setData((prev) => {
      const nextData = [...prev];
      let firstPlain = firstEnteredPlainText;

      rows.forEach((row, rowIdx) => {
        if (!row || row.length === 0 || row.every((c) => !c.trim())) return;

        let targetIndex = -1;

        if (phoneIdx !== -1 && row[phoneIdx]) {
          const rawPhone = row[phoneIdx].trim();
          targetIndex = nextData.findIndex((item) => {
            const cleanA = item.phone.replace(/[^0-9]/g, '');
            const cleanB = rawPhone.replace(/[^0-9]/g, '');
            return (
              cleanA === cleanB ||
              (cleanA.length >= 9 && cleanB.length >= 9 && (cleanA.endsWith(cleanB.slice(-9)) || cleanB.endsWith(cleanA.slice(-9))))
            );
          });

          // If phone in file is not in current list, append it!
          if (targetIndex === -1 && rawPhone.length >= 7) {
            const newItem: RecipientVariableData = {
              phone: rawPhone,
              values: variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {}),
              skipVariables: false,
              plainTextMessage: '',
            };
            nextData.push(newItem);
            targetIndex = nextData.length - 1;
            newRecipientsCount++;
          }
        } else if (rowIdx < nextData.length) {
          // If no phone column present, match by row index
          targetIndex = rowIdx;
        }

        if (targetIndex !== -1 && targetIndex < nextData.length) {
          const item = { ...nextData[targetIndex], values: { ...nextData[targetIndex].values } };
          let changed = false;

          // Populate variable values
          variables.forEach((v) => {
            const colIdx = varIndices[v];
            if (colIdx !== undefined && row[colIdx] !== undefined && row[colIdx].trim() !== '') {
              item.values[v] = row[colIdx].trim();
              changed = true;
            }
          });

          // Populate plain text if present
          if (plainIdx !== -1 && row[plainIdx] !== undefined && row[plainIdx].trim() !== '') {
            item.plainTextMessage = row[plainIdx].trim();
            item.skipVariables = true;
            if (!firstPlain) firstPlain = item.plainTextMessage;
            changed = true;
          }

          if (changed) {
            nextData[targetIndex] = item;
            updatedCount++;
          }
        }
      });

      if (firstPlain && !firstEnteredPlainText) {
        setFirstEnteredPlainText(firstPlain);
      }

      return nextData;
    });

    if (updatedCount > 0 || newRecipientsCount > 0) {
      toast.success(
        `Imported from ${filename}: updated ${updatedCount} recipient record(s)${
          newRecipientsCount > 0 ? ` and added ${newRecipientsCount} new recipient(s)` : ''
        }!`
      );
    } else {
      toast.warning(
        `File read, but no matching variables found. Columns should include: ${['phone', ...variables].join(', ')}`
      );
    }
  };

  // Download comprehensive sample CSV with active variables, dates, and realistic rows
  const handleDownloadSampleFile = () => {
    // Other common system & custom variables with sample data
    const additionalColumns = [
      { key: 'date', sample: '2026-09-24' },
      { key: 'dueDate', sample: '2026-10-01' },
      { key: 'amount', sample: '50,000 UGX' },
      { key: 'company', sample: 'Range View Tech' },
      { key: 'email', sample: 'sarah.n@example.com' },
      { key: 'accountNumber', sample: 'ACC-84920' },
    ];

    // Filter out columns already in variables
    const extraCols = additionalColumns.filter(
      (c) => !variables.some((v) => v.toLowerCase() === c.key.toLowerCase())
    );

    const headers = ['phone', ...variables, ...extraCols.map((c) => c.key), 'plainText'];

    const samplePhoneNumbers = [
      '+256700111250',
      '+256700111251',
      '+256772123452',
      '+256750987654',
      '+256780112233',
    ];

    const sampleRows = samplePhoneNumbers.map((phone, idx) => {
      const varValues = variables.map((v) => getSampleValueForVariable(v, idx + 1));
      const extraValues = extraCols.map((c) => getSampleValueForVariable(c.key, idx + 1));
      const plainSample =
        idx === 2
          ? 'Hello Brenda, your parcel is ready for collection at our Kampala hub.'
          : '';

      return [phone, ...varValues, ...extraValues, plainSample];
    });

    const escapeCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...sampleRows.map((r) => r.map(escapeCsv).join(','))].join(
        '\r\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sms_variable_template_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Sample file downloaded! Open in Excel or Google Sheets to fill your data.');
  };

  // Validation checks
  const isRowComplete = React.useCallback(
    (item: RecipientVariableData) => {
      if (item.skipVariables) {
        return (item.plainTextMessage ?? '').trim().length > 0;
      }
      return variables.every((v) => (item.values[v] || '').trim().length > 0);
    },
    [variables]
  );

  const missingCount = React.useMemo(() => {
    return data.filter((item) => !isRowComplete(item)).length;
  }, [data, isRowComplete]);

  const plainCount = React.useMemo(() => {
    return data.filter((item) => item.skipVariables).length;
  }, [data]);

  const isFormValid = React.useMemo(() => {
    return data.length > 0 && data.every(isRowComplete);
  }, [data, isRowComplete]);

  // Search & Filter
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Filter tab
      if (filterMode === 'missing' && isRowComplete(item)) return false;
      if (filterMode === 'complete' && !isRowComplete(item)) return false;
      if (filterMode === 'plain' && !item.skipVariables) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      if (item.phone.toLowerCase().includes(q)) return true;
      if (item.plainTextMessage?.toLowerCase().includes(q)) return true;
      return Object.values(item.values).some((val) => val.toLowerCase().includes(q));
    });
  }, [data, filterMode, searchQuery, isRowComplete]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Send Action: Compile final resolved or plain messages for every recipient
  const handleSend = () => {
    if (!isFormValid) {
      toast.error(`Please provide values for the ${missingCount} recipient(s) with missing data.`);
      return;
    }

    const personalizedMessages = data.map((item) => {
      let customMessage = '';

      if (item.skipVariables) {
        // User chose to send plain text for this recipient
        if (item.plainTextMessage && item.plainTextMessage.trim().length > 0) {
          customMessage = item.plainTextMessage.trim();
        } else {
          customMessage = stripVariables(templateMessage, variables);
        }
      } else {
        // Substitute variables with recipient-specific values
        customMessage = templateMessage;
        variables.forEach((v) => {
          const val = item.values[v] || '';
          const regex = new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`, 'g');
          customMessage = customMessage.replace(regex, val);
        });
      }

      return { phone: item.phone, message: customMessage };
    });

    const hasFallback = data.some((item) => item.skipVariables);
    onConfirm(personalizedMessages, hasFallback);
  };

  const allArePlain = data.length > 0 && data.every((d) => d.skipVariables);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl border-border bg-card">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border bg-muted/20 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Resolve Message Variables
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Your message contains <strong>{variables.length} variable(s)</strong> (
                {variables.map((v) => `{{${v}}}`).join(', ')}). 
                Provide values for each recipient, upload a spreadsheet, or customize individual plain text messages.
              </DialogDescription>
            </div>

            {/* Quick Actions: Download Sample & Upload File */}
            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .tsv, .txt"
                className="hidden"
                onChange={handleFileUpload}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadSampleFile}
                className="h-8 text-xs gap-1.5 font-medium border-border/80 shadow-2xs hover:bg-muted"
                title="Download sample CSV template with all table columns, variables, and dates"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Sample File</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs gap-1.5 font-medium border-primary/30 text-primary hover:bg-primary/10 shadow-2xs"
                title="Upload CSV or Excel file with recipient data"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Parsing...' : 'Upload Data File'}</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleFillSamples}
                className="h-8 text-xs gap-1 font-medium shadow-2xs"
                title="Auto-fill empty variable inputs with realistic sample values"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Fill Samples</span>
              </Button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recipients or values..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 pl-8 text-xs bg-background/70 border-border"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-muted-foreground font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('all');
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  filterMode === 'all'
                    ? 'bg-foreground text-background font-semibold shadow-2xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                All ({data.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('missing');
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1',
                  filterMode === 'missing'
                    ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                )}
              >
                Missing ({missingCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('plain');
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  filterMode === 'plain'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                Plain Text ({plainCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('complete');
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  filterMode === 'complete'
                    ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                )}
              >
                Complete ({data.length - missingCount})
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-auto p-0 min-h-[340px] max-h-[55vh]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/50 sticky top-0 z-10 shadow-xs border-b border-border/80 backdrop-blur-xs">
              <tr>
                <th className="px-4 py-3 font-semibold text-foreground border-r border-border/40 w-44">
                  <div className="flex items-center justify-between">
                    <span>Recipient</span>
                    <span className="text-[10px] text-muted-foreground font-mono font-normal">
                      ({filteredData.length})
                    </span>
                  </div>
                </th>
                {variables.map((v) => (
                  <th
                    key={v}
                    className="px-4 py-3 font-semibold text-foreground border-r border-border/40 min-w-[170px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-primary font-bold">{`{{${v}}}`}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({getSampleValueForVariable(v, 1)})
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold text-foreground text-center w-36">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs">Send Plain</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllMode(!allArePlain)}
                      className="text-[10px] text-primary hover:underline font-normal cursor-pointer"
                      title={allArePlain ? 'Switch all to variables' : 'Switch all to plain text'}
                    >
                      {allArePlain ? 'All Vars' : 'All Plain'}
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={variables.length + 2}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileSpreadsheet className="w-8 h-8 mx-auto text-muted-foreground/60" />
                      <p className="text-sm font-medium">No recipients found</p>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery
                          ? `No matches for "${searchQuery}". Clear your search to view all.`
                          : 'No recipients match the active filter criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const isPlain = item.skipVariables;
                  const rowMissing = !isRowComplete(item);
                  const rowIndex = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr
                      key={item.phone}
                      className={cn(
                        'transition-colors hover:bg-muted/20',
                        isPlain && 'bg-muted/10',
                        rowMissing && !isPlain && 'bg-amber-500/[0.02]'
                      )}
                    >
                      {/* Recipient Cell */}
                      <td className="px-4 py-3 font-mono text-xs border-r border-border/40 align-middle">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <span className="text-[10px] text-muted-foreground font-sans">
                              #{rowIndex}
                            </span>
                            <span>{item.phone}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {isPlain ? (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-muted text-muted-foreground">
                                Plain Text
                              </Badge>
                            ) : rowMissing ? (
                              <span className="text-amber-500 font-medium inline-flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Missing
                              </span>
                            ) : (
                              <span className="text-emerald-500 font-medium inline-flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Content Area: Variables OR Multi-Text Plain Message Input */}
                      {isPlain ? (
                        <td
                          colSpan={variables.length}
                          className="px-4 py-2 border-r border-border/40 align-top"
                        >
                          <div className="space-y-1.5 py-0.5">
                            <textarea
                              rows={2}
                              value={item.plainTextMessage ?? ''}
                              onChange={(e) => handlePlainTextChange(item.phone, e.target.value)}
                              placeholder="Enter custom plain text message for this recipient..."
                              className={cn(
                                'w-full text-xs font-sans p-2 rounded-md border border-input bg-background/90',
                                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-y min-h-[54px] shadow-2xs leading-relaxed',
                                !item.plainTextMessage?.trim() &&
                                  'border-amber-500/60 focus-visible:ring-amber-500/60'
                              )}
                            />
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                              <span className="font-mono text-[10px]">
                                {(item.plainTextMessage || '').length} chars •{' '}
                                {Math.max(1, Math.ceil((item.plainTextMessage || '').length / 160))}{' '}
                                segment(s)
                              </span>
                              {item.plainTextMessage?.trim() && (
                                <button
                                  type="button"
                                  onClick={() => handleApplyPlainToAll(item.plainTextMessage || '')}
                                  className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Copy this plain text message to all other plain text recipients"
                                >
                                  <Copy className="w-3 h-3" />
                                  Apply to all plain recipients
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      ) : (
                        variables.map((v) => {
                          const val = item.values[v] || '';
                          const missing = !val.trim();

                          return (
                            <td key={v} className="px-4 py-2 border-r border-border/40 align-middle">
                              <Input
                                value={val}
                                onChange={(e) => handleValueChange(item.phone, v, e.target.value)}
                                placeholder={`Enter ${v}...`}
                                className={cn(
                                  'h-8 text-xs font-sans',
                                  missing &&
                                    'border-amber-500/60 focus-visible:ring-amber-500/60 bg-amber-500/[0.03]'
                                )}
                              />
                            </td>
                          );
                        })
                      )}

                      {/* Send Plain Switch Column */}
                      <td className="px-4 py-2 text-center align-middle">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={item.skipVariables}
                            onCheckedChange={(checked) => handleSkipChange(item.phone, checked)}
                            aria-label={`Toggle plain text for ${item.phone}`}
                            title={
                              item.skipVariables
                                ? 'Sending plain text message'
                                : 'Using personalized variables'
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary Bar */}
        <div className="px-6 py-2.5 border-t border-border/60 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>
              Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}{' '}
              recipient(s)
            </span>
            {data.length > 10 && (
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-6 text-[11px] rounded border border-border bg-background px-1.5 text-foreground cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                <option value={9999}>Show all</option>
              </select>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-[11px] font-medium px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            {missingCount > 0 ? (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {missingCount} recipient(s) missing required variable values
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All {data.length} recipient messages resolved and ready to send</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={!isFormValid || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold min-w-[150px] text-xs h-9 shadow-md"
            >
              {isLoading ? 'Dispatching...' : `Send Messages (${data.length})`}
              {!isLoading && <Send className="w-3.5 h-3.5 ml-1.5" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
