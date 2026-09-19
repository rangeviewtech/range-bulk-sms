/**
 * Sensitive fields that must NEVER be logged or stored in audit logs.
 */
const SENSITIVE_KEYS = new Set(
  [
    'password',
    'passwordHash',
    'token',
    'refreshToken',
    'accessToken',
    'sessionToken',
    'jwt',
    'resetToken',
    'apiKey',
    'apiKeys',
    'secret',
    'mfaSecret',
    'pin',
    'screenLockPin',
    'codeHash',
    'otp',
    'authorization',
    'cookie',
    'turnstileToken',
    'html',
    'text',
    'body',
    'rawBody',
    'smtpPass',
    'smtpPassword',
    'cronSecret',
    'encryptionKey',
    'privateKey',
    'url',
    'link',
  ].map((key) => key.toLowerCase())
);

/**
 * Recursively redacts sensitive information from an object.
 * Safe to call on any type.
 */
export function redactSensitiveData(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(key.toLowerCase())) {
      if (Array.isArray(value)) {
        redacted[key] = value.map(() => '[REDACTED]');
      } else {
        redacted[key] = '[REDACTED]';
      }
    } else {
      redacted[key] = redactSensitiveData(value);
    }
  }

  return redacted;
}
