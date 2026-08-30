import { NavGroup } from '@/types/navigation';

export const navConfig: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: 'LayoutDashboard',
      },
      {
        title: 'Analytics',
        href: '/analytics',
        icon: 'BarChart2',
      }
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        title: 'Examples',
        href: '/examples',
        icon: 'BookOpen',
        // Note: For a real sidebar you might want nested items, but since our sidebar doesn't have nested items yet,
        // we can just add them flat or build out the sidebar to support nested items. Let's add them flat.
      },
      {
        title: 'Auth Layouts',
        href: '/examples/auth',
        icon: 'Lock',
      },
      {
        title: 'UI Blocks',
        href: '/examples/ui',
        icon: 'Layers',
      },
      {
        title: 'Design System',
        href: '/design-system',
        icon: 'Palette',
      }
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        href: '/settings',
        icon: 'Settings',
      },
      {
        title: 'Security',
        href: '/settings/security',
        icon: 'Shield',
      },
    ],
  },
  {
    title: 'Communications',
    items: [
      {
        title: 'Job Queue',
        href: '/admin/communications/queue',
        icon: 'Activity',
      },
      {
        title: 'Comm Logs',
        href: '/admin/communications/logs',
        icon: 'MessageSquare',
      },
      {
        title: 'Providers',
        href: '/admin/communications/providers',
        icon: 'Server',
      }
    ],
  }
];
