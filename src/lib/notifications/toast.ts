'use client';

import { toast as sonnerToast, ExternalToast } from 'sonner';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'neutral';

export interface NotifyOptions extends ExternalToast {
  /**
   * Disables deduplication window for this notification.
   * Default is false (deduplication active for 2000ms).
   */
  allowDuplicate?: boolean;
}

export interface FlashToastPayload {
  variant: ToastVariant;
  message: string;
  options?: NotifyOptions;
  timestamp: number;
}

const FLASH_STORAGE_KEY = 'range_flash_toast';
const DEDUPLICATION_WINDOW_MS = 2000;

// Internal in-memory deduplication map: message -> lastShownTimestamp
const recentToasts = new Map<string, number>();

function shouldSuppressDuplicate(key: string, allowDuplicate?: boolean): boolean {
  if (allowDuplicate) return false;
  const now = Date.now();
  const lastTime = recentToasts.get(key);
  if (lastTime && now - lastTime < DEDUPLICATION_WINDOW_MS) {
    return true;
  }
  recentToasts.set(key, now);
  
  // Prune map if larger than 100 entries
  if (recentToasts.size > 100) {
    const cutoff = now - DEDUPLICATION_WINDOW_MS;
    for (const [k, v] of recentToasts.entries()) {
      if (v < cutoff) recentToasts.delete(k);
    }
  }
  
  return false;
}

/**
 * Enterprise Toast Notification Interface (`notify`)
 * Built on Sonner with duplicate prevention, flash redirect support, and design tokens.
 */
export const notify = {
  /**
   * Green positive confirmation
   */
  success(message: string, options?: NotifyOptions): string | number | undefined {
    const key = `success:${message}`;
    if (shouldSuppressDuplicate(key, options?.allowDuplicate)) return undefined;
    return sonnerToast.success(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * Red danger/error alert with assertive screen-reader announce
   */
  error(message: string, options?: NotifyOptions): string | number | undefined {
    const key = `error:${message}`;
    if (shouldSuppressDuplicate(key, options?.allowDuplicate)) return undefined;
    return sonnerToast.error(message, {
      duration: 6000,
      ...options,
    });
  },

  /**
   * Alias for error to support security/danger naming
   */
  danger(message: string, options?: NotifyOptions): string | number | undefined {
    return this.error(message, options);
  },

  /**
   * Yellow/amber cautionary alert
   */
  warning(message: string, options?: NotifyOptions): string | number | undefined {
    const key = `warning:${message}`;
    if (shouldSuppressDuplicate(key, options?.allowDuplicate)) return undefined;
    return sonnerToast.warning(message, {
      duration: 5000,
      ...options,
    });
  },

  /**
   * Blue/primary informational message
   */
  info(message: string, options?: NotifyOptions): string | number | undefined {
    const key = `info:${message}`;
    if (shouldSuppressDuplicate(key, options?.allowDuplicate)) return undefined;
    return sonnerToast.info(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * Neutral standard message
   */
  neutral(message: string, options?: NotifyOptions): string | number | undefined {
    const key = `neutral:${message}`;
    if (shouldSuppressDuplicate(key, options?.allowDuplicate)) return undefined;
    return sonnerToast(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * Ongoing async/loading spinner toast
   */
  loading(message: string, options?: NotifyOptions): string | number {
    return sonnerToast.loading(message, options);
  },

  /**
   * Dismiss a specific toast or all active toasts
   */
  dismiss(toastId?: string | number): void {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Wraps a promise to transition from loading -> success/error
   */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    data: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: NotifyOptions
  ) {
    return sonnerToast.promise(promise, {
      ...options,
      ...data,
    });
  },

  /**
   * Persists a toast across route transitions (e.g. before redirect('/login'))
   * Automatically rendered and consumed on the destination page.
   */
  flash(variant: ToastVariant, message: string, options?: NotifyOptions): void {
    if (typeof window === 'undefined') return;
    try {
      const payload: FlashToastPayload = {
        variant,
        message,
        options,
        timestamp: Date.now(),
      };
      window.sessionStorage.setItem(FLASH_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Fallback: non-blocking if storage is restricted
    }
  },

  /**
   * Consumes and displays any pending flash toast from previous navigation
   */
  consumeFlash(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(FLASH_STORAGE_KEY);
      if (!raw) return;
      window.sessionStorage.removeItem(FLASH_STORAGE_KEY);
      
      const payload = JSON.parse(raw) as FlashToastPayload;
      // Expire flash toasts older than 30 seconds
      if (Date.now() - payload.timestamp > 30_000) return;

      switch (payload.variant) {
        case 'success':
          this.success(payload.message, payload.options);
          break;
        case 'error':
          this.error(payload.message, payload.options);
          break;
        case 'warning':
          this.warning(payload.message, payload.options);
          break;
        case 'info':
          this.info(payload.message, payload.options);
          break;
        case 'neutral':
          this.neutral(payload.message, payload.options);
          break;
        default:
          this.neutral(payload.message, payload.options);
          break;
      }
    } catch {
      // Ignore parse/storage errors
    }
  },
};

export const toast = notify;
export default notify;
