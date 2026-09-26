// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { resolveTitle, ROUTE_TITLE_MAP } from '@/components/navigation/page-title-sync';
import { createMetadata } from '@/lib/metadata';

describe('Page Title Structure Uniformity ([Page Title] | Range Bulk SMS)', () => {
  const BRAND = 'Range Bulk SMS';

  it('resolves core application routes to uniform "[Page Title] | Range Bulk SMS" structure', () => {
    expect(resolveTitle('/dashboard')).toBe(`Dashboard | ${BRAND}`);
    expect(resolveTitle('/sms/send')).toBe(`Send SMS | ${BRAND}`);
    expect(resolveTitle('/sms/scheduled')).toBe(`Scheduled SMS | ${BRAND}`);
    expect(resolveTitle('/sms/templates')).toBe(`SMS Templates | ${BRAND}`);
    expect(resolveTitle('/sms/campaigns')).toBe(`SMS Campaigns | ${BRAND}`);
    expect(resolveTitle('/sms/delivery-reports')).toBe(`Delivery Reports | ${BRAND}`);
    expect(resolveTitle('/sms/drafts')).toBe(`SMS Drafts | ${BRAND}`);
  });

  it('resolves contact and audience routes correctly', () => {
    expect(resolveTitle('/contacts')).toBe(`Contacts | ${BRAND}`);
    expect(resolveTitle('/contacts/groups')).toBe(`Contact Groups | ${BRAND}`);
    expect(resolveTitle('/contacts/import')).toBe(`Import Contacts | ${BRAND}`);
    expect(resolveTitle('/contacts/segments')).toBe(`Contact Segments | ${BRAND}`);
  });

  it('resolves financial and billing routes correctly', () => {
    expect(resolveTitle('/billing')).toBe(`Billing & Plans | ${BRAND}`);
    expect(resolveTitle('/wallet')).toBe(`Wallet & Balances | ${BRAND}`);
    expect(resolveTitle('/wallet/pricing')).toBe(`Pricing & Rates | ${BRAND}`);
    expect(resolveTitle('/wallet/transactions')).toBe(`Wallet Transactions | ${BRAND}`);
  });

  it('resolves support, settings, and developer routes correctly', () => {
    expect(resolveTitle('/support')).toBe(`Help & Support | ${BRAND}`);
    expect(resolveTitle('/settings')).toBe(`Settings | ${BRAND}`);
    expect(resolveTitle('/settings/account')).toBe(`Account Settings | ${BRAND}`);
    expect(resolveTitle('/settings/security')).toBe(`Security Settings | ${BRAND}`);
    expect(resolveTitle('/developer')).toBe(`Developer Portal | ${BRAND}`);
    expect(resolveTitle('/developer/api-keys')).toBe(`API Keys | ${BRAND}`);
    expect(resolveTitle('/gateways')).toBe(`Hardware Gateways | ${BRAND}`);
  });

  it('resolves agent and admin routes correctly', () => {
    expect(resolveTitle('/agent')).toBe(`Agent Portal | ${BRAND}`);
    expect(resolveTitle('/agent/dashboard')).toBe(`Agent Dashboard | ${BRAND}`);
    expect(resolveTitle('/agent/clients')).toBe(`Agent Clients | ${BRAND}`);
    expect(resolveTitle('/admin/users')).toBe(`User Management | ${BRAND}`);
    expect(resolveTitle('/admin/system')).toBe(`System Health | ${BRAND}`);
  });

  it('resolves authentication and public legal routes correctly', () => {
    expect(resolveTitle('/login')).toBe(`Sign In | ${BRAND}`);
    expect(resolveTitle('/register')).toBe(`Create Account | ${BRAND}`);
    expect(resolveTitle('/privacy')).toBe(`Privacy Policy | ${BRAND}`);
    expect(resolveTitle('/terms')).toBe(`Terms of Service | ${BRAND}`);
    expect(resolveTitle('/cookies')).toBe(`Cookie Policy | ${BRAND}`);
    expect(resolveTitle('/help')).toBe(`Page Not Found | ${BRAND}`);
  });

  it('resolves dynamic route patterns gracefully', () => {
    expect(resolveTitle('/sms/campaigns/cmp-12345')).toBe(`Campaign Details | ${BRAND}`);
    expect(resolveTitle('/contacts/usr-67890')).toBe(`Contact Profile | ${BRAND}`);
  });

  it('ensures all entries in ROUTE_TITLE_MAP have a valid non-empty title string', () => {
    Object.entries(ROUTE_TITLE_MAP).forEach(([route, title]) => {
      expect(route.startsWith('/')).toBe(true);
      expect(title.length).toBeGreaterThan(0);
      expect(title.includes('|')).toBe(false); // Clean title without hardcoded suffix
    });
  });

  describe('createMetadata title normalization', () => {
    it('formats clean titles into the uniform "[Page Title] | Range Bulk SMS" structure', () => {
      const meta = createMetadata({ title: 'Dashboard' });
      expect(meta.title).toEqual({
        default: 'Dashboard | Range Bulk SMS',
        template: '%s | Range Bulk SMS',
        absolute: 'Dashboard | Range Bulk SMS',
      });
    });

    it('strips redundant pre-existing brand suffixes to prevent duplication', () => {
      const meta = createMetadata({ title: 'Dashboard | Range SMS' });
      expect(meta.title).toEqual({
        default: 'Dashboard | Range Bulk SMS',
        template: '%s | Range Bulk SMS',
        absolute: 'Dashboard | Range Bulk SMS',
      });

      const metaWithFull = createMetadata({ title: 'Contacts | Range Bulk SMS' });
      expect(metaWithFull.title).toEqual({
        default: 'Contacts | Range Bulk SMS',
        template: '%s | Range Bulk SMS',
        absolute: 'Contacts | Range Bulk SMS',
      });
    });

    it('defaults to "Range Bulk SMS" when no title is provided (root layout fallback)', () => {
      const meta = createMetadata();
      expect(meta.title).toEqual({
        default: 'Range Bulk SMS',
        template: '%s | Range Bulk SMS',
      });
    });
  });
});
