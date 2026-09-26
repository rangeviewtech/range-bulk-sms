interface SmsCountResult {
  characters: number;
  remainingCharacters: number;
  encoding: 'GSM-7' | 'Unicode';
  segments: number;
  maxCharsPerSegment: number;
  recipientCount: number;
  totalUnits: number;
  estimatedCost: number;
  isMultipart: boolean;
}

const GSM_BASIC = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXTENDED = "^{}\\[~]|€";

export function getGsmCharacterSet(): Set<string> {
  return new Set([...GSM_BASIC, ...GSM_EXTENDED]);
}

export function detectEncoding(message: string): 'GSM-7' | 'Unicode' {
  const gsmSet = getGsmCharacterSet();
  for (let i = 0; i < message.length; i++) {
    if (!gsmSet.has(message[i])) {
      return 'Unicode';
    }
  }
  return 'GSM-7';
}

function getCharacterCount(message: string): number {
  let count = 0;
  for (let i = 0; i < message.length; i++) {
    if (GSM_EXTENDED.includes(message[i])) {
      count += 2;
    } else {
      count += 1;
    }
  }
  return count;
}

export function calculateSegments(message: string): number {
  const encoding = detectEncoding(message);
  const chars = encoding === 'GSM-7' ? getCharacterCount(message) : message.length;

  if (encoding === 'GSM-7') {
    if (chars <= 160) return 1;
    return Math.ceil(chars / 153);
  } else {
    if (chars <= 70) return 1;
    return Math.ceil(chars / 67);
  }
}

export function countSms(message: string, recipientCount: number = 1, costPerUnit: number = 0): SmsCountResult {
  const encoding = detectEncoding(message);
  const chars = encoding === 'GSM-7' ? getCharacterCount(message) : message.length;
  
  let maxCharsPerSegment = 160;
  let segments = 1;

  if (encoding === 'GSM-7') {
    if (chars > 160) {
      maxCharsPerSegment = 153;
      segments = Math.ceil(chars / 153);
    }
  } else {
    maxCharsPerSegment = 70;
    if (chars > 70) {
      maxCharsPerSegment = 67;
      segments = Math.ceil(chars / 67);
    }
  }

  const isMultipart = segments > 1;
  const remainingCharacters = (segments * maxCharsPerSegment) - chars;
  const totalUnits = segments * recipientCount;
  const estimatedCost = totalUnits * costPerUnit;

  return {
    characters: chars,
    remainingCharacters,
    encoding,
    segments,
    maxCharsPerSegment,
    recipientCount,
    totalUnits,
    estimatedCost,
    isMultipart,
  };
}

export function getNonGsmCharacters(message: string): string[] {
  const gsmSet = getGsmCharacterSet();
  const nonGsm = new Set<string>();
  for (let i = 0; i < message.length; i++) {
    const char = message[i];
    if (!gsmSet.has(char)) {
      nonGsm.add(char);
    }
  }
  return Array.from(nonGsm);
}

export function cleanToGsm7(message: string): { cleaned: string; replacedCount: number } {
  const map: Record<string, string> = {
    '“': '"',
    '”': '"',
    '„': '"',
    '«': '"',
    '»': '"',
    '‘': "'",
    '’': "'",
    '‚': "'",
    '‹': "'",
    '›': "'",
    '`': "'",
    '—': '-',
    '–': '-',
    '−': '-',
    '…': '...',
    '\u00A0': ' ',
    '\u2002': ' ',
    '\u2003': ' ',
    '\u2009': ' ',
    '\u200B': '',
    '•': '*',
    '·': '*',
    '™': '(TM)',
    '©': '(C)',
    '®': '(R)',
    'á': 'a',
    'â': 'a',
    'ã': 'a',
    'ê': 'e',
    'ë': 'e',
    'í': 'i',
    'î': 'i',
    'ï': 'i',
    'ó': 'o',
    'ô': 'o',
    'õ': 'o',
    'ú': 'u',
    'û': 'u',
    'Á': 'A',
    'À': 'A',
    'Â': 'A',
    'Ã': 'A',
    'Ê': 'E',
    'Ë': 'E',
    'Í': 'I',
    'Ì': 'I',
    'Î': 'I',
    'Ï': 'I',
    'Ó': 'O',
    'Ò': 'O',
    'Ô': 'O',
    'Õ': 'O',
    'Ú': 'U',
    'Ù': 'U',
    'Û': 'U',
  };

  let replacedCount = 0;
  let cleaned = '';
  const gsmSet = getGsmCharacterSet();

  for (let i = 0; i < message.length; i++) {
    const char = message[i];
    if (map[char] !== undefined) {
      cleaned += map[char];
      replacedCount++;
    } else if (gsmSet.has(char)) {
      cleaned += char;
    } else {
      const normalized = char.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
      if (normalized && normalized !== char && Array.from(normalized).every((c) => gsmSet.has(c))) {
        cleaned += normalized;
        replacedCount++;
      } else {
        cleaned += char;
      }
    }
  }

  return { cleaned, replacedCount };
}

