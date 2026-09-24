import { prisma } from "@/lib/prisma";

export interface FraudCheckResult {
  isFraudulent: boolean;
  reason?: string;
}

export class FraudPrevention {
  /**
   * OTP Pumping Protection (Velocity Check)
   * Checks if a user is repeatedly sending messages to the exact same phone number
   * in a very short time frame, which indicates automated AIT (Artificially Inflated Traffic).
   */
  static async checkVelocity(userId: string, phone: string): Promise<FraudCheckResult> {
    const WINDOW_MINUTES = 5;
    const MAX_MESSAGES_PER_NUMBER = 5;

    const fiveMinsAgo = new Date(Date.now() - WINDOW_MINUTES * 60000);

    // Count how many times this user has sent a message to this exact phone number in the last 5 minutes
    const recentMessages = await prisma.message.count({
      where: {
        userId,
        recipients: {
          some: {
            phone
          }
        },
        createdAt: {
          gte: fiveMinsAgo
        }
      }
    });

    if (recentMessages >= MAX_MESSAGES_PER_NUMBER) {
      return {
        isFraudulent: true,
        reason: `OTP Pumping detected: Sent >${MAX_MESSAGES_PER_NUMBER} messages to ${phone} within ${WINDOW_MINUTES} minutes.`
      };
    }

    return { isFraudulent: false };
  }

  /**
   * Premium Rate Routing / Toll Fraud Detection
   * (Simplified logic for demonstration)
   */
  static checkDestination(phone: string): FraudCheckResult {
    // List of highly abused country codes known for toll fraud
    const highRiskPrefixes = ['+881', '+882', '+211', '+252', '+269'];

    for (const prefix of highRiskPrefixes) {
      if (phone.startsWith(prefix)) {
        return {
          isFraudulent: true,
          reason: `High risk premium destination blocked: ${prefix}`
        };
      }
    }

    return { isFraudulent: false };
  }
}
