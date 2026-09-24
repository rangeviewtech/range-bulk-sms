import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/authorization";
import { z } from "zod";

const privacyRequestSchema = z.object({
  requestType: z.enum(["EXPORT_DATA", "DELETE_DATA", "RECTIFY_DATA", "REVOKE_ALL_CONSENT"]),
  reason: z.string().min(5).max(500),
  contactEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const body = await req.json().catch(() => ({}));
    const parsed = privacyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid privacy request payload", details: parsed.error.format() }, { status: 400 });
    }

    const { requestType, reason, contactEmail } = parsed.data;
    const effectiveEmail = contactEmail || session?.user?.email;

    // Record an audit log for the privacy / compliance request
    const auditRecord = await prisma.auditLog.create({
      data: {
        eventName: `PRIVACY_REQUEST_${requestType}`,
        category: "COMPLIANCE",
        severity: "INFO",
        outcome: "SUCCESS",
        actorType: session ? "USER" : "ANONYMOUS",
        actorId: session?.userId || "anonymous",
        action: `PRIVACY_REQUEST_${requestType}`,
        resourceType: "UserPrivacy",
        resourceId: effectiveEmail || "system",
        timestamp: new Date(),
        reasonCode: requestType,
        sourceIp: (req.headers.get("x-forwarded-for") || req.headers.get("remote-addr") || undefined),
        description: reason,
        newVersion: {
          requestType,
          reason,
          contactEmail: effectiveEmail,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    // If REVOKE_ALL_CONSENT, mark all contacts associated with this email / user as opted out
    if (requestType === "REVOKE_ALL_CONSENT" && contactEmail) {
      const user = await prisma.user.findUnique({
        where: { email: contactEmail },
      });

      if (user) {
        await prisma.contact.updateMany({
          where: { userId: user.id },
          data: {
            optedOut: true,
            consentGiven: false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Privacy request (${requestType}) recorded successfully under UCC/GDPR data subject rights.`,
      ticketId: auditRecord.id,
    });
  } catch (error) {
    console.error("[PRIVACY_REQUEST_ERROR]", error);
    return NextResponse.json({ error: "Failed to process privacy request" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required to view privacy requests" }, { status: 401 });
    }

    const isAdmin =
      (await hasPermission(session.userId, "compliance.manage")) ||
      (await hasPermission(session.userId, "admin.access"));

    const recentRequests = await prisma.auditLog.findMany({
      where: {
        category: "COMPLIANCE",
        eventName: { startsWith: "PRIVACY_REQUEST_" },
        ...(isAdmin
          ? {}
          : {
              OR: [
                { resourceId: session.user?.email || "unknown" },
                { actorId: session.userId },
              ],
            }),
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      requests: recentRequests,
    });
  } catch (error) {
    console.error("[PRIVACY_LIST_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch privacy requests" }, { status: 500 });
  }
}
