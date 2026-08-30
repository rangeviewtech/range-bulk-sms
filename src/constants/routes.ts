export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
  },
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USERS: '/api/users',
} as const;
