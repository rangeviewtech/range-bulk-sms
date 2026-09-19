// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notify } from '@/lib/notifications/toast';
import { toastCatalog } from '@/lib/notifications/toast-catalog';
import { toast as sonnerToast } from 'sonner';

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn().mockReturnValue('toast-success-id'),
    error: vi.fn().mockReturnValue('toast-error-id'),
    warning: vi.fn().mockReturnValue('toast-warning-id'),
    info: vi.fn().mockReturnValue('toast-info-id'),
    loading: vi.fn().mockReturnValue('toast-loading-id'),
    dismiss: vi.fn(),
    promise: vi.fn(),
  }),
}));

describe('Centralized Toast Notification System (`notify`)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  describe('Variant APIs', () => {
    it('dispatches success notifications with appropriate defaults', () => {
      notify.success('Operation succeeded', { allowDuplicate: true });
      expect(sonnerToast.success).toHaveBeenCalledWith('Operation succeeded', {
        duration: 4000,
        allowDuplicate: true,
      });
    });

    it('dispatches error notifications with longer duration for readability', () => {
      notify.error('Something went wrong', { allowDuplicate: true });
      expect(sonnerToast.error).toHaveBeenCalledWith('Something went wrong', {
        duration: 6000,
        allowDuplicate: true,
      });
    });

    it('dispatches warning notifications', () => {
      notify.warning('Caution advised', { allowDuplicate: true });
      expect(sonnerToast.warning).toHaveBeenCalledWith('Caution advised', {
        duration: 5000,
        allowDuplicate: true,
      });
    });

    it('dispatches info notifications', () => {
      notify.info('New update available', { allowDuplicate: true });
      expect(sonnerToast.info).toHaveBeenCalledWith('New update available', {
        duration: 4000,
        allowDuplicate: true,
      });
    });

    it('dispatches loading notifications', () => {
      notify.loading('Processing request...');
      expect(sonnerToast.loading).toHaveBeenCalledWith('Processing request...', undefined);
    });

    it('dismisses active toasts', () => {
      notify.dismiss('toast-123');
      expect(sonnerToast.dismiss).toHaveBeenCalledWith('toast-123');
    });
  });

  describe('Duplicate Suppression', () => {
    it('suppresses duplicate identical toast messages triggered within the 2000ms window', () => {
      // First call should trigger
      notify.success('Repeated message');
      expect(sonnerToast.success).toHaveBeenCalledTimes(1);

      // Second immediate identical call should be suppressed
      notify.success('Repeated message');
      expect(sonnerToast.success).toHaveBeenCalledTimes(1);
    });

    it('allows duplicate toast when allowDuplicate: true is explicitly passed', () => {
      notify.error('Important error', { allowDuplicate: true });
      expect(sonnerToast.error).toHaveBeenCalledTimes(1);

      notify.error('Important error', { allowDuplicate: true });
      expect(sonnerToast.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('Flash Toast Redirect Persistence', () => {
    it('persists toast across route navigation and consumes it once', () => {
      notify.flash('success', toastCatalog.passwordReset.passwordResetSuccess);

      // Flash message is stored in sessionStorage
      expect(window.sessionStorage.getItem('range_flash_toast')).toBeTruthy();

      // Consuming flash toast triggers notification and removes it from storage
      notify.consumeFlash();
      expect(sonnerToast.success).toHaveBeenCalledWith(
        toastCatalog.passwordReset.passwordResetSuccess,
        { duration: 4000 }
      );
      expect(window.sessionStorage.getItem('range_flash_toast')).toBeNull();

      // Subsequent consumeFlash calls do nothing
      notify.consumeFlash();
      expect(sonnerToast.success).toHaveBeenCalledTimes(1);
    });
  });

  describe('Toast Catalog Structure', () => {
    it('contains valid message keys for auth and password recovery', () => {
      expect(toastCatalog.auth.loginSuccess).toBeTruthy();
      expect(toastCatalog.passwordReset.forgotPasswordSent).toBeTruthy();
      expect(toastCatalog.passwordReset.passwordResetSuccess).toBeTruthy();
      expect(toastCatalog.passwordReset.invalidOrExpiredLink).toBeTruthy();
      expect(toastCatalog.security.turnstileRequired).toBeTruthy();
      expect(toastCatalog.generic.networkError).toBeTruthy();
    });
  });
});
