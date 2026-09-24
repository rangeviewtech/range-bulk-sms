import { NextRequest, NextResponse } from 'next/server';
import { analyzePhoneAsync } from '@/lib/sms/phone-analyzer';

/**
 * POST /api/v1/phone/analyze
 * 
 * Global telephone-number parsing, validation, and network-provider detection.
 * 
 * Body:
 * {
 *   "phone": "+256770123456",
 *   "defaultRegion": "UG", // optional, defaults to "UG"
 *   "expectedRegion": "UG", // optional
 *   "mobileOnly": false, // optional
 *   "enableLiveLookup": false, // optional, requires consent and active provider
 *   "userConsent": false // optional boolean, required if enableLiveLookup is true
 * }
 */
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Request body must be an object.' },
        { status: 400 }
      );
    }

    const { phone, defaultRegion, expectedRegion, mobileOnly, enableLiveLookup, userConsent } = body as {
      phone?: string;
      defaultRegion?: string;
      expectedRegion?: string;
      mobileOnly?: boolean;
      enableLiveLookup?: boolean;
      userConsent?: boolean;
    };

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'The "phone" field is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Protection against abnormally long input
    if (phone.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Phone number exceeds maximum permitted length (50 characters).' },
        { status: 400 }
      );
    }

    const result = await analyzePhoneAsync(phone, {
      defaultRegion,
      expectedRegion,
      mobileOnly,
      enableLiveLookup,
      userConsent,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
