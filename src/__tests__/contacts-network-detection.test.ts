import { describe, it, expect } from 'vitest';
import { getPhoneCarrierInfo } from '@/components/sms/carrier-badge';
import { getPhoneCountry } from '@/components/sms/country-flag-phone';
import { analyzePhone } from '@/lib/sms/phone-analyzer';
import { sanitizeSinglePhoneInput, extractValidCountryCode } from '@/lib/sms/normalizer';

describe('Contacts Global Phone Validation & Network Detection', () => {
  const sampleContacts = [
    { id: '1', firstName: 'John', lastName: 'Mukasa', phone: '+256700123456', status: 'ACTIVE' },
    { id: '2', firstName: 'Sarah', lastName: 'Nsubuga', phone: '+256772987654', status: 'ACTIVE' },
    { id: '3', firstName: 'David', lastName: 'Kato', phone: '+256752345678', status: 'ACTIVE' },
    { id: '4', firstName: 'Esther', lastName: 'Akello', phone: '+256784567890', status: 'ACTIVE' },
    { id: '5', firstName: 'Brian', lastName: 'Ochieng', phone: '+254722123456', status: 'ACTIVE' }, // Kenya Safaricom
    { id: '6', firstName: 'Amina', lastName: 'Bello', phone: '+2348031234567', status: 'ACTIVE' }, // Nigeria MTN
    { id: '7', firstName: 'James', lastName: 'Smith', phone: '+12025550123', status: 'ACTIVE' }, // US
  ];

  describe('Telecom Carrier Route Detection for Contacts', () => {
    it('detects Uganda Airtel numbers accurately', () => {
      const info = getPhoneCarrierInfo('+256700123456');
      expect(info.brand).toBe('Airtel');
      expect(info.operator).toContain('Airtel');
      expect(info.countryName).toBe('Uganda');
      expect(info.iso2).toBe('ug');
      expect(info.isValid).toBe(true);
    });

    it('detects Uganda MTN numbers accurately', () => {
      const info = getPhoneCarrierInfo('+256772987654');
      expect(info.brand).toBe('MTN');
      expect(info.operator).toContain('MTN');
      expect(info.countryName).toBe('Uganda');
      expect(info.iso2).toBe('ug');
      expect(info.isValid).toBe(true);
    });

    it('detects Kenya Safaricom numbers accurately', () => {
      const info = getPhoneCarrierInfo('+254722123456');
      expect(info.brand).toBe('Safaricom');
      expect(info.countryName).toBe('Kenya');
      expect(info.iso2).toBe('ke');
      expect(info.isValid).toBe(true);
    });

    it('detects Nigeria MTN numbers accurately', () => {
      const info = getPhoneCarrierInfo('+2348031234567');
      expect(info.brand).toBe('MTN');
      expect(info.countryName).toBe('Nigeria');
      expect(info.iso2).toBe('ng');
      expect(info.isValid).toBe(true);
    });

    it('detects international numbers with proper country metadata', () => {
      const info = getPhoneCarrierInfo('+12025550123');
      expect(info.countryName).toBe('United States');
      expect(info.iso2).toBe('us');
      expect(info.isValid).toBe(true);
    });

    it('identifies line types for mobile and fixed lines', () => {
      const mobileRes = analyzePhone('+256772987654');
      expect(mobileRes.line_type).toBe('MOBILE');

      const fixedRes = analyzePhone('+256414123456');
      expect(fixedRes.line_type).toBe('FIXED_LINE');
    });
  });

  describe('Dynamic Carrier Aggregation & Contacts Table Filtering', () => {
    it('aggregates available networks with accurate counts', () => {
      const map = new Map<string, number>();
      sampleContacts.forEach((c) => {
        const info = getPhoneCarrierInfo(c.phone);
        const brand = info.brand || 'Unknown';
        map.set(brand, (map.get(brand) || 0) + 1);
      });

      const aggregated = Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));

      expect(aggregated.find((item) => item.name === 'MTN')?.count).toBe(3); // 2 in Uganda + 1 in Nigeria
      expect(aggregated.find((item) => item.name === 'Airtel')?.count).toBe(2); // 2 in Uganda
      expect(aggregated.find((item) => item.name === 'Safaricom')?.count).toBe(1); // 1 in Kenya
    });

    it('filters contacts by carrier network', () => {
      const filterByCarrier = (carrier: string) => {
        if (carrier === 'ALL') return sampleContacts;
        return sampleContacts.filter((c) => {
          const info = getPhoneCarrierInfo(c.phone);
          return info.brand.toLowerCase() === carrier.toLowerCase();
        });
      };

      const mtnContacts = filterByCarrier('MTN');
      expect(mtnContacts).toHaveLength(3);
      expect(mtnContacts.map((c) => c.firstName)).toEqual(['Sarah', 'Esther', 'Amina']);

      const airtelContacts = filterByCarrier('Airtel');
      expect(airtelContacts).toHaveLength(2);
      expect(airtelContacts.map((c) => c.firstName)).toEqual(['John', 'David']);

      const safaricomContacts = filterByCarrier('Safaricom');
      expect(safaricomContacts).toHaveLength(1);
      expect(safaricomContacts[0].firstName).toBe('Brian');
    });

    it('matches search terms by carrier brand or operator name', () => {
      const searchContacts = (query: string) => {
        const lower = query.toLowerCase();
        return sampleContacts.filter((c) => {
          const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ').toLowerCase();
          const info = getPhoneCarrierInfo(c.phone);
          return (
            fullName.includes(lower) ||
            c.phone.includes(lower) ||
            info.brand.toLowerCase().includes(lower) ||
            info.operator.toLowerCase().includes(lower)
          );
        });
      };

      const searchMtn = searchContacts('MTN');
      expect(searchMtn).toHaveLength(3);

      const searchSafaricom = searchContacts('Safaricom');
      expect(searchSafaricom).toHaveLength(1);
      expect(searchSafaricom[0].firstName).toBe('Brian');
    });
  });

  describe('Country Code Selection & Phone Normalization', () => {
    it('sanitizes phone number input cleanly', () => {
      expect(sanitizeSinglePhoneInput('+256 (700) 123-456')).toBe('+256700123456');
      expect(sanitizeSinglePhoneInput('0700-123-456')).toBe('0700123456');
      expect(sanitizeSinglePhoneInput('abc+256xyz700')).toBe('+256700');
    });

    it('resolves country flag metadata across diverse countries', () => {
      const ug = getPhoneCountry('+256700123456');
      expect(ug?.iso2).toBe('ug');
      expect(ug?.name).toBe('Uganda');

      const ke = getPhoneCountry('+254722123456');
      expect(ke?.iso2).toBe('ke');
      expect(ke?.name).toBe('Kenya');

      const gb = getPhoneCountry('+447911123456');
      expect(gb?.iso2).toBe('gb');
      expect(gb?.name).toBe('United Kingdom');
    });

    it('correctly swaps country dialing code while preserving local digits', () => {
      const replaceCallingCode = (current: string, newDialCode: string) => {
        const trimmed = current.trim();
        if (!trimmed) return newDialCode;
        if (trimmed.startsWith('0')) {
          return `${newDialCode}${trimmed.slice(1)}`;
        }
        if (trimmed.startsWith('+')) {
          const detected = extractValidCountryCode(trimmed);
          if (detected && trimmed.startsWith(detected)) {
            return `${newDialCode}${trimmed.slice(detected.length)}`;
          }
          return `${newDialCode}${trimmed.replace(/^\+\d{1,3}/, '')}`;
        }
        return `${newDialCode}${trimmed}`;
      };

      // Swap Uganda to Kenya
      expect(replaceCallingCode('+256700123456', '+254')).toBe('+254700123456');

      // Convert local Uganda trunk 0 to UK +44
      expect(replaceCallingCode('0700123456', '+44')).toBe('+44700123456');

      // Prepend to empty input
      expect(replaceCallingCode('', '+1')).toBe('+1');
    });
  });
});
