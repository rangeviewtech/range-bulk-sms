'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { extractVariablesFromText, renderPreviewWithSamples } from '@/lib/sms/custom-variables';
import { useSmsDraft } from '@/hooks/use-sms-draft';
import { DraftsDrawer } from '@/components/sms/drafts-drawer';
import { formatRelativeDate } from '@/utils/date';
import {
  getNonGsmCharacters,
  cleanToGsm7,
} from '@/lib/sms/counter';
import readXlsxFile from 'read-excel-file/browser';
import { notifyWalletUpdated } from '@/hooks/use-wallet';
import { generateSampleRecipientsCsv, triggerCsvDownload } from '@/lib/sms/template-csv';

const VariableResolutionModal = dynamic(
  () => import('@/components/sms/variable-resolution-modal').then((mod) => mod.VariableResolutionModal),
  { ssr: false }
);

const GrammarCheckModal = dynamic(
  () => import('@/components/sms/grammar-check-modal').then((mod) => mod.GrammarCheckModal),
  { ssr: false }
);

const ConfirmationDialog = dynamic(
  () => import('@/components/feedback/confirmation-dialog').then((mod) => mod.ConfirmationDialog),
  { ssr: false }
);

const GroupDetailsDialog = dynamic(
  () => import('@/components/contacts/group-details-dialog').then((mod) => mod.GroupDetailsDialog),
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
  Bookmark,
  Check,
  FileText,
  Plus,
  FileSpreadsheet,
  UploadCloud,
  Users,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Wifi,
  Battery,
  Signal,
  Download,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  VariableTextarea,
  insertVariableAtCursor,
  getVariableColorTheme,
} from '@/components/sms/variable-textarea';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { InputError } from '@/components/ui/input-error';
import { TemplateHighlighter } from '@/components/sms/template-highlighter';
import type { SmsDraft, SmsDraftFormData } from '@/types/sms-draft';

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

function SendSmsSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[550px] rounded-xl" />
        <Skeleton className="h-[550px] rounded-xl" />
      </div>
    </div>
  );
}

function SendSmsContent() {
  const searchParams = useSearchParams();
  const draftQueryId = searchParams.get('draft');

  const [senderId, setSenderId] = useState('RANGESMS');
  const [senderOptions, setSenderOptions] = useState<SenderOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>(INITIAL_GROUPS);
  const [deliveryMode, setDeliveryMode] = useState<'manual' | 'groups' | 'import'>('manual');
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
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [excludedGroupPhones, setExcludedGroupPhones] = useState<string[]>([]);
  const [rawGroupPhones, setRawGroupPhones] = useState<string[]>([]);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  // File Import State
  const [importFilename, setImportFilename] = useState<string | null>(null);
  const [importRowCount, setImportRowCount] = useState<number | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced SMS Delivery Controls
  const [isFlashSms, setIsFlashSms] = useState(false);
  const [includeOptOut, setIncludeOptOut] = useState(false);

  // Preview & Schedule Modals
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'sample' | 'realistic' | 'raw'>('sample');
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  // Drafts Drawer State
  const [draftsDrawerOpen, setDraftsDrawerOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Calculate parsed recipients
  const parsedManualRecipients = useMemo(() => {
    return manualRecipients
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [manualRecipients]);

  const selectedGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || groups[0] || { id: 'default', name: 'Default', count: 0 };
  }, [groups, selectedGroupId]);

  const groupEffectiveTotal = useMemo(() => {
    const rawTotal = selectedGroup.count || 142;
    return Math.max(0, rawTotal - excludedGroupPhones.length);
  }, [selectedGroup.count, excludedGroupPhones.length]);

  const totalRecipients = useMemo(() => {
    if (deliveryMode === 'manual') return parsedManualRecipients.length;
    if (deliveryMode === 'import') return parsedManualRecipients.length;
    if (deliveryMode === 'groups') return groupEffectiveTotal;
    return manualRecipients ? parsedManualRecipients.length : selectedGroup.count;
  }, [deliveryMode, parsedManualRecipients.length, manualRecipients, selectedGroup.count, groupEffectiveTotal]);

  const currentGroupName = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId)?.name || 'Group';
  }, [groups, selectedGroupId]);

  // Form data snapshot for useSmsDraft hook
  const formData: SmsDraftFormData = useMemo(() => ({
    senderId,
    deliveryMode,
    manualRecipients,
    message,
    recipientCount: totalRecipients,
    selectedGroupId: deliveryMode === 'groups' ? selectedGroupId : null,
    importFilename: deliveryMode === 'import' ? importFilename : null,
    importRowCount: deliveryMode === 'import' ? importRowCount : null,
  }), [senderId, deliveryMode, manualRecipients, message, totalRecipients, selectedGroupId, importFilename, importRowCount]);

  // Setup Autosave & Draft Management Hook
  const {
    activeDraftId,
    saveStatus,
    lastSavedAt,
    isDirty,
    draftsCount,
    saveDraft,
    loadDraft,
    duplicateDraft,
    deleteDraft,
    clearActiveDraft,
  } = useSmsDraft({
    formData,
    enabled: true,
    autosaveInterval: 1800,
    onDraftLoaded: (draft: SmsDraft) => {
      setSenderId(draft.senderId || 'RANGESMS');
      setDeliveryMode((draft.deliveryMode as 'manual' | 'groups' | 'import') || 'manual');
      setManualRecipients(draft.manualRecipients || '');
      setMessage(draft.message || '');
      if (draft.selectedGroupId) setSelectedGroupId(draft.selectedGroupId);
      if (draft.importFilename) setImportFilename(draft.importFilename);
      if (draft.importRowCount) setImportRowCount(draft.importRowCount);
    },
  });

  // Load URL draft parameter if present
  useEffect(() => {
    if (draftQueryId) {
      loadDraft(draftQueryId);
    }
  }, [draftQueryId, loadDraft]);

  // Load initial sender IDs and groups
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

  // Fetch group contacts when Groups mode is selected
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

        await new Promise((resolve) => setTimeout(resolve, 350));

        if (isCurrent) {
          setRawGroupPhones(phones);
          const active = phones.filter((p) => !excludedGroupPhones.includes(p));
          setManualRecipients(active.join(', '));
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
  }, [selectedGroupId, deliveryMode, groups, excludedGroupPhones]);

  const handleExcludedPhonesChange = useCallback((nextExcluded: string[]) => {
    setExcludedGroupPhones(nextExcluded);
    if (deliveryMode === 'groups') {
      setRawGroupPhones((prevRaw) => {
        const active = prevRaw.filter((p) => !nextExcluded.includes(p));
        setManualRecipients(active.join(', '));
        return prevRaw;
      });
    }
  }, [deliveryMode]);

  // Recipient validation
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

  // Effective message taking opt-out compliance into account
  const optOutNotice = ' Reply STOP to opt out';
  const effectiveMessage = useMemo(() => {
    if (!includeOptOut) return message;
    if (!message.trim()) return optOutNotice.trim();
    return `${message.trim()}${optOutNotice}`;
  }, [message, includeOptOut]);

  // SMS encoding and segment computation
  const charCount = effectiveMessage.length;
  const nonGsmChars = useMemo(() => getNonGsmCharacters(effectiveMessage), [effectiveMessage]);
  const isUnicode = nonGsmChars.length > 0 || /[^\x00-\x7F]/.test(effectiveMessage);
  const encoding = isUnicode ? 'Unicode (UCS-2)' : 'GSM-7';
  const maxPerSegment = isUnicode ? 70 : 160;
  const segments = charCount > 0 ? Math.ceil(charCount / (isUnicode ? (charCount > 70 ? 67 : 70) : (charCount > 160 ? 153 : 160))) : 1;
  const ratePerSms = 35; // UGX
  const cost = totalRecipients * segments * ratePerSms;

  // Validation state
  const [recipientsTouched, setRecipientsTouched] = useState(false);
  const [messageTouched, setMessageTouched] = useState(false);

  // Validate recipients in real-time
  let recipientsError = '';
  if (deliveryMode === 'manual' || deliveryMode === 'import') {
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
  } else if (effectiveMessage.length > 3200) {
    messageError = 'Message cannot exceed 3,200 characters';
  }

  // Clean & Deduplicate Recipients Tool
  const handleDeduplicateRecipients = useCallback(() => {
    if (!manualRecipients.trim()) {
      toast.info('No recipient phone numbers to deduplicate.');
      return;
    }

    const tokens = manualRecipients.split(/[\n,;\s]+/).map((t) => t.trim()).filter(Boolean);
    const seen = new Set<string>();
    const cleaned: string[] = [];
    let duplicatesRemoved = 0;

    for (const token of tokens) {
      // Normalize common formatting
      let norm = token.replace(/[\s\-().]/g, '');
      if (norm.startsWith('0') && selectedDialCode) {
        norm = `${selectedDialCode}${norm.slice(1)}`;
      }

      if (seen.has(norm)) {
        duplicatesRemoved++;
      } else {
        seen.add(norm);
        cleaned.push(norm);
      }
    }

    setManualRecipients(cleaned.join(', '));
    setRecipientsTouched(true);

    if (duplicatesRemoved > 0) {
      toast.success(`Removed ${duplicatesRemoved} duplicate number(s). ${cleaned.length} unique recipient(s) remaining.`);
    } else {
      toast.info(`All ${cleaned.length} recipient numbers are already unique.`);
    }
  }, [manualRecipients, selectedDialCode]);

  // Clean Non-GSM Characters Tool
  const handleCleanGsm7 = useCallback(() => {
    if (!effectiveMessage) return;
    const { cleaned, replacedCount } = cleanToGsm7(message);
    setMessage(cleaned);
    setMessageTouched(true);
    if (replacedCount > 0) {
      toast.success(`Sanitized ${replacedCount} non-GSM character(s). Message restored to GSM-7 standard!`);
    } else {
      toast.info('Message already conforms to GSM-7 standard.');
    }
  }, [effectiveMessage, message]);

  // Handle File Import Parsing
  const processImportFile = useCallback(async (file: File) => {
    setIsParsingFile(true);
    try {
      const fileName = file.name.toLowerCase();
      const extractedPhones: string[] = [];

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const rawResult = await readXlsxFile(file);
        let rows: unknown[][] = [];
        if (Array.isArray(rawResult) && rawResult.length > 0) {
          const first = rawResult[0];
          if (first && typeof first === 'object' && 'data' in first && Array.isArray((first as { data: unknown[][] }).data)) {
            rows = (first as { data: unknown[][] }).data;
          } else {
            rows = rawResult as unknown as unknown[][];
          }
        }

        if (rows.length > 0) {
          const headers = (rows[0] || []).map((c) => String(c || '').toLowerCase().trim());
          let phoneColIdx = headers.findIndex((h) =>
            /phone|mobile|tel|contact|number|msisdn/i.test(h)
          );

          if (phoneColIdx === -1) {
            phoneColIdx = 0;
          }

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i] || [];
            const cellVal = String(row[phoneColIdx] || '').trim();
            if (cellVal) {
              const matched = cellVal.match(/\+?[0-9]{9,15}/);
              if (matched) extractedPhones.push(matched[0]);
            }
          }
        }
      } else {
        // CSV / TSV / TXT Parser
        const text = await file.text();
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
          const headerCells = lines[0].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim().toLowerCase());
          const phoneColIdx = headerCells.findIndex((h) =>
            /phone|mobile|tel|contact|number|msisdn/i.test(h)
          );

          const startLine = phoneColIdx !== -1 ? 1 : 0;
          const targetCol = phoneColIdx !== -1 ? phoneColIdx : 0;

          for (let i = startLine; i < lines.length; i++) {
            const cells = lines[i].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
            const val = cells[targetCol] || lines[i];
            const matched = val.match(/\+?[0-9]{9,15}/);
            if (matched) {
              extractedPhones.push(matched[0]);
            }
          }
        }
      }

      // Deduplicate extracted numbers
      const uniquePhones = Array.from(new Set(extractedPhones));
      const duplicatesSkipped = extractedPhones.length - uniquePhones.length;

      if (uniquePhones.length === 0) {
        toast.error('Could not detect valid phone numbers in this file. Please ensure it has a phone column.');
        return;
      }

      setImportFilename(file.name);
      setImportRowCount(uniquePhones.length);
      setManualRecipients(uniquePhones.join(', '));
      setRecipientsTouched(true);
      toast.success(
        `Loaded ${uniquePhones.length} contact(s) from "${file.name}"${
          duplicatesSkipped > 0 ? ` (${duplicatesSkipped} duplicates skipped)` : ''
        }`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse uploaded spreadsheet');
    } finally {
      setIsParsingFile(false);
    }
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingFile(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processImportFile(e.dataTransfer.files[0]);
      }
    },
    [processImportFile]
  );

  const handleClearImportFile = useCallback(() => {
    setImportFilename(null);
    setImportRowCount(null);
    setManualRecipients('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Cleared imported file');
  }, []);

  const detectedVariablesList = useMemo(() => {
    return extractVariablesFromText(message);
  }, [message]);

  const handleDownloadSampleCsv = useCallback(() => {
    const targetRecipients = parsedManualRecipients.length > 0
      ? parsedManualRecipients
      : [];

    if (targetRecipients.length === 0) {
      toast.info('No recipients detected yet. Downloading template with standard sample phone numbers.');
    }

    const { content, filename, recipientCount } = generateSampleRecipientsCsv({
      recipients: targetRecipients,
      variables: detectedVariablesList,
      sourceFilename: importFilename,
    });

    triggerCsvDownload(content, filename);
    toast.success(
      `Downloaded template for ${recipientCount} available recipient${
        recipientCount === 1 ? '' : 's'
      } with empty variable columns`
    );
  }, [detectedVariablesList, parsedManualRecipients, importFilename]);

  const handleSelectTemplate = (templateContent: string) => {
    setMessage(templateContent);
    setMessageTouched(true);
    setTemplateModalOpen(false);
    toast.success('Template applied to message body');
  };

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

  const handleCopyPreview = () => {
    const textToCopy = renderPreviewWithSamples(effectiveMessage || '');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPreview(true);
    toast.success('Sample preview text copied to clipboard');
    setTimeout(() => setCopiedPreview(false), 2000);
  };

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

  const setPresetSchedule = (hoursAhead?: number, tomorrowAtHour?: number) => {
    const d = new Date();
    if (hoursAhead !== undefined) {
      d.setHours(d.getHours() + hoursAhead);
    } else if (tomorrowAtHour !== undefined) {
      d.setDate(d.getDate() + 1);
      d.setHours(tomorrowAtHour, 0, 0, 0);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const val = `${year}-${month}-${day}T${hours}:${mins}`;
    setScheduleDate(val);
    validateScheduleDate(val);
  };

  const resolveRecipients = async (): Promise<string[]> => {
    if (deliveryMode === 'manual' || deliveryMode === 'import') {
      return parsedManualRecipients;
    }
    if (deliveryMode === 'groups') {
      if (rawGroupPhones.length > 0) {
        return rawGroupPhones.filter((p) => !excludedGroupPhones.includes(p));
      }
      try {
        const res = await fetch(`/api/contacts?groupId=${selectedGroupId}&limit=5000`);
        if (res.ok) {
          const json = await res.json();
          const items = json.data?.items || json.data || [];
          const phones = items.map((c: { phone?: string; normalizedPhone?: string }) => c.phone || c.normalizedPhone).filter(Boolean);
          if (phones.length > 0) {
            return phones.filter((p: string) => !excludedGroupPhones.includes(p));
          }
        }
      } catch {
        // Fallback
      }
      if (manualRecipients) {
        return parsedManualRecipients;
      }
    }
    return ['+256700000001'];
  };

  const handleConfirmVariableResolution = (
    personalizedMessages: { phone: string; message: string }[],
    _hasFallback: boolean
  ) => {
    const resolvedMessage = personalizedMessages[0]?.message || effectiveMessage;
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

    const msgToUse = typeof resolvedMsg === 'string' ? resolvedMsg : effectiveMessage.trim();
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
          flash: isFlashSms,
          personalizedMessages: personalizedList && personalizedList.length > 0 ? personalizedList : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Failed to dispatch SMS message');
        return;
      }

      toast.success(`Successfully dispatched ${recipientsToSend.length} SMS message(s)!`);
      notifyWalletUpdated();
      setManualRecipients('');
      setMessage('');
      setImportFilename(null);
      setImportRowCount(null);
      setRecipientsTouched(false);
      setMessageTouched(false);
      clearActiveDraft();
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

    const msgToUse = typeof resolvedMsg === 'string' ? resolvedMsg : effectiveMessage.trim();
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
          flash: isFlashSms,
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
      notifyWalletUpdated();
      setScheduleOpen(false);
      setScheduleDate('');
      setScheduleError('');
      setManualRecipients('');
      setMessage('');
      setImportFilename(null);
      setImportRowCount(null);
      setRecipientsTouched(false);
      setMessageTouched(false);
      clearActiveDraft();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Network error scheduling message');
    } finally {
      setScheduling(false);
    }
  };

  const handleResetForm = () => {
    if (isDirty || message.trim() || manualRecipients.trim()) {
      setConfirmClearOpen(true);
    } else {
      doClearForm();
    }
  };

  const doClearForm = () => {
    setManualRecipients('');
    setMessage('');
    setImportFilename(null);
    setImportRowCount(null);
    setRecipientsTouched(false);
    setMessageTouched(false);
    clearActiveDraft();
    setConfirmClearOpen(false);
    toast.info('Form cleared for new broadcast');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header with Real-Time Autosave Status and Draft Navigation */}
      <PageHeader
        title="Send SMS"
        description="Compose and dispatch bulk SMS broadcasts with real-time carrier intelligence."
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Autosave Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground mr-1">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-[11px] font-medium">Saving draft...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Autosaved</span>
              </>
            ) : saveStatus === 'conflict' ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-medium text-amber-600">Draft Conflict</span>
              </>
            ) : lastSavedAt ? (
              <span className="text-[11px] inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground/70" />
                Saved {formatRelativeDate(lastSavedAt)}
              </span>
            ) : (
              <span className="text-[11px]">Draft ready</span>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetForm}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            title="Start new message"
            aria-label="Start new message"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => saveDraft()}
            disabled={saveStatus === 'saving' || !message.trim()}
            className="h-8 px-2.5 text-xs gap-1.5"
            title="Save current progress as draft"
            aria-label="Save current draft"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDraftsDrawerOpen(true)}
            className="h-8 px-2.5 text-xs gap-1.5 font-medium border-primary/30 hover:border-primary"
          >
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Drafts</span>
            {draftsCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] bg-primary/10 text-primary font-bold">
                {draftsCount}
              </Badge>
            )}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:items-stretch">
        {/* Left Column: Primary Message Details & Composer (2 columns on desktop) */}
        <div className="lg:col-span-2 flex flex-col lg:h-full">
          <Card className="shadow-xs border-border/80 flex flex-col flex-1 lg:h-full">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold">Message Details</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Configure your delivery mode, sender ID, and targeted recipients.
                  </CardDescription>
                </div>
              </div>

              {/* Seamless Segmented Delivery Mode Selector */}
              <div className="pt-3">
                <div className="p-1 bg-muted/60 dark:bg-muted/30 rounded-xl border flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('manual')}
                    className={cn(
                      'flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                      deliveryMode === 'manual'
                        ? 'bg-background text-foreground shadow-xs border border-border/50'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Manual Entry</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('groups')}
                    className={cn(
                      'flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                      deliveryMode === 'groups'
                        ? 'bg-background text-foreground shadow-xs border border-border/50'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Contact Groups</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('import')}
                    className={cn(
                      'flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                      deliveryMode === 'import'
                        ? 'bg-background text-foreground shadow-xs border border-border/50'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Import File</span>
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-0 space-y-5 flex-1 flex flex-col">
              {deliveryMode === 'import' ? (
                /* Import Mode: Row 1 = Sender ID + Template Download Action, Row 2 = Full Width Spreadsheet / CSV Recipients */
                <div className="space-y-4">
                  {/* Row 1: Sender ID & Template Download */}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div className="space-y-1.5 w-full sm:max-w-xs">
                      <div className="flex items-center justify-between min-h-8">
                        <Label htmlFor="sender" required>Sender ID</Label>
                        <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                          Approved
                        </Badge>
                      </div>
                      <Select value={senderId} onValueChange={setSenderId}>
                        <SelectTrigger id="sender" className="h-10 text-xs sm:text-sm">
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

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 text-xs px-3 border-dashed hover:border-primary/50 gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={handleDownloadSampleCsv}
                        title="Download sample spreadsheet template with phone numbers"
                      >
                        <Download className="w-3.5 h-3.5 text-primary" />
                        <span>Download Sample CSV Template</span>
                      </Button>
                    </div>
                  </div>

                  {/* Row 2: Spreadsheet / CSV Recipients (Full Width on Larger Screens) */}
                  <div className="space-y-1.5 w-full">
                    <div className="flex justify-between items-center min-h-8">
                      <div className="flex items-center gap-2">
                        <Label required>Spreadsheet / CSV Recipients</Label>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          (.xlsx, .xls, .csv, .tsv)
                        </span>
                      </div>
                      {importRowCount !== null && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {importRowCount} contacts parsed
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv, .tsv, .txt"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          processImportFile(e.target.files[0]);
                        }
                      }}
                    />

                    {importFilename ? (
                      <div className="p-3.5 sm:p-4 rounded-xl border bg-muted/30 border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold truncate text-foreground">{importFilename}</p>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {importRowCount} valid {importRowCount === 1 ? 'number' : 'numbers'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Ready for dispatch • Phone numbers automatically parsed and deduplicated
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs px-2.5"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isParsingFile}
                          >
                            <UploadCloud className="w-3.5 h-3.5 mr-1" />
                            Replace File
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={handleClearImportFile}
                            title="Remove uploaded file"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingFile(true);
                        }}
                        onDragLeave={() => setIsDraggingFile(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          'p-6 sm:p-7 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all',
                          isDraggingFile
                            ? 'border-primary bg-primary/5 scale-[0.99]'
                            : 'border-border/80 hover:border-primary/50 hover:bg-muted/20'
                        )}
                      >
                        {isParsingFile ? (
                          <div className="flex items-center gap-2 text-sm text-primary py-2 font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Parsing spreadsheet contacts...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              Click to browse or drag &amp; drop your spreadsheet file
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-md">
                              Supports Microsoft Excel (.xlsx, .xls), CSV, or TSV. Phone number columns are automatically detected and verified.
                            </p>
                            <div className="flex items-center gap-1.5 mt-3">
                              {['.XLSX', '.XLS', '.CSV', '.TSV'].map((ext) => (
                                <Badge key={ext} variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                                  {ext}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Manual and Contact Groups Modes (Side-by-side on md+) */
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-5">
                  {/* Sender ID */}
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex items-center justify-between min-h-8">
                      <Label htmlFor="sender" required>Sender ID</Label>
                      <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        Approved
                      </Badge>
                    </div>
                    <Select value={senderId} onValueChange={setSenderId}>
                      <SelectTrigger id="sender" className="h-10 text-xs sm:text-sm">
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

                  {/* Recipient Configuration Column */}
                  <div className="space-y-1.5 md:col-span-3">
                    {deliveryMode === 'groups' ? (
                      <>
                        <div className="flex justify-between items-center min-h-8">
                          <Label htmlFor="group-select" required>Target Contact Group</Label>
                          <button
                            type="button"
                            onClick={() => setShowGroupDetailsModal(true)}
                            className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 hover:underline transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title={`Click to view ${selectedGroup.count.toLocaleString()} members in ${selectedGroup.name}`}
                            aria-label={`View ${selectedGroup.count.toLocaleString()} members in ${selectedGroup.name}`}
                          >
                            <span>
                              {excludedGroupPhones.length > 0
                                ? `${(selectedGroup.count - excludedGroupPhones.length).toLocaleString()} of ${selectedGroup.count.toLocaleString()} members`
                                : `${selectedGroup.count.toLocaleString()} members`}
                            </span>
                          </button>
                        </div>
                        <Select
                          value={selectedGroupId}
                          onValueChange={(val) => {
                            setSelectedGroupId(val);
                            setExcludedGroupPhones([]);
                          }}
                        >
                          <SelectTrigger id="group-select" className="h-10 text-xs sm:text-sm">
                            <SelectValue placeholder="Select Contact Group" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((g) => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.name} ({g.count.toLocaleString()} contacts)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            {isGroupLoading ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                Syncing group contacts...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>
                                  Ready for dispatch to {selectedGroup.name}
                                  {excludedGroupPhones.length > 0 && (
                                    <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                                      ({excludedGroupPhones.length} excluded from this send)
                                    </span>
                                  )}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                      </>
                    ) : (
                      /* Manual Entry Mode */
                      <>
                        <div className="flex flex-wrap justify-between items-center gap-1 min-h-8">
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
                          {parsedManualRecipients.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleDeduplicateRecipients}
                              className="h-6 px-1.5 text-[11px] text-primary hover:text-primary gap-1"
                              title="Remove duplicates and clean formatting"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Clean / Deduplicate</span>
                            </Button>
                          )}
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

                        {/* Verified Routes & Recipient Counts Row (on same row, counts floated right) */}
                        {(carrierRouteSummary.length > 0 || totalRecipients > 0) && !isGroupLoading && (
                          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            {/* Left: Verified Routes Badges */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {carrierRouteSummary.length > 0 && (
                                <>
                                  <span className="font-medium text-muted-foreground">
                                    Verified Routes:
                                  </span>
                                  {carrierRouteSummary.map((item) => (
                                    <Badge
                                      key={item.carrier}
                                      variant="outline"
                                      className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 flex items-center gap-1.5"
                                      title={`Allocated network: ${item.carrier} (${item.count} ${item.count === 1 ? 'number' : 'numbers'})`}
                                    >
                                      <span className="font-medium text-foreground">{item.carrier}:</span>
                                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                                        {item.count}
                                      </span>
                                    </Badge>
                                  ))}
                                </>
                              )}
                            </div>

                            {/* Right: Valid & Detected Counts (Floated Right) */}
                            <div className="flex items-center gap-2 ml-auto">
                              {validatedRecipients.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {validatedRecipients.length} valid
                                </span>
                              )}
                              {totalRecipients > 0 && (
                                <span className="text-muted-foreground font-medium">
                                  {totalRecipients} detected
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Message Content Composer Section */}
              <div className="space-y-1.5 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label htmlFor="message" required>Message Content</Label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Non-GSM Sanitizer Button when Unicode characters are present */}
                    {nonGsmChars.length > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
                        onClick={handleCleanGsm7}
                        type="button"
                        title="Convert smart quotes, em dashes, and non-GSM characters to standard GSM-7"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Clean to GSM-7</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-medium gap-1.5"
                      onClick={() => setShowGrammarCheck(true)}
                      type="button"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Grammar</span> Check
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-medium gap-1.5"
                      onClick={() => setTemplateModalOpen(true)}
                      type="button"
                    >
                      <BookTemplate className="w-3.5 h-3.5" />
                      <span>Template</span>
                    </Button>
                    <VariableDropdown onSelect={handleInsertVariable} />
                  </div>
                </div>

                {/* Unicode Encoding Alert Banner */}
                {nonGsmChars.length > 0 && (
                  <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-semibold text-foreground">
                          Non-GSM Characters Detected ({nonGsmChars.length}):
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {nonGsmChars.slice(0, 6).map((c, i) => (
                            <span
                              key={i}
                              className="font-mono px-1.5 py-0.2 bg-background/80 rounded border text-[11px] font-bold"
                            >
                              {c === ' ' ? 'space' : c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        Your message contains Unicode characters (e.g. smart quotes or emojis). This reduces segment capacity from 160 to 70 characters and increases billing cost.
                      </p>
                    </div>
                  </div>
                )}

                <VariableTextarea
                  ref={messageTextareaRef}
                  id="message"
                  rows={5}
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

                {/* Detected Variables Breakdown */}
                {detectedVariablesList.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDetectedVariables(detectedVariablesList);
                        setPendingAction(null);
                        setShowVariableModal(true);
                      }}
                      className="h-6 px-2 text-[11px] gap-1 font-semibold border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer ml-auto"
                      title="Open variable resolution table to configure values or download sample file"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Resolve Variables ({detectedVariablesList.length})</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Advanced Controls & Compliance Toggles */}
              <div className="p-3 bg-muted/20 rounded-xl border border-border/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="optout-toggle" className="text-xs font-semibold cursor-pointer">
                        Append Opt-Out Notice
                      </Label>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground font-mono">
                        +21 chars
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Appends &quot;Reply STOP to opt out&quot; for UCC regulatory compliance.
                    </p>
                  </div>
                  <Switch
                    id="optout-toggle"
                    checked={includeOptOut}
                    onCheckedChange={setIncludeOptOut}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="flash-toggle" className="text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Flash SMS (Class 0)
                      </Label>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                        Immediate Popup
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Pops up directly on the recipient&apos;s handset screen without saving to inbox. Ideal for urgent 2FA/OTPs.
                    </p>
                  </div>
                  <Switch
                    id="flash-toggle"
                    checked={isFlashSms}
                    onCheckedChange={setIsFlashSms}
                  />
                </div>
              </div>

              {/* SMS Telemetry & Segment Meter */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-muted/40 rounded-xl border text-xs">
                <div>
                  <div className="text-muted-foreground text-[11px]">Characters</div>
                  <div className="font-semibold text-sm mt-0.5 flex items-baseline gap-1">
                    <span>{charCount}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /{maxPerSegment}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[11px]">Segments</div>
                  <div className="font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                    <span>{segments}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] px-1.5 py-0 h-4 font-mono',
                        segments > 1 ? 'border-amber-500/40 text-amber-600' : 'border-emerald-500/40 text-emerald-600'
                      )}
                    >
                      {segments === 1 ? 'Single' : 'Multi-part'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[11px]">Encoding</div>
                  <div className="font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                    <span>{encoding}</span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[11px]">Est. Cost</div>
                  <div className="font-semibold text-sm text-[#04648C] dark:text-[#FBCA07] mt-0.5">
                    {cost.toLocaleString()} UGX
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border p-4 sm:p-6 bg-muted/10 mt-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-10"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Handset
              </Button>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto h-10"
                  onClick={() => setScheduleOpen(true)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Dispatch
                </Button>
                <Button
                  onClick={handleSendNow}
                  disabled={sending}
                  className="w-full sm:w-auto h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Dispatching SMS...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Now ({totalRecipients})
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live Interactive Smartphone Simulator & Account Status */}
        <div className="flex flex-col lg:h-full lg:justify-between gap-6">
          {/* Desktop Live Handset Simulator */}
          <Card className="hidden lg:block overflow-hidden border-border/80 shadow-md">
            <CardHeader className="p-4 pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  Live Handset Simulator
                </CardTitle>
                <div className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-800 p-0.5 rounded-full text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('sample')}
                    className={cn(
                      'px-3 py-1 rounded-full font-medium transition-all text-xs cursor-pointer',
                      previewMode === 'sample' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('realistic')}
                    className={cn(
                      'px-3 py-1 rounded-full font-medium transition-all text-xs cursor-pointer',
                      previewMode === 'realistic' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Realistic
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('raw')}
                    className={cn(
                      'px-3 py-1 rounded-full font-medium transition-all text-xs cursor-pointer',
                      previewMode === 'raw' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Tags
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 flex justify-center bg-slate-950/20 dark:bg-slate-950/50">
              {/* Smartphone Frame with Increased Height & Width matching production screenshot */}
              <div className="w-[335px] rounded-[46px] border-[6px] border-slate-700/80 dark:border-slate-800 bg-[#0a0f1d] shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[620px]">
                {/* Camera Punch Hole */}
                <div className="w-2.5 h-2.5 bg-black rounded-full ring-1 ring-slate-800/80 mx-auto -mb-1 z-10" />

                {/* Handset Status Bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium px-3 pb-3">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* SMS Sender Header */}
                <div className="text-center pb-3 border-b border-slate-800/60">
                  <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-sm flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                    {(senderId || 'RA').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1.5">
                    <span>{senderId || 'RANGESMS'}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Text Message • Today</div>
                </div>

                {/* Message Bubble Simulator Area */}
                <div className="flex-1 py-4 overflow-y-auto space-y-2">
                  {isFlashSms && (
                    <div className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-bold text-center border border-amber-500/40">
                      ⚡ CLASS 0 FLASH SMS
                    </div>
                  )}

                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-100 shadow-sm leading-relaxed space-y-1">
                    {effectiveMessage ? (
                      <TemplateHighlighter
                        text={effectiveMessage}
                        resolveSampleValues={previewMode !== 'raw'}
                        variant={previewMode === 'realistic' ? 'plain' : 'badge'}
                      />
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">
                        Message preview will appear live as you type...
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 text-right pr-1 pt-1 font-sans">Now</div>
                </div>

                {/* Handset Footer Stats & Indicator */}
                <div className="pt-3 border-t border-slate-800/50 text-center space-y-2">
                  <div className="text-xs text-slate-400 font-mono flex items-center justify-between px-2">
                    <span>{charCount} chars</span>
                    <span>{segments} {segments === 1 ? 'segment' : 'segments'}</span>
                    <span className="text-amber-400 font-bold font-mono">{cost} UGX</span>
                  </div>
                  {/* Home Bar Indicator */}
                  <div className="h-1 w-28 bg-slate-600/40 rounded-full mx-auto mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card className="border-border/80">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Account Capacity &amp; Routes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Wallet Balance</span>
                <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                  45,000 UGX
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Estimated SMS Capacity</span>
                <span className="font-semibold text-sm">
                  {Math.floor(45000 / ratePerSms).toLocaleString()} SMS
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Active Carrier Routes</span>
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
                      <NetworkBadge network="MTN" size="sm" showIcon={false} title="MTN Direct Route" />
                      <NetworkBadge network="Airtel" size="sm" showIcon={false} title="Airtel Direct Route" />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message Preview Modal (Primarily for Mobile / Tablet Viewports) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-5 pb-2">
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              Handset Display Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Simulated preview of how your message renders on a recipient smartphone with sample variable values.
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
                    previewMode === 'sample' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                  )}
                >
                  Sample Data
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('realistic')}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer',
                    previewMode === 'realistic' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                  )}
                >
                  Realistic SMS
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('raw')}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer',
                    previewMode === 'raw' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                  )}
                >
                  Raw Tags
                </button>
              </div>
            </div>

            {/* Handset Message Bubble */}
            <div className="p-4 bg-muted/60 dark:bg-slate-900/60 rounded-xl min-h-[120px] whitespace-pre-wrap font-sans text-sm border shadow-inner">
              <div className="text-[11px] font-mono text-muted-foreground mb-3 pb-2 border-b border-border/50 flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  FROM: {senderId}
                  {isFlashSms && <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-amber-500/20 text-amber-600">FLASH</Badge>}
                </span>
                <span className="text-[10px]">NOW</span>
              </div>
              <div className="text-foreground leading-relaxed">
                {effectiveMessage ? (
                  <TemplateHighlighter
                    text={effectiveMessage}
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
                  {renderPreviewWithSamples(effectiveMessage || '').length} chars • {segments} {segments === 1 ? 'segment' : 'segments'}
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
              disabled={!effectiveMessage}
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
          <DialogHeader className="p-4 sm:p-6 pb-2">
            <DialogTitle className="text-base sm:text-lg">Select Message Template</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose an approved template to populate into your message composer.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-4 sm:p-6 pt-2 space-y-3 max-h-[60vh] overflow-y-auto">
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
          </DialogBody>
          <DialogFooter className="p-4 sm:p-6 pt-2 border-t">
            <Button variant="outline" onClick={() => setTemplateModalOpen(false)} className="w-full sm:w-auto h-9">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dispatch Modal with Quick Presets */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-6 pb-2">
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Schedule Broadcast Dispatch
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Pick a future date and time when our automated queue will deliver this broadcast.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-4 sm:p-6 pt-2 space-y-4">
            {/* Quick Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs justify-start px-2.5 font-normal"
                  onClick={() => setPresetSchedule(1)}
                >
                  <Clock className="w-3 h-3 mr-1.5 text-primary" />
                  In 1 Hour
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs justify-start px-2.5 font-normal"
                  onClick={() => setPresetSchedule(3)}
                >
                  <Clock className="w-3 h-3 mr-1.5 text-primary" />
                  In 3 Hours
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs justify-start px-2.5 font-normal"
                  onClick={() => setPresetSchedule(undefined, 9)}
                >
                  <Clock className="w-3 h-3 mr-1.5 text-primary" />
                  Tomorrow 9:00 AM
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs justify-start px-2.5 font-normal"
                  onClick={() => setPresetSchedule(undefined, 14)}
                >
                  <Clock className="w-3 h-3 mr-1.5 text-primary" />
                  Tomorrow 2:00 PM
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="schedule-time" required>Custom Delivery Date &amp; Time</Label>
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
                className="h-10 text-xs sm:text-sm"
              />
              {scheduleError && <InputError id="schedule-time-error" message={scheduleError} />}
            </div>

            <div className="p-3 bg-muted/30 rounded-lg border text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between font-medium text-foreground">
                <span>Dispatch Summary</span>
                <span>{totalRecipients} recipient(s)</span>
              </div>
              <p className="text-[11px]">
                Credits are reserved when scheduled and deducted when delivery begins.
              </p>
            </div>
          </DialogBody>
          <DialogFooter className="p-4 sm:p-6 pt-2 border-t gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setScheduleOpen(false)} className="w-full sm:w-auto h-9">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSchedule}
              disabled={scheduling}
              className="w-full sm:w-auto h-9 bg-primary text-primary-foreground font-semibold"
            >
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

      {/* Drafts Drawer Integration */}
      <DraftsDrawer
        open={draftsDrawerOpen}
        onOpenChange={setDraftsDrawerOpen}
        activeDraftId={activeDraftId}
        isFormDirty={isDirty}
        onSelectDraft={(draft) => loadDraft(draft.id)}
        onDuplicateDraft={duplicateDraft}
        onDeleteDraft={deleteDraft}
      />

      {/* Confirmation Dialog for Clearing Form */}
      <ConfirmationDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Start Fresh Message?"
        description="Are you sure you want to clear the composer? Any unsaved edits will be discarded."
        confirmLabel="Clear Message"
        cancelLabel="Keep Editing"
        variant="destructive"
        onConfirm={doClearForm}
      />

      {/* AI Grammar Check Modal */}
      <GrammarCheckModal
        isOpen={showGrammarCheck}
        onClose={() => setShowGrammarCheck(false)}
        originalText={message}
        onApply={(corrected) => {
          setMessage(corrected);
          setMessageTouched(true);
          setShowGrammarCheck(false);
          toast.success('Grammar corrections applied to message!');
        }}
      />

      {/* Variable Resolution Modal */}
      <VariableResolutionModal
        open={showVariableModal}
        onOpenChange={setShowVariableModal}
        recipients={parsedManualRecipients}
        variables={detectedVariables}
        templateMessage={effectiveMessage}
        sourceFilename={importFilename}
        onConfirm={handleConfirmVariableResolution}
      />

      {/* Target Contact Group Details Modal */}
      <GroupDetailsDialog
        open={showGroupDetailsModal}
        onOpenChange={setShowGroupDetailsModal}
        mode="dispatch"
        excludedPhones={excludedGroupPhones}
        onExcludedPhonesChange={handleExcludedPhonesChange}
        group={{
          id: selectedGroup.id,
          name: selectedGroup.name,
          contactCount: selectedGroup.count,
          count: selectedGroup.count,
        }}
      />
    </div>
  );
}

export default function SendSmsPage() {
  return (
    <Suspense fallback={<SendSmsSkeleton />}>
      <SendSmsContent />
    </Suspense>
  );
}
