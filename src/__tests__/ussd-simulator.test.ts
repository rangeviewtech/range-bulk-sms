import { describe, it, expect } from 'vitest';
import { processUssdSession } from '@/lib/ussd/ussd-simulator';

describe('Airtel USSD Session State Machine', () => {
  it('initializes a session with root menu and CON directive upon dialing short code', () => {
    const res = processUssdSession({
      sessionId: 'test-session-1',
      msisdn: '256701234567',
      serviceCode: '*284#',
      text: '',
    });

    expect(res.action).toBe('CON');
    expect(res.message).toContain('Welcome to Range USSD Gateway (*284#)');
    expect(res.message).toContain('1. Check SMS Balance');
    expect(res.message).toContain('2. Mini Statement');
    expect(res.message).toContain('3. Telecom Rate Calculator');
  });

  it('processes option 1 (Balance) and terminates session with END', () => {
    const res = processUssdSession({
      sessionId: 'test-session-2',
      msisdn: '256701234567',
      serviceCode: '*284#',
      text: '1',
    });

    expect(res.action).toBe('END');
    expect(res.message).toContain('Your Range SMS Balance is UGX');
  });

  it('processes option 2 (Mini statement) and terminates session with END', () => {
    const res = processUssdSession({
      sessionId: 'test-session-3',
      msisdn: '256701234567',
      serviceCode: '*284#',
      text: '2',
    });

    expect(res.action).toBe('END');
    expect(res.message).toContain('Last 3 Transactions');
  });

  it('navigates to submenus with CON when selecting a node with children', () => {
    const res = processUssdSession({
      sessionId: 'test-session-4',
      msisdn: '256701234567',
      serviceCode: '*284#',
      text: '3',
    });

    expect(res.action).toBe('CON');
    expect(res.message).toContain('3. Telecom Rate Calculator');
    expect(res.message).toContain('1. Bulk SMS Tiers');
    expect(res.message).toContain('2. Bulk USSD Tiers');
    expect(res.message).toContain('3. Sender ID Setup Fee');
  });

  it('reaches leaf sub-option (3*1) and terminates session with END', () => {
    const res = processUssdSession({
      sessionId: 'test-session-5',
      msisdn: '256701234567',
      serviceCode: '*284#',
      text: '3*1',
    });

    expect(res.action).toBe('END');
    expect(res.message).toContain('Airtel Bulk SMS Rates (VAT Incl)');
    expect(res.message).toContain('Up to 200k: 30 UGX');
  });

  it('reaches leaf sub-option (3*2) for Bulk USSD rates and terminates session with END', () => {
    const res = processUssdSession({
      sessionId: 'test-session-6',
      msisdn: '256701234567',
      serviceCode: '*284#',
      text: '3*2',
    });

    expect(res.action).toBe('END');
    expect(res.message).toContain('Airtel Bulk USSD Rates (VAT Incl)');
    expect(res.message).toContain('Up to 200k: 25 UGX');
  });

  it('returns invalid selection error and terminates session when unknown choice is passed', () => {
    const res = processUssdSession({
      sessionId: 'test-session-7',
      msisdn: '256701234567',
      serviceCode: '*284#',
      text: '99',
    });

    expect(res.action).toBe('END');
    expect(res.message).toContain('Invalid selection');
  });
});
