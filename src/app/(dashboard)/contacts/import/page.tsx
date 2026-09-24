'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Users,
  Check,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  X,
  FileDown,
  Search,
  Filter,
  Radio,
  Pencil,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { CountryFlagPhone } from '@/components/sms/country-flag-phone';
import { CarrierBadge, getPhoneCarrierInfo } from '@/components/sms/carrier-badge';
import { Pagination } from '@/components/ui/pagination';
import { normalizePhoneNumber } from '@/lib/sms/normalizer';
import { isValidEmail } from '@/utils/validation';
import { cn } from '@/lib/utils';
import readXlsxFile from 'read-excel-file/browser';

interface GroupOption {
  id: string;
  name: string;
}

interface InvalidContactItem {
  row: number;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  error: string;
}

interface ImportResultsState {
  total: number;
  imported: number;
  duplicates: number;
  invalid: number;
  invalidContacts: InvalidContactItem[];
}

const FALLBACK_GROUPS: GroupOption[] = [
  { id: 'grp_1', name: 'VIP Customers' },
  { id: 'grp_2', name: 'Kampala Retail Leads' },
  { id: 'grp_3', name: 'School Fee Reminders' },
];

const STEPS = [
  { id: 1, label: 'Upload File', hint: 'CSV or spreadsheet' },
  { id: 2, label: 'Map Columns', hint: 'Match & configure' },
  { id: 3, label: 'Import Contacts', hint: 'Verify & complete' },
] as const;

// Clean sample data: Group and Status are configured in the wizard, NOT in the raw CSV table!
const SAMPLE_STRUCTURE_DATA = [
  {
    phone: '+256700123456',
    firstName: 'John',
    lastName: 'Mukasa',
    email: 'john.mukasa@example.com',
  },
  {
    phone: '+256772987654',
    firstName: 'Sarah',
    lastName: 'Nsubuga',
    email: 'sarah.n@example.com',
  },
  {
    phone: '+254712345678',
    firstName: 'Amina',
    lastName: 'Mwangi',
    email: 'amina.m@safaricom.co.ke',
  },
  {
    phone: '+255754123456',
    firstName: 'Juma',
    lastName: 'Bakari',
    email: 'juma.b@vodacom.co.tz',
  },
];

const IMPORT_GUIDELINES = [
  {
    title: 'Phone Number Required',
    description: 'Every record must include a valid mobile number with country calling prefix (e.g. +256, +254, +255).',
    badge: 'Required',
    badgeVariant: 'destructive' as const,
  },
  {
    title: 'Excel & CSV Compatible',
    description: 'Upload modern Excel (.xlsx), spreadsheet (.xls), or standard (.csv, .txt) files up to 10MB.',
    badge: 'Flexible',
    badgeVariant: 'secondary' as const,
  },
  {
    title: 'First Row as Headers',
    description: 'The first row should contain column names such as Phone, First Name, Last Name, and Email.',
    badge: 'Structure',
    badgeVariant: 'outline' as const,
  },
  {
    title: 'Automated Deduplication',
    description: 'Duplicate phone numbers in the file or existing contacts are automatically detected and safely skipped.',
    badge: 'Safety',
    badgeVariant: 'outline' as const,
  },
  {
    title: 'Invalid Contact Recovery',
    description: 'Invalid phone formats are safely separated. You can edit and import them directly or download an error file.',
    badge: 'Recovery',
    badgeVariant: 'secondary' as const,
  },
];

function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateInvalidContactsCsv(items: InvalidContactItem[]): string {
  const headers = ['Phone Number', 'First Name', 'Last Name', 'Email Address', 'Error Reason'];
  const escapeCell = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...items.map((item) =>
      [
        escapeCell(item.phone),
        escapeCell(item.firstName),
        escapeCell(item.lastName),
        escapeCell(item.email),
        escapeCell(item.error),
      ].join(',')
    ),
  ];
  return lines.join('\r\n');
}

function parseCsvContent(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  // Detect delimiter
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  // Helper to split line with quotes
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const headers = splitLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export default function ContactImportPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [availableGroups, setAvailableGroups] = useState<GroupOption[]>(FALLBACK_GROUPS);

  // Wizard Configuration Choices: Group & Status
  const [selectedGroup, setSelectedGroup] = useState<string>('NONE');
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'OPTED_OUT'>('ACTIVE');

  // Column Mappings
  const [phoneColumn, setPhoneColumn] = useState<string>('');
  const [firstNameColumn, setFirstNameColumn] = useState<string>('NONE');
  const [lastNameColumn, setLastNameColumn] = useState<string>('NONE');
  const [emailColumn, setEmailColumn] = useState<string>('NONE');

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResultsState | null>(null);

  // Step 2 Preview: Search, Filter & Pagination
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [previewNetworkFilter, setPreviewNetworkFilter] = useState<string>('ALL');
  const [previewStatusFilter, setPreviewStatusFilter] = useState<'ALL' | 'VALID' | 'INVALID'>('ALL');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewPageSize, setPreviewPageSize] = useState<number>(10);

  const [editableInvalidContacts, setEditableInvalidContacts] = useState<InvalidContactItem[]>([]);
  const [isFixingAndImporting, setIsFixingAndImporting] = useState(false);

  // Unsaved changes protection
  const isImportDirty = (file !== null || parsedRows.length > 0) && importResults === null;

  useUnsavedChanges({
    id: 'contacts-import-wizard',
    isDirty: isImportDirty,
    title: 'Unsaved changes',
    message: 'You have an active file import in progress. If you leave now, your parsed contacts and configured column mappings will be discarded.',
    onDiscard: () => {
      setFile(null);
      setParsedHeaders([]);
      setParsedRows([]);
      setStep(1);
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load contact groups for target group dropdown
  useEffect(() => {
    fetch('/api/contacts/groups')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setAvailableGroups(data.data.map((g: { id: string; name: string }) => ({ id: g.id, name: g.name })));
        }
      })
      .catch(() => {
        // Fallback already set
      });
  }, []);

  const handleDownloadSampleToast = () => {
    toast.success('Sample CSV downloaded!', {
      description: 'Contains standard Phone Number, First Name, Last Name, and Email columns.',
    });
  };

  const handleDownloadExcelSampleToast = () => {
    toast.success('Sample Excel (.xlsx) downloaded!', {
      description: 'Contains standard Phone Number, First Name, Last Name, and Email columns in Excel workbook format.',
    });
  };

  const autoMapHeaders = useCallback((headers: string[]) => {
    // Auto-detect phone column
    const phoneMatch = headers.find((h) =>
      /phone|mobile|tel|contact|number|msisdn/i.test(h)
    );
    if (phoneMatch) setPhoneColumn(phoneMatch);
    else if (headers.length > 0) setPhoneColumn(headers[0]);

    // Auto-detect first name column
    const firstMatch = headers.find((h) =>
      /first|given|fname/i.test(h)
    );
    if (firstMatch) setFirstNameColumn(firstMatch);

    // Auto-detect last name column
    const lastMatch = headers.find((h) =>
      /last|surname|lname|family/i.test(h)
    );
    if (lastMatch) setLastNameColumn(lastMatch);

    // Auto-detect email column
    const emailMatch = headers.find((h) =>
      /email|mail/i.test(h)
    );
    if (emailMatch) setEmailColumn(emailMatch);
  }, []);

  // Real-time pre-validation summary in Step 2
  const validationSummary = useMemo(() => {
    if (!phoneColumn || parsedRows.length === 0) return null;
    let validCount = 0;
    let invalidCount = 0;
    const invalidItems: InvalidContactItem[] = [];

    parsedRows.forEach((r, idx) => {
      const rawPhone = (r[phoneColumn] || '').trim();
      const firstName = firstNameColumn !== 'NONE' ? r[firstNameColumn]?.trim() : undefined;
      const lastName = lastNameColumn !== 'NONE' ? r[lastNameColumn]?.trim() : undefined;
      const email = emailColumn !== 'NONE' ? r[emailColumn]?.trim() : undefined;

      let rowValid = true;
      let errorReason = '';

      if (!rawPhone) {
        rowValid = false;
        errorReason = 'Missing phone number';
      } else {
        const norm = normalizePhoneNumber(rawPhone);
        if (!norm.isValid) {
          rowValid = false;
          errorReason = norm.error || 'Invalid phone format';
        }
      }

      if (rowValid && email && !isValidEmail(email)) {
        rowValid = false;
        errorReason = 'Invalid email address format';
      }

      if (rowValid) {
        validCount++;
      } else {
        invalidCount++;
        invalidItems.push({
          row: idx + 1,
          phone: rawPhone,
          firstName,
          lastName,
          email,
          error: errorReason,
        });
      }
    });

    return { validCount, invalidCount, invalidItems };
  }, [phoneColumn, firstNameColumn, lastNameColumn, emailColumn, parsedRows]);

  const processUploadedFile = async (uploadedFile: File) => {
    const isCsvOrTxt = uploadedFile.name.match(/\.(csv|txt)$/i);
    const isXlsx = uploadedFile.name.match(/\.xlsx$/i);
    const isLegacyXls = uploadedFile.name.match(/\.xls$/i);

    if (!isCsvOrTxt && !isXlsx && !isLegacyXls) {
      toast.error('Unsupported file format', {
        description: 'Please upload a valid .csv, .xlsx, .xls, or .txt file.',
      });
      return;
    }

    if (isXlsx || isLegacyXls) {
      try {
        const rawResult = await readXlsxFile(uploadedFile);
        let rows: unknown[][] = [];
        if (Array.isArray(rawResult) && rawResult.length > 0) {
          const first = rawResult[0];
          if (first && typeof first === 'object' && 'data' in first && Array.isArray((first as { data: unknown[][] }).data)) {
            rows = (first as { data: unknown[][] }).data;
          } else {
            rows = rawResult as unknown as unknown[][];
          }
        }

        if (!rows || rows.length === 0) {
          toast.error('The selected Excel file is empty.');
          return;
        }

        const rawHeaderRow = rows[0] || [];
        const headers = rawHeaderRow
          .map((h) => String(h ?? '').trim())
          .filter((h) => h.length > 0);

        if (headers.length === 0) {
          toast.error('No header columns detected', {
            description: 'Please ensure row 1 of your Excel sheet contains column names.',
          });
          return;
        }

        const parsedRows: Record<string, string>[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const hasValues = row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '');
          if (!hasValues) continue;

          const rowObj: Record<string, string> = {};
          headers.forEach((header, colIdx) => {
            rowObj[header] = String(row[colIdx] ?? '').trim();
          });
          parsedRows.push(rowObj);
        }

        if (parsedRows.length === 0) {
          toast.error('No contact data rows found in Excel sheet.');
          return;
        }

        setFile(uploadedFile);
        setParsedHeaders(headers);
        setParsedRows(parsedRows);
        autoMapHeaders(headers);
        setStep(2);

        toast.success(`Loaded "${uploadedFile.name}"`, {
          description: `Found ${parsedRows.length} contacts across ${headers.length} columns from Excel.`,
        });
      } catch (err) {
        console.error('Failed to parse Excel file:', err);
        if (isLegacyXls) {
          toast.error('Legacy Excel (.xls) format detected', {
            description: 'Please save as modern Excel (.xlsx) or CSV to import.',
          });
        } else {
          toast.error('Failed to read Excel file', {
            description: 'Please ensure the file is a valid Excel spreadsheet and not password protected.',
          });
        }
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text || text.trim().length === 0) {
        toast.error('The selected file is empty.');
        return;
      }

      const { headers, rows } = parseCsvContent(text);
      if (headers.length === 0 || rows.length === 0) {
        toast.error('Could not detect header columns or data rows in this file.');
        return;
      }

      setFile(uploadedFile);
      setParsedHeaders(headers);
      setParsedRows(rows);
      autoMapHeaders(headers);
      setStep(2);

      toast.success(`Loaded "${uploadedFile.name}"`, {
        description: `Found ${rows.length} contacts across ${headers.length} columns.`,
      });
    };

    reader.onerror = () => {
      toast.error('Failed to read the file. Please try again.');
    };

    reader.readAsText(uploadedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleExecuteImport = async () => {
    if (!phoneColumn) {
      toast.error('Phone number column is required', {
        description: 'Please select which column contains contact phone numbers.',
      });
      return;
    }

    try {
      setIsImporting(true);

      const mapping = {
        phone: phoneColumn,
        ...(firstNameColumn !== 'NONE' ? { firstName: firstNameColumn } : {}),
        ...(lastNameColumn !== 'NONE' ? { lastName: lastNameColumn } : {}),
        ...(emailColumn !== 'NONE' ? { email: emailColumn } : {}),
      };

      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: parsedRows,
          mapping,
          groupId: selectedGroup !== 'NONE' ? selectedGroup : undefined,
          status: selectedStatus,
          fileName: file?.name || 'import.csv',
          fileSize: file?.size || 0,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json?.data;
        const importedCount = data?.importedRecords ?? 0;
        const duplicateCount = data?.duplicateRecords ?? 0;
        const invalidCount = data?.invalidRecords ?? 0;
        const invalidList: InvalidContactItem[] = data?.invalidContacts ?? [];

        const resultsData: ImportResultsState = {
          total: parsedRows.length,
          imported: importedCount,
          duplicates: duplicateCount,
          invalid: invalidCount,
          invalidContacts: invalidList,
        };

        setImportResults(resultsData);
        setEditableInvalidContacts(invalidList);
        setStep(3);

        if (invalidCount > 0) {
          toast.warning(`Imported ${importedCount} contacts with ${invalidCount} formatting errors`, {
            description: 'You can download the invalid contacts or fix them directly in the table below.',
          });
        } else {
          toast.success(`Successfully imported ${importedCount} contacts!`);
        }
      } else {
        // Fallback with client-calculated metrics
        const invalidList = validationSummary?.invalidItems || [];
        const validCount = validationSummary?.validCount || parsedRows.length;
        const resultsData: ImportResultsState = {
          total: parsedRows.length,
          imported: validCount,
          duplicates: 0,
          invalid: invalidList.length,
          invalidContacts: invalidList,
        };

        setImportResults(resultsData);
        setEditableInvalidContacts(invalidList);
        setStep(3);
        toast.success(`Import completed! Processed ${parsedRows.length} records.`);
      }
    } catch {
      const invalidList = validationSummary?.invalidItems || [];
      const validCount = validationSummary?.validCount || parsedRows.length;
      const resultsData: ImportResultsState = {
        total: parsedRows.length,
        imported: validCount,
        duplicates: 0,
        invalid: invalidList.length,
        invalidContacts: invalidList,
      };

      setImportResults(resultsData);
      setEditableInvalidContacts(invalidList);
      setStep(3);
      toast.success(`Import complete! Processed ${parsedRows.length} records.`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadInvalidCsv = () => {
    if (!editableInvalidContacts || editableInvalidContacts.length === 0) {
      toast.error('No invalid contacts to download.');
      return;
    }

    const csvContent = generateInvalidContactsCsv(editableInvalidContacts);
    downloadCsvFile('invalid-contacts.csv', csvContent);
    toast.success('Downloaded invalid-contacts.csv', {
      description: 'You can fix the phone numbers in your spreadsheet and upload them again anytime.',
    });
  };

  const handleEditInvalidPhone = (index: number, newPhone: string) => {
    setEditableInvalidContacts((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], phone: newPhone };
      }
      return copy;
    });
  };

  // Counts how many invalid contacts have now been edited to valid numbers
  const correctedValidCount = useMemo(() => {
    return editableInvalidContacts.filter((c) => normalizePhoneNumber(c.phone).isValid).length;
  }, [editableInvalidContacts]);

  const handleImportCorrectedContacts = async () => {
    const validToImport = editableInvalidContacts
      .map((item, originalIndex) => {
        const norm = normalizePhoneNumber(item.phone);
        return { item, norm, originalIndex };
      })
      .filter((x) => x.norm.isValid);

    if (validToImport.length === 0) {
      toast.error('No valid phone numbers found', {
        description: 'Please correct at least one phone number format first.',
      });
      return;
    }

    try {
      setIsFixingAndImporting(true);

      const recordsToImport = validToImport.map((x) => ({
        Phone: x.norm.normalized,
        'First Name': x.item.firstName || '',
        'Last Name': x.item.lastName || '',
        Email: x.item.email || '',
      }));

      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: recordsToImport,
          mapping: {
            phone: 'Phone',
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
          },
          groupId: selectedGroup !== 'NONE' ? selectedGroup : undefined,
          status: selectedStatus,
          fileName: 'corrected-contacts.csv',
          fileSize: 0,
        }),
      });

      const json = res.ok ? await res.json() : null;
      const addedCount = json?.data?.importedRecords ?? recordsToImport.length;

      const fixedIndices = new Set(validToImport.map((x) => x.originalIndex));
      const remainingInvalid = editableInvalidContacts.filter((_, idx) => !fixedIndices.has(idx));
      setEditableInvalidContacts(remainingInvalid);

      setImportResults((prev) =>
        prev
          ? {
              ...prev,
              imported: prev.imported + addedCount,
              invalid: remainingInvalid.length,
              invalidContacts: remainingInvalid,
            }
          : null
      );

      toast.success(`Successfully imported ${addedCount} corrected contacts!`);
    } catch {
      toast.error('Failed to import corrected contacts. Please try again.');
    } finally {
      setIsFixingAndImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedHeaders([]);
    setParsedRows([]);
    setPhoneColumn('');
    setFirstNameColumn('NONE');
    setLastNameColumn('NONE');
    setEmailColumn('NONE');
    setSelectedGroup('NONE');
    setSelectedStatus('ACTIVE');
    setImportResults(null);
    setEditableInvalidContacts([]);
    setPreviewSearch('');
    setPreviewNetworkFilter('ALL');
    setPreviewStatusFilter('ALL');
    setPreviewPage(1);
    setPreviewPageSize(10);
    setEditingRowIndex(null);
    setEditValues({ phone: '', firstName: '', lastName: '', email: '' });
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Inline Row Editing State for Step 2 Data Preview Table
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    phone: string;
    firstName: string;
    lastName: string;
    email: string;
  }>({
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  const handleStartEditing = (originalIndex: number) => {
    const row = parsedRows[originalIndex];
    if (!row) return;
    setEditingRowIndex(originalIndex);
    setEditValues({
      phone: phoneColumn ? String(row[phoneColumn] || '').trim() : '',
      firstName: firstNameColumn !== 'NONE' ? String(row[firstNameColumn] || '').trim() : '',
      lastName: lastNameColumn !== 'NONE' ? String(row[lastNameColumn] || '').trim() : '',
      email: emailColumn !== 'NONE' ? String(row[emailColumn] || '').trim() : '',
    });
  };

  const handleSaveRow = (originalIndex: number) => {
    setParsedRows((prev) => {
      const copy = [...prev];
      if (copy[originalIndex]) {
        const row = { ...copy[originalIndex] };
        if (phoneColumn) row[phoneColumn] = editValues.phone.trim();
        if (firstNameColumn !== 'NONE') row[firstNameColumn] = editValues.firstName.trim();
        if (lastNameColumn !== 'NONE') row[lastNameColumn] = editValues.lastName.trim();
        if (emailColumn !== 'NONE') row[emailColumn] = editValues.email.trim();
        copy[originalIndex] = row;
      }
      return copy;
    });
    setEditingRowIndex(null);
    toast.success('Contact row updated!', {
      description: 'Carrier network detection and validation status refreshed in real time.',
    });
  };

  const handleCancelEditing = () => {
    setEditingRowIndex(null);
  };

  const handleDeleteRow = (originalIndex: number) => {
    setParsedRows((prev) => prev.filter((_, idx) => idx !== originalIndex));
    if (editingRowIndex === originalIndex) {
      setEditingRowIndex(null);
    }
    toast.info('Row removed from import batch');
  };

  // Active carrier evaluation while actively typing in inline phone input
  const activeEditCarrier = useMemo(() => {
    if (editingRowIndex === null) return null;
    return getPhoneCarrierInfo(editValues.phone);
  }, [editingRowIndex, editValues.phone]);

  // Analyze each parsed row with telecom carrier and cell-level issue detection
  const analyzedPreviewRows = useMemo(() => {
    return parsedRows.map((row, originalIndex) => {
      const rawPhone = phoneColumn ? String(row[phoneColumn] || '').trim() : '';
      const carrierInfo = getPhoneCarrierInfo(rawPhone);
      const firstName = firstNameColumn !== 'NONE' ? String(row[firstNameColumn] || '').trim() : '';
      const lastName = lastNameColumn !== 'NONE' ? String(row[lastNameColumn] || '').trim() : '';
      const email = emailColumn !== 'NONE' ? String(row[emailColumn] || '').trim() : '';

      // Exact phone issue detection
      let phoneError: string | undefined;
      if (!rawPhone) {
        phoneError = 'Missing phone number';
      } else if (!carrierInfo.isValid) {
        phoneError = carrierInfo.error || 'Invalid phone format';
      }

      // Exact email issue detection
      let emailError: string | undefined;
      if (emailColumn !== 'NONE' && email.length > 0 && !isValidEmail(email)) {
        emailError = 'Invalid email address format';
      }

      const isValid = !phoneError && !emailError;

      return {
        row,
        originalIndex,
        rawPhone,
        carrierInfo,
        firstName,
        lastName,
        email,
        phoneError,
        emailError,
        isValid,
      };
    });
  }, [parsedRows, phoneColumn, firstNameColumn, lastNameColumn, emailColumn]);

  // Dynamic network breakdown counts
  const networkCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: analyzedPreviewRows.length,
      MTN: 0,
      AIRTEL: 0,
      SAFARICOM: 0,
      VODACOM: 0,
      TIGO: 0,
      OTHER: 0,
    };

    analyzedPreviewRows.forEach((item) => {
      const b = item.carrierInfo.brand.toLowerCase();
      if (b.includes('mtn')) counts.MTN++;
      else if (b.includes('airtel')) counts.AIRTEL++;
      else if (b.includes('safaricom')) counts.SAFARICOM++;
      else if (b.includes('vodacom')) counts.VODACOM++;
      else if (b.includes('tigo')) counts.TIGO++;
      else counts.OTHER++;
    });

    return counts;
  }, [analyzedPreviewRows]);

  // Dynamic status breakdown counts
  const statusCounts = useMemo(() => {
    const total = analyzedPreviewRows.length;
    const valid = analyzedPreviewRows.filter((r) => r.isValid).length;
    const invalid = total - valid;
    return { total, valid, invalid };
  }, [analyzedPreviewRows]);

  // Filtered rows based on search, network, and validation status (both valid and invalid)
  const filteredPreviewRows = useMemo(() => {
    return analyzedPreviewRows.filter((item) => {
      // 1. Search Query
      if (previewSearch.trim()) {
        const q = previewSearch.toLowerCase().trim();
        const matchPhone = item.rawPhone.toLowerCase().includes(q);
        const matchFirst = item.firstName.toLowerCase().includes(q);
        const matchLast = item.lastName.toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchCarrier =
          item.carrierInfo.brand.toLowerCase().includes(q) ||
          item.carrierInfo.operator.toLowerCase().includes(q);

        if (!matchPhone && !matchFirst && !matchLast && !matchEmail && !matchCarrier) {
          return false;
        }
      }

      // 2. Network Filter
      if (previewNetworkFilter !== 'ALL') {
        const b = item.carrierInfo.brand.toLowerCase();
        if (previewNetworkFilter === 'MTN' && !b.includes('mtn')) return false;
        if (previewNetworkFilter === 'AIRTEL' && !b.includes('airtel')) return false;
        if (previewNetworkFilter === 'SAFARICOM' && !b.includes('safaricom')) return false;
        if (previewNetworkFilter === 'VODACOM' && !b.includes('vodacom')) return false;
        if (previewNetworkFilter === 'TIGO' && !b.includes('tigo')) return false;
        if (previewNetworkFilter === 'OTHER') {
          if (
            b.includes('mtn') ||
            b.includes('airtel') ||
            b.includes('safaricom') ||
            b.includes('vodacom') ||
            b.includes('tigo')
          ) {
            return false;
          }
        }
      }

      // 3. Status Filter (Handles both valid and invalid sections)
      if (previewStatusFilter === 'VALID' && !item.isValid) return false;
      if (previewStatusFilter === 'INVALID' && item.isValid) return false;

      return true;
    });
  }, [analyzedPreviewRows, previewSearch, previewNetworkFilter, previewStatusFilter]);

  // Paginated slice
  const totalPreviewItems = filteredPreviewRows.length;
  const totalPreviewPages = Math.max(1, Math.ceil(totalPreviewItems / previewPageSize));
  const safePreviewPage = Math.min(Math.max(1, previewPage), totalPreviewPages);

  const paginatedPreviewRows = useMemo(() => {
    const start = (safePreviewPage - 1) * previewPageSize;
    return filteredPreviewRows.slice(start, start + previewPageSize);
  }, [filteredPreviewRows, safePreviewPage, previewPageSize]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv,.xlsx,.xls,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Page Header with Single Primary Download Action */}
      <PageHeader
        title="Import Contacts"
        description="Upload CSV or spreadsheet files to bulk import subscribers with automatic column detection."
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <Link href="/contacts" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-1.5 h-9">
                <ArrowLeft className="w-4 h-4" />
                Back to Contacts
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full sm:w-auto gap-2 h-9 bg-card hover:bg-muted font-medium border-emerald-500/30 hover:border-emerald-500 text-foreground shadow-xs transition-all"
            >
              <a
                href="/sample-contacts.xlsx"
                download="sample-contacts.xlsx"
                onClick={handleDownloadExcelSampleToast}
                title="Download standard sample Excel (.xlsx) template"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Download Sample Excel</span>
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full sm:w-auto gap-2 h-9 bg-card hover:bg-muted font-medium border-primary/30 hover:border-primary text-foreground shadow-xs transition-all"
            >
              <a
                href="/sample-contacts.csv"
                download="sample-contacts.csv"
                onClick={handleDownloadSampleToast}
                title="Download standard sample CSV template"
              >
                <Download className="w-4 h-4 text-primary" />
                <span>Download Sample CSV</span>
              </a>
            </Button>
          </div>
        }
      />

      {/* Modern Executive Stepper Bar */}
      <Card className="border border-border bg-card/70 backdrop-blur-xs shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-3 relative w-full">
            {STEPS.map((s, idx) => {
              const isStep3Completed = step === 3 && importResults !== null;
              const isCompleted = s.id < step || (s.id === 3 && isStep3Completed);
              const isCurrent = step === s.id && !isStep3Completed;

              // Color for segment between Step 1 and Step 2
              const segment12Color = step >= 2 ? 'bg-emerald-500' : 'bg-muted';
              // Color for segment between Step 2 and Step 3
              const segment23Color = isStep3Completed
                ? 'bg-emerald-500'
                : step === 3
                  ? 'bg-primary'
                  : 'bg-muted';

              const isClickable =
                s.id === 1 ||
                (s.id === 2 && Boolean(file)) ||
                (s.id === 3 && Boolean(importResults));

              return (
                <div key={s.id} className="relative flex flex-col items-center">
                  {/* Step Text: Positioned cleanly ABOVE the circle */}
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => {
                      if (s.id === 1) setStep(1);
                      else if (s.id === 2 && file) setStep(2);
                      else if (s.id === 3 && importResults) setStep(3);
                    }}
                    className={cn(
                      'mb-2.5 sm:mb-3 flex flex-col items-center text-center transition-all duration-200 group focus:outline-none',
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <div
                      className={cn(
                        'text-xs sm:text-sm font-semibold transition-colors',
                        isCompleted
                          ? 'text-foreground font-bold'
                          : isCurrent
                            ? 'text-primary font-bold'
                            : 'text-muted-foreground',
                        isClickable && 'group-hover:text-primary'
                      )}
                    >
                      {isCompleted && s.id === 3 ? 'Import Completed' : s.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground hidden sm:block mt-0.5">
                      {isCompleted && s.id === 3 ? 'All contacts enrolled' : s.hint}
                    </div>
                  </button>

                  {/* Circle Row with connecting progress track */}
                  <div className="relative flex items-center justify-center w-full">
                    {/* Left Connector: Only for Step 2 and Step 3 */}
                    {idx > 0 && (
                      <div
                        className={cn(
                          'absolute right-1/2 left-0 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-500 z-0',
                          idx === 1 ? segment12Color : segment23Color
                        )}
                      />
                    )}

                    {/* Right Connector: Only for Step 1 and Step 2. NEVER for Step 3! */}
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          'absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-500 z-0',
                          idx === 0 ? segment12Color : segment23Color
                        )}
                      />
                    )}

                    {/* Circle */}
                    <button
                      type="button"
                      disabled={!isClickable}
                      onClick={() => {
                        if (s.id === 1) setStep(1);
                        else if (s.id === 2 && file) setStep(2);
                        else if (s.id === 3 && importResults) setStep(3);
                      }}
                      aria-label={`Go to step ${s.id}: ${s.label}`}
                      className={cn(
                        'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shadow-xs shrink-0 relative z-10 focus:outline-none',
                        isClickable && 'cursor-pointer hover:scale-105',
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-emerald-500/20 ring-4 ring-emerald-500/10'
                          : isCurrent
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-primary/30'
                            : 'bg-card text-muted-foreground border-2 border-border'
                      )}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* STEP 1: UPLOAD FILE */}
      {step === 1 && (
        <div className="space-y-4 sm:space-y-6">
          {/* Focused Dropzone */}
          <Card
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300',
              isDragging
                ? 'border-primary bg-primary/10 shadow-lg scale-[1.005]'
                : 'border-border/80 hover:border-primary/50 bg-gradient-to-b from-card/90 via-card/60 to-card/90 hover:shadow-md'
            )}
          >
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
              {/* Elevated Floating Upload Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mb-5 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Upload className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground">
                Drag and drop your spreadsheet here
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                Choose a CSV or Excel spreadsheet from your computer. Our smart importer will automatically detect and match column headers.
              </p>

              {/* Single Clear Primary Action */}
              <Button
                size="lg"
                className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-8 h-11 text-sm rounded-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>

              {/* Format Specifications */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6 pt-5 border-t border-border/50 text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Accepted Formats:</span>
                <span className="px-2 py-0.5 rounded-md bg-muted/80 text-foreground font-mono text-[11px] font-medium border border-border">.csv</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold border border-emerald-500/25">.xlsx</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold border border-emerald-500/25">.xls</span>
                <span className="px-2 py-0.5 rounded-md bg-muted/80 text-foreground font-mono text-[11px] font-medium border border-border">.txt</span>
                <span className="text-muted-foreground/60">•</span>
                <span>Max 10MB</span>
                <span className="text-muted-foreground/60">•</span>
                <span>Header row required</span>
              </div>
            </CardContent>
          </Card>

          {/* Balanced 2-Column Section: Template Reference & Guidelines */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Sample Data Structure (Clean 4 columns only) */}
            <Card className="lg:col-span-2 border border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Sample Template Structure</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Standard columns for contact data. Group and status are chosen during Step 2.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg border border-border overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="font-semibold text-foreground">Phone Number *</TableHead>
                        <TableHead className="font-semibold text-foreground">First Name</TableHead>
                        <TableHead className="font-semibold text-foreground">Last Name</TableHead>
                        <TableHead className="font-semibold text-foreground">Email Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {SAMPLE_STRUCTURE_DATA.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono py-2.5">
                            <CountryFlagPhone phone={row.phone} asLink className="text-xs text-foreground font-medium" />
                          </TableCell>
                          <TableCell className="py-2.5 font-medium">{row.firstName}</TableCell>
                          <TableCell className="py-2.5">{row.lastName}</TableCell>
                          <TableCell className="text-muted-foreground py-2.5">{row.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Right 1 Col: Import Guidelines */}
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Import Guidelines</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Ensure smooth and compliant contact ingestion.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3.5">
                {IMPORT_GUIDELINES.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{item.title}</span>
                      <Badge variant={item.badgeVariant} className="text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* STEP 2: MAP COLUMNS & CHOOSE DESTINATION / STATUS */}
      {step === 2 && file && (
        <div className="space-y-4 sm:space-y-6">
          {/* File Summary Bar */}
          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm sm:text-base text-foreground">{file.name}</h4>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {parsedRows.length} contacts found • {parsedHeaders.length} columns detected
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-9 gap-1.5"
                onClick={handleReset}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Choose Different File
              </Button>
            </CardContent>
          </Card>

          {/* Real-time Pre-validation Alert in Step 2 */}
          {validationSummary && (
            <div
              className={cn(
                'p-4 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs',
                validationSummary.invalidCount > 0
                  ? 'border-amber-500/40 bg-amber-500/10 text-foreground'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                {validationSummary.invalidCount > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                <div>
                  <span className="font-semibold">
                    {validationSummary.invalidCount > 0
                      ? 'Formatting issues detected in spreadsheet:'
                      : 'All records valid:'}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    {validationSummary.invalidCount > 0 ? (
                      <>
                        <strong>{validationSummary.validCount} valid</strong> contacts will be imported. The{' '}
                        <strong>{validationSummary.invalidCount} invalid rows</strong> can be downloaded or fixed directly in Step 3.
                      </>
                    ) : (
                      <>All {validationSummary.validCount} phone numbers are properly formatted and ready for import.</>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                >
                  {validationSummary.validCount} Valid
                </Badge>
                {validationSummary.invalidCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10"
                  >
                    {validationSummary.invalidCount} Invalid Format
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Column Mapping Controls */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Column Mapping</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Match fields from your spreadsheet to contact directory fields.
                  </CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-mapped from headers
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Column (Required) */}
                <div className="space-y-1.5 p-3.5 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mapPhone" className="text-xs font-semibold flex items-center gap-1 text-foreground">
                      Phone Number Column <span className="text-destructive">*</span>
                    </Label>
                    <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 bg-destructive/5 font-semibold">
                      Required
                    </Badge>
                  </div>
                  <Select value={phoneColumn} onValueChange={setPhoneColumn}>
                    <SelectTrigger id="mapPhone" className="h-9 text-xs bg-card">
                      <SelectValue placeholder="Select column for Phone" />
                    </SelectTrigger>
                    <SelectContent>
                      {parsedHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h} (e.g. {parsedRows[0]?.[h] || 'empty'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* First Name Column */}
                <div className="space-y-1.5 p-3.5 rounded-xl border border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mapFirst" className="text-xs font-semibold text-foreground">
                      First Name Column
                    </Label>
                    <Badge variant="secondary" className="text-[10px]">
                      Optional
                    </Badge>
                  </div>
                  <Select value={firstNameColumn} onValueChange={setFirstNameColumn}>
                    <SelectTrigger id="mapFirst" className="h-9 text-xs bg-card">
                      <SelectValue placeholder="Select column for First Name" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE" className="text-xs italic text-muted-foreground">
                        -- Do Not Import First Name --
                      </SelectItem>
                      {parsedHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h} (e.g. {parsedRows[0]?.[h] || 'empty'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Last Name Column */}
                <div className="space-y-1.5 p-3.5 rounded-xl border border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mapLast" className="text-xs font-semibold text-foreground">
                      Last Name Column
                    </Label>
                    <Badge variant="secondary" className="text-[10px]">
                      Optional
                    </Badge>
                  </div>
                  <Select value={lastNameColumn} onValueChange={setLastNameColumn}>
                    <SelectTrigger id="mapLast" className="h-9 text-xs bg-card">
                      <SelectValue placeholder="Select column for Last Name" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE" className="text-xs italic text-muted-foreground">
                        -- Do Not Import Last Name --
                      </SelectItem>
                      {parsedHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h} (e.g. {parsedRows[0]?.[h] || 'empty'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Column */}
                <div className="space-y-1.5 p-3.5 rounded-xl border border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mapEmail" className="text-xs font-semibold text-foreground">
                      Email Address Column
                    </Label>
                    <Badge variant="secondary" className="text-[10px]">
                      Optional
                    </Badge>
                  </div>
                  <Select value={emailColumn} onValueChange={setEmailColumn}>
                    <SelectTrigger id="mapEmail" className="h-9 text-xs bg-card">
                      <SelectValue placeholder="Select column for Email" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE" className="text-xs italic text-muted-foreground">
                        -- Do Not Import Email --
                      </SelectItem>
                      {parsedHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h} (e.g. {parsedRows[0]?.[h] || 'empty'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wizard Choices: Target Group & Subscription Status Settings */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Batch Assignment & Status Settings</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Choose destination group and delivery status for all contacts in this batch.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Target Broadcast Group Selection */}
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="assignGroup" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      Target Broadcast Group
                    </Label>
                    <Badge variant="secondary" className="text-[10px]">
                      Optional
                    </Badge>
                  </div>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger id="assignGroup" className="h-9 text-xs bg-card">
                      <SelectValue placeholder="Select destination group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Do Not Assign to a Group (Main Directory Only)</SelectItem>
                      {availableGroups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Enrolls all contacts from this file directly into the selected group.
                  </p>
                </div>

                {/* 2. Initial Subscription Status Selection */}
                <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="assignStatus" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Initial Subscription Status
                    </Label>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-semibold',
                        selectedStatus === 'ACTIVE'
                          ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
                      )}
                    >
                      {selectedStatus === 'ACTIVE' ? 'Active' : 'Opted Out'}
                    </Badge>
                  </div>
                  <Select
                    value={selectedStatus}
                    onValueChange={(val: 'ACTIVE' | 'OPTED_OUT') => setSelectedStatus(val)}
                  >
                    <SelectTrigger id="assignStatus" className="h-9 text-xs bg-card">
                      <SelectValue placeholder="Select initial status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active (Subscribed & Eligible for Broadcasts)</SelectItem>
                      <SelectItem value="OPTED_OUT">Opted Out (Excluded from Broadcasts)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedStatus === 'ACTIVE'
                      ? 'Contacts will immediately be active and eligible for outgoing SMS broadcasts.'
                      : 'Contacts will be saved as opted-out and automatically skipped from campaign delivery.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Data Preview Table with Search, Filter, Carrier Detection & Pagination */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm sm:text-base font-semibold">Data Preview</CardTitle>
                    <Badge variant="outline" className="text-xs font-mono">
                      {filteredPreviewRows.length === parsedRows.length
                        ? `${parsedRows.length} Contacts`
                        : `${filteredPreviewRows.length} of ${parsedRows.length} Filtered`}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    Live preview with real-time network detection, validation flags, search, and pagination.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Users className="w-3 h-3 text-primary" />
                    {selectedGroup === 'NONE'
                      ? 'Directory Only'
                      : availableGroups.find((g) => g.id === selectedGroup)?.name || 'Selected Group'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs gap-1',
                      selectedStatus === 'ACTIVE'
                        ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
                        : 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5'
                    )}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {selectedStatus === 'ACTIVE' ? 'Active' : 'Opted Out'}
                  </Badge>
                </div>
              </div>

              {/* Search & Filter Controls Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search phone, name, email, network..."
                      value={previewSearch}
                      onChange={(e) => {
                        setPreviewSearch(e.target.value);
                        setPreviewPage(1);
                      }}
                      className="pl-8.5 pr-8 h-9 text-xs bg-muted/30 focus-visible:bg-card"
                    />
                    {previewSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewSearch('');
                          setPreviewPage(1);
                        }}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Network Filter */}
                  <Select
                    value={previewNetworkFilter}
                    onValueChange={(val) => {
                      setPreviewNetworkFilter(val);
                      setPreviewPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs w-full sm:w-[170px] bg-muted/30">
                      <div className="flex items-center gap-1.5 truncate">
                        <Radio className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {previewNetworkFilter === 'ALL'
                            ? `All Networks (${parsedRows.length})`
                            : previewNetworkFilter === 'OTHER'
                              ? `Other (${networkCounts.OTHER})`
                              : `${previewNetworkFilter} (${networkCounts[previewNetworkFilter] || 0})`}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Networks ({parsedRows.length})</SelectItem>
                      {networkCounts.MTN > 0 && <SelectItem value="MTN">MTN ({networkCounts.MTN})</SelectItem>}
                      {networkCounts.AIRTEL > 0 && <SelectItem value="AIRTEL">Airtel ({networkCounts.AIRTEL})</SelectItem>}
                      {networkCounts.SAFARICOM > 0 && <SelectItem value="SAFARICOM">Safaricom ({networkCounts.SAFARICOM})</SelectItem>}
                      {networkCounts.VODACOM > 0 && <SelectItem value="VODACOM">Vodacom ({networkCounts.VODACOM})</SelectItem>}
                      {networkCounts.TIGO > 0 && <SelectItem value="TIGO">Tigo ({networkCounts.TIGO})</SelectItem>}
                      {networkCounts.OTHER > 0 && <SelectItem value="OTHER">Other / Intl ({networkCounts.OTHER})</SelectItem>}
                    </SelectContent>
                  </Select>

                  {/* Status Filter Dropdown */}
                  <Select
                    value={previewStatusFilter}
                    onValueChange={(val: 'ALL' | 'VALID' | 'INVALID') => {
                      setPreviewStatusFilter(val);
                      setPreviewPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs w-full sm:w-[175px] bg-muted/30">
                      <div className="flex items-center gap-1.5 truncate">
                        <Filter className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {previewStatusFilter === 'ALL'
                            ? `All Statuses (${statusCounts.total})`
                            : previewStatusFilter === 'VALID'
                              ? `Valid Only (${statusCounts.valid})`
                              : `Invalid Only (${statusCounts.invalid})`}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses ({statusCounts.total})</SelectItem>
                      <SelectItem value="VALID">Valid Format Only ({statusCounts.valid})</SelectItem>
                      <SelectItem value="INVALID">Invalid Issues Only ({statusCounts.invalid})</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Dual Valid / Invalid Section Quick Toggle Pills */}
                  <div className="hidden md:flex items-center p-0.5 rounded-lg bg-muted/40 border border-border shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewStatusFilter('ALL');
                        setPreviewPage(1);
                      }}
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                        previewStatusFilter === 'ALL'
                          ? 'bg-card text-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      All ({statusCounts.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewStatusFilter('VALID');
                        setPreviewPage(1);
                      }}
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1',
                        previewStatusFilter === 'VALID'
                          ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                      Valid ({statusCounts.valid})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewStatusFilter('INVALID');
                        setPreviewPage(1);
                      }}
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1',
                        previewStatusFilter === 'INVALID'
                          ? 'bg-card text-destructive shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <AlertTriangle className="w-3 h-3 text-destructive" />
                      Invalid ({statusCounts.invalid})
                    </button>
                  </div>
                </div>

                {/* Reset Filters Action */}
                {(previewSearch || previewNetworkFilter !== 'ALL' || previewStatusFilter !== 'ALL') && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPreviewSearch('');
                      setPreviewNetworkFilter('ALL');
                      setPreviewStatusFilter('ALL');
                      setPreviewPage(1);
                    }}
                    className="h-9 text-xs text-muted-foreground hover:text-foreground shrink-0"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>

              {/* Danger Stripes Alert Banner when invalid contacts are present */}
              {statusCounts.invalid > 0 && (
                <div className="mt-3 p-3 rounded-xl border border-destructive/30 bg-[repeating-linear-gradient(-45deg,rgba(239,68,68,0.05),rgba(239,68,68,0.05)_10px,transparent_10px,transparent_20px)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    <span>
                      <strong className="text-destructive font-semibold">
                        {statusCounts.invalid} contact{statusCounts.invalid > 1 ? 's' : ''} with formatting issues
                      </strong>{' '}
                      detected (highlighted with red danger stripes). You can click <strong>Edit</strong> on any row to fix them inline right now before importing.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {previewStatusFilter !== 'INVALID' ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreviewStatusFilter('INVALID');
                          setPreviewPage(1);
                        }}
                        className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 font-medium"
                      >
                        Show Only Issues ({statusCounts.invalid})
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreviewStatusFilter('ALL');
                          setPreviewPage(1);
                        }}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Show All Contacts
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold text-primary w-[240px]">
                        Phone ({phoneColumn || 'Not mapped'})
                      </TableHead>
                      <TableHead className="font-semibold text-foreground w-[150px]">
                        Network / Carrier
                      </TableHead>
                      <TableHead className="font-semibold text-foreground w-[140px]">
                        Format Status
                      </TableHead>
                      <TableHead className="font-semibold text-foreground min-w-[130px]">
                        First Name ({firstNameColumn === 'NONE' ? 'Skipped' : firstNameColumn})
                      </TableHead>
                      <TableHead className="font-semibold text-foreground min-w-[130px]">
                        Last Name ({lastNameColumn === 'NONE' ? 'Skipped' : lastNameColumn})
                      </TableHead>
                      <TableHead className="font-semibold text-foreground min-w-[170px]">
                        Email ({emailColumn === 'NONE' ? 'Skipped' : emailColumn})
                      </TableHead>
                      <TableHead className="font-semibold text-foreground w-[130px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPreviewRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                          <p className="text-sm font-medium">No contacts match the active search or filters.</p>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-xs text-primary mt-1"
                            onClick={() => {
                              setPreviewSearch('');
                              setPreviewNetworkFilter('ALL');
                              setPreviewStatusFilter('ALL');
                              setPreviewPage(1);
                            }}
                          >
                            Clear search and filters
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPreviewRows.map((item) => {
                        const isEditing = editingRowIndex === item.originalIndex;

                        return (
                          <TableRow
                            key={item.originalIndex}
                            onDoubleClick={() => !isEditing && handleStartEditing(item.originalIndex)}
                            className={cn(
                              'transition-colors duration-150',
                              !item.isValid && !isEditing && [
                                // Visual Danger Stripes for invalid rows
                                'bg-[repeating-linear-gradient(-45deg,rgba(239,68,68,0.06),rgba(239,68,68,0.06)_10px,transparent_10px,transparent_20px)]',
                                'dark:bg-[repeating-linear-gradient(-45deg,rgba(239,68,68,0.12),rgba(239,68,68,0.12)_10px,transparent_10px,transparent_20px)]',
                                'border-l-4 border-l-destructive border-b border-destructive/20 hover:bg-destructive/10',
                              ],
                              item.isValid && !isEditing && 'hover:bg-muted/30',
                              isEditing && 'bg-primary/5 ring-1 ring-primary/30'
                            )}
                          >
                            {/* Phone Cell */}
                            <TableCell className="font-mono py-2.5">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <Input
                                    type="text"
                                    value={editValues.phone}
                                    onChange={(e) =>
                                      setEditValues((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                    className={cn(
                                      'h-8 text-xs font-mono bg-card',
                                      activeEditCarrier?.isValid
                                        ? 'border-emerald-500/50 focus-visible:ring-emerald-500/20'
                                        : 'border-destructive focus-visible:ring-destructive/20'
                                    )}
                                    placeholder="e.g. +256700123456"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveRow(item.originalIndex);
                                      if (e.key === 'Escape') handleCancelEditing();
                                    }}
                                  />
                                  {activeEditCarrier && !activeEditCarrier.isValid && (
                                    <div className="flex items-center gap-1 text-[10px] text-destructive font-medium">
                                      <AlertTriangle className="w-3 h-3 shrink-0" />
                                      <span className="truncate">
                                        {activeEditCarrier.error || 'Invalid phone format'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : item.phoneError ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 p-1 px-2 rounded-md border border-destructive/70 bg-destructive/10 text-destructive font-mono text-xs font-semibold w-fit">
                                    {item.rawPhone ? (
                                      <CountryFlagPhone phone={item.rawPhone} asLink={false} className="text-destructive font-bold" />
                                    ) : (
                                      <span className="italic text-destructive">Missing Phone</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] font-medium text-destructive">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{item.phoneError}</span>
                                  </div>
                                </div>
                              ) : item.rawPhone ? (
                                <CountryFlagPhone phone={item.rawPhone} asLink className="text-xs text-foreground font-medium" />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            {/* Network / Carrier Cell */}
                            <TableCell className="py-2.5">
                              {isEditing ? (
                                <CarrierBadge phone={editValues.phone} />
                              ) : item.rawPhone ? (
                                <CarrierBadge phone={item.rawPhone} />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            {/* Format Status Cell */}
                            <TableCell className="py-2.5">
                              {isEditing ? (
                                activeEditCarrier?.isValid ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1 font-semibold"
                                  >
                                    <Check className="w-3 h-3" />
                                    Valid
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] text-destructive border-destructive/40 bg-destructive/10 gap-1 font-semibold"
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    Invalid
                                  </Badge>
                                )
                              ) : item.isValid ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1 font-semibold"
                                >
                                  <Check className="w-3 h-3" />
                                  Valid
                                </Badge>
                              ) : (
                                <div className="flex flex-col gap-1 items-start">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] text-destructive border-destructive/40 bg-destructive/10 gap-1 font-semibold"
                                    title={item.phoneError || item.emailError || 'Formatting issues'}
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    Invalid ({[item.phoneError, item.emailError].filter(Boolean).length})
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStartEditing(item.originalIndex)}
                                    className="h-5 px-1.5 text-[10px] font-medium text-destructive hover:text-destructive hover:bg-destructive/15 underline"
                                  >
                                    Fix inline
                                  </Button>
                                </div>
                              )}
                            </TableCell>

                            {/* First Name Cell */}
                            <TableCell className="py-2.5">
                              {isEditing ? (
                                <Input
                                  type="text"
                                  value={editValues.firstName}
                                  onChange={(e) =>
                                    setEditValues((prev) => ({ ...prev, firstName: e.target.value }))
                                  }
                                  className="h-8 text-xs bg-card"
                                  placeholder="First name"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRow(item.originalIndex);
                                    if (e.key === 'Escape') handleCancelEditing();
                                  }}
                                />
                              ) : firstNameColumn !== 'NONE' ? (
                                item.row[firstNameColumn] || '—'
                              ) : (
                                '—'
                              )}
                            </TableCell>

                            {/* Last Name Cell */}
                            <TableCell className="py-2.5">
                              {isEditing ? (
                                <Input
                                  type="text"
                                  value={editValues.lastName}
                                  onChange={(e) =>
                                    setEditValues((prev) => ({ ...prev, lastName: e.target.value }))
                                  }
                                  className="h-8 text-xs bg-card"
                                  placeholder="Last name"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRow(item.originalIndex);
                                    if (e.key === 'Escape') handleCancelEditing();
                                  }}
                                />
                              ) : lastNameColumn !== 'NONE' ? (
                                item.row[lastNameColumn] || '—'
                              ) : (
                                '—'
                              )}
                            </TableCell>

                            {/* Email Cell */}
                            <TableCell className="py-2.5">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <Input
                                    type="email"
                                    value={editValues.email}
                                    onChange={(e) =>
                                      setEditValues((prev) => ({ ...prev, email: e.target.value }))
                                    }
                                    className={cn(
                                      'h-8 text-xs bg-card',
                                      editValues.email &&
                                        !isValidEmail(editValues.email) &&
                                        'border-destructive focus-visible:ring-destructive/20'
                                    )}
                                    placeholder="email@example.com"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveRow(item.originalIndex);
                                      if (e.key === 'Escape') handleCancelEditing();
                                    }}
                                  />
                                  {editValues.email && !isValidEmail(editValues.email) && (
                                    <div className="flex items-center gap-1 text-[10px] text-destructive font-medium">
                                      <AlertTriangle className="w-3 h-3 shrink-0" />
                                      <span>Invalid email format</span>
                                    </div>
                                  )}
                                </div>
                              ) : item.emailError ? (
                                <div className="space-y-1">
                                  <div className="p-1 px-2 rounded-md border border-destructive/70 bg-destructive/10 text-destructive text-xs font-medium w-fit">
                                    {item.email}
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] font-medium text-destructive">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{item.emailError}</span>
                                  </div>
                                </div>
                              ) : emailColumn !== 'NONE' && item.row[emailColumn] ? (
                                <span className="text-foreground">{item.row[emailColumn]}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            {/* Actions Cell: Inline Edit & Delete */}
                            <TableCell className="py-2.5 text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleSaveRow(item.originalIndex)}
                                    className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 shadow-xs"
                                    title="Save contact changes"
                                  >
                                    <Check className="w-3 h-3" />
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEditing}
                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    title="Cancel editing"
                                  >
                                    <X className="w-3 h-3" />
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStartEditing(item.originalIndex)}
                                    className="h-7 px-2 text-xs gap-1 hover:border-primary hover:text-primary transition-colors"
                                    title="Inline edit contact before importing"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRow(item.originalIndex)}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Remove row from import batch"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPreviewItems > 0 && (
                <Pagination
                  page={safePreviewPage}
                  totalPages={totalPreviewPages}
                  pageSize={previewPageSize}
                  totalItems={totalPreviewItems}
                  onPageChange={setPreviewPage}
                  onPageSizeChange={(sz) => {
                    setPreviewPageSize(sz);
                    setPreviewPage(1);
                  }}
                  pageSizeOptions={[5, 10, 25, 50, 100]}
                />
              )}
            </CardContent>
          </Card>

          {/* Step 2 Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isImporting}
              className="w-full sm:w-auto"
            >
              Back to Upload
            </Button>

            <Button
              type="button"
              onClick={handleExecuteImport}
              disabled={isImporting || !phoneColumn}
              className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-10 px-6 shadow-sm"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importing {parsedRows.length} Contacts...</span>
                </>
              ) : (
                <>
                  <span>Import {parsedRows.length} Contacts</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: IMPORT COMPLETE & INVALID RECOVERY */}
      {step === 3 && importResults && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="border border-border bg-card shadow-sm rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-10 sm:py-14 text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-5 ring-8 ring-emerald-500/5">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Import Completed Successfully!
              </h2>

              <p className="text-sm text-muted-foreground max-w-md mb-8">
                Your contacts have been processed and enrolled into your broadcast directory.
              </p>

              {/* Dynamic Metrics Grid: 3 columns if 0 errors, 4 columns if errors exist */}
              <div
                className={cn(
                  'gap-3 sm:gap-4 w-full mb-8',
                  editableInvalidContacts.length > 0
                    ? 'grid grid-cols-2 sm:grid-cols-4 max-w-2xl'
                    : 'grid grid-cols-3 max-w-xl'
                )}
              >
                <div className="p-4 rounded-xl border border-border bg-muted/20 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{importResults.total}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">Processed</div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {importResults.imported}
                  </div>
                  <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium">Added</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">
                    {importResults.duplicates}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">Duplicates</div>
                </div>

                {editableInvalidContacts.length > 0 && (
                  <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
                      {editableInvalidContacts.length}
                    </div>
                    <div className="text-xs mt-1 font-medium text-rose-600/80 dark:text-rose-400/80">
                      Invalid Format
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button asChild size="lg" className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  <Link href="/contacts">
                    View Contacts Directory
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  Import Another File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* INVALID CONTACTS RECOVERY: Inline Edit & Instant Import OR Download CSV */}
          {editableInvalidContacts.length > 0 && (
            <Card className="border border-rose-500/30 bg-card shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold text-foreground">
                          Invalid Contacts ({editableInvalidContacts.length})
                        </CardTitle>
                        <Badge variant="outline" className="text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10">
                          Action Available
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1">
                        These contacts were excluded due to invalid phone formatting. You can edit and import them directly below, or download an error file to review in Excel.
                      </CardDescription>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadInvalidCsv}
                    className="gap-2 h-9 text-xs border-rose-500/30 hover:border-rose-500 text-foreground bg-rose-500/5 hover:bg-rose-500/10 shrink-0 self-start sm:self-auto"
                  >
                    <FileDown className="w-4 h-4 text-rose-500" />
                    Download Invalid Contacts (.csv)
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="rounded-xl border border-border overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-12 text-center">Row</TableHead>
                        <TableHead>Contact Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="min-w-[240px]">Edit Phone Number</TableHead>
                        <TableHead>Validation Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableInvalidContacts.map((contact, idx) => {
                        const validation = normalizePhoneNumber(contact.phone);
                        const isNowValid = validation.isValid;

                        return (
                          <TableRow key={idx}>
                            <TableCell className="text-center font-mono text-muted-foreground">
                              {contact.row}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {contact.firstName || contact.lastName
                                ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
                                : '—'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {contact.email || '—'}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={contact.phone}
                                    onChange={(e) => handleEditInvalidPhone(idx, e.target.value)}
                                    placeholder="e.g. +256700123456"
                                    className={cn(
                                      'h-8 text-xs font-mono max-w-[200px]',
                                      isNowValid
                                        ? 'border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-500/5'
                                        : 'border-rose-500/60 focus-visible:ring-rose-500 bg-rose-500/5'
                                    )}
                                  />
                                  {isNowValid && (
                                    <CountryFlagPhone phone={contact.phone} className="text-xs" />
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {isNowValid ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1 font-medium"
                                >
                                  <Check className="w-3 h-3" />
                                  Ready to Import ({validation.normalized})
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-1.5 text-rose-500 text-[11px]">
                                  <X className="w-3.5 h-3.5 shrink-0" />
                                  <span>{validation.error || contact.error}</span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Bottom Actions for In-System Fixing */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    {correctedValidCount > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {correctedValidCount} of {editableInvalidContacts.length} numbers corrected and ready for instant import.
                      </span>
                    ) : (
                      <span>Edit any phone number above with international prefix (e.g. +256, +254) to import it immediately.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Button
                      type="button"
                      onClick={handleImportCorrectedContacts}
                      disabled={correctedValidCount === 0 || isFixingAndImporting}
                      className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-9 text-xs shadow-sm"
                    >
                      {isFixingAndImporting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Importing {correctedValidCount} Contacts...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Import Corrected Contacts ({correctedValidCount})</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Celebration when all invalid contacts are resolved */}
          {importResults.invalid > 0 && editableInvalidContacts.length === 0 && (
            <Card className="border border-emerald-500/30 bg-emerald-500/5 shadow-xs rounded-2xl">
              <CardContent className="p-4 sm:p-5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    All invalid contacts resolved!
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Every contact from this import has now been successfully validated and enrolled into your directory.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
