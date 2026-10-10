import { describe, expect, it } from 'vitest';
import { rollupMessageStatus } from '@/lib/sms/reconcile-message-status';

describe('rollupMessageStatus', () => {
  it('reports partial when final recipients have mixed delivery outcomes', () => {
    expect(rollupMessageStatus(['DELIVERED', 'FAILED'])).toBe('PARTIAL');
  });

  it('reports delivered when every recipient was delivered', () => {
    expect(rollupMessageStatus(['DELIVERED', 'DELIVERED'])).toBe('DELIVERED');
  });

  it('reports failed when every final recipient failed', () => {
    expect(rollupMessageStatus(['FAILED', 'REJECTED'])).toBe('FAILED');
  });

  it('keeps campaigns in flight while recipients are queued or sent', () => {
    expect(rollupMessageStatus(['DELIVERED', 'QUEUED'])).toBe('SENT');
    expect(rollupMessageStatus(['QUEUED', 'PENDING'])).toBe('QUEUED');
  });
});
