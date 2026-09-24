import { NextRequest, NextResponse } from 'next/server';
import { getRegionByAlpha2, getRegionByAlpha3 } from '@/lib/sms/country-registry';
import { getRegionOperatorCatalog } from '@/lib/sms/carrier-allocations';

/**
 * GET /api/v1/phone/regions/[region]/operators
 * 
 * Returns the regulator-sourced original operator allocations for a given region.
 * [region] can be an ISO alpha-2 (e.g. "UG", "NG", "TZ") or ISO alpha-3 ("UGA", "NGA").
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ region: string }> }
) {
  try {
    const { region: regionParam } = await params;
    if (!regionParam) {
      return NextResponse.json({ success: false, error: 'Region parameter is required' }, { status: 400 });
    }

    const trimmed = regionParam.trim().toUpperCase();
    const regionRecord = trimmed.length === 2 
      ? getRegionByAlpha2(trimmed) 
      : (trimmed.length === 3 ? getRegionByAlpha3(trimmed) : getRegionByAlpha2(trimmed));

    if (!regionRecord) {
      return NextResponse.json(
        { success: false, error: `Region "${regionParam}" not found in country catalog.` },
        { status: 404 }
      );
    }

    const rules = getRegionOperatorCatalog(regionRecord.alpha2);

    return NextResponse.json({
      success: true,
      region: {
        alpha2: regionRecord.alpha2,
        alpha3: regionRecord.alpha3,
        name: regionRecord.name,
        dial_code: regionRecord.dialCode,
      },
      operator_count: rules.length,
      operators: rules.map((r) => ({
        prefix: r.prefix,
        operator: r.operator,
        retail_brand: r.retailBrand,
        source: r.source,
        as_of: r.asOf,
        notes: r.notes,
      })),
      caveat: 'Originally allocated network (may differ from current network due to Mobile Number Portability). Not a live subscriber census.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
