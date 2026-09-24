import { describe, it, expect } from 'vitest';
import { getPhoneCountry } from '@/components/sms/country-flag-phone';

describe('CountryFlagPhone / getPhoneCountry', () => {
  it('correctly identifies Uganda (+256) phone numbers', () => {
    const meta = getPhoneCountry('+256703100592');
    expect(meta).not.toBeNull();
    expect(meta?.iso2).toBe('ug');
    expect(meta?.name).toBe('Uganda');
    expect(meta?.callingCode).toBe('+256');
  });

  it('correctly identifies Kenya (+254) phone numbers', () => {
    const meta = getPhoneCountry('+254712345678');
    expect(meta).not.toBeNull();
    expect(meta?.iso2).toBe('ke');
    expect(meta?.name).toBe('Kenya');
    expect(meta?.callingCode).toBe('+254');
  });

  it('correctly identifies Nigeria (+234) phone numbers', () => {
    const meta = getPhoneCountry('+2348031234567');
    expect(meta).not.toBeNull();
    expect(meta?.iso2).toBe('ng');
    expect(meta?.name).toBe('Nigeria');
    expect(meta?.callingCode).toBe('+234');
  });

  it('correctly identifies UK (+44) phone numbers', () => {
    const meta = getPhoneCountry('+447911123456');
    expect(meta).not.toBeNull();
    expect(meta?.iso2).toBe('gb');
    expect(meta?.name).toBe('United Kingdom');
    expect(meta?.callingCode).toBe('+44');
  });

  it('correctly identifies US (+1) NANP phone numbers', () => {
    const meta = getPhoneCountry('+14155552671');
    expect(meta).not.toBeNull();
    expect(meta?.iso2).toBe('us');
    expect(meta?.callingCode).toBe('+1');
  });

  it('handles domestic numbers with defaultRegion', () => {
    const meta = getPhoneCountry('0703100592', 'UG');
    expect(meta).not.toBeNull();
    expect(meta?.iso2).toBe('ug');
    expect(meta?.name).toBe('Uganda');
  });

  it('returns null for blank or invalid phone numbers', () => {
    expect(getPhoneCountry('')).toBeNull();
    expect(getPhoneCountry('   ')).toBeNull();
  });

  it('uses in-memory cache for ultra-fast subsequent lookups', () => {
    const first = getPhoneCountry('+256703100592');
    const second = getPhoneCountry('+256703100592');
    expect(first).toBe(second);
  });
});
