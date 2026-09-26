import { describe, it, expect } from 'vitest';
import { generateSampleRecipientsCsv, escapeCsvCell } from '../lib/sms/template-csv';

describe('template-csv utility', () => {
  it('generates CSV with only available recipients and empty variable columns', () => {
    const recipients = ['+256700111111', '+256700222222', '+256700333333'];
    const variables = ['firstName', 'orderId', 'amount'];

    const result = generateSampleRecipientsCsv({
      recipients,
      variables,
      sourceFilename: 'august_campaign.xlsx',
    });

    expect(result.recipientCount).toBe(3);
    expect(result.headers).toEqual(['Phone Number', 'firstName', 'orderId', 'amount']);
    expect(result.filename).toBe('august_campaign_template_3_recipients.csv');

    // Check rows: phone populated, all variables are empty strings
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0]).toEqual(['+256700111111', '', '', '']);
    expect(result.rows[1]).toEqual(['+256700222222', '', '', '']);
    expect(result.rows[2]).toEqual(['+256700333333', '', '', '']);

    // Check CSV string content
    expect(result.content.startsWith('\uFEFF')).toBe(true);
    expect(result.content).toContain('Phone Number,firstName,orderId,amount\r\n');
    expect(result.content).toContain('+256700111111,,,\r\n');
    expect(result.content).toContain('+256700222222,,,\r\n');
    expect(result.content).toContain('+256700333333,,,');
  });

  it('handles 142 detected recipients accurately matching source file length', () => {
    const recipients = Array.from({ length: 142 }, (_, i) => `+256700${(100000 + i).toString()}`);
    const variables = ['customerName', 'ticketNo'];

    const result = generateSampleRecipientsCsv({
      recipients,
      variables,
      sourceFilename: 'subscribers_142.csv',
    });

    expect(result.recipientCount).toBe(142);
    expect(result.rows).toHaveLength(142);
    expect(result.filename).toBe('subscribers_142_template_142_recipients.csv');

    // Verify first and last rows
    expect(result.rows[0]).toEqual(['+256700100000', '', '']);
    expect(result.rows[141]).toEqual(['+256700100141', '', '']);
  });

  it('deduplicates and cleans recipient phone numbers', () => {
    const recipients = [
      ' +256700111111 ',
      '+256700111111',
      '',
      '   ',
      '+256772222222',
    ];
    const variables = ['code'];

    const result = generateSampleRecipientsCsv({
      recipients,
      variables,
    });

    expect(result.recipientCount).toBe(2);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['+256700111111', '']);
    expect(result.rows[1]).toEqual(['+256772222222', '']);
    expect(result.filename).toBe('sms_recipients_template_2_recipients.csv');
  });

  it('strips curly braces if variables are passed with {{varName}} syntax', () => {
    const recipients = ['+256700123456'];
    const variables = ['{{firstName}}', '{{discountRate}}'];

    const result = generateSampleRecipientsCsv({
      recipients,
      variables,
    });

    expect(result.headers).toEqual(['Phone Number', 'firstName', 'discountRate']);
    expect(result.rows[0]).toEqual(['+256700123456', '', '']);
  });

  it('falls back to default columns and default number if no variables and no recipients provided', () => {
    const result = generateSampleRecipientsCsv({
      recipients: [],
      variables: [],
    });

    expect(result.recipientCount).toBe(1);
    expect(result.headers).toEqual(['Phone Number', 'First Name', 'Last Name', 'Reference Note']);
    expect(result.rows[0]).toEqual(['+256700123456', '', '', '']);
    expect(result.filename).toBe('sms_recipients_template_1_recipients.csv');
  });

  it('properly escapes commas, quotes, and newlines in cells', () => {
    expect(escapeCsvCell('Hello, World')).toBe('"Hello, World"');
    expect(escapeCsvCell('He said "Hi"')).toBe('"He said ""Hi"""');
    expect(escapeCsvCell('Line1\nLine2')).toBe('"Line1\nLine2"');
    expect(escapeCsvCell('+256700123456')).toBe('+256700123456');
  });
});
