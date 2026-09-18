import { describe, it, expect } from 'vitest';
import { getApiDocs } from '@/lib/swagger';

describe('OpenAPI 3.0.3 Authoritative Contract Specification', () => {
  it('generates a valid OpenAPI 3.0.3 document', async () => {
    const spec = await getApiDocs() as {
      openapi: string;
      info: { title: string; version: string };
      servers: { url: string; description: string }[];
      paths: Record<string, Record<string, { operationId?: string; tags?: string[] }>>;
      components: {
        schemas: Record<string, unknown>;
        securitySchemes: Record<string, unknown>;
      };
    };

    expect(spec).toBeDefined();
    expect(spec.openapi).toBe('3.0.3');
    expect(spec.info.title).toContain('Range Bulk SMS');
    expect(spec.info.version).toBe('1.0.0');
  });

  it('defines dual servers for Sandbox and Production isolation', async () => {
    const spec = await getApiDocs() as {
      servers: { url: string; description: string }[];
    };

    expect(spec.servers).toHaveLength(2);
    const sandboxServer = spec.servers.find((s) => s.description.includes('Sandbox'));
    const prodServer = spec.servers.find((s) => s.description.includes('Production'));

    expect(sandboxServer).toBeDefined();
    expect(sandboxServer?.url).toBe('/api/v1');
    expect(prodServer).toBeDefined();
    expect(prodServer?.url).toContain('https://api.rangesms.com/v1');
  });

  it('documents all required public v1 endpoints with operationIds', async () => {
    const spec = await getApiDocs() as {
      paths: Record<string, Record<string, { operationId?: string; tags?: string[] }>>;
    };

    const requiredPaths = [
      '/api/v1/sms/send',
      '/api/v1/sms/bulk',
      '/api/v1/sms/schedule',
      '/api/v1/sms/status/{id}',
      '/api/v1/balance',
      '/api/v1/contacts',
      '/api/v1/sender-ids',
      '/api/v1/sandbox/simulate-delivery',
    ];

    for (const p of requiredPaths) {
      expect(spec.paths[p], `Path ${p} must exist in OpenAPI paths`).toBeDefined();
    }
  });

  it('ensures zero duplicate operationIds across the entire contract', async () => {
    const spec = await getApiDocs() as {
      paths: Record<string, Record<string, { operationId?: string }>>;
    };

    const operationIds = new Set<string>();

    for (const [pathKey, methods] of Object.entries(spec.paths)) {
      for (const [methodKey, op] of Object.entries(methods)) {
        if (op && typeof op === 'object' && op.operationId) {
          expect(
            operationIds.has(op.operationId),
            `Duplicate operationId '${op.operationId}' found at ${methodKey.toUpperCase()} ${pathKey}`
          ).toBe(false);
          operationIds.add(op.operationId);
        }
      }
    }

    expect(operationIds.size).toBeGreaterThanOrEqual(8);
  });

  it('exposes RFC 9457 ProblemDetails error schema and Webhook events', async () => {
    const spec = await getApiDocs() as {
      components: {
        schemas: Record<string, { required?: string[]; properties?: Record<string, unknown> }>;
      };
    };

    expect(spec.components.schemas.ProblemDetails).toBeDefined();
    expect(spec.components.schemas.ProblemDetails.required).toContain('status');
    expect(spec.components.schemas.ProblemDetails.required).toContain('code');
    expect(spec.components.schemas.ProblemDetails.required).toContain('detail');

    expect(spec.components.schemas.SmsRequest).toBeDefined();
    expect(spec.components.schemas.DeliveryReport).toBeDefined();
    expect(spec.components.schemas.WebhookDeliveryEvent).toBeDefined();
  });

  it('contains no exposed server secrets or private credentials', async () => {
    const specString = JSON.stringify(await getApiDocs());

    expect(specString).not.toContain('postgres://');
    expect(specString).not.toContain('DATABASE_URL');
    expect(specString).not.toContain('SESSION_SECRET');
    expect(specString).not.toContain('ENCRYPTION_KEY');
    expect(specString).not.toContain('JWT_SECRET');
  });
});
