/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { Loader2, X, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePhoneNumber, validatePhoneCountryCode, detectCarrier } from '@/lib/sms/normalizer';
import { getRegionsByDialCode, type RegionRecord } from '@/lib/sms/country-registry';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';

export interface PhoneRecipientsInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
  containerClassName?: string;
  rows?: number;
  placeholder?: string;
  onScroll?: React.UIEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyDownCustom?: (e: React.KeyboardEvent<HTMLElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  disabled?: boolean;
  readOnly?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  'aria-describedby'?: string;
  autoFocus?: boolean;
  pendingCountryCode?: string;
  onCountryCodeInserted?: () => void;
}

export interface PhoneRecipientsInputHandle {
  focus: () => void;
  blur: () => void;
  select: () => void;
  scrollIntoView: (options?: ScrollIntoViewOptions) => void;
  insertCountryCode: (dialCode: string) => void;
  commit: () => void;
  getInputValue: () => string;
  value: string;
}

export interface RecipientToken {
  text: string;
  isDelimiter: boolean;
  isValidPhone: boolean;
  isInvalidPhone: boolean;
  isInvalidCountryCode: boolean;
  carrier?: string;
  countryName?: string;
  countryIso?: string;
}

export interface CachedBadgeMeta {
  isValid: boolean;
  isInvalidCode: boolean;
  carrier?: string;
  countryName?: string;
  countryIso?: string;
  region?: RegionRecord;
}

const BADGE_META_CACHE = new Map<string, CachedBadgeMeta>();

export function getCachedBadgeMeta(phone: string): CachedBadgeMeta {
  const cached = BADGE_META_CACHE.get(phone);
  if (cached) return cached;

  const phoneValidation = validatePhoneNumber(phone);
  const ccValidation = validatePhoneCountryCode(phone);
  const isValid = phoneValidation.isValid;
  const isInvalidCode = !isValid && !ccValidation.isValid && !ccValidation.isIncomplete;

  let countryIso: string | undefined = undefined;
  let region: RegionRecord | undefined = undefined;
  const code = phoneValidation.countryCode || ccValidation.countryCode;
  if (code) {
    const regions = getRegionsByDialCode(code);
    if (regions.length > 0) {
      region = regions[0];
      countryIso = regions[0].alpha2;
    }
  }

  const meta: CachedBadgeMeta = {
    isValid,
    isInvalidCode,
    carrier: detectCarrier(phone),
    countryName: phoneValidation.countryName || ccValidation.countryName,
    countryIso,
    region,
  };
  BADGE_META_CACHE.set(phone, meta);
  return meta;
}

/**
 * Tokenizes the raw recipients input string into tokens and delimiters,
 * validating each number token against ITU-T E.164 specifications.
 * Preserved and exported for domain validation and unit test suites.
 */
export function tokenizeRecipients(value: string): RecipientToken[] {
  if (!value) return [];

  // Split on commas, newlines, or spaces while capturing delimiters
  const rawParts = value.split(/([,\n\s]+)/);
  const result: RecipientToken[] = [];

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (!part) continue;

    if (/^[,\n\s]+$/.test(part)) {
      result.push({
        text: part,
        isDelimiter: true,
        isValidPhone: false,
        isInvalidPhone: false,
        isInvalidCountryCode: false,
      });
    } else {
      const phoneValidation = validatePhoneNumber(part);
      const ccValidation = validatePhoneCountryCode(part);

      const isValid = phoneValidation.isValid;
      const isInvalidCode = !isValid && !ccValidation.isValid && !ccValidation.isIncomplete;

      let countryIso: string | undefined = undefined;
      const code = phoneValidation.countryCode || ccValidation.countryCode;
      if (code) {
        const regions = getRegionsByDialCode(code);
        if (regions.length > 0) {
          countryIso = regions[0].alpha2;
        }
      }

      // Check if this token is currently in the middle of initial typing
      // e.g., "+" or "+256" without local number digits yet, and it is the last token without a trailing delimiter
      const isLastToken = i === rawParts.length - 1;
      const digits = part.replace(/\D/g, '');
      const isTypingPrefix = isLastToken && (part === '+' || part === ccValidation.countryCode || digits.length < 4);

      const isInvalidPhone = !isValid && !isTypingPrefix;

      result.push({
        text: part,
        isDelimiter: false,
        isValidPhone: isValid,
        isInvalidPhone,
        isInvalidCountryCode: isInvalidCode,
        carrier: isValid ? detectCarrier(part) : undefined,
        countryName: phoneValidation.countryName || ccValidation.countryName,
        countryIso,
      });
    }
  }

  return result;
}

/**
 * Interactive Tokenized Phone Recipients Input Component.
 * - Renders validated phone number badges with official country flags, green/red highlight, and delete actions.
 * - Houses an active inline input with a native browser cursor in the correct section with ZERO drift.
 * - Supports keyboard shortcuts (comma, Enter, Tab, Backspace), bulk paste, individual badge removal,
 *   click-to-edit, copy-all, clear-all, and smooth horizontal scrolling.
 * - Strictly maintains h-10 (40px) height matching Sender ID and other form controls on the same row.
 */
const PhoneRecipientsInputComponent = React.forwardRef<PhoneRecipientsInputHandle, PhoneRecipientsInputProps>(
  (
    {
      id,
      name,
      value = '',
      onChange,
      error = false,
      className,
      containerClassName,
      placeholder = 'e.g. +256700123456, +256772123456',
      onKeyDown,
      onKeyDownCustom,
      onBlur,
      onFocus,
      disabled = false,
      readOnly = false,
      isLoading = false,
      loadingMessage = 'Loading contacts from group...',
      autoFocus = false,
      ...props
    },
    forwardedRef
  ) => {
    const [inputValue, setInputValue] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [showClearConfirm, setShowClearConfirm] = React.useState(false);

    const scrollTrackRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    // Parse value into badges
    const badges = React.useMemo(() => {
      if (!value) return [];
      return value
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }, [value]);

    // Commit current text input to badges
    const commitInput = React.useCallback(
      (textToCommit?: string) => {
        const raw = (textToCommit !== undefined ? textToCommit : inputValue).trim();
        if (!raw) return;

        // Never commit a lone dial code prefix (e.g. "+", "+93", "+256") without phone number digits.
        // It must remain in the typing section so the user can continue adding the rest of the phone number digits.
        if (/^\+?\d{1,4}$/.test(raw) && (raw.startsWith('+') || raw.length <= 4)) {
          return;
        }

        // Split by commas, semicolons, or newlines in case user pasted or typed multiple
        const parts = raw
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);

        if (parts.length === 0) return;

        const next = [...badges, ...parts];
        setInputValue('');
        onChange(next.join(', '));
      },
      [badges, inputValue, onChange]
    );

    // Insert a country calling code into the active typing section with cursor at the end
    const insertCountryCode = React.useCallback(
      (dialCode: string) => {
        if (!dialCode) return;
        const code = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;

        let nextVal = code;
        const current = inputValue.trim();
        if (current) {
          if (/^\+\d{0,4}$/.test(current)) {
            nextVal = code;
          } else if (current.startsWith('0')) {
            nextVal = `${code}${current.slice(1)}`;
          } else if (current.startsWith('+')) {
            const oldCc = validatePhoneCountryCode(current);
            if (oldCc.countryCode) {
              nextVal = `${code}${current.slice(oldCc.countryCode.length)}`;
            } else {
              nextVal = `${code}${current.replace(/^\+\d{1,4}/, '')}`;
            }
          } else {
            nextVal = `${code}${current}`;
          }
        }

        setInputValue(nextVal);

        if (scrollTrackRef.current) {
          scrollTrackRef.current.scrollLeft = scrollTrackRef.current.scrollWidth;
        }

        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            const pos = nextVal.length;
            inputRef.current.setSelectionRange(pos, pos);
          }
        }, 50);
      },
      [inputValue]
    );

    // Support pendingCountryCode prop
    const { pendingCountryCode, onCountryCodeInserted } = props;
    React.useEffect(() => {
      if (pendingCountryCode) {
        insertCountryCode(pendingCountryCode);
        onCountryCodeInserted?.();
      }
    }, [pendingCountryCode, insertCountryCode, onCountryCodeInserted]);

    // Forward ref to active input or container
    React.useImperativeHandle(forwardedRef, () => ({
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        } else {
          containerRef.current?.focus();
        }
      },
      blur: () => {
        if (inputRef.current) {
          inputRef.current.blur();
        } else {
          containerRef.current?.blur();
        }
      },
      select: () => {
        inputRef.current?.select();
      },
      scrollIntoView: (options?: ScrollIntoViewOptions) => {
        containerRef.current?.scrollIntoView(options);
      },
      insertCountryCode,
      commit: () => {
        if (inputValue.trim()) {
          const raw = inputValue.trim();
          if (!(/^\+?\d{1,4}$/.test(raw) && (raw.startsWith('+') || raw.length <= 4))) {
            commitInput();
          }
        }
      },
      getInputValue: () => inputValue,
      get value() {
        return value;
      },
    }));

    // Active input country flag preview if user typed a valid country calling code
    const activeInputCountryIso = React.useMemo(() => {
      if (!inputValue || !inputValue.startsWith('+')) return undefined;
      const cc = validatePhoneCountryCode(inputValue);
      if (cc.countryCode) {
        const regions = getRegionsByDialCode(cc.countryCode);
        if (regions.length > 0) return regions[0].alpha2;
      }
      return undefined;
    }, [inputValue]);

    // Auto-scroll track to the end ONLY when badges are added or removed (not on every keystroke)
    React.useEffect(() => {
      if (scrollTrackRef.current) {
        scrollTrackRef.current.scrollLeft = scrollTrackRef.current.scrollWidth;
      }
    }, [badges.length]);

    // Remove badge at specific index
    const removeBadge = React.useCallback(
      (index: number) => {
        if (readOnly || disabled) return;
        const next = badges.filter((_, i) => i !== index);
        onChange(next.join(', '));
        inputRef.current?.focus();
      },
      [badges, disabled, onChange, readOnly]
    );

    // Click on badge to edit
    const editBadge = React.useCallback(
      (index: number) => {
        if (readOnly || disabled) return;
        const badgeToEdit = badges[index];
        const next = badges.filter((_, i) => i !== index);
        setInputValue(badgeToEdit);
        onChange(next.join(', '));
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        });
      },
      [badges, disabled, onChange, readOnly]
    );

    // Clear all recipients
    const clearAll = React.useCallback(() => {
      if (readOnly || disabled) return;
      setInputValue('');
      onChange('');
      inputRef.current?.focus();
    }, [disabled, onChange, readOnly]);

    // Copy all recipients to clipboard
    const copyAll = React.useCallback(async () => {
      const allText = badges.join(', ') + (inputValue.trim() ? (badges.length > 0 ? ', ' : '') + inputValue.trim() : '');
      if (!allText) return;
      try {
        await navigator.clipboard.writeText(allText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback if clipboard API is restricted
      }
    }, [badges, inputValue]);

    // Keyboard navigation and shortcuts
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Comma or Enter: commit current input as a badge
        if (e.key === ',' || e.key === 'Enter') {
          if (inputValue.trim()) {
            const trimmed = inputValue.trim();
            // If it is only a lone country code prefix (e.g. "+", "+93", "+256"), don't commit it as a completed contact
            if (/^\+?\d{1,4}$/.test(trimmed) && (trimmed.startsWith('+') || trimmed.length <= 4)) {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            commitInput();
            return;
          }
        }

        // Backspace on empty input: pull previous badge into input for editing
        if (e.key === 'Backspace' && inputValue === '' && badges.length > 0) {
          e.preventDefault();
          const lastBadge = badges[badges.length - 1];
          const next = badges.slice(0, -1);
          setInputValue(lastBadge);
          onChange(next.join(', '));
          return;
        }

        if (onKeyDown) {
          (onKeyDown as React.KeyboardEventHandler<HTMLInputElement>)(e);
        }
        if (onKeyDownCustom) {
          onKeyDownCustom(e);
        }
      },
      [badges, commitInput, inputValue, onChange, onKeyDown, onKeyDownCustom]
    );

    // Paste handler supporting bulk comma/newline/space separated numbers
    const handlePaste = React.useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text');
        if (text && (text.includes(',') || text.includes('\n') || text.includes(';') || text.includes(' '))) {
          e.preventDefault();
          const combined = (inputValue ? inputValue + ' ' : '') + text;
          const parts = combined
            .split(/[\n,;\s]+/)
            .map((s) => s.trim())
            .filter(Boolean);

          if (parts.length > 0) {
            const next = [...badges, ...parts];
            setInputValue('');
            onChange(next.join(', '));
          }
        }
      },
      [badges, inputValue, onChange]
    );

    // On blur: automatically commit any typed text if it's a full number so it's not lost
    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        const trimmed = inputValue.trim();
        // Do NOT commit a lone country code prefix (e.g. "+", "+93", "+256") without phone digits
        if (trimmed && !(/^\+?\d{1,4}$/.test(trimmed) && (trimmed.startsWith('+') || trimmed.length <= 4))) {
          commitInput();
        }
        if (onBlur) {
          (onBlur as React.FocusEventHandler<HTMLInputElement>)(e);
        }
      },
      [commitInput, inputValue, onBlur]
    );

    // Focus active input when clicking in the container
    const handleContainerClick = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (!readOnly && !disabled) {
          inputRef.current?.focus();
        }
      },
      [disabled, readOnly]
    );

    // Fast O(N) duplicate index set
    const duplicateIndices = React.useMemo(() => {
      const seen = new Set<string>();
      const dups = new Set<number>();
      for (let i = 0; i < badges.length; i++) {
        const b = badges[i];
        if (seen.has(b)) {
          dups.add(i);
        } else {
          seen.add(b);
        }
      }
      return dups;
    }, [badges]);

    return (
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={cn(
          'relative flex items-center h-10 w-full rounded-md border border-input bg-background shadow-xs transition-all duration-200 overflow-hidden cursor-text',
          'focus-within:outline-none focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/25',
          'dark:focus-within:border-sky-400 dark:focus-within:ring-sky-400/30',
          error && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/25',
          disabled && 'opacity-50 cursor-not-allowed bg-muted/40',
          readOnly && 'bg-muted/30 cursor-default',
          containerClassName
        )}
      >
        {/* Scrollable Badges Track and Inline Active Input */}
        <div
          ref={scrollTrackRef}
          className="flex items-center gap-1.5 w-full h-full px-2.5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {badges.map((badge, idx) => {
            const meta = getCachedBadgeMeta(badge);
            const isDuplicate = duplicateIndices.has(idx);

            return (
              <div
                key={`badge-${idx}-${badge}`}
                className={cn(
                  'group/badge shrink-0 font-mono text-xs font-semibold rounded-[4px] py-0.5 px-1.5 inline-flex items-center gap-1.5 transition-all select-none align-middle',
                  meta.isValid
                    ? 'text-emerald-700 bg-emerald-500/15 ring-1 ring-emerald-500/40 dark:text-emerald-300 dark:bg-emerald-500/25 dark:ring-emerald-400/50'
                    : isDuplicate
                    ? 'text-amber-700 bg-amber-500/15 ring-1 ring-amber-500/40 dark:text-amber-300 dark:bg-amber-500/25 dark:ring-amber-400/50'
                    : 'text-destructive bg-destructive/15 ring-1 ring-destructive/40 dark:text-red-400 dark:bg-red-500/25 dark:ring-red-500/50'
                )}
                title={`${meta.countryName || 'Unknown'} · ${meta.carrier || 'Detected'}${isDuplicate ? ' (Duplicate)' : ''}`}
              >
                {meta.countryIso && (
                  <img
                    src={`https://flagcdn.com/20x15/${meta.countryIso.toLowerCase()}.png`}
                    alt={meta.countryName || ''}
                    className="h-2.5 w-3.5 rounded-[1px] object-cover shrink-0 pointer-events-none shadow-xs border border-border/30"
                  />
                )}
                {readOnly ? (
                  <a
                    href={`tel:${badge.replace(/[\s\(\)\-]/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer hover:underline"
                    title={`Call ${badge}`}
                  >
                    {badge}
                  </a>
                ) : (
                  <span
                    onClick={() => editBadge(idx)}
                    className={cn(!disabled && 'cursor-pointer hover:underline')}
                    title="Click to edit"
                  >
                    {badge}
                  </span>
                )}
                {!readOnly && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBadge(idx);
                    }}
                    className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={`Remove recipient ${badge}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Active Inline Native Input with Accurate Cursor */}
          {!readOnly && (
            <div className="inline-flex items-center gap-1.5 min-w-[120px] flex-1 h-full">
              {activeInputCountryIso && (
                <img
                  src={`https://flagcdn.com/20x15/${activeInputCountryIso.toLowerCase()}.png`}
                  alt=""
                  className="h-2.5 w-3.5 rounded-[1px] object-cover shrink-0 pointer-events-none shadow-xs border border-border/30"
                />
              )}
              <input
                ref={inputRef}
                id={id}
                name={name}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(',')) {
                    const withoutComma = val.replace(/,/g, '').trim();
                    if (/^\+?\d{1,4}$/.test(withoutComma) && (withoutComma.startsWith('+') || withoutComma.length <= 4)) {
                      setInputValue(withoutComma);
                      return;
                    }
                    commitInput(withoutComma);
                    return;
                  }
                  setInputValue(val);
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={handleBlur}
                onFocus={onFocus ? (e) => onFocus(e) : undefined}
                disabled={disabled}
                autoFocus={autoFocus}
                placeholder={badges.length === 0 ? placeholder : 'Add recipient...'}
                className={cn(
                  'h-7 bg-transparent border-none outline-none font-mono text-xs text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none p-0 caret-foreground',
                  badges.length === 0 ? 'w-full min-w-[220px]' : 'min-w-[110px] flex-1',
                  className
                )}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                aria-describedby={props['aria-describedby']}
              />
            </div>
          )}
        </div>

        {/* Action Controls: Copy All & Clear All */}
        {!isLoading && badges.length > 0 && (
          <div className="flex items-center gap-0.5 pr-2 shrink-0 bg-background/90 backdrop-blur-xs pl-1.5 border-l border-border/40 select-none">
            <button
              type="button"
              onClick={copyAll}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer"
              title={copied ? 'Copied all recipients!' : 'Copy all recipients'}
              aria-label="Copy all recipients"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {!readOnly && !disabled && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="p-1 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted transition-colors cursor-pointer"
                title="Clear all recipients"
                aria-label="Clear all recipients"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Loading Contacts Feedback Overlay */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-20 flex items-center justify-between px-3 py-2 bg-background/95 backdrop-blur-[1px] text-xs font-medium select-none pointer-events-none"
          >
            <div className="flex items-center gap-2 text-foreground/90 min-w-0">
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              <span className="truncate font-sans font-medium text-xs text-foreground">
                {loadingMessage}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary shrink-0 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Fetching...
            </span>
          </div>
        )}

        {/* Clear All Confirmation Dialog */}
        <ConfirmationDialog
          open={showClearConfirm}
          onOpenChange={setShowClearConfirm}
          title="Clear all recipients?"
          description={`Are you sure you want to remove all ${badges.length} recipients? This action cannot be undone.`}
          confirmLabel="Clear All"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={() => {
            clearAll();
            setShowClearConfirm(false);
          }}
        />
      </div>
    );
  }
);

PhoneRecipientsInputComponent.displayName = 'PhoneRecipientsInput';

export const PhoneRecipientsInput = React.memo(PhoneRecipientsInputComponent);
