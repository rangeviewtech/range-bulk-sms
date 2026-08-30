import { prisma } from '@/lib/prisma';
import { requireAuth } from './session';
import { AppError } from '@/lib/errors';

export async function hasPermission(userId: string, action: string): Promise<boolean> {
  // Find if user has a role with this permission
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true }
          }
        }
      }
    }
  });

  for (const ur of userRoles) {
    if (ur.role.permissions.some(p => p.permission.action === action)) {
      return true;
    }
    // Optional: Super admin logic
    if (ur.role.name === 'ADMIN') return true;
  }

  return false;
}

export async function requirePermission(action: string) {
  const session = await requireAuth();
  const hasPerm = await hasPermission(session.userId, action);
  if (!hasPerm) {
    throw new AppError('Forbidden: Insufficient permissions', 403, 'FORBIDDEN');
  }
  return session;
}
