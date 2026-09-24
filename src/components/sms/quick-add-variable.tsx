'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Braces, Plus, Loader2, Sparkles } from 'lucide-react';
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
  generateVariableKeyFromLabel,
  checkVariableConflict,
} from '@/lib/sms/custom-variables';
import { customVariableSchema } from '@/lib/validations/sms';


export interface QuickAddVariableProps {
  isOpen: boolean;
  onSuccess: (newVar: SmsVariable) => void;
  onClose: () => void;
  autoFocus?: boolean;
}

export function QuickAddVariable({
  isOpen,
  onSuccess,
  onClose,
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

  // Auto-generate key from label and check duplicate conflict in real time
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawLabel = e.target.value;
    setLabel(rawLabel);
    const autoKey = generateVariableKeyFromLabel(rawLabel);
    setKey(autoKey);

    if (!rawLabel.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.label;
        delete next.key;
        return next;
      });
      return;
    }

    const allVars = getAllVariablesList();
    const conflict = checkVariableConflict(rawLabel, autoKey, allVars);
    if (conflict.isDuplicate) {
      if (conflict.duplicateField === 'label') {
        setErrors((prev) => ({
          ...prev,
          label: conflict.errorMessage || 'This display title already exists.',
          key: '',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          key: conflict.errorMessage || 'This variable key already exists.',
          label: '',
        }));
      }
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.label;
        delete next.key;
        return next;
      });
    }
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

    // Check conflict with existing variables (both system and custom)
    const allVars = getAllVariablesList();
    const conflict = checkVariableConflict(payload.label, payload.key, allVars);
    if (conflict.isDuplicate) {
      if (conflict.duplicateField === 'label') {
        setErrors((prev) => ({
          ...prev,
          label: conflict.errorMessage || 'A variable with this display title already exists.',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          key: conflict.errorMessage || `A variable with key "{{${payload.key}}}" already exists.`,
        }));
      }
      toast.error(conflict.errorMessage || 'This variable already exists in the system.');
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-border shadow-xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-900 dark:bg-primary/10 dark:text-primary flex-shrink-0">
                <Braces className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left space-y-1">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-base font-semibold leading-none">Add Custom Variable</DialogTitle>
                  {key && (
                    <span className="font-mono text-xs font-semibold text-amber-900 bg-amber-500/10 dark:text-primary dark:bg-primary/15 px-2 py-0.5 rounded border border-amber-500/30 dark:border-primary/30">
                      {`{{${key}}}`}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Create a new personalization placeholder without leaving this screen.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-4 sm:p-5 space-y-3"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e);
            }
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Label (Primary Input, drives auto-generation) */}
            <div className="space-y-1">
              <Label htmlFor="inline-var-label" className="text-xs font-semibold text-foreground" required>
                Display Title
              </Label>
              <Input
                id="inline-var-label"
                placeholder="e.g. Discount Code, Order Number"
                value={label}
                onChange={handleLabelChange}
                className="h-8 text-xs font-sans"
                autoFocus={autoFocus}
                error={!!errors.label}
                aria-describedby={errors.label ? 'inline-var-label-err' : undefined}
                required
              />
              {errors.label && <InputError id="inline-var-label-err" message={errors.label} />}
            </div>

            {/* Key (Auto-generated from Display Title) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="inline-var-key" className="text-xs font-semibold text-foreground" required>
                  Variable Tag Identifier
                </Label>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Auto-generated
                </span>
              </div>
              <Input
                id="inline-var-key"
                placeholder="Auto-generated e.g. discountCode"
                value={key}
                readOnly
                tabIndex={-1}
                className="h-8 text-xs font-mono bg-muted/50 dark:bg-muted/30 border-dashed text-foreground/90 select-all cursor-default"
                error={!!errors.key}
                aria-describedby={errors.key ? 'inline-var-key-err' : undefined}
              />
              {errors.key && <InputError id="inline-var-key-err" message={errors.key} />}
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
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>
                Quota: <strong>{currentCount}</strong> of <strong>{MAX_CUSTOM_VARIABLES}</strong>
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

            <DialogFooter className="gap-2 sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 text-xs px-4"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSubmitting || !!errors.label || !!errors.key || !label.trim()}
                onClick={handleSubmit}
                className="h-8 text-xs px-4 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
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
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
