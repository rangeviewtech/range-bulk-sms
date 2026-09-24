import { describe, it, expect, vi, beforeEach } from 'vitest';
import { seedTelecomData } from '@/lib/sms/seed-telecom-data';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    numberingMetadataVersion: {
      upsert: vi.fn().mockResolvedValue({ id: 'meta-libphonenumber-v9.0.39-cldr45' }),
    },
    region: {
      upsert: vi.fn().mockResolvedValue({ id: 'ug' }),
    },
    callingCodeAssignment: {
      upsert: vi.fn().mockResolvedValue({ id: 'cca-ug' }),
    },
    operator: {
      upsert: vi.fn().mockResolvedValue({ id: 'op-ug' }),
    },
    allocation: {
      upsert: vi.fn().mockResolvedValue({ id: 'alloc-ug' }),
    },
    coverageAudit: {
      upsert: vi.fn().mockResolvedValue({ id: 'audit-ug' }),
    },
  },
}));

describe('Telecom Data Seeder & Synchronizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('synchronizes numbering metadata, all 252 catalog regions, and regulator allocations into Prisma', async () => {
    const res = await seedTelecomData();

    expect(res.success).toBe(true);
    expect(res.regionsCount).toBe(252); // 245 supported + 7 unsupported ISO entities
    expect(res.rulesCount).toBeGreaterThan(40);

    // Numbering metadata version upserted
    expect(prisma.numberingMetadataVersion.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.numberingMetadataVersion.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'meta-libphonenumber-v9.0.39-cldr45' },
        create: expect.objectContaining({
          libraryName: 'libphonenumber',
          exactVersion: 'v9.0.39',
          cldrVersion: 'v45',
        }),
      })
    );

    // All 252 regions upserted
    expect(prisma.region.upsert).toHaveBeenCalledTimes(252);

    // Calling code assignments upserted for regions with dial codes
    expect(prisma.callingCodeAssignment.upsert).toHaveBeenCalled();

    // Operators and Allocations upserted
    expect(prisma.operator.upsert).toHaveBeenCalled();
    expect(prisma.allocation.upsert).toHaveBeenCalled();

    // Coverage audit records upserted
    expect(prisma.coverageAudit.upsert).toHaveBeenCalled();
  });
});
