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
});
