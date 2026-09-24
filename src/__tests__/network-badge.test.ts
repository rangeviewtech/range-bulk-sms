import { describe, it, expect } from 'vitest';
import { getCarrierBrandStyles, NetworkBadge, CarrierBadge } from '@/components/sms/carrier-badge';

describe('NetworkBadge and Carrier Brand Styling Parity', () => {
  it('exports NetworkBadge and CarrierBadge components', () => {
    expect(NetworkBadge).toBeDefined();
    expect(typeof NetworkBadge).toBe('function');
    expect(CarrierBadge).toBeDefined();
    expect(typeof CarrierBadge).toBe('function');
  });

  it('assigns amber color tokens to MTN matching contacts table', () => {
    const { styleClasses } = getCarrierBrandStyles('MTN');
    expect(styleClasses).toContain('bg-amber-500/10');
    expect(styleClasses).toContain('text-amber-600');
    expect(styleClasses).toContain('border-amber-500/30');
  });

  it('assigns rose color tokens to Airtel matching contacts table', () => {
    const { styleClasses } = getCarrierBrandStyles('Airtel');
    expect(styleClasses).toContain('bg-rose-500/10');
    expect(styleClasses).toContain('text-rose-600');
    expect(styleClasses).toContain('border-rose-500/30');
  });

  it('assigns emerald color tokens to Safaricom', () => {
    const { styleClasses } = getCarrierBrandStyles('Safaricom');
    expect(styleClasses).toContain('bg-emerald-500/10');
    expect(styleClasses).toContain('text-emerald-600');
    expect(styleClasses).toContain('border-emerald-500/30');
  });

  it('assigns rose color tokens to Vodacom', () => {
    const { styleClasses } = getCarrierBrandStyles('Vodacom');
    expect(styleClasses).toContain('bg-rose-500/10');
    expect(styleClasses).toContain('text-rose-600');
  });

  it('assigns blue color tokens to Tigo, Lycamobile, and UTCL', () => {
    expect(getCarrierBrandStyles('Tigo').styleClasses).toContain('bg-blue-500/10');
    expect(getCarrierBrandStyles('Lycamobile').styleClasses).toContain('bg-blue-500/10');
    expect(getCarrierBrandStyles('UTCL').styleClasses).toContain('bg-blue-500/10');
  });

  it('provides default muted styling for unknown networks', () => {
    const { styleClasses } = getCarrierBrandStyles('Unknown Network');
    expect(styleClasses).toContain('bg-muted/40');
    expect(styleClasses).toContain('text-muted-foreground');
  });
});
