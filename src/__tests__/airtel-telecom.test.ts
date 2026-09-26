import { describe, it, expect } from 'vitest';
import {
  AIRTEL_SETUP_FEES,
  AIRTEL_ONBOARDING_CHECKLIST,
  calculateAirtelSmsRate,
  calculateAirtelUssdRate,
  validateAirtelSenderId,
} from '@/lib/telecom/airtel-rates';
import { senderIdApplicationSchema } from '@/lib/validations/sender-id';

describe('Airtel Uganda Telecom Specifications & Rate Engine', () => {
  describe('Setup Fees', () => {
    it('defines official Sender ID registration fee as 250,000 UGX (VAT Incl.)', () => {
      expect(AIRTEL_SETUP_FEES.SENDER_ID_REGISTRATION_UGX).toBe(250_000);
      expect(AIRTEL_SETUP_FEES.CURRENCY).toBe('UGX');
      expect(AIRTEL_SETUP_FEES.VAT_INCLUSIVE).toBe(true);
    });
  });

  describe('Bulk SMS Pricing Bands (VAT Incl.)', () => {
    it('calculates Tier 1 rate (Up to 200,000) at 30 UGX', () => {
      const result = calculateAirtelSmsRate(100_000);
      expect(result.ratePerUnit).toBe(30);
      expect(result.totalCostUgx).toBe(3_000_000);
      expect(result.tier.id).toBe('tier-1');
      expect(result.isNegotiable).toBe(false);
    });

    it('calculates Tier 2 rate (200,001 - 500,000) at 28 UGX', () => {
      const result = calculateAirtelSmsRate(300_000);
      expect(result.ratePerUnit).toBe(28);
      expect(result.totalCostUgx).toBe(8_400_000);
      expect(result.tier.id).toBe('tier-2');
    });

    it('calculates Tier 3 rate (500,001 - 1,000,000) at 24 UGX', () => {
      const result = calculateAirtelSmsRate(750_000);
      expect(result.ratePerUnit).toBe(24);
      expect(result.totalCostUgx).toBe(18_000_000);
      expect(result.tier.id).toBe('tier-3');
    });

    it('calculates Tier 4 rate (1,000,001 - 3,000,000) at 19 UGX', () => {
      const result = calculateAirtelSmsRate(2_000_000);
      expect(result.ratePerUnit).toBe(19);
      expect(result.totalCostUgx).toBe(38_000_000);
      expect(result.tier.id).toBe('tier-4');
    });

    it('calculates Tier 5 rate (3,000,001 - 5,000,000) at 15 UGX', () => {
      const result = calculateAirtelSmsRate(4_000_000);
      expect(result.ratePerUnit).toBe(15);
      expect(result.totalCostUgx).toBe(60_000_000);
      expect(result.tier.id).toBe('tier-5');
    });

    it('calculates Tier 6 rate (5,000,001 - 15,000,000) at 10 UGX', () => {
      const result = calculateAirtelSmsRate(10_000_000);
      expect(result.ratePerUnit).toBe(10);
      expect(result.totalCostUgx).toBe(100_000_000);
      expect(result.tier.id).toBe('tier-6');
    });

    it('calculates Tier 7 rate (15,000,001 - 200,000,000) at 5 UGX', () => {
      const result = calculateAirtelSmsRate(50_000_000);
      expect(result.ratePerUnit).toBe(5);
      expect(result.totalCostUgx).toBe(250_000_000);
      expect(result.tier.id).toBe('tier-7');
    });

    it('calculates Tier 8 rate (200,000,001 - Above) at 0.5 UGX and flags negotiable', () => {
      const result = calculateAirtelSmsRate(250_000_000);
      expect(result.ratePerUnit).toBe(0.5);
      expect(result.totalCostUgx).toBe(125_000_000);
      expect(result.tier.id).toBe('tier-8');
      expect(result.isNegotiable).toBe(true);
    });
  });

  describe('Bulk USSD Pricing Bands (VAT Incl.)', () => {
    it('calculates USSD Tier 1 rate (Up to 200,000) at 25 UGX', () => {
      const result = calculateAirtelUssdRate(100_000);
      expect(result.ratePerUnit).toBe(25);
      expect(result.totalCostUgx).toBe(2_500_000);
      expect(result.tier.id).toBe('ussd-tier-1');
    });

    it('calculates USSD Tier 2 rate (200,001 - 500,000) at 24 UGX', () => {
      const result = calculateAirtelUssdRate(400_000);
      expect(result.ratePerUnit).toBe(24);
      expect(result.totalCostUgx).toBe(9_600_000);
      expect(result.tier.id).toBe('ussd-tier-2');
    });

    it('calculates USSD Tier 3 rate (500,001 - 1,000,000) at 23 UGX', () => {
      const result = calculateAirtelUssdRate(800_000);
      expect(result.ratePerUnit).toBe(23);
      expect(result.totalCostUgx).toBe(18_400_000);
      expect(result.tier.id).toBe('ussd-tier-3');
    });

    it('calculates USSD Tier 4 rate (1,000,001 - 4,000,000) at 18 UGX', () => {
      const result = calculateAirtelUssdRate(2_500_000);
      expect(result.ratePerUnit).toBe(18);
      expect(result.totalCostUgx).toBe(45_000_000);
      expect(result.tier.id).toBe('ussd-tier-4');
    });

    it('calculates USSD Tier 5 rate (4,000,001 - 7,000,000) at 16 UGX', () => {
      const result = calculateAirtelUssdRate(6_000_000);
      expect(result.ratePerUnit).toBe(16);
      expect(result.totalCostUgx).toBe(96_000_000);
      expect(result.tier.id).toBe('ussd-tier-5');
    });

    it('calculates USSD Tier 6 rate (7,000,001 - 15,000,000) at 11 UGX', () => {
      const result = calculateAirtelUssdRate(12_000_000);
      expect(result.ratePerUnit).toBe(11);
      expect(result.totalCostUgx).toBe(132_000_000);
      expect(result.tier.id).toBe('ussd-tier-6');
    });

    it('calculates USSD Tier 7 rate (15,000,001 - 150,000,000) at 6 UGX', () => {
      const result = calculateAirtelUssdRate(50_000_000);
      expect(result.ratePerUnit).toBe(6);
      expect(result.totalCostUgx).toBe(300_000_000);
      expect(result.tier.id).toBe('ussd-tier-7');
    });

    it('calculates USSD Tier 8 rate (150,000,001 - Above) at 2.5 UGX and flags negotiable', () => {
      const result = calculateAirtelUssdRate(200_000_000);
      expect(result.ratePerUnit).toBe(2.5);
      expect(result.totalCostUgx).toBe(500_000_000);
      expect(result.tier.id).toBe('ussd-tier-8');
      expect(result.isNegotiable).toBe(true);
    });
  });

  describe('Airtel & UCC Sender ID Validation Engine', () => {
    it('accepts valid alphanumeric sender IDs with underscore and dash', () => {
      const validIds = ['RANGE_SMS', 'RANGE-APP', 'RANGESMS1', 'AIRTEL_UG'];
      for (const id of validIds) {
        const result = validateAirtelSenderId(id);
        expect(result.isValid).toBe(true);
        expect(result.isAlphanumeric).toBe(true);
        expect(result.requiresUccApproval).toBe(false);
      }
    });

    it('detects numeric sender IDs and flags UCC regulatory approval requirement', () => {
      const result = validateAirtelSenderId('12345');
      expect(result.isValid).toBe(true);
      expect(result.isNumeric).toBe(true);
      expect(result.requiresUccApproval).toBe(true);
      expect(result.warnings?.[0]).toContain('Uganda Communications Commission');
    });

    it('rejects sender IDs that are too short (< 3 chars)', () => {
      const result = validateAirtelSenderId('AB');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('rejects sender IDs exceeding 11 characters', () => {
      const result = validateAirtelSenderId('RANGE_BULK_SMS'); // 14 chars
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot exceed 11 characters');
    });

    it('rejects sender IDs containing spaces', () => {
      const result = validateAirtelSenderId('RANGE SMS');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Spaces are not allowed');
    });

    it('rejects sender IDs containing brackets or parentheses', () => {
      expect(validateAirtelSenderId('RANGE(1)').isValid).toBe(false);
      expect(validateAirtelSenderId('RANGE[1]').isValid).toBe(false);
      expect(validateAirtelSenderId('RANGE{1}').isValid).toBe(false);
    });

    it('rejects special characters other than underscore and dash', () => {
      expect(validateAirtelSenderId('RANGE@SMS').isValid).toBe(false);
      expect(validateAirtelSenderId('RANGE!SMS').isValid).toBe(false);
      expect(validateAirtelSenderId('RANGE#1').isValid).toBe(false);
    });
  });

  describe('Zod Validation Schema Compliance', () => {
    it('validates compliant sender IDs against senderIdApplicationSchema', () => {
      const parseResult = senderIdApplicationSchema.safeParse({
        senderId: 'RANGE_SMS',
        purpose: 'Transactional OTP alerts and account balance notifications',
      });
      expect(parseResult.success).toBe(true);
    });

    it('rejects spaces in senderIdApplicationSchema', () => {
      const parseResult = senderIdApplicationSchema.safeParse({
        senderId: 'RANGE SMS',
        purpose: 'Transactional OTP alerts and notifications',
      });
      expect(parseResult.success).toBe(false);
    });

    it('rejects brackets in senderIdApplicationSchema', () => {
      const parseResult = senderIdApplicationSchema.safeParse({
        senderId: 'RANGE[1]',
        purpose: 'Transactional OTP alerts and notifications',
      });
      expect(parseResult.success).toBe(false);
    });
  });

  describe('Onboarding KYC Checklist', () => {
    it('contains all required Airtel & UCC contracting documents', () => {
      const ids = AIRTEL_ONBOARDING_CHECKLIST.map((item) => item.id);
      expect(ids).toContain('auth_letter');
      expect(ids).toContain('cert_incorporation');
      expect(ids).toContain('memarts');
      expect(ids).toContain('tin_certificate');
      expect(ids).toContain('source_ip_whitelisting');
    });
  });
});
