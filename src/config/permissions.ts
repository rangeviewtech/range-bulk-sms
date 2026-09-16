import { Role, Permission } from '@/types/auth';

export type Resource = 
  | 'users' 
  | 'posts' 
  | 'settings' 
  | 'billing'
  | 'sms'
  | 'campaigns'
  | 'contacts'
  | 'sender_ids'
  | 'wallet'
  | 'clients'
  | 'agents'
  | 'commissions'
  | 'api_keys'
  | 'webhooks'
  | 'reports'
  | 'providers'
  | 'pricing'
  | 'support'
  | 'system';

export type Action = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage'
  | 'send'
  | 'schedule'
  | 'view'
  | 'import'
  | 'approve'
  | 'monitor';

export const PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    { resource: '*', action: 'manage' }
  ],
  manager: [
    { resource: 'users', action: 'read' },
    { resource: 'settings', action: 'read' },
    { resource: 'sms', action: 'manage' },
    { resource: 'campaigns', action: 'manage' },
    { resource: 'contacts', action: 'manage' },
    { resource: 'sender_ids', action: 'manage' },
    { resource: 'wallet', action: 'view' },
    { resource: 'reports', action: 'view' },
    { resource: 'support', action: 'manage' }
  ],
  user: [
    { resource: 'sms', action: 'send' },
    { resource: 'sms', action: 'schedule' },
    { resource: 'sms', action: 'view' },
    { resource: 'campaigns', action: 'create' },
    { resource: 'contacts', action: 'view' },
    { resource: 'contacts', action: 'manage' },
    { resource: 'contacts', action: 'import' },
    { resource: 'sender_ids', action: 'view' },
    { resource: 'wallet', action: 'view' },
    { resource: 'reports', action: 'view' },
    { resource: 'support', action: 'view' },
    { resource: 'api_keys', action: 'manage' },
    { resource: 'webhooks', action: 'manage' }
  ],
  viewer: [
    { resource: 'sms', action: 'view' },
    { resource: 'reports', action: 'view' }
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
  send: (resource: Resource) => hasPermission(role, resource, 'send'),
  schedule: (resource: Resource) => hasPermission(role, resource, 'schedule'),
  view: (resource: Resource) => hasPermission(role, resource, 'view'),
  import: (resource: Resource) => hasPermission(role, resource, 'import'),
  approve: (resource: Resource) => hasPermission(role, resource, 'approve'),
  monitor: (resource: Resource) => hasPermission(role, resource, 'monitor'),
});
