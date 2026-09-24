import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as analyzeRoute } from '@/app/api/v1/phone/analyze/route';
import { GET as regionsRoute } from '@/app/api/v1/phone/regions/route';
import { GET as operatorsRoute } from '@/app/api/v1/phone/regions/[region]/operators/route';
import { GET as dataStatusRoute } from '@/app/api/v1/phone/data-status/route';

describe('Global Telephone Number Public API Endpoints (/api/v1/phone/*)', () => {
  describe('POST /api/v1/phone/analyze', () => {
    it('analyzes standard international number and returns 200 with claims', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/analyze', {
        method: 'POST',
        body: JSON.stringify({ phone: '+256770123456' }),
      });

      const res = await analyzeRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.validity).toBe('valid_pattern');
      expect(data.e164).toBe('+256770123456');
      expect(data.national_significant_number).toBe('770123456');
      expect(data.original_allocation.retailBrand).toBe('MTN');
      expect(data.current_carrier).toBeNull();
      expect(data.claims.valid_number_pattern).toBe(true);
      expect(data.claims.current_carrier_verified).toBe(false);
    });

    it('analyzes domestic number with defaultRegion and returns normalized E.164', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/analyze', {
        method: 'POST',
        body: JSON.stringify({ phone: '0700123456', defaultRegion: 'UG' }),
      });

      const res = await analyzeRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.validity).toBe('valid_pattern');
      expect(data.e164).toBe('+256700123456');
      expect(data.original_allocation.retailBrand).toBe('Airtel');
    });

    it('performs live lookup with consent and distinguishes ported subscriber', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/analyze', {
        method: 'POST',
        body: JSON.stringify({
          phone: '+256770999999',
          enableLiveLookup: true,
          userConsent: true,
        }),
      });

      const res = await analyzeRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.validity).toBe('valid_pattern');
      expect(data.original_allocation.retailBrand).toBe('MTN');
      expect(data.current_carrier).toBe('Airtel Uganda');
      expect(data.ported_possible).toBe('yes');
      expect(data.claims.current_carrier_verified).toBe(true);
    });

    it('rejects missing or empty phone with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/analyze', {
        method: 'POST',
        body: JSON.stringify({ phone: '' }),
      });

      const res = await analyzeRoute(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('rejects invalid JSON body with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/analyze', {
        method: 'POST',
        body: 'invalid-json{',
      });

      const res = await analyzeRoute(req);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/phone/regions', () => {
    it('returns all catalog regions', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/regions');
      const res = await regionsRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(252);
    });

    it('filters regions by query parameter', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/regions?q=Uganda');
      const res = await regionsRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.count).toBe(1);
      expect(data.data[0].alpha2).toBe('UG');
      expect(data.data[0].dial_code).toBe('+256');
    });

    it('filters regions by dialing code', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/regions?dial_code=256');
      const res = await regionsRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.count).toBe(1);
      expect(data.data[0].alpha2).toBe('UG');
    });
  });

  describe('GET /api/v1/phone/regions/[region]/operators', () => {
    it('returns operator catalog for valid region (UG)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/regions/UG/operators');
      const res = await operatorsRoute(req, { params: Promise.resolve({ region: 'UG' }) });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.region.alpha2).toBe('UG');
      expect(data.operator_count).toBeGreaterThan(10);
      expect(data.caveat).toContain('Originally allocated network');
    });

    it('returns 404 for unknown region', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/phone/regions/UNKNOWN/operators');
      const res = await operatorsRoute(req, { params: Promise.resolve({ region: 'UNKNOWN' }) });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/phone/data-status', () => {
    it('returns data provenance, metadata versions, and audit counts', async () => {
      const res = await dataStatusRoute();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.metadata_version).toBe('libphonenumber-v9.0.39-cldr45');
      expect(data.provenance.itu_t_e164_version).toContain('E.164');
      expect(data.audited_counts.sovereign_countries_un195).toBe(195);
      expect(data.audited_counts.additional_territories).toBe(50);
      expect(data.audited_counts.unsupported_iso_entities).toBe(7);
      expect(data.audited_counts.all_catalog_entries).toBe(252);
      expect(data.legal_disclaimer).toContain('Original carrier allocations reflect regulatory grants');
    });
  });
});
