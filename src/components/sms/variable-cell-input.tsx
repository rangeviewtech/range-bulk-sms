'use client';

import * as React from 'react';
import {
  Check,
  AlertCircle,
  Hash,
  DollarSign,
  Phone,
  Link as LinkIcon,
  Type,
  Copy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VariableDataType } from '@/lib/sms/custom-variables';
import { getVariablePlaceholder } from '@/lib/sms/variable-validation';
import { VariableDatePicker } from './variable-date-picker';

export interface VariableCellInputProps {
  varName: string;
  dataType: VariableDataType;
  value: string;
  onChange: (val: string) => void;
  onApplyToAll?: (val: string) => void;
  isMissing: boolean;
  hasError: boolean;
  errorMessage?: string;
  disabled?: boolean;
  id?: string;
}

export function VariableCellInput({
  varName,
  dataType,
  value,
  onChange,
  onApplyToAll,
  isMissing,
  hasError,
  errorMessage,
  disabled,
  id,
}: VariableCellInputProps) {
  // If dataType is DATE, render the dedicated date picker
  if (dataType === 'DATE') {
    return (
      <VariableDatePicker
        id={id}
        value={value}
        onChange={onChange}
        onApplyToAll={onApplyToAll}
        isMissing={isMissing}
        hasError={hasError}
        errorMessage={errorMessage}
        disabled={disabled}
        placeholder={getVariablePlaceholder(varName, dataType)}
      />
    );
  }

  const cleanVal = (value || '').trim();
  const isEmpty = cleanVal.length === 0;
  const isValid = !isEmpty && !hasError;

  // Icon for specific data types
  const renderIcon = () => {
    switch (dataType) {
      case 'CURRENCY':
        return <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'NUMBER':
        return <Hash className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'PHONE':
        return <Phone className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'URL':
        return <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'TEXT':
      default:
        return <Type className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const inputMode = dataType === 'NUMBER' ? 'numeric' : dataType === 'CURRENCY' ? 'decimal' : dataType === 'PHONE' ? 'tel' : dataType === 'URL' ? 'url' : 'text';

  return (
    <div className="space-y-1 w-full">
      <div className="relative flex items-center">
        {/* Left type icon */}
        <div className="absolute left-2.5 pointer-events-none flex items-center">
          {renderIcon()}
        </div>

        <input
          id={id}
          type="text"
          inputMode={inputMode}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getVariablePlaceholder(varName, dataType)}
          className={cn(
            'w-full h-9 pl-8 pr-16 text-xs font-sans rounded-md border shadow-xs transition-colors bg-background text-foreground',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            isEmpty && isMissing && 'border-amber-500/60 focus-visible:ring-amber-500/60 bg-amber-500/[0.03]',
            hasError && !isEmpty && 'border-destructive focus-visible:ring-destructive bg-destructive/5',
            isValid && 'border-input hover:border-primary/50'
          )}
        />

        {/* Right side indicators */}
        <div className="absolute right-2 flex items-center gap-1.5">
          {isEmpty && isMissing && (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 h-4 font-mono font-medium border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 pointer-events-none"
            >
              Missing
            </Badge>
          )}

          {hasError && !isEmpty && (
            <AlertCircle className="w-3.5 h-3.5 text-destructive pointer-events-none" />
          )}

          {isValid && (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500 pointer-events-none" />
              {onApplyToAll && (
                <button
                  type="button"
                  onClick={() => onApplyToAll(value)}
                  className="text-muted-foreground hover:text-primary p-0.5 rounded cursor-pointer transition-colors"
                  title={`Apply "${value}" to all rows`}
                  aria-label={`Apply "${value}" to all rows`}
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Inline real-time validation error */}
      {hasError && errorMessage && !isEmpty && (
        <p className="text-[10px] text-destructive leading-tight flex items-center gap-1 px-0.5">
          <AlertCircle className="w-2.5 h-2.5 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
}
