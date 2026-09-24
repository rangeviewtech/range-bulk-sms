import { prisma } from "@/lib/prisma";
import { ConsentPurpose } from "@/lib/prisma";
import { ConsentService } from "@/lib/sms/consent-service";

export interface PreDispatchComplianceCheck {
  phone: string;
  message: string;
  purpose: ConsentPurpose;
  contactId?: string;
  tenantId?: string;
  isHardwareGateway?: boolean;
  timestamp?: Date;
  timezone?: string;
}

export interface ComplianceEvaluationResult {
  allowed: boolean;
  reason?: string;
  code?: "QUIET_HOURS" | "OPTED_OUT" | "BLACKLISTED" | "UNLICENSED_ROUTE" | "PURPOSE_MISMATCH";
}

/**
 * Enterprise Regulatory & Compliance Engine.
 * Enforces Uganda Communications Commission (UCC) statutory sending guidelines,
 * pre-dispatch consent verification, quiet hours, and hardware route whitelisting.
 */
export class RegulatoryEngine {
  /**
   * Uganda Communications Commission (UCC) Promotional Quiet Hours:
   * Commercial and marketing SMS may only be dispatched between 08:00 (8:00 AM)
   * and 19:00 (7:00 PM) East Africa Time (EAT / Africa/Kampala).
   * Transactional messages (OTPs, banking alerts) are exempt.
   */
  static isQuietHours(
    timestamp: Date = new Date(),
    timeZone: string = "Africa/Kampala"
  ): { isQuiet: boolean; localHour: number } {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        hour12: false,
      });
      const localHour = parseInt(formatter.format(timestamp), 10);

      // Quiet hours: 19:00 (7 PM) to 07:59 (8 AM)
      const isQuiet = localHour >= 19 || localHour < 8;
      return { isQuiet, localHour };
    } catch {
      // Fallback to UTC+3 if Intl fails
      const utcHours = timestamp.getUTCHours();
      const eatHour = (utcHours + 3) % 24;
      const isQuiet = eatHour >= 19 || eatHour < 8;
      return { isQuiet, localHour: eatHour };
    }
  }

  /**
   * Evaluates compliance immediately before each external transmission across ALL channels
   * (SMPP, HTTP Aggregators, Android Gateways, ESP32 Gateways, Public API).
   */
  static async verifyPreDispatchCompliance(
    params: PreDispatchComplianceCheck
  ): Promise<ComplianceEvaluationResult> {
    const { phone, purpose, contactId, isHardwareGateway, timestamp = new Date() } = params;

    // 1. UCC Equipment Authorization: Block commercial bulk marketing across personal hardware SIMs
    if (isHardwareGateway && purpose === "MARKETING") {
      return {
        allowed: false,
        code: "UNLICENSED_ROUTE",
        reason:
          "UCC regulations prohibit commercial promotional broadcasts over unregistered personal GSM gateway modems.",
      };
    }

    // 2. UCC Quiet Hours: Marketing SMS blocked between 19:00 and 08:00 EAT
    if (purpose === "MARKETING") {
      const { isQuiet, localHour } = this.isQuietHours(timestamp, params.timezone || "Africa/Kampala");
      if (isQuiet) {
        return {
          allowed: false,
          code: "QUIET_HOURS",
          reason: `Uganda Communications Commission (UCC) quiet hours in effect (19:00 - 08:00 EAT). Current hour: ${localHour}:00.`,
        };
      }
    }

    // 3. Contact ID Consent Check (if provided)
    if (contactId) {
      const eligibility = await ConsentService.checkEligibility(contactId, purpose);
      if (!eligibility.eligible) {
        return {
          allowed: false,
          code: "OPTED_OUT",
          reason: eligibility.reason || "Recipient has not granted consent for this purpose.",
        };
      }
    } else if (phone) {
      // 4. Fallback Direct Phone Suppression Check
      // Even if contactId is missing (e.g. ad-hoc API v1 dispatch), verify phone number is not blacklisted or opted out
      const contact = await prisma.contact.findFirst({
        where: {
          phone: { contains: phone.slice(-9) }, // match last 9 digits ignoring prefix format
        },
      });

      if (contact) {
        if (contact.blacklisted) {
          return {
            allowed: false,
            code: "BLACKLISTED",
            reason: "Recipient phone number is globally blacklisted.",
          };
        }

        if (contact.optedOut && purpose === "MARKETING") {
          return {
            allowed: false,
            code: "OPTED_OUT",
            reason: "Recipient phone number has an active marketing opt-out on file.",
          };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Records a statutory consumer complaint or DND request, propagating it instantly
   * to the suppression list across all gateway channels.
   */
  static async recordComplaint(params: {
    contactId?: string;
    phone: string;
    tenantId?: string;
    reason: string;
    evidence?: string;
  }): Promise<void> {
    const { contactId, phone, tenantId, reason, evidence } = params;

    let targetContactId = contactId;

    if (!targetContactId) {
      const existing = await prisma.contact.findFirst({
        where: { phone: { contains: phone.slice(-9) } },
      });
      if (existing) {
        targetContactId = existing.id;
      }
    }

    if (targetContactId) {
      await ConsentService.recordConsentEvent({
        contactId: targetContactId,
        tenantId,
        channel: "SMS",
        purpose: "MARKETING",
        action: "COMPLAINT",
        source: "REGULATORY_COMPLAINT",
        evidence: evidence || reason,
        legalBasis: "STATUTORY_DND_MANDATE",
      });
    }
  }
}
