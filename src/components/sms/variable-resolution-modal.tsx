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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Send,
  Sparkles,
  Upload,
  Download,
  Search,
  CheckCircle2,
  Copy,
  X,
  Filter,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import readXlsxFile from 'read-excel-file/browser';
import { TemplateHighlighter } from '@/components/sms/template-highlighter';

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
  hasCustomPlain?: boolean;
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
function stripVariables(text: string, _variables?: string[]): string {
  return text
    .replace(/\{\{\s*[^}]+\s*\}\}/g, '')
    .replace(/\[\{\s*[^}]+\s*\}\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
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
          hasCustomPlain: false,
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
      const fallbackMsg =
        firstEnteredPlainText.trim() ||
        prev.find((r) => r.hasCustomPlain && r.plainTextMessage?.trim())?.plainTextMessage?.trim() ||
        stripVariables(templateMessage, variables);

      return prev.map((item) => {
        if (item.phone !== phone) return item;
        return {
          ...item,
          skipVariables: skip,
          plainTextMessage: skip
            ? (item.hasCustomPlain && item.plainTextMessage?.trim()
                ? item.plainTextMessage
                : fallbackMsg)
            : item.plainTextMessage,
        };
      });
    });
  };

  // Handle plain text content changes
  const handlePlainTextChange = (phone: string, text: string) => {
    setData((prev) => {
      const wasFirstEmpty = !firstEnteredPlainText && text.trim().length > 0;

      const updated = prev.map((item) => {
        if (item.phone === phone) {
          return { ...item, plainTextMessage: text, hasCustomPlain: true };
        }
        if (wasFirstEmpty && item.skipVariables && !item.hasCustomPlain) {
          return { ...item, plainTextMessage: text };
        }
        return item;
      });

      return updated;
    });

    if (text.trim().length > 0 && !firstEnteredPlainText) {
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
        hasCustomPlain: item.skipVariables ? true : item.hasCustomPlain,
      }))
    );
    setFirstEnteredPlainText(text);
    toast.success('Applied message to all plain text recipients!');
  };

  // Master toggle: Switch all recipients to Plain Text or Variables
  const handleToggleAllMode = (toPlain: boolean) => {
    const fallbackMsg = firstEnteredPlainText.trim() || stripVariables(templateMessage, variables);
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        skipVariables: toPlain,
        plainTextMessage: toPlain
          ? (item.hasCustomPlain && item.plainTextMessage?.trim() ? item.plainTextMessage : fallbackMsg)
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

    const phoneIdx = cleanHeaders.findIndex((h) =>
      ['phone', 'phonenumber', 'recipient', 'recipients', 'mobile', 'msisdn', 'number', 'contact', 'tel'].some((k) =>
        h.includes(k)
      )
    );

    const varIndices: Record<string, number> = {};
    variables.forEach((v) => {
      const vClean = v.toLowerCase().replace(/[{}\[\]_]/g, '');
      const idx = cleanHeaders.findIndex((h) => h === vClean || h.includes(vClean));
      if (idx !== -1) {
        varIndices[v] = idx;
      }
    });

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
          targetIndex = rowIdx;
        }

        if (targetIndex !== -1 && targetIndex < nextData.length) {
          const item = { ...nextData[targetIndex], values: { ...nextData[targetIndex].values } };
          let changed = false;

          variables.forEach((v) => {
            const colIdx = varIndices[v];
            if (colIdx !== undefined && row[colIdx] !== undefined && row[colIdx].trim() !== '') {
              item.values[v] = row[colIdx].trim();
              changed = true;
            }
          });

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
        `Imported from ${filename}: updated ${updatedCount} record(s)${
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
    const additionalColumns = [
      { key: 'date', sample: '2026-09-24' },
      { key: 'dueDate', sample: '2026-10-01' },
      { key: 'amount', sample: '50,000 UGX' },
      { key: 'company', sample: 'Range View Tech' },
      { key: 'email', sample: 'sarah.n@example.com' },
      { key: 'accountNumber', sample: 'ACC-84920' },
    ];

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
      if (filterMode === 'missing' && isRowComplete(item)) return false;
      if (filterMode === 'complete' && !isRowComplete(item)) return false;
      if (filterMode === 'plain' && !item.skipVariables) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      if (item.phone.toLowerCase().includes(q)) return true;
      if (item.plainTextMessage?.toLowerCase().includes(q)) return true;
      return Object.values(item.values).some((val) => val.toLowerCase().includes(q));
    });
  }, [data, filterMode, searchQuery, isRowComplete]);

  // Pagination calculation
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
        if (item.plainTextMessage && item.plainTextMessage.trim().length > 0) {
          customMessage = item.plainTextMessage.trim();
        } else {
          customMessage = stripVariables(templateMessage, variables);
        }
      } else {
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
      <DialogContent className="w-[96vw] max-w-7xl 2xl:max-w-[1536px] max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl border-border bg-card">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border bg-muted/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Resolve Message Variables
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed flex flex-wrap items-center gap-1.5">
            <span>Your message contains <strong>{variables.length} variable(s)</strong>:</span>
            <div className="inline-flex items-center gap-1 flex-wrap">
              {variables.map((v) => (
                <TemplateHighlighter key={v} text={`{{${v}}}`} />
              ))}
            </div>
            <span>Provide values for each recipient, upload a spreadsheet, or customize individual plain text messages.</span>
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar: Search, Filter & Quick Actions matching /sms/drafts */}
        <div className="px-6 py-3.5 border-b border-border/80 bg-muted/10">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md lg:max-w-lg">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by recipient phone or variable values..."
                className="pl-9 pr-8 w-full text-xs h-9 bg-background shadow-xs border-border"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Mode Dropdown matching Drafts Select */}
            <Select
              value={filterMode}
              onValueChange={(val: 'all' | 'missing' | 'complete' | 'plain') => {
                setFilterMode(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs bg-background shadow-xs">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipients ({data.length})</SelectItem>
                <SelectItem value="missing">Missing Values ({missingCount})</SelectItem>
                <SelectItem value="complete">Complete ({data.length - missingCount})</SelectItem>
                <SelectItem value="plain">Plain Text ({plainCount})</SelectItem>
              </SelectContent>
            </Select>

            {/* Action Buttons matching Drafts Action Styling */}
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
                className="h-9 px-3 text-xs gap-1.5 font-medium shadow-xs"
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
                className="h-9 px-3 text-xs gap-1.5 font-medium border-primary/30 text-primary hover:bg-primary/10 shadow-xs"
                title="Upload CSV or Excel file with recipient data"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Parsing...' : 'Upload Data'}</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleFillSamples}
                className="h-9 px-3 text-xs gap-1.5 font-medium shadow-xs"
                title="Auto-fill empty variable inputs with realistic sample values"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Fill Samples</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Data Table Area using standard UI Table components like /sms/drafts */}
        <div className="flex-1 overflow-auto p-0 min-h-[340px] max-h-[55vh]">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10 shadow-2xs backdrop-blur-xs">
              <TableRow className="hover:bg-transparent border-border/80">
                <TableHead className="w-[200px] h-11 px-4 font-semibold text-xs text-foreground">
                  <div className="flex items-center gap-2">
                    <span>Recipient</span>
                    <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-4 bg-muted/60 text-muted-foreground border-border/60">
                      {filteredData.length}
                    </Badge>
                  </div>
                </TableHead>

                {variables.map((v) => (
                  <TableHead
                    key={v}
                    className="h-11 px-4 font-semibold text-xs text-foreground min-w-[190px]"
                  >
                    <div className="flex items-center gap-2">
                      <TemplateHighlighter text={`{{${v}}}`} />
                      <span className="text-[11px] font-normal text-muted-foreground font-sans truncate">
                        ({getSampleValueForVariable(v, 1)})
                      </span>
                    </div>
                  </TableHead>
                ))}

                <TableHead className="w-[140px] h-11 px-4 font-semibold text-xs text-foreground text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span>Send Plain</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllMode(!allArePlain)}
                      className="text-[11px] font-normal text-primary hover:underline cursor-pointer"
                      title={allArePlain ? 'Switch all to variables' : 'Switch all to plain text'}
                    >
                      {allArePlain ? 'All Vars' : 'All Plain'}
                    </button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={variables.length + 2}
                    className="h-48 text-center text-muted-foreground py-10"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No matching recipients</p>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery
                          ? `No recipients found matching "${searchQuery}".`
                          : 'No recipients match the active filter criteria.'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setFilterMode('all');
                        }}
                        className="h-8 text-xs mt-1"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, idx) => {
                  const isPlain = item.skipVariables;
                  const rowMissing = !isRowComplete(item);
                  const rowIndex = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <TableRow
                      key={item.phone}
                      className={cn(
                        'hover:bg-muted/40 transition-colors border-border/60',
                        isPlain && 'bg-muted/10',
                        rowMissing && !isPlain && 'bg-amber-500/[0.02]'
                      )}
                    >
                      {/* Recipient Cell */}
                      <TableCell className="px-4 py-3 align-middle font-mono text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <span className="text-[10px] text-muted-foreground font-sans font-normal">
                              #{rowIndex}
                            </span>
                            <span>{item.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isPlain ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted/60 text-muted-foreground border-border/60">
                                Plain Text
                              </Badge>
                            ) : rowMissing ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" /> Missing
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Content Area: Variables Inputs OR Multi-Text Plain Message Input */}
                      {isPlain ? (
                        <TableCell
                          colSpan={variables.length}
                          className="px-4 py-2.5 align-middle"
                        >
                          <div className="space-y-1.5 py-0.5">
                            <textarea
                              rows={2}
                              value={item.plainTextMessage ?? ''}
                              onChange={(e) => handlePlainTextChange(item.phone, e.target.value)}
                              placeholder="Enter custom plain text message for this recipient..."
                              className={cn(
                                'w-full text-xs font-sans p-2.5 rounded-md border border-input bg-background text-foreground shadow-xs transition-colors',
                                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[56px] leading-relaxed',
                                !item.plainTextMessage?.trim() &&
                                  'border-amber-500/60 focus-visible:ring-amber-500/60 bg-amber-500/[0.02]'
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
                        </TableCell>
                      ) : (
                        variables.map((v) => {
                          const val = item.values[v] || '';
                          const missing = !val.trim();

                          return (
                            <TableCell key={v} className="px-4 py-2.5 align-middle">
                              <Input
                                value={val}
                                onChange={(e) => handleValueChange(item.phone, v, e.target.value)}
                                placeholder={`Enter ${v}...`}
                                className={cn(
                                  'h-9 text-xs font-sans bg-background border-input shadow-xs transition-colors',
                                  missing &&
                                    'border-amber-500/60 focus-visible:ring-amber-500/60 bg-amber-500/[0.03]'
                                )}
                              />
                            </TableCell>
                          );
                        })
                      )}

                      {/* Send Plain Switch Column */}
                      <TableCell className="px-4 py-2.5 text-center align-middle">
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
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Standard Pagination Component matching /sms/drafts */}
        {filteredData.length > 0 && (
          <div className="border-t border-border/80">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredData.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 20, 50, 100]}
              className="bg-muted/10 border-t-0 p-3 sm:p-3.5"
            />
          </div>
        )}

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
