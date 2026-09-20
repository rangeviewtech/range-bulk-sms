import { PrismaClient, Prisma } from '@/generated/prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { prisma } from '@/lib/prisma';
import { beforeEach, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
  Prisma,
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  
  // Mock $transaction to immediately execute its callback using prismaMock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismaMock.$transaction.mockImplementation(async (arg: any) => {
    if (typeof arg === 'function') {
      return arg(prismaMock);
    }
    return arg; // If array of promises, we'd need Promise.all, but typically it's a callback here
  });
});
