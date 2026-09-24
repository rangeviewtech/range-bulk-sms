/**
 * ITU-T E.164 Official Country Calling Codes Directory
 * 
 * Standardized calling codes for all global sovereign states and territories.
 * Calling codes strictly contain 1, 2, or 3 digits (per ITU-T Recommendation E.164).
 */

export interface CountryCodeMeta {
  code: string;
  digits: string;
  country: string;
  length: 1 | 2 | 3;
}

export interface PhoneCountryCodeValidation {
  isValid: boolean;
  isIncomplete?: boolean;
  countryCode?: string;
  countryName?: string;
  codeLength?: 1 | 2 | 3;
  digits?: string;
  localDigits?: string;
  error?: string;
}

export interface PhoneNumberValidationResult {
  isValid: boolean;
  normalized?: string;
  countryCode?: string;
  countryName?: string;
  localNumber?: string;
  error?: string;
}

// 1-Digit Calling Codes
const ONE_DIGIT_CODES: Record<string, string> = {
  '1': 'USA / Canada / Caribbean (NANP)',
  '7': 'Russia / Kazakhstan',
};

// 2-Digit Calling Codes
const TWO_DIGIT_CODES: Record<string, string> = {
  '20': 'Egypt',
  '27': 'South Africa',
  '30': 'Greece',
  '31': 'Netherlands',
  '32': 'Belgium',
  '33': 'France',
  '34': 'Spain',
  '36': 'Hungary',
  '39': 'Italy / Vatican City',
  '40': 'Romania',
  '41': 'Switzerland',
  '43': 'Austria',
  '44': 'United Kingdom',
  '45': 'Denmark',
  '46': 'Sweden',
  '47': 'Norway',
  '48': 'Poland',
  '49': 'Germany',
  '51': 'Peru',
  '52': 'Mexico',
  '53': 'Cuba',
  '54': 'Argentina',
  '55': 'Brazil',
  '56': 'Chile',
  '57': 'Colombia',
  '58': 'Venezuela',
  '60': 'Malaysia',
  '61': 'Australia / Christmas Island',
  '62': 'Indonesia',
  '63': 'Philippines',
  '64': 'New Zealand',
  '65': 'Singapore',
  '66': 'Thailand',
  '81': 'Japan',
  '82': 'South Korea',
  '84': 'Vietnam',
  '86': 'China',
  '90': 'Turkey',
  '91': 'India',
  '92': 'Pakistan',
  '93': 'Afghanistan',
  '94': 'Sri Lanka',
  '95': 'Myanmar',
  '98': 'Iran',
};

// 3-Digit Calling Codes
const THREE_DIGIT_CODES: Record<string, string> = {
  // Zone 2 - Africa & Atlantic
  '211': 'South Sudan',
  '212': 'Morocco / Western Sahara',
  '213': 'Algeria',
  '216': 'Tunisia',
  '218': 'Libya',
  '220': 'Gambia',
  '221': 'Senegal',
  '222': 'Mauritania',
  '223': 'Mali',
  '224': 'Guinea',
  '225': 'Ivory Coast',
  '226': 'Burkina Faso',
  '227': 'Niger',
  '228': 'Togo',
  '229': 'Benin',
  '230': 'Mauritius',
  '231': 'Liberia',
  '232': 'Sierra Leone',
  '233': 'Ghana',
  '234': 'Nigeria',
  '235': 'Chad',
  '236': 'Central African Republic',
  '237': 'Cameroon',
  '238': 'Cape Verde',
  '239': 'São Tomé and Príncipe',
  '240': 'Equatorial Guinea',
  '241': 'Gabon',
  '242': 'Republic of the Congo',
  '243': 'DR Congo',
  '244': 'Angola',
  '245': 'Guinea-Bissau',
  '246': 'British Indian Ocean Territory',
  '247': 'Ascension Island',
  '248': 'Seychelles',
  '249': 'Sudan',
  '250': 'Rwanda',
  '251': 'Ethiopia',
  '252': 'Somalia',
  '253': 'Djibouti',
  '254': 'Kenya',
  '255': 'Tanzania',
  '256': 'Uganda',
  '257': 'Burundi',
  '258': 'Mozambique',
  '260': 'Zambia',
  '261': 'Madagascar',
  '262': 'Réunion / Mayotte',
  '263': 'Zimbabwe',
  '264': 'Namibia',
  '265': 'Malawi',
  '266': 'Lesotho',
  '267': 'Botswana',
  '268': 'Eswatini',
  '269': 'Comoros',
  '290': 'Saint Helena',
  '291': 'Eritrea',
  '297': 'Aruba',
  '298': 'Faroe Islands',
  '299': 'Greenland',

  // Zone 3 & 4 - Europe
  '350': 'Gibraltar',
  '351': 'Portugal',
  '352': 'Luxembourg',
  '353': 'Ireland',
  '354': 'Iceland',
  '355': 'Albania',
  '356': 'Malta',
  '357': 'Cyprus',
  '358': 'Finland / Åland Islands',
  '359': 'Bulgaria',
  '370': 'Lithuania',
  '371': 'Latvia',
  '372': 'Estonia',
  '373': 'Moldova',
  '374': 'Armenia',
  '375': 'Belarus',
  '376': 'Andorra',
  '377': 'Monaco',
  '378': 'San Marino',
  '379': 'Vatican City',
  '380': 'Ukraine',
  '381': 'Serbia',
  '382': 'Montenegro',
  '383': 'Kosovo',
  '385': 'Croatia',
  '386': 'Slovenia',
  '387': 'Bosnia and Herzegovina',
  '389': 'North Macedonia',
  '420': 'Czech Republic',
  '421': 'Slovakia',
  '423': 'Liechtenstein',

  // Zone 5 - South & Central America, Caribbean
  '500': 'Falkland Islands',
  '501': 'Belize',
  '502': 'Guatemala',
  '503': 'El Salvador',
  '504': 'Honduras',
  '505': 'Nicaragua',
  '506': 'Costa Rica',
  '507': 'Panama',
  '508': 'Saint Pierre and Miquelon',
  '509': 'Haiti',
  '590': 'Guadeloupe / Saint Martin',
  '591': 'Bolivia',
  '592': 'Guyana',
  '593': 'Ecuador',
  '594': 'French Guiana',
  '595': 'Paraguay',
  '596': 'Martinique',
  '597': 'Suriname',
  '598': 'Uruguay',
  '599': 'Caribbean Netherlands / Curaçao',

  // Zone 6 - Southeast Asia & Oceania
  '670': 'East Timor',
  '672': 'Norfolk Island',
  '673': 'Brunei',
  '674': 'Nauru',
  '675': 'Papua New Guinea',
  '676': 'Tonga',
  '677': 'Solomon Islands',
  '678': 'Vanuatu',
  '679': 'Fiji',
  '680': 'Palau',
  '681': 'Wallis and Futuna',
  '682': 'Cook Islands',
  '683': 'Niue',
  '685': 'Samoa',
  '686': 'Kiribati',
  '687': 'New Caledonia',
  '688': 'Tuvalu',
  '689': 'French Polynesia',
  '690': 'Tokelau',
  '691': 'Micronesia',
  '692': 'Marshall Islands',

  // Zone 8 - East Asia & Special Services
  '850': 'North Korea',
  '852': 'Hong Kong',
  '853': 'Macau',
  '855': 'Cambodia',
  '856': 'Laos',
  '880': 'Bangladesh',
  '886': 'Taiwan',

  // Zone 9 - Middle East, Central & South Asia
  '960': 'Maldives',
  '961': 'Lebanon',
  '962': 'Jordan',
  '963': 'Syria',
  '964': 'Iraq',
  '965': 'Kuwait',
  '966': 'Saudi Arabia',
  '967': 'Yemen',
  '968': 'Oman',
  '970': 'Palestine',
  '971': 'United Arab Emirates',
  '972': 'Israel',
  '973': 'Bahrain',
  '974': 'Qatar',
  '975': 'Bhutan',
  '976': 'Mongolia',
  '977': 'Nepal',
  '992': 'Tajikistan',
  '993': 'Turkmenistan',
  '994': 'Azerbaijan',
  '995': 'Georgia',
  '996': 'Kyrgyzstan',
  '998': 'Uzbekistan',
};

// Master lookup dictionary
export const ALL_COUNTRY_CODES: Record<string, CountryCodeMeta> = {};

for (const [digits, country] of Object.entries(ONE_DIGIT_CODES)) {
  ALL_COUNTRY_CODES[digits] = { code: `+${digits}`, digits, country, length: 1 };
}
for (const [digits, country] of Object.entries(TWO_DIGIT_CODES)) {
  ALL_COUNTRY_CODES[digits] = { code: `+${digits}`, digits, country, length: 2 };
}
for (const [digits, country] of Object.entries(THREE_DIGIT_CODES)) {
  ALL_COUNTRY_CODES[digits] = { code: `+${digits}`, digits, country, length: 3 };
}

/**
 * Checks whether any allocated country calling code starts with the given prefix.
 */
export function hasCountryCodeStartingWith(prefix: string): boolean {
  if (!prefix) return false;
  if (prefix.startsWith('0')) return false;
  if (ALL_COUNTRY_CODES[prefix]) return true;
  return Object.keys(ALL_COUNTRY_CODES).some((code) => code.startsWith(prefix));
}

/**
 * Extracts the exact ITU-T E.164 country calling code using longest prefix matching
 * (checking 3 digits, then 2 digits, then 1 digit).
 * 
 * Returns the country code with leading '+' (e.g. '+256', '+44', '+1') or null if invalid.
 */
export function extractValidCountryCode(phone: string): string | null {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (!cleaned) return null;

  // Handle local Uganda number starting with 0 (e.g. 0700123456)
  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    return '+256';
  }

  const digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
  if (!digits || digits.startsWith('0')) return null;

  // 1. Longest match: 3-digit country code
  if (digits.length >= 3) {
    const code3 = digits.slice(0, 3);
    if (THREE_DIGIT_CODES[code3]) {
      return `+${code3}`;
    }
  }

  // 2. 2-digit country code
  if (digits.length >= 2) {
    const code2 = digits.slice(0, 2);
    if (TWO_DIGIT_CODES[code2]) {
      return `+${code2}`;
    }
  }

  // 3. 1-digit country code
  if (digits.length >= 1) {
    const code1 = digits.slice(0, 1);
    if (ONE_DIGIT_CODES[code1]) {
      return `+${code1}`;
    }
  }

  return null;
}

/**
 * Validates the country code of an entered phone number.
 * 
 * Detects whether the first 1, 2, or 3 numbers represent a valid country code.
 * If 3 numbers have been entered and no 3-digit, 2-digit, or 1-digit country code matches,
 * it returns a descriptive error highlighting the invalid country code.
 */
export function validatePhoneCountryCode(phone: string): PhoneCountryCodeValidation {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, isIncomplete: true, error: 'Phone number is required' };
  }

  // Handle Ugandan local phone format (e.g. 0700123456 or 0390123456)
  if (trimmed.startsWith('0')) {
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (/^0[37]\d{8}$/.test(digitsOnly)) {
      return {
        isValid: true,
        countryCode: '+256',
        countryName: 'Uganda',
        codeLength: 3,
        digits: digitsOnly,
        localDigits: digitsOnly.slice(1),
      };
    }
    // If it starts with 0 but is not a valid Ugandan local format
    if (digitsOnly.length < 10) {
      return {
        isValid: false,
        isIncomplete: true,
        countryCode: '+256',
        countryName: 'Uganda',
        error: 'Uganda local numbers must start with 07 or 03 and have 10 digits (e.g. 0700123456)',
      };
    }
    return {
      isValid: false,
      countryCode: '+256',
      error: `Invalid local format: "${trimmed}". Ugandan numbers must start with 07 or 03.`,
    };
  }

  // Number with leading + or raw international digits
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^0-9]/g, '');

  if (digits.length === 0) {
    return { isValid: false, isIncomplete: true, error: 'Please enter digits after "+"' };
  }

  // Country codes cannot start with 0
  if (digits.startsWith('0')) {
    const invalidPrefix = `+${digits.slice(0, Math.min(3, digits.length))}`;
    return {
      isValid: false,
      countryCode: invalidPrefix,
      error: `Invalid country code: "${invalidPrefix}" is invalid. Country calling codes cannot start with 0.`,
    };
  }

  // Check 3-digit match
  if (digits.length >= 3) {
    const c3 = digits.slice(0, 3);
    if (THREE_DIGIT_CODES[c3]) {
      return {
        isValid: true,
        countryCode: `+${c3}`,
        countryName: THREE_DIGIT_CODES[c3],
        codeLength: 3,
        digits,
        localDigits: digits.slice(3),
      };
    }
  }

  // Check 2-digit match
  if (digits.length >= 2) {
    const c2 = digits.slice(0, 2);
    if (TWO_DIGIT_CODES[c2]) {
      return {
        isValid: true,
        countryCode: `+${c2}`,
        countryName: TWO_DIGIT_CODES[c2],
        codeLength: 2,
        digits,
        localDigits: digits.slice(2),
      };
    }
  }

  // Check 1-digit match
  if (digits.length >= 1) {
    const c1 = digits.slice(0, 1);
    if (ONE_DIGIT_CODES[c1]) {
      return {
        isValid: true,
        countryCode: `+${c1}`,
        countryName: ONE_DIGIT_CODES[c1],
        codeLength: 1,
        digits,
        localDigits: digits.slice(1),
      };
    }
  }

  // At this point, no 1-digit, 2-digit, or 3-digit code matched!
  if (digits.length >= 3) {
    const entered3 = digits.slice(0, 3);
    const displayPrefix = hasPlus ? `+${entered3}` : entered3;
    return {
      isValid: false,
      countryCode: `+${entered3}`,
      error: `Invalid country code: "${displayPrefix}" does not represent any country calling code. Country codes have 1, 2, or 3 digits (e.g. +256, +254, +44, +1).`,
    };
  }

  // Less than 3 digits entered: check if this 1 or 2-digit prefix could ever start any valid country code
  const canMatchAny = hasCountryCodeStartingWith(digits);
  if (!canMatchAny) {
    const displayPrefix = hasPlus ? `+${digits}` : digits;
    return {
      isValid: false,
      countryCode: `+${digits}`,
      error: `Invalid country code: "${displayPrefix}" does not represent any country calling code.`,
    };
  }

  // Incomplete prefix that could potentially match once 3 digits are entered
  return {
    isValid: false,
    isIncomplete: true,
    error: 'Incomplete country code. Country codes have 1, 2, or 3 digits (e.g. +256, +254, +44, +1).',
  };
}

/**
 * Validates a full phone number including both country calling code and local digits length.
 */
export function validatePhoneNumber(phone: string, defaultCountryCode: string = '+256'): PhoneNumberValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Validate country code first
  const ccResult = validatePhoneCountryCode(trimmed);
  if (!ccResult.isValid) {
    return {
      isValid: false,
      countryCode: ccResult.countryCode,
      countryName: ccResult.countryName,
      error: ccResult.error,
    };
  }

  const countryCode = ccResult.countryCode || defaultCountryCode;
  const localDigits = ccResult.localDigits || '';

  // Specific national length validation
  if (countryCode === '+256') {
    if (localDigits.length !== 9) {
      return {
        isValid: false,
        countryCode,
        countryName: ccResult.countryName,
        localNumber: localDigits,
        error: `Uganda (+256) numbers must have 9 digits after country code (e.g. +256700123456)`,
      };
    }
  } else if (localDigits.length < 5 || localDigits.length > 14) {
    return {
      isValid: false,
      countryCode,
      countryName: ccResult.countryName,
      localNumber: localDigits,
      error: `Invalid local phone number length for ${ccResult.countryName || countryCode}`,
    };
  }

  return {
    isValid: true,
    normalized: `${countryCode}${localDigits}`,
    countryCode,
    countryName: ccResult.countryName,
    localNumber: localDigits,
  };
}
