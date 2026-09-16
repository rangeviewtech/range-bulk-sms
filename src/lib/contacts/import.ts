import { prisma } from '@/lib/prisma';
import { normalizePhoneNumber } from '@/lib/sms/normalizer';
import { ContactService } from './service';

export interface ImportResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  importedRecords: number;
  skippedRecords: number;
  errors: Array<{ row: number; field: string; error: string }>;
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
  
  async importRecords(userId: string, validRecords: Record<string, string>[], mapping: ColumnMapping, groupId?: string): Promise<ImportResult> {
    const importData = validRecords.map(record => {
      const phone = record[mapping.phone];
      const norm = normalizePhoneNumber(phone).normalized;
      
      return {
        userId,
        phone,
        normalizedPhone: norm,
        firstName: mapping.firstName ? record[mapping.firstName] : undefined,
        lastName: mapping.lastName ? record[mapping.lastName] : undefined,
        email: mapping.email ? record[mapping.email] : undefined,
      };
    });

    const result = await prisma.contact.createMany({
      data: importData,
      skipDuplicates: true 
    });

    if (groupId && result.count > 0) {
      const imported = await prisma.contact.findMany({
        where: { userId, normalizedPhone: { in: importData.map(d => d.normalizedPhone) } },
        select: { id: true }
      });
      await ContactService.addToGroup(imported.map(c => c.id), groupId);
    }

    return {
      totalRecords: validRecords.length,
      validRecords: validRecords.length,
      invalidRecords: 0, 
      duplicateRecords: validRecords.length - result.count,
      importedRecords: result.count,
      skippedRecords: validRecords.length - result.count,
      errors: []
    };
  }
};
