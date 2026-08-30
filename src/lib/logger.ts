type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'accessToken', 'refreshToken'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redactSensitiveInfo = (data: any): any => {
  if (typeof data !== 'object' || data === null) return data;
  
  if (Array.isArray(data)) {
    return data.map(redactSensitiveInfo);
  }

  const redacted = { ...data } as Record<string, unknown>;
  for (const key of Object.keys(redacted)) {
    if (SENSITIVE_KEYS.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveInfo(redacted[key]);
    }
  }
  return redacted;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatMessage = (level: LogLevel, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const safeMeta = meta ? redactSensitiveInfo(meta) : undefined;
  
  if (process.env.NODE_ENV === 'development') {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${safeMeta ? `\n${JSON.stringify(safeMeta, null, 2)}` : ''}`;
  }
  
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...safeMeta
  });
};

export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('debug', message, meta));
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (message: string, meta?: any) => {
    console.info(formatMessage('info', message, meta));
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (message: string, meta?: any) => {
    console.warn(formatMessage('warn', message, meta));
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (message: string, error?: Error | any, meta?: any) => {
    console.error(formatMessage('error', message, { 
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      ...meta 
    }));
  }
};
