import { describe, it, expect } from 'vitest';
import {
  normalizePhoneNumber,
  normalizeMany,
  isValidPhone,
  formatForDisplay,
  detectCarrier,
  extractCountryCode,
  validatePhoneCountryCode,
  validatePhoneNumber,
  sanitizeRecipientsInput,
  sanitizeSinglePhoneInput,
  handlePhoneInputKeyDown,
} from '@/lib/sms/normalizer';

describe('Phone Number Normalizer Domain', () => {
  it('correctly normalizes 10-digit Ugandan local phone numbers with leading 0', () => {
    const res = normalizePhoneNumber('0772123456');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('+256772123456');
    expect(res.countryCode).toBe('+256');
    expect(res.localNumber).toBe('772123456');
  });

  it('correctly normalizes numbers starting with 256 without plus prefix', () => {
    const res = normalizePhoneNumber('256701234567');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('+256701234567');
    expect(res.countryCode).toBe('+256');
    expect(res.localNumber).toBe('701234567');
  });

  it('preserves already fully-formatted E.164 phone numbers', () => {
    const res = normalizePhoneNumber('+256782000111');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('+256782000111');
    expect(res.countryCode).toBe('+256');
    expect(res.localNumber).toBe('782000111');
  });

  it('flags Ugandan numbers with invalid digit counts', () => {
    const shortRes = normalizePhoneNumber('07721234'); // 8 digits after prefix
    expect(shortRes.isValid).toBe(false);
    expect(shortRes.error).toContain('9 digits after country code');

    const longRes = normalizePhoneNumber('077212345678'); // 11 digits
    expect(longRes.isValid).toBe(false);
  });

  it('formats valid numbers for display cleanly', () => {
    const formatted = formatForDisplay('+256772123456');
    expect(formatted).toBe('+256 772 123 456');

    // Returns raw input if invalid
    const invalidFormatted = formatForDisplay('abc');
    expect(invalidFormatted).toBe('abc');
  });

  it('detects Ugandan network carriers accurately', () => {
    // MTN prefixes: 77, 78, 76, 39
    expect(detectCarrier('+256772123456')).toBe('MTN Uganda');
    expect(detectCarrier('0782000000')).toBe('MTN Uganda');
    expect(detectCarrier('256760000000')).toBe('MTN Uganda');
    expect(detectCarrier('+256392000000')).toBe('MTN Uganda');

    // Airtel prefixes: 70, 75, 74
    expect(detectCarrier('+256701234567')).toBe('Airtel Uganda');
    expect(detectCarrier('0752000000')).toBe('Airtel Uganda');
    expect(detectCarrier('+256740000000')).toBe('Airtel Uganda');

    // UTL prefix: 71
    expect(detectCarrier('+256712000000')).toBe('UTL');

    // Regional (Kenya Safaricom)
    expect(detectCarrier('+254712345678')).toBe('Safaricom');

    // Other/Unknown
    expect(detectCarrier('+14155552671')).toBe('Other Network');
  });

  it('normalizes arrays in batch with normalizeMany and validates with isValidPhone', () => {
    const list = normalizeMany(['0772123456', '0701987654', 'invalid']);
    expect(list).toHaveLength(3);
    expect(list[0].isValid).toBe(true);
    expect(list[1].isValid).toBe(true);
    expect(list[2].isValid).toBe(false);

    expect(isValidPhone('0772123456')).toBe(true);
    expect(isValidPhone('invalid-phone')).toBe(false);
  });

  it('extracts country code reliably adhering to ITU 1, 2, and 3 digit specifications', () => {
    // 3-digit country codes
    expect(extractCountryCode('+256772123456')).toBe('+256');
    expect(extractCountryCode('256701234567')).toBe('+256');
    expect(extractCountryCode('+254712345678')).toBe('+254'); // Kenya
    expect(extractCountryCode('+971501234567')).toBe('+971'); // UAE
    
    // 2-digit country codes
    expect(extractCountryCode('+447911123456')).toBe('+44'); // UK
    expect(extractCountryCode('+201012345678')).toBe('+20'); // Egypt
    expect(extractCountryCode('+919876543210')).toBe('+91'); // India
    
    // 1-digit country codes
    expect(extractCountryCode('+14155552671')).toBe('+1'); // USA
    expect(extractCountryCode('+79161234567')).toBe('+7'); // Russia
    
    // Invalid codes
    expect(extractCountryCode('+99912345678')).toBeNull(); // 999 unassigned
    expect(extractCountryCode('+000123456')).toBeNull(); // 0 is invalid
    expect(extractCountryCode('abc')).toBeNull();
  });

  describe('validatePhoneCountryCode - ITU-T 1, 2, and 3 Digit Validation', () => {
    it('validates 1-digit country calling codes (+1, +7)', () => {
      const us = validatePhoneCountryCode('+14155552671');
      expect(us.isValid).toBe(true);
      expect(us.countryCode).toBe('+1');
      expect(us.codeLength).toBe(1);
      expect(us.countryName).toContain('USA');

      const ru = validatePhoneCountryCode('+79161234567');
      expect(ru.isValid).toBe(true);
      expect(ru.countryCode).toBe('+7');
      expect(ru.codeLength).toBe(1);
      expect(ru.countryName).toContain('Russia');
    });

    it('validates 2-digit country calling codes (+44, +20, +91, +49, +27)', () => {
      const uk = validatePhoneCountryCode('+447911123456');
      expect(uk.isValid).toBe(true);
      expect(uk.countryCode).toBe('+44');
      expect(uk.codeLength).toBe(2);
      expect(uk.countryName).toBe('United Kingdom');

      const egypt = validatePhoneCountryCode('+201012345678');
      expect(egypt.isValid).toBe(true);
      expect(egypt.countryCode).toBe('+20');
      expect(egypt.countryName).toBe('Egypt');

      const india = validatePhoneCountryCode('+919876543210');
      expect(india.isValid).toBe(true);
      expect(india.countryCode).toBe('+91');
      expect(india.countryName).toBe('India');
    });

    it('validates 3-digit country calling codes (+256, +254, +255, +971, +250)', () => {
      const uganda = validatePhoneCountryCode('+256702950322');
      expect(uganda.isValid).toBe(true);
      expect(uganda.countryCode).toBe('+256');
      expect(uganda.codeLength).toBe(3);
      expect(uganda.countryName).toBe('Uganda');

      const kenya = validatePhoneCountryCode('+254712345678');
      expect(kenya.isValid).toBe(true);
      expect(kenya.countryCode).toBe('+254');
      expect(kenya.countryName).toBe('Kenya');

      const uae = validatePhoneCountryCode('+971501234567');
      expect(uae.isValid).toBe(true);
      expect(uae.countryCode).toBe('+971');
      expect(uae.countryName).toBe('United Arab Emirates');
    });

    it('accepts Ugandan local numbers starting with 07 or 03 as +256', () => {
      const local = validatePhoneCountryCode('0772123456');
      expect(local.isValid).toBe(true);
      expect(local.countryCode).toBe('+256');
      expect(local.countryName).toBe('Uganda');
    });

    it('flags an error if the first 3 numbers do not represent any country code (+999, +000, +888, +296)', () => {
      const invalid999 = validatePhoneCountryCode('+99912345678');
      expect(invalid999.isValid).toBe(false);
      expect(invalid999.countryCode).toBe('+999');
      expect(invalid999.error).toContain('"+999" does not represent any country calling code');

      const invalid888 = validatePhoneCountryCode('+88812345678');
      expect(invalid888.isValid).toBe(false);
      expect(invalid888.countryCode).toBe('+888');
      expect(invalid888.error).toContain('"+888" does not represent any country calling code');

      const invalid296 = validatePhoneCountryCode('+29612345678');
      expect(invalid296.isValid).toBe(false);
      expect(invalid296.countryCode).toBe('+296');
      expect(invalid296.error).toContain('"+296" does not represent any country calling code');

      const zeroCode = validatePhoneCountryCode('+000123456');
      expect(zeroCode.isValid).toBe(false);
      expect(zeroCode.error).toContain('cannot start with 0');
    });

    it('flags invalid country codes when entered without leading plus', () => {
      const raw999 = validatePhoneCountryCode('99912345678');
      expect(raw999.isValid).toBe(false);
      expect(raw999.error).toContain('"999" does not represent any country calling code');
    });
  });

  describe('normalizePhoneNumber - Strict Country Code Rejection', () => {
    it('rejects numbers with invalid country codes', () => {
      const res = normalizePhoneNumber('+999702950322');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('does not represent any country calling code');
    });

    it('normalizes valid international numbers across 1, 2, and 3 digit country codes', () => {
      const us = normalizePhoneNumber('+14155552671');
      expect(us.isValid).toBe(true);
      expect(us.countryCode).toBe('+1');

      const uk = normalizePhoneNumber('+447911123456');
      expect(uk.isValid).toBe(true);
      expect(uk.countryCode).toBe('+44');

      const kenya = normalizePhoneNumber('+254712345678');
      expect(kenya.isValid).toBe(true);
      expect(kenya.countryCode).toBe('+254');
    });
  });

  describe('validatePhoneNumber', () => {
    it('validates complete numbers with country code and local length', () => {
      const uganda = validatePhoneNumber('+256702950322');
      expect(uganda.isValid).toBe(true);
      expect(uganda.countryCode).toBe('+256');
      expect(uganda.countryName).toBe('Uganda');

      const invalidLength = validatePhoneNumber('+2567029503');
      expect(invalidLength.isValid).toBe(false);
      expect(invalidLength.error).toContain('9 digits after country code');

      const invalidCode = validatePhoneNumber('+99912345678');
      expect(invalidCode.isValid).toBe(false);
      expect(invalidCode.error).toContain('"+999" does not represent any country calling code');
    });
  });

  describe('sanitizeRecipientsInput - Strict Prevention of Consecutive Pluses', () => {
    it('collapses ++ into a single +', () => {
      expect(sanitizeRecipientsInput('++')).toBe('+');
      expect(sanitizeRecipientsInput('+++')).toBe('+');
      expect(sanitizeRecipientsInput('++++')).toBe('+');
    });

    it('collapses ++ typed after an existing valid recipient', () => {
      expect(sanitizeRecipientsInput('+256702950322, ++')).toBe('+256702950322, +');
      expect(sanitizeRecipientsInput('+256702950322, +++')).toBe('+256702950322, +');
    });

    it('collapses pluses separated only by spaces into a single +', () => {
      expect(sanitizeRecipientsInput('+ +')).toBe('+');
      expect(sanitizeRecipientsInput('+256702950322, +  +')).toBe('+256702950322, +');
    });

    it('strips invalid characters and keeps digits, plus, comma, and whitespace', () => {
      expect(sanitizeRecipientsInput('+256700abc123!@#, +256772xyz456')).toBe('+256700123, +256772456');
    });

    it('prevents plus from being placed directly after digits without delimiter', () => {
      expect(sanitizeRecipientsInput('256+700123456')).toBe('256700123456');
      expect(sanitizeRecipientsInput('+256+700')).toBe('+256700');
    });

    it('preserves valid multiple comma-separated numbers starting with +', () => {
      expect(sanitizeRecipientsInput('+256700123456, +256772123456')).toBe('+256700123456, +256772123456');
    });

    it('automatically ensures a space exists after a comma', () => {
      expect(sanitizeRecipientsInput('+256702950322,+254712345678')).toBe('+256702950322, +254712345678');
      expect(sanitizeRecipientsInput('+256702950322,')).toBe('+256702950322, ');
      expect(sanitizeRecipientsInput('+256702950322,,+254712345678')).toBe('+256702950322, +254712345678');
      expect(sanitizeRecipientsInput('+256702950322,   +254712345678')).toBe('+256702950322, +254712345678');
    });
  });

  describe('sanitizeSinglePhoneInput', () => {
    it('allows only a single leading plus and digits', () => {
      expect(sanitizeSinglePhoneInput('++256700123456')).toBe('+256700123456');
      expect(sanitizeSinglePhoneInput('+++256700123456')).toBe('+256700123456');
      expect(sanitizeSinglePhoneInput('+256+700+123456')).toBe('+256700123456');
    });

    it('preserves valid local numbers without plus', () => {
      expect(sanitizeSinglePhoneInput('0772123456')).toBe('0772123456');
    });

    it('strips non-digits from single phone input', () => {
      expect(sanitizeSinglePhoneInput('+256 772 abc 123')).toBe('+256772123');
    });
  });

  describe('handlePhoneInputKeyDown', () => {
    it('prevents typing + if character before cursor is +', () => {
      let prevented = false;
      handlePhoneInputKeyDown({
        key: '+',
        currentTarget: { value: '+256702950322, +', selectionStart: 17, selectionEnd: 17 },
        preventDefault: () => { prevented = true; },
      }, true);
      expect(prevented).toBe(true);
    });

    it('prevents typing + if character after cursor is +', () => {
      let prevented = false;
      handlePhoneInputKeyDown({
        key: '+',
        currentTarget: { value: '+256700123456', selectionStart: 0, selectionEnd: 0 },
        preventDefault: () => { prevented = true; },
      }, true);
      expect(prevented).toBe(true);
    });

    it('prevents typing + immediately following a digit', () => {
      let prevented = false;
      handlePhoneInputKeyDown({
        key: '+',
        currentTarget: { value: '+256', selectionStart: 4, selectionEnd: 4 },
        preventDefault: () => { prevented = true; },
      }, true);
      expect(prevented).toBe(true);
    });

    it('allows typing + at the start of input or after a comma', () => {
      let prevented = false;
      handlePhoneInputKeyDown({
        key: '+',
        currentTarget: { value: '+256700123456, ', selectionStart: 15, selectionEnd: 15 },
        preventDefault: () => { prevented = true; },
      }, true);
      expect(prevented).toBe(false);
    });

    it('disallows comma in single phone input', () => {
      let prevented = false;
      handlePhoneInputKeyDown({
        key: ',',
        currentTarget: { value: '+256700123456', selectionStart: 13, selectionEnd: 13 },
        preventDefault: () => { prevented = true; },
      }, false);
      expect(prevented).toBe(true);
    });

    it('prevents leading comma or consecutive commas in multi-recipient input', () => {
      let preventedEmpty = false;
      handlePhoneInputKeyDown({
        key: ',',
        currentTarget: { value: '', selectionStart: 0, selectionEnd: 0 },
        preventDefault: () => { preventedEmpty = true; },
      }, true);
      expect(preventedEmpty).toBe(true);

      let preventedConsecutive = false;
      handlePhoneInputKeyDown({
        key: ',',
        currentTarget: { value: '+256700123456,', selectionStart: 14, selectionEnd: 14 },
        preventDefault: () => { preventedConsecutive = true; },
      }, true);
      expect(preventedConsecutive).toBe(true);
    });

    it('prevents duplicate space after comma', () => {
      let prevented = false;
      handlePhoneInputKeyDown({
        key: ' ',
        currentTarget: { value: '+256700123456, ', selectionStart: 15, selectionEnd: 15 },
        preventDefault: () => { prevented = true; },
      }, true);
      expect(prevented).toBe(true);
    });
  });
});
