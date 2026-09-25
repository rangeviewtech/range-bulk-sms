import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/dal';
import { AppError } from '@/lib/errors';

interface CachedRolePermissions {
  actions: Set<string>;
  cachedAt: number;
}

const ROLE_PERMISSIONS_CACHE = new Map<string, CachedRolePermissions>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

/**
 * Invalidate cached role permissions (call when permissions are modified)
 */
export function invalidatePermissionsCache(roleId?: string) {
  if (roleId) {
    ROLE_PERMISSIONS_CACHE.delete(roleId);
  } else {
    ROLE_PERMISSIONS_CACHE.clear();
  }
}

/**
 * Retrieves the set of permission actions granted to a specific role ID, using
 * an in-memory cache to avoid repeated 4-table join queries on every request.
 */
async function getRoleActions(roleId: string): Promise<Set<string>> {
  const now = Date.now();
  const cached = ROLE_PERMISSIONS_CACHE.get(roleId);
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.actions;
  }

  const rolePerms = await prisma.rolePermission.findMany({
    where: { roleId },
    select: {
      permission: {
        select: { action: true },
      },
    },
  });

  const actions = new Set(rolePerms.map((rp) => rp.permission.action));
  ROLE_PERMISSIONS_CACHE.set(roleId, { actions, cachedAt: now });
  return actions;
}

export async function hasPermission(userId: string, action: string): Promise<boolean> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    select: {
      roleId: true,
      role: {
        select: { name: true },
      },
    },
  });

  // Fast-path: ADMIN role has all permissions
  if (userRoles.some((ur) => ur.role?.name === 'ADMIN')) {
    return true;
  }

  for (const ur of userRoles) {
    const actions = await getRoleActions(ur.roleId);
    if (actions.has(action)) {
      return true;
    }
  }

  return false;
}

export async function requirePermission(action: string) {
  const session = await getRequiredSession();

  // Fast-path: ADMIN role bypasses role-permission queries completely
  const userRoles = (session.user as { roles?: Array<{ roleId?: string; role?: { id?: string; name?: string } }> })?.roles || [];
  if (userRoles.some((ur) => ur.role?.name === 'ADMIN')) {
    return session;
  }

  // Check roles from session object if available
  let hasPerm = false;
  if (userRoles.length > 0) {
    for (const ur of userRoles) {
      const roleId = ur.roleId || ur.role?.id;
      if (roleId) {
        const actions = await getRoleActions(roleId);
        if (actions.has(action)) {
          hasPerm = true;
          break;
        }
      }
    }
  }

  // Fallback to database check if roles were not present on session
  if (!hasPerm && userRoles.length === 0) {
    hasPerm = await hasPermission(session.userId, action);
  }

  if (!hasPerm) {
    throw new AppError('Forbidden: Insufficient permissions', 403, 'FORBIDDEN');
  }
  return session;
}

