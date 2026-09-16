/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('Health Route', () => {
  it('returns ok status', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.version).toBe('1.0.0');
    expect(json.timestamp).toBeDefined();
  });
});
