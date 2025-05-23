import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Invoice Model', () => {
  it('should count invoices without throwing an error', async () => {
    await expect(prisma.invoice.count()).resolves.not.toThrow();
  });
});
