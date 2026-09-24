import { NextResponse } from 'next/server';
import { COUNTRY_REGISTRY, UNSUPPORTED_ISO_ENTITIES, ALL_REGIONS } from '@/lib/sms/country-registry';
import { getRegionOperatorCatalog } from '@/lib/sms/carrier-allocations';

/**
 * GET /api/v1/phone/data-status
 * 
 * Public metadata and data-provenance status endpoint.
 * Returns information about numbering plan datasets, regulator overlays, and audit counts.
 */
export async function GET() {
  try {
    const unCountriesCount = COUNTRY_REGISTRY.filter((r) => r.isUnMember).length;
    const territoriesCount = COUNTRY_REGISTRY.filter((r) => r.isTerritory).length;
    const totalSupportedCount = COUNTRY_REGISTRY.length;
    const unsupportedCount = UNSUPPORTED_ISO_ENTITIES.length;
    const totalCatalogCount = ALL_REGIONS.length;

    const ugOperatorRules = getRegionOperatorCatalog('UG');
    const ngOperatorRules = getRegionOperatorCatalog('NG');
    const tzOperatorRules = getRegionOperatorCatalog('TZ');

    return NextResponse.json({
      success: true,
      metadata_version: 'libphonenumber-v9.0.39-cldr45',
      provenance: {
        itu_t_e164_version: 'ITU-T Recommendation E.164 (2026-02)',
        google_libphonenumber_release: 'v9.0.39 (2026-09-09)',
        cldr_version: 'v45',
        regulator_snapshots: {
          uganda_ucc: {
            source: 'Uganda Communications Commission (UCC) & ITU-T OB 1304',
            as_of: '2024-11-01',
            latest_grant: '0790 grant effective 2025-03-12 (UCC Q1 2025 Market Report)',
          },
          nigeria_ncc: {
            source: 'Nigerian Communications Commission (NCC) National Numbering Plan',
            as_of: '2025-05-06',
          },
          tanzania_tcra: {
            source: 'Tanzania Communications Regulatory Authority (TCRA) & ITU-T OB 1304',
            as_of: '2024-11-01',
          },
        },
      },
      audited_counts: {
        sovereign_countries_un195: unCountriesCount,
        additional_territories: territoriesCount,
        total_supported_regions: totalSupportedCount,
        unsupported_iso_entities: unsupportedCount,
        all_catalog_entries: totalCatalogCount,
      },
      carrier_overlays: {
        uganda: {
          iso2: 'UG',
          dial_code: '+256',
          rules_count: ugOperatorRules.length,
          status: 'verified_primary_regulator',
        },
        nigeria: {
          iso2: 'NG',
          dial_code: '+234',
          rules_count: ngOperatorRules.length,
          status: 'verified_primary_regulator',
        },
        tanzania: {
          iso2: 'TZ',
          dial_code: '+255',
          rules_count: tzOperatorRules.length,
          status: 'verified_primary_regulator',
        },
      },
      live_lookup_support: {
        adapter: 'offline_deterministic_mock',
        status: 'ready',
        billable_requests_incurred: 0,
      },
      legal_disclaimer: 'Original carrier allocations reflect regulatory grants and do not account for active subscriber state or Mobile Number Portability (MNP) transfers.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
