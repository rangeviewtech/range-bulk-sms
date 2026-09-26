import { describe, it, expect, vi } from 'vitest';
import { searchRegions, ALL_REGIONS } from '@/lib/sms/country-registry';
import { CountryPickerDropdown } from '@/components/sms/country-picker-dropdown';
import { CountryPickerDialog } from '@/components/sms/country-picker-dialog';

describe('CountryPickerDropdown & Region Registry', () => {
  it('exports CountryPickerDropdown component and backward-compatible CountryPickerDialog', () => {
    expect(CountryPickerDropdown).toBeDefined();
    expect(typeof CountryPickerDropdown).toBe('function');
    expect(CountryPickerDialog).toBeDefined();
    expect(typeof CountryPickerDialog).toBe('function');
  });

  it('contains all 245+ global regions (195 UN members and 57 territories = 252 regions)', () => {
    expect(ALL_REGIONS.length).toBe(252);
    const unCountries = ALL_REGIONS.filter(r => !r.isTerritory);
    const territories = ALL_REGIONS.filter(r => r.isTerritory);
    expect(unCountries.length).toBe(195);
    expect(territories.length).toBe(57);
  });

  it('searches and filters regions accurately by country name', () => {
    const results = searchRegions('Uganda');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].alpha2).toBe('UG');
    expect(results[0].dialCode).toBe('+256');
    expect(results[0].name).toBe('Uganda');
  });

  it('searches and filters regions accurately by dialing code (+CC)', () => {
    const results = searchRegions('+254');
    expect(results.some(r => r.alpha2 === 'KE')).toBe(true);
  });

  it('searches and filters regions accurately by ISO 2-letter alpha code', () => {
    const results = searchRegions('GB');
    expect(results.some(r => r.name === 'United Kingdom' && r.dialCode === '+44')).toBe(true);
  });

  it('filters by UN sovereign countries only', () => {
    const unOnly = searchRegions('', { unOnly: true });
    expect(unOnly.length).toBe(195);
    expect(unOnly.every(r => !r.isTerritory)).toBe(true);
  });

  it('filters by territories only', () => {
    const territoriesOnly = searchRegions('', { territoryOnly: true });
    expect(territoriesOnly.length).toBe(57);
    expect(territoriesOnly.every(r => r.isTerritory)).toBe(true);
  });

  it('handles region selection callback with dialCode insertion', () => {
    const onSelect = vi.fn();
    const uganda = ALL_REGIONS.find((r) => r.alpha2 === 'UG')!;

    onSelect(uganda);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(uganda);
    expect(uganda.dialCode).toBe('+256');
  });

  it('returns empty array when search query matches nothing', () => {
    const results = searchRegions('XYZNONEXISTENTCOUNTRY999');
    expect(results).toHaveLength(0);
  });

  it('matches countries by aliases like UK, USA, UAE, DRC in the dropdown search', () => {
    const uk = searchRegions('UK');
    expect(uk[0].alpha2).toBe('GB');

    const usa = searchRegions('USA');
    expect(usa[0].alpha2).toBe('US');

    const uae = searchRegions('UAE');
    expect(uae[0].alpha2).toBe('AE');

    const drc = searchRegions('DRC');
    expect(drc[0].alpha2).toBe('CD');
  });

  it('matches full pasted phone numbers and partial dial codes for instant country selection', () => {
    const ugandaPhone = searchRegions('+256772123456');
    expect(ugandaPhone[0].alpha2).toBe('UG');

    const ukPhone = searchRegions('+447911123456');
    expect(ukPhone.some(r => r.alpha2 === 'GB')).toBe(true);

    const bahamasPhone = searchRegions('+12423591234');
    expect(bahamasPhone[0].alpha2).toBe('BS');
  });

  it('matches diacritic-free queries against accented country names', () => {
    const cote = searchRegions('cote divoire');
    expect(cote.some(r => r.alpha2 === 'CI')).toBe(true);

    const curacao = searchRegions('curacao');
    expect(curacao.some(r => r.alpha2 === 'CW')).toBe(true);
  });

  it('matches countries by capital cities and major hubs', () => {
    const kampala = searchRegions('Kampala');
    expect(kampala[0].alpha2).toBe('UG');

    const nairobi = searchRegions('Nairobi');
    expect(nairobi[0].alpha2).toBe('KE');

    const tokyo = searchRegions('Tokyo');
    expect(tokyo[0].alpha2).toBe('JP');

    const cairo = searchRegions('Cairo');
    expect(cairo[0].alpha2).toBe('EG');

    const lagos = searchRegions('Lagos');
    expect(lagos[0].alpha2).toBe('NG');
  });

  it('matches countries by native and alternate names', () => {
    const de = searchRegions('Deutschland');
    expect(de[0].alpha2).toBe('DE');

    const br = searchRegions('Brasil');
    expect(br[0].alpha2).toBe('BR');

    const inMatch = searchRegions('Bharat');
    expect(inMatch[0].alpha2).toBe('IN');

    const nl = searchRegions('Holland');
    expect(nl[0].alpha2).toBe('NL');

    const es = searchRegions('Espana');
    expect(es[0].alpha2).toBe('ES');
  });

  it('disambiguates full numbers for shared dial codes (+1, +7, +44)', () => {
    // US vs Caribbean in +1
    const usNum = searchRegions('+14155552671');
    expect(usNum[0].alpha2).toBe('US');

    const bahamasNum = searchRegions('+12423591234');
    expect(bahamasNum[0].alpha2).toBe('BS');

    // Kazakhstan vs Russia in +7
    const kzNum = searchRegions('+77011234567');
    expect(kzNum[0].alpha2).toBe('KZ');

    const ruNum = searchRegions('+79161234567');
    expect(ruNum[0].alpha2).toBe('RU');
  });
});

