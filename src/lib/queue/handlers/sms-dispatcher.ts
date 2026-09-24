import { prisma } from "@/lib/prisma";
import { RoutingEngine } from "@/lib/sms/routing-engine";
import { BillingService } from "@/lib/billing/billing-service";
import { JobWorker } from "@/lib/queue/worker";
import { RegulatoryEngine } from "@/lib/compliance/regulatory-engine";

export const dispatchSmsHandler = async (payload: Record<string, unknown>, _jobId: string) => {
  const messageId = payload.messageId as string;
  if (!messageId) throw new Error("messageId is required");

  // 1. Fetch the Message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { campaign: true, recipients: true, senderId: true }
  });

  if (!message) {
    throw new Error(`Message ${messageId} not found`);
  }

  // 2. Validate Campaign State (if applicable)
  if (message.campaign) {
    if (["PAUSED", "CANCELLING", "CANCELLED"].includes(message.campaign.status)) {
      await prisma.message.update({
        where: { id: message.id },
        data: { status: "REJECTED", failureReason: "Campaign was halted" }
      });
      return;
    }
  }

  const recipient = message.recipients[0];
  if (!recipient) {
    throw new Error(`Message ${messageId} has no recipients`);
  }

  // 3. Pre-Dispatch Compliance & Quiet Hours Verification
  const complianceCheck = await RegulatoryEngine.verifyPreDispatchCompliance({
    phone: recipient.phone,
    message: message.message,
    purpose: (message.metadata as { purpose?: "MARKETING" | "TRANSACTIONAL" })?.purpose || "MARKETING",
    contactId: recipient.contactId || undefined,
    tenantId: message.userId,
    isHardwareGateway: !!message.gatewayId,
  });

  if (!complianceCheck.allowed) {
    console.warn(`[DISPATCH_HALTED] Compliance check failed for message ${messageId}: ${complianceCheck.reason}`);
    await completeDispatch(message, false, complianceCheck.reason || "Blocked by regulatory compliance policy");
    return;
  }

  // 4. Mark as SUBMITTED
  await prisma.message.update({
    where: { id: message.id },
    data: { status: "SUBMITTED" }
  });

  // 5. Resolve Route via Routing Engine
  const route = await RoutingEngine.resolveRoute(recipient.phone);
  
  if (!route) {
    await completeDispatch(message, false, "No active SMS provider available to route this message");
    return;
  }

  // 6. Dispatch via Selected Telecom Adapter
  const senderName = message.senderId?.senderId || "DEFAULT";
  const result = await route.adapter.sendSms({
    to: recipient.phone,
    from: senderName,
    message: message.message
  });

  // 7. Report Outcome to Provider Circuit Breaker
  RoutingEngine.reportOutcome(route.providerId, result.success);

  // 8. Balanced Ledger Settlement / Deduction
  if (result.success && message.userId) {
    try {
      await BillingService.deductMessageCost(message.userId, message.id);
    } catch (error) {
      console.error("[BILLING_DEDUCT_ERROR]", error);
    }
  }

  // 9. Update Final Status
  await completeDispatch(message, result.success, result.error, result.messageId);
};

async function completeDispatch(message: import('@/lib/prisma').Message, isSuccess: boolean, failureReason?: string | null, providerMessageId?: string | null) {
  const finalStatus = isSuccess ? "SENT" : "FAILED";
  
  await prisma.message.update({
    where: { id: message.id },
    data: { 
      status: finalStatus,
      sentAt: isSuccess ? new Date() : null,
      failedAt: !isSuccess ? new Date() : null,
      failureReason: !isSuccess ? failureReason : null,
      providerMessageId: isSuccess ? providerMessageId : null,
    }
  });

  await prisma.messageRecipient.updateMany({
    where: { messageId: message.id },
    data: {
      status: finalStatus,
      sentAt: isSuccess ? new Date() : null,
      failedAt: !isSuccess ? new Date() : null,
      failureReason: !isSuccess ? failureReason : null,
    }
  });

  if (message.campaignId) {
    const campaign = await prisma.campaign.update({
      where: { id: message.campaignId },
      data: {
        sentCount: isSuccess ? { increment: 1 } : undefined,
        failedCount: !isSuccess ? { increment: 1 } : undefined,
        pendingCount: { decrement: 1 }
      }
    });

    if (campaign.pendingCount <= 0) {
      if (campaign.type === "RECURRING" && campaign.cronExpression) {
        const { CronExpressionParser } = await import("cron-parser");
        try {
          const interval = CronExpressionParser.parse(campaign.cronExpression);
          const nextDate = interval.next().toDate();

          const maxOccurrences = campaign.maxOccurrences ?? Infinity;
          const newOccurrence = campaign.currentOccurrence + 1;

          if (newOccurrence < maxOccurrences) {
            await prisma.campaign.update({
              where: { id: campaign.id },
              data: {
                status: "SCHEDULED",
                scheduledAt: nextDate,
                currentOccurrence: newOccurrence,
              }
            });
            console.log(`[CAMPAIGN_RECURRING] Rescheduled Campaign ${campaign.id} for next run: ${nextDate.toISOString()}`);
          } else {
            await prisma.campaign.update({
              where: { id: campaign.id },
              data: { status: "COMPLETED", completedAt: new Date() }
            });
          }
        } catch {
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: { status: "COMPLETED", completedAt: new Date() }
          });
        }
      } else {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: "COMPLETED", completedAt: new Date() }
        });
      }
    }
  }

  // Queue Webhook Event for Customer Server
  await JobWorker.enqueue("webhook.dispatch", {
    event: isSuccess ? "message.sent" : "message.failed",
    data: {
      messageId: message.id,
      campaignId: message.campaignId,
      status: finalStatus,
      failureReason,
      providerMessageId
    }
  });
}
