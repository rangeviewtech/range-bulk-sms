import { describe, it, expect, vi, beforeEach } from 'vitest';
import readXlsxFile from 'read-excel-file/node';
import writeXlsxFile from 'write-excel-file/node';
import { ContactImportService } from '@/lib/contacts/import';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contact: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
    contactGroupMember: {
      createMany: vi.fn(),
    },
    contactGroup: {
      update: vi.fn(),
    },
    contactImport: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Excel (.xlsx) Import & Parsing Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads and parses Excel (.xlsx) buffer into contact rows correctly', async () => {
    const HEADER_ROW = [
      { value: 'Phone Number', fontWeight: 'bold' as const },
      { value: 'First Name', fontWeight: 'bold' as const },
      { value: 'Last Name', fontWeight: 'bold' as const },
      { value: 'Email Address', fontWeight: 'bold' as const },
    ];

    const DATA_ROWS = [
      [
        { type: String, value: '+256700123456' },
        { type: String, value: 'John' },
        { type: String, value: 'Mukasa' },
        { type: String, value: 'john.mukasa@example.com' },
      ],
      [
        { type: String, value: '+254712345678' },
        { type: String, value: 'Sarah' },
        { type: String, value: 'Nsubuga' },
        { type: String, value: 'sarah.n@example.com' },
      ],
      [
        // Numeric phone value representation in Excel
        { type: Number, value: 256782112233 },
        { type: String, value: 'David' },
        { type: String, value: 'Kato' },
        { type: String, value: 'david.kato@example.com' },
      ],
    ];

    const writeResult = await writeXlsxFile([HEADER_ROW, ...DATA_ROWS]);
    const buffer = await writeResult.toBuffer();

    const rawResult = await readXlsxFile(buffer);
    // @ts-expect-error rawResult contains data array on sheet object
    const rows: unknown[][] = rawResult[0]?.data || rawResult;
    expect(rows.length).toBe(4);

    const headers = rows[0].map((h) => String(h ?? '').trim());
    expect(headers).toEqual(['Phone Number', 'First Name', 'Last Name', 'Email Address']);

    const parsedRecords: Record<string, string>[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const record: Record<string, string> = {};
      headers.forEach((h, colIdx) => {
        record[h] = String(row[colIdx] ?? '').trim();
      });
      parsedRecords.push(record);
    }

    expect(parsedRecords.length).toBe(3);
    expect(parsedRecords[0]['Phone Number']).toBe('+256700123456');
    expect(parsedRecords[0]['First Name']).toBe('John');
    expect(parsedRecords[2]['Phone Number']).toBe('256782112233');

    // Verify parsed records import through ContactImportService
    // @ts-expect-error Mocking prisma method
    prisma.contact.createMany.mockResolvedValue({ count: 3 });

    const importResult = await ContactImportService.importRecords(
      'user-test-1',
      parsedRecords,
      {
        phone: 'Phone Number',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
      },
      undefined,
      'ACTIVE'
    );

    expect(importResult.totalRecords).toBe(3);
    expect(importResult.importedRecords).toBe(3);
    expect(importResult.invalidRecords).toBe(0);
    expect(importResult.duplicateRecords).toBe(0);
  });

  it('separates invalid numbers from Excel rows and reports exact reasons', async () => {
    const HEADER_ROW = [
      { value: 'Phone', fontWeight: 'bold' as const },
      { value: 'Name', fontWeight: 'bold' as const },
    ];

    const DATA_ROWS = [
      [
        { type: String, value: '+256700112233' },
        { type: String, value: 'Valid Contact' },
      ],
      [
        { type: String, value: '123' },
        { type: String, value: 'Invalid Short Number' },
      ],
      [
        { type: String, value: '' },
        { type: String, value: 'Empty Number' },
      ],
    ];

    const writeResult = await writeXlsxFile([HEADER_ROW, ...DATA_ROWS]);
    const buffer = await writeResult.toBuffer();

    const rawResult = await readXlsxFile(buffer);
    // @ts-expect-error rawResult contains data array on sheet object
    const rows: unknown[][] = rawResult[0]?.data || rawResult;
    const headers = rows[0].map((h) => String(h ?? '').trim());

    const parsedRecords: Record<string, string>[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const record: Record<string, string> = {};
      headers.forEach((h, colIdx) => {
        record[h] = String(row[colIdx] ?? '').trim();
      });
      parsedRecords.push(record);
    }

    // @ts-expect-error Mocking prisma method
    prisma.contact.createMany.mockResolvedValue({ count: 1 });

    const result = await ContactImportService.importRecords(
      'user-test-1',
      parsedRecords,
      { phone: 'Phone', firstName: 'Name' }
    );

    expect(result.totalRecords).toBe(3);
    expect(result.importedRecords).toBe(1);
    expect(result.invalidRecords).toBe(2);
    expect(result.invalidContacts.length).toBe(2);
    expect(result.invalidContacts[0].error).toBe('Invalid local number length');
    expect(result.invalidContacts[1].error).toBe('Missing phone number');
  });
});
