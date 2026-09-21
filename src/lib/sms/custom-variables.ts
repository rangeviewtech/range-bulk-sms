export type VariableDataType = 'TEXT' | 'NUMBER' | 'CURRENCY' | 'DATE' | 'URL' | 'PHONE';

export interface SmsVariable {
  id: string;
  key: string;            // Variable tag used in messages (e.g. "orderId" -> {{orderId}})
  label: string;          // Human-readable title (e.g. "Order ID")
  description?: string;   // Contextual note / usage explanation
  fallbackValue?: string; // Value used if contact has no data
  sampleValue: string;    // Sample value used in live simulator preview
  dataType: VariableDataType;
  isSystem: boolean;      // True for built-in, false for custom
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Maximum custom variables allowed per user.
 */
export const MAX_CUSTOM_VARIABLES = 20;

/**
 * 8 Standard Built-in System Variables (immutable, always available)
 */
export const SYSTEM_VARIABLES: SmsVariable[] = [
  {
    id: 'sys-first-name',
    key: 'firstName',
    label: 'First Name',
    description: 'Recipient contact first given name',
    fallbackValue: 'Customer',
    sampleValue: 'Sarah',
    dataType: 'TEXT',
    isSystem: true,
  },
  {
    id: 'sys-last-name',
    key: 'lastName',
    label: 'Last Name',
    description: 'Recipient family name or surname',
    fallbackValue: '',
    sampleValue: 'Mukasa',
    dataType: 'TEXT',
    isSystem: true,
  },
  {
    id: 'sys-phone',
    key: 'phone',
    label: 'Phone Number',
    description: 'Recipient mobile phone in MSISDN format',
    fallbackValue: 'your phone',
    sampleValue: '+256701234567',
    dataType: 'PHONE',
    isSystem: true,
  },
  {
    id: 'sys-email',
    key: 'email',
    label: 'Email Address',
    description: 'Recipient primary email account address',
    fallbackValue: 'customer@domain.com',
    sampleValue: 'sarah.m@example.com',
    dataType: 'TEXT',
    isSystem: true,
  },
  {
    id: 'sys-company',
    key: 'company',
    label: 'Company Name',
    description: 'Sender company or recipient organization name',
    fallbackValue: 'our company',
    sampleValue: 'Range View Tech',
    dataType: 'TEXT',
    isSystem: true,
  },
  {
    id: 'sys-date',
    key: 'date',
    label: 'Current Date',
    description: 'Current dispatch calendar date (YYYY-MM-DD or readable)',
    fallbackValue: 'today',
    sampleValue: '2026-09-20',
    dataType: 'DATE',
    isSystem: true,
  },
  {
    id: 'sys-time',
    key: 'time',
    label: 'Current Time',
    description: 'Current broadcast timestamp or scheduled hour',
    fallbackValue: 'now',
    sampleValue: '14:30',
    dataType: 'TEXT',
    isSystem: true,
  },
  {
    id: 'sys-opt-out',
    key: 'optOutUrl',
    label: 'Opt-Out Web Link',
    description: 'Regulatory compliance unsubscribe web address',
    fallbackValue: 'https://range.ug/opt-out',
    sampleValue: 'https://range.ug/u/x92b',
    dataType: 'URL',
    isSystem: true,
  },
];

/**
 * Default Seed Custom Variables (6 initial custom variables, leaving 14 free slots up to 20)
 */
export const DEFAULT_CUSTOM_VARIABLES: SmsVariable[] = [
  {
    id: 'custom-account-number',
    key: 'accountNumber',
    label: 'Account Number',
    description: 'Unique client banking, utility, or account identifier',
    fallbackValue: 'your account',
    sampleValue: 'ACC-84920',
    dataType: 'TEXT',
    isSystem: false,
    createdAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'custom-order-id',
    key: 'orderId',
    label: 'Order ID',
    description: 'E-commerce, invoice, or purchase order reference',
    fallbackValue: 'your order',
    sampleValue: 'ORD-2026',
    dataType: 'TEXT',
    isSystem: false,
    createdAt: '2026-09-18T10:05:00Z',
  },
  {
    id: 'custom-amount',
    key: 'amount',
    label: 'Transaction Amount',
    description: 'Billed amount, transaction payment, or balance charge',
    fallbackValue: '0.00',
    sampleValue: '50,000 UGX',
    dataType: 'CURRENCY',
    isSystem: false,
    createdAt: '2026-09-18T10:10:00Z',
  },
  {
    id: 'custom-due-date',
    key: 'dueDate',
    label: 'Payment Due Date',
    description: 'Subscription expiry, bill due date, or cutoff deadline',
    fallbackValue: 'the deadline',
    sampleValue: 'Oct 15, 2026',
    dataType: 'DATE',
    isSystem: false,
    createdAt: '2026-09-18T10:15:00Z',
  },
  {
    id: 'custom-tracking-url',
    key: 'trackingUrl',
    label: 'Tracking Link',
    description: 'Courier delivery tracking URL for shipping status',
    fallbackValue: 'https://range.ug/track',
    sampleValue: 'https://track.range.ug/pkg-99',
    dataType: 'URL',
    isSystem: false,
    createdAt: '2026-09-18T10:20:00Z',
  },
  {
    id: 'custom-promo-code',
    key: 'promoCode',
    label: 'Promo Code',
    description: 'Marketing campaign coupon or discount promotional code',
    fallbackValue: 'SPECIAL10',
    sampleValue: 'FLASH50',
    dataType: 'TEXT',
    isSystem: false,
    createdAt: '2026-09-18T10:25:00Z',
  },
];

const STORAGE_KEY = 'range_sms_custom_variables';

/**
 * Load custom variables from localStorage (browser) with fallback to default seed
 */
export function getSavedCustomVariables(): SmsVariable[] {
  if (typeof window === 'undefined') {
    return DEFAULT_CUSTOM_VARIABLES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_VARIABLES));
      return DEFAULT_CUSTOM_VARIABLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CUSTOM_VARIABLES;
  } catch {
    return DEFAULT_CUSTOM_VARIABLES;
  }
}

/**
 * Save custom variables into localStorage
 */
export function saveCustomVariables(variables: SmsVariable[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Ensure we never exceed MAX_CUSTOM_VARIABLES
    const capped = variables.slice(0, MAX_CUSTOM_VARIABLES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    // Dispatch storage event for tab synchronization
    window.dispatchEvent(new Event('range_custom_variables_updated'));
  } catch (err) {
    console.error('Failed to persist custom variables to localStorage', err);
  }
}

/**
 * Get combined list of all variables (System first, then Custom)
 */
export function getAllVariablesList(customVars?: SmsVariable[]): SmsVariable[] {
  const custom = customVars ?? getSavedCustomVariables();
  return [...SYSTEM_VARIABLES, ...custom];
}

/**
 * Parse and extract all {{variable}} tags from message body
 */
export function extractVariablesFromText(text: string): string[] {
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const found: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1];
    if (!found.includes(varName)) {
      found.push(varName);
    }
  }
  return found;
}

/**
 * Render template text with provided or sample variable values
 */
export function renderTemplateWithVariables(
  template: string,
  values: Record<string, string> = {},
  allVars: SmsVariable[] = getAllVariablesList()
): string {
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  return template.replace(regex, (match, varName) => {
    // Check provided explicit value first
    if (values[varName] !== undefined && values[varName] !== '') {
      return values[varName];
    }
    // Check matched variable in definitions
    const matched = allVars.find((v) => v.key.toLowerCase() === varName.toLowerCase());
    if (matched) {
      return values[matched.key] || matched.sampleValue || matched.fallbackValue || match;
    }
    return match;
  });
}

/**
 * Convert a human-readable display label into a valid camelCase variable key.
 * e.g. "Purchase Order ID" -> "purchaseOrderId"
 *      "Delivery Date & Time" -> "deliveryDateTime"
 *      "Account #" -> "account"
 *      "2026 Promo Code" -> "var2026PromoCode"
 */
export function generateVariableKeyFromLabel(label: string): string {
  if (!label) return '';

  // 1. Remove all special punctuation/symbols except spaces, hyphens, underscores, and alphanumerics
  const cleaned = label
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, ' ')
    .trim();

  if (!cleaned) return '';

  // 2. Split into distinct word tokens by whitespace, underscores, hyphens
  const words = cleaned
    .split(/[\s_-]+/)
    .filter(Boolean);

  if (words.length === 0) return '';

  // 3. Process into camelCase
  let result = '';
  words.forEach((word, idx) => {
    if (idx === 0) {
      result += word.toLowerCase();
    } else {
      if (word.length <= 3 && word === word.toUpperCase()) {
        result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        result += word.charAt(0).toUpperCase() + word.slice(1);
      }
    }
  });

  // 4. Ensure it starts with an alphabetical letter (a-z, A-Z)
  if (!/^[a-zA-Z]/.test(result)) {
    result = `var${result.charAt(0).toUpperCase() + result.slice(1)}`;
  }

  // 5. Enforce length cap (max 30 chars per schema)
  return result.slice(0, 30);
}

export interface VariableConflictCheck {
  isDuplicate: boolean;
  duplicateField?: 'label' | 'key';
  conflictingVariable?: SmsVariable;
  errorMessage?: string;
}

/**
 * Check if a given label and/or key conflicts with any existing variable in the system
 * (both system built-in variables and custom variables).
 * Exclude ID is supported for editing an existing custom variable.
 */
export function checkVariableConflict(
  label: string,
  key: string,
  existingVariables: SmsVariable[] = getAllVariablesList(),
  excludeId?: string
): VariableConflictCheck {
  const normLabel = label.trim().toLowerCase();
  const normKey = key.trim().toLowerCase();

  // 1. Check duplicate label
  if (normLabel) {
    const labelMatch = existingVariables.find(
      (v) => (excludeId ? v.id !== excludeId : true) && v.label.trim().toLowerCase() === normLabel
    );
    if (labelMatch) {
      return {
        isDuplicate: true,
        duplicateField: 'label',
        conflictingVariable: labelMatch,
        errorMessage: `A ${labelMatch.isSystem ? 'system built-in' : 'custom'} variable with display label "${labelMatch.label}" already exists.`,
      };
    }
  }

  // 2. Check duplicate key
  if (normKey) {
    const keyMatch = existingVariables.find(
      (v) => (excludeId ? v.id !== excludeId : true) && v.key.trim().toLowerCase() === normKey
    );
    if (keyMatch) {
      return {
        isDuplicate: true,
        duplicateField: 'key',
        conflictingVariable: keyMatch,
        errorMessage: `The variable key "{{${keyMatch.key}}}" is already in use by ${keyMatch.isSystem ? 'a system built-in' : 'another'} variable (${keyMatch.label}).`,
      };
    }
  }

  return { isDuplicate: false };
}
