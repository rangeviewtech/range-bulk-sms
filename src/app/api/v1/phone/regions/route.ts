import { NextRequest, NextResponse } from 'next/server';
import { ALL_REGIONS, searchRegions, getRegionsByDialCode } from '@/lib/sms/country-registry';

/**
 * GET /api/v1/phone/regions
 * 
 * Searchable country and territory catalog covering:
 * - 195 Sovereign Countries (193 UN members + Holy See + State of Palestine)
 * - 50 Additional Supported Territories and Regions
 * - 7 Unsupported ISO 3166-1 entities
 * 
 * Query parameters:
 * - q: text search query (name, ISO code, dial code)
 * - un_only: boolean (true/false)
 * - territory_only: boolean (true/false)
 * - dial_code: filter by dialing code (e.g. "+256" or "256")
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const unOnly = searchParams.get('un_only') === 'true';
    const territoryOnly = searchParams.get('territory_only') === 'true';
    const dialCodeParam = searchParams.get('dial_code');

    let results = ALL_REGIONS;

    if (dialCodeParam) {
      const formattedDial = dialCodeParam.startsWith('+') ? dialCodeParam : `+${dialCodeParam}`;
      results = getRegionsByDialCode(formattedDial);
    } else if (q || unOnly || territoryOnly) {
      results = searchRegions(q, { unOnly, territoryOnly });
    }

    const formattedData = results.map((r) => ({
      id: r.id,
      name: r.name,
      alpha2: r.alpha2,
      alpha3: r.alpha3,
      dial_code: r.dialCode,
      sample_e164: r.sampleE164,
      sample_nsn_digits: r.sampleNsnDigits,
      validation_rule: r.validationRule,
      is_un_member: r.isUnMember,
      is_territory: r.isTerritory,
      libphonenumber_supported: r.libphonenumberSupported,
      unsupported_reason: r.unsupportedReason,
      notes: r.notes,
    }));

    return NextResponse.json({
      success: true,
      count: formattedData.length,
      data: formattedData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
