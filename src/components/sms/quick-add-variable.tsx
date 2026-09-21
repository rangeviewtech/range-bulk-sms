'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Braces, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InputError } from '@/components/ui/input-error';

import {
  SmsVariable,
  VariableDataType,
  MAX_CUSTOM_VARIABLES,
  getAllVariablesList,
  getSavedCustomVariables,
  saveCustomVariables,
} from '@/lib/sms/custom-variables';
import { customVariableSchema } from '@/lib/validations/sms';
import { cn } from '@/lib/utils';

export interface QuickAddVariableProps {
  onSuccess: (newVar: SmsVariable) => void;
  onCancel: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function QuickAddVariable({
  onSuccess,
  onCancel,
  className,
  autoFocus = true,
}: QuickAddVariableProps) {
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [dataType, setDataType] = useState<VariableDataType>('TEXT');
  const [sampleValue, setSampleValue] = useState('');
  const [fallbackValue, setFallbackValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate current quota
  const currentSaved = typeof window !== 'undefined' ? getSavedCustomVariables() : [];
  const currentCount = currentSaved.length;
  const remainingSlots = Math.max(0, MAX_CUSTOM_VARIABLES - currentCount);

  // Auto-suggest label from key
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setKey(raw);

    // If label was not customized manually or is empty, suggest human-readable title
    if (!label || label === suggestLabel(key)) {
      setLabel(suggestLabel(raw));
    }

    if (errors.key) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.key;
        return next;
      });
    }
  };

  const suggestLabel = (rawKey: string): string => {
    if (!rawKey) return '';
    return rawKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  };

  const handleDataTypeChange = (val: VariableDataType) => {
    setDataType(val);
    // Provide default sample if user hasn't typed one
    if (!sampleValue) {
      switch (val) {
        case 'NUMBER':
          setSampleValue('100');
          break;
        case 'CURRENCY':
          setSampleValue('50,000 UGX');
          break;
        case 'DATE':
          setSampleValue('2026-10-15');
          break;
        case 'URL':
          setSampleValue('https://range.ug/track/123');
          break;
        case 'PHONE':
          setSampleValue('+256701234567');
          break;
        default:
          break;
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setErrors({});

    // Check quota
    if (remainingSlots <= 0) {
      toast.error(
        `Custom variable quota reached (${MAX_CUSTOM_VARIABLES}/${MAX_CUSTOM_VARIABLES}). Manage existing variables on the Variables page.`
      );
      return;
    }

    const payload = {
      key: key.trim(),
      label: label.trim(),
      dataType,
      sampleValue: sampleValue.trim(),
      fallbackValue: fallbackValue.trim(),
      description: `Created directly via Quick Variable tool`,
    };

    // Validate with zod schema
    const result = customVariableSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Check conflict with existing variables
    const allVars = getAllVariablesList();
    const isConflict = allVars.some(
      (v) => v.key.toLowerCase() === payload.key.toLowerCase()
    );
    if (isConflict) {
      setErrors((prev) => ({
        ...prev,
        key: `A variable with tag "{{${payload.key}}}" already exists.`,
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const newVar: SmsVariable = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        key: payload.key,
        label: payload.label,
        dataType: payload.dataType,
        sampleValue: payload.sampleValue,
        fallbackValue: payload.fallbackValue,
        description: payload.description,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Save to localStorage
      const updated = [newVar, ...currentSaved].slice(0, MAX_CUSTOM_VARIABLES);
      saveCustomVariables(updated);

      // 2. Persist to API in background
      fetch('/api/variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      toast.success(`Custom variable "{{${newVar.key}}}" created and ready!`);
      onSuccess(newVar);
    } catch {
      toast.error('Failed to create variable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        'p-3.5 sm:p-4 rounded-xl border border-primary/30 bg-muted/40 dark:bg-muted/20 shadow-xs space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/15 text-amber-900 dark:bg-primary/10 dark:text-primary">
            <Braces className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Add Custom Variable</h4>
            <p className="text-[11px] text-muted-foreground">
              Create a new personalization placeholder without leaving this screen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {key && (
            <span className="font-mono text-xs font-semibold text-amber-900 bg-amber-500/10 dark:text-primary dark:bg-primary/15 px-2 py-0.5 rounded border border-amber-500/30 dark:border-primary/30">
              {`{{${key}}}`}
            </span>
          )}
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close add variable panel"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div
        className="space-y-3"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(e);
          }
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Key */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="inline-var-key" className="text-xs font-semibold text-foreground" required>
                Variable Tag Identifier
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">
                {`{{key}}`}
              </span>
            </div>
            <Input
              id="inline-var-key"
              placeholder="e.g. orderId, discountCode"
              value={key}
              onChange={handleKeyChange}
              className="h-8 text-xs font-mono"
              autoFocus={autoFocus}
              error={!!errors.key}
              aria-describedby={errors.key ? 'inline-var-key-err' : undefined}
              required
            />
            {errors.key && <InputError id="inline-var-key-err" message={errors.key} />}
          </div>

          {/* Label */}
          <div className="space-y-1">
            <Label htmlFor="inline-var-label" className="text-xs font-semibold text-foreground" required>
              Display Title
            </Label>
            <Input
              id="inline-var-label"
              placeholder="e.g. Discount Code"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (errors.label) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.label;
                    return next;
                  });
                }
              }}
              className="h-8 text-xs font-sans"
              error={!!errors.label}
              aria-describedby={errors.label ? 'inline-var-label-err' : undefined}
              required
            />
            {errors.label && <InputError id="inline-var-label-err" message={errors.label} />}
          </div>

          {/* Data Type */}
          <div className="space-y-1">
            <Label htmlFor="inline-var-type" className="text-xs font-semibold text-foreground">
              Data Type
            </Label>
            <Select value={dataType} onValueChange={(v) => handleDataTypeChange(v as VariableDataType)}>
              <SelectTrigger id="inline-var-type" className="h-8 text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Text (Standard)</SelectItem>
                <SelectItem value="NUMBER">Number / Quantity</SelectItem>
                <SelectItem value="CURRENCY">Currency / Amount</SelectItem>
                <SelectItem value="DATE">Date / Calendar</SelectItem>
                <SelectItem value="URL">Web Link / URL</SelectItem>
                <SelectItem value="PHONE">Phone Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sample Value */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="inline-var-sample" className="text-xs font-semibold text-foreground" required>
                Sample Preview Value
              </Label>
              <span className="text-[10px] text-muted-foreground">
                For handset simulator
              </span>
            </div>
            <Input
              id="inline-var-sample"
              placeholder="e.g. SAVE20, 50,000 UGX, or Oct 20"
              value={sampleValue}
              onChange={(e) => {
                setSampleValue(e.target.value);
                if (errors.sampleValue) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.sampleValue;
                    return next;
                  });
                }
              }}
              className="h-8 text-xs font-sans"
              error={!!errors.sampleValue}
              aria-describedby={errors.sampleValue ? 'inline-var-sample-err' : undefined}
              required
            />
            {errors.sampleValue && <InputError id="inline-var-sample-err" message={errors.sampleValue} />}
          </div>
        </div>

        {/* Fallback Value Optional */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="inline-var-fallback" className="text-xs font-semibold text-muted-foreground">
              Fallback Value <span className="font-normal text-[11px]">(Optional)</span>
            </Label>
            <span className="text-[10px] text-muted-foreground">
              Used if recipient record is blank
            </span>
          </div>
          <Input
            id="inline-var-fallback"
            placeholder="e.g. valued customer, your order"
            value={fallbackValue}
            onChange={(e) => setFallbackValue(e.target.value)}
            className="h-8 text-xs font-sans"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>
              Quota: <strong>{currentCount}</strong> of <strong>{MAX_CUSTOM_VARIABLES}</strong> custom slots used
            </span>
            <span>•</span>
            <Link
              href="/sms/variables"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline dark:text-primary inline-flex items-center gap-0.5 font-medium"
            >
              <span>Manage all</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-8 text-xs px-3"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="h-8 text-xs px-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save &amp; Insert</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
