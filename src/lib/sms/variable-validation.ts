/**
 * Real-time variable type inference and validation engine for SMS templates.
 * Supports TEXT, NUMBER, CURRENCY, DATE, URL, and PHONE data types.
 */

import { SYSTEM_VARIABLES, DEFAULT_CUSTOM_VARIABLES, type VariableDataType, type SmsVariable } from './custom-variables';

export interface VariableValidationResult {
  isValid: boolean;
  isMissing: boolean;
  errorMessage?: string;
  formattedValue?: string;
}

/**
 * Infer or look up the data type of a variable by key
 */
export function resolveVariableDataType(
  varName: string,
  allVars?: SmsVariable[]
): VariableDataType {
  const cleanKey = varName.replace(/[{}]/g, '').trim();
  const normalized = cleanKey.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Look up in provided or system variable definitions
  const registry = allVars && allVars.length > 0
    ? allVars
    : [...SYSTEM_VARIABLES, ...DEFAULT_CUSTOM_VARIABLES];

  const matched = registry.find(
    (v) =>
      v.key.toLowerCase() === cleanKey.toLowerCase() ||
      v.key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
  );

  if (matched?.dataType) {
    return matched.dataType;
  }

  // 2. Semantic heuristics based on key naming conventions
  if (
    normalized.includes('date') ||
    normalized.includes('due') ||
    normalized.includes('deadline') ||
    normalized.includes('expiry') ||
    normalized.includes('schedule') ||
    normalized.includes('birth') ||
    normalized.includes('dob') ||
    normalized.includes('appointment') ||
    normalized === 'day'
  ) {
    return 'DATE';
  }

  if (
    normalized.includes('amount') ||
    normalized.includes('price') ||
    normalized.includes('cost') ||
    normalized.includes('fee') ||
    normalized.includes('charge') ||
    normalized.includes('balance') ||
    normalized.includes('total') ||
    normalized.includes('salary') ||
    normalized.includes('pay') ||
    normalized.includes('credit')
  ) {
    return 'CURRENCY';
  }

  if (
    normalized.includes('phone') ||
    normalized.includes('mobile') ||
    normalized.includes('tel') ||
    normalized.includes('msisdn') ||
    normalized.includes('whatsapp')
  ) {
    return 'PHONE';
  }

  if (
    normalized.includes('url') ||
    normalized.includes('link') ||
    normalized.includes('website') ||
    normalized.includes('portal') ||
    normalized.includes('site') ||
    normalized.includes('tracking')
  ) {
    return 'URL';
  }

  if (
    normalized.includes('qty') ||
    normalized.includes('quantity') ||
    normalized.includes('count') ||
    normalized.includes('num') ||
    normalized.includes('score') ||
    normalized.includes('points') ||
    normalized.includes('age') ||
    normalized.includes('percent') ||
    normalized.includes('rate')
  ) {
    return 'NUMBER';
  }

  return 'TEXT';
}

/**
 * Validate that a string matches a valid calendar date (YYYY-MM-DD, DD/MM/YYYY, etc.)
 */
export function isValidCalendarDate(val: string): { isValid: boolean; isoDate?: string } {
  const trimmed = val.trim();
  if (!trimmed) return { isValid: false };

  // 1. Check ISO pattern: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);

    if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) {
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day >= 1 && day <= daysInMonth) {
        const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return { isValid: true, isoDate: iso };
      }
    }
    return { isValid: false };
  }

  // 2. Check DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);

    if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) {
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day >= 1 && day <= daysInMonth) {
        const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return { isValid: true, isoDate: iso };
      }
    }
  }

  // 3. Fallback to native Date parser (e.g. "Oct 15, 2026", "October 15 2026")
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const year = d.getFullYear();
    if (year >= 1900 && year <= 2100) {
      const iso = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { isValid: true, isoDate: iso };
    }
  }

  return { isValid: false };
}

/**
 * Validate variable value according to its data type
 */
export function validateVariableValue(
  value: string,
  dataType: VariableDataType,
  varName?: string
): VariableValidationResult {
  const trimmed = (value ?? '').trim();

  // Missing check
  if (!trimmed) {
    return {
      isValid: false,
      isMissing: true,
      errorMessage: varName ? `${varName} is missing` : 'This variable is required',
    };
  }

  switch (dataType) {
    case 'DATE': {
      const dateCheck = isValidCalendarDate(trimmed);
      if (!dateCheck.isValid) {
        return {
          isValid: false,
          isMissing: false,
          errorMessage: 'Invalid date. Use YYYY-MM-DD (e.g. 2026-10-15)',
        };
      }
      return {
        isValid: true,
        isMissing: false,
        formattedValue: dateCheck.isoDate,
      };
    }

    case 'NUMBER': {
      // Must be numeric (digits with optional leading sign and decimal point, spaces/commas allowed)
      const cleanNum = trimmed.replace(/,/g, '').replace(/\s+/g, '');
      const numMatch = cleanNum.match(/^-?\d+(\.\d+)?$/);
      if (!numMatch || isNaN(Number(cleanNum))) {
        return {
          isValid: false,
          isMissing: false,
          errorMessage: 'Must be a valid number (e.g. 100 or 45.5)',
        };
      }
      return {
        isValid: true,
        isMissing: false,
        formattedValue: cleanNum,
      };
    }

    case 'CURRENCY': {
      // Currency values can be numeric or contain currency codes/symbols: UGX, USD, KES, $, €, £, commas
      // Strip valid currency affixes to verify the core amount is numeric
      const sanitized = trimmed
        .replace(/(UGX|USD|KES|TZS|RWF|EUR|GBP|USD|\$|€|£|Shs|shs|USh)/gi, '')
        .replace(/,/g, '')
        .trim();

      const numMatch = sanitized.match(/^-?\d+(\.\d+)?$/);
      if (!numMatch || isNaN(Number(sanitized))) {
        return {
          isValid: false,
          isMissing: false,
          errorMessage: 'Must be a valid currency amount (e.g. 50,000 UGX)',
        };
      }
      return {
        isValid: true,
        isMissing: false,
        formattedValue: trimmed,
      };
    }

    case 'PHONE': {
      // Allow leading + and digits, spaces, dashes, or parens
      const digitsOnly = trimmed.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return {
          isValid: false,
          isMissing: false,
          errorMessage: 'Must be a valid phone number (7-15 digits)',
        };
      }
      return {
        isValid: true,
        isMissing: false,
        formattedValue: trimmed.startsWith('+') ? trimmed : `+${trimmed}`,
      };
    }

    case 'URL': {
      // Valid web link or domain
      const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/i;
      if (!urlPattern.test(trimmed)) {
        return {
          isValid: false,
          isMissing: false,
          errorMessage: 'Must be a valid URL link (e.g. https://range.ug/order)',
        };
      }
      return {
        isValid: true,
        isMissing: false,
        formattedValue: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
      };
    }

    case 'TEXT':
    default: {
      if (trimmed.length > 250) {
        return {
          isValid: false,
          isMissing: false,
          errorMessage: 'Text exceeds 250 character limit',
        };
      }
      return {
        isValid: true,
        isMissing: false,
        formattedValue: trimmed,
      };
    }
  }
}

/**
 * Returns a human-friendly placeholder based on variable name and data type
 */
export function getVariablePlaceholder(varName: string, dataType: VariableDataType): string {
  const clean = varName.replace(/[{}]/g, '').trim();

  switch (dataType) {
    case 'DATE':
      return 'YYYY-MM-DD';
    case 'CURRENCY':
      return 'e.g. 50,000 UGX';
    case 'NUMBER':
      return 'e.g. 100';
    case 'PHONE':
      return 'e.g. +256700123456';
    case 'URL':
      return 'https://...';
    case 'TEXT':
    default:
      return `Enter ${clean}...`;
  }
}

/**
 * Returns realistic sample values for a variable key based on its inferred or declared data type.
 * Always guarantees format validity according to validation rules.
 */
export function getVariableSampleValue(
  key: string,
  index: number = 1,
  allVars?: SmsVariable[]
): string {
  const clean = key.replace(/[{}\[\]_]/g, '').trim();
  const normalized = clean.toLowerCase();
  const dt = resolveVariableDataType(key, allVars);

  const idx = Math.max(0, (index - 1) % 5);

  const names = ['Sarah Namubiru', 'John Okello', 'Brenda Akello', 'David Ssemwogerere', 'Grace Atuhaire'];
  const firstNames = ['Sarah', 'John', 'Brenda', 'David', 'Grace'];
  const lastNames = ['Namubiru', 'Okello', 'Akello', 'Ssemwogerere', 'Atuhaire'];
  const amounts = ['50,000 UGX', '120,000 UGX', '35,000 UGX', '85,000 UGX', '200,000 UGX'];
  const orders = ['ORD-8941', 'ORD-8942', 'ORD-8943', 'ORD-8944', 'ORD-8945'];
  const accounts = ['ACC-84920', 'ACC-84921', 'ACC-84922', 'ACC-84923', 'ACC-84924'];
  const dates = ['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28'];
  const numbers = ['10', '25', '50', '75', '100'];
  const phones = ['+256701234567', '+256701234568', '+256701234569', '+256701234570', '+256701234571'];
  const urls = [
    'https://range.ug/order/8941',
    'https://range.ug/invoice/8942',
    'https://range.ug/portal/8943',
    'https://range.ug/receipt/8944',
    'https://range.ug/track/8945',
  ];

  switch (dt) {
    case 'DATE':
      return dates[idx];

    case 'CURRENCY':
      return amounts[idx];

    case 'NUMBER':
      return numbers[idx];

    case 'PHONE':
      return phones[idx];

    case 'URL':
      return urls[idx];

    case 'TEXT':
    default:
      if (normalized === 'name' || normalized === 'fullname') return names[idx];
      if (normalized === 'firstname') return firstNames[idx];
      if (normalized === 'lastname') return lastNames[idx];
      if (normalized.includes('order')) return orders[idx];
      if (normalized.includes('account')) return accounts[idx];
      if (normalized.includes('company') || normalized.includes('org')) return 'Range View Tech';
      if (normalized.includes('email')) return `client${index}@example.com`;
      if (normalized.includes('code') || normalized.includes('pin') || normalized.includes('otp')) {
        return `${1000 + index * 123}`;
      }
      return `Sample ${clean}`;
  }
}

