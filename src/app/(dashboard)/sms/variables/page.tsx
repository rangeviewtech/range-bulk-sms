'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { InputError } from '@/components/ui/input-error';
import { useFormValidation } from '@/hooks/use-form-validation';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import isEqual from 'lodash/isEqual';
import { customVariableSchema } from '@/lib/validations/sms';
import { useTableState } from '@/hooks/use-table-state';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import {
  SmsVariable,
  VariableDataType,
  SYSTEM_VARIABLES,
  DEFAULT_CUSTOM_VARIABLES,
  MAX_CUSTOM_VARIABLES,
  getSavedCustomVariables,
  saveCustomVariables,
  renderTemplateWithVariables,
  extractVariablesFromText,
  generateVariableKeyFromLabel,
  checkVariableConflict,
} from '@/lib/sms/custom-variables';
import { TemplateHighlighter } from '@/components/sms/template-highlighter';
import {
  VariableTextarea,
  insertVariableAtCursor,
  getVariableColorTheme,
} from '@/components/sms/variable-textarea';
import {
  Braces,
  Plus,
  Search,
  Copy,
  Check,
  Pencil,
  Trash2,
  X,
  Sparkles,
  Smartphone,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function VariablesPage() {
  const [customVariables, setCustomVariables] = useState<SmsVariable[]>(DEFAULT_CUSTOM_VARIABLES);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CUSTOM' | 'SYSTEM'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<SmsVariable | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    key: string;
    label: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Interactive Live Simulator State
  const [simulatorMessage, setSimulatorMessage] = useState<string>(
    'Hello {{firstName}}, your order #{{orderId}} of {{amount}} is confirmed! Track shipment: {{trackingUrl}}'
  );
  const simTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load custom variables from localStorage on mount
  useEffect(() => {
    const saved = getSavedCustomVariables();
    setCustomVariables(saved);

    // Also attempt to fetch from API
    async function fetchFromApi() {
      try {
        const res = await fetch('/api/variables');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.customVariables) && data.customVariables.length > 0) {
            setCustomVariables(data.customVariables);
            saveCustomVariables(data.customVariables);
          }
        }
      } catch {
        // Fallback to localStorage data
      }
    }
    fetchFromApi();

    // Listen for custom variable updates from modals/other views
    const handleStorageUpdate = () => {
      setCustomVariables(getSavedCustomVariables());
    };
    window.addEventListener('range_custom_variables_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('range_custom_variables_updated', handleStorageUpdate);
    };
  }, []);

  // Update storage whenever custom variables change
  const updateCustomVariables = (updater: (prev: SmsVariable[]) => SmsVariable[]) => {
    setCustomVariables((prev) => {
      const next = updater(prev);
      const capped = next.slice(0, MAX_CUSTOM_VARIABLES);
      saveCustomVariables(capped);
      return capped;
    });
  };

  // Quota Metrics
  const customCount = customVariables.length;
  const remainingSlots = Math.max(0, MAX_CUSTOM_VARIABLES - customCount);
  const quotaPercentage = Math.min(100, Math.round((customCount / MAX_CUSTOM_VARIABLES) * 100));
  const isQuotaReached = customCount >= MAX_CUSTOM_VARIABLES;

  // All Variables list
  const combinedVariables = useMemo(() => {
    return [...SYSTEM_VARIABLES, ...customVariables];
  }, [customVariables]);

  // Tab filtered data
  const tabFilteredData = useMemo(() => {
    if (activeTab === 'CUSTOM') {
      return customVariables;
    }
    if (activeTab === 'SYSTEM') {
      return SYSTEM_VARIABLES;
    }
    return combinedVariables;
  }, [activeTab, customVariables, combinedVariables]);

  // Table State Hook for Search, Filtering & Pagination
  const {
    search,
    setSearch,
    clearSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
  } = useTableState<SmsVariable>({
    data: tabFilteredData,
    searchFields: ['key', 'label', 'description', 'sampleValue', 'dataType'],
    initialPageSize: 10,
    filterFn: (item) => {
      if (typeFilter !== 'ALL' && item.dataType !== typeFilter) {
        return false;
      }
      return true;
    },
  });

  // Form Validation for New Variable
  const {
    values: createForm,
    errors: createErrors,
    touched: createTouched,
    setFieldValue: setCreateField,
    handleBlur: handleCreateBlur,
    validateAll: validateCreateAll,
    reset: resetCreateForm,
    confirmDiscard: confirmCreateDiscard,
  } = useFormValidation({
    initialValues: {
      key: '',
      label: '',
      dataType: 'TEXT' as VariableDataType,
      sampleValue: '',
      fallbackValue: '',
      description: '',
    },
    schema: customVariableSchema,
    protectUnsavedChanges: createDialogOpen,
    id: 'create-variable',
    title: 'Unsaved changes',
    message: 'You have unsaved changes in this variable draft. If you leave now, your changes will be lost.',
  });

  const [initialEditVariable, setInitialEditVariable] = useState<SmsVariable | null>(null);
  const isEditDirty = useMemo(() => {
    if (!editDialogOpen || !editingVariable || !initialEditVariable) return false;
    return !isEqual(editingVariable, initialEditVariable);
  }, [editDialogOpen, editingVariable, initialEditVariable]);

  const { confirmDiscard: confirmEditDiscard } = useUnsavedChanges({
    id: 'edit-variable',
    isDirty: isEditDirty,
    title: 'Unsaved changes',
    message: 'You have unsaved changes in this variable. If you leave now, your changes will be lost.',
    onDiscard: () => {
      setEditDialogOpen(false);
      setEditingVariable(null);
      setInitialEditVariable(null);
    },
  });

  // Real-time duplicate & conflict detection for Create Variable form
  const createConflict = useMemo(() => {
    if (!createForm.label.trim() && !createForm.key.trim()) return { isDuplicate: false };
    return checkVariableConflict(createForm.label, createForm.key, combinedVariables);
  }, [createForm.label, createForm.key, combinedVariables]);

  // Real-time duplicate & conflict detection for Edit Variable form
  const editConflict = useMemo(() => {
    if (!editingVariable || !editingVariable.label.trim()) return { isDuplicate: false };
    return checkVariableConflict(
      editingVariable.label,
      editingVariable.key,
      combinedVariables,
      editingVariable.id
    );
  }, [editingVariable, combinedVariables]);

  // Handle Copy Tag to Clipboard
  const handleCopyTag = (key: string) => {
    const tag = `{{${key}}}`;
    navigator.clipboard.writeText(tag);
    setCopiedKey(key);
    toast.success(`Copied "${tag}" to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    if (isQuotaReached) {
      toast.error(
        `Custom variable quota reached (${MAX_CUSTOM_VARIABLES}/${MAX_CUSTOM_VARIABLES}). Delete an existing variable to create a new one.`
      );
      return;
    }
    resetCreateForm();
    setCreateDialogOpen(true);
  };

  // Handle Save New Custom Variable
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuotaReached) {
      toast.error(`Cannot exceed ${MAX_CUSTOM_VARIABLES} custom variables.`);
      return;
    }

    if (!validateCreateAll()) return;

    // Check duplicate label or key across all variables (system + custom)
    const conflict = checkVariableConflict(createForm.label, createForm.key, combinedVariables);
    if (conflict.isDuplicate) {
      toast.error(conflict.errorMessage || 'This variable already exists in the system.');
      return;
    }

    const rawKey = createForm.key.trim();
    const newVar: SmsVariable = {
      id: `custom-${Date.now()}`,
      key: rawKey,
      label: createForm.label.trim(),
      description: createForm.description.trim(),
      fallbackValue: createForm.fallbackValue.trim(),
      sampleValue: createForm.sampleValue.trim(),
      dataType: createForm.dataType,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateCustomVariables((prev) => [newVar, ...prev]);

    // Send to API in background
    fetch('/api/variables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    }).catch(() => {});

    toast.success(`Custom variable "{{${newVar.key}}}" created successfully!`);
    setCreateDialogOpen(false);
    resetCreateForm();
  };

  // Open Edit Dialog
  const handleOpenEdit = (v: SmsVariable) => {
    if (v.isSystem) return;
    setInitialEditVariable({ ...v });
    setEditingVariable({ ...v });
    setEditDialogOpen(true);
  };

  // Handle Save Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariable) return;

    if (!editingVariable.label.trim()) {
      toast.error('Label is required');
      return;
    }
    if (!editingVariable.sampleValue.trim()) {
      toast.error('Sample value is required');
      return;
    }

    // Check duplicate label or key across all variables (excluding current variable ID)
    const conflict = checkVariableConflict(
      editingVariable.label,
      editingVariable.key,
      combinedVariables,
      editingVariable.id
    );
    if (conflict.isDuplicate) {
      toast.error(conflict.errorMessage || 'This display label already exists in the system.');
      return;
    }

    updateCustomVariables((prev) =>
      prev.map((item) => (item.id === editingVariable.id ? { ...editingVariable, updatedAt: new Date().toISOString() } : item))
    );

    // Call API in background
    fetch('/api/variables', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingVariable),
    }).catch(() => {});

    toast.success(`Variable "{{${editingVariable.key}}}" updated`);
    setEditDialogOpen(false);
    setEditingVariable(null);
    setInitialEditVariable(null);
  };

  // Handle Delete Click
  const handleDeleteClick = (v: SmsVariable) => {
    if (v.isSystem) return;
    setDeleteConfirm({
      open: true,
      id: v.id,
      key: v.key,
      label: v.label,
    });
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      updateCustomVariables((prev) => prev.filter((v) => v.id !== deleteConfirm.id));
      await fetch(`/api/variables?id=${deleteConfirm.id}`, { method: 'DELETE' }).catch(() => {});
      toast.success(`Custom variable "{{${deleteConfirm.key}}}" removed.`);
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to remove custom variable');
    } finally {
      setIsDeleting(false);
    }
  };

  // Live Simulator Computed Values
  const simulatorRendered = useMemo(() => {
    return renderTemplateWithVariables(simulatorMessage, {}, combinedVariables);
  }, [simulatorMessage, combinedVariables]);

  const simulatorDetectedVars = useMemo(() => {
    return extractVariablesFromText(simulatorMessage);
  }, [simulatorMessage]);

  const simulatorCharCount = simulatorRendered.length;
  const isUnicode = /[^\u0000-\u007F]/.test(simulatorRendered);
  const segmentLimit = isUnicode ? (simulatorCharCount > 70 ? 67 : 70) : (simulatorCharCount > 160 ? 153 : 160);
  const simulatorSegments = Math.max(1, Math.ceil(simulatorCharCount / segmentLimit));

  // Badge Style Helper
  const getDataTypeBadgeClass = (type: VariableDataType) => {
    switch (type) {
      case 'TEXT':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'NUMBER':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'CURRENCY':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'DATE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'URL':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'PHONE':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="SMS Variables & Personalization"
        description="Define, customize, and manage dynamic personalization tags. Custom variables can be used in any SMS campaign or template."
        action={
          <Button
            onClick={handleOpenCreate}
            disabled={isQuotaReached}
            className="w-full sm:w-auto font-semibold gap-2 shadow-xs"
            aria-label="Add custom variable"
          >
            <Plus className="w-4 h-4" />
            New Custom Variable
          </Button>
        }
      />

      {/* Quota & Usage Overview Banner */}
      <Card className="border-border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary dark:bg-primary/15 dark:text-primary">
                  <Braces className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Custom Variable Quota
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Your account allows up to{' '}
                    <strong className="text-foreground">{MAX_CUSTOM_VARIABLES} custom variables</strong>{' '}
                    in addition to the 8 standard system variables.
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-2 space-y-1.5 max-w-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">
                    {customCount} of {MAX_CUSTOM_VARIABLES} slots used ({quotaPercentage}%)
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                      remainingSlots === 0
                        ? 'text-destructive font-bold'
                        : remainingSlots <= 3
                        ? 'text-amber-500'
                        : 'text-muted-foreground'
                    )}
                  >
                    {remainingSlots === 0
                      ? 'Quota reached'
                      : `${remainingSlots} ${remainingSlots === 1 ? 'slot' : 'slots'} remaining`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/50">
                  <div
                    className={cn(
                      'h-full transition-all duration-300 rounded-full',
                      isQuotaReached
                        ? 'bg-destructive'
                        : quotaPercentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-primary'
                    )}
                    style={{ width: `${quotaPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
              <div className="px-3.5 py-2 rounded-lg bg-muted/40 border text-left min-w-[120px]">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  System Built-in
                </div>
                <div className="text-xl font-bold text-foreground mt-0.5">
                  {SYSTEM_VARIABLES.length}
                </div>
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-muted/40 border text-left min-w-[120px]">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Custom Active
                </div>
                <div className="text-xl font-bold text-foreground mt-0.5">
                  {customCount} <span className="text-xs font-normal text-muted-foreground">/ {MAX_CUSTOM_VARIABLES}</span>
                </div>
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-muted/40 border text-left min-w-[120px]">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Total Available
                </div>
                <div className="text-xl font-bold text-foreground mt-0.5">
                  {combinedVariables.length}
                </div>
              </div>
            </div>
          </div>

          {/* Quota reached warning alert */}
          {isQuotaReached && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                You have reached your limit of <strong>{MAX_CUSTOM_VARIABLES} custom variables</strong>. To add a new variable, please edit or delete an existing one.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: Variables List & Live Simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Variables Catalog */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Tabs */}
                <div className="inline-flex p-1 bg-muted rounded-lg border border-border/70 text-xs font-medium self-start">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('ALL');
                      setPage(1);
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-md transition-colors',
                      activeTab === 'ALL'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    All ({combinedVariables.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('CUSTOM');
                      setPage(1);
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-md transition-colors',
                      activeTab === 'CUSTOM'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Custom ({customCount}/{MAX_CUSTOM_VARIABLES})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('SYSTEM');
                      setPage(1);
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-md transition-colors',
                      activeTab === 'SYSTEM'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Built-in ({SYSTEM_VARIABLES.length})
                  </button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-xs">
                      <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="NUMBER">Number</SelectItem>
                      <SelectItem value="CURRENCY">Currency</SelectItem>
                      <SelectItem value="DATE">Date</SelectItem>
                      <SelectItem value="URL">URL Link</SelectItem>
                      <SelectItem value="PHONE">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative pt-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <Input
                  id="variables-search"
                  placeholder="Search variables by name, key, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-8 h-9 text-xs sm:text-sm w-full cursor-text pointer-events-auto relative z-0"
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 z-10"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[180px]">Variable Tag</TableHead>
                      <TableHead>Label &amp; Description</TableHead>
                      <TableHead className="w-[110px]">Type</TableHead>
                      <TableHead className="w-[130px]">Sample Preview</TableHead>
                      <TableHead className="w-[110px]">Default</TableHead>
                      <TableHead className="text-right w-[110px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-44 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                            <Braces className="w-8 h-8 stroke-1 text-muted-foreground/60" />
                            <p className="text-sm font-medium">No variables found</p>
                            <p className="text-xs max-w-sm">
                              {search
                                ? `No variables match your query "${search}". Try adjusting your filters.`
                                : 'No custom variables defined yet. Click "+ New Custom Variable" to add your first one.'}
                            </p>
                            {isQuotaReached ? null : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenCreate}
                                className="mt-2 h-8 text-xs gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Variable
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((v) => {
                        const isCopied = copiedKey === v.key;
                        return (
                          <TableRow key={v.id} className="hover:bg-muted/40 transition-colors">
                            {/* Variable Tag (Clickable to copy) */}
                            <TableCell className="font-mono">
                              <button
                                type="button"
                                onClick={() => handleCopyTag(v.key)}
                                title="Click to copy tag"
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold font-mono transition-all border group cursor-pointer',
                                  isCopied
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white border-emerald-600 hover:border-emerald-700'
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 hover:text-amber-950 border-amber-500/30 dark:bg-primary/15 dark:hover:bg-primary/25 dark:text-primary dark:border-primary/30'
                                )}
                              >
                                <span>{`{{${v.key}}}`}</span>
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                ) : (
                                  <Copy className="w-3 h-3 text-amber-800/70 dark:text-primary/70 opacity-70 group-hover:opacity-100" />
                                )}
                              </button>
                            </TableCell>

                            {/* Label & Description */}
                            <TableCell>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-xs sm:text-sm text-foreground">
                                    {v.label}
                                  </span>
                                  {v.isSystem ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0 h-4 uppercase font-medium bg-muted text-muted-foreground"
                                    >
                                      Built-in
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4 uppercase font-semibold border-amber-500/30 text-amber-900 bg-amber-500/10 dark:border-primary/30 dark:text-primary dark:bg-primary/15"
                                    >
                                      Custom
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {v.description || 'No description provided'}
                                </p>
                              </div>
                            </TableCell>

                            {/* Data Type */}
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn('text-[11px] font-mono', getDataTypeBadgeClass(v.dataType))}
                              >
                                {v.dataType}
                              </Badge>
                            </TableCell>

                            {/* Sample Value */}
                            <TableCell className="font-mono text-xs text-foreground truncate max-w-[130px]">
                              {v.sampleValue}
                            </TableCell>

                            {/* Fallback */}
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[110px]">
                              {v.fallbackValue || <span className="italic text-muted-foreground/60">—</span>}
                            </TableCell>

                            {/* Action Buttons */}
                            <TableCell className="text-right">
                              {v.isSystem ? (
                                <span className="text-[11px] text-muted-foreground/60 italic pr-2">
                                  System
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleOpenEdit(v)}
                                    aria-label={`Edit ${v.label}`}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg"
                                    onClick={() => handleDeleteClick(v)}
                                    aria-label={`Delete ${v.label}`}
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

              {/* Pagination */}
              {tabFilteredData.length > 0 && (
                <div className="p-4 border-t border-border">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[5, 10, 20, 50]}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Interactive Live SMS Simulator */}
        <div className="space-y-4">
          <Card className="border-border bg-card shadow-xs sticky top-20">
            <CardHeader className="p-4 sm:p-5 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary dark:bg-primary/15 dark:text-primary">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    Live SMS Variable Simulator
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Test how your custom variables resolve in real handset dispatches.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Message Composer Box */}
              <div
                className="space-y-1 cursor-text"
                onClick={() => document.getElementById('sim-msg')?.focus()}
              >
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="sim-msg"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('sim-msg')?.focus();
                    }}
                  >
                    Compose Message Template
                  </Label>
                  <span className="text-[11px] font-mono text-muted-foreground select-none">
                    {simulatorMessage.length} chars
                  </span>
                </div>
                <VariableTextarea
                  ref={simTextareaRef}
                  id="sim-msg"
                  rows={4}
                  value={simulatorMessage}
                  onChange={setSimulatorMessage}
                  placeholder="Type an SMS with {{variableName}}..."
                />
              </div>

              {/* Variable Insertion Quick Chips */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 select-none">
                  <Sparkles className="w-3 h-3 text-secondary dark:text-primary" />
                  <span>Click to insert variable into template:</span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                  {combinedVariables.map((v) => {
                    const theme = getVariableColorTheme(v.key);
                    return (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() =>
                          insertVariableAtCursor(
                            simTextareaRef.current,
                            simulatorMessage,
                            v.key,
                            setSimulatorMessage
                          )
                        }
                        className={cn(
                          'text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer pointer-events-auto relative z-10',
                          theme.badgeClass
                        )}
                        title={`Click to insert {{${v.key}}}`}
                      >
                        + {`{{${v.key}}}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detected Variables Breakdown */}
              <div className="p-3 rounded-lg bg-muted/40 border space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">Detected Tags:</span>
                  <span className="font-semibold text-foreground">
                    {simulatorDetectedVars.length} {simulatorDetectedVars.length === 1 ? 'variable' : 'variables'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {simulatorDetectedVars.length === 0 ? (
                    <span className="text-muted-foreground/60 italic text-[11px]">
                      No variables detected in current text.
                    </span>
                  ) : (
                    simulatorDetectedVars.map((vName) => {
                      const exists = combinedVariables.some(
                        (v) => v.key.toLowerCase() === vName.toLowerCase()
                      );
                      return (
                        <Badge
                          key={vName}
                          variant="outline"
                          className={cn(
                            'text-[10px] font-mono',
                            exists
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                          )}
                        >
                          {exists ? (
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1 inline" />
                          ) : (
                            <AlertCircle className="w-2.5 h-2.5 mr-1 inline" />
                          )}
                          {`{{${vName}}}`}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Handset Recipient Live Preview */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-secondary dark:text-primary" />
                    Handset Recipient Output
                  </Label>
                  <span className="font-mono text-muted-foreground text-[11px]">
                    {simulatorCharCount} chars • {simulatorSegments} part{simulatorSegments > 1 ? 's' : ''} ({isUnicode ? 'Unicode' : 'GSM-7'})
                  </span>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30 dark:bg-slate-950/40 flex flex-col items-start">
                  <div className="max-w-[95%] p-3.5 rounded-2xl rounded-bl-xs bg-primary text-primary-foreground shadow-sm text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {simulatorMessage ? (
                      <TemplateHighlighter text={simulatorMessage} variant="on-primary" resolveSampleValues />
                    ) : (
                      <span className="italic opacity-80">Your rendered message will appear here...</span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5 pl-1">
                    Delivered via Range Bulk SMS • Just now
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CREATE CUSTOM VARIABLE MODAL                                              */}
      {/* ========================================================================= */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            confirmCreateDiscard(() => {
              setCreateDialogOpen(false);
              resetCreateForm();
            });
          } else {
            setCreateDialogOpen(true);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-xl p-0 overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary dark:bg-primary/15 dark:text-primary">
                <Braces className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle>Add Custom Variable</DialogTitle>
                <DialogDescription>
                  Create a custom personalization tag (up to {MAX_CUSTOM_VARIABLES} allowed).
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} noValidate className="flex flex-col flex-1 min-h-0">
            <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Variable Tag Preview */}
              <div className="p-3 rounded-lg bg-muted/40 border flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block">Tag Syntax Preview</span>
                  <span className="font-mono text-sm font-bold text-amber-900 dark:text-primary">
                    {createForm.key ? `{{${createForm.key}}}` : '{{variableKey}}'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {createForm.dataType}
                </Badge>
              </div>

              {/* Display Label (Entered by user, drives auto-generation) */}
              <div className="space-y-1">
                <Label htmlFor="create-var-label" required>
                  Display Label
                </Label>
                <Input
                  id="create-var-label"
                  placeholder="e.g. Purchase Order ID, Appointment Date"
                  value={createForm.label}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    setCreateField('label', newLabel);
                    const autoKey = generateVariableKeyFromLabel(newLabel);
                    setCreateField('key', autoKey);
                  }}
                  onBlur={() => handleCreateBlur('label')}
                  error={
                    (createTouched.label && !!createErrors.label) ||
                    (!!createForm.label && createConflict.isDuplicate && createConflict.duplicateField === 'label')
                  }
                  aria-describedby={
                    createConflict.isDuplicate && createConflict.duplicateField === 'label'
                      ? 'create-var-label-conflict'
                      : createErrors.label
                      ? 'create-var-label-error'
                      : undefined
                  }
                  required
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  Human-friendly label shown in variable pickers and menus.
                </p>
                {createConflict.isDuplicate && createConflict.duplicateField === 'label' && (
                  <InputError
                    id="create-var-label-conflict"
                    message={createConflict.errorMessage || 'This display label is already in use.'}
                  />
                )}
                {(!createConflict.isDuplicate || createConflict.duplicateField !== 'label') &&
                  createTouched.label &&
                  createErrors.label && (
                    <InputError id="create-var-label-error" message={createErrors.label} />
                  )}
              </div>

              {/* Variable Key (Tag Identifier) - Auto-generated, not editable by user */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="create-var-key" required>
                    Variable Key (Tag Identifier)
                  </Label>
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Auto-generated from Display Label
                  </span>
                </div>
                <Input
                  id="create-var-key"
                  placeholder="Auto-generated e.g. purchaseOrderId"
                  value={createForm.key}
                  readOnly
                  tabIndex={-1}
                  className="font-mono bg-muted/50 dark:bg-muted/30 border-dashed text-foreground/90 select-all cursor-default"
                  error={
                    (createTouched.key && !!createErrors.key) ||
                    (!!createForm.key && createConflict.isDuplicate && createConflict.duplicateField === 'key')
                  }
                  aria-describedby={
                    createConflict.isDuplicate && createConflict.duplicateField === 'key'
                      ? 'create-var-key-conflict'
                      : createErrors.key
                      ? 'create-var-key-error'
                      : undefined
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Generated in camelCase. Will be referenced in SMS templates as{' '}
                  <code className="font-mono text-foreground font-semibold">
                    {createForm.key ? `{{${createForm.key}}}` : '{{variableKey}}'}
                  </code>.
                </p>
                {createConflict.isDuplicate && createConflict.duplicateField === 'key' && (
                  <InputError
                    id="create-var-key-conflict"
                    message={createConflict.errorMessage || 'This variable key is already in use.'}
                  />
                )}
                {(!createConflict.isDuplicate || createConflict.duplicateField !== 'key') &&
                  createTouched.key &&
                  createErrors.key && (
                    <InputError id="create-var-key-error" message={createErrors.key} />
                  )}
              </div>

              {/* Data Type */}
              <div className="space-y-1">
                <Label htmlFor="create-var-type">Data Type</Label>
                <Select
                  value={createForm.dataType}
                  onValueChange={(val) => setCreateField('dataType', val as VariableDataType)}
                >
                  <SelectTrigger id="create-var-type">
                    <SelectValue placeholder="Select Data Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Text (Standard)</SelectItem>
                    <SelectItem value="NUMBER">Number / Quantity</SelectItem>
                    <SelectItem value="CURRENCY">Currency / Amount</SelectItem>
                    <SelectItem value="DATE">Calendar Date</SelectItem>
                    <SelectItem value="URL">Web Link / URL</SelectItem>
                    <SelectItem value="PHONE">Phone Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sample Value & Fallback Value Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="create-var-sample" required>
                    Sample Test Value
                  </Label>
                  <Input
                    id="create-var-sample"
                    placeholder="e.g. ORD-98231"
                    value={createForm.sampleValue}
                    onChange={(e) => setCreateField('sampleValue', e.target.value)}
                    onBlur={() => handleCreateBlur('sampleValue')}
                    error={createTouched.sampleValue && !!createErrors.sampleValue}
                    aria-describedby={createErrors.sampleValue ? 'create-var-sample-error' : undefined}
                    required
                  />
                  {createTouched.sampleValue && createErrors.sampleValue && (
                    <InputError id="create-var-sample-error" message={createErrors.sampleValue} />
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="create-var-fallback">
                    Fallback Default Value
                  </Label>
                  <Input
                    id="create-var-fallback"
                    placeholder="e.g. your purchase"
                    value={createForm.fallbackValue}
                    onChange={(e) => setCreateField('fallbackValue', e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="create-var-desc">Usage Notes / Description</Label>
                <Input
                  id="create-var-desc"
                  placeholder="e.g. Injected from customer Shopify or POS order reference"
                  value={createForm.description}
                  onChange={(e) => setCreateField('description', e.target.value)}
                />
              </div>
            </DialogBody>

            <DialogFooter className="p-4 sm:px-6 border-t bg-muted/20 sm:items-center sm:justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  confirmCreateDiscard(() => {
                    setCreateDialogOpen(false);
                    resetCreateForm();
                  });
                }}
                className="w-full sm:w-auto min-w-[100px] px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createConflict.isDuplicate}
                className="w-full sm:w-auto min-w-[130px] px-4 font-semibold"
              >
                Save Variable
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* EDIT CUSTOM VARIABLE MODAL                                                */}
      {/* ========================================================================= */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            confirmEditDiscard(() => {
              setEditDialogOpen(false);
              setEditingVariable(null);
              setInitialEditVariable(null);
            });
          } else {
            setEditDialogOpen(true);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-xl p-0 overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary dark:bg-primary/15 dark:text-primary">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle>Edit Custom Variable</DialogTitle>
                <DialogDescription>
                  Update variable properties and sample data.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {editingVariable && (
            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 min-h-0">
              <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Immutable Variable Tag */}
                <div className="p-3 rounded-lg bg-muted/40 border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block">Variable Key</span>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {`{{${editingVariable.key}}}`}
                    </span>
                  </div>
                  <Badge variant="outline" className={getDataTypeBadgeClass(editingVariable.dataType)}>
                    {editingVariable.dataType}
                  </Badge>
                </div>

                {/* Display Label */}
                <div className="space-y-1">
                  <Label htmlFor="edit-var-label" required>
                    Display Label
                  </Label>
                  <Input
                    id="edit-var-label"
                    value={editingVariable.label}
                    onChange={(e) =>
                      setEditingVariable({ ...editingVariable, label: e.target.value })
                    }
                    error={editConflict.isDuplicate}
                    aria-describedby={editConflict.isDuplicate ? 'edit-var-label-conflict' : undefined}
                    required
                  />
                  {editConflict.isDuplicate && (
                    <InputError
                      id="edit-var-label-conflict"
                      message={editConflict.errorMessage || 'This display label is already in use.'}
                    />
                  )}
                </div>

                {/* Data Type */}
                <div className="space-y-1">
                  <Label htmlFor="edit-var-type">Data Type</Label>
                  <Select
                    value={editingVariable.dataType}
                    onValueChange={(val) =>
                      setEditingVariable({ ...editingVariable, dataType: val as VariableDataType })
                    }
                  >
                    <SelectTrigger id="edit-var-type">
                      <SelectValue placeholder="Select Data Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text (Standard)</SelectItem>
                      <SelectItem value="NUMBER">Number / Quantity</SelectItem>
                      <SelectItem value="CURRENCY">Currency / Amount</SelectItem>
                      <SelectItem value="DATE">Calendar Date</SelectItem>
                      <SelectItem value="URL">Web Link / URL</SelectItem>
                      <SelectItem value="PHONE">Phone Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sample Value & Fallback Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="edit-var-sample" required>
                      Sample Test Value
                    </Label>
                    <Input
                      id="edit-var-sample"
                      value={editingVariable.sampleValue}
                      onChange={(e) =>
                        setEditingVariable({ ...editingVariable, sampleValue: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="edit-var-fallback">
                      Fallback Default Value
                    </Label>
                    <Input
                      id="edit-var-fallback"
                      value={editingVariable.fallbackValue || ''}
                      onChange={(e) =>
                        setEditingVariable({ ...editingVariable, fallbackValue: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label htmlFor="edit-var-desc">Usage Notes / Description</Label>
                  <Input
                    id="edit-var-desc"
                    value={editingVariable.description || ''}
                    onChange={(e) =>
                      setEditingVariable({ ...editingVariable, description: e.target.value })
                    }
                  />
                </div>
              </DialogBody>

              <DialogFooter className="p-4 sm:px-6 border-t bg-muted/20 sm:items-center sm:justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    confirmEditDiscard(() => {
                      setEditDialogOpen(false);
                      setEditingVariable(null);
                      setInitialEditVariable(null);
                    });
                  }}
                  className="w-full sm:w-auto min-w-[100px] px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editConflict.isDuplicate}
                  className="w-full sm:w-auto min-w-[130px] px-4 font-semibold"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Custom Variable Deletion */}
      <ConfirmationDialog
        open={Boolean(deleteConfirm?.open)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Custom Variable"
        description={`Are you sure you want to delete custom variable "{{${deleteConfirm?.key}}}" (${deleteConfirm?.label})? Any message template or draft referencing this tag will no longer substitute values for it.`}
        confirmLabel="Delete Variable"
        cancelLabel="Keep Variable"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
