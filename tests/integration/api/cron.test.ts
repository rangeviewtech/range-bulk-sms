/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/cron/process-jobs/route';
import { NextRequest } from 'next/server';
import { prismaMock } from '../../unit/prismaMock';

vi.mock('@/lib/jobs/processor', () => ({
  processJobsBatch: vi.fn().mockResolvedValue(2),
}));

describe('Cron Process Jobs Route', () => {
  it('rejects unauthorized requests', async () => {
    // We don't have the CRON_SECRET header
    const req = new NextRequest('http://localhost:3000/api/cron/process-jobs');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('processes jobs successfully when authorized', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaMock.scheduledJob.findMany.mockResolvedValue([] as any[]);

    const originalSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'test-cron-secret';

    const req = new NextRequest('http://localhost:3000/api/cron/process-jobs', {
      headers: {
        Authorization: 'Bearer test-cron-secret',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.processedCount).toBe(2);

    process.env.CRON_SECRET = originalSecret;
  });
});
