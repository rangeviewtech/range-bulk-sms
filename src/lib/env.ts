/**
 * Environment detection and environment-aware error formatting utilities.
 */

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export interface FormattedError {
  title: string;
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
  stack?: string;
  digest?: string;
  timestamp: string;
}

/**
 * Format error for presentation based on current NODE_ENV environment.
 * 
 * - In Development: Returns detailed technical diagnostic data, stack traces, and raw payloads.
 * - In Production: Returns clean, minimal, user-friendly messages without exposing system internals.
 */
export function formatErrorForEnv(
  error: unknown,
  fallbackUserMessage = 'An unexpected error occurred. Please try again.'
): FormattedError {
  const timestamp = new Date().toISOString();

  let message = fallbackUserMessage;
  let code = 'ERROR';
  let statusCode = 500;
  let details: unknown = undefined;
  let stack: string | undefined = undefined;
  let digest: string | undefined = undefined;

  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    
    if (typeof errObj.message === 'string') {
      message = errObj.message;
    }
    if (typeof errObj.code === 'string') {
      code = errObj.code;
    }
    if (typeof errObj.statusCode === 'number') {
      statusCode = errObj.statusCode;
    }
    if (errObj.details !== undefined) {
      details = errObj.details;
    }
    if (typeof errObj.stack === 'string') {
      stack = errObj.stack;
    }
    if (typeof errObj.digest === 'string') {
      digest = errObj.digest;
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  // Production Mode: Return minimal, sanitized, user-friendly payload
  if (isProd) {
    return {
      title: 'Notice',
      message: statusCode === 401 || code === 'UNAUTHORIZED' 
        ? 'Incorrect username or password.'
        : statusCode === 403 
        ? 'You do not have permission to access this resource.'
        : statusCode === 404 
        ? 'The requested resource was not found.'
        : fallbackUserMessage,
      code: statusCode < 500 ? code : 'INTERNAL_ERROR',
      timestamp,
    };
  }

  // Development Mode: Return full rich diagnostic payload
  return {
    title: `[DEV DIAGNOSTIC] ${code} (${statusCode})`,
    message: message || fallbackUserMessage,
    code,
    statusCode,
    details,
    stack,
    digest,
    timestamp,
  };
}
