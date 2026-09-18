import { describe, it, expect } from 'vitest';
import {
  isSandboxRequest,
  handleDeterministicSms,
  DETERMINISTIC_TEST_NUMBERS,
} from '@/lib/sms/sandbox';
import { POST as simulateDeliveryHandler } from '@/app/api/v1/sandbox/simulate-delivery/route';
import { NextRequest } from 'next/server';

describe('Sandbox Engine & Deterministic Testing', () => {
  it('correctly identifies sandbox requests via headers, keys, or numbers', () => {
    // Via headers
    const sandboxHeaders = new Headers({ 'x-environment': 'sandbox' });
    expect(isSandboxRequest({ headers: sandboxHeaders })).toBe(true);

    const flagHeaders = new Headers({ 'x-sandbox': 'true' });
    expect(isSandboxRequest({ headers: flagHeaders })).toBe(true);

    // Via test key prefix
    expect(isSandboxRequest({ apiKey: 'rsms_test_abcdef123456' })).toBe(true);
    expect(isSandboxRequest({ apiKey: 'sms_test_9876543210' })).toBe(true);

    // Via non-routable numbers (+999...)
    expect(isSandboxRequest({ recipients: ['+999000000001'] })).toBe(true);

    // Normal production request without flags
    const prodHeaders = new Headers();
    expect(
      isSandboxRequest({
        headers: prodHeaders,
        apiKey: 'rsms_live_production_key_123',
        recipients: ['+256700123456'],
      })
    ).toBe(false);
  });

  it('handles +999000000001 with deterministic DELIVERED response', () => {
    const res = handleDeterministicSms([DETERMINISTIC_TEST_NUMBERS.DELIVERED]);
    expect(res).toBeDefined();
    expect(res?.status).toBe(201);
    expect(res?.body.success).toBe(true);
    expect(res?.body.status).toBe('DELIVERED');
    expect(res?.body.cost).toBe(0);
    expect(res?.body.sandbox).toBe(true);
  });

  it('handles +999000000002 with deterministic REJECTED response', () => {
    const res = handleDeterministicSms([DETERMINISTIC_TEST_NUMBERS.REJECTED]);
    expect(res).toBeDefined();
    expect(res?.status).toBe(201);
    expect(res?.body.status).toBe('REJECTED');
  });

  it('handles +999000000003 with deterministic UNDELIVERED response', () => {
    const res = handleDeterministicSms([DETERMINISTIC_TEST_NUMBERS.UNDELIVERED]);
    expect(res).toBeDefined();
    expect(res?.status).toBe(201);
    expect(res?.body.status).toBe('UNDELIVERED');
  });

  it('handles +999000000004 with deterministic 402 INSUFFICIENT_BALANCE Problem Details', () => {
    const res = handleDeterministicSms([DETERMINISTIC_TEST_NUMBERS.INSUFFICIENT_BALANCE]);
    expect(res).toBeDefined();
    expect(res?.status).toBe(402);
    expect(res?.body.code).toBe('insufficient_balance');
    expect(res?.body.title).toContain('Insufficient');
  });

  it('handles +999000000005 with deterministic 400 INVALID_SENDER Problem Details', () => {
    const res = handleDeterministicSms([DETERMINISTIC_TEST_NUMBERS.INVALID_SENDER], 'INVALID');
    expect(res).toBeDefined();
    expect(res?.status).toBe(400);
    expect(res?.body.code).toBe('invalid_sender');
  });

  it('handles +999000000006 with initial QUEUED status for lifecycle testing', () => {
    const res = handleDeterministicSms([DETERMINISTIC_TEST_NUMBERS.QUEUED_THEN_DELIVERED]);
    expect(res).toBeDefined();
    expect(res?.status).toBe(201);
    expect(res?.body.status).toBe('QUEUED');
  });

  it('blocks private loopback addresses in webhook simulation (SSRF guard)', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/sandbox/simulate-delivery', {
      method: 'POST',
      body: JSON.stringify({
        webhookUrl: 'http://127.0.0.1:8080/internal-admin',
        webhookSecret: 'secret_123',
        status: 'DELIVERED',
      }),
    });

    const res = await simulateDeliveryHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('internal_address_prohibited');
  });

  it('generates a simulated webhook delivery payload when no external URL is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/sandbox/simulate-delivery', {
      method: 'POST',
      body: JSON.stringify({
        status: 'DELIVERED',
        recipientPhone: '+256700999888',
      }),
    });

    const res = await simulateDeliveryHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.simulatedEvent.type).toBe('message.delivered');
    expect(body.simulatedEvent.data.recipient).toBe('+256700999888');
    expect(body.simulatedEvent.data.simulated).toBe(true);
  });
});
