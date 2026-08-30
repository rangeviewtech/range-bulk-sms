export type Role = 'admin' | 'manager' | 'user' | 'viewer';

export interface Permission {
  resource: string;
  action: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
}
