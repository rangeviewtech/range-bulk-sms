'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { appConfig } from '@/config/app';

const BRAND_NAME = appConfig.name || 'Range Bulk SMS';

export const ROUTE_TITLE_MAP: Record<string, string> = {
  '/': 'Enterprise Bulk SMS Platform',
  '/dashboard': 'Dashboard',

  // SMS Messaging
  '/sms/send': 'Send SMS',
  '/sms/scheduled': 'Scheduled SMS',
  '/sms/campaigns': 'SMS Campaigns',
  '/sms/campaigns/new': 'New Campaign',
  '/sms/templates': 'SMS Templates',
  '/sms/drafts': 'SMS Drafts',
  '/sms/delivery-reports': 'Delivery Reports',
  '/sms/custom': 'Custom SMS',
  '/sms/variables': 'Custom Variables',

  // Contacts
  '/contacts': 'Contacts',
  '/contacts/groups': 'Contact Groups',
  '/contacts/import': 'Import Contacts',
  '/contacts/segments': 'Contact Segments',
  '/contacts/tags': 'Contact Tags',

  // Sender IDs
  '/sender-ids': 'Sender IDs',
  '/sender-ids/apply': 'Apply Sender ID',

  // Billing & Finance
  '/billing': 'Billing & Plans',
  '/wallet': 'Wallet & Balances',
  '/wallet/pricing': 'Pricing & Rates',
  '/wallet/transactions': 'Wallet Transactions',

  // Reports & Analytics
  '/reports': 'SMS Reports',
  '/reports/sms': 'SMS Delivery Reports',
  '/reports/campaigns': 'Campaign Reports',
  '/reports/financial': 'Financial Reports',
  '/reports/usage': 'Usage Analytics',

  // Hardware Gateways
  '/gateways': 'Hardware Gateways',
  '/gateways/add': 'Pair Gateway',

  // Developer Portal
  '/developer': 'Developer Portal',
  '/developer/api-keys': 'API Keys',
  '/developer/api-usage': 'API Usage',
  '/developer/webhooks': 'Webhooks',

  // Settings & Profile
  '/settings': 'Settings',
  '/settings/account': 'Account Settings',
  '/settings/security': 'Security Settings',
  '/settings/notifications': 'Notification Preferences',
  '/settings/sms': 'SMS Settings',
  '/profile': 'Profile',
  '/notifications': 'Notifications',

  // Support
  '/support': 'Help & Support',

  // Agent Portal
  '/agent': 'Agent Portal',
  '/agent/dashboard': 'Agent Dashboard',
  '/agent/clients': 'Agent Clients',
  '/agent/commissions': 'Agent Commissions',
  '/agent/earnings': 'Agent Earnings',

  // Admin Portal
  '/admin/users': 'User Management',
  '/admin/clients': 'Client Management',
  '/admin/agents': 'Agent Management',
  '/admin/providers': 'Telecom Providers',
  '/admin/sender-ids': 'Sender ID Approvals',
  '/admin/pricing': 'Pricing Management',
  '/admin/commissions': 'Commission Approvals',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/system': 'System Health',
  '/admin/communications/queue': 'Message Queue',
  '/admin/communications/logs': 'Carrier Message Logs',
  '/admin/communications/providers': 'Gateway Routing',

  // Auth
  '/login': 'Sign In',
  '/register': 'Create Account',
  '/forgot-password': 'Forgot Password',
  '/reset-password': 'Reset Password',
  '/otp': 'OTP Verification',
  '/2fa': 'Two-Factor Authentication',
  '/2fa/challenge': 'Security Challenge',
  '/screen-lock': 'Screen Lock',

  // Legal & Public
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/cookies': 'Cookie Policy',
  '/api/docs': 'API Documentation',
  '/design-system': 'Design System',
  '/help': 'Page Not Found',
};

/**
 * Resolves the canonical title for a given pathname, formatted as "[Page Title] | Range Bulk SMS".
 */
export function resolveTitle(pathname: string): string {
  if (!pathname) return BRAND_NAME;

  const normalized =
    pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  // Exact match from map
  if (ROUTE_TITLE_MAP[normalized]) {
    return `${ROUTE_TITLE_MAP[normalized]} | ${BRAND_NAME}`;
  }

  // Dynamic route patterns
  if (normalized.startsWith('/sms/campaigns/')) {
    return `Campaign Details | ${BRAND_NAME}`;
  }
  if (normalized.startsWith('/contacts/')) {
    return `Contact Profile | ${BRAND_NAME}`;
  }
  if (normalized.startsWith('/design-system/')) {
    const sub = normalized.replace('/design-system/', '');
    const cleanSub = sub.charAt(0).toUpperCase() + sub.slice(1);
    return `${cleanSub} - Design System | ${BRAND_NAME}`;
  }

  // Fallback: auto-capitalize route slug segments
  const segments = normalized.split('/').filter(Boolean);
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    const words = last
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return `${words} | ${BRAND_NAME}`;
  }

  return BRAND_NAME;
}

export function PageTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const expectedTitle = resolveTitle(pathname);

    const applyTitle = () => {
      if (document.title !== expectedTitle) {
        document.title = expectedTitle;
      }
    };

    // 1. Initial immediate execution
    applyTitle();

    // 2. Delayed execution to override Next.js router async title resets
    const t1 = setTimeout(applyTitle, 60);
    const t2 = setTimeout(applyTitle, 200);
    const t3 = setTimeout(applyTitle, 500);

    // 3. MutationObserver on <title> element to guarantee persistent [Page Title] | Range Bulk SMS
    let observer: MutationObserver | null = null;
    const titleEl = document.querySelector('title');
    if (titleEl) {
      observer = new MutationObserver(() => {
        if (document.title !== expectedTitle && (document.title === BRAND_NAME || !document.title.includes('|'))) {
          document.title = expectedTitle;
        }
      });
      observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [pathname]);

  return null;
}
