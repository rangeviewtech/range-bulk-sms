import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { successResponse, errorResponse } from '@/lib/api';
import { importMappingSchema } from '@/lib/validations/contacts';
import { ContactImportService } from '@/lib/contacts/import';

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission('contacts.import');
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid JSON payload', 400);
    }

    // Direct batch records import
    if (Array.isArray(body.records) && body.records.length > 0 && body.mapping?.phone) {
      if (body.records.length > 5000) {
        return errorResponse('Batch import exceeds maximum allowed limit of 5,000 records per request', 400);
      }
      const mapping = body.mapping;
      const groupId = typeof body.groupId === 'string' && body.groupId.trim().length > 0 ? body.groupId.trim() : undefined;
      const result = await ContactImportService.importRecords(
        session.userId,
        body.records,
        mapping,
        groupId,
        body.status === 'OPTED_OUT' ? 'OPTED_OUT' : 'ACTIVE'
      );
      return successResponse(result, `Successfully imported ${result.importedRecords} contacts`, 201);
    }

    const data = importMappingSchema.parse(body.mapping);

    const contactImport = await prisma.contactImport.create({
      data: {
        userId: session.userId,
        fileName: body.fileName || 'upload.csv',
        fileSize: body.fileSize || 0,
        columnMapping: data,
        status: 'PENDING'
      }
    });

    return successResponse(contactImport, 'Import job queued successfully', 201);
  } catch (error) {
    return errorResponse(error);
  }
}
