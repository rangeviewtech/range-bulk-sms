import { redactSensitiveData } from './redact';
import { getRequestId } from './context';

type LogLevel = 'DEBUG' | 'INFO' | 'NOTICE' | 'WARN' | 'ERROR' | 'CRITICAL' | 'SECURITY' | 'AUDIT';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

class Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async formatAndLog(level: LogLevel, message: string, data?: any) {
    const requestId = await getRequestId();
    const redactedData = data ? redactSensitiveData(data) : undefined;
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      data: redactedData,
    };

    if (process.env.NODE_ENV !== 'production') {
      // Human-readable fallback for development
      const colors = {
        DEBUG: '\x1b[36m',
        INFO: '\x1b[32m',
        NOTICE: '\x1b[34m',
        WARN: '\x1b[33m',
        ERROR: '\x1b[31m',
        CRITICAL: '\x1b[41m',
        SECURITY: '\x1b[35m',
        AUDIT: '\x1b[45m',
      };
      const color = colors[level] || '\x1b[0m';
      console.log(`${color}[${level}]\x1b[0m [${requestId}] ${message}`, redactedData || '');
    } else {
      // Structured JSON for production
      console.log(JSON.stringify(entry));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, data?: any) { return this.formatAndLog('DEBUG', message, data); }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, data?: any) { return this.formatAndLog('INFO', message, data); }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, data?: any) { return this.formatAndLog('WARN', message, data); }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, errorOrData?: any, meta?: any) {
    if (meta !== undefined || errorOrData instanceof Error) {
      // old signature: error(message, error, meta)
      return this.formatAndLog('ERROR', message, { 
        error: errorOrData instanceof Error ? { message: errorOrData.message, stack: errorOrData.stack } : errorOrData, 
        ...meta 
      });
    }
    // new signature: error(message, data)
    return this.formatAndLog('ERROR', message, errorOrData);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  security(message: string, data?: any) { return this.formatAndLog('SECURITY', message, data); }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  audit(message: string, data?: any) { return this.formatAndLog('AUDIT', message, data); }
}

export const logger = new Logger();

