/**
 * Standardized Toast Message Catalog
 * 
 * Centralizes all user-facing notification copy to prevent leaking internal errors,
 * ensure consistent tone across the application, and simplify localization/auditing.
 */

export const toastCatalog = {
  auth: {
    loginSuccess: 'Welcome back! You have successfully signed in.',
    logoutSuccess: 'You have been signed out safely.',
    sessionExpired: 'Your session has expired. Please sign in again.',
    unauthorized: 'You do not have permission to perform this action.',
    invalidCredentials: 'The email or password you entered is incorrect.',
    screenLocked: 'Session locked due to inactivity.',
    screenUnlocked: 'Screen successfully unlocked.',
  },
  passwordReset: {
    forgotPasswordSent: 'If an account exists with this email, you will receive password reset instructions shortly.',
    passwordResetSuccess: 'Your password has been reset successfully. Please log in with your new password.',
    invalidOrExpiredLink: 'This reset link is invalid or has expired. Please request a new one.',
    linkAlreadyUsed: 'This reset link has already been used. Please request a new one.',
    passwordsDoNotMatch: 'The passwords do not match. Please verify and try again.',
    passwordTooWeak: 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.',
    rateLimitExceeded: 'Too many password reset attempts. Please wait a few minutes before trying again.',
  },
  security: {
    checkFailed: 'Security check failed. Please refresh and try again.',
    checkExpired: 'Security verification expired. Please verify again.',
    turnstileRequired: 'Please complete the security verification.',
    rateLimited: 'Too many requests. Please slow down and try again later.',
  },
  generic: {
    unexpectedError: 'An unexpected error occurred. Please try again later.',
    networkError: 'Unable to connect to the server. Please check your internet connection.',
    savedSuccessfully: 'Changes saved successfully.',
    deletedSuccessfully: 'Record deleted successfully.',
  },
} as const;

export type ToastCatalog = typeof toastCatalog;
