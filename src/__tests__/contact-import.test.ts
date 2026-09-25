import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    contactImport: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('ContactImportService & Invalid Contact Separation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('separates valid contacts from invalid formats and file duplicates', async () => {
    // Existing DB contacts: empty
    // @ts-expect-error Mocking prisma method
    prisma.contact.findMany.mockResolvedValue([]);
    // @ts-expect-error Mocking prisma method
    prisma.contact.createMany.mockResolvedValue({ count: 2 });

    const records = [
      { 'Phone': '+256701234567', 'First Name': 'John', 'Last Name': 'Doe', 'Email': 'john@example.com' },
      { 'Phone': '0709876543', 'First Name': 'Jane', 'Last Name': 'Smith', 'Email': 'jane@example.com' },
      { 'Phone': '+256701234567', 'First Name': 'Duplicate', 'Last Name': 'Row', 'Email': 'dup@example.com' },
      { 'Phone': '12345', 'First Name': 'Short', 'Last Name': 'Num', 'Email': 'short@example.com' },
      { 'Phone': 'invalid-phone', 'First Name': 'Alpha', 'Last Name': 'Num', 'Email': 'alpha@example.com' },
      { 'Phone': '', 'First Name': 'Empty', 'Last Name': 'Num', 'Email': 'empty@example.com' },
    ];

    const mapping = {
      phone: 'Phone',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
    };

    const result = await ContactImportService.importRecords(
      'user-123',
      records,
      mapping,
      undefined,
      'ACTIVE'
    );

    expect(result.totalRecords).toBe(6);
    expect(result.importedRecords).toBe(2);
    expect(result.duplicateRecords).toBe(1);
    expect(result.invalidRecords).toBe(3);
    expect(result.invalidContacts.length).toBe(3);

    // Verify invalid contacts structure and reasons
    const shortItem = result.invalidContacts.find(c => c.firstName === 'Short');
    expect(shortItem).toBeDefined();
    expect(shortItem?.phone).toBe('12345');
    expect(shortItem?.error).toBe('Invalid local number length');

    const emptyItem = result.invalidContacts.find(c => c.firstName === 'Empty');
    expect(emptyItem).toBeDefined();
    expect(emptyItem?.error).toBe('Missing phone number');

    const alphaItem = result.invalidContacts.find(c => c.firstName === 'Alpha');
    expect(alphaItem).toBeDefined();
    expect(alphaItem?.phone).toBe('invalid-phone');
  });

  it('detects existing database duplicates and skips them', async () => {
    // Existing DB contacts has +256701234567
    // @ts-expect-error Mocking prisma method
    prisma.contact.findMany.mockResolvedValue([
      { phoneNumber: '+256701234567' },
    ]);
    // @ts-expect-error Mocking prisma method
    prisma.contact.createMany.mockResolvedValue({ count: 1 });

    const records = [
      { 'Phone': '+256701234567', 'Name': 'Already Exists' },
      { 'Phone': '+256782000000', 'Name': 'Brand New' },
    ];

    const mapping = { phone: 'Phone', firstName: 'Name' };
    const result = await ContactImportService.importRecords('user-123', records, mapping);

    expect(result.totalRecords).toBe(2);
    expect(result.importedRecords).toBe(1);
    expect(result.duplicateRecords).toBe(1);
    expect(result.invalidRecords).toBe(0);
    expect(result.invalidContacts).toHaveLength(0);
  });

  it('associates imported contacts with broadcast group if groupId provided', async () => {
    // @ts-expect-error Mocking prisma method
    prisma.contact.findMany.mockResolvedValue([{ id: 'c-1' }]);
    // @ts-expect-error Mocking prisma method
    prisma.contact.createMany.mockResolvedValue({ count: 1 });
    // @ts-expect-error Mocking prisma method
    prisma.contactGroup.findUnique.mockResolvedValue({ id: 'group-xyz', userId: 'user-123' });
    // @ts-expect-error Mocking prisma method
    prisma.contactGroup.update.mockResolvedValue({});

    const records = [{ 'Phone': '+256700112233', 'Name': 'Group User' }];
    const mapping = { phone: 'Phone', firstName: 'Name' };

    const result = await ContactImportService.importRecords(
      'user-123',
      records,
      mapping,
      'group-xyz'
    );

    expect(result.importedRecords).toBe(1);
    expect(prisma.contactGroup.update).toHaveBeenCalledWith({
      where: { id: 'group-xyz' },
      data: {
        members: {
          create: [{ contactId: 'c-1' }],
        },
      },
    });
  });
});
