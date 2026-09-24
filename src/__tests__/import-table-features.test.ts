import { describe, it, expect } from 'vitest';
import { getPhoneCarrierInfo } from '@/components/sms/carrier-badge';
import { isValidEmail } from '@/utils/validation';

describe('Contacts Import: Carrier Detection & Preview Table Features', () => {
  describe('Carrier Detection via getPhoneCarrierInfo', () => {
    it('detects Uganda Airtel and MTN numbers', () => {
      const airtel = getPhoneCarrierInfo('+256700123456');
      expect(airtel.brand.toLowerCase()).toContain('airtel');
      expect(airtel.isValid).toBe(true);
      expect(airtel.countryName).toBe('Uganda');

      const mtn = getPhoneCarrierInfo('+256772987654');
      expect(mtn.brand.toLowerCase()).toContain('mtn');
      expect(mtn.isValid).toBe(true);
      expect(mtn.countryName).toBe('Uganda');
    });

    it('detects Kenya Safaricom numbers', () => {
      const safaricom = getPhoneCarrierInfo('+254712345678');
      expect(safaricom.brand.toLowerCase()).toContain('safaricom');
      expect(safaricom.isValid).toBe(true);
      expect(safaricom.countryName).toBe('Kenya');
    });

    it('detects Tanzania Vodacom numbers', () => {
      const vodacom = getPhoneCarrierInfo('+255754123456');
      expect(vodacom.brand.toLowerCase()).toContain('vodacom');
      expect(vodacom.isValid).toBe(true);
      expect(vodacom.countryName).toBe('Tanzania');
    });

    it('detects Rwanda MTN numbers', () => {
      const rwandacell = getPhoneCarrierInfo('+250788123456');
      expect(rwandacell.brand.toLowerCase()).toContain('mtn');
      expect(rwandacell.isValid).toBe(true);
      expect(rwandacell.countryName).toBe('Rwanda');
    });

    it('correctly flags invalid numbers', () => {
      const invalid = getPhoneCarrierInfo('12345');
      expect(invalid.isValid).toBe(false);

      const empty = getPhoneCarrierInfo('');
      expect(empty.isValid).toBe(false);
    });
  });

  describe('Search, Filter & Pagination Logic', () => {
    const mockRows = [
      { phone: '+256700123456', first: 'John', last: 'Mukasa', email: 'john@example.com' },
      { phone: '+256772987654', first: 'Sarah', last: 'Nsubuga', email: 'sarah@example.com' },
      { phone: '+254712345678', first: 'Amina', last: 'Mwangi', email: 'amina@safaricom.co.ke' },
      { phone: '+255754123456', first: 'Juma', last: 'Hassan', email: 'juma@vodacom.co.tz' },
      { phone: '+250788123456', first: 'Jean-Paul', last: 'Habimana', email: 'jp@bk.rw' },
      { phone: 'invalid-num-1', first: 'Bad', last: 'Number', email: 'bad@example.com' },
    ];

    it('filters rows by text search (phone, name, or email)', () => {
      const search = 'amina';
      const results = mockRows.filter(r => 
        r.phone.toLowerCase().includes(search) ||
        r.first.toLowerCase().includes(search) ||
        r.last.toLowerCase().includes(search) ||
        r.email.toLowerCase().includes(search)
      );
      expect(results).toHaveLength(1);
      expect(results[0].first).toBe('Amina');
    });

    it('filters rows by network/carrier', () => {
      const mtnRows = mockRows.filter(r => {
        const info = getPhoneCarrierInfo(r.phone);
        return info.brand.toLowerCase().includes('mtn');
      });
      // Sarah (+256772...) and Jean-Paul (+250788...)
      expect(mtnRows).toHaveLength(2);
      expect(mtnRows.map(r => r.first)).toEqual(['Sarah', 'Jean-Paul']);
    });

    it('filters rows by validation status', () => {
      const validRows = mockRows.filter(r => getPhoneCarrierInfo(r.phone).isValid);
      const invalidRows = mockRows.filter(r => !getPhoneCarrierInfo(r.phone).isValid);

      expect(validRows).toHaveLength(5);
      expect(invalidRows).toHaveLength(1);
      expect(invalidRows[0].first).toBe('Bad');
    });

    it('slices data correctly for pagination', () => {
      const pageSize = 2;
      const totalPages = Math.ceil(mockRows.length / pageSize);
      expect(totalPages).toBe(3);

      const page1 = mockRows.slice(0, 2);
      expect(page1).toHaveLength(2);
      expect(page1[0].first).toBe('John');
      expect(page1[1].first).toBe('Sarah');

      const page2 = mockRows.slice(2, 4);
      expect(page2).toHaveLength(2);
      expect(page2[0].first).toBe('Amina');
      expect(page2[1].first).toBe('Juma');

      const page3 = mockRows.slice(4, 6);
      expect(page3).toHaveLength(2);
      expect(page3[0].first).toBe('Jean-Paul');
      expect(page3[1].first).toBe('Bad');
    });
  });

  describe('Inline Table Editing & Cell-Level Issue Detection', () => {
    function analyzeContactRow(row: { phone: string; first?: string; last?: string; email?: string }) {
      const rawPhone = (row.phone || '').trim();
      const carrierInfo = getPhoneCarrierInfo(rawPhone);
      const email = (row.email || '').trim();

      let phoneError: string | undefined;
      if (!rawPhone) {
        phoneError = 'Missing phone number';
      } else if (!carrierInfo.isValid) {
        phoneError = carrierInfo.error || 'Invalid phone format';
      }

      let emailError: string | undefined;
      if (email.length > 0 && !isValidEmail(email)) {
        emailError = 'Invalid email address format';
      }

      const isValid = !phoneError && !emailError;

      return {
        phoneError,
        emailError,
        isValid,
        carrierInfo,
        hasDangerStripes: !isValid,
      };
    }

    it('identifies exact phone issue when phone number is too short or invalid', () => {
      const row = { phone: '07001234', email: 'valid@example.com' };
      const analysis = analyzeContactRow(row);

      expect(analysis.isValid).toBe(false);
      expect(analysis.hasDangerStripes).toBe(true);
      expect(analysis.phoneError).toBeDefined();
      expect(analysis.emailError).toBeUndefined();
    });

    it('identifies exact email issue when email format is invalid', () => {
      const row = { phone: '+256700123456', email: 'invalid-email-address' };
      const analysis = analyzeContactRow(row);

      expect(analysis.isValid).toBe(false);
      expect(analysis.hasDangerStripes).toBe(true);
      expect(analysis.phoneError).toBeUndefined();
      expect(analysis.emailError).toBe('Invalid email address format');
    });

    it('identifies both phone and email issues on a corrupted contact', () => {
      const row = { phone: 'not-a-number', email: 'not-an-email' };
      const analysis = analyzeContactRow(row);

      expect(analysis.isValid).toBe(false);
      expect(analysis.hasDangerStripes).toBe(true);
      expect(analysis.phoneError).toBeDefined();
      expect(analysis.emailError).toBe('Invalid email address format');
    });

    it('simulates inline editing: fixing an invalid phone immediately clears danger stripes and updates carrier', () => {
      // Step 1: Initial corrupted record with danger stripes
      const initialRow = { phone: '07001234', first: 'David', last: 'Kasozi', email: 'david@example.com' };
      const beforeEdit = analyzeContactRow(initialRow);
      expect(beforeEdit.isValid).toBe(false);
      expect(beforeEdit.hasDangerStripes).toBe(true);

      // Step 2: User performs inline edit directly in the table
      const editedRow = { ...initialRow, phone: '+256700123456' };
      const afterEdit = analyzeContactRow(editedRow);

      // Step 3: Danger stripes disappear, status becomes valid, and network is detected as Airtel
      expect(afterEdit.isValid).toBe(true);
      expect(afterEdit.hasDangerStripes).toBe(false);
      expect(afterEdit.phoneError).toBeUndefined();
      expect(afterEdit.carrierInfo.brand.toLowerCase()).toContain('airtel');
    });

    it('handles dual status filtering with dynamic counts across valid and invalid records', () => {
      const batch = [
        { phone: '+256700123456', email: 'user1@example.com' }, // valid
        { phone: '+256772987654', email: 'user2@example.com' }, // valid
        { phone: 'bad-phone-1', email: 'user3@example.com' },   // invalid phone
        { phone: '+256701112233', email: 'bad-email' },         // invalid email
      ];

      const analyzed = batch.map(analyzeContactRow);
      const totalCount = analyzed.length;
      const validCount = analyzed.filter(r => r.isValid).length;
      const invalidCount = analyzed.filter(r => !r.isValid).length;

      expect(totalCount).toBe(4);
      expect(validCount).toBe(2);
      expect(invalidCount).toBe(2);

      // Filter: Valid Only
      const validSection = analyzed.filter(r => r.isValid);
      expect(validSection).toHaveLength(2);

      // Filter: Invalid Only
      const invalidSection = analyzed.filter(r => !r.isValid);
      expect(invalidSection).toHaveLength(2);
      expect(invalidSection.every(r => r.hasDangerStripes)).toBe(true);
    });
  });
});
