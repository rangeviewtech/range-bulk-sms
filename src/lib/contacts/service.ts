import { prisma } from '@/lib/prisma';
import { normalizePhoneNumber } from '@/lib/sms/normalizer';

export const ContactService = {
  async create(userId: string, data: { firstName?: string; lastName?: string; phone: string; email?: string; countryCode?: string; customFields?: import("@/generated/prisma/client").Prisma.InputJsonValue; groupIds?: string[] }) {
    const normalized = normalizePhoneNumber(data.phone, data.countryCode);
    if (!normalized.isValid) throw new Error('Invalid phone number: ' + normalized.error);

    return await prisma.contact.create({
      data: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        normalizedPhone: normalized.normalized,
        email: data.email,
        customFields: data.customFields ?? {},
        groups: data.groupIds ? {
          create: data.groupIds.map(id => ({ contactGroupId: id }))
        } : undefined
      }
    });
  },
  
  async findMany(userId: string, params: { page?: number; limit?: number; search?: string; groupId?: string; tagId?: string; optedOut?: boolean; blacklisted?: boolean }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: import("@/generated/prisma/client").Prisma.ContactWhereInput = { userId, deletedAt: null };
    if (params.optedOut !== undefined) where.optedOut = params.optedOut;
    if (params.blacklisted !== undefined) where.blacklisted = params.blacklisted;
    
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search } },
        { normalizedPhone: { contains: params.search } },
        { email: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    if (params.groupId) {
      where.groups = { some: { contactGroupId: params.groupId } };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, skip, take: limit }),
      prisma.contact.count({ where })
    ]);

    return { contacts, total, page, limit };
  },
  
  async findById(userId: string, contactId: string) {
    return await prisma.contact.findFirst({
      where: { id: contactId, userId, deletedAt: null }
    });
  },
  async update(userId: string, contactId: string, data: Partial<{ firstName: string; lastName: string; phone: string; email: string; customFields: Record<string, unknown>; optedOut: boolean; blacklisted: boolean }>) {
    const { customFields, ...rest } = data;
    const updateData: import("@/generated/prisma/client").Prisma.ContactUpdateInput = {
      ...rest,
      customFields: customFields as import("@/generated/prisma/client").Prisma.InputJsonValue | undefined,
    };
    if (data.phone) {
      const normalized = normalizePhoneNumber(data.phone);
      if (!normalized.isValid) throw new Error('Invalid phone number');
      updateData.normalizedPhone = normalized.normalized;
    }

    return await prisma.contact.update({
      where: { id: contactId, userId },
      data: updateData
    });
  },
  
  async delete(userId: string, contactId: string) {
    await prisma.contact.update({
      where: { id: contactId, userId },
      data: { deletedAt: new Date() }
    });
  },
  
  async deleteMany(userId: string, contactIds: string[]) {
    const result = await prisma.contact.updateMany({
      where: { id: { in: contactIds }, userId },
      data: { deletedAt: new Date() }
    });
    return result.count;
  },
  
  async addToGroup(contactIds: string[], groupId: string) {
    await prisma.contactGroup.update({
      where: { id: groupId },
      data: {
        members: {
          create: contactIds.map(id => ({ contactId: id }))
        }
      }
    });
    return contactIds.length;
  },
  
  async removeFromGroup(contactIds: string[], groupId: string) {
    await prisma.contactGroup.update({
      where: { id: groupId },
      data: {
        members: {
          delete: contactIds.map(id => ({ 
            contactId_contactGroupId: { contactId: id, contactGroupId: groupId }
          }))
        }
      }
    });
    return contactIds.length;
  },
  
  async findDuplicates(userId: string, phones: string[]) {
    const normalizedPhones = phones.map(p => {
      const norm = normalizePhoneNumber(p);
      return norm.isValid ? norm.normalized : p;
    });

    const duplicates = await prisma.contact.findMany({
      where: {
        userId,
        deletedAt: null,
        normalizedPhone: { in: normalizedPhones }
      },
      select: { normalizedPhone: true }
    });

    return duplicates.map(d => d.normalizedPhone);
  },
  
  async count(userId: string, params?: { groupId?: string; optedOut?: boolean }) {
    const where: import("@/generated/prisma/client").Prisma.ContactWhereInput = { userId, deletedAt: null };
    if (params?.groupId) where.groups = { some: { contactGroupId: params.groupId } };
    if (params?.optedOut !== undefined) where.optedOut = params.optedOut;
    
    return await prisma.contact.count({ where });
  }
};
