"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Gauge,
  MapPin,
  FileText,
  PieChart,
  Settings,
  User,
  Bell,
  ChevronRight,
  LogOut,
  KeyRound,
  Users,
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
}

// Complete 86-Screen Menu Hierarchy directly duplicated from https://sa-trakzee.uffizio.com/
export const TRAKZEE_NAVIGATION: NavModule[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Gauge className="w-[26px] h-[26px] mb-1.5" strokeWidth={1.25} />,
  },
  {
    title: "Tracking",
    href: "/tracking",
    icon: <MapPin className="w-[26px] h-[26px] mb-1.5" strokeWidth={1.25} />,
  },
  {
    title: "Reports",
    icon: <FileText className="w-[26px] h-[26px] mb-1.5" strokeWidth={1.25} />,
    categories: [
      {
        title: "Activity",
        items: [
          { title: "Travel", href: "/reports/activity/travel" },
          { title: "Travel History", href: "/reports/activity/travel-history" },
          { title: "Trip", href: "/reports/activity/trip" },
          { title: "Stoppage", href: "/reports/activity/stoppage" },
          { title: "Idle", href: "/reports/activity/idle" },
          { title: "Inactive", href: "/reports/activity/inactive" },
          { title: "Object Status", href: "/reports/activity/object-status" },
          { title: "Daywise Distance", href: "/reports/activity/daywise-distance" },
          { title: "Speed vs Distance", href: "/reports/activity/speed-distance" },
          { title: "Object Location", href: "/reports/activity/object-location" },
          { title: "Overspeed Summary", href: "/reports/activity/overspeed" },
        ],
      },
      {
        title: "Geofence-Address",
        items: [
          { title: "Geofence", href: "/reports/geofence" },
          { title: "Address", href: "/reports/address" },
          { title: "Geofence Visited Summary", href: "/reports/geofence-visited" },
        ],
      },
      {
        title: "Sensor",
        items: [
          { title: "Ignition", href: "/reports/sensor/ignition" },
          { title: "Air Conditioner", href: "/reports/sensor/ac" },
          { title: "Analog Data", href: "/reports/sensor/analog" },
          { title: "RFID Data", href: "/reports/sensor/rfid" },
          { title: "Digital Ports", href: "/reports/sensor/digital-ports" },
          { title: "Air Conditioner Misused", href: "/reports/sensor/ac-misused" },
          { title: "Immobilize", href: "/reports/sensor/immobilize" },
        ],
      },
      {
        title: "Alert",
        items: [
          { title: "Object Alert", href: "/reports/alert/object" },
          { title: "Alert Status", href: "/reports/alert/status" },
        ],
      },
      {
        title: "Reminder",
        items: [
          { title: "Reminder Status", href: "/reports/reminder/status" },
          { title: "Acknowledgement History", href: "/reports/reminder/acknowledgement" },
        ],
      },
      {
        title: "Expense",
        items: [
          { title: "Expense", href: "/reports/expense/summary" },
          { title: "Object Cost", href: "/reports/expense/object-cost" },
          { title: "Maintenance History", href: "/reports/expense/maintenance" },
          { title: "Category Wise Expense", href: "/reports/expense/category" },
          { title: "Object Monthly Cost", href: "/reports/expense/monthly-cost" },
        ],
      },
      {
        title: "Fuel",
        items: [
          { title: "Fill-Drain", href: "/reports/fuel/fill-drain" },
          { title: "Fuel Economy", href: "/reports/fuel/economy" },
          { title: "Fuel Consumption", href: "/reports/fuel/consumption" },
          { title: "Fuel Abnormal Consumption", href: "/reports/fuel/abnormal" },
          { title: "Digital Port - Fuel Summary", href: "/reports/fuel/digital-port" },
          { title: "Work Hour Vs Fuel Mileage", href: "/reports/fuel/mileage" },
          { title: "Fuel Dashboard", href: "/reports/fuel/dashboard" },
          { title: "Fuel Expense Summary", href: "/reports/fuel/expense" },
        ],
      },
      {
        title: "Billing",
        items: [
          { title: "Payment Detail", href: "/reports/billing/payment" },
          { title: "Postpaid Billing History", href: "/reports/billing/postpaid" },
          { title: "Object Expiry Log", href: "/reports/billing/expiry-log" },
          { title: "Admin Wise Object", href: "/reports/billing/admin-object" },
          { title: "Object Payment Detail Summary", href: "/reports/billing/payment-summary" },
        ],
      },
      {
        title: "Logs",
        items: [
          { title: "User Access", href: "/reports/logs/user-access" },
          { title: "User Detail", href: "/reports/logs/user-detail" },
          { title: "Announcements", href: "/reports/logs/announcements" },
          { title: "System Log", href: "/reports/logs/system" },
          { title: "Device Log", href: "/reports/logs/device" },
          { title: "Added Deleted Object Log Report", href: "/reports/logs/object-crud" },
          { title: "Send Command Log", href: "/reports/logs/send-command" },
          { title: "Device Communication Log", href: "/admin/communications/logs" },
          { title: "Application Usage", href: "/reports/logs/app-usage" },
        ],
      },
      {
        title: "Hardware Maintenance",
        items: [
          { title: "Technician Task Summary", href: "/reports/maintenance/technician-tasks" },
          { title: "Company Service Task", href: "/reports/maintenance/company-tasks" },
        ],
      },
      {
        title: "Document",
        items: [
          { title: "Object Document status", href: "/reports/document/object" },
          { title: "Driver Document status", href: "/reports/document/driver" },
        ],
      },
    ],
  },
  {
    title: "Charts",
    icon: <PieChart className="w-[26px] h-[26px] mb-1.5" strokeWidth={1.25} />,
    categories: [
      {
        title: "Activity",
        items: [
          { title: "Speed Vs Time", href: "/charts/activity/speed-time" },
          { title: "Battery Voltage", href: "/charts/activity/battery-voltage" },
          { title: "Battery Percentage", href: "/charts/activity/battery-percentage" },
        ],
      },
      {
        title: "Alert",
        items: [
          { title: "Alerts", href: "/charts/alert" },
        ],
      },
      {
        title: "Fuel",
        items: [
          { title: "Fuel", href: "/charts/fuel" },
          { title: "Fill-Drain", href: "/charts/fuel/fill-drain" },
          { title: "Fuel Economy", href: "/charts/fuel/economy" },
        ],
      },
      {
        title: "Expense",
        items: [
          { title: "Cost Distribution", href: "/charts/expense/distribution" },
          { title: "Cost By Time", href: "/charts/expense/by-time" },
        ],
      },
    ],
  },
  {
    title: "Settings",
    icon: <Settings className="w-[26px] h-[26px] mb-1.5" strokeWidth={1.25} />,
    categories: [
      {
        title: "General",
        items: [
          { title: "Company", href: "/settings/company" },
          { title: "Company Subuser", href: "/settings/subuser" },
          { title: "Branch", href: "/settings/branch" },
          { title: "Object", href: "/settings/object" },
          { title: "Driver", href: "/settings/driver" },
          { title: "Alert", href: "/settings/alert" },
          { title: "Reminder Rule", href: "/settings/reminder" },
          { title: "Template", href: "/settings/template" },
        ],
      },
      {
        title: "Master",
        items: [
          { title: "Expense", href: "/settings/master/expense" },
          { title: "Object Group", href: "/settings/master/object-group" },
          { title: "Send Command", href: "/settings/master/command" },
          { title: "Announcement", href: "/settings/master/announcement" },
          { title: "Address", href: "/settings/master/address" },
          { title: "Geofence", href: "/settings/master/geofence" },
          { title: "Cloud Download", href: "/settings/master/cloud" },
        ],
      },
      {
        title: "Technician",
        items: [
          { title: "Technician", href: "/settings/technician" },
          { title: "Technician Task", href: "/settings/technician/task" },
        ],
      },
      {
        title: "Billing",
        items: [
          { title: "Tariff Plan", href: "/settings/billing/tariff" },
        ],
      },
      {
        title: "Bulk Action",
        items: [
          { title: "Bulk Object Update", href: "/settings/bulk/object" },
        ],
      },
    ],
  },
];

interface TrakzeeSidebarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
}

export function TrakzeeSidebar({ user }: TrakzeeSidebarProps) {
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
  const [isCloudDownloadOpen, setIsCloudDownloadOpen] = React.useState(false);

  // Flat list of all searchable screens
  const allSearchableScreens = React.useMemo(() => {
    const screens: Array<{ module: string; category?: string; title: string; href: string }> = [];
    TRAKZEE_NAVIGATION.forEach((mod) => {
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
          className="h-full w-[90px] bg-[#07163d] text-white flex flex-col pointer-events-auto select-none shadow-2xl shrink-0"
        >
          {/* LOGO CONTAINER (78px x 78px circular badge matching live site) */}
          <div id="tree-logo" className="flex items-center justify-center p-2 pt-2.5">
            <Link
              href="/dashboard"
              className="w-[78px] h-[78px] rounded-full bg-[#02050f] border border-white/20 flex flex-col items-center justify-center hover:border-white/40 transition-all shadow-inner group overflow-hidden"
              title="Trakzee - Fleet Telematics"
            >
              {/* Live Uffizio Logo */}
              <img 
                src="/images/smart/ulogo.png" 
                alt="Uffizio Trakzee Logo" 
                className="w-[60px] h-[24px] object-contain"
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
                "flex-1 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white cursor-pointer relative",
                isUserMenuOpen && "bg-white/15 text-white"
              )}
              title="User Profile & Settings"
              aria-label="User Profile"
            >
              <User className="w-[22px] h-[22px]" strokeWidth={1.3} />
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
                "flex-1 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white cursor-pointer relative",
                isNotificationsOpen && "bg-white/15 text-white"
              )}
              title="Notifications & Announcements"
              aria-label="Notifications"
            >
              <Bell className="w-[22px] h-[22px]" strokeWidth={1.3} />
              <span className="absolute top-4 right-4 w-2 h-2 bg-[#29a4ff] rounded-full animate-pulse ring-2 ring-[#07163d]" />
            </button>
          </div>

          {/* PRIMARY MODULES LIST */}
          <div id="tree-module" className="flex-1 flex flex-col py-1 overflow-y-auto overflow-x-hidden">
            {TRAKZEE_NAVIGATION.map((mod) => {
              const isHovered = hoveredModule?.title === mod.title;
              const isActive = mod.href ? pathname === mod.href : pathname.startsWith(`/${mod.title.toLowerCase()}`);

              return (
                <div
                  key={mod.title}
                  className="w-full h-[78px] relative flex flex-col items-center justify-center cursor-pointer transition-all duration-150"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setFlyoutTop(rect.top);
                    setHoveredModule(mod);
                    setHoveredCategory(mod.categories ? mod.categories[0] : null);
                    setCategoryIndex(0);
                  }}
                >
                  {mod.href && !mod.categories ? (
                    <Link
                      href={mod.href}
                      className={cn(
                        "w-full h-full flex flex-col items-center justify-center text-white/75 hover:text-white hover:bg-[#1542b7] transition-colors relative",
                        (isHovered || isActive) && "bg-[#1542b7] text-white"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#29a4ff]" />
                      )}
                      {mod.icon}
                      <span className="text-[11px] font-medium tracking-tight text-center px-1 truncate max-w-[84px]">
                        {mod.title}
                      </span>
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "w-full h-full flex flex-col items-center justify-center text-white/75 hover:text-white hover:bg-[#1542b7] transition-colors relative",
                        (isHovered || isActive) && "bg-[#1542b7] text-white"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#29a4ff]" />
                      )}
                      {mod.icon}
                      <span className="text-[11px] font-medium tracking-tight text-center px-1 truncate max-w-[84px]">
                        {mod.title}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM CLOUD DOWNLOAD */}
          <div id="tree-download" className="h-[50px] border-t border-white/10 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsCloudDownloadOpen(true)}
              className="w-full h-full flex items-center justify-center hover:bg-[#1542b7] transition-colors cursor-pointer"
              title="Cloud Download"
              aria-label="Cloud Download"
            >
              <img 
                src="/images/smart/cloude_download_new.svg" 
                alt="Cloud Download" 
                className="h-[27px] w-auto object-contain"
              />
            </button>
          </div>
        </aside>

        {/* 2. MULTI-LEVEL FLYOUT MENU (Layer 2 #subMenu + Layer 3 #deepMenu) */}
        {hoveredModule && hoveredModule.categories && (
          <div
            id="flyout-container"
            className="absolute left-[90px] flex shadow-2xl transition-all duration-75 select-none pointer-events-auto"
            style={{ 
              top: `${Math.min(flyoutTop, typeof window !== 'undefined' ? Math.max(10, window.innerHeight - 440) : 100)}px` 
            }}
          >
            {/* LAYER 2: Submenu Categories (170px wide, #1542b7 / rgb(21, 66, 183)) */}
            <div
              id="subMenu"
              className="w-[170px] bg-[#1542b7] text-white flex flex-col shadow-2xl border-r border-white/10 max-h-[85vh] overflow-y-auto"
            >
              <ul className="py-0 list-none m-0 p-0 divide-y divide-white/5">
                {hoveredModule.categories.map((cat, idx) => {
                  const isCatHovered = hoveredCategory?.title === cat.title;
                  return (
                    <li
                      key={cat.title}
                      onMouseEnter={() => {
                        setHoveredCategory(cat);
                        setCategoryIndex(idx);
                      }}
                      className={cn(
                        "h-[38px] px-3 flex items-center justify-between text-[12px] font-medium text-white/90 hover:text-white hover:bg-[#07163d] cursor-pointer transition-colors group",
                        isCatHovered && "bg-[#07163d] text-white font-semibold"
                      )}
                    >
                      <span className="truncate">{cat.title}</span>
                      <ChevronRight
                        className={cn(
                          "w-3.5 h-3.5 text-white/50 group-hover:text-white transition-transform",
                          isCatHovered && "text-white translate-x-0.5"
                        )}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* LAYER 3: Deep Menu Screens (180px wide, positioned dynamically next to hovered category) */}
            {hoveredCategory && (
              <div
                id="deepMenu"
                className="w-[180px] bg-[#1542b7] text-white flex flex-col shadow-2xl h-fit max-h-[80vh] overflow-y-auto border-r border-white/10 animate-in fade-in duration-75"
                style={{
                  marginTop: `${categoryIndex * 38}px`
                }}
              >
                <ul className="py-0 list-none m-0 p-0 divide-y divide-white/5">
                  {hoveredCategory.items.map((screen) => {
                    const isCurrent = pathname === screen.href;
                    return (
                      <li key={screen.title} className="h-[38px] cursor-pointer">
                        <Link
                          href={screen.href}
                          onClick={closeAllFlyouts}
                          className={cn(
                            "w-full h-full px-3.5 flex items-center text-[12px] text-white/90 hover:text-white hover:bg-[#07163d] transition-all truncate",
                            isCurrent && "bg-[#07163d] text-white font-semibold"
                          )}
                          title={screen.title}
                        >
                          <span className="truncate">{screen.title}</span>
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
          className="fixed top-[80px] left-[90px] w-[210px] bg-card text-card-foreground border border-border shadow-2xl rounded-md z-[70] py-1.5 text-xs font-medium animate-in fade-in slide-in-from-left-2 duration-150"
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
              <div className="absolute top-0 left-full w-[170px] bg-card border border-border shadow-2xl rounded-md py-1.5 ml-1 text-xs">
                <Link
                  href="/lite"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-3.5 py-2 hover:bg-muted/70 transition-colors"
                >
                  Trakzee Lite
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/70 transition-colors font-semibold text-[#29a4ff]"
                >
                  <span>Trakzee Standard</span>
                  <Check className="w-3.5 h-3.5 text-[#29a4ff]" />
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
        <div className="fixed top-0 left-[90px] h-full w-[320px] bg-card text-card-foreground border-r border-border shadow-2xl flex flex-col z-[70] animate-in slide-in-from-left duration-200 pointer-events-auto">
          {/* Header Tabs */}
          <div className="h-[46px] flex items-stretch border-b border-border bg-muted/40">
            <button
              type="button"
              onClick={() => setActiveNotiTab("notifications")}
              className={cn(
                "flex-1 flex items-center justify-center text-xs font-semibold border-b-2 transition-colors cursor-pointer",
                activeNotiTab === "notifications"
                  ? "border-[#29a4ff] text-[#29a4ff] bg-card"
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
                  ? "border-[#29a4ff] text-[#29a4ff] bg-card"
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
              <div className="py-2.5 bg-red-50 dark:bg-red-950/30 border-b-2 border-red-500 text-red-600 dark:text-red-400 cursor-pointer">
                <div className="text-sm font-bold">0</div>
                <div className="text-[10px] uppercase font-semibold">High</div>
              </div>
              <div className="py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 cursor-pointer">
                <div className="text-sm font-bold">0</div>
                <div className="text-[10px] uppercase font-semibold">Medium</div>
              </div>
              <div className="py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 cursor-pointer">
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

      {/* 5. UNIVERSAL SCREEN SEARCH OVERLAY (Top-right clean SVG icon matching live Trakzee) */}
      <div className="fixed top-3.5 right-4 z-[50]">
        <button
          type="button"
          id="universalSelectorSearchIcon"
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-muted-foreground hover:text-foreground hover:scale-110 transition-all cursor-pointer"
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

      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150 pointer-events-auto"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-muted/20">
              <Search className="w-4 h-4 text-[#29a4ff]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search across all 86 Trakzee screens (e.g., Travel, Sensor, Fuel, Company)..."
                className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
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
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/70 rounded-md transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground group-hover:text-[#29a4ff]">
                        {s.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {s.module} {s.category ? `> ${s.category}` : ""}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#29a4ff] transition-transform group-hover:translate-x-0.5" />
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

      {/* 6. CLOUD DOWNLOAD MANAGER DIALOG */}
      {isCloudDownloadOpen && (
        <div 
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
          onClick={() => setIsCloudDownloadOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <img 
                  src="/images/smart/cloude_download_new.svg" 
                  alt="Cloud Download" 
                  className="h-5 w-auto"
                />
                <h3 className="text-sm font-semibold">Cloud Download Manager</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCloudDownloadOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Manage scheduled downloads, GPS telematics exports, and background data dumps.</p>
              <div className="p-3 bg-muted/50 rounded-lg border border-border text-[11px] space-y-1">
                <div className="font-semibold text-foreground">Active Tasks</div>
                <div>No pending background export jobs.</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCloudDownloadOpen(false)}
                className="auth-btn-secondary"
                style={{ height: "32px", fontSize: "12px", padding: "0 14px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
