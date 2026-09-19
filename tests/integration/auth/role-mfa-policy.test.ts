// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { getEffectiveMfaRequirement, maskRecipient } from '@/lib/auth/mfa-policy';
import { prismaMock } from '../../unit/prismaMock';

type MockUserWithRoles = NonNullable<Awaited<ReturnType<typeof prismaMock.user.findUnique>>>;

describe('Role-Based MFA Policy Engine', () => {
  beforeEach(() => {
    // Reset prismaMock
  });

  it('mandates MFA on every login for Administrator, even if recognized device exists', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'admin-1',
      email: 'admin@rangeviewsms.com',
      mfaEnabled: false,
      mfaSecret: null,
      phone: null,
      whatsappConsent: false,
      telegramChatId: null,
      roles: [{ userId: 'admin-1', roleId: 'r-admin', role: { id: 'r-admin', name: 'ADMIN' } }],
    } as unknown as MockUserWithRoles);

    const result = await getEffectiveMfaRequirement('admin-1');

    expect(result.required).toBe(true);
    expect(result.type).toBe('MANDATORY_ROLE');
    expect(result.canBypassWithRecognizedDevice).toBe(false);
    expect(result.defaultMethod).toBe('EMAIL'); // Defaults to verified email OTP when no TOTP
    expect(result.allowedMethods).toContain('EMAIL');
  });

  it('mandates MFA on every login for Agent', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'agent-1',
      email: 'agent@rangeviewsms.com',
      mfaEnabled: true,
      mfaSecret: 'JBSWY3DPEHPK3PXP',
      phone: '+256701234567',
      whatsappConsent: true,
      telegramChatId: '12345678',
      roles: [{ userId: 'agent-1', roleId: 'r-agent', role: { id: 'r-agent', name: 'AGENT' } }],
    } as unknown as MockUserWithRoles);

    const result = await getEffectiveMfaRequirement('agent-1');

    expect(result.required).toBe(true);
    expect(result.type).toBe('MANDATORY_ROLE');
    expect(result.canBypassWithRecognizedDevice).toBe(false);
    expect(result.defaultMethod).toBe('APP'); // Prefers configured TOTP
    expect(result.allowedMethods).toEqual(
      expect.arrayContaining(['APP', 'EMAIL', 'SMS', 'WHATSAPP', 'TELEGRAM'])
    );
  });

  it('treats MFA as optional for Client when not enabled', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'client-1',
      email: 'client@example.com',
      mfaEnabled: false,
      mfaSecret: null,
      phone: null,
      whatsappConsent: false,
      telegramChatId: null,
      roles: [{ userId: 'client-1', roleId: 'r-client', role: { id: 'r-client', name: 'CLIENT' } }],
    } as unknown as MockUserWithRoles);

    const result = await getEffectiveMfaRequirement('client-1');

    expect(result.required).toBe(false);
    expect(result.type).toBe('NONE');
    expect(result.canBypassWithRecognizedDevice).toBe(true);
  });

  it('enforces MFA for Client when client opts in via settings', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'client-2',
      email: 'secure-client@example.com',
      mfaEnabled: true,
      mfaSecret: 'JBSWY3DPEHPK3PXP',
      phone: '+256770001122',
      whatsappConsent: false,
      telegramChatId: null,
      roles: [{ userId: 'client-2', roleId: 'r-client', role: { id: 'r-client', name: 'CLIENT' } }],
    } as unknown as MockUserWithRoles);

    const result = await getEffectiveMfaRequirement('client-2');

    expect(result.required).toBe(true);
    expect(result.type).toBe('USER_OPTED_IN');
    expect(result.defaultMethod).toBe('APP');
  });

  it('fails closed if an Administrator has no reachable contact channels', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'admin-orphaned',
      email: '',
      mfaEnabled: false,
      mfaSecret: null,
      phone: null,
      whatsappConsent: false,
      telegramChatId: null,
      roles: [{ userId: 'admin-orphaned', roleId: 'r-admin', role: { id: 'r-admin', name: 'ADMIN' } }],
    } as unknown as MockUserWithRoles);

    await expect(getEffectiveMfaRequirement('admin-orphaned')).rejects.toThrow(
      /Mandatory MFA failure/
    );
  });

  it('masks recipient contact info accurately for privacy', () => {
    expect(maskRecipient('john.doe@example.com', 'EMAIL')).toBe('j***e@example.com');
    expect(maskRecipient('+256701234567', 'SMS')).toBe('+256 •••• ••67');
    expect(maskRecipient('+256701234567', 'WHATSAPP')).toBe('+256 •••• ••67');
    expect(maskRecipient('987654321', 'TELEGRAM')).toBe('Telegram (ID: •••4321)');
    expect(maskRecipient('', 'APP')).toBe('Authenticator App (TOTP)');
  });
});
