import { describe, it, expect } from 'vitest';
import { analyzePhone } from '@/lib/sms/phone-analyzer';

describe('Phone Number Analyzer & Regulator Allocation Engine', () => {
  describe('Uganda (UCC) Regulator Allocations', () => {
    it('identifies Airtel Uganda mobile prefixes (+256 70x, 740-746, 75x)', () => {
      const p70 = analyzePhone('+256700123456');
      expect(p70.validity).toBe('valid_pattern');
      expect(p70.status).toBe('original_allocation_identified');
      expect(p70.original_allocation?.operator).toBe('Airtel Uganda');
      expect(p70.original_allocation?.retailBrand).toBe('Airtel');
      expect(p70.line_type).toBe('MOBILE');

      const p740 = analyzePhone('+256740123456');
      expect(p740.original_allocation?.operator).toBe('Airtel Uganda');

      const p746 = analyzePhone('+256746123456');
      expect(p746.original_allocation?.operator).toBe('Airtel Uganda');

      const p75 = analyzePhone('+256750123456');
      expect(p75.original_allocation?.operator).toBe('Airtel Uganda');
    });

    it('identifies UTCL (Uganda Telecommunications Corporation / UTL) for 71x', () => {
      const res = analyzePhone('+256712345678');
      expect(res.validity).toBe('valid_pattern');
      expect(res.status).toBe('original_allocation_identified');
      expect(res.original_allocation?.operator).toContain('UTCL');
      expect(res.original_allocation?.operator).not.toContain('Airtel');
      expect(res.original_allocation?.operator).not.toContain('MTN');
    });

    it('identifies MTN Uganda mobile prefixes (+256 760-768, 77x, 78x, and dated 790 grant)', () => {
      const p77 = analyzePhone('+256770123456');
      expect(p77.original_allocation?.operator).toBe('MTN Uganda');
      expect(p77.original_allocation?.retailBrand).toBe('MTN');

      const p78 = analyzePhone('+256780123456');
      expect(p78.original_allocation?.operator).toBe('MTN Uganda');

      const p760 = analyzePhone('+256760123456');
      expect(p760.original_allocation?.operator).toBe('MTN Uganda');

      const p768 = analyzePhone('+256768123456');
      expect(p768.original_allocation?.operator).toBe('MTN Uganda');

      // March 12, 2025 UCC grant
      const p790 = analyzePhone('+256790123456');
      expect(p790.validity).toBe('valid_pattern');
      expect(p790.status).toBe('original_allocation_identified');
      expect(p790.original_allocation?.operator).toBe('MTN Uganda');
      expect(p790.original_allocation?.notes).toContain('0790 grant');
    });

    it('correctly reports unallocated/unknown for negative neighbors (791, 747-749, 769)', () => {
      // 791 is explicitly unallocated in the dated UCC overlay
      const p791 = analyzePhone('+256791123456');
      expect(p791.validity).toBe('valid_pattern'); // Number itself is structurally valid 9-digit
      expect(p791.status).toBe('valid_carrier_unknown');
      expect(p791.original_allocation).toBeNull();

      // 747 is not part of Airtel's 740-746 grant
      const p747 = analyzePhone('+256747123456');
      expect(p747.status).toBe('valid_carrier_unknown');

      // 769 is not part of MTN's 760-768 grant
      const p769 = analyzePhone('+256769123456');
      expect(p769.status).toBe('valid_carrier_unknown');
    });

    it('identifies narrow grants (Hamilton 7240, Lycamobile 726/727, Talkio 7280)', () => {
      const ham = analyzePhone('+256724012345');
      expect(ham.original_allocation?.operator).toBe('Hamilton Telecom');

      const lyca = analyzePhone('+256726123456');
      expect(lyca.original_allocation?.operator).toContain('Lycamobile');

      const talkio = analyzePhone('+256728012345');
      expect(talkio.original_allocation?.operator).toBe('Talkio Telecom');
    });

    it('normalizes domestic trunk 0 into valid international E.164 (+256)', () => {
      const res = analyzePhone('0770123456', { defaultRegion: 'UG' });
      expect(res.validity).toBe('valid_pattern');
      expect(res.e164).toBe('+256770123456');
      expect(res.display.national).toBe('0770 123 456');
      expect(res.display.international).toBe('+256 770 123 456');
      expect(res.original_allocation?.operator).toBe('MTN Uganda');
    });
  });

  describe('Nigeria (NCC) Regulator Allocations', () => {
    it('identifies MTN Nigeria prefixes', () => {
      const res = analyzePhone('+2348031234567');
      expect(res.validity).toBe('valid_pattern');
      expect(res.original_allocation?.operator).toBe('MTN Nigeria');
    });

    it('identifies Airtel Nigeria prefixes', () => {
      const res = analyzePhone('+2348021234567');
      expect(res.original_allocation?.operator).toBe('Airtel Nigeria');
    });

    it('identifies Globacom (Glo) prefixes', () => {
      const res = analyzePhone('+2348051234567');
      expect(res.original_allocation?.operator).toBe('Globacom');
    });

    it('identifies 9mobile (EMTS) prefixes', () => {
      const res = analyzePhone('+2348091234567');
      expect(res.original_allocation?.operator).toContain('9mobile');
    });

    it('distinguishes narrow partial boundaries 7025 (MTN) vs 7023 (Openskys)', () => {
      const mtn = analyzePhone('+2347025123456');
      expect(mtn.original_allocation?.operator).toBe('MTN Nigeria');

      const open = analyzePhone('+2347023123456');
      expect(open.original_allocation?.operator).toBe('Openskys');
    });
  });

  describe('Tanzania (TCRA) Regulator Allocations', () => {
    it('identifies Vodacom Tanzania', () => {
      const res = analyzePhone('+255754123456');
      expect(res.original_allocation?.operator).toBe('Vodacom Tanzania');
    });

    it('identifies Airtel Tanzania', () => {
      const res = analyzePhone('+255784123456');
      expect(res.original_allocation?.operator).toBe('Airtel Tanzania');
    });

    it('identifies Tigo (Honora)', () => {
      const res = analyzePhone('+255713123456');
      expect(res.original_allocation?.retailBrand).toBe('Tigo');
    });

    it('identifies Halotel (Viettel)', () => {
      const res = analyzePhone('+255621123456');
      expect(res.original_allocation?.retailBrand).toBe('Halotel');
    });

    it('identifies TTCL', () => {
      const res = analyzePhone('+255732123456');
      expect(res.original_allocation?.retailBrand).toBe('TTCL');
    });
  });

  describe('Telecom Accuracy & Integrity', () => {
    it('preserves significant 0 in Italian/Vatican fixed lines (+39 06698...)', () => {
      const res = analyzePhone('+390669812345');
      expect(res.validity).toBe('valid_pattern');
      expect(res.e164).toBe('+390669812345');
      expect(res.country?.iso2).toBe('VA');
      expect(res.display.international).toContain('+39 0669812345');
    });

    it('returns needs_region for ambiguous domestic numbers without authorized default', () => {
      const res = analyzePhone('0770123456', { defaultRegion: '' });
      expect(res.validity).toBe('needs_region');
      expect(res.status).toBe('needs_region');
      expect(res.e164).toBeNull();
    });

    it('handles mobileOnly rejection on fixed-line numbers', () => {
      const fixedRes = analyzePhone('+256393123456', { mobileOnly: true });
      expect(fixedRes.validity).toBe('invalid_pattern');
      expect(fixedRes.error).toContain('FIXED_LINE');
    });

    it('returns the exact JSON response schema contract including claims and national_significant_number', () => {
      const res = analyzePhone('+256770123456');
      expect(res).toHaveProperty('validity');
      expect(res).toHaveProperty('status');
      expect(res).toHaveProperty('e164', '+256770123456');
      expect(res).toHaveProperty('national_significant_number', '770123456');
      expect(res).toHaveProperty('display');
      expect(res).toHaveProperty('country');
      expect(res).toHaveProperty('line_type', 'MOBILE');
      expect(res).toHaveProperty('original_allocation');
      expect(res).toHaveProperty('metadata_carrier', 'MTN');
      expect(res).toHaveProperty('current_carrier', null); // Original allocation NOT conflated with current carrier
      expect(res).toHaveProperty('metadata_version');
      expect(res).toHaveProperty('ported_possible', 'not_determined');
      expect(res).toHaveProperty('reachability', 'not_checked');
      expect(res).toHaveProperty('ownership', 'not_checked');
      expect(res).toHaveProperty('claims');
      expect(res.claims).toEqual({
        input_accepted: true,
        possible_length: true,
        valid_number_pattern: true,
        numbering_region_resolved: true,
        line_type_classified: true,
        original_allocation_holder_identified: true,
        retail_brand_identified: true,
        current_carrier_verified: false,
        reachable: false,
        user_controls_number: false,
      });
      expect(res).toHaveProperty('warnings');
    });

    it('correctly populates national_significant_number across different numbering formats', () => {
      // Uganda domestic
      const ugDomestic = analyzePhone('0770123456', { defaultRegion: 'UG' });
      expect(ugDomestic.national_significant_number).toBe('770123456');

      // Nigeria international
      const ngInt = analyzePhone('+2348031234567');
      expect(ngInt.national_significant_number).toBe('8031234567');

      // Italy significant 0
      const itSig = analyzePhone('+390669812345');
      expect(itSig.national_significant_number).toBe('0669812345');
    });
  });

  describe('Carrier Lookup Adapter & analyzePhoneAsync', () => {
    it('requires explicit user consent to invoke live carrier lookup', async () => {
      const { analyzePhoneAsync } = await import('@/lib/sms/phone-analyzer');
      const res = await analyzePhoneAsync('+256770123456', {
        enableLiveLookup: true,
        userConsent: false,
      });

      expect(res.validity).toBe('valid_pattern');
      expect(res.current_carrier).toBeNull();
      expect(res.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('explicit user consent')])
      );
    });

    it('returns current carrier and verifies claim when live lookup succeeds with consent', async () => {
      const { analyzePhoneAsync } = await import('@/lib/sms/phone-analyzer');
      const res = await analyzePhoneAsync('+256770123456', {
        enableLiveLookup: true,
        userConsent: true,
      });

      expect(res.validity).toBe('valid_pattern');
      expect(res.original_allocation?.retailBrand).toBe('MTN');
      expect(res.current_carrier).toBe('MTN Uganda');
      expect(res.claims.current_carrier_verified).toBe(true);
      expect(res.ported_possible).toBe('no');
    });

    it('detects ported number in deterministic fixture (+256770999999: MTN allocated -> Airtel current)', async () => {
      const { analyzePhoneAsync } = await import('@/lib/sms/phone-analyzer');
      const res = await analyzePhoneAsync('+256770999999', {
        enableLiveLookup: true,
        userConsent: true,
      });

      expect(res.validity).toBe('valid_pattern');
      // Original allocation is MTN Uganda
      expect(res.original_allocation?.retailBrand).toBe('MTN');
      expect(res.original_allocation?.operator).toBe('MTN Uganda');
      // Current carrier is Airtel Uganda (simulated ported subscriber)
      expect(res.current_carrier).toBe('Airtel Uganda');
      expect(res.ported_possible).toBe('yes');
      expect(res.claims.current_carrier_verified).toBe(true);
    });
  });
});
