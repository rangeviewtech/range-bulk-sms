/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  Send,
  Users,
  AtSign,
  Wallet,
  Activity,
  TrendingUp,
  BarChart,
  UserCog,
  Settings,
  User,
  Bell,
  ChevronRight,
  LogOut,
  KeyRound,
  X,
  Search,
  Check,
  Moon,
  Sun,
  Layers,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Navigation Hierarchy Type
export interface NavLeaf {
  title: string;
  href: string;
}

export interface NavCategory {
  title: string;
  items: NavLeaf[];
}

export interface NavModule {
  title: string;
  href?: string;
  icon: React.ReactNode;
  categories?: NavCategory[];
  roles?: string[];
}

// Bulk SMS Menu Hierarchy
export const RANGE_NAVIGATION: NavModule[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
  },
  {
    title: "SMS",
    icon: <Send className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
    categories: [
      {
        title: "Messaging",
        items: [
          { title: "Send SMS", href: "/sms/send" },
          { title: "Scheduled SMS", href: "/sms/scheduled" },
          { title: "Custom SMS", href: "/sms/custom" },
        ],
      },
      {
        title: "Campaigns",
        items: [
          { title: "All Campaigns", href: "/sms/campaigns" },
          { title: "Create Campaign", href: "/sms/campaigns/new" },
        ],
      },
      {
        title: "Assets",
        items: [
          { title: "Templates", href: "/sms/templates" },
          { title: "Delivery Reports", href: "/sms/delivery-reports" },
        ],
      },
    ],
  },
  {
    title: "Contacts",
    icon: <Users className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
    categories: [
      {
        title: "Management",
        items: [
          { title: "All Contacts", href: "/contacts" },
          { title: "Groups", href: "/contacts/groups" },
          { title: "Tags", href: "/contacts/tags" },
        ],
      },
      {
        title: "Tools",
        items: [
          { title: "Import Contacts", href: "/contacts/import" },
        ],
      },
    ],
  },
  {
    title: "Sender IDs",
    icon: <AtSign className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
    categories: [
      {
        title: "My Sender IDs",
        items: [
          { title: "Sender IDs", href: "/sender-ids" },
          { title: "Apply for Sender ID", href: "/sender-ids/apply" },
        ],
      },
    ],
  },
  {
    title: "Billing",
    icon: <Wallet className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
    categories: [
      {
        title: "Wallet",
        items: [
          { title: "Wallet Dashboard", href: "/wallet" },
          { title: "Transactions", href: "/wallet/transactions" },
        ],
      },
      {
        title: "Pricing",
        items: [
          { title: "SMS Pricing", href: "/wallet/pricing" },
        ],
      },
    ],
  },
  {
    title: "Developer",
    icon: <Activity className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
    categories: [
      {
        title: "API",
        items: [
          { title: "API Keys", href: "/developer/api-keys" },
          { title: "API Usage", href: "/developer/api-usage" },
          { title: "Webhooks", href: "/developer/webhooks" },
          { title: "Documentation", href: "/api/docs" },
        ],
      },
    ],
  },
  {
    title: "Agent",
    icon: <TrendingUp className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
    roles: ["ADMIN", "AGENT"],
    categories: [
      {
        title: "Agent Portal",
        items: [
          { title: "Agent Dashboard", href: "/agent/dashboard" },
          { title: "My Clients", href: "/agent/clients" },
          { title: "Commissions", href: "/agent/commissions" },
          { title: "Earnings", href: "/agent/earnings" },
        ],
      },
    ],
  },
  {
    title: "Reports",
    icon: <BarChart className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
    categories: [
      {
        title: "Analytics",
        items: [
          { title: "SMS Reports", href: "/reports/sms" },
          { title: "Campaign Reports", href: "/reports/campaigns" },
          { title: "Financial Reports", href: "/reports/financial" },
          { title: "Usage Reports", href: "/reports/usage" },
        ],
      },
    ],
  },
  {
    title: "Admin",
    icon: <UserCog className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
    roles: ["ADMIN"],
    categories: [
      {
        title: "Management",
        items: [
          { title: "Users", href: "/admin/users" },
          { title: "Clients", href: "/admin/clients" },
          { title: "Agents", href: "/admin/agents" },
        ],
      },
      {
        title: "Configuration",
        items: [
          { title: "SMS Providers", href: "/admin/providers" },
          { title: "Pricing Config", href: "/admin/pricing" },
          { title: "Sender ID Approvals", href: "/admin/sender-ids" },
          { title: "Commission Mgmt", href: "/admin/commissions" },
        ],
      },
      {
        title: "System",
        items: [
          { title: "Audit Logs", href: "/admin/audit-logs" },
          { title: "System Monitor", href: "/admin/system" },
          { title: "Job Queue", href: "/admin/communications/queue" },
          { title: "Comm Logs", href: "/admin/communications/logs" },
        ],
      },
    ],
  },
  {
    title: "Settings",
    icon: <Settings className="w-[26px] h-[26px] mb-1.5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.25} />,
    categories: [
      {
        title: "Preferences",
        items: [
          { title: "Settings Hub", href: "/settings" },
          { title: "Account", href: "/settings/account" },
          { title: "Security", href: "/settings/security" },
          { title: "Notifications", href: "/settings/notifications" },
          { title: "SMS Preferences", href: "/settings/sms" },
        ],
      },
      {
        title: "Support",
        items: [
          { title: "Support Tickets", href: "/support" },
        ],
      },
    ],
  },
];


const ITEM_HEIGHT = 38; // standard 38px height per menu row

interface RangeSidebarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string } | null;
}

export function RangeSidebar({ user }: RangeSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Flyout State
  const [hoveredModule, setHoveredModule] = React.useState<NavModule | null>(null);
  const [hoveredCategory, setHoveredCategory] = React.useState<NavCategory | null>(null);
  const [categoryIndex, setCategoryIndex] = React.useState<number>(0);
  const [flyoutTop, setFlyoutTop] = React.useState<number>(0);

  // Drawers & Dialogs
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isAppsMenuOpen, setIsAppsMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [activeNotiTab, setActiveNotiTab] = React.useState<"notifications" | "announcements">("notifications");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const userRole = user?.role || "CLIENT";
  
  const allowedNavigation = React.useMemo(() => {
    return RANGE_NAVIGATION.filter(mod => !mod.roles || mod.roles.includes(userRole));
  }, [userRole]);

  // Flat list of all searchable screens
  const allSearchableScreens = React.useMemo(() => {
    const screens: Array<{ module: string; category?: string; title: string; href: string }> = [];
    allowedNavigation.forEach((mod) => {
      if (mod.href) {
        screens.push({ module: mod.title, title: mod.title, href: mod.href });
      }
      if (mod.categories) {
        mod.categories.forEach((cat) => {
          cat.items.forEach((item) => {
            screens.push({
              module: mod.title,
              category: cat.title,
              title: item.title,
              href: item.href,
            });
          });
        });
      }
    });
    return screens;
  }, []);

  const filteredScreens = React.useMemo(() => {
    if (!searchQuery.trim()) return allSearchableScreens.slice(0, 15);
    const q = searchQuery.toLowerCase();
    return allSearchableScreens.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        s.module.toLowerCase().includes(q)
    );
  }, [searchQuery, allSearchableScreens]);

  // Global shortcut (Ctrl+K / Cmd+K) to toggle universal search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeAllFlyouts = () => {
    setHoveredModule(null);
    setHoveredCategory(null);
    setCategoryIndex(0);
  };

  // Compute smart top offset for #deepMenu so it NEVER overflows the bottom of the screen or #subMenu
  const deepMenuTopOffset = React.useMemo(() => {
    if (!hoveredModule || !hoveredModule.categories || !hoveredCategory) return 0;
    const deepMenuTotalHeight = hoveredCategory.items.length * ITEM_HEIGHT;
    const naturalTop = 32 + (categoryIndex * ITEM_HEIGHT);

    if (typeof window !== "undefined") {
      // Ensure flyoutTop + offset + deepMenuTotalHeight <= window.innerHeight - 16
      const maxAllowedOffset = Math.max(0, window.innerHeight - flyoutTop - deepMenuTotalHeight - 16);
      return Math.min(naturalTop, maxAllowedOffset);
    }
    return 0;
  }, [hoveredModule, hoveredCategory, categoryIndex, flyoutTop]);

  return (
    <>
      {/* UNIFIED CONTAINER FOR SIDEBAR + FLYOUTS TO MAINTAIN MOUSE INTERACTION */}
      <div 
        id="tree-outer-wrapper" 
        className="fixed top-0 left-0 h-full z-[60] pointer-events-none flex"
        onMouseLeave={closeAllFlyouts}
      >
        {/* 1. PRIMARY SIDEBAR (90px wide, #07163d) */}
        <aside
          id="left-tree"
          className="h-full w-[90px] bg-[#07163d] text-white flex flex-col pointer-events-auto select-none shadow-[4px_0_24px_rgba(0,0,0,0.4)] shrink-0 border-r border-white/5"
        >
          {/* LOGO CONTAINER (78px x 78px circular badge matching live site) */}
          <div id="tree-logo" className="flex items-center justify-center p-2 pt-2.5">
            <Link
              href="/dashboard"
              className="w-[78px] h-[78px] rounded-2xl bg-transparent hover:bg-white/5 border border-transparent flex flex-col items-center justify-center trakzee-logo-badge group overflow-hidden transition-all duration-300"
              title="Range SMS - Enterprise Bulk SMS"
            >
              <img
                src="/images/brand/range-icon-transparent.svg"
                alt="Range Bulk SMS Platform"
                className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </Link>
          </div>

          {/* USER & NOTIFICATIONS BAR (65px height) */}
          <div id="tree-user" className="flex items-center justify-center h-[65px] border-b border-white/10 relative">
            {/* User Icon */}
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen((prev) => !prev);
                setIsNotificationsOpen(false);
              }}
              className={cn(
                "flex-1 h-full flex items-center justify-center hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white cursor-pointer relative group",
                isUserMenuOpen && "bg-white/15 text-white"
              )}
              title="User Profile & Settings"
              aria-label="User Profile"
            >
              <User className="w-[22px] h-[22px] transition-transform duration-200 group-hover:scale-110" strokeWidth={1.3} />
            </button>

            {/* Divider */}
            <div className="w-[1px] h-[26px] bg-white/10" />

            {/* Notifications Icon */}
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen((prev) => !prev);
                setIsUserMenuOpen(false);
              }}
              className={cn(
                "flex-1 h-full flex items-center justify-center hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white cursor-pointer relative group",
                isNotificationsOpen && "bg-white/15 text-white"
              )}
              title="Notifications & Announcements"
              aria-label="Notifications"
            >
              <Bell className="w-[22px] h-[22px] transition-transform duration-200 group-hover:scale-110" strokeWidth={1.3} />
              <span className="absolute top-4 right-4 w-2 h-2 bg-[#FBCA07] rounded-full animate-ping opacity-75 ring-2 ring-[#07163d]" />
              <span className="absolute top-4 right-4 w-2 h-2 bg-[#FBCA07] rounded-full ring-2 ring-[#07163d]" />
            </button>
          </div>

          {/* PRIMARY MODULES LIST */}
          <div id="tree-module" className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar pb-8">
            {allowedNavigation.map((mod) => {
              const isHovered = hoveredModule?.title === mod.title;
              const isActive = mod.href ? pathname === mod.href : pathname.startsWith(`/${mod.title.toLowerCase()}`);

              return (
                <div
                  key={mod.title}
                  className="w-full aspect-square shrink-0 relative flex flex-col items-center justify-center cursor-pointer group"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const maxCategoryItems = Math.max(
                      1,
                      ...(mod.categories?.map((c) => c.items.length) || [1])
                    );
                    const subMenuHeight = (mod.categories?.length || 0) * ITEM_HEIGHT + 32;
                    const deepMenuHeight = maxCategoryItems * ITEM_HEIGHT;
                    const totalFlyoutHeight = Math.max(subMenuHeight, deepMenuHeight);
                    const maxTop = typeof window !== 'undefined'
                      ? Math.max(10, window.innerHeight - totalFlyoutHeight - 16)
                      : rect.top;
                    setFlyoutTop(Math.max(10, Math.min(rect.top, maxTop)));
                    setHoveredModule(mod);
                    // Don't auto-select first category — cascading reveal:
                    // Layer 1 (categories) shows first, Layer 2 (deep menu) only on category hover
                    setHoveredCategory(null);
                    setCategoryIndex(0);
                  }}
                >
                  {mod.href && !mod.categories ? (
                    <Link
                      href={mod.href}
                      className={cn(
                        "w-full h-full flex flex-col items-center justify-center text-white/75 hover:text-white trakzee-module-btn relative group",
                        (isHovered || isActive) && "bg-[#04648C] text-white shadow-inner"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FBCA07] shadow-[0_0_10px_#FBCA07] animate-indicator-slide" />
                      )}
                      {mod.icon}
                      <span className="text-[11px] font-medium tracking-tight text-center px-1 truncate max-w-[84px] group-hover:font-semibold transition-all">
                        {mod.title}
                      </span>
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "w-full h-full flex flex-col items-center justify-center text-white/75 hover:text-white trakzee-module-btn relative group",
                        (isHovered || isActive) && "bg-[#04648C] text-white shadow-inner"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FBCA07] shadow-[0_0_10px_#FBCA07] animate-indicator-slide" />
                      )}
                      {mod.icon}
                      <span className="text-[11px] font-medium tracking-tight text-center px-1 truncate max-w-[84px] group-hover:font-semibold transition-all">
                        {mod.title}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </aside>

        {/* 2. MULTI-LEVEL FLYOUT MENU (Layer 2 #subMenu + Layer 3 #deepMenu) */}
        {hoveredModule && hoveredModule.categories && (
          <div
            id="flyout-container"
            className="absolute left-[90px] flex select-none pointer-events-auto"
            style={{ 
              top: `${flyoutTop}px` 
            }}
          >
            {/* LAYER 2: Submenu Categories (170px wide, #1542b7 / rgb(21, 66, 183)) */}
            <div
              id="subMenu"
              className="w-[170px] bg-[#04648C] text-white flex flex-col border-r border-white/10 max-h-[calc(100vh-32px)] overflow-y-auto no-scrollbar animate-flyout-sub shadow-[4px_6px_16px_rgba(0,0,0,0.3)] z-10 shrink-0"
            >
              {/* Module title header */}
              <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-white/50 border-b border-white/10 bg-[#04648C]/80">
                {hoveredModule.title}
              </div>
              <ul className="py-0 list-none m-0 p-0 divide-y divide-white/5">
                {hoveredModule.categories.map((cat, idx) => {
                  const isCatHovered = hoveredCategory?.title === cat.title;
                  return (
                    <li
                      key={cat.title}
                      onMouseEnter={() => {
                        setHoveredCategory(cat);
                        setCategoryIndex(idx);
                        if (typeof window !== 'undefined') {
                          const catHeight = cat.items.length * ITEM_HEIGHT;
                          const maxAllowedTop = window.innerHeight - catHeight - 16;
                          setFlyoutTop((prev) => Math.min(prev, Math.max(10, maxAllowedTop)));
                        }
                      }}
                      className={cn(
                        "h-[38px] px-3 flex items-center justify-between text-[12px] font-medium text-white/90 hover:text-white trakzee-menu-item cursor-pointer transition-all duration-150 group",
                        isCatHovered 
                          ? "bg-[#07163d] text-white font-semibold shadow-inner border-l-2 border-[#FBCA07]" 
                          : "hover:bg-[#07163d]/80 border-l-2 border-transparent"
                      )}
                    >
                      <span className="truncate">{cat.title}</span>
                      <ChevronRight
                        className={cn(
                          "w-3.5 h-3.5 text-white/50 group-hover:text-white transition-all duration-200",
                          isCatHovered ? "text-[#FBCA07] translate-x-1" : "group-hover:translate-x-0.5"
                        )}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* LAYER 3: Deep Menu Screens (180px wide, positioned dynamically & clamped to subMenu bottom) */}
            {hoveredCategory && (
              <div
                id="deepMenu"
                key={hoveredCategory.title}
                className="w-[180px] bg-[#04648C] text-white flex flex-col h-fit max-h-[calc(100vh-32px)] overflow-y-auto no-scrollbar border-r border-white/10 animate-flyout-deep shadow-[4px_6px_18px_rgba(0,0,0,0.35)] shrink-0"
                style={{
                  marginTop: `${deepMenuTopOffset}px`
                }}
              >
                <ul className="py-0 list-none m-0 p-0 divide-y divide-white/5">
                  {hoveredCategory.items.map((screen) => {
                    const isCurrent = pathname === screen.href;
                    return (
                      <li key={screen.title} className="h-[38px] cursor-pointer group">
                        <Link
                          href={screen.href}
                          onClick={closeAllFlyouts}
                          className={cn(
                            "w-full h-full px-3.5 flex items-center text-[12px] text-white/90 hover:text-white trakzee-menu-item transition-all duration-150 truncate border-l-2",
                            isCurrent 
                              ? "bg-[#07163d] text-white font-semibold border-[#FBCA07]" 
                              : "border-transparent hover:bg-[#07163d]/90 hover:border-white/30"
                          )}
                          title={screen.title}
                        >
                          <span className="truncate group-hover:translate-x-1 transition-transform duration-150">{screen.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. USER PROFILE DRAWER / FLYOUT */}
      {isUserMenuOpen && (
        <div
          className="fixed top-[80px] left-[90px] w-[210px] bg-card text-card-foreground border border-border shadow-[0_12px_36px_rgba(0,0,0,0.25)] rounded-md z-[70] py-1.5 text-xs font-medium animate-in fade-in slide-in-from-left-2 duration-200"
          onMouseLeave={() => {
            setIsUserMenuOpen(false);
            setIsAppsMenuOpen(false);
          }}
        >
          {/* User Email Banner */}
          <div className="px-3.5 py-2 border-b border-border text-[11px] font-semibold text-muted-foreground truncate bg-muted/30">
            {user?.email || "ali@technologyhubjuba.com"}
          </div>

          <Link
            href="/settings/security"
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 hover:bg-muted/70 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Change Password</span>
          </Link>

          <Link
            href="/settings/subuser"
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 hover:bg-muted/70 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Set Subuser</span>
          </Link>

          {/* Applications Sub-flyout */}
          <div
            className="relative"
            onMouseEnter={() => setIsAppsMenuOpen(true)}
            onMouseLeave={() => setIsAppsMenuOpen(false)}
          >
            <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/70 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Applications</span>
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </div>

            {isAppsMenuOpen && (
              <div className="absolute top-0 left-full w-[170px] bg-card border border-border shadow-2xl rounded-md py-1.5 ml-1 text-xs animate-in fade-in slide-in-from-left-1 duration-150">
                <Link
                  href="/api/docs"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-3.5 py-2 hover:bg-muted/70 transition-colors"
                >
                  Range SMS API
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/70 transition-colors font-semibold text-[#04648C]"
                >
                  <span>Range SMS App</span>
                  <Check className="w-3.5 h-3.5 text-[#04648C]" />
                </Link>
                <div className="h-[1px] bg-border my-1" />
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-3.5 py-1.5 text-[11px] text-muted-foreground hover:bg-muted/70 transition-colors"
                >
                  Set Default Application
                </Link>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-muted/70 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              <span>Theme: {theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </div>
          </button>

          <Link
            href="/help"
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 hover:bg-muted/70 transition-colors border-t border-border mt-1"
          >
            <Check className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Help & Support</span>
          </Link>

          {/* Logout Action */}
          <form action="/api/auth/logout" method="POST" className="border-t border-border mt-1">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      )}

      {/* 4. NOTIFICATIONS DRAWER */}
      {isNotificationsOpen && (
        <div className="fixed top-0 left-[90px] h-full w-[320px] bg-card text-card-foreground border-r border-border shadow-[0_16px_48px_rgba(0,0,0,0.3)] flex flex-col z-[70] animate-in slide-in-from-left duration-250 pointer-events-auto">
          {/* Header Tabs */}
          <div className="h-[46px] flex items-stretch border-b border-border bg-muted/40">
            <button
              type="button"
              onClick={() => setActiveNotiTab("notifications")}
              className={cn(
                "flex-1 flex items-center justify-center text-xs font-semibold border-b-2 transition-colors cursor-pointer",
                activeNotiTab === "notifications"
                  ? "border-[#04648C] text-[#04648C] bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Notifications
            </button>
            <button
              type="button"
              onClick={() => setActiveNotiTab("announcements")}
              className={cn(
                "flex-1 flex items-center justify-center text-xs font-semibold border-b-2 transition-colors cursor-pointer",
                activeNotiTab === "announcements"
                  ? "border-[#04648C] text-[#04648C] bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Announcements
            </button>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(false)}
              className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close Notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Priority Filters for Notifications */}
          {activeNotiTab === "notifications" && (
            <div className="grid grid-cols-3 border-b border-border text-center text-xs">
              <div className="py-2.5 bg-red-50 dark:bg-red-950/30 border-b-2 border-red-500 text-red-600 dark:text-red-400 cursor-pointer transition-all hover:brightness-95">
                <div className="text-sm font-bold">0</div>
                <div className="text-[10px] uppercase font-semibold">High</div>
              </div>
              <div className="py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 cursor-pointer transition-all hover:brightness-95">
                <div className="text-sm font-bold">0</div>
                <div className="text-[10px] uppercase font-semibold">Medium</div>
              </div>
              <div className="py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-all hover:brightness-95">
                <div className="text-sm font-bold">0</div>
                <div className="text-[10px] uppercase font-semibold">Low</div>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Bell className="w-10 h-10 stroke-1 opacity-20 mb-3" />
            <p className="text-xs font-medium">
              {activeNotiTab === "notifications" ? "No new notifications found." : "No active announcements."}
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">
              {activeNotiTab === "notifications" ? "Geofence, speed, and sensor alerts will appear here." : "System broadcasts will be shown here."}
            </p>
          </div>
        </div>
      )}

      {/* 5. UNIVERSAL SCREEN SEARCH OVERLAY */}
      {pathname !== "/tracking" && (
        <div className="fixed top-3.5 right-4 z-[50]">
          <button
            type="button"
            id="universalSelectorSearchIcon"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:scale-115 transition-all duration-200 cursor-pointer"
            title="Search Screens (Ctrl+K)"
            aria-label="Search Screens"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17.7802 16.7196L12.6615 11.6009C13.653 10.3762 14.25 8.81991 14.25 7.12494C14.25 3.19648 11.0535 0 7.12498 0C3.19648 0 0 3.19645 0 7.12491C0 11.0534 3.19651 14.2498 7.12501 14.2498C8.82 14.2498 10.3763 13.6529 11.601 12.6614L16.7198 17.7801C16.866 17.9263 17.058 17.9998 17.25 17.9998C17.442 17.9998 17.634 17.9263 17.7803 17.7801C18.0735 17.4868 18.0735 17.0128 17.7802 16.7196ZM7.12501 12.7499C4.023 12.7499 1.50001 10.2269 1.50001 7.12491C1.50001 4.02293 4.023 1.49996 7.12501 1.49996C10.227 1.49996 12.75 4.02293 12.75 7.12491C12.75 10.2269 10.227 12.7499 7.12501 12.7499Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      )}

      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200 pointer-events-auto"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-card border border-border rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-muted/20">
              <Search className="w-4 h-4 text-[#04648C] dark:text-[#FBCA07]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search across all screens..."
                className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 p-1">
              {filteredScreens.length > 0 ? (
                filteredScreens.map((s) => (
                  <Link
                    key={`${s.module}-${s.category}-${s.title}`}
                    href={s.href}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/70 rounded-md transition-all duration-150 group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground group-hover:text-[#04648C] dark:group-hover:text-[#FBCA07] transition-colors">
                        {s.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {s.module} {s.category ? `> ${s.category}` : ""}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#04648C] dark:group-hover:text-[#FBCA07] transition-transform group-hover:translate-x-1" />
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No matching screens found for &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>

            {/* Footer Status */}
            <div className="px-4 py-2 bg-muted/40 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{allSearchableScreens.length} total screens indexed</span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
