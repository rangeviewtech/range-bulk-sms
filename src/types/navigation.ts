

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface SidebarConfig {
  mainNav: NavItem[];
  sidebarNav: NavGroup[];
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}
