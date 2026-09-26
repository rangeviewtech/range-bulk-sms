/**
 * Airtel Uganda Telecom Official Rate & Regulatory Specifications
 * 
 * Compliant with Airtel Bulk SMS Pricing Bands, 
 * UCC (Uganda Communications Commission) Regulatory Requirements,
 * and SMPP v3.4 SMSC Gateway Direct Interconnect standards.
 */

export interface AirtelVolumeTier {
  id: string;
  name: string;
  minVolume: number;
  maxVolume: number | null; // null represents unbounded ("Above")
  rateUgx: number;          // VAT inclusive
  isNegotiable?: boolean;
}

export const AIRTEL_SETUP_FEES = {
  SENDER_ID_REGISTRATION_UGX: 250_000, // 250,000 UGX per Sender ID
  CURRENCY: 'UGX',
  VAT_INCLUSIVE: true,
} as const;

/**
 * Airtel Uganda Official Bulk SMS Pricing Bands (VAT Incl.)
 */
export const AIRTEL_SMS_TIERS: AirtelVolumeTier[] = [
  {
    id: 'tier-1',
    name: 'Up to 200,000',
    minVolume: 1,
    maxVolume: 200_000,
    rateUgx: 30,
  },
  {
    id: 'tier-2',
    name: '200,001 - 500,000',
    minVolume: 200_001,
    maxVolume: 500_000,
    rateUgx: 28,
  },
  {
    id: 'tier-3',
    name: '500,001 - 1,000,000',
    minVolume: 500_001,
    maxVolume: 1_000_000,
    rateUgx: 24,
  },
  {
    id: 'tier-4',
    name: '1,000,001 - 3,000,000',
    minVolume: 1_000_001,
    maxVolume: 3_000_000,
    rateUgx: 19,
  },
  {
    id: 'tier-5',
    name: '3,000,001 - 5,000,000',
    minVolume: 3_000_001,
    maxVolume: 5_000_000,
    rateUgx: 15,
  },
  {
    id: 'tier-6',
    name: '5,000,001 - 15,000,000',
    minVolume: 5_000_001,
    maxVolume: 15_000_000,
    rateUgx: 10,
  },
  {
    id: 'tier-7',
    name: '15,000,001 - 200,000,000',
    minVolume: 15_000_001,
    maxVolume: 200_000_000,
    rateUgx: 5,
  },
  {
    id: 'tier-8',
    name: '200,000,001 - Above',
    minVolume: 200_000_001,
    maxVolume: null,
    rateUgx: 0.5,
    isNegotiable: true,
  },
];

export interface AirtelRateCalculation {
  volume: number;
  ratePerUnit: number;
  totalCostUgx: number;
  tier: AirtelVolumeTier;
  currency: 'UGX';
  isNegotiable: boolean;
}

/**
 * Calculates the applicable Bulk SMS unit rate and total cost based on planned message volume.
 */
export function calculateAirtelSmsRate(volume: number): AirtelRateCalculation {
  const safeVolume = Math.max(0, Math.floor(volume));
  
  // Find applicable tier
  const tier = AIRTEL_SMS_TIERS.find((t) => {
    if (t.maxVolume === null) return safeVolume >= t.minVolume;
    return safeVolume >= t.minVolume && safeVolume <= t.maxVolume;
  }) || AIRTEL_SMS_TIERS[0];

  const totalCostUgx = safeVolume * tier.rateUgx;

  return {
    volume: safeVolume,
    ratePerUnit: tier.rateUgx,
    totalCostUgx,
    tier,
    currency: 'UGX',
    isNegotiable: Boolean(tier.isNegotiable),
  };
}

export interface SenderIdValidationResult {
  isValid: boolean;
  senderId: string;
  isNumeric: boolean;
  isAlphanumeric: boolean;
  requiresUccApproval: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Validates a Sender ID against Airtel & UCC Regulatory Whitelist Requirements:
 * - Max 11 characters.
 * - Alphanumeric characters permitted (a-z, A-Z, 0-9).
 * - Only underscore (_) and dash (-) special characters permitted.
 * - Spaces and brackets explicitly disallowed.
 * - Numeric Sender IDs require explicit UCC regulatory clearance.
 */
export function validateAirtelSenderId(rawSenderId: string): SenderIdValidationResult {
  const trimmed = (rawSenderId || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      senderId: '',
      isNumeric: false,
      isAlphanumeric: false,
      requiresUccApproval: false,
      error: 'Sender ID cannot be empty.',
    };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      senderId: trimmed,
      isNumeric: false,
      isAlphanumeric: false,
      requiresUccApproval: false,
      error: 'Sender ID must be at least 3 characters long.',
    };
  }

  if (trimmed.length > 11) {
    return {
      isValid: false,
      senderId: trimmed,
      isNumeric: false,
      isAlphanumeric: false,
      requiresUccApproval: false,
      error: 'Sender ID cannot exceed 11 characters as per standard telecom specifications.',
    };
  }

  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      senderId: trimmed,
      isNumeric: false,
      isAlphanumeric: false,
      requiresUccApproval: false,
      error: 'Spaces are not allowed in telecom Sender IDs.',
    };
  }

  if (/[()[\]{}]/.test(trimmed)) {
    return {
      isValid: false,
      senderId: trimmed,
      isNumeric: false,
      isAlphanumeric: false,
      requiresUccApproval: false,
      error: 'Brackets and parentheses are not allowed in telecom Sender IDs.',
    };
  }

  // Check allowed characters: letters, numbers, underscore, dash
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      isValid: false,
      senderId: trimmed,
      isNumeric: false,
      isAlphanumeric: false,
      requiresUccApproval: false,
      error: 'Sender ID can only contain letters, numbers, underscores (_), and dashes (-).',
    };
  }

  const isNumeric = /^\d+$/.test(trimmed);
  const isAlphanumeric = !isNumeric;

  const warnings: string[] = [];
  if (isNumeric) {
    warnings.push('Numeric Sender IDs require formal regulatory clearance and approval from the Uganda Communications Commission (UCC).');
  }

  return {
    isValid: true,
    senderId: trimmed,
    isNumeric,
    isAlphanumeric,
    requiresUccApproval: isNumeric,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Official Onboarding Documentation Checklist for Airtel Telecom Interconnect
 */
export const AIRTEL_ONBOARDING_CHECKLIST = [
  {
    id: 'auth_letter',
    title: 'Appointment / Authorization Letter',
    description: 'Formal company letter on official headed paper authorizing Airtel to host Bulk SMS account detailing business use case.',
    required: true,
  },
  {
    id: 'cert_incorporation',
    title: 'Certificate of Incorporation / Registration',
    description: 'Valid URSB Certificate of Incorporation establishing legal entity registration.',
    required: true,
  },
  {
    id: 'memarts',
    title: 'Memorandum and Articles of Association',
    description: 'Certified company Memorandum and Articles of Association (or Partnership Deed).',
    required: true,
  },
  {
    id: 'tin_certificate',
    title: 'Tax Identification Number (TIN) Certificate',
    description: 'Valid Uganda Revenue Authority (URA) TIN Certificate for business tax verification.',
    required: true,
  },
  {
    id: 'ucc_approval',
    title: 'UCC Regulatory Clearance (For Numeric Sender IDs / Short Codes)',
    description: 'Regulatory assignment permit from Uganda Communications Commission if requesting numeric short code or numeric sender ID.',
    required: false,
  },
  {
    id: 'source_ip_whitelisting',
    title: 'Gateway Source IP Whitelist Declaration',
    description: 'Production IP addresses to be whitelisted on Airtel SMSC firewall for SMPP v3.4 bind and REST API dispatch.',
    required: true,
  },
] as const;
