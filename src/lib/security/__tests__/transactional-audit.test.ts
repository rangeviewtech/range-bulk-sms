import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withTransactionalAudit } from '../transactional-audit';
import { prisma } from '../../prisma';

// Mock the prisma global to prevent actual DB writes during unit tests
vi.mock('../../prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  }
}));

describe('withTransactionalAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should wrap execution in a transaction and log success', async () => {
    const mockTx = {
      auditLog: {
        findFirst: vi.fn().mockResolvedValue({ hash: 'OLDHASH' }),
        create: vi.fn().mockResolvedValue({ id: 'log1' }),
      }
    };
    
    // Simulate transaction callback executing
    vi.mocked(prisma.$transaction).mockImplementation((async (callback: (tx: unknown) => Promise<unknown>) => {
      return callback(mockTx);
    }) as never);

    const mutationFn = vi.fn().mockResolvedValue('success_data');
    
    const result = await withTransactionalAudit(
      {
        eventName: 'TEST_EVENT',
        category: 'SYSTEM',
        action: 'UPDATE'
      },
      mutationFn
    );

    expect(result).toBe('success_data');
    expect(mutationFn).toHaveBeenCalledWith(mockTx);
    expect(mockTx.auditLog.create).toHaveBeenCalled();
    const createCall = mockTx.auditLog.create.mock.calls[0][0];
    expect(createCall.data.eventName).toBe('TEST_EVENT');
    expect(createCall.data.previousHash).toBe('OLDHASH');
    expect(createCall.data.hash).toBeDefined();
  });

  it('should throw and NOT write a success log if mutation fails', async () => {
    const mockTx = {
      auditLog: {
        findFirst: vi.fn(),
        create: vi.fn(),
      }
    };
    
    vi.mocked(prisma.$transaction).mockImplementation((async (callback: (tx: unknown) => Promise<unknown>) => {
      return callback(mockTx);
    }) as never);

    const error = new Error('Mutation failed');
    const mutationFn = vi.fn().mockRejectedValue(error);
    
    await expect(
      withTransactionalAudit({ eventName: 'FAIL_EVENT', category: 'SYSTEM' }, mutationFn)
    ).rejects.toThrow('Mutation failed');

    // The successful audit log inside the transaction should not be created
    expect(mockTx.auditLog.create).not.toHaveBeenCalled();
  });
});
