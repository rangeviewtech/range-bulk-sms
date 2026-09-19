import { describe, it, expect } from 'vitest';
import { redactSensitiveData } from '../redact';

interface TestRedacted {
  password?: string;
  email?: string;
  metadata?: {
    resetToken?: string;
    normalData?: string;
  };
  apiKeys?: string[];
  accessToken?: string;
}

describe('Logger Redaction', () => {
  it('should redact sensitive keys from top-level metadata', () => {
    const data = {
      password: 'supersecret',
      email: 'test@example.com',
      metadata: {
        resetToken: '1234567890abcdef',
        normalData: 'visible'
      }
    };
    
    const redacted = redactSensitiveData(data) as TestRedacted;
    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.metadata?.resetToken).toBe('[REDACTED]');
    expect(redacted.metadata?.normalData).toBe('visible');
    expect(redacted.email).toBe('test@example.com'); // email is not strictly redacted by default in metadata but usually safe
  });

  it('should format arrays of sensitive items correctly', () => {
    const data = {
      apiKeys: ['key1', 'key2']
    };
    
    const redacted = redactSensitiveData(data) as TestRedacted;
    expect(redacted.apiKeys?.[0]).toBe('[REDACTED]');
    expect(redacted.apiKeys?.[1]).toBe('[REDACTED]');
  });
  
  it('should not mutate original object', () => {
    const data = { accessToken: '123' };
    const redacted = redactSensitiveData(data) as TestRedacted;
    
    expect(redacted.accessToken).toBe('[REDACTED]');
    expect(data.accessToken).toBe('123'); // Original is untouched
  });
});
