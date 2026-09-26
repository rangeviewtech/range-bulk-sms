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
  AlertCircle,
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
import { TemplateHighlighter } from '@/components/sms/template-highlighter';
import { generateSampleRecipientsCsv, triggerCsvDownload } from '@/lib/sms/template-csv';
import { VariableCellInput } from '@/components/sms/variable-cell-input';
import {
  resolveVariableDataType,
  validateVariableValue,
  getVariableSampleValue,
} from '@/lib/sms/variable-validation';
import type { VariableDataType } from '@/lib/sms/custom-variables';

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
  sourceFilename?: string | null;
}

interface RecipientVariableData {
  phone: string;
  values: Record<string, string>;
  skipVariables: boolean;
  plainTextMessage?: string;
  hasCustomPlain?: boolean;
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
  sourceFilename,
}: VariableResolutionModalProps) {
  const [data, setData] = React.useState<RecipientVariableData[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterMode, setFilterMode] = React.useState<'all' | 'missing' | 'invalid' | 'complete' | 'plain'>('all');
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

  // Fill all empty variable inputs with realistic sample values based on inferred data types
  const handleFillSamples = () => {
    setData((prev) =>
      prev.map((item, idx) => {
        const newValues: Record<string, string> = { ...item.values };
        variables.forEach((v) => {
          if (!newValues[v]?.trim()) {
            newValues[v] = getVariableSampleValue(v, idx + 1);
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

  // Fill empty values for a single column with realistic samples
  const handleFillColumnSamples = React.useCallback((variable: string) => {
    setData((prev) =>
      prev.map((item, idx) => ({
        ...item,
        values: {
          ...item.values,
          [variable]: item.values[variable]?.trim() || getVariableSampleValue(variable, idx + 1),
        },
      }))
    );
    toast.success(`Filled missing values for {{${variable}}} with samples!`);
  }, []);

  // Clear values for a single column
  const _handleClearColumn = React.useCallback((variable: string) => {
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        values: {
          ...item.values,
          [variable]: '',
        },
      }))
    );
    toast.info(`Cleared column {{${variable}}}`);
  }, []);


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
        const { default: readXlsxFile } = await import('read-excel-file/browser');
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

  // Download sample CSV with only current available recipients and empty variable columns for user to fill
  const handleDownloadSampleFile = () => {
    // Use only available recipients currently in the modal / campaign
    const targetRecipients = data.length > 0
      ? data.map((item) => item.phone)
      : recipients.length > 0
        ? recipients
        : [];

    if (targetRecipients.length === 0) {
      toast.warning('No available recipients found in this campaign.');
      return;
    }

    const { content, filename, recipientCount } = generateSampleRecipientsCsv({
      recipients: targetRecipients,
      variables,
      sourceFilename,
    });

    triggerCsvDownload(content, filename);
    toast.success(
      `Downloaded sample template with ${recipientCount} available recipient${
        recipientCount === 1 ? '' : 's'
      } and empty variable columns!`
    );
  };

  // Variable data type map for all detected tags
  const variableTypes = React.useMemo(() => {
    const map: Record<string, VariableDataType> = {};
    variables.forEach((v) => {
      map[v] = resolveVariableDataType(v);
    });
    return map;
  }, [variables]);

  // Apply value to all rows for a column
  const handleApplyColumnValue = React.useCallback((variable: string, valToApply: string) => {
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        values: {
          ...item.values,
          [variable]: valToApply,
        },
      }))
    );
    toast.success(`Applied "${valToApply}" to all recipients for {{${variable}}}`);
  }, []);

  // Compute row-level real-time validation
  const getRowValidation = React.useCallback(
    (item: RecipientVariableData) => {
      if (item.skipVariables) {
        const hasPlain = (item.plainTextMessage ?? '').trim().length > 0;
        return {
          isComplete: hasPlain,
          hasError: false,
          missingCount: hasPlain ? 0 : 1,
          invalidCount: 0,
          cellErrors: {} as Record<string, string>,
          missingVars: hasPlain ? [] : ['message'],
        };
      }

      let rowMissing = 0;
      let rowInvalid = 0;
      const cellErrors: Record<string, string> = {};
      const missingVars: string[] = [];

      variables.forEach((v) => {
        const val = item.values[v] || '';
        const dt = variableTypes[v] || 'TEXT';
        const res = validateVariableValue(val, dt, v);

        if (res.isMissing) {
          rowMissing++;
          missingVars.push(v);
        } else if (!res.isValid) {
          rowInvalid++;
          if (res.errorMessage) {
            cellErrors[v] = res.errorMessage;
          }
        }
      });

      return {
        isComplete: rowMissing === 0 && rowInvalid === 0,
        hasError: rowInvalid > 0,
        missingCount: rowMissing,
        invalidCount: rowInvalid,
        cellErrors,
        missingVars,
      };
    },
    [variables, variableTypes]
  );

  // Overall Statistics across all rows
  const validationStats = React.useMemo(() => {
    let totalMissingRecipients = 0;
    let totalInvalidRecipients = 0;
    let totalReadyRecipients = 0;
    const columnMissingStats: Record<string, number> = {};
    const columnInvalidStats: Record<string, number> = {};

    variables.forEach((v) => {
      columnMissingStats[v] = 0;
      columnInvalidStats[v] = 0;
    });

    data.forEach((item) => {
      const rowVal = getRowValidation(item);
      if (rowVal.missingCount > 0) totalMissingRecipients++;
      if (rowVal.invalidCount > 0) totalInvalidRecipients++;
      if (rowVal.isComplete) totalReadyRecipients++;

      if (!item.skipVariables) {
        variables.forEach((v) => {
          const val = item.values[v] || '';
          const dt = variableTypes[v] || 'TEXT';
          const res = validateVariableValue(val, dt, v);
          if (res.isMissing) columnMissingStats[v]++;
          else if (!res.isValid) columnInvalidStats[v]++;
        });
      }
    });

    return {
      totalMissingRecipients,
      totalInvalidRecipients,
      totalReadyRecipients,
      columnMissingStats,
      columnInvalidStats,
    };
  }, [data, variables, variableTypes, getRowValidation]);

  const plainCount = React.useMemo(() => {
    return data.filter((item) => item.skipVariables).length;
  }, [data]);

  const isFormValid = React.useMemo(() => {
    return (
      data.length > 0 &&
      validationStats.totalMissingRecipients === 0 &&
      validationStats.totalInvalidRecipients === 0
    );
  }, [data.length, validationStats]);

  // Search & Filter
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const rowVal = getRowValidation(item);

      if (filterMode === 'missing' && rowVal.missingCount === 0) return false;
      if (filterMode === 'invalid' && rowVal.invalidCount === 0) return false;
      if (filterMode === 'complete' && !rowVal.isComplete) return false;
      if (filterMode === 'plain' && !item.skipVariables) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      if (item.phone.toLowerCase().includes(q)) return true;
      if (item.plainTextMessage?.toLowerCase().includes(q)) return true;
      return Object.values(item.values).some((val) => val.toLowerCase().includes(q));
    });
  }, [data, filterMode, searchQuery, getRowValidation]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Send Action: Compile final resolved or plain messages for every recipient
  const handleSend = () => {
    if (!isFormValid) {
      if (validationStats.totalInvalidRecipients > 0) {
        toast.error(
          `Please correct format errors for ${validationStats.totalInvalidRecipients} recipient(s).`
        );
      } else {
        toast.error(
          `Please provide values for the ${validationStats.totalMissingRecipients} recipient(s) with missing data.`
        );
      }
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
            <span className="inline-flex items-center gap-1 flex-wrap">
              {variables.map((v) => (
                <TemplateHighlighter key={v} text={`{{${v}}}`} />
              ))}
            </span>
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
              onValueChange={(val: 'all' | 'missing' | 'invalid' | 'complete' | 'plain') => {
                setFilterMode(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[185px] h-9 text-xs bg-background shadow-xs">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipients ({data.length})</SelectItem>
                <SelectItem value="missing">
                  Missing Values ({validationStats.totalMissingRecipients})
                </SelectItem>
                {validationStats.totalInvalidRecipients > 0 && (
                  <SelectItem value="invalid">
                    Invalid Format ({validationStats.totalInvalidRecipients})
                  </SelectItem>
                )}
                <SelectItem value="complete">
                  Complete ({validationStats.totalReadyRecipients})
                </SelectItem>
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
                className="h-9 px-3 text-xs gap-1.5 font-medium border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 shadow-xs cursor-pointer"
                title="Download CSV template containing available recipients and empty variable columns"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample File</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-3 text-xs gap-1.5 font-medium border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 shadow-xs cursor-pointer"
                title="Upload CSV or Excel file with recipient data"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Parsing...' : 'Upload Data'}</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleFillSamples}
                className="h-9 px-3 text-xs gap-1.5 font-semibold bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-xs border-0 cursor-pointer"
                title="Auto-fill empty variable inputs with realistic sample values"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
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

                {variables.map((v) => {
                  const dt = variableTypes[v] || 'TEXT';
                  const sampleVal = getVariableSampleValue(v, 1);
                  const missingInCol = validationStats.columnMissingStats[v] || 0;
                  const invalidInCol = validationStats.columnInvalidStats[v] || 0;

                  return (
                    <TableHead
                      key={v}
                      className="h-11 px-4 font-semibold text-xs text-foreground min-w-[220px]"
                    >
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <TemplateHighlighter text={`{{${v}}}`} />
                          <Badge
                            variant="secondary"
                            className="text-[9px] uppercase font-mono px-1 py-0 h-3.5 tracking-wider"
                          >
                            {dt}
                          </Badge>
                          <span
                            className="text-[11px] text-muted-foreground font-normal truncate max-w-[120px]"
                            title={sampleVal}
                          >
                            ({sampleVal})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {missingInCol > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleFillColumnSamples(v)}
                              className="text-[10px] text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer flex items-center gap-0.5"
                              title={`Click to fill ${missingInCol} missing value(s) in this column with samples`}
                            >
                              <span>{missingInCol} missing</span>
                            </button>
                          ) : invalidInCol > 0 ? (
                            <span className="text-[10px] text-destructive font-medium">
                              {invalidInCol} invalid
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Ready
                            </span>
                          )}
                        </div>
                      </div>
                    </TableHead>
                  );
                })}

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
                  const rowVal = getRowValidation(item);
                  const rowIndex = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <TableRow
                      key={item.phone}
                      className={cn(
                        'hover:bg-muted/40 transition-colors border-border/60',
                        isPlain && 'bg-muted/10',
                        rowVal.hasError && !isPlain && 'bg-destructive/[0.03]',
                        rowVal.missingCount > 0 && !rowVal.hasError && !isPlain && 'bg-amber-500/[0.02]'
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isPlain ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 bg-muted/60 text-muted-foreground border-border/60"
                              >
                                Plain Text
                              </Badge>
                            ) : (
                              <>
                                {rowVal.invalidCount > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 h-4 bg-destructive/10 text-destructive border-destructive/30 flex items-center gap-1 font-medium"
                                  >
                                    <AlertCircle className="w-2.5 h-2.5" /> Invalid ({rowVal.invalidCount})
                                  </Badge>
                                )}
                                {rowVal.missingCount > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 font-medium"
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5" /> Missing
                                  </Badge>
                                )}
                                {rowVal.isComplete && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 font-medium"
                                  >
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                                  </Badge>
                                )}
                              </>
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
                          const dt = variableTypes[v] || 'TEXT';
                          const isMissing = !val.trim();
                          const err = rowVal.cellErrors[v];
                          const hasError = !isMissing && !!err;

                          return (
                            <TableCell key={v} className="px-4 py-2.5 align-middle min-w-[210px]">
                              <VariableCellInput
                                varName={v}
                                dataType={dt}
                                value={val}
                                onChange={(newVal) => handleValueChange(item.phone, v, newVal)}
                                onApplyToAll={(newVal) => handleApplyColumnValue(v, newVal)}
                                isMissing={isMissing}
                                hasError={hasError}
                                errorMessage={err}
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
            {validationStats.totalMissingRecipients > 0 || validationStats.totalInvalidRecipients > 0 ? (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {validationStats.totalMissingRecipients > 0 && validationStats.totalInvalidRecipients > 0
                    ? `${validationStats.totalMissingRecipients} recipient(s) missing required variable values • ${validationStats.totalInvalidRecipients} invalid format`
                    : validationStats.totalMissingRecipients > 0
                      ? `${validationStats.totalMissingRecipients} recipient(s) missing required variable values`
                      : `${validationStats.totalInvalidRecipients} recipient(s) have invalid formatting`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All {data.length} recipient messages resolved and validated</span>
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
              className="bg-amber-500 text-amber-950 hover:bg-amber-400 font-bold min-w-[160px] text-xs h-9 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
