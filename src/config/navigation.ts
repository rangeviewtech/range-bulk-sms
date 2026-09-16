import { NavGroup } from '@/types/navigation';

export const navConfig: NavGroup[] = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: 'LayoutDashboard',
      },
    ],
  },
  {
    title: 'SMS',
    items: [
      {
        title: 'Send SMS',
        href: '/sms/send',
        icon: 'Send',
      },
      {
        title: 'Scheduled SMS',
        href: '/sms/scheduled',
        icon: 'Clock',
      },
      {
        title: 'Custom SMS',
        href: '/sms/custom',
        icon: 'Sparkles',
      },
      {
        title: 'Campaigns',
        href: '/sms/campaigns',
        icon: 'Megaphone',
      },
      {
        title: 'Templates',
        href: '/sms/templates',
        icon: 'FileText',
      },
      {
        title: 'Delivery Reports',
        href: '/sms/delivery-reports',
        icon: 'BarChart3',
      },
    ],
  },
  {
    title: 'Contacts',
    items: [
      {
        title: 'Contacts',
        href: '/contacts',
        icon: 'Users',
      },
      {
        title: 'Groups',
        href: '/contacts/groups',
        icon: 'UsersRound',
      },
      {
        title: 'Tags',
        href: '/contacts/tags',
        icon: 'Tag',
      },
      {
        title: 'Import',
        href: '/contacts/import',
        icon: 'Upload',
      },
    ],
  },
  {
    title: 'Sender IDs',
    items: [
      {
        title: 'My Sender IDs',
        href: '/sender-ids',
        icon: 'AtSign',
      },
      {
        title: 'Applications',
        href: '/sender-ids/apply',
        icon: 'FileCheck',
      },
    ],
  },
  {
    title: 'Billing',
    items: [
      {
        title: 'Wallet',
        href: '/wallet',
        icon: 'Wallet',
      },
      {
        title: 'Transactions',
        href: '/wallet/transactions',
        icon: 'ArrowLeftRight',
      },
      {
        title: 'Pricing',
        href: '/wallet/pricing',
        icon: 'DollarSign',
      },
    ],
  },
  {
    title: 'Developer',
    items: [
      {
        title: 'API Keys',
        href: '/developer/api-keys',
        icon: 'Key',
      },
      {
        title: 'API Usage',
        href: '/developer/api-usage',
        icon: 'Activity',
      },
      {
        title: 'Webhooks',
        href: '/developer/webhooks',
        icon: 'Webhook',
      },
      {
        title: 'Documentation',
        href: '/api/docs',
        icon: 'BookOpen',
      },
    ],
  },
  {
    title: 'Agent',
    items: [
      {
        title: 'Agent Dashboard',
        href: '/agent/dashboard',
        icon: 'TrendingUp',
      },
      {
        title: 'My Clients',
        href: '/agent/clients',
        icon: 'Building2',
      },
      {
        title: 'Commissions',
        href: '/agent/commissions',
        icon: 'Coins',
      },
      {
        title: 'Earnings',
        href: '/agent/earnings',
        icon: 'BadgeDollarSign',
      },
    ],
  },
  {
    title: 'Reports',
    items: [
      {
        title: 'SMS Reports',
        href: '/reports/sms',
        icon: 'FileBarChart',
      },
      {
        title: 'Campaign Reports',
        href: '/reports/campaigns',
        icon: 'PieChart',
      },
      {
        title: 'Financial Reports',
        href: '/reports/financial',
        icon: 'TrendingUp',
      },
      {
        title: 'Usage Reports',
        href: '/reports/usage',
        icon: 'BarChart',
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Users',
        href: '/admin/users',
        icon: 'UserCog',
      },
      {
        title: 'Clients',
        href: '/admin/clients',
        icon: 'Building',
      },
      {
        title: 'Agents',
        href: '/admin/agents',
        icon: 'UserPlus',
      },
      {
        title: 'SMS Providers',
        href: '/admin/providers',
        icon: 'Server',
      },
      {
        title: 'Pricing Config',
        href: '/admin/pricing',
        icon: 'Settings2',
      },
      {
        title: 'Sender ID Approvals',
        href: '/admin/sender-ids',
        icon: 'ShieldCheck',
      },
      {
        title: 'Commission Management',
        href: '/admin/commissions',
        icon: 'Calculator',
      },
      {
        title: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: 'ScrollText',
      },
      {
        title: 'System Monitor',
        href: '/admin/system',
        icon: 'Monitor',
      },
      {
        title: 'Communications',
        href: '/admin/communications',
        icon: 'MessageSquare',
      },
      {
        title: 'Job Queue',
        href: '/admin/communications/queue',
        icon: 'ListChecks',
      },
      {
        title: 'Comm Logs',
        href: '/admin/communications/logs',
        icon: 'Mail',
      },
      {
        title: 'Providers',
        href: '/admin/communications/providers',
        icon: 'Radio',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Notifications',
        href: '/notifications',
        icon: 'Bell',
      },
      {
        title: 'Support',
        href: '/support',
        icon: 'LifeBuoy',
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: 'Settings',
      },
      {
        title: 'Account Settings',
        href: '/settings/account',
        icon: 'User',
      },
      {
        title: 'Security Settings',
        href: '/settings/security',
        icon: 'Shield',
      },
      {
        title: 'Notification Settings',
        href: '/settings/notifications',
        icon: 'BellRing',
      },
      {
        title: 'SMS Preferences',
        href: '/settings/sms',
        icon: 'MessageSquare',
      },
    ],
  }
];
