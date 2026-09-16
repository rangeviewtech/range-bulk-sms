interface NormalizationResult {
  original: string;
  normalized: string;
  countryCode: string;
  localNumber: string;
  isValid: boolean;
  error?: string;
}

export function extractCountryCode(phone: string): string | null {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+256') || cleaned.startsWith('256')) return '+256';
  if (cleaned.startsWith('+')) {
    const match = cleaned.match(/^(\+\d{1,4})/);
    return match ? match[1] : null;
  }
  return null;
}

export function normalizePhoneNumber(phone: string, defaultCountryCode: string = '+256'): NormalizationResult {
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = defaultCountryCode + cleaned.substring(1);
  } else if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('256')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = defaultCountryCode + cleaned;
    }
  }

  const countryCode = extractCountryCode(cleaned) || defaultCountryCode;
  const localNumber = cleaned.substring(countryCode.length);
  
  let isValid = true;
  let error: string | undefined = undefined;
  
  if (countryCode === '+256' && localNumber.length !== 9) {
    isValid = false;
    error = 'Uganda numbers must have 9 digits after country code';
  } else if (localNumber.length < 6 || localNumber.length > 14) {
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
