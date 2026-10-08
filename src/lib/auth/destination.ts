/**
 * Role-Aware Destination Resolver & Safe Return-To URL Validator
 * 
 * Prevents Open Redirect vulnerabilities by strictly enforcing relative-only,
 * non-protocol, non-guest redirection targets, and routes authenticated users
 * to their role-specific dashboard.
 */

export interface RoleObject {
  role?: {
    name: string;
  };
  name?: string;
}

export type RoleInput = Array<RoleObject | string> | string | null | undefined;

const GUEST_OR_AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/2fa',
  '/2fa/challenge',
  '/otp',
  '/screen-lock',
];

/**
 * Validates whether a provided return-to or callback URL is safe to redirect to.
 * Ensures the target is strictly internal, relative, does not contain protocols,
 * and is not an authentication or guest route.
 */
export function isSafeReturnUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // Must start with single slash, not double slash (//evil.com is protocol-relative open redirect)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return false;
  }

  // Reject backslashes which can be used to bypass URL parsers
  if (trimmed.includes('\\')) {
    return false;
  }

  // Reject explicit protocols or colon schemes (e.g., javascript:, data:, https:)
  if (trimmed.includes(':')) {
    return false;
  }

  // Reject URLs containing control characters or whitespace
  if (/[\r\n\t\0]/.test(trimmed)) {
    return false;
  }

  // Extract path portion without query or fragment for route blacklist check
  const pathOnly = trimmed.split('?')[0].split('#')[0].toLowerCase();

  // Reject guest-only authentication pages
  for (const guestRoute of GUEST_OR_AUTH_ROUTES) {
    if (pathOnly === guestRoute || pathOnly.startsWith(`${guestRoute}/`)) {
      return false;
    }
  }

  return true;
}

/**
 * Extracts a normalized list of uppercase role names from diverse input formats
 * (e.g., Prisma UserRole[] relations, string arrays, or single role strings).
 */
export function extractRoleNames(roles: RoleInput): string[] {
  if (!roles) return [];

  if (typeof roles === 'string') {
    return [roles.trim().toUpperCase()];
  }

  if (Array.isArray(roles)) {
    return roles
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim().toUpperCase();
        }
        if (typeof item === 'object' && item !== null) {
          if (typeof item.role?.name === 'string') {
            return item.role.name.trim().toUpperCase();
          }
          if (typeof item.name === 'string') {
            return item.name.trim().toUpperCase();
          }
        }
        return '';
      })
      .filter((name) => name.length > 0);
  }

  return [];
}

/**
 * Determines the primary default landing page based on user roles.
 * Role Hierarchy:
 * 1. ADMIN -> /admin/system
 * 2. AGENT -> /agent/dashboard
 * 3. CLIENT / Default -> /dashboard
 */
export function getDefaultRoleDashboard(roles: RoleInput): string {
  const roleNames = extractRoleNames(roles);

  if (roleNames.includes('ADMIN')) {
    return '/admin/system';
  }

  if (roleNames.includes('AGENT')) {
    return '/agent/dashboard';
  }

  return '/dashboard';
}

/**
 * Resolves the destination URL for an authenticated user.
 * If a safe returnTo URL is provided, it takes precedence; otherwise returns
 * the role's designated default dashboard.
 */
export function resolveDashboardDestination(
  roles: RoleInput,
  returnTo?: string | null
): string {
  if (isSafeReturnUrl(returnTo)) {
    return returnTo!.trim();
  }

  return getDefaultRoleDashboard(roles);
}
