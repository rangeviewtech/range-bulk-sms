/**
 * Telecom Data Seeder & Synchronizer
 * 
 * Synchronizes:
 * 1. NumberingMetadataVersion (libphonenumber-v9.0.39-cldr45)
 * 2. 245 Supported Regions (195 Sovereign Countries + 50 Territories) + 7 Unsupported ISO Entities
 * 3. CallingCodeAssignments
 * 4. Regulatory Operators (Uganda UCC, Nigeria NCC, Tanzania TCRA, Kenya CAK, Rwanda RURA)
 * 5. Prefix Allocations (including 0790 UCC grant 2025-03-12, NCC May 2025, TCRA Nov 2024)
 * 6. CoverageAudits for continuous compliance tracking
 */

import { prisma } from '@/lib/prisma';
import { ALL_REGIONS } from './country-registry';
import { getRegionOperatorCatalog } from './carrier-allocations';
import { logger } from '@/lib/logger';

export async function seedTelecomData(): Promise<{ success: boolean; regionsCount: number; rulesCount: number }> {
  logger.info('[TelecomSeed] Starting telecom numbering and operator database synchronization...');

  // 1. Metadata Version
  await prisma.numberingMetadataVersion.upsert({
    where: { id: 'meta-libphonenumber-v9.0.39-cldr45' },
    update: {
      isActive: true,
      reviewedAt: new Date('2026-09-22'),
    },
    create: {
      id: 'meta-libphonenumber-v9.0.39-cldr45',
      libraryName: 'libphonenumber',
      exactVersion: 'v9.0.39',
      cldrVersion: 'v45',
      builtAt: new Date('2026-09-09'),
      reviewedAt: new Date('2026-09-22'),
      referenceUrl: 'https://github.com/google/libphonenumber',
      license: 'Apache-2.0',
      isActive: true,
    },
  });

  // 2. Regions & Calling Codes
  let totalRegions = 0;
  for (const reg of ALL_REGIONS) {
    totalRegions++;
    await prisma.region.upsert({
      where: { regionId: reg.alpha2 },
      update: {
        name: reg.name,
        alpha3: reg.alpha3,
        isCldr: reg.libphonenumberSupported,
        isUnMember: reg.isUnMember,
        isTerritory: reg.isTerritory,
        callingCodes: [reg.dialCode],
        libphonenumberSupported: reg.libphonenumberSupported,
        sampleE164: reg.sampleE164,
        sampleNsnDigits: reg.sampleNsnDigits,
        validationRule: reg.validationRule,
        notes: reg.notes,
      },
      create: {
        regionId: reg.alpha2,
        name: reg.name,
        alpha2: reg.alpha2,
        alpha3: reg.alpha3,
        isCldr: reg.libphonenumberSupported,
        isUnMember: reg.isUnMember,
        isTerritory: reg.isTerritory,
        callingCodes: [reg.dialCode],
        libphonenumberSupported: reg.libphonenumberSupported,
        sampleE164: reg.sampleE164,
        sampleNsnDigits: reg.sampleNsnDigits,
        validationRule: reg.validationRule,
        notes: reg.notes,
      },
    });

    if (reg.dialCode && reg.dialCode !== 'None') {
      await prisma.callingCodeAssignment.upsert({
        where: { id: `cca-${reg.alpha2}-${reg.dialCode}` },
        update: {
          callingCode: reg.dialCode,
          isNonGeographic: false,
        },
        create: {
          id: `cca-${reg.alpha2}-${reg.dialCode}`,
          regionId: reg.alpha2,
          callingCode: reg.dialCode,
          isNonGeographic: false,
          source: 'ITU-T E.164 Recommendation',
        },
      });
    }
  }

  // 3. Operators & Allocations for Primary Regulator Regions
  let totalAllocations = 0;
  const targetRegions = ['UG', 'NG', 'TZ', 'KE', 'RW'];
  for (const alpha2 of targetRegions) {
    const rules = getRegionOperatorCatalog(alpha2);
    totalAllocations += rules.length;

    // Find unique operators
    const operatorMap = new Map<string, { legalName: string; retailBrand: string; source: string; asOf: string }>();
    for (const r of rules) {
      const opKey = `${alpha2}_${r.retailBrand.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
      if (!operatorMap.has(opKey)) {
        operatorMap.set(opKey, {
          legalName: r.operator,
          retailBrand: r.retailBrand,
          source: r.source,
          asOf: r.asOf,
        });
      }
    }

    // Upsert operators
    for (const [opId, opData] of operatorMap.entries()) {
      await prisma.operator.upsert({
        where: { operatorId: opId },
        update: {
          legalName: opData.legalName,
          retailBrand: opData.retailBrand,
          evidence: opData.source,
        },
        create: {
          operatorId: opId,
          regionId: alpha2,
          legalName: opData.legalName,
          retailBrand: opData.retailBrand,
          classification: 'MNO',
          lifecycleState: 'OPERATIONAL',
          evidence: opData.source,
        },
      });
    }

    // Upsert allocations
    for (const r of rules) {
      const opId = `${alpha2}_${r.retailBrand.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
      const allocId = `alloc-${alpha2}-${r.prefix}`;
      const callingCode = alpha2 === 'UG' ? '+256' : alpha2 === 'NG' ? '+234' : alpha2 === 'TZ' ? '+255' : alpha2 === 'KE' ? '+254' : '+250';

      await prisma.allocation.upsert({
        where: { id: allocId },
        update: {
          brand: r.retailBrand,
          operatorId: opId,
          sourceDocument: r.source,
          snapshotVersion: r.asOf,
          notes: r.notes,
        },
        create: {
          id: allocId,
          regionId: alpha2,
          callingCode,
          nsnLength: alpha2 === 'NG' ? 10 : 9,
          prefix: r.prefix,
          operatorId: opId,
          brand: r.retailBrand,
          serviceType: 'MOBILE',
          sourceDocument: r.source,
          snapshotVersion: r.asOf,
          status: 'VERIFIED',
          notes: r.notes,
        },
      });
    }

    // Upsert Coverage Audit
    await prisma.coverageAudit.upsert({
      where: { id: `audit-${alpha2}-allocations` },
      update: {
        recordCount: rules.length,
        lastCheckedAt: new Date(),
      },
      create: {
        id: `audit-${alpha2}-allocations`,
        regionId: alpha2,
        feature: 'official_allocations',
        coverageStatus: 'verified',
        recordCount: rules.length,
        source: rules[0]?.source || 'National Regulator',
        lastCheckedAt: new Date(),
      },
    });
  }

  logger.info(`[TelecomSeed] Successfully synchronized ${totalRegions} regions and ${totalAllocations} allocations.`);
  return {
    success: true,
    regionsCount: totalRegions,
    rulesCount: totalAllocations,
  };
}
