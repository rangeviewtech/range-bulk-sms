'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface VariableColorPalette {
  name: string;
  badgeClass: string;
  textClass: string;
}

export const VARIABLE_COLOR_PALETTES: VariableColorPalette[] = [
  {
    name: 'emerald',
    badgeClass:
      'text-emerald-700 bg-emerald-500/15 ring-1 ring-emerald-500/40 dark:text-emerald-300 dark:bg-emerald-500/25 dark:ring-emerald-400/50',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    name: 'purple',
    badgeClass:
      'text-purple-700 bg-purple-500/15 ring-1 ring-purple-500/40 dark:text-purple-300 dark:bg-purple-500/25 dark:ring-purple-400/50',
    textClass: 'text-purple-600 dark:text-purple-400',
  },
  {
    name: 'amber',
    badgeClass:
      'text-amber-800 bg-amber-500/20 ring-1 ring-amber-500/50 dark:text-[#FBCA07] dark:bg-[#FBCA07]/20 dark:ring-[#FBCA07]/50',
    textClass: 'text-amber-700 dark:text-[#FBCA07]',
  },
  {
    name: 'cyan',
    badgeClass:
      'text-cyan-700 bg-cyan-500/15 ring-1 ring-cyan-500/40 dark:text-cyan-300 dark:bg-cyan-500/25 dark:ring-cyan-400/50',
    textClass: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    name: 'rose',
    badgeClass:
      'text-rose-700 bg-rose-500/15 ring-1 ring-rose-500/40 dark:text-rose-300 dark:bg-rose-500/25 dark:ring-rose-400/50',
    textClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    name: 'blue',
    badgeClass:
      'text-[#04648C] bg-[#04648C]/15 ring-1 ring-[#04648C]/40 dark:text-sky-300 dark:bg-sky-500/25 dark:ring-sky-400/50',
    textClass: 'text-[#04648C] dark:text-sky-400',
  },
  {
    name: 'orange',
    badgeClass:
      'text-orange-700 bg-orange-500/15 ring-1 ring-orange-500/40 dark:text-orange-300 dark:bg-orange-500/25 dark:ring-orange-400/50',
    textClass: 'text-orange-600 dark:text-orange-400',
  },
  {
    name: 'indigo',
    badgeClass:
      'text-indigo-700 bg-indigo-500/15 ring-1 ring-indigo-500/40 dark:text-indigo-300 dark:bg-indigo-500/25 dark:ring-indigo-400/50',
    textClass: 'text-indigo-600 dark:text-indigo-400',
  },
];

const KNOWN_VARIABLE_COLOR_INDICES: Record<string, number> = {
  firstname: 0, // emerald
  name: 0,
  studentname: 0,
  parentname: 7, // indigo
  lastname: 7,
  orderid: 1, // purple
  order_id: 1,
  trackingid: 1,
  amount: 2, // amber/gold
  price: 2,
  cost: 2,
  balance: 2,
  fee: 2,
  trackingurl: 3, // cyan
  tracking_url: 3,
  link: 3,
  url: 3,
  phone: 4, // rose
  phonenumber: 4,
  mobile: 4,
  contact: 4,
  company: 6, // orange
  business: 6,
  organization: 6,
  date: 5, // blue
  time: 5,
  duedate: 5,
  due_date: 5,
  accountnumber: 5,
  account_number: 5,
  promocode: 4, // rose
  promo_code: 4,
  discount: 2,
  optouturl: 7, // indigo
  opt_out_url: 7,
};

export function getVariableColorIndex(varName: string): number {
  const normalized = varName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (KNOWN_VARIABLE_COLOR_INDICES[normalized] !== undefined) {
    return KNOWN_VARIABLE_COLOR_INDICES[normalized];
  }
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % VARIABLE_COLOR_PALETTES.length;
}

const THEME_CACHE = new Map<string, VariableColorPalette>();

export function getVariableColorTheme(varName: string): VariableColorPalette {
  const cached = THEME_CACHE.get(varName);
  if (cached) return cached;
  const index = getVariableColorIndex(varName);
  const theme = VARIABLE_COLOR_PALETTES[index];
  THEME_CACHE.set(varName, theme);
  return theme;
}

export interface VariableToken {
  start: number;
  end: number;
  key: string;
  fullMatch: string;
}

export function findVariablesInText(text: string): VariableToken[] {
  if (!text) return [];
  const regex = /\{\{([a-zA-Z0-9_\s-]+)\}\}/g;
  const tokens: VariableToken[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      start: match.index,
      end: match.index + match[0].length,
      key: match[1].trim(),
      fullMatch: match[0],
    });
  }
  return tokens;
}

function safeDefer(callback: () => void): void {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(callback);
  } else if (typeof setTimeout === 'function') {
    setTimeout(callback, 0);
  } else {
    callback();
  }
}

/**
 * Inserts a variable at the current cursor position or appends it, then places
 * the cursor right after the newly inserted variable token.
 */
export function insertVariableAtCursor(
  textarea: HTMLTextAreaElement | null,
  currentValue: string,
  variableKey: string,
  onChange: (newValue: string) => void
): void {
  const token = `{{${variableKey}}}`;
  if (!textarea) {
    const nextVal = currentValue ? `${currentValue} ${token}` : token;
    onChange(nextVal);
    return;
  }

  const start = textarea.selectionStart ?? currentValue.length;
  const end = textarea.selectionEnd ?? currentValue.length;

  const before = currentValue.slice(0, start);
  const after = currentValue.slice(end);

  // Auto-space nicely if previous character is not whitespace
  const needsLeadingSpace = before.length > 0 && !/\s$/.test(before);
  const prefix = needsLeadingSpace ? ' ' : '';
  const insertContent = `${prefix}${token}`;

  const nextVal = before + insertContent + after;
  const newCursorPos = start + insertContent.length;

  onChange(nextVal);

  safeDefer(() => {
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  });
}

export interface VariableTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  containerClassName?: string;
  onKeyDownCustom?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const VariableTextareaComponent = React.forwardRef<HTMLTextAreaElement, VariableTextareaProps>(
  (
    {
      value = '',
      onChange,
      error = false,
      className,
      containerClassName,
      rows = 4,
      placeholder,
      onScroll,
      onKeyDown,
      onKeyDownCustom,
      disabled,
      ...props
    },
    forwardedRef
  ) => {
    const innerTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const backdropRef = React.useRef<HTMLDivElement | null>(null);

    // Instant local state for 0ms typing responsiveness without waiting for parent render cycles
    const [localValue, setLocalValue] = React.useState(value);

    // Track what we last set locally so the sync effect doesn't cause a redundant re-render
    const localValueRef = React.useRef(value);

    // Sync from prop when changed externally (e.g., template selection, draft load, variable insert, clear)
    // Skip the update if the prop value matches what we already set locally to avoid a wasted render
    React.useEffect(() => {
      if (value !== localValueRef.current) {
        setLocalValue(value);
        localValueRef.current = value;
      }
    }, [value]);

    // Deferred parent update: onChange propagates at low priority so the
    // immediate localValue commit & browser paint are never blocked by the
    // heavyweight parent render tree (draftFormData, recipients parsing,
    // carrier detection, autosave effect, etc.)
    const onChangeRef = React.useRef(onChange);
    React.useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const handleTextChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nextVal = e.target.value;
        // Immediate: paint the character in the textarea + backdrop in this frame
        setLocalValue(nextVal);
        localValueRef.current = nextVal;
        // Deferred: schedule the parent state update at lower priority so the
        // browser can paint the character before the heavy SendSmsPage re-render
        React.startTransition(() => {
          onChangeRef.current(nextVal);
        });
      },
      []
    );

    // Merge refs
    React.useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(
      forwardedRef,
      () => innerTextareaRef.current
    );

    // Synchronize scrolling between textarea and backdrop
    const handleScroll = React.useCallback(
      (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (backdropRef.current) {
          backdropRef.current.scrollTop = e.currentTarget.scrollTop;
          backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
        onScroll?.(e);
      },
      [onScroll]
    );

    // Helper to apply an atomic variable edit with deferred parent notification
    const applyAtomicEdit = React.useCallback(
      (nextVal: string, cursorPos: number, textarea: HTMLTextAreaElement) => {
        setLocalValue(nextVal);
        localValueRef.current = nextVal;
        React.startTransition(() => {
          onChangeRef.current(nextVal);
        });
        safeDefer(() => {
          textarea.setSelectionRange(cursorPos, cursorPos);
        });
      },
      []
    );

    // Atomic Backspace, Delete, and Arrow Key Handling
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        onKeyDownCustom?.(e);
        onKeyDown?.(e);
        if (e.defaultPrevented) return;

        // Fast-path: Normal typing keystrokes (alphanumeric, punctuation, spaces) bypass variable token inspection
        const isSpecialKey =
          e.key === 'Backspace' ||
          e.key === 'Delete' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight';
        if (!isSpecialKey) return;

        const textarea = innerTextareaRef.current;
        if (!textarea) return;

        // If current text has no variable braces at all, skip tokenization
        if (!localValue.includes('{{')) return;

        const { selectionStart, selectionEnd } = textarea;
        const variables = findVariablesInText(localValue);

        if (variables.length === 0) return;

        // --- 1. BACKSPACE KEY ---
        if (e.key === 'Backspace') {
          if (selectionStart === selectionEnd) {
            const cursor = selectionStart;

            // 1a. Cursor is immediately after a variable: "Hello {{name}}|"
            const varImmediatelyBefore = variables.find((v) => v.end === cursor);
            if (varImmediatelyBefore) {
              e.preventDefault();
              const nextVal =
                localValue.slice(0, varImmediatelyBefore.start) + localValue.slice(varImmediatelyBefore.end);
              applyAtomicEdit(nextVal, varImmediatelyBefore.start, textarea);
              return;
            }

            // 1b. Cursor is inside a variable: "Hello {{na|me}}"
            const varInside = variables.find((v) => cursor > v.start && cursor < v.end);
            if (varInside) {
              e.preventDefault();
              const nextVal = localValue.slice(0, varInside.start) + localValue.slice(varInside.end);
              applyAtomicEdit(nextVal, varInside.start, textarea);
              return;
            }
          } else {
            // 1c. Range selection: snap to complete variable bounds if partially selected
            let start = selectionStart;
            let end = selectionEnd;

            const varAtStart = variables.find((v) => start > v.start && start < v.end);
            if (varAtStart) start = varAtStart.start;

            const varAtEnd = variables.find((v) => end > v.start && end < v.end);
            if (varAtEnd) end = varAtEnd.end;

            if (start !== selectionStart || end !== selectionEnd) {
              e.preventDefault();
              const nextVal = localValue.slice(0, start) + localValue.slice(end);
              applyAtomicEdit(nextVal, start, textarea);
              return;
            }
          }
        }

        // --- 2. FORWARD DELETE KEY ---
        if (e.key === 'Delete') {
          if (selectionStart === selectionEnd) {
            const cursor = selectionStart;

            // 2a. Cursor is immediately before a variable: "|{{name}}"
            const varImmediatelyAfter = variables.find((v) => v.start === cursor);
            if (varImmediatelyAfter) {
              e.preventDefault();
              const nextVal =
                localValue.slice(0, varImmediatelyAfter.start) + localValue.slice(varImmediatelyAfter.end);
              applyAtomicEdit(nextVal, varImmediatelyAfter.start, textarea);
              return;
            }

            // 2b. Cursor is inside a variable: "{{na|me}}"
            const varInside = variables.find((v) => cursor > v.start && cursor < v.end);
            if (varInside) {
              e.preventDefault();
              const nextVal = localValue.slice(0, varInside.start) + localValue.slice(varInside.end);
              applyAtomicEdit(nextVal, varInside.start, textarea);
              return;
            }
          } else {
            // 2c. Range selection: snap to complete variable bounds
            let start = selectionStart;
            let end = selectionEnd;

            const varAtStart = variables.find((v) => start > v.start && start < v.end);
            if (varAtStart) start = varAtStart.start;

            const varAtEnd = variables.find((v) => end > v.start && end < v.end);
            if (varAtEnd) end = varAtEnd.end;

            if (start !== selectionStart || end !== selectionEnd) {
              e.preventDefault();
              const nextVal = localValue.slice(0, start) + localValue.slice(end);
              applyAtomicEdit(nextVal, start, textarea);
              return;
            }
          }
        }

        // --- 3. ARROW LEFT NAVIGATION ---
        if (e.key === 'ArrowLeft' && !e.altKey && !e.metaKey && !e.ctrlKey) {
          const cursor = selectionStart;
          if (!e.shiftKey && selectionStart === selectionEnd) {
            // If at end boundary or inside, jump to start of variable
            const targetVar = variables.find((v) => cursor === v.end || (cursor > v.start && cursor < v.end));
            if (targetVar) {
              e.preventDefault();
              textarea.setSelectionRange(targetVar.start, targetVar.start);
              return;
            }
          } else if (e.shiftKey && selectionStart === selectionEnd) {
            // Shift + ArrowLeft at end boundary selects entire variable
            const targetVar = variables.find((v) => cursor === v.end);
            if (targetVar) {
              e.preventDefault();
              textarea.setSelectionRange(targetVar.start, targetVar.end, 'backward');
              return;
            }
          }
        }

        // --- 4. ARROW RIGHT NAVIGATION ---
        if (e.key === 'ArrowRight' && !e.altKey && !e.metaKey && !e.ctrlKey) {
          const cursor = selectionEnd;
          if (!e.shiftKey && selectionStart === selectionEnd) {
            // If at start boundary or inside, jump to end of variable
            const targetVar = variables.find((v) => cursor === v.start || (cursor > v.start && cursor < v.end));
            if (targetVar) {
              e.preventDefault();
              textarea.setSelectionRange(targetVar.end, targetVar.end);
              return;
            }
          } else if (e.shiftKey && selectionStart === selectionEnd) {
            // Shift + ArrowRight at start boundary selects entire variable
            const targetVar = variables.find((v) => cursor === v.start);
            if (targetVar) {
              e.preventDefault();
              textarea.setSelectionRange(targetVar.start, targetVar.end, 'forward');
              return;
            }
          }
        }
      },
      [localValue, onKeyDown, onKeyDownCustom, applyAtomicEdit]
    );

    // Render highlighted elements in the backdrop
    const renderedBackdrop = React.useMemo(() => {
      if (!localValue) return null;

      // Fast-path: if message has no variable tokens, render plain text in 0ms without regex splitting
      if (!localValue.includes('{{')) {
        const displayValue = localValue.endsWith('\n') ? `${localValue}\u200B` : localValue;
        return <span>{displayValue}</span>;
      }

      // Ensure trailing newline renders identically in height to textarea
      const displayValue = localValue.endsWith('\n') ? `${localValue}\u200B` : localValue;
      const parts = displayValue.split(/(\{\{[a-zA-Z0-9_\s-]+\}\})/g);

      return parts.map((part, idx) => {
        const isVariable = part.startsWith('{{') && part.endsWith('}}');
        if (isVariable) {
          const varName = part.slice(2, -2).trim();
          const theme = getVariableColorTheme(varName);

          return (
            <mark
              key={`var-${idx}`}
              className={cn(
                'font-mono font-semibold rounded-[3px] py-0 px-0 inline transition-colors select-none',
                theme.badgeClass
              )}
            >
              {part}
            </mark>
          );
        }

        return <span key={`txt-${idx}`}>{part}</span>;
      });
    }, [localValue]);

    const sharedEditorStyles: React.CSSProperties = {
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '12px',
      lineHeight: '1.6',
      letterSpacing: '0px',
      tabSize: 2,
    };

    return (
      <div
        className={cn(
          'relative w-full rounded-md border border-input bg-background shadow-xs transition-all duration-200 overflow-hidden',
          'focus-within:outline-none focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/25',
          'dark:focus-within:border-sky-400 dark:focus-within:ring-sky-400/30',
          error &&
            'border-destructive focus-within:border-destructive focus-within:ring-destructive/25',
          disabled && 'opacity-50 cursor-not-allowed bg-muted/40',
          containerClassName
        )}
      >
        {/* Synchronized Syntax Highlighting Backdrop */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 p-3 whitespace-pre-wrap break-words overflow-hidden pointer-events-none select-none text-foreground box-border"
          style={{
            ...sharedEditorStyles,
            scrollbarWidth: 'none',
          }}
        >
          {renderedBackdrop}
        </div>

        {/* Foreground Typing Textarea with immediate local value */}
        <textarea
          ref={innerTextareaRef}
          rows={rows}
          value={localValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'relative z-10 w-full min-h-[80px] p-3 whitespace-pre-wrap break-words',
            'bg-transparent text-transparent caret-foreground select-text',
            'border-0 outline-none resize-none shadow-none',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-0',
            'disabled:cursor-not-allowed cursor-text',
            className
          )}
          style={sharedEditorStyles}
          {...props}
        />
      </div>
    );
  }
);

VariableTextareaComponent.displayName = 'VariableTextarea';

export const VariableTextarea = React.memo(VariableTextareaComponent);
