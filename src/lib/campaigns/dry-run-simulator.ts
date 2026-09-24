import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber, detectCarrier } from "@/lib/sms/normalizer";
import { RegulatoryEngine } from "@/lib/compliance/regulatory-engine";
import { ConsentPurpose } from "@/lib/prisma";

export interface DryRunParams {
  userId: string;
  messageText: string;
  senderIdName?: string;
  contactGroupIds?: string[];
  manualRecipients?: string[];
  purpose?: ConsentPurpose;
}

export interface DryRunReport {
  totalInputRecipients: number;
  validRecipients: number;
  invalidNumbers: number;
  duplicateNumbers: number;
  suppressedOptOuts: number;
  quietHoursBlocked: number;
  eligibleRecipients: number;
  encoding: "GSM-7" | "UCS-2";
  characterCount: number;
  segmentCount: number;
  totalRequiredCredits: number;
  userAvailableCredits: number;
  hasSufficientCredits: boolean;
  carrierBreakdown: Record<string, number>;
  sampleEligiblePhones: string[];
}

export class DryRunSimulator {
  /**
   * Executes a safe, non-mutating pre-flight simulation for a campaign.
   * Performs deduplication, carrier resolution, compliance suppression,
   * encoding calculation, and credit solvency checking without dispatching any SMS.
   */
  static async simulate(params: DryRunParams): Promise<DryRunReport> {
    const { userId, messageText, contactGroupIds = [], manualRecipients = [], purpose = "MARKETING" } = params;

    // 1. Fetch Wallet Credits
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { smsCredits: true },
    });
    const userAvailableCredits = wallet?.smsCredits || 0;

    // 2. Aggregate raw recipient numbers
    const rawPhones: string[] = [...manualRecipients];

    if (contactGroupIds.length > 0) {
      const groupMembers = await prisma.contactGroupMember.findMany({
        where: { contactGroupId: { in: contactGroupIds } },
        include: { contact: true },
      });
      for (const m of groupMembers) {
        if (m.contact?.phone) {
          rawPhones.push(m.contact.phone);
        }
      }
    }

    const totalInputRecipients = rawPhones.length;

    // 3. Normalize, validate and deduplicate
    const seen = new Set<string>();
    let duplicateNumbers = 0;
    let invalidNumbers = 0;
    const carrierBreakdown: Record<string, number> = {};
    const sanitizedPhones: { phone: string; network: string }[] = [];

    for (const raw of rawPhones) {
      const { normalized, isValid } = normalizePhoneNumber(raw);
      if (!isValid) {
        invalidNumbers++;
        continue;
      }

      if (seen.has(normalized)) {
        duplicateNumbers++;
        continue;
      }
      seen.add(normalized);

      const netName = detectCarrier(normalized);
      carrierBreakdown[netName] = (carrierBreakdown[netName] || 0) + 1;
      sanitizedPhones.push({ phone: normalized, network: netName });
    }

    // 4. Compliance, Opt-Out, and Quiet-Hours Filtration
    let suppressedOptOuts = 0;
    let quietHoursBlocked = 0;
    const eligiblePhones: string[] = [];

    const { isQuiet } = RegulatoryEngine.isQuietHours(new Date(), "Africa/Kampala");

    for (const item of sanitizedPhones) {
      if (purpose === "MARKETING" && isQuiet) {
        quietHoursBlocked++;
        continue;
      }

      const compliance = await RegulatoryEngine.verifyPreDispatchCompliance({
        phone: item.phone,
        message: messageText,
        purpose,
        tenantId: userId,
      });

      if (!compliance.allowed) {
        suppressedOptOuts++;
      } else {
        eligiblePhones.push(item.phone);
      }
    }

    // 5. Message Encoding and Segment Calculation
    const isUnicode = /[^\u0020-\u007E\u00A0-\u00FF\n\r\t]/.test(messageText);
    const encoding: "GSM-7" | "UCS-2" = isUnicode ? "UCS-2" : "GSM-7";

    const charLimit = encoding === "GSM-7" ? 160 : 70;
    const multipartLimit = encoding === "GSM-7" ? 153 : 67;

    const charCount = messageText.length;
    let segmentCount = 1;
    if (charCount > charLimit) {
      segmentCount = Math.ceil(charCount / multipartLimit);
    }

    const totalRequiredCredits = eligiblePhones.length * segmentCount;
    const hasSufficientCredits = userAvailableCredits >= totalRequiredCredits;

    return {
      totalInputRecipients,
      validRecipients: sanitizedPhones.length,
      invalidNumbers,
      duplicateNumbers,
      suppressedOptOuts,
      quietHoursBlocked,
      eligibleRecipients: eligiblePhones.length,
      encoding,
      characterCount: charCount,
      segmentCount,
      totalRequiredCredits,
      userAvailableCredits,
      hasSufficientCredits,
      carrierBreakdown,
      sampleEligiblePhones: eligiblePhones.slice(0, 5),
    };
  }
}
