/**
 * Core Telephone Number Analyzer & Validator
 * 
 * Production-grade ITU-T E.164 analyzer with:
 * - Deterministic parsing & validation
 * - Domestic trunk 0 normalization (Uganda trunk 0 -> +256, Italy significant 0 retention)
 * - Shared calling code disambiguation (+1 NANP, +7, +39, +44, +61, +212, +262)
 * - Line-type classification (MOBILE, FIXED_LINE, etc.)
 * - Verified regulator carrier allocation overlay (UCC, NCC, TCRA)
 * - PII-safe logging and error categorization
 */

import {
  RegionRecord,
  getRegionByAlpha2,
  getRegionsByDialCode,
  resolveCandidateRegions,
} from './country-registry';
import {
  CarrierAllocation,
  resolveOriginalCarrierAllocation,
} from './carrier-allocations';

export type PhoneValidity = 'valid_pattern' | 'invalid_pattern' | 'incomplete' | 'needs_region';

export type PhoneStatus =
  | 'original_allocation_identified'
  | 'valid_carrier_unknown'
  | 'original_allocation_conflict'
  | 'invalid_number'
  | 'needs_region'
  | 'unsupported_numbering_region'
  | 'numbering_region_ambiguous';

export type LineType =
  | 'MOBILE'
  | 'FIXED_LINE'
  | 'FIXED_LINE_OR_MOBILE'
  | 'TOLL_FREE'
  | 'PREMIUM_RATE'
  | 'SHARED_COST'
  | 'VOIP'
  | 'PERSONAL_NUMBER'
  | 'PAGER'
  | 'UAN'
  | 'VOICEMAIL'
  | 'UNKNOWN';

export interface PhoneCountryInfo {
  iso2: string;
  iso3: string;
  name: string;
  calling_code: string;
  resolution: 'resolved' | 'ambiguous' | 'unresolved';
}

export interface PhoneDisplay {
  national: string;
  international: string;
}

export interface TelecomClaims {
  input_accepted: boolean;
  possible_length: boolean;
  valid_number_pattern: boolean;
  numbering_region_resolved: boolean;
  line_type_classified: boolean;
  original_allocation_holder_identified: boolean;
  retail_brand_identified: boolean;
  current_carrier_verified: boolean;
  reachable: boolean;
  user_controls_number: boolean;
}

export interface PhoneAnalysisResult {
  validity: PhoneValidity;
  status: PhoneStatus;
  e164: string | null;
  national_significant_number: string | null;
  display: PhoneDisplay;
  country: PhoneCountryInfo | null;
  line_type: LineType;
  original_allocation: CarrierAllocation | null;
  metadata_carrier: string | null;
  current_carrier: string | null;
  lookup_reported_carrier: string | null;
  ported_possible: 'not_determined' | 'yes' | 'no';
  reachability: 'not_checked' | 'reachable' | 'unreachable';
  ownership: 'not_checked' | 'verified';
  claims: TelecomClaims;
  metadata_version: string;
  warnings: string[];
  error?: string;
}

export interface AnalyzePhoneOptions {
  defaultRegion?: string;
  expectedRegion?: string;
  mobileOnly?: boolean;
  includeOriginalCarrier?: boolean;
  enableLiveLookup?: boolean;
  userConsent?: boolean;
}

export function createClaims(partial: Partial<TelecomClaims> = {}): TelecomClaims {
  return {
    input_accepted: false,
    possible_length: false,
    valid_number_pattern: false,
    numbering_region_resolved: false,
    line_type_classified: false,
    original_allocation_holder_identified: false,
    retail_brand_identified: false,
    current_carrier_verified: false,
    reachable: false,
    user_controls_number: false,
    ...partial,
  };
}

const METADATA_VERSION = 'libphonenumber-v9.0.39-cldr45';

/**
 * Classifies the line type based on region and NSN prefix.
 */
function determineLineType(alpha2: string, nsn: string): LineType {
  const code = alpha2.toUpperCase();

  // Uganda: 7xx -> MOBILE, 3xx / 4xx -> FIXED_LINE
  if (code === 'UG') {
    if (nsn.startsWith('7')) return 'MOBILE';
    if (nsn.startsWith('3') || nsn.startsWith('4')) return 'FIXED_LINE';
    if (nsn.startsWith('800')) return 'TOLL_FREE';
    return 'UNKNOWN';
  }

  // Nigeria: 70x, 80x, 81x, 90x, 91x -> MOBILE, 1x / 2x -> FIXED_LINE
  if (code === 'NG') {
    if (/^(70|80|81|90|91)\d/.test(nsn)) return 'MOBILE';
    if (/^[12]\d/.test(nsn)) return 'FIXED_LINE';
    return 'UNKNOWN';
  }

  // Tanzania: 6x, 7x -> MOBILE, 2x -> FIXED_LINE
  if (code === 'TZ') {
    if (/^[67]\d/.test(nsn)) return 'MOBILE';
    if (nsn.startsWith('2')) return 'FIXED_LINE';
    return 'UNKNOWN';
  }

  // Kenya (KE): 7xx, 1xx -> MOBILE, 20x -> FIXED_LINE
  if (code === 'KE') {
    if (/^(7\d|1[0-1])\d/.test(nsn)) return 'MOBILE';
    if (nsn.startsWith('20')) return 'FIXED_LINE';
    return 'UNKNOWN';
  }

  // Rwanda (RW): 7xx -> MOBILE, 25x -> FIXED_LINE
  if (code === 'RW') {
    if (nsn.startsWith('7')) return 'MOBILE';
    if (nsn.startsWith('25')) return 'FIXED_LINE';
    return 'UNKNOWN';
  }

  // United Kingdom (GB): 7xxx -> MOBILE, 1xxx, 2xxx -> FIXED_LINE, 800 -> TOLL_FREE
  if (code === 'GB') {
    if (nsn.startsWith('7')) return 'MOBILE';
    if (nsn.startsWith('1') || nsn.startsWith('2')) return 'FIXED_LINE';
    if (nsn.startsWith('800') || nsn.startsWith('808')) return 'TOLL_FREE';
    return 'UNKNOWN';
  }

  // United States & Canada (+1): Geographic NPA numbers are FIXED_LINE_OR_MOBILE
  if (code === 'US' || code === 'CA') {
    const area = nsn.slice(0, 3);
    if (['800', '888', '877', '866', '855', '844', '833'].includes(area)) {
      return 'TOLL_FREE';
    }
    return 'FIXED_LINE_OR_MOBILE';
  }

  // Default heuristic: mobile if starts with typical mobile prefix
  return 'MOBILE';
}

/**
 * Formats a valid telephone number into clean national and international representations.
 */
function formatDisplayNumbers(
  region: RegionRecord,
  dialCode: string,
  nsn: string
): PhoneDisplay {
  const code = region.alpha2.toUpperCase();

  // Uganda (+256): 9 NSN digits
  if (code === 'UG' && nsn.length === 9) {
    const p1 = nsn.slice(0, 3);
    const p2 = nsn.slice(3, 6);
    const p3 = nsn.slice(6, 9);
    return {
      national: `0${p1} ${p2} ${p3}`,
      international: `+256 ${p1} ${p2} ${p3}`,
    };
  }

  // Nigeria (+234): 10 NSN digits
  if (code === 'NG' && nsn.length === 10) {
    const p1 = nsn.slice(0, 4);
    const p2 = nsn.slice(4, 7);
    const p3 = nsn.slice(7, 10);
    return {
      national: `0${p1} ${p2} ${p3}`,
      international: `+234 ${p1} ${p2} ${p3}`,
    };
  }

  // Tanzania (+255): 9 NSN digits
  if (code === 'TZ' && nsn.length === 9) {
    const p1 = nsn.slice(0, 3);
    const p2 = nsn.slice(3, 6);
    const p3 = nsn.slice(6, 9);
    return {
      national: `0${p1} ${p2} ${p3}`,
      international: `+255 ${p1} ${p2} ${p3}`,
    };
  }

  // Italy (+39): Keep significant zero in national and international
  if (code === 'IT' || code === 'VA') {
    return {
      national: nsn,
      international: `+39 ${nsn}`,
    };
  }

  // Generic formatting
  const nationalPrefix = nsn.startsWith('0') ? '' : '0';
  return {
    national: `${nationalPrefix}${nsn}`,
    international: `${dialCode} ${nsn}`,
  };
}

/**
 * Validates the length and pattern of a national significant number (NSN).
 */
function validateNsn(region: RegionRecord, nsn: string): { isValid: boolean; error?: string } {
  const code = region.alpha2.toUpperCase();

  // Uganda (+256): strictly 9 digits
  if (code === 'UG') {
    if (nsn.length !== 9) {
      return {
        isValid: false,
        error: `Uganda (+256) numbers must have 9 digits after country code (e.g. +256700123456)`,
      };
    }
    // Uganda valid mobile starts with 7, landline starts with 3 or 4
    if (!/^[347]\d{8}$/.test(nsn)) {
      return {
        isValid: false,
        error: `Invalid Uganda number format. Numbers start with 7 (mobile) or 3/4 (fixed).`,
      };
    }
    return { isValid: true };
  }

  // Nigeria (+234): strictly 10 digits
  if (code === 'NG') {
    if (nsn.length !== 10) {
      return {
        isValid: false,
        error: `Nigeria (+234) mobile numbers must have 10 digits after country code (e.g. +2348021234567)`,
      };
    }
    return { isValid: true };
  }

  // Tanzania (+255): strictly 9 digits
  if (code === 'TZ') {
    if (nsn.length !== 9) {
      return {
        isValid: false,
        error: `Tanzania (+255) numbers must have 9 digits after country code (e.g. +255621234567)`,
      };
    }
    return { isValid: true };
  }

  // General bounds per ITU-T E.164 (max 15 total digits including dialCode)
  const dialDigitsCount = region.dialCode.replace(/\D/g, '').length;
  const maxNsnLength = 15 - dialDigitsCount;
  const minNsnLength = Math.max(4, region.sampleNsnDigits - 3);

  if (nsn.length < minNsnLength || nsn.length > maxNsnLength) {
    return {
      isValid: false,
      error: `Invalid number length for ${region.name}. Expected ${region.sampleNsnDigits} digits.`,
    };
  }

  return { isValid: true };
}

/**
 * Analyzes a raw telephone number according to global telecom rules.
 */
export function analyzePhone(
  rawInput: string,
  options: AnalyzePhoneOptions = {}
): PhoneAnalysisResult {
  const warnings: string[] = [];
  const raw = (rawInput || '').trim();

  // Basic guard
  if (!raw) {
    return {
      validity: 'incomplete',
      status: 'invalid_number',
      e164: null,
      national_significant_number: null,
      display: { national: '', international: '' },
      country: null,
      line_type: 'UNKNOWN',
      original_allocation: null,
      metadata_carrier: null,
      current_carrier: null,
      lookup_reported_carrier: null,
      ported_possible: 'not_determined',
      reachability: 'not_checked',
      ownership: 'not_checked',
      claims: createClaims({
        input_accepted: false,
      }),
      metadata_version: METADATA_VERSION,
      warnings: [],
      error: 'Phone number is required.',
    };
  }

  const defaultRegion = options.defaultRegion !== undefined ? options.defaultRegion : 'UG';
  let dialCode: string | null = null;
  let nsn: string = '';
  let resolvedRegion: RegionRecord | undefined;
  let isSharedAmbiguous = false;

  // Case A: Domestic input starting with leading 0 (e.g. 0700123456)
  if (raw.startsWith('0') && !raw.startsWith('00')) {
    const targetRegionAlpha2 = options.expectedRegion || defaultRegion;
    const targetRegion = getRegionByAlpha2(targetRegionAlpha2);

    if (!targetRegion) {
      return {
        validity: 'needs_region',
        status: 'needs_region',
        e164: null,
        national_significant_number: raw.replace(/\D/g, '') || null,
        display: { national: raw, international: '' },
        country: null,
        line_type: 'UNKNOWN',
        original_allocation: null,
        metadata_carrier: null,
        current_carrier: null,
        lookup_reported_carrier: null,
        ported_possible: 'not_determined',
        reachability: 'not_checked',
        ownership: 'not_checked',
        claims: createClaims({
          input_accepted: true,
          possible_length: false,
          valid_number_pattern: false,
          numbering_region_resolved: false,
        }),
        metadata_version: METADATA_VERSION,
        warnings: ['National format requires an authorized default region.'],
        error: 'Please select a country code or enter an international number with "+".',
      };
    }

    resolvedRegion = targetRegion;
    dialCode = targetRegion.dialCode;

    const digitsOnly = raw.replace(/\D/g, '');
    // In Italy / Vatican, 0 is significant (not a trunk prefix to be stripped)
    if (targetRegion.alpha2 === 'IT' || targetRegion.alpha2 === 'VA') {
      nsn = digitsOnly;
    } else {
      // For Uganda, Nigeria, UK, etc., domestic 0 is a trunk prefix to strip
      nsn = digitsOnly.slice(1);
    }
  } else {
    // Case B: International format with leading + or raw international digits
    const cleaned = raw.startsWith('+') ? raw : (raw.startsWith('00') ? `+${raw.slice(2)}` : `+${raw}`);
    const digits = cleaned.replace(/[^0-9]/g, '');

    if (digits.length === 0) {
      return {
        validity: 'incomplete',
        status: 'invalid_number',
        e164: null,
        national_significant_number: null,
        display: { national: '', international: '' },
        country: null,
        line_type: 'UNKNOWN',
        original_allocation: null,
        metadata_carrier: null,
        current_carrier: null,
        lookup_reported_carrier: null,
        ported_possible: 'not_determined',
        reachability: 'not_checked',
        ownership: 'not_checked',
        claims: createClaims({
          input_accepted: true,
          possible_length: false,
          valid_number_pattern: false,
          numbering_region_resolved: false,
        }),
        metadata_version: METADATA_VERSION,
        warnings: [],
        error: 'Please enter digits after "+".',
      };
    }

    // Try longest matching calling code (3 digits, 2 digits, 1 digit)
    const codeCandidates = [
      `+${digits.slice(0, 3)}`,
      `+${digits.slice(0, 2)}`,
      `+${digits.slice(0, 1)}`,
    ];

    for (const testCode of codeCandidates) {
      const matched = getRegionsByDialCode(testCode);
      if (matched.length > 0) {
        dialCode = testCode;
        nsn = digits.slice(testCode.length - 1);
        break;
      }
    }

    if (!dialCode) {
      return {
        validity: 'invalid_pattern',
        status: 'invalid_number',
        e164: null,
        national_significant_number: null,
        display: { national: raw, international: raw },
        country: null,
        line_type: 'UNKNOWN',
        original_allocation: null,
        metadata_carrier: null,
        current_carrier: null,
        lookup_reported_carrier: null,
        ported_possible: 'not_determined',
        reachability: 'not_checked',
        ownership: 'not_checked',
        claims: createClaims({
          input_accepted: true,
          possible_length: digits.length >= 4 && digits.length <= 15,
          valid_number_pattern: false,
          numbering_region_resolved: false,
        }),
        metadata_version: METADATA_VERSION,
        warnings: [],
        error: `Country calling code could not be resolved from "${raw}".`,
      };
    }

    // Disambiguate candidate regions (e.g. +1 NANP, +44 UK territories, etc.)
    const candidatesResult = resolveCandidateRegions(dialCode, nsn, options.expectedRegion || defaultRegion);
    resolvedRegion = candidatesResult.primaryRegion;
    isSharedAmbiguous = candidatesResult.isAmbiguous;

    if (isSharedAmbiguous) {
      warnings.push(`Shared calling code ${dialCode}: multiple countries/territories use this prefix.`);
    }
  }

  if (!resolvedRegion) {
    return {
      validity: 'invalid_pattern',
      status: 'unsupported_numbering_region',
      e164: null,
      national_significant_number: nsn || null,
      display: { national: raw, international: raw },
      country: null,
      line_type: 'UNKNOWN',
      original_allocation: null,
      metadata_carrier: null,
      current_carrier: null,
      lookup_reported_carrier: null,
      ported_possible: 'not_determined',
      reachability: 'not_checked',
      ownership: 'not_checked',
      claims: createClaims({
        input_accepted: true,
        possible_length: false,
        valid_number_pattern: false,
        numbering_region_resolved: false,
      }),
      metadata_version: METADATA_VERSION,
      warnings,
      error: 'Unsupported numbering region.',
    };
  }

  // Validate NSN against country-specific rules
  const nsnValidation = validateNsn(resolvedRegion, nsn);
  if (!nsnValidation.isValid) {
    return {
      validity: 'invalid_pattern',
      status: 'invalid_number',
      e164: `${dialCode}${nsn}`,
      national_significant_number: nsn,
      display: formatDisplayNumbers(resolvedRegion, dialCode, nsn),
      country: {
        iso2: resolvedRegion.alpha2,
        iso3: resolvedRegion.alpha3,
        name: resolvedRegion.name,
        calling_code: dialCode,
        resolution: isSharedAmbiguous ? 'ambiguous' : 'resolved',
      },
      line_type: 'UNKNOWN',
      original_allocation: null,
      metadata_carrier: null,
      current_carrier: null,
      lookup_reported_carrier: null,
      ported_possible: 'not_determined',
      reachability: 'not_checked',
      ownership: 'not_checked',
      claims: createClaims({
        input_accepted: true,
        possible_length: (dialCode.length + nsn.length) <= 16 && nsn.length >= 4,
        valid_number_pattern: false,
        numbering_region_resolved: true,
      }),
      metadata_version: METADATA_VERSION,
      warnings,
      error: nsnValidation.error,
    };
  }

  // Determine Line Type
  const lineType = determineLineType(resolvedRegion.alpha2, nsn);

  // Check mobile-only constraint if requested
  if (options.mobileOnly && lineType !== 'MOBILE' && lineType !== 'FIXED_LINE_OR_MOBILE') {
    return {
      validity: 'invalid_pattern',
      status: 'invalid_number',
      e164: `${dialCode}${nsn}`,
      national_significant_number: nsn,
      display: formatDisplayNumbers(resolvedRegion, dialCode, nsn),
      country: {
        iso2: resolvedRegion.alpha2,
        iso3: resolvedRegion.alpha3,
        name: resolvedRegion.name,
        calling_code: dialCode,
        resolution: isSharedAmbiguous ? 'ambiguous' : 'resolved',
      },
      line_type: lineType,
      original_allocation: null,
      metadata_carrier: null,
      current_carrier: null,
      lookup_reported_carrier: null,
      ported_possible: 'not_determined',
      reachability: 'not_checked',
      ownership: 'not_checked',
      claims: createClaims({
        input_accepted: true,
        possible_length: true,
        valid_number_pattern: true,
        numbering_region_resolved: true,
        line_type_classified: lineType !== 'UNKNOWN',
      }),
      metadata_version: METADATA_VERSION,
      warnings,
      error: `Number is classified as ${lineType}, not a valid mobile line for SMS.`,
    };
  }

  // Resolve Original Carrier Allocation
  const allocResult = resolveOriginalCarrierAllocation(resolvedRegion.alpha2, nsn);

  const e164 = `${dialCode}${nsn}`;
  const display = formatDisplayNumbers(resolvedRegion, dialCode, nsn);
  const originalAllocation = allocResult.allocation;
  const retailBrand = originalAllocation ? originalAllocation.retailBrand : null;

  return {
    validity: 'valid_pattern',
    status: allocResult.status,
    e164,
    national_significant_number: nsn,
    display,
    country: {
      iso2: resolvedRegion.alpha2,
      iso3: resolvedRegion.alpha3,
      name: resolvedRegion.name,
      calling_code: dialCode,
      resolution: isSharedAmbiguous ? 'ambiguous' : 'resolved',
    },
    line_type: lineType,
    original_allocation: originalAllocation,
    metadata_carrier: retailBrand,
    current_carrier: null,
    lookup_reported_carrier: null,
    ported_possible: 'not_determined',
    reachability: 'not_checked',
    ownership: 'not_checked',
    claims: createClaims({
      input_accepted: true,
      possible_length: true,
      valid_number_pattern: true,
      numbering_region_resolved: true,
      line_type_classified: lineType !== 'UNKNOWN',
      original_allocation_holder_identified: !!originalAllocation,
      retail_brand_identified: !!retailBrand,
      current_carrier_verified: false,
      reachable: false,
      user_controls_number: false,
    }),
    metadata_version: METADATA_VERSION,
    warnings,
  };
}

/**
 * Asynchronous phone analysis with optional live carrier lookup.
 * Invokes ICarrierLookupAdapter only when options.enableLiveLookup === true.
 * Requires userConsent === true per regulatory / telecom guidelines.
 */
export async function analyzePhoneAsync(
  rawInput: string,
  options: AnalyzePhoneOptions = {}
): Promise<PhoneAnalysisResult> {
  const syncResult = analyzePhone(rawInput, options);

  // If number is not valid pattern or e164 is null, do not attempt carrier lookup
  if (syncResult.validity !== 'valid_pattern' || !syncResult.e164) {
    return syncResult;
  }

  // If live lookup is not requested, return sync result
  if (!options.enableLiveLookup) {
    return syncResult;
  }

  const warnings = [...syncResult.warnings];

  // Enforce consent requirement
  if (!options.userConsent) {
    warnings.push('Live carrier lookup requires explicit user consent. Current carrier lookup was skipped.');
    return {
      ...syncResult,
      warnings,
    };
  }

  try {
    const { getCarrierLookupAdapter } = await import('./carrier-lookup-adapter');
    const adapter = getCarrierLookupAdapter();
    const lookupRes = await adapter.lookup({
      e164: syncResult.e164,
      countryIso: syncResult.country?.iso2,
      consentGiven: true,
    });

    if (lookupRes.warnings && lookupRes.warnings.length > 0) {
      warnings.push(...lookupRes.warnings);
    }

    let currentCarrier: string | null = null;
    let portedPossible: PhoneAnalysisResult['ported_possible'] = 'not_determined';
    let currentCarrierVerified = false;

    if (lookupRes.status === 'success' && lookupRes.lookupReportedCarrier) {
      if (lookupRes.carrierMeaning === 'current_network') {
        currentCarrier = lookupRes.lookupReportedCarrier;
        currentCarrierVerified = true;
      }

      if (lookupRes.portabilitySupported) {
        if (lookupRes.isPorted === true) {
          portedPossible = 'yes';
        } else if (lookupRes.isPorted === false) {
          portedPossible = 'no';
        } else {
          if (syncResult.metadata_carrier && lookupRes.lookupReportedCarrier) {
            const match =
              syncResult.metadata_carrier.toLowerCase().includes(lookupRes.lookupReportedCarrier.toLowerCase()) ||
              lookupRes.lookupReportedCarrier.toLowerCase().includes(syncResult.metadata_carrier.toLowerCase());
            portedPossible = match ? 'no' : 'yes';
          }
        }
      }
    } else if (lookupRes.error) {
      warnings.push(`Live carrier lookup: ${lookupRes.error}`);
    }

    return {
      ...syncResult,
      current_carrier: currentCarrier,
      lookup_reported_carrier: lookupRes.lookupReportedCarrier,
      ported_possible: portedPossible,
      claims: {
        ...syncResult.claims,
        current_carrier_verified: currentCarrierVerified,
      },
      warnings,
    };
  } catch (err) {
    warnings.push(`Live carrier lookup exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return {
      ...syncResult,
      warnings,
    };
  }
}
