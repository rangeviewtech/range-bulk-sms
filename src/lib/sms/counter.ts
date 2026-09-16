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
