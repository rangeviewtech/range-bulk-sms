import { describe, it, expect } from "vitest";
import { ABTestingEngine } from "../lib/campaigns/ab-testing-engine";

describe("ABTestingEngine (A/B Testing & Audience Holdouts)", () => {
  const sampleRecipients = Array.from({ length: 100 }, (_, i) => `+256772000${String(i).padStart(3, "0")}`);

  it("should correctly partition audience into Variant A, B, Holdout, and Winner pool", () => {
    const result = ABTestingEngine.splitAudience(sampleRecipients, {
      variantAPercentage: 10,
      variantBPercentage: 10,
      holdoutPercentage: 5,
      kpiMetric: "DELIVERY_RATE",
    });

    expect(result.variantARecipients.length).toBe(10);
    expect(result.variantBRecipients.length).toBe(10);
    expect(result.holdoutRecipients.length).toBe(5);
    expect(result.remainingWinnerRecipients.length).toBe(75);

    // Sum of all subsets must equal total input
    const totalPartitioned =
      result.variantARecipients.length +
      result.variantBRecipients.length +
      result.holdoutRecipients.length +
      result.remainingWinnerRecipients.length;
    expect(totalPartitioned).toBe(100);
  });

  it("should accurately determine winner based on delivery rate", () => {
    const winner = ABTestingEngine.determineWinner(
      { totalSent: 100, delivered: 95 }, // 95%
      { totalSent: 100, delivered: 85 }, // 85%
      "DELIVERY_RATE"
    );

    expect(winner).toBe("VARIANT_A");
  });

  it("should accurately determine winner based on click rate", () => {
    const winner = ABTestingEngine.determineWinner(
      { totalSent: 100, delivered: 90, clicks: 12 }, // 12%
      { totalSent: 100, delivered: 90, clicks: 25 }, // 25%
      "CLICK_RATE"
    );

    expect(winner).toBe("VARIANT_B");
  });
});
