import { describe, it, expect, vi } from "vitest";
import { RegulatoryEngine } from "../lib/compliance/regulatory-engine";

vi.mock("../lib/prisma", () => ({
  prisma: {
    contact: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    consentLog: {
      create: vi.fn(),
    },
  },
  ConsentPurpose: {
    MARKETING: "MARKETING",
    TRANSACTIONAL: "TRANSACTIONAL",
    SYSTEM: "SYSTEM",
  },
  ConsentAction: {
    COMPLAINT: "COMPLAINT",
  },
}));

describe("RegulatoryEngine (UCC Compliance & Quiet Hours)", () => {
  describe("isQuietHours", () => {
    it("should flag quiet hours during night time (e.g. 21:00 / 9:00 PM EAT)", () => {
      // 18:00 UTC = 21:00 EAT (UTC+3)
      const nightDate = new Date("2026-09-22T18:00:00Z");
      const { isQuiet, localHour } = RegulatoryEngine.isQuietHours(nightDate, "Africa/Kampala");

      expect(isQuiet).toBe(true);
      expect(localHour).toBe(21);
    });

    it("should flag quiet hours early morning (e.g. 05:00 / 5:00 AM EAT)", () => {
      // 02:00 UTC = 05:00 EAT
      const earlyMorning = new Date("2026-09-22T02:00:00Z");
      const { isQuiet, localHour } = RegulatoryEngine.isQuietHours(earlyMorning, "Africa/Kampala");

      expect(isQuiet).toBe(true);
      expect(localHour).toBe(5);
    });

    it("should allow sending during commercial hours (e.g. 14:00 / 2:00 PM EAT)", () => {
      // 11:00 UTC = 14:00 EAT
      const dayDate = new Date("2026-09-22T11:00:00Z");
      const { isQuiet, localHour } = RegulatoryEngine.isQuietHours(dayDate, "Africa/Kampala");

      expect(isQuiet).toBe(false);
      expect(localHour).toBe(14);
    });
  });

  describe("verifyPreDispatchCompliance", () => {
    it("should block marketing messages during UCC quiet hours", async () => {
      const nightDate = new Date("2026-09-22T19:30:00Z"); // 22:30 EAT
      const result = await RegulatoryEngine.verifyPreDispatchCompliance({
        phone: "+256772123456",
        message: "Huge 50% discount today!",
        purpose: "MARKETING",
        timestamp: nightDate,
      });

      expect(result.allowed).toBe(false);
      expect(result.code).toBe("QUIET_HOURS");
      expect(result.reason).toMatch(/Uganda Communications Commission/);
    });

    it("should allow transactional OTP messages even during quiet hours", async () => {
      const nightDate = new Date("2026-09-22T19:30:00Z"); // 22:30 EAT
      const result = await RegulatoryEngine.verifyPreDispatchCompliance({
        phone: "+256772123456",
        message: "Your OTP is 839201",
        purpose: "TRANSACTIONAL",
        timestamp: nightDate,
      });

      expect(result.allowed).toBe(true);
    });

    it("should block commercial broadcasts routed over personal hardware gateways", async () => {
      const dayDate = new Date("2026-09-22T11:00:00Z");
      const result = await RegulatoryEngine.verifyPreDispatchCompliance({
        phone: "+256772123456",
        message: "Special promotion!",
        purpose: "MARKETING",
        isHardwareGateway: true,
        timestamp: dayDate,
      });

      expect(result.allowed).toBe(false);
      expect(result.code).toBe("UNLICENSED_ROUTE");
    });
  });
});
