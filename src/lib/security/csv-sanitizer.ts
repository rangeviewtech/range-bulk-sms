/**
 * Neutralizes CSV Formula Injection (CWE-1236) and safely escapes CSV fields.
 *
 * Spreadsheet engines (Excel, LibreOffice, Google Sheets) execute cells starting
 * with '=', '+', '-', '@', '\t', or '\r' as formulas, which can lead to remote command
 * execution or data exfiltration.
 */

const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Neutralizes dangerous formula trigger characters in a single value.
 */
export function sanitizeCsvField(val: unknown): string {
  if (val === null || val === undefined) {
    return '""';
  }

  let str = String(val);

  // If string starts with a formula trigger, prefix with a single quote to force text interpretation
  if (FORMULA_TRIGGERS.some((prefix) => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  const escaped = str.replace(/"/g, '""');

  // Enclose in quotes
  return `"${escaped}"`;
}

/**
 * Converts an array of objects or rows into a sanitized CSV string.
 */
export function buildSanitizedCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const sanitizedHeaders = headers.map((h) => sanitizeCsvField(h)).join(',');
  const sanitizedRows = rows.map((row) => row.map((cell) => sanitizeCsvField(cell)).join(','));
  return [sanitizedHeaders, ...sanitizedRows].join('\n');
}
