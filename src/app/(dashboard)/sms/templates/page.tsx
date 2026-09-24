'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VariableDropdown } from '@/components/sms/variable-dropdown';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { Plus, Search, Trash2, Copy, Check, Filter, ArrowUp, ArrowDown, X, Eye, Pencil, Send, Smartphone, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useFormValidation } from '@/hooks/use-form-validation';
import { InputError } from '@/components/ui/input-error';
import { Pagination } from '@/components/ui/pagination';
import { useTableState } from '@/hooks/use-table-state';
import { cn } from '@/lib/utils';
import {
  getAllVariablesList,
} from '@/lib/sms/custom-variables';
import { TemplateHighlighter } from '@/components/sms/template-highlighter';

const templateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Template name must be at least 2 characters')
    .max(100, 'Template name cannot exceed 100 characters'),
  category: z.string().default('Transactional'),
  message: z
    .string()
    .trim()
    .min(1, 'Message body is required')
    .max(3200, 'Message body cannot exceed 3,200 characters'),
});

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  message: string;
  variables: string[];
}

const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: '1',
    name: 'Order Confirmation',
    category: 'Transactional',
    message: 'Hi {{name}}, your order #{{orderId}} has been confirmed and will be shipped soon.',
    variables: ['name', 'orderId'],
  },
  {
    id: '2',
    name: 'Weekend Promo',
    category: 'Marketing',
    message: "Don't miss out! Get 20% off all items this weekend using code {{code}}.",
    variables: ['code'],
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    category: 'Reminders',
    message: 'Hello, this is a reminder for your appointment on {{date}} at {{time}}.',
    variables: ['date', 'time'],
  },
  {
    id: '4',
    name: 'Payment Receipt Notice',
    category: 'Billing',
    message: 'Payment received: UGX {{amount}} for account {{account}}. Thank you for using Range Bulk SMS!',
    variables: ['amount', 'account'],
  },
  {
    id: '5',
    name: 'One-Time Security Passcode',
    category: 'OTP',
    message: 'Your verification code is {{otp}}. Valid for 10 minutes. Do not share this PIN with anyone.',
    variables: ['otp'],
  },
  {
    id: '6',
    name: 'Delivery Dispatched Alert',
    category: 'Transactional',
    message: 'Dear {{customer}}, package #{{trackingNumber}} is out for delivery with driver {{driverName}}.',
    variables: ['customer', 'trackingNumber', 'driverName'],
  },
  {
    id: '7',
    name: 'General Service Update',
    category: 'Others',
    message: 'Important update for {{customer}}: We are upgrading our platform on {{date}}. Contact {{support}} with any questions.',
    variables: ['customer', 'date', 'support'],
  },
];

const STANDARD_CATEGORIES = [
  'Billing',
  'Marketing',
  'OTP',
  'Others',
  'Reminders',
  'Transactional',
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Add Variable state for Create & Edit modals
    
  // View Modal State
  const [viewingTemplate, setViewingTemplate] = useState<TemplateItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Edit Modal State
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Dynamic Available Variables (System + Custom)
  
  
  // Load from API if available
  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch('/api/templates');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setTemplates(json.data);
          }
        }
      } catch {
        // Fallback to INITIAL_TEMPLATES
      }
    }
    loadTemplates();
  }, []);

  // Extract all unique categories including predefined standards
  const availableCategories = useMemo(() => {
    const set = new Set<string>(STANDARD_CATEGORIES);
    templates.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [templates]);

  // Integrated Search, Sort, Filter & Pagination
  const {
    search,
    setSearch,
    clearSearch,
    sortKey,
    sortOrder,
    toggleSort,
    setSort,
    filters,
    setFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
  } = useTableState<TemplateItem>({
    data: templates,
    searchFields: [
      'name',
      'category',
      'message',
      (t) => t.variables,
      (t) => t.variables.map((v) => `{{${v}}}`),
    ],
    initialSortKey: 'name',
    initialSortOrder: 'asc',
    initialPageSize: 6,
    filterFn: (item, currentFilters) => {
      const cat = currentFilters.category;
      if (cat && cat !== 'ALL') {
        if (item.category.toLowerCase() !== cat.toLowerCase()) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (key === 'category') {
        comp = a.category.localeCompare(b.category);
      } else if (key === 'length') {
        comp = a.message.length - b.message.length;
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  // Create Template Form State
  const {
    values: templateValues,
    errors: templateErrors,
    touched: templateTouched,
    setFieldValue: setTemplateFieldValue,
    handleBlur: handleTemplateBlur,
    validateAll: validateTemplateAll,
    reset: resetTemplateForm,
  } = useFormValidation({
    initialValues: { name: '', category: 'Transactional', message: '' },
    schema: templateFormSchema,
  });

  // Edit Template Form State
  const {
    values: editValues,
    errors: editErrors,
    touched: editTouched,
    setFieldValue: setEditFieldValue,
    handleBlur: handleEditBlur,
    validateAll: validateEditAll,
    reset: resetEditForm,
  } = useFormValidation({
    initialValues: { name: '', category: 'Transactional', message: '' },
    schema: templateFormSchema,
  });

  // Helper to extract {{var}} placeholders
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g) || [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, '').trim()))).filter(Boolean);
  };

  // Helper to compute SMS metrics
  const getSmsMetrics = (text: string) => {
    const charCount = text.length;
    const isUnicode = /[^\x00-\x7F]/.test(text);
    const maxPerSegment = isUnicode ? 70 : 160;
    const segments = charCount > 0 ? Math.ceil(charCount / maxPerSegment) : 1;
    return { charCount, isUnicode, maxPerSegment, segments };
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transactional':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 font-semibold';
      case 'marketing':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 font-semibold';
      case 'reminders':
        return 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30 font-semibold';
      case 'billing':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold';
      case 'otp':
      case 'otp & security':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-semibold';
      case 'others':
      case 'other':
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30 font-semibold';
      default:
        return 'bg-secondary text-secondary-foreground border-border font-semibold';
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, data } = validateTemplateAll();
    if (!isValid || !data) return;

    const extractedVariables = extractVariables(data.message);

    const created: TemplateItem = {
      id: String(Date.now()),
      name: data.name.trim(),
      category: data.category,
      message: data.message.trim(),
      variables: extractedVariables,
    };

    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
    } catch {
      // Fallback in-memory
    }

    setTemplates((prev) => [created, ...prev]);
    toast.success(`Template "${created.name}" created successfully!`);
    setCreateDialogOpen(false);
    resetTemplateForm();
  };

  // View Template Handler
  const handleView = (template: TemplateItem) => {
    setViewingTemplate(template);
    const initialVars: Record<string, string> = {};
    const allVars = getAllVariablesList();

    template.variables.forEach((v) => {
      const found = allVars.find((item) => item.key.toLowerCase() === v.toLowerCase());
      if (found && found.sampleValue) {
        initialVars[v] = found.sampleValue;
        return;
      }
      const lower = v.toLowerCase();
      if (lower.includes('name') || lower.includes('customer')) initialVars[v] = 'David';
      else if (lower.includes('order')) initialVars[v] = 'ORD-2026';
      else if (lower.includes('code') || lower.includes('promo')) initialVars[v] = 'SAVE20';
      else if (lower.includes('date')) initialVars[v] = 'Oct 25, 2026';
      else if (lower.includes('time')) initialVars[v] = '2:30 PM';
      else if (lower.includes('amount')) initialVars[v] = '50,000';
      else if (lower.includes('otp')) initialVars[v] = '849201';
      else if (lower.includes('account')) initialVars[v] = 'ACC-8821';
      else if (lower.includes('driver')) initialVars[v] = 'Joseph';
      else if (lower.includes('tracking')) initialVars[v] = 'TRK-98412';
      else initialVars[v] = `[${v}]`;
    });
    setVariableValues(initialVars);
    setViewModalOpen(true);
  };

  // Edit Template Handler
  const handleEdit = (template: TemplateItem) => {
    setEditingTemplate(template);
    resetEditForm({
      name: template.name,
      category: template.category,
      message: template.message,
    });
    setEditModalOpen(true);
  };

  const handleEditFromView = () => {
    if (!viewingTemplate) return;
    const target = viewingTemplate;
    setViewModalOpen(false);
    setTimeout(() => {
      handleEdit(target);
    }, 120);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    const { isValid, data } = validateEditAll();
    if (!isValid || !data) return;

    const extractedVariables = extractVariables(data.message);

    const updated: TemplateItem = {
      ...editingTemplate,
      name: data.name.trim(),
      category: data.category,
      message: data.message.trim(),
      variables: extractedVariables,
    };

    try {
      await fetch(`/api/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // Fallback in-memory
    }

    setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? updated : t)));
    toast.success(`Template "${updated.name}" updated successfully!`);
    setEditModalOpen(false);
    setEditingTemplate(null);
  };

  const handleCopy = (t: TemplateItem) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(t.message).catch(() => {});
    }
    setCopiedId(t.id);
    toast.success(`Copied "${t.name}" to clipboard`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      await fetch(`/api/templates/${deleteConfirm.id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }

    setTemplates((prev) => prev.filter((t) => t.id !== deleteConfirm.id));
    toast.success(`Template "${deleteConfirm.name}" deleted.`);
    setDeleteConfirm(null);
    setIsDeleting(false);
  };

  // Variable quick insertion helper
  const insertVariableIntoField = (
    fieldName: 'create' | 'edit',
    varName: string
  ) => {
    const targetElementId =
      fieldName === 'edit' ? 'edit-template-body' : 'create-template-body';
    const textarea = document.getElementById(targetElementId) as HTMLTextAreaElement | null;
    const currentText =
      fieldName === 'edit' ? editValues.message : templateValues.message;

    if (!textarea) {
      const appended = `${currentText} {{${varName}}}`;
      if (fieldName === 'edit') setEditFieldValue('message', appended);
      else setTemplateFieldValue('message', appended);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = currentText.substring(0, start);
    const after = currentText.substring(end);
    const insertion = `{{${varName}}}`;
    const newText = `${before}${insertion}${after}`;

    if (fieldName === 'edit') setEditFieldValue('message', newText);
    else setTemplateFieldValue('message', newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Compute live rendered preview for View Modal
  const renderedPreview = useMemo(() => {
    if (!viewingTemplate) return '';
    let text = viewingTemplate.message;
    Object.entries(variableValues).forEach(([k, v]) => {
      const regex = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g');
      text = text.replace(regex, v || `{{${k}}}`);
    });
    return text;
  }, [viewingTemplate, variableValues]);

  const previewMetrics = useMemo(
    () => getSmsMetrics(renderedPreview),
    [renderedPreview]
  );
  const editMetrics = useMemo(
    () => getSmsMetrics(editValues.message),
    [editValues.message]
  );
  const createMetrics = useMemo(
    () => getSmsMetrics(templateValues.message),
    [templateValues.message]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="SMS Templates"
        description="Manage your reusable message templates."
        action={
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-card p-3 sm:p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search templates by name, category, or content..."
              className="pl-9 pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search templates"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <Select
            value={filters.category || 'ALL'}
            onValueChange={(val) => setFilter('category', val)}
          >
            <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs" aria-label="Filter by category">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {availableCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By Select */}
          <Select
            value={sortKey || 'name'}
            onValueChange={(val) => setSort(val, sortOrder)}
          >
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs" aria-label="Sort templates by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
              <SelectItem value="length">Sort by Length</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-3 gap-1.5 shrink-0"
            onClick={() => toggleSort(sortKey || 'name')}
            title={`Sort Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            aria-label="Toggle sort order"
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-secondary dark:text-primary" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-secondary dark:text-primary" />
            )}
            <span className="text-xs uppercase font-medium">{sortOrder}</span>
          </Button>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {paginatedData.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            <p className="font-medium text-foreground">No templates found</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Try a different search query or create a new reusable template.
            </p>
            <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Template
            </Button>
          </div>
        ) : (
          paginatedData.map((template) => {
            const metrics = getSmsMetrics(template.message);
            return (
              <Card
                key={template.id}
                className="flex flex-col h-full hover:shadow-md transition-shadow border-border/80 bg-card group"
              >
                <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                  {/* Card Header with Category & Quick Actions */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground truncate" title={template.name}>
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`font-medium text-[11px] px-2 py-0.5 ${getCategoryBadgeClass(template.category)}`}
                        >
                          {template.category}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {metrics.charCount} chars • {metrics.segments} {metrics.segments === 1 ? 'part' : 'parts'}
                        </span>
                      </div>
                    </div>

                    {/* Top Quick Actions (Delete) */}
                    <div className="shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg"
                        onClick={() => handleDeleteClick(template.id, template.name)}
                        title="Delete template"
                        aria-label={`Delete ${template.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Message Preview Box */}
                  <div
                    onClick={() => handleView(template)}
                    className="p-3 bg-muted/60 dark:bg-muted/30 rounded-lg text-sm font-sans whitespace-pre-wrap flex-1 mb-4 border border-border/50 text-foreground cursor-pointer hover:border-primary/40 transition-colors"
                    title="Click to view full preview"
                  >
                    <TemplateHighlighter text={template.message} />
                  </div>

                  {/* Card Footer with Action Buttons */}
                  <div className="mt-auto pt-3 border-t border-border flex items-center gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs font-medium gap-1.5 flex-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      onClick={() => handleView(template)}
                      aria-label={`View details of ${template.name}`}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs font-medium gap-1.5 flex-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      onClick={() => handleEdit(template)}
                      aria-label={`Edit ${template.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant={copiedId === template.id ? 'success' : 'outline'}
                      size="sm"
                      className={cn(
                        'h-9 text-xs font-medium gap-1.5 flex-1 shrink-0 transition-all duration-150',
                        copiedId === template.id
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white border-emerald-600 hover:border-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white dark:hover:text-white dark:border-emerald-600 shadow-sm'
                          : 'hover:bg-primary hover:text-primary-foreground hover:border-primary'
                      )}
                      onClick={() => handleCopy(template)}
                      aria-label={`Copy content of ${template.name}`}
                    >
                      {copiedId === template.id ? (
                        <>
                          <Check className="w-4 h-4 stroke-[2.5] text-white shrink-0" />
                          <span className="font-semibold text-white">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 shrink-0" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {templates.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[6, 12, 24, 48]}
          className="rounded-xl border border-border"
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW TEMPLATE & LIVE SIMULATOR MODAL                                      */}
      {/* ========================================================================= */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl p-0 overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary dark:bg-primary/15 dark:text-primary">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl">
                  {viewingTemplate?.name || 'Template Preview'}
                </DialogTitle>
                <DialogDescription>
                  Inspect structure, edit sample variables, and preview the live recipient message.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewingTemplate && (
            <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-muted/40 border text-xs">
                <Badge variant="outline" className={getCategoryBadgeClass(viewingTemplate.category)}>
                  {viewingTemplate.category}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="font-mono text-muted-foreground">
                  Template Length: <strong className="text-foreground">{viewingTemplate.message.length}</strong> chars
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="font-mono text-muted-foreground">
                  Variables: <strong className="text-foreground">{viewingTemplate.variables.length}</strong>
                </span>
              </div>

              {/* Raw Template Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Raw Template String
                  </Label>
                  <Button
                    variant={copiedRaw ? 'success' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-7 text-xs gap-1 px-2.5 transition-all duration-150',
                      copiedRaw &&
                        'bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white border-emerald-600 hover:border-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white dark:border-emerald-600 shadow-sm'
                    )}
                    onClick={() => {
                      navigator.clipboard.writeText(viewingTemplate.message);
                      setCopiedRaw(true);
                      setTimeout(() => setCopiedRaw(false), 2000);
                      toast.success('Raw template copied to clipboard');
                    }}
                  >
                    {copiedRaw ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5] text-white" />
                        <span className="font-semibold text-white">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Raw</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-3.5 rounded-xl border bg-muted/40 font-mono text-xs text-foreground select-all break-words leading-relaxed">
                  <TemplateHighlighter text={viewingTemplate.message} />
                </div>
              </div>

              {/* Dynamic Variable Inputs */}
              {viewingTemplate.variables.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-secondary dark:text-primary" />
                      Dynamic Variable Inputs
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Edit sample values to preview live output
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {viewingTemplate.variables.map((v) => (
                      <div key={v} className="space-y-1">
                        <Label htmlFor={`var-${v}`} className="text-xs font-mono text-muted-foreground">
                          {`{{${v}}}`}
                        </Label>
                        <Input
                          id={`var-${v}`}
                          size={1}
                          className="h-8 text-xs font-sans"
                          placeholder={`Value for ${v}`}
                          value={variableValues[v] || ''}
                          onChange={(e) =>
                            setVariableValues((prev) => ({ ...prev, [v]: e.target.value }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Rendered Device Preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-secondary dark:text-primary" />
                    Handset Recipient Live Preview
                  </Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {previewMetrics.charCount} chars • {previewMetrics.segments} {previewMetrics.segments === 1 ? 'part' : 'parts'} (
                    {previewMetrics.isUnicode ? 'Unicode' : 'GSM-7'})
                  </span>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30 dark:bg-slate-950/40 flex flex-col items-start">
                  <div className="max-w-[90%] p-3.5 rounded-2xl rounded-bl-xs bg-primary text-primary-foreground shadow-sm text-sm whitespace-pre-wrap leading-relaxed">
                    <TemplateHighlighter
                      text={renderedPreview || viewingTemplate.message}
                      variant="on-primary"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5 pl-1">
                    Delivered via Range Bulk SMS • Just now
                  </span>
                </div>
              </div>
            </DialogBody>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t p-4 sm:px-6 bg-muted/20">
            <Button
              type="button"
              variant={copiedPreview ? 'success' : 'outline'}
              onClick={() => {
                const messageToCopy = renderedPreview || viewingTemplate?.message;
                if (messageToCopy) {
                  navigator.clipboard.writeText(messageToCopy);
                  setCopiedPreview(true);
                  toast.success('Rendered SMS message copied to clipboard');
                  setTimeout(() => setCopiedPreview(false), 3000);
                }
              }}
              className={cn(
                'w-full sm:w-auto gap-2 px-4 transition-all duration-150 whitespace-nowrap',
                copiedPreview &&
                  'bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white border-emerald-600 hover:border-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white dark:border-emerald-600 shadow-sm'
              )}
            >
              {copiedPreview ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5] text-white" />
                  <span className="font-semibold text-white">Copied Preview</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Rendered Message
                </>
              )}
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              {viewingTemplate && (
                <Button asChild className="w-full sm:w-auto gap-2 px-4 font-semibold whitespace-nowrap">
                  <Link
                    href={`/sms/send?templateMessage=${encodeURIComponent(viewingTemplate.message)}`}
                  >
                    <Send className="w-4 h-4" />
                    Use in Campaign
                  </Link>
                </Button>
              )}

              <Button
                type="button"
                variant="secondary"
                onClick={handleEditFromView}
                className="w-full sm:w-auto gap-2 px-4 whitespace-nowrap"
              >
                <Pencil className="w-4 h-4" />
                Edit Template
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setViewModalOpen(false)}
                className="w-full sm:w-auto px-4 whitespace-nowrap"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* EDIT TEMPLATE MODAL                                                       */}
      {/* ========================================================================= */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl p-0 overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary dark:bg-primary/15 dark:text-primary">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle>Edit SMS Template</DialogTitle>
                <DialogDescription>
                  Modify template details, category, and insert dynamic variables.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <Label htmlFor="edit-template-name" required>Template Name</Label>
                <Input
                  id="edit-template-name"
                  placeholder="e.g. Welcome Message"
                  value={editValues.name}
                  onChange={(e) => setEditFieldValue('name', e.target.value)}
                  onBlur={() => handleEditBlur('name')}
                  error={editTouched.name && !!editErrors.name}
                  aria-describedby={editErrors.name ? 'edit-template-name-error' : undefined}
                  required
                />
                {editTouched.name && editErrors.name && (
                  <InputError id="edit-template-name-error" message={editErrors.name} />
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-template-category">Category</Label>
                <Select
                  value={editValues.category}
                  onValueChange={(val) => setEditFieldValue('category', val)}
                >
                  <SelectTrigger id="edit-template-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transactional">Transactional</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Reminders">Reminders</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="OTP">OTP &amp; Security</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-template-body" required>Message Body</Label>
                  <div className="flex items-center gap-3">
                    <VariableDropdown onSelect={(key) => insertVariableIntoField('edit', key)} />

                    <span className="text-xs text-muted-foreground font-mono">
                      {editMetrics.charCount} chars • {editMetrics.segments} part(s)
                    </span>
                  </div>
                </div>
                <Textarea
                  id="edit-template-body"
                  rows={5}
                  placeholder="e.g. Hello {{name}}, your order #{{orderId}} is on its way!"
                  value={editValues.message}
                  onChange={(e) => setEditFieldValue('message', e.target.value)}
                  onBlur={() => handleEditBlur('message')}
                  error={editTouched.message && !!editErrors.message}
                  aria-describedby={editErrors.message ? 'edit-template-body-error' : undefined}
                  required
                />
                {editTouched.message && editErrors.message && (
                  <InputError id="edit-template-body-error" message={editErrors.message} />
                )}
              </div>
            </DialogBody>

            <DialogFooter className="p-4 sm:px-6 border-t bg-muted/20 sm:items-center sm:justify-end gap-2.5">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="w-full sm:w-auto min-w-[100px] px-4">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto min-w-[130px] px-4 font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* CREATE TEMPLATE DIALOG                                                    */}
      {/* ========================================================================= */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl p-0 overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary dark:bg-primary/15 dark:text-primary">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle>Create SMS Template</DialogTitle>
                <DialogDescription>
                  Design reusable message templates with dynamic placeholders like {'{{name}}'}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateTemplate} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <Label htmlFor="create-template-name" required>Template Name</Label>
                <Input
                  id="create-template-name"
                  placeholder="e.g. Welcome Message"
                  value={templateValues.name}
                  onChange={(e) => setTemplateFieldValue('name', e.target.value)}
                  onBlur={() => handleTemplateBlur('name')}
                  error={templateTouched.name && !!templateErrors.name}
                  aria-describedby={templateErrors.name ? 'template-name-error' : undefined}
                  required
                />
                {templateTouched.name && templateErrors.name && (
                  <InputError id="template-name-error" message={templateErrors.name} />
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="create-template-category">Category</Label>
                <Select
                  value={templateValues.category}
                  onValueChange={(val) => setTemplateFieldValue('category', val)}
                >
                  <SelectTrigger id="create-template-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transactional">Transactional</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Reminders">Reminders</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="OTP">OTP &amp; Security</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="create-template-body" required>Message Body</Label>
                  <div className="flex items-center gap-3">
                    <VariableDropdown onSelect={(key) => insertVariableIntoField('create', key)} />

                    <span className="text-xs text-muted-foreground font-mono">
                      {createMetrics.charCount} chars • {createMetrics.segments} part(s)
                    </span>
                  </div>
                </div>
                <Textarea
                  id="create-template-body"
                  rows={5}
                  placeholder="e.g. Hello {{name}}, thank you for contacting us!"
                  value={templateValues.message}
                  onChange={(e) => setTemplateFieldValue('message', e.target.value)}
                  onBlur={() => handleTemplateBlur('message')}
                  error={templateTouched.message && !!templateErrors.message}
                  aria-describedby={templateErrors.message ? 'template-body-error' : undefined}
                  required
                />
                {templateTouched.message && templateErrors.message && (
                  <InputError id="template-body-error" message={templateErrors.message} />
                )}
              </div>
            </DialogBody>

            <DialogFooter className="p-4 sm:px-6 border-t bg-muted/20 sm:items-center sm:justify-end gap-2.5">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="w-full sm:w-auto min-w-[100px] px-4">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto min-w-[130px] px-4 font-semibold">
                Save Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Template Deletion */}
      <ConfirmationDialog
        open={Boolean(deleteConfirm?.open)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Template"
        description={`Are you sure you want to delete template "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Template"
        cancelLabel="Cancel"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
