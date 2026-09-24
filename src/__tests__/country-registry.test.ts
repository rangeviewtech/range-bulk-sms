import { describe, it, expect } from 'vitest';
import {
  COUNTRY_REGISTRY,
  UNSUPPORTED_ISO_ENTITIES,
  ALL_REGIONS,
  getRegionByAlpha2,
  getRegionByAlpha3,
  getRegionsByDialCode,
  searchRegions,
  resolveCandidateRegions,
} from '@/lib/sms/country-registry';

describe('Global Country & Territory Registry', () => {
  it('contains exactly 195 sovereign countries (193 UN members + Holy See + State of Palestine)', () => {
    const unCountries = COUNTRY_REGISTRY.filter((r) => r.isUnMember);
    expect(unCountries.length).toBe(195);

    // Verify key members
    expect(getRegionByAlpha2('UG')?.name).toBe('Uganda');
    expect(getRegionByAlpha2('VA')?.name).toContain('Vatican');
    expect(getRegionByAlpha2('PS')?.name).toContain('Palestine');
    expect(getRegionByAlpha2('US')?.name).toBe('United States');
  });

  it('contains exactly 50 additional supported territories and geographic regions', () => {
    const territories = COUNTRY_REGISTRY.filter((r) => r.isTerritory);
    expect(territories.length).toBe(50);

    // Verify sample territories
    expect(getRegionByAlpha2('PR')?.name).toBe('Puerto Rico');
    expect(getRegionByAlpha2('BM')?.name).toBe('Bermuda');
    expect(getRegionByAlpha2('HK')?.name).toBe('Hong Kong');
    expect(getRegionByAlpha2('XK')?.name).toContain('Kosovo');
  });

  it('contains exactly 7 unsupported ISO 3166-1 entities without independent numbering plans', () => {
    expect(UNSUPPORTED_ISO_ENTITIES.length).toBe(7);
    const codes = UNSUPPORTED_ISO_ENTITIES.map((e) => e.alpha2);
    expect(codes).toEqual(expect.arrayContaining(['AQ', 'BV', 'GS', 'HM', 'PN', 'TF', 'UM']));
    
    // Each must be marked libphonenumberSupported: false
    for (const entity of UNSUPPORTED_ISO_ENTITIES) {
      expect(entity.libphonenumberSupported).toBe(false);
      expect(entity.unsupportedReason).toBeDefined();
    }
  });

  it('has a total of 252 catalog entries with unique IDs', () => {
    expect(ALL_REGIONS.length).toBe(252);
    const ids = new Set(ALL_REGIONS.map((r) => r.id));
    expect(ids.size).toBe(252);
  });

  it('retrieves regions by ISO-2 and ISO-3 correctly', () => {
    expect(getRegionByAlpha2('ug')?.alpha2).toBe('UG');
    expect(getRegionByAlpha2('UG')?.name).toBe('Uganda');
    expect(getRegionByAlpha3('UGA')?.alpha2).toBe('UG');
    expect(getRegionByAlpha3('uga')?.name).toBe('Uganda');
    expect(getRegionByAlpha2('NONEXISTENT')).toBeUndefined();
  });

  it('retrieves regions by dial code', () => {
    const list256 = getRegionsByDialCode('+256');
    expect(list256.length).toBe(1);
    expect(list256[0].alpha2).toBe('UG');
  });

  it('searches regions by text, ISO code, or dial code', () => {
    const ugResults = searchRegions('Uganda');
    expect(ugResults.length).toBeGreaterThanOrEqual(1);
    expect(ugResults[0].alpha2).toBe('UG');

    const dial256 = searchRegions('+256');
    expect(dial256.some((r) => r.alpha2 === 'UG')).toBe(true);

    const unOnly = searchRegions('', { unOnly: true });
    expect(unOnly.length).toBe(195);

    const territoryOnly = searchRegions('', { territoryOnly: true });
    expect(territoryOnly.length).toBe(57); // 50 supported + 7 unsupported
  });

  describe('Shared Calling Code Disambiguation', () => {
    it('disambiguates NANP (+1) area codes for Caribbean territories vs US/Canada', () => {
      // 242 is Bahamas (BS)
      const bs = resolveCandidateRegions('+1', '2423591234');
      expect(bs.primaryRegion?.alpha2).toBe('BS');
      expect(bs.isAmbiguous).toBe(false);

      // 246 is Barbados (BB)
      const bb = resolveCandidateRegions('+1', '2462501234');
      expect(bb.primaryRegion?.alpha2).toBe('BB');

      // 416 is Toronto, Canada (CA)
      const ca = resolveCandidateRegions('+1', '4161234567');
      expect(ca.primaryRegion?.alpha2).toBe('CA');

      // 787 is Puerto Rico (PR)
      const pr = resolveCandidateRegions('+1', '7872345678');
      expect(pr.primaryRegion?.alpha2).toBe('PR');

      // Generic unmapped area code defaults to US with ambiguity flag
      const generic = resolveCandidateRegions('+1', '5551234567');
      expect(generic.primaryRegion?.alpha2).toBe('US');
      expect(generic.isAmbiguous).toBe(true);
    });

    it('disambiguates +7 between Russia (RU) and Kazakhstan (KZ)', () => {
      const kz = resolveCandidateRegions('+7', '7011234567');
      expect(kz.primaryRegion?.alpha2).toBe('KZ');

      const ru = resolveCandidateRegions('+7', '4951234567');
      expect(ru.primaryRegion?.alpha2).toBe('RU');
      expect(ru.isAmbiguous).toBe(true);
    });

    it('disambiguates +39 between Italy (IT) and Vatican (VA 06698)', () => {
      const va = resolveCandidateRegions('+39', '0669812345');
      expect(va.primaryRegion?.alpha2).toBe('VA');

      const it = resolveCandidateRegions('+39', '3401234567');
      expect(it.primaryRegion?.alpha2).toBe('IT');
    });

    it('disambiguates +44 between UK and Channel Islands / Isle of Man', () => {
      const gg = resolveCandidateRegions('+44', '7781123456');
      expect(gg.primaryRegion?.alpha2).toBe('GG');

      const je = resolveCandidateRegions('+44', '7797712345');
      expect(je.primaryRegion?.alpha2).toBe('JE');

      const im = resolveCandidateRegions('+44', '7924123456');
      expect(im.primaryRegion?.alpha2).toBe('IM');
    });

    it('disambiguates +262 between Mayotte (YT) and Réunion (RE)', () => {
      const yt = resolveCandidateRegions('+262', '639012345');
      expect(yt.primaryRegion?.alpha2).toBe('YT');

      const re = resolveCandidateRegions('+262', '692123456');
      expect(re.primaryRegion?.alpha2).toBe('RE');
    });
  });

  describe('FlagCDN Country Flag Mapping & Compatibility', () => {
    it('all supported regions have valid 2-letter uppercase alpha2 codes convertible to FlagCDN URLs', () => {
      const supported = ALL_REGIONS.filter((r) => r.libphonenumberSupported);
      expect(supported.length).toBe(245);

      for (const region of supported) {
        expect(region.alpha2).toMatch(/^[A-Z]{2}$/);
        const flagUrl = `https://flagcdn.com/24x18/${region.alpha2.toLowerCase()}.png`;
        expect(flagUrl).toMatch(/^https:\/\/flagcdn\.com\/24x18\/[a-z]{2}\.png$/);
      }
    });

    it('generates exact FlagCDN URLs matching language switcher pattern for key countries', () => {
      const ug = getRegionByAlpha2('UG');
      expect(ug).toBeDefined();
      expect(`https://flagcdn.com/24x18/${ug!.alpha2.toLowerCase()}.png`).toBe('https://flagcdn.com/24x18/ug.png');

      const us = getRegionByAlpha2('US');
      expect(`https://flagcdn.com/24x18/${us!.alpha2.toLowerCase()}.png`).toBe('https://flagcdn.com/24x18/us.png');

      const gb = getRegionByAlpha2('GB');
      expect(`https://flagcdn.com/24x18/${gb!.alpha2.toLowerCase()}.png`).toBe('https://flagcdn.com/24x18/gb.png');

      const ng = getRegionByAlpha2('NG');
      expect(`https://flagcdn.com/24x18/${ng!.alpha2.toLowerCase()}.png`).toBe('https://flagcdn.com/24x18/ng.png');

      const ke = getRegionByAlpha2('KE');
      expect(`https://flagcdn.com/24x18/${ke!.alpha2.toLowerCase()}.png`).toBe('https://flagcdn.com/24x18/ke.png');
    });
  });
});

