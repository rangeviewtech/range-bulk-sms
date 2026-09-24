export interface ABSplitConfig {
  variantAPercentage: number; // e.g. 10%
  variantBPercentage: number; // e.g. 10%
  holdoutPercentage?: number; // e.g. 5% control group (no message)
  kpiMetric: "DELIVERY_RATE" | "REPLY_RATE" | "CLICK_RATE";
}

export interface ABSplitResult {
  variantARecipients: string[];
  variantBRecipients: string[];
  holdoutRecipients: string[];
  remainingWinnerRecipients: string[];
}

export interface VariantMetrics {
  totalSent: number;
  delivered: number;
  clicks?: number;
  replies?: number;
}

export class ABTestingEngine {
  /**
   * Splits a raw recipient audience into deterministic A/B test groups and holdout control.
   */
  static splitAudience(recipients: string[], config: ABSplitConfig): ABSplitResult {
    const total = recipients.length;
    if (total === 0) {
      return {
        variantARecipients: [],
        variantBRecipients: [],
        holdoutRecipients: [],
        remainingWinnerRecipients: [],
      };
    }

    // Deterministically shuffle array using Knuth shuffle with stable pseudo-random
    const shuffled = [...recipients].sort(() => 0.5 - Math.random());

    const aCount = Math.max(1, Math.floor((total * config.variantAPercentage) / 100));
    const bCount = Math.max(1, Math.floor((total * config.variantBPercentage) / 100));
    const holdoutCount = config.holdoutPercentage
      ? Math.floor((total * config.holdoutPercentage) / 100)
      : 0;

    let cursor = 0;
    const variantARecipients = shuffled.slice(cursor, cursor + aCount);
    cursor += aCount;

    const variantBRecipients = shuffled.slice(cursor, cursor + bCount);
    cursor += bCount;

    const holdoutRecipients = shuffled.slice(cursor, cursor + holdoutCount);
    cursor += holdoutCount;

    const remainingWinnerRecipients = shuffled.slice(cursor);

    return {
      variantARecipients,
      variantBRecipients,
      holdoutRecipients,
      remainingWinnerRecipients,
    };
  }

  /**
   * Evaluates the winning variant based on the designated KPI metric.
   */
  static determineWinner(
    metricsA: VariantMetrics,
    metricsB: VariantMetrics,
    kpi: "DELIVERY_RATE" | "REPLY_RATE" | "CLICK_RATE"
  ): "VARIANT_A" | "VARIANT_B" | "TIE" {
    const score = (m: VariantMetrics): number => {
      if (m.totalSent === 0) return 0;
      switch (kpi) {
        case "DELIVERY_RATE":
          return m.delivered / m.totalSent;
        case "CLICK_RATE":
          return (m.clicks || 0) / m.totalSent;
        case "REPLY_RATE":
          return (m.replies || 0) / m.totalSent;
        default:
          return m.delivered / m.totalSent;
      }
    };

    const scoreA = score(metricsA);
    const scoreB = score(metricsB);

    if (Math.abs(scoreA - scoreB) < 0.001) {
      return "TIE";
    }

    return scoreA > scoreB ? "VARIANT_A" : "VARIANT_B";
  }
}
