import {
  extractValidCountryCode,
  validatePhoneCountryCode,
  validatePhoneNumber,
  ALL_COUNTRY_CODES,
  type CountryCodeMeta,
  type PhoneCountryCodeValidation,
  type PhoneNumberValidationResult,
} from './country-codes';
import { resolveOriginalCarrierAllocation } from './carrier-allocations';

export {
  extractValidCountryCode,
  validatePhoneCountryCode,
  validatePhoneNumber,
  ALL_COUNTRY_CODES,
  type CountryCodeMeta,
  type PhoneCountryCodeValidation,
  type PhoneNumberValidationResult,
};

interface NormalizationResult {
  original: string;
  normalized: string;
  countryCode: string;
  localNumber: string;
  isValid: boolean;
  error?: string;
}

export function extractCountryCode(phone: string): string | null {
  return extractValidCountryCode(phone);
}

export function normalizePhoneNumber(phone: string, defaultCountryCode: string = '+256'): NormalizationResult {
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = defaultCountryCode + cleaned.substring(1);
  } else if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('256')) {
      cleaned = '+' + cleaned;
    } else {
      const detected = extractValidCountryCode('+' + cleaned);
      if (detected) {
        cleaned = '+' + cleaned;
      } else {
        cleaned = defaultCountryCode + cleaned;
      }
    }
  }

  // Validate country code
  const ccResult = validatePhoneCountryCode(cleaned);
  if (!ccResult.isValid) {
    return {
      original: phone,
      normalized: cleaned,
      countryCode: ccResult.countryCode || '',
      localNumber: cleaned,
      isValid: false,
      error: ccResult.error || 'Invalid country calling code',
    };
  }

  const countryCode = ccResult.countryCode || defaultCountryCode;
  const localNumber = cleaned.substring(countryCode.length);
  
  let isValid = true;
  let error: string | undefined = undefined;
  
  if (countryCode === '+256' && localNumber.length !== 9) {
    isValid = false;
    error = 'Uganda numbers must have 9 digits after country code';
  } else if (localNumber.length < 5 || localNumber.length > 14) {
    isValid = false;
    error = 'Invalid local number length';
  }

  return {
    original: phone,
    normalized: cleaned,
    countryCode,
    localNumber,
    isValid,
    error,
  };
}

export function normalizeMany(phones: string[], defaultCountryCode: string = '+256'): NormalizationResult[] {
  return phones.map(p => normalizePhoneNumber(p, defaultCountryCode));
}

export function isValidPhone(phone: string): boolean {
  return normalizePhoneNumber(phone).isValid;
}

export function formatForDisplay(phone: string): string {
  const norm = normalizePhoneNumber(phone);
  if (!norm.isValid) return phone;
  if (norm.countryCode === '+256') {
    return `${norm.countryCode} ${norm.localNumber.substring(0, 3)} ${norm.localNumber.substring(3, 6)} ${norm.localNumber.substring(6)}`;
  }
  return norm.normalized;
}

export function detectCarrier(phone: string): string {
  const norm = phone.replace(/[^0-9+]/g, '');
  if (!norm) return 'Unknown Network';

  // Uganda (+256 or domestic 07...)
  if (norm.startsWith('+256') || norm.startsWith('256') || norm.startsWith('0')) {
    const local = norm.replace(/^(\+?256|0)/, '');
    if (local.startsWith('71')) {
      return 'UTL';
    }
    const result = resolveOriginalCarrierAllocation('UG', local);
    if (result.status === 'original_allocation_identified' && result.allocation) {
      return result.allocation.operator;
    }
    if (local.startsWith('39') || local.startsWith('31')) {
      return 'MTN Uganda';
    }
    return 'Uganda Network (Unallocated/Unknown)';
  }

  // Nigeria (+234)
  if (norm.startsWith('+234') || norm.startsWith('234')) {
    const local = norm.replace(/^(\+?234|0)/, '');
    const result = resolveOriginalCarrierAllocation('NG', local);
    if (result.status === 'original_allocation_identified' && result.allocation) {
      return result.allocation.operator;
    }
    return 'Nigeria Network (Unallocated/Unknown)';
  }

  // Tanzania (+255)
  if (norm.startsWith('+255') || norm.startsWith('255')) {
    const local = norm.replace(/^(\+?255|0)/, '');
    const result = resolveOriginalCarrierAllocation('TZ', local);
    if (result.status === 'original_allocation_identified' && result.allocation) {
      return result.allocation.operator;
    }
    return 'Tanzania Network (Unallocated/Unknown)';
  }

  // Kenya (+254)
  if (norm.startsWith('+254') || norm.startsWith('254')) {
    const local = norm.replace(/^(\+?254|0)/, '');
    if (local.startsWith('70') || local.startsWith('71') || local.startsWith('72') || local.startsWith('79') || local.startsWith('11')) {
      return 'Safaricom';
    }
    if (local.startsWith('73') || local.startsWith('75') || local.startsWith('78') || local.startsWith('10')) {
      return 'Airtel Kenya';
    }
    if (local.startsWith('77')) {
      return 'Telkom Kenya';
    }
    return 'Kenya Network';
  }

  return 'Other Network';
}

export interface PhoneKeyTarget {
  value: string;
  selectionStart?: number | null;
  selectionEnd?: number | null;
}

export interface PhoneKeyEvent {
  key: string;
  currentTarget: PhoneKeyTarget;
  preventDefault: () => void;
}

/**
 * Sanitizes input for multi-recipient phone inputs (e.g. /sms/send).
 * - Restricts characters to digits, '+', ',', and whitespace.
 * - Collapses consecutive '+' characters (e.g. '++', '+++') into a single '+'.
 * - Collapses pluses separated only by spaces (e.g. '+ +') into a single '+'.
 * - Disallows '+' from appearing immediately after digits without a delimiter (e.g. '256+' -> '256').
 * - Automatically ensures a comma is followed by a space (e.g. ',+254' -> ', +254', ',' -> ', ').
 * - Normalizes multiple spaces/commas after a comma into a single comma + space.
 */
export function sanitizeRecipientsInput(value: string): string {
  // 1. Strip all disallowed characters (keep +, digits, commas, whitespace)
  let cleaned = value.replace(/[^+\d,\s]/g, '');

  // 2. Collapse consecutive commas (e.g. ',,', ',,,') into a single ','
  cleaned = cleaned.replace(/,{2,}/g, ',');

  // 3. Collapse commas separated only by spaces/tabs (e.g. ',   ,') into a single ','
  cleaned = cleaned.replace(/,[\t ]+(?=,)/g, '');

  // 4. Ensure every comma is followed by a space if followed by a character (e.g. '+256...,+254...' -> '+256..., +254...')
  cleaned = cleaned.replace(/,([^\s,])/g, ', $1');

  // 5. Normalize multiple spaces/tabs after a comma into a single space (e.g. ',   ' -> ', ')
  cleaned = cleaned.replace(/,[\t ]+/g, ', ');

  // 6. If the input ends with a comma, automatically insert a space after it
  if (cleaned.endsWith(',')) {
    cleaned = cleaned + ' ';
  }

  // 7. Collapse consecutive pluses (e.g. '++', '+++') into a single '+'
  cleaned = cleaned.replace(/\+{2,}/g, '+');

  // 8. Collapse pluses separated only by spaces/tabs (e.g. '+   +') into a single '+'
  cleaned = cleaned.replace(/\+[\t ]+(?=\+)/g, '');

  // 9. Disallow a '+' directly appended to a digit without a delimiter (e.g. '256+' -> '256')
  cleaned = cleaned.replace(/(\d)\+/g, '$1');

  return cleaned;
}

/**
 * Keyboard interceptor for phone/recipient inputs.
 * Prevents the user from typing a '+' if:
 * 1. The character immediately preceding or following the cursor is already '+'.
 * 2. Preceding non-whitespace characters within the current token end with '+'.
 * 3. The character immediately preceding the cursor is a digit (numbers cannot have '+' in the middle).
 * 4. For single-number inputs (allowMultiple = false), '+' is only allowed at position 0.
 * Also handles ',' and space rules for multi-recipient inputs:
 * 5. Disallows commas for single-number inputs (allowMultiple = false).
 * 6. Prevents leading commas or consecutive commas.
 * 7. Prevents duplicate spaces after a comma (e.g. user pressing space after auto-inserted space).
 */
export function handlePhoneInputKeyDown(e: PhoneKeyEvent, allowMultiple: boolean = false): void {
  // Comma ',' handling
  if (e.key === ',') {
    if (!allowMultiple) {
      e.preventDefault();
      return;
    }
    const input = e.currentTarget;
    const start = input.selectionStart ?? 0;
    const val = input.value;
    const before = val.slice(0, start);

    // Prevent leading comma or consecutive commas
    if ((start === 0 && val.trim().length === 0) || before.trimEnd().endsWith(',')) {
      e.preventDefault();
      return;
    }
  }

  // Space ' ' handling for multi-recipient inputs: prevent duplicate space after comma
  if (e.key === ' ' && allowMultiple) {
    const input = e.currentTarget;
    const start = input.selectionStart ?? 0;
    const val = input.value;
    if (start === 0) {
      e.preventDefault();
      return;
    }
    const before = val.slice(0, start);
    if (before.endsWith(', ') || before.endsWith(' ') || before.endsWith(',')) {
      e.preventDefault();
      return;
    }
  }

  if (e.key === '+') {
    const input = e.currentTarget;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const val = input.value;

    // Check adjacent characters
    const charBefore = start > 0 ? val[start - 1] : '';
    const charAfter = end < val.length ? val[end] : '';

    // 1. If typing '+' directly adjacent to another '+'
    if (charBefore === '+' || charAfter === '+') {
      e.preventDefault();
      return;
    }

    // 2. If preceding non-whitespace within the current segment ends with '+'
    const precedingText = val.slice(0, start);
    if (precedingText.trimEnd().endsWith('+')) {
      e.preventDefault();
      return;
    }

    // 3. If following non-whitespace starts with '+'
    const followingText = val.slice(end);
    if (followingText.trimStart().startsWith('+')) {
      e.preventDefault();
      return;
    }

    // 4. In any phone number, '+' cannot directly follow a digit
    if (/\d/.test(charBefore)) {
      e.preventDefault();
      return;
    }

    // 5. For single-number inputs (allowMultiple = false), '+' is only allowed at position 0
    if (!allowMultiple) {
      if (start !== 0 || val.includes('+')) {
        e.preventDefault();
        return;
      }
    }
  }
}

/**
 * Sanitizes input for single phone number inputs (e.g. contact forms, user settings).
 * - Restricts characters to digits and at most one leading '+'.
 * - If '+' is present, it is only allowed at index 0.
 * - Extra '+' anywhere in the string are completely stripped out.
 */
export function sanitizeSinglePhoneInput(value: string): string {
  // Strip all non-digit and non-plus characters
  const cleaned = value.replace(/[^+\d]/g, '');
  if (!cleaned) return '';

  const startsWithPlus = cleaned.startsWith('+');
  // Remove all pluses, then prepend at most one '+' if it started with one
  const digitsOnly = cleaned.replace(/\+/g, '');
  return startsWithPlus ? `+${digitsOnly}` : digitsOnly;
}

