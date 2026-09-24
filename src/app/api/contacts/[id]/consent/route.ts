import { NextResponse } from "next/server";
import { ConsentService } from "@/lib/sms/consent-service";
import { prisma, ConsentAction, ConsentPurpose, CommunicationChannel } from "@/lib/prisma";
import { z } from "zod";

const recordConsentSchema = z.object({
  action: z.nativeEnum(ConsentAction),
  purpose: z.nativeEnum(ConsentPurpose),
  channel: z.nativeEnum(CommunicationChannel).optional(),
  source: z.string().optional(),
  evidence: z.string().optional(),
  legalBasis: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;

    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parseResult = recordConsentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { action, purpose, channel, source, evidence, legalBasis } = parseResult.data;

    const result = await ConsentService.recordConsentEvent({
      contactId,
      tenantId: contact.userId, // Storing the user ID representing the tenant
      action,
      purpose,
      channel,
      source,
      evidence,
      legalBasis,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[CONSENT_POST]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;

    const logs = await prisma.consentLog.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("[CONSENT_GET]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
