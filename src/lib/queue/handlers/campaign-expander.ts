import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ConsentService } from "@/lib/sms/consent-service";
import { BillingService } from "@/lib/billing/billing-service";
import { FraudPrevention } from "@/lib/security/fraud-prevention";
import { JobWorker } from "../worker";

export const expandCampaignHandler = async (payload: Record<string, unknown>, _jobId: string) => {
  const campaignId = payload.campaignId as string;
  if (!campaignId) throw new Error("campaignId is required");

  // 1. Fetch Campaign and its target groups
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { groups: { include: { contactGroup: true } } },
  });

  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

  // Ensure campaign is in a state to be processed
  if (!["PREPARING", "RUNNING"].includes(campaign.status)) {
    throw new Error(`Campaign ${campaignId} is in invalid state ${campaign.status} for expansion.`);
  }

  // Set to RUNNING if not already
  if (campaign.status !== "RUNNING") {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "RUNNING", startedAt: new Date() },
    });
  }

  // 2. Resolve all unique recipients from the assigned groups
  const groupIds = campaign.groups.map(g => g.contactGroupId);
  
  if (groupIds.length === 0) {
    // If no groups, complete it immediately (edge case)
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    return;
  }

  const members = await prisma.contactGroupMember.findMany({
    where: { contactGroupId: { in: groupIds } },
    include: { contact: true },
  });

  // Deduplicate by normalized phone
  const uniqueContactsMap = new Map<string, typeof members[0]["contact"]>();
  for (const member of members) {
    if (member.contact && !member.contact.deletedAt) {
      uniqueContactsMap.set(member.contact.normalizedPhone, member.contact);
    }
  }

  const uniqueContacts = Array.from(uniqueContactsMap.values());
  
  // 3. Billing Validation
  const estimatedCredits = await BillingService.estimateCampaignCost(uniqueContacts.length);
  const hasFunds = await BillingService.hasSufficientFunds(campaign.userId, estimatedCredits);
  
  if (!hasFunds) {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "FAILED", metadata: { error: "Insufficient funds to expand campaign" } },
    });
    return;
  }

  // 4. Filter eligible contacts: check consent & fraud
  const eligibleContacts: typeof uniqueContacts = [];
  const purpose = ((campaign.metadata as Record<string, unknown>)?.purpose as import('@/lib/prisma').ConsentPurpose) || "MARKETING";

  for (const contact of uniqueContacts) {
    const eligibility = await ConsentService.checkEligibility(contact.id, purpose);
    if (!eligibility.eligible) continue;

    const destCheck = FraudPrevention.checkDestination(contact.normalizedPhone);
    if (destCheck.isFraudulent) {
      console.warn(`[FRAUD_PREVENTION] Skipping high-risk premium number: ${contact.normalizedPhone} (User: ${campaign.userId})`);
      continue;
    }

    const velocityCheck = await FraudPrevention.checkVelocity(campaign.userId, contact.normalizedPhone);
    if (velocityCheck.isFraudulent) {
      console.error(`[FRAUD_PREVENTION] OTP Pumping detected on campaign ${campaign.id}. Pausing campaign.`);
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "PAUSED", metadata: { error: velocityCheck.reason } }
      });
      return;
    }

    eligibleContacts.push(contact);
  }

  // 5. Batch creation in chunks of 500 (Replaces 15,000 queries with ~30 queries)
  const CHUNK_SIZE = 500;
  let queuedCount = 0;

  for (let i = 0; i < eligibleContacts.length; i += CHUNK_SIZE) {
    const chunk = eligibleContacts.slice(i, i + CHUNK_SIZE);
    
    const messagesData = [];
    const recipientsData = [];
    const jobsData = [];

    for (const contact of chunk) {
      const messageId = crypto.randomUUID();
      const recipientId = crypto.randomUUID();

      messagesData.push({
        id: messageId,
        campaignId: campaign.id,
        userId: campaign.userId,
        senderIdId: campaign.senderIdId,
        message: campaign.message,
        status: "QUEUED" as const,
      });

      recipientsData.push({
        id: recipientId,
        messageId,
        contactId: contact.id,
        phone: contact.normalizedPhone,
        status: "QUEUED" as const,
      });

      jobsData.push({
        type: "sms.dispatch",
        payload: { messageId },
        queue: "sms-dispatch",
        priority: "BULK" as const,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.message.createMany({ data: messagesData });
      await tx.messageRecipient.createMany({ data: recipientsData });
    });

    await JobWorker.enqueueMany(jobsData);
    queuedCount += chunk.length;
  }

  // Update campaign stats
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { 
      totalRecipients: queuedCount,
      pendingCount: queuedCount 
    },
  });

  // The final completion of the campaign is determined when pendingCount hits 0
  // Or handled by a periodic 'campaign.monitor' job.
};
