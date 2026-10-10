import { describe, expect, it } from 'vitest';
import { normalizeUgandaMsisdn } from '@/lib/payments/mtn-momo';

describe('normalizeUgandaMsisdn', () => {
  it('normalizes common Ugandan mobile formats to the MTN API MSISDN form', () => {
    expect(normalizeUgandaMsisdn('0772 123 456')).toBe('256772123456');
    expect(normalizeUgandaMsisdn('+256 772 123 456')).toBe('256772123456');
    expect(normalizeUgandaMsisdn('772123456')).toBe('256772123456');
  });

  it('rejects numbers outside Uganda mobile-number format', () => {
    expect(normalizeUgandaMsisdn('020 123 4567')).toBeNull();
    expect(normalizeUgandaMsisdn('+254712345678')).toBeNull();
    expect(normalizeUgandaMsisdn('not a number')).toBeNull();
  });
});
