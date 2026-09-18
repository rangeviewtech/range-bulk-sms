import { prisma } from '@/lib/prisma';

export class GatewayRouter {
  
  /**
   * Routes a message to the best available gateway and creates a MessageAttempt.
   */
  static async routeMessage(messageId: string): Promise<boolean> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { user: true }
    });

    if (!message) return false;

    // 1. Find eligible gateways for this user (their own + shared)
    const availableGateways = await prisma.gateway.findMany({
      where: {
        status: 'ONLINE',
        OR: [
          { userId: message.userId },
          { isShared: true }
        ]
      },
      orderBy: {
        queuePriority: 'desc'
      }
    });

    if (availableGateways.length === 0) {
      await prisma.message.update({
        where: { id: message.id },
        data: { status: 'FAILED', failureReason: 'No online gateways available' }
      });
      return false;
    }

    // 2. Select the best gateway (simple round-robin or priority-based)
    // For now, just pick the highest priority online gateway
    const selectedGateway = availableGateways[0];

    // 3. Create the MessageAttempt
    await prisma.messageAttempt.create({
      data: {
        messageId: message.id,
        gatewayId: selectedGateway.id,
        status: 'ASSIGNED',
        assignedAt: new Date()
      }
    });

    // 4. Mark message as QUEUED
    await prisma.message.update({
      where: { id: message.id },
      data: { status: 'QUEUED', gatewayId: selectedGateway.id }
    });

    return true;
  }

  /**
   * Runs the failover check to re-route stale attempts
   */
  static async processFailovers(): Promise<void> {
    // Find attempts that have been SENT_TO_GATEWAY for > 5 minutes without finalizing
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const staleAttempts = await prisma.messageAttempt.findMany({
      where: {
        status: 'SENT_TO_GATEWAY',
        sentToGatewayAt: { lt: fiveMinsAgo }
      }
    });

    for (const attempt of staleAttempts) {
      // Mark as FAILED due to timeout
      await prisma.messageAttempt.update({
        where: { id: attempt.id },
        data: { status: 'FAILED', errorMessage: 'Gateway timeout' }
      });

      // Try routing again (could add retry counter logic here)
      await this.routeMessage(attempt.messageId);
    }
  }
}


