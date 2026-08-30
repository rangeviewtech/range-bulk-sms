import { Role, Permission } from '@/types/auth';

export type Resource = 'users' | 'posts' | 'settings' | 'billing';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

export const PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    { resource: '*', action: 'manage' }
  ],
  manager: [
    { resource: 'users', action: 'read' },
    { resource: 'posts', action: 'manage' },
    { resource: 'settings', action: 'read' }
  ],
  user: [
    { resource: 'users', action: 'read' },
    { resource: 'posts', action: 'read' },
    { resource: 'posts', action: 'create' }
  ],
  viewer: [
    { resource: 'posts', action: 'read' }
  ]
};

export const hasPermission = (role: Role, resource: Resource | '*', action: Action): boolean => {
  const permissions = PERMISSIONS[role] || [];
  return permissions.some(p => 
    (p.resource === '*' || p.resource === resource) && 
    (p.action === 'manage' || p.action === action)
  );
};

export const can = (role: Role) => ({
  create: (resource: Resource) => hasPermission(role, resource, 'create'),
  read: (resource: Resource) => hasPermission(role, resource, 'read'),
  update: (resource: Resource) => hasPermission(role, resource, 'update'),
  delete: (resource: Resource) => hasPermission(role, resource, 'delete'),
  manage: (resource: Resource) => hasPermission(role, resource, 'manage'),
});
