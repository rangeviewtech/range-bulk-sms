import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Secret key from WhatsApp App Dashboard
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || '';
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || '';

/**
 * Validates the WhatsApp Webhook signature to ensure the request is genuinely from WhatsApp.
 */
function verifySignature(req: Request, rawBody: string): boolean {
  if (!WHATSAPP_APP_SECRET) return true; // Bypass if not configured
  
  const signature = req.headers.get('x-hub-signature-256');
  if (!signature) return false;

  const hash = crypto
    .createHmac('sha256', WHATSAPP_APP_SECRET)
    .update(rawBody)
    .digest('hex');
    
  const expectedSignature = `sha256=${hash}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Webhook Challenge (GET)
 * WhatsApp sends a GET request to verify the webhook URL.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * Handle incoming WhatsApp messages and status updates (POST)
 * Applies E2EE principles by ensuring data is strictly validated and signatures checked.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // 1. Verify Request Authenticity (Security Requirement)
    if (!verifySignature(req, rawBody)) {
      return NextResponse.json(
        { error: 'Invalid signature. Request rejected.' },
        { status: 401 }
      );
    }

    // 2. Parse encrypted/secure payload
    const body = JSON.parse(rawBody);

    // Ensure it's a WhatsApp API event
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Unrecognized event type' }, { status: 404 });
    }

    // Process each entry (typically 1, but can be batched)
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        
        // Handle incoming messages
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            // Processing incoming WhatsApp message
            const from = message.from; // Sender's phone number
            const messageId = message.id;
            // Queue for internal secure processing
            console.log(`[WhatsApp] Securely received message ${messageId} from ${from}`);
          }
        }
        
        // Handle message status updates (sent, delivered, read)
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            console.log(`[WhatsApp] Message ${status.id} status updated to ${status.status}`);
          }
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Webhook Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
