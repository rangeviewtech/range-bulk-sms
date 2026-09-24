import { prisma, CommunicationChannel, ConsentAction, ConsentPurpose } from "@/lib/prisma";

export interface RecordConsentParams {
  contactId: string;
  tenantId?: string;
  channel?: CommunicationChannel;
  purpose: ConsentPurpose;
  action: ConsentAction;
  source?: string;
  evidence?: string;
  legalBasis?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

export class ConsentService {
  /**
   * Records a consent event in the append-only log and updates the Contact's materialized consent state.
   */
  static async recordConsentEvent(params: RecordConsentParams) {
    const { contactId, action, purpose, channel = "SMS" } = params;

    // Use a transaction to ensure log and contact state are updated together
    return await prisma.$transaction(async (tx) => {
      // 1. Create the append-only log entry
      const log = await tx.consentLog.create({
        data: {
          contactId: params.contactId,
          tenantId: params.tenantId,
          channel,
          purpose,
          action,
          source: params.source,
          evidence: params.evidence,
          legalBasis: params.legalBasis,
        },
      });

      // 2. Update the Contact's materialized view booleans for quick lookups
      // If action is OPT_OUT, REVOKED, or COMPLAINT, they are opted out.
      const isOptOut = ["OPT_OUT", "REVOKED", "COMPLAINT"].includes(action);
      const isOptIn = ["OPT_IN", "RENEWAL"].includes(action);

      const updateData: import('@/lib/prisma').Prisma.ContactUpdateInput = {};
      if (isOptOut) {
        updateData.optedOut = true;
        updateData.consentGiven = false;
        // If it's a severe complaint, we might also blacklist them globally, but we'll stick to optedOut for now.
        if (action === "COMPLAINT") {
          updateData.blacklisted = true;
        }
      } else if (isOptIn) {
        updateData.optedOut = false;
        updateData.consentGiven = true;
        updateData.consentDate = new Date();
      }

      const updatedContact = await tx.contact.update({
        where: { id: contactId },
        data: updateData,
      });

      return { log, contact: updatedContact };
    });
  }

  /**
   * Evaluates if a contact is eligible to receive a message of a specific purpose.
   */
  static async checkEligibility(
    contactId: string,
    purpose: ConsentPurpose
  ): Promise<EligibilityResult> {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return { eligible: false, reason: "Contact not found" };
    }

    if (contact.blacklisted) {
      return { eligible: false, reason: "Contact is globally blacklisted" };
    }

    if (contact.optedOut) {
      // Allow transactional messages even if opted out, unless legal requirements restrict it.
      // Usually, transactional (like order receipts) can bypass marketing opt-outs.
      if (purpose === "TRANSACTIONAL" || purpose === "SYSTEM") {
         return { eligible: true };
      }
      return { eligible: false, reason: "Contact has opted out of marketing communications" };
    }

    // For marketing, we strictly require opt-in consent.
    if (purpose === "MARKETING") {
      if (!contact.consentGiven) {
        return { eligible: false, reason: "Explicit consent has not been provided for marketing" };
      }
    }

    return { eligible: true };
  }
}
