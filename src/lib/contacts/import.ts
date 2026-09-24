import { prisma } from '@/lib/prisma';
import { normalizePhoneNumber } from '@/lib/sms/normalizer';
import { ContactService } from './service';

export interface InvalidContactItem {
  row: number;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  error: string;
}

export interface ImportResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  importedRecords: number;
  skippedRecords: number;
  errors: Array<{ row: number; field: string; error: string }>;
  invalidContacts: InvalidContactItem[];
}

export interface ColumnMapping {
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: string | undefined;
}

export const ContactImportService = {
  async parseFile(content: string, delimiter?: string) {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) throw new Error('File is empty');

    if (!delimiter) {
      const firstLine = lines[0];
      if (firstLine.includes('\t')) delimiter = '\t';
      else if (firstLine.includes(';')) delimiter = ';';
      else delimiter = ',';
    }

    const headers = lines[0].split(delimiter).map(h => h.trim());
    
    const preview: Record<string, string>[] = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      const values = lines[i].split(delimiter).map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      preview.push(row);
    }

    return {
      headers,
      preview,
      totalRows: lines.length - 1
    };
  },
  
  async validateRecords(records: Record<string, string>[], mapping: ColumnMapping, userId: string) {
    const valid: Record<string, string>[] = [];
    const invalid: Array<{ row: number; errors: string[] }> = [];
    
    const phoneList: string[] = [];
    const seenPhones = new Set<string>();

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const phoneCol = mapping.phone;
      const phoneVal = record[phoneCol];
      
      const errors: string[] = [];
      if (!phoneVal) {
        errors.push('Missing phone number');
      } else {
        const norm = normalizePhoneNumber(phoneVal);
        if (!norm.isValid) {
          errors.push('Invalid phone number: ' + norm.error);
        } else {
          if (seenPhones.has(norm.normalized)) {
            errors.push('Duplicate phone number in file');
          } else {
            seenPhones.add(norm.normalized);
            phoneList.push(norm.normalized);
          }
        }
      }

      if (errors.length > 0) {
        invalid.push({ row: i + 1, errors });
      } else {
        valid.push(record);
      }
    }

    const dbDuplicates = await ContactService.findDuplicates(userId, phoneList);

    return {
      valid,
      invalid,
      duplicates: dbDuplicates
    };
  },
  
  async importRecords(
    userId: string,
    records: Record<string, string>[],
    mapping: ColumnMapping,
    groupId?: string,
    status: 'ACTIVE' | 'OPTED_OUT' = 'ACTIVE'
  ): Promise<ImportResult> {
    const isOptedOut = status === 'OPTED_OUT';
    const validImportData: Array<{
      userId: string;
      phone: string;
      normalizedPhone: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      optedOut: boolean;
    }> = [];
    const invalidContacts: InvalidContactItem[] = [];
    const seenPhones = new Set<string>();
    let fileDuplicateCount = 0;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rawPhone = (record[mapping.phone] || '').trim();
      const firstName = mapping.firstName && record[mapping.firstName] ? record[mapping.firstName].trim() : undefined;
      const lastName = mapping.lastName && record[mapping.lastName] ? record[mapping.lastName].trim() : undefined;
      const email = mapping.email && record[mapping.email] ? record[mapping.email].trim() : undefined;

      if (!rawPhone) {
        invalidContacts.push({
          row: i + 1,
          phone: '',
          firstName,
          lastName,
          email,
          error: 'Missing phone number',
        });
        continue;
      }

      const norm = normalizePhoneNumber(rawPhone);
      if (!norm.isValid) {
        invalidContacts.push({
          row: i + 1,
          phone: rawPhone,
          firstName,
          lastName,
          email,
          error: norm.error || 'Invalid phone number format',
        });
        continue;
      }

      if (seenPhones.has(norm.normalized)) {
        fileDuplicateCount++;
        continue;
      }

      seenPhones.add(norm.normalized);
      validImportData.push({
        userId,
        phone: rawPhone,
        normalizedPhone: norm.normalized,
        firstName,
        lastName,
        email,
        optedOut: isOptedOut,
      });
    }

    let importedCount = 0;
    if (validImportData.length > 0) {
      const result = await prisma.contact.createMany({
        data: validImportData,
        skipDuplicates: true,
      });
      importedCount = result.count;

      if (groupId && importedCount > 0) {
        const imported = await prisma.contact.findMany({
          where: { userId, normalizedPhone: { in: validImportData.map(d => d.normalizedPhone) } },
          select: { id: true }
        });
        await ContactService.addToGroup(userId, imported.map(c => c.id), groupId);
      }
    }

    const duplicateCount = fileDuplicateCount + (validImportData.length - importedCount);

    return {
      totalRecords: records.length,
      validRecords: validImportData.length,
      invalidRecords: invalidContacts.length,
      duplicateRecords: duplicateCount,
      importedRecords: importedCount,
      skippedRecords: duplicateCount + invalidContacts.length,
      errors: invalidContacts.map(inv => ({ row: inv.row, field: 'phone', error: inv.error })),
      invalidContacts,
    };
  }
};
