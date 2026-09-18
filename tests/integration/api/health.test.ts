/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

import { NextRequest } from 'next/server';
import { prismaMock } from '../../unit/prismaMock';

describe('Health Route', () => {
  it('returns ok status for shallow liveness probe', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.version).toBe('1.0.0');
    expect(json.timestamp).toBeDefined();
  });

  it('validates database connectivity on deep readiness probe', async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([{ healthy: 1 }] as never);

    const req = new NextRequest('http://localhost:3000/api/health?type=readiness');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.checks.database.status).toBe('healthy');
    expect(json.latencyMs).toBeDefined();
  });

  it('returns 503 if database check fails on readiness probe', async () => {
    prismaMock.$queryRaw.mockRejectedValueOnce(new Error('Connection lost'));

    const req = new NextRequest('http://localhost:3000/api/health?type=readiness');
    const res = await GET(req);
    expect(res.status).toBe(503);

    const json = await res.json();
    expect(json.status).toBe('unhealthy');
    expect(json.checks.database.status).toBe('unhealthy');
  });
});

