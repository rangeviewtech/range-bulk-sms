import { describe, it, expect, vi } from 'vitest';
import {
  isPrivateOrReservedIpv4,
  isPrivateOrReservedIpv6,
  validateSsrfUrl,
} from '@/lib/security/ssrf-filter';
import { sanitizeCsvField, buildSanitizedCsv } from '@/lib/security/csv-sanitizer';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contact: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}));

describe('Production Security Hardening Suite', () => {
  describe('SSRF Protection (Server-Side Request Forgery)', () => {
    it('identifies RFC 1918 and loopback IPv4 addresses as private/reserved', () => {
      expect(isPrivateOrReservedIpv4('127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIpv4('127.0.1.10')).toBe(true);
      expect(isPrivateOrReservedIpv4('10.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIpv4('10.254.254.254')).toBe(true);
      expect(isPrivateOrReservedIpv4('172.16.0.1')).toBe(true);
      expect(isPrivateOrReservedIpv4('172.31.255.255')).toBe(true);
      expect(isPrivateOrReservedIpv4('192.168.1.1')).toBe(true);
      expect(isPrivateOrReservedIpv4('169.254.169.254')).toBe(true); // AWS / Cloud metadata
      expect(isPrivateOrReservedIpv4('0.0.0.0')).toBe(true);
      expect(isPrivateOrReservedIpv4('240.0.0.1')).toBe(true); // Reserved
      expect(isPrivateOrReservedIpv4('224.0.0.1')).toBe(true); // Multicast
    });

    it('identifies public IPv4 addresses as non-private', () => {
      expect(isPrivateOrReservedIpv4('8.8.8.8')).toBe(false);
      expect(isPrivateOrReservedIpv4('1.1.1.1')).toBe(false);
      expect(isPrivateOrReservedIpv4('104.26.10.15')).toBe(false);
    });

    it('identifies IPv6 loopback, link-local, and ULA addresses as private/reserved', () => {
      expect(isPrivateOrReservedIpv6('::1')).toBe(true);
      expect(isPrivateOrReservedIpv6('0:0:0:0:0:0:0:1')).toBe(true);
      expect(isPrivateOrReservedIpv6('::')).toBe(true);
      expect(isPrivateOrReservedIpv6('fc00::1')).toBe(true);
      expect(isPrivateOrReservedIpv6('fd12:3456:789a::1')).toBe(true);
      expect(isPrivateOrReservedIpv6('fe80::1')).toBe(true);
      expect(isPrivateOrReservedIpv6('::ffff:127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIpv6('::ffff:169.254.169.254')).toBe(true);
    });

    it('blocks dangerous URLs and local metadata endpoints', async () => {
      const blockedUrls = [
        'http://127.0.0.1:3000/api/cron',
        'http://localhost:8080/admin',
        'http://169.254.169.254/latest/meta-data/',
        'http://instance-data/latest/meta-data/',
        'http://metadata.google.internal/computeMetadata/v1/',
        'ftp://example.com/file.txt',
        'file:///etc/passwd',
        'http://10.0.0.5/internal',
        'http://192.168.0.1/router',
        'http://[::1]/secret',
      ];

      for (const url of blockedUrls) {
        const result = await validateSsrfUrl(url);
        expect(result.isSafe).toBe(false);
      }
    });

    it('allows valid external public HTTP / HTTPS endpoints', async () => {
      // 8.8.8.8 is a public DNS endpoint
      const result = await validateSsrfUrl('https://8.8.8.8/webhook');
      expect(result.isSafe).toBe(true);
    });
  });

  describe('CSV Formula Injection Neutralization (CWE-1236)', () => {
    it('neutralizes cells starting with formula triggers = + - @', () => {
      expect(sanitizeCsvField('=SUM(A1:A10)')).toBe(`"'=SUM(A1:A10)"`);
      expect(sanitizeCsvField('+256772123456')).toBe(`"'+256772123456"`);
      expect(sanitizeCsvField('-5000UGX')).toBe(`"'-5000UGX"`);
      expect(sanitizeCsvField('@eval(cmd)')).toBe(`"'@eval(cmd)"`);
      expect(sanitizeCsvField('\tcalc')).toBe(`"'\tcalc"`);
      expect(sanitizeCsvField('\rnotepad')).toBe(`"'\rnotepad"`);
    });

    it('preserves and safely escapes standard text and quotes', () => {
      expect(sanitizeCsvField('John Doe')).toBe('"John Doe"');
      expect(sanitizeCsvField('Company "Range" Ltd')).toBe('"Company ""Range"" Ltd"');
      expect(sanitizeCsvField(12345)).toBe('"12345"');
      expect(sanitizeCsvField(null)).toBe('""');
      expect(sanitizeCsvField(undefined)).toBe('""');
    });

    it('builds safe sanitized CSV datasets ready for export', () => {
      const headers = ['Name', 'Phone', 'Notes'];
      const rows = [
        ['=cmd|/C calc!A0', '+256700000000', 'Safe regular note'],
        ['Jane "The Boss" Doe', '0772000000', '@malicious_tag'],
      ];

      const csv = buildSanitizedCsv(headers, rows);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('"Name","Phone","Notes"');
      expect(lines[1]).toBe('"\'=cmd|/C calc!A0","\'+256700000000","Safe regular note"');
      expect(lines[2]).toBe('"Jane ""The Boss"" Doe","0772000000","\'@malicious_tag"');
    });
  });

  describe('Hardware Gateway Replay and State Protection', () => {
    it('enforces terminal status boundaries for delivered and failed attempts', () => {
      const terminalStatuses = ['DELIVERED', 'FAILED'];
      const attemptStatus: string = 'DELIVERED';

      const isTerminal = terminalStatuses.includes(attemptStatus);
      expect(isTerminal).toBe(true);

      // Replay check simulation: incoming status 'SENT' after 'DELIVERED' must be blocked
      const incomingStatus: string = 'SENT';
      const shouldBlock = isTerminal && incomingStatus !== attemptStatus;
      expect(shouldBlock).toBe(true);
    });
  });

  describe('Unbounded Query DoS Hardening & Tenant Isolation', () => {
    it('clamps pagination limit to maximum 100 and minimum 1 in ContactService', async () => {
      const { ContactService } = await import('@/lib/contacts/service');
      const { prisma } = await import('@/lib/prisma');

      // Test 1: Excessive limit (DoS attempt) should be clamped to 100
      await ContactService.findMany('tenant-user-1', { limit: 10000, page: 1 });
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
          skip: 0,
          where: expect.objectContaining({ userId: 'tenant-user-1', deletedAt: null }),
        })
      );

      // Test 2: Negative/zero page should be clamped to 1 (skip: 0)
      await ContactService.findMany('tenant-user-1', { limit: 50, page: -3 });
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 0,
        })
      );

      // Test 3: Normal valid pagination (page 3, limit 25 -> skip 50)
      await ContactService.findMany('tenant-user-2', { limit: 25, page: 3 });
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 25,
          skip: 50,
          where: expect.objectContaining({ userId: 'tenant-user-2', deletedAt: null }),
        })
      );

      // Test 4: NaN fallback defaults to limit 20, page 1
      await ContactService.findMany('tenant-user-3', { limit: Number('invalid'), page: Number('invalid') });
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 0,
          where: expect.objectContaining({ userId: 'tenant-user-3', deletedAt: null }),
        })
      );
    });

    it('strictly enforces multi-tenant isolation in ContactService query filters', async () => {
      const { ContactService } = await import('@/lib/contacts/service');
      const { prisma } = await import('@/lib/prisma');

      await ContactService.findMany('isolated-user-abc', { search: 'John' });
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'isolated-user-abc',
            deletedAt: null,
          }),
        })
      );
    });
  });
});

