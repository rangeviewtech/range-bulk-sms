/**
 * Utility functions for generating dynamic, personalized SMS CSV templates
 * with only the available recipients pre-populated and variable columns left empty
 * for users to fill in.
 */

export interface GenerateSampleCsvOptions {
  recipients: string[];
  variables?: string[];
  sourceFilename?: string | null;
  defaultFallbackPhone?: string;
}

export interface GeneratedCsvResult {
  content: string;
  filename: string;
  recipientCount: number;
  headers: string[];
  rows: string[][];
}

/**
 * Escapes CSV cell content according to RFC 4180
 */
export function escapeCsvCell(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Generates sample CSV template string prefilled with only available recipients
 * and empty strings in all variable columns.
 */
export function generateSampleRecipientsCsv({
  recipients,
  variables = [],
  sourceFilename,
  defaultFallbackPhone = '+256700123456',
}: GenerateSampleCsvOptions): GeneratedCsvResult {
  const cleanVariables = Array.from(
    new Set(
      variables
        .map((v) => v.trim().replace(/^\{\{|\}\}$/g, ''))
        .filter(Boolean)
    )
  );

  const hasVars = cleanVariables.length > 0;
  const headers = hasVars
    ? ['Phone Number', ...cleanVariables]
    : ['Phone Number', 'First Name', 'Last Name', 'Reference Note'];

  // Clean and filter available recipients
  const uniqueRecipients = Array.from(
    new Set(recipients.map((r) => r.trim()).filter(Boolean))
  );

  const targetRecipients =
    uniqueRecipients.length > 0 ? uniqueRecipients : [defaultFallbackPhone];

  // Every variable column is empty per requirement: only recipient has the phone number
  const rows = targetRecipients.map((phone) => {
    if (hasVars) {
      return [phone, ...cleanVariables.map(() => '')];
    }
    return [phone, '', '', ''];
  });

  const rawCsv = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ].join('\r\n');

  // UTF-8 Byte Order Mark (\uFEFF) ensures Excel opens multilingual characters correctly
  const content = '\uFEFF' + rawCsv;

  const baseName = sourceFilename
    ? sourceFilename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
    : 'sms_recipients';
  const filename = `${baseName}_template_${targetRecipients.length}_recipients.csv`;

  return {
    content,
    filename,
    recipientCount: targetRecipients.length,
    headers,
    rows,
  };
}

/**
 * Triggers browser download for a generated CSV string
 */
export function triggerCsvDownload(content: string, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
