import { describe, it, expect, vi, beforeEach } from "vitest";
import { DryRunSimulator } from "../lib/campaigns/dry-run-simulator";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => ({
  prisma: {
    wallet: {
      findUnique: vi.fn(),
    },
    contactGroupMember: {
      findMany: vi.fn(),
    },
    contact: {
      findFirst: vi.fn(),
    },
  },
}));

interface MockWalletDelegate {
  findUnique: ReturnType<typeof vi.fn>;
}

const mockWallet = prisma.wallet as unknown as MockWalletDelegate;

describe("DryRunSimulator (Pre-Flight Campaign Validation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accurately normalize, deduplicate, and calculate costs", async () => {
    mockWallet.findUnique.mockResolvedValueOnce({
      smsCredits: 500,
    });

    const report = await DryRunSimulator.simulate({
      userId: "user-1",
      messageText: "Hello valued customer! Enjoy our special offers.",
      manualRecipients: [
        "0772123456", // MTN Valid
        "0772123456", // Duplicate of above
        "0752987654", // Airtel Valid
        "invalid_phone", // Invalid
      ],
      purpose: "TRANSACTIONAL", // Avoid quiet hours filter
    });

    expect(report.totalInputRecipients).toBe(4);
    expect(report.duplicateNumbers).toBe(1);
    expect(report.invalidNumbers).toBe(1);
    expect(report.validRecipients).toBe(2);
    expect(report.eligibleRecipients).toBe(2);
    expect(report.encoding).toBe("GSM-7");
    expect(report.segmentCount).toBe(1);
    expect(report.totalRequiredCredits).toBe(2);
    expect(report.hasSufficientCredits).toBe(true);
    expect(report.carrierBreakdown["MTN Uganda"]).toBe(1);
    expect(report.carrierBreakdown["Airtel Uganda"]).toBe(1);
  });

  it("should detect UCS-2 Unicode encoding when emojis or non-GSM characters are used", async () => {
    mockWallet.findUnique.mockResolvedValueOnce({
      smsCredits: 10,
    });

    const report = await DryRunSimulator.simulate({
      userId: "user-1",
      messageText: "Special Flash Sale! 🔥 Save 50% today! 🚀",
      manualRecipients: ["0772123456"],
      purpose: "TRANSACTIONAL",
    });

    expect(report.encoding).toBe("UCS-2");
    expect(report.characterCount).toBeGreaterThan(0);
  });

  it("should flag insufficient credits when user wallet balance is lower than required", async () => {
    mockWallet.findUnique.mockResolvedValueOnce({
      smsCredits: 1, // Only 1 credit
    });

    const report = await DryRunSimulator.simulate({
      userId: "user-1",
      messageText: "Notice of maintenance.",
      manualRecipients: ["0772123456", "0752987654"], // Needs 2 credits
      purpose: "TRANSACTIONAL",
    });

    expect(report.totalRequiredCredits).toBe(2);
    expect(report.userAvailableCredits).toBe(1);
    expect(report.hasSufficientCredits).toBe(false);
  });
});
