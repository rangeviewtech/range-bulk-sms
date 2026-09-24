import { describe, it, expect } from 'vitest';
import { tokenizeRecipients } from '@/components/sms/phone-recipients-input';

describe('PhoneRecipientsInput - Tokenizer & In-Input Syntax Highlighting', () => {
  it('identifies single valid phone numbers as validated tokens', () => {
    const tokens = tokenizeRecipients('+256702950322');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].isValidPhone).toBe(true);
    expect(tokens[0].countryName).toBe('Uganda');
    expect(tokens[0].carrier).toBe('Airtel Uganda');
    expect(tokens[0].isDelimiter).toBe(false);
  });

  it('accurately tokenizes comma-separated multiple valid phone numbers', () => {
    const tokens = tokenizeRecipients('+256702950322, +254712345678, +447911123456');
    // Expect: token, delimiter, token, delimiter, token
    expect(tokens).toHaveLength(5);

    expect(tokens[0].text).toBe('+256702950322');
    expect(tokens[0].isValidPhone).toBe(true);
    expect(tokens[0].countryName).toBe('Uganda');

    expect(tokens[1].text).toBe(', ');
    expect(tokens[1].isDelimiter).toBe(true);

    expect(tokens[2].text).toBe('+254712345678');
    expect(tokens[2].isValidPhone).toBe(true);
    expect(tokens[2].countryName).toBe('Kenya');

    expect(tokens[3].text).toBe(', ');
    expect(tokens[3].isDelimiter).toBe(true);

    expect(tokens[4].text).toBe('+447911123456');
    expect(tokens[4].isValidPhone).toBe(true);
    expect(tokens[4].countryName).toBe('United Kingdom');
  });

  it('marks invalid country code numbers as invalid country code tokens', () => {
    const tokens = tokenizeRecipients('+256702950322, +99912345678');
    expect(tokens).toHaveLength(3);

    expect(tokens[0].isValidPhone).toBe(true);
    expect(tokens[1].isDelimiter).toBe(true);

    expect(tokens[2].text).toBe('+99912345678');
    expect(tokens[2].isValidPhone).toBe(false);
    expect(tokens[2].isInvalidCountryCode).toBe(true);
  });

  it('treats incomplete typing states as non-error plain text', () => {
    const tokens = tokenizeRecipients('+256, +');
    expect(tokens).toHaveLength(3);
    // "+256" is incomplete but country code is valid Uganda
    expect(tokens[0].isValidPhone).toBe(false);
    expect(tokens[0].isInvalidCountryCode).toBe(false);

    expect(tokens[1].isDelimiter).toBe(true);

    // "+" is typing prefix
    expect(tokens[2].isValidPhone).toBe(false);
    expect(tokens[2].isInvalidCountryCode).toBe(false);
  });

  it('supports 1-digit and 2-digit international numbers', () => {
    const us = tokenizeRecipients('+14155552671');
    expect(us[0].isValidPhone).toBe(true);
    expect(us[0].countryName).toContain('USA');

    const uk = tokenizeRecipients('+447911123456');
    expect(uk[0].isValidPhone).toBe(true);
    expect(uk[0].countryName).toBe('United Kingdom');
  });
});
