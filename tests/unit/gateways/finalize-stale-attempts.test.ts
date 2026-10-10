/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { prismaMock } from '../prismaMock';
import { finalizeStaleGatewayAttempts } from '@/lib/gateways/finalize-stale-attempts';

describe('finalizeStaleGatewayAttempts', () => {
  beforeEach(() => {
    prismaMock.messageAttempt.findMany.mockReset();
    prismaMock.messageAttempt.updateMany.mockReset();
    prismaMock.messageRecipient.updateMany.mockReset();
    prismaMock.messageRecipient.findMany.mockReset();
    prismaMock.messageAttempt.create.mockReset();
  });

  it('does not update anything when there are no stale attempts', async () => {
    prismaMock.messageAttempt.findMany.mockResolvedValue([]);

    await expect(finalizeStaleGatewayAttempts(new Date('2026-10-10T12:00:00Z'))).resolves.toBe(0);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('marks an ambiguous gateway timeout uncertain without creating a retry', async () => {
    prismaMock.messageAttempt.findMany.mockResolvedValue([
      { id: 'attempt-1', messageId: 'message-1', messageRecipientId: 'recipient-1' },
    ] as never);
    prismaMock.messageAttempt.updateMany.mockResolvedValue({ count: 1 } as never);
    prismaMock.messageRecipient.updateMany.mockResolvedValue({ count: 1 } as never);
    prismaMock.messageRecipient.findMany.mockResolvedValue([{ status: 'FAILED' }] as never);

    const count = await finalizeStaleGatewayAttempts(new Date('2026-10-10T12:00:00Z'));

    expect(count).toBe(1);
    expect(prismaMock.messageAttempt.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'attempt-1', status: 'SENT_TO_GATEWAY', finalizedAt: null }),
      data: expect.objectContaining({ status: 'SEND_UNCERTAIN', errorCode: 'GATEWAY_TIMEOUT' }),
    }));
    expect(prismaMock.messageAttempt.create).not.toHaveBeenCalled();
    expect(prismaMock.messageRecipient.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'recipient-1', status: { in: ['QUEUED', 'SUBMITTED'] } }),
      data: expect.objectContaining({ status: 'FAILED' }),
    }));
  });

  it('does not finalize an attempt when a concurrent report wins', async () => {
    prismaMock.messageAttempt.findMany.mockResolvedValue([
      { id: 'attempt-1', messageId: 'message-1', messageRecipientId: 'recipient-1' },
    ] as never);
    prismaMock.messageAttempt.updateMany.mockResolvedValue({ count: 0 } as never);

    await expect(finalizeStaleGatewayAttempts(new Date('2026-10-10T12:00:00Z'))).resolves.toBe(0);
    expect(prismaMock.messageRecipient.updateMany).not.toHaveBeenCalled();
  });
});
