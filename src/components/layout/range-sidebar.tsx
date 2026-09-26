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
  ArrowRight,
  Menu,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { NavWalletBadge } from "@/components/navigation/nav-wallet-badge";
import { computeFlyoutPosition } from "@/lib/flyout-position";

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
          { title: "Draft Messages", href: "/sms/drafts" },
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
          { title: "Variables", href: "/sms/variables" },
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
          { title: "Segments", href: "/contacts/segments" },
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
        title: "Overview",
        items: [
          { title: "Billing & Invoices", href: "/billing" },
        ],
      },
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
          { title: "Rates & Pricing Bands", href: "/wallet/pricing" },
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
      {
        title: "Gateways",
        items: [
          { title: "Android Gateways", href: "/gateways" },
          { title: "Pair New Gateway", href: "/gateways/add" },
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
          { title: "Comm Providers", href: "/admin/communications/providers" },
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
          { title: "My Profile", href: "/profile" },
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
          { title: "System Alerts", href: "/notifications" },
        ],
      },
    ],
  },
];


const ITEM_HEIGHT = 38; // standard 38px height per menu row
const SUBMENU_HEADER_HEIGHT = 31; // 31px measured height of submenu category title bar

export const SCREEN_KEYWORDS: Record<string, string[]> = {
  "/dashboard": ["home", "overview", "analytics", "stats", "summary", "activity", "metrics"],
  "/sms/send": ["quick send", "compose", "bulk sms", "broadcast", "text message", "blast", "dispatch", "single sms"],
  "/sms/drafts": ["drafts", "saved messages", "unsent", "wip", "pending drafts"],
  "/sms/scheduled": ["scheduled", "calendar", "future send", "delayed", "timed", "queue", "cron"],
  "/sms/custom": ["custom sms", "dynamic fields", "merge tags", "personalized", "csv blast", "placeholders", "names"],
  "/sms/campaigns": ["campaigns", "marketing", "sms blast", "broadcast history", "outbox", "bulk history"],
  "/sms/campaigns/new": ["new campaign", "create campaign", "launch blast", "marketing blast", "campaign wizard"],
  "/sms/templates": ["templates", "canned messages", "snippets", "reusable texts", "presets", "boilerplate"],
  "/sms/variables": ["variables", "custom variables", "placeholders", "tokens", "merge tags", "dynamic attributes"],
  "/sms/delivery-reports": ["dlr", "delivery reports", "delivery status", "receipts", "sent logs", "failed messages", "pending"],
  "/contacts": ["all contacts", "address book", "phonebook", "subscribers", "customers", "directory", "audience", "people"],
  "/contacts/groups": ["contact groups", "lists", "directories", "contact lists", "segments list"],
  "/contacts/segments": ["segments", "dynamic audience", "filters", "rules", "cohorts", "targeted"],
  "/contacts/tags": ["tags", "labels", "markers", "badges", "classification"],
  "/contacts/import": ["import contacts", "upload csv", "excel import", "xlsx", "bulk upload", "vcf", "vcard"],
  "/sender-ids": ["sender ids", "headers", "sender names", "alphanumeric", "originator", "from id", "caller id", "masking"],
  "/sender-ids/apply": ["apply sender id", "request header", "register sender id", "brand name", "kyc", "approval"],
  "/billing": ["billing", "invoices", "receipts", "billing overview", "statements", "subscription", "account balance"],
  "/wallet": ["wallet dashboard", "credits", "balance", "top up", "deposit", "recharge", "funds", "airtime"],
  "/wallet/transactions": ["transactions", "payment history", "ledger", "statement", "charges", "receipts", "refunds", "invoices"],
  "/wallet/pricing": ["sms pricing", "rates", "cost per sms", "tariffs", "destinations", "fees", "countries", "bundle"],
  "/gateways": ["gateways", "android gateways", "android phone", "sim card", "mobile gateway", "gsm", "relay device"],
  "/gateways/add": ["pair gateway", "connect android", "scan qr", "add phone", "pair device", "new gateway"],
  "/developer/api-keys": ["api keys", "secret token", "bearer token", "api credentials", "authorization token"],
  "/developer/api-usage": ["api usage", "rate limit", "rpm", "requests count", "api metrics", "traffic", "quota"],
  "/developer/webhooks": ["webhooks", "callbacks", "dlr webhooks", "incoming events", "http post", "listener"],
  "/api/docs": ["documentation", "api docs", "swagger", "openapi", "postman", "endpoints", "curl", "integration guide"],
  "/agent/dashboard": ["agent dashboard", "reseller", "partner portal", "sales overview", "agent home"],
  "/agent/clients": ["agent clients", "my clients", "referred users", "customer list", "sub clients"],
  "/agent/commissions": ["commissions", "referral fee", "agent commission", "earnings breakdown", "payouts"],
  "/agent/earnings": ["earnings", "revenue share", "commission wallet", "agent balance", "withdrawals"],
  "/reports/sms": ["sms reports", "sms stats", "volume", "delivery rate", "hourly traffic", "message trends"],
  "/reports/campaigns": ["campaign reports", "campaign analytics", "open rates", "roi", "clickthrough", "conversion"],
  "/reports/financial": ["financial reports", "spending analytics", "revenue", "costs", "margin", "expenses"],
  "/reports/usage": ["usage reports", "traffic analytics", "metrics", "consumption", "breakdown"],
  "/admin/users": ["users management", "all users", "team", "staff", "permissions", "user roles"],
  "/admin/clients": ["clients management", "customer accounts", "tenants", "sub-accounts", "client list"],
  "/admin/agents": ["agents management", "resellers", "partners", "agent applications", "affiliate approval"],
  "/admin/providers": ["sms providers", "smpp gateways", "telco routes", "twilio", "infobip", "aggregators"],
  "/admin/communications/providers": ["comm providers", "communication gateways", "smpp connections", "provider routes"],
  "/admin/pricing": ["pricing config", "markup", "margin tiers", "wholesale rates", "retail pricing"],
  "/admin/sender-ids": ["sender id approvals", "pending sender ids", "header approvals", "kyc verification"],
  "/admin/commissions": ["commission management", "reseller tiers", "agent percentage", "payout rates"],
  "/admin/audit-logs": ["audit logs", "security logs", "activity history", "compliance", "who changed what"],
  "/admin/system": ["system monitor", "health check", "server status", "cpu", "memory", "redis", "database"],
  "/admin/communications/queue": ["job queue", "bullmq", "redis queue", "worker status", "delayed jobs", "failed queue"],
  "/admin/communications/logs": ["comm logs", "communication logs", "smpp logs", "raw packets", "transmission logs"],
  "/settings": ["settings hub", "preferences", "system configuration", "general settings"],
  "/profile": ["my profile", "avatar", "user profile", "name", "bio", "my account", "personal details"],
  "/settings/account": ["account settings", "email", "organization", "company name", "user info"],
  "/settings/security": ["security", "password change", "2fa", "two-factor", "otp", "sessions", "login activity"],
  "/settings/notifications": ["notification preferences", "email alerts", "sms alerts", "sound notifications"],
  "/settings/sms": ["sms preferences", "default sender", "opt out", "stop keyword", "encoding", "unicode", "flash sms"],
  "/support": ["support tickets", "ticket", "tickets", "help", "helpdesk", "contact support", "open ticket", "assistance", "bug report", "faq"],
  "/notifications": ["system alerts", "announcements", "notifications list", "recent alerts", "broadcasts"],
};

export interface SearchableScreen {
  module: string;
  category?: string;
  title: string;
  href: string;
  keywords: string[];
}

interface RangeSidebarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string } | null;
}

export function RangeSidebar({ user }: RangeSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Flyout State
  const [hoveredModule, setHoveredModule] = React.useState<NavModule | null>(null);
  const [hoveredCategory, setHoveredCategory] = React.useState<NavCategory | null>(null);
  const [flyoutPosition, setFlyoutPosition] = React.useState<{ top: number; left: number; maxHeight: number }>({
    top: 0,
    left: 90,
    maxHeight: 800,
  });
  const [deepMenuTop, setDeepMenuTop] = React.useState<number>(0);

  // Refs for measured bounds, scrolling, and flicker prevention
  const sidebarRef = React.useRef<HTMLElement | null>(null);
  const subMenuRef = React.useRef<HTMLDivElement | null>(null);
  const deepMenuRef = React.useRef<HTMLDivElement | null>(null);
  const treeModuleRef = React.useRef<HTMLDivElement | null>(null);
  const flyoutContainerRef = React.useRef<HTMLDivElement | null>(null);
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const cancelCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeAllFlyouts = React.useCallback(() => {
    cancelCloseTimer();
    setHoveredModule(null);
    setHoveredCategory(null);
  }, [cancelCloseTimer]);

  const scheduleClose = React.useCallback((delay = 180) => {
    cancelCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      closeAllFlyouts();
    }, delay);
  }, [cancelCloseTimer, closeAllFlyouts]);

  // Drawers & Dialogs
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [expandedMobileModule, setExpandedMobileModule] = React.useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isAppsMenuOpen, setIsAppsMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [activeNotiTab, setActiveNotiTab] = React.useState<"notifications" | "announcements">("notifications");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Close mobile drawer and flyouts on route navigation
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileOpen(false);
    setExpandedMobileModule(null);
    setHoveredModule(null);
    setHoveredCategory(null);
  }

  const userRole = user?.role || "CLIENT";
  
  const allowedNavigation = React.useMemo(() => {
    return RANGE_NAVIGATION.filter(mod => !mod.roles || mod.roles.includes(userRole));
  }, [userRole]);

  // Shared positioning function using measured element bounds with instant cropping & zero lag
  const updateFlyoutPosition = React.useCallback(() => {
    if (!hoveredModule || typeof window === "undefined") return;

    const parentEl = document.querySelector(`[data-module="${hoveredModule.title}"]`) as HTMLElement | null;
    const sidebarEl = sidebarRef.current;
    const treeEl = treeModuleRef.current;
    if (!parentEl || !sidebarEl) return;

    const parentRect = parentEl.getBoundingClientRect();
    const sidebarRect = sidebarEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // 1. Instant crop check: If module item has scrolled out of treeModuleRef's visible bounds
    if (treeEl) {
      const treeRect = treeEl.getBoundingClientRect();
      const isOutAbove = parentRect.bottom <= treeRect.top + 4;
      const isOutBelow = parentRect.top >= treeRect.bottom - 4;
      if (isOutAbove || isOutBelow) {
        if (flyoutContainerRef.current) {
          flyoutContainerRef.current.style.display = "none";
        }
        return;
      } else if (flyoutContainerRef.current) {
        flyoutContainerRef.current.style.display = "block";
      }
    }

    const currentNav = allowedNavigation;
    const isLastItem =
      currentNav.length > 0 &&
      currentNav[currentNav.length - 1].title === hoveredModule.title;

    const subMenuEl = subMenuRef.current;
    const measuredSubMenuHeight = subMenuEl
      ? (subMenuEl.offsetHeight || subMenuEl.getBoundingClientRect().height)
      : (hoveredModule.categories?.length || 0) * ITEM_HEIGHT + SUBMENU_HEADER_HEIGHT;

    const pos = computeFlyoutPosition({
      parentRect,
      sidebarRect,
      submenuHeight: measuredSubMenuHeight,
      isLastItem,
      viewportHeight,
    });

    // Synchronously update DOM styles for 0ms lag during compositor scrolling
    if (flyoutContainerRef.current) {
      flyoutContainerRef.current.style.top = `${pos.top}px`;
      flyoutContainerRef.current.style.left = `${pos.left}px`;
    }
    if (subMenuEl) {
      subMenuEl.style.maxHeight = `${pos.maxHeight}px`;
    }

    // 2. Layer 3 (#deepMenu) alignment & instant crop
    const currentCategory = hoveredCategory;
    if (deepMenuRef.current && subMenuEl && currentCategory) {
      const safeCatSelector = typeof CSS !== "undefined" && CSS.escape 
        ? `[data-category="${CSS.escape(currentCategory.title)}"]`
        : `[data-category]`;
      const catEl = subMenuEl.querySelector(safeCatSelector) as HTMLElement | null;
      if (catEl) {
        const catRect = catEl.getBoundingClientRect();
        const subMenuRect = subMenuEl.getBoundingClientRect();

        // Instant crop: Is the category item scrolled out of subMenu's visible bounds?
        const isCatOutAbove = catRect.bottom <= subMenuRect.top + 2;
        const isCatOutBelow = catRect.top >= subMenuRect.bottom - 2;

        if (isCatOutAbove || isCatOutBelow) {
          deepMenuRef.current.style.display = "none";
        } else {
          deepMenuRef.current.style.display = "flex";
          const catRelativeTop = catRect.top - pos.top;
          const deepMenuEl = deepMenuRef.current;
          const deepMenuHeight = deepMenuEl.offsetHeight || (currentCategory.items.length * ITEM_HEIGHT);
          const maxBottom = viewportHeight - 8;
          const deepMenuBottom = catRect.top + deepMenuHeight;

          let targetTop = catRelativeTop;
          if (deepMenuBottom > maxBottom) {
            const shift = deepMenuBottom - maxBottom;
            targetTop = Math.max(0, catRelativeTop - shift);
          }

          deepMenuEl.style.top = `${Math.round(targetTop)}px`;
          deepMenuEl.style.maxHeight = `${Math.round(viewportHeight - 16)}px`;
        }
      }
    }

    setFlyoutPosition({
      top: pos.top,
      left: pos.left,
      maxHeight: pos.maxHeight,
    });
  }, [hoveredModule, hoveredCategory, allowedNavigation]);

  // Recalculate positioning with continuous requestAnimationFrame loop and high-priority native listeners
  React.useEffect(() => {
    if (!hoveredModule) return;

    let animationFrameId: number;
    let isRunning = true;

    const frameLoop = () => {
      if (!isRunning) return;
      updateFlyoutPosition();
      animationFrameId = requestAnimationFrame(frameLoop);
    };

    // Immediate first execution + continuous animation loop
    updateFlyoutPosition();
    animationFrameId = requestAnimationFrame(frameLoop);

    const handleSync = () => {
      updateFlyoutPosition();
    };

    window.addEventListener("resize", handleSync, { passive: true });
    window.addEventListener("scroll", handleSync, { passive: true, capture: true });
    window.addEventListener("wheel", handleSync, { passive: true, capture: true });

    const treeEl = treeModuleRef.current;
    const subEl = subMenuRef.current;

    if (treeEl) {
      treeEl.addEventListener("scroll", handleSync, { passive: true });
      treeEl.addEventListener("wheel", handleSync, { passive: true });
    }
    if (subEl) {
      subEl.addEventListener("scroll", handleSync, { passive: true });
      subEl.addEventListener("wheel", handleSync, { passive: true });
    }

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateFlyoutPosition();
      });
      if (subMenuRef.current) observer.observe(subMenuRef.current);
      if (deepMenuRef.current) observer.observe(deepMenuRef.current);
    }

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleSync);
      window.removeEventListener("scroll", handleSync, { capture: true });
      window.removeEventListener("wheel", handleSync, { capture: true });
      if (treeEl) {
        treeEl.removeEventListener("scroll", handleSync);
        treeEl.removeEventListener("wheel", handleSync);
      }
      if (subEl) {
        subEl.removeEventListener("scroll", handleSync);
        subEl.removeEventListener("wheel", handleSync);
      }
      if (observer) observer.disconnect();
    };
  }, [hoveredModule, hoveredCategory, updateFlyoutPosition]);

  // Flat list of all searchable screens with rich keyword indexing
  const allSearchableScreens = React.useMemo<SearchableScreen[]>(() => {
    const screens: SearchableScreen[] = [];
    allowedNavigation.forEach((mod) => {
      if (mod.href) {
        screens.push({
          module: mod.title,
          title: mod.title,
          href: mod.href,
          keywords: SCREEN_KEYWORDS[mod.href] || [],
        });
      }
      if (mod.categories) {
        mod.categories.forEach((cat) => {
          cat.items.forEach((item) => {
            screens.push({
              module: mod.title,
              category: cat.title,
              title: item.title,
              href: item.href,
              keywords: SCREEN_KEYWORDS[item.href] || [],
            });
          });
        });
      }
    });
    return screens;
  }, [allowedNavigation]);

  const filteredScreens = React.useMemo(() => {
    if (!searchQuery.trim()) return allSearchableScreens.slice(0, 18);
    const q = searchQuery.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);

    interface ScoredScreen {
      screen: SearchableScreen;
      score: number;
    }

    const scored: ScoredScreen[] = [];

    for (const s of allSearchableScreens) {
      const titleLower = s.title.toLowerCase();
      const catLower = (s.category || "").toLowerCase();
      const modLower = s.module.toLowerCase();
      const hrefLower = s.href.toLowerCase();
      const kwString = s.keywords.join(" ").toLowerCase();

      let score = 0;

      // 1. Exact or prefix matches
      if (titleLower === q) score += 100;
      else if (titleLower.startsWith(q)) score += 80;
      else if (titleLower.includes(q)) score += 60;

      // 2. Keyword exact or partial matches
      for (const kw of s.keywords) {
        if (kw === q) {
          score += 55;
          break;
        } else if (kw.startsWith(q)) {
          score += 40;
          break;
        } else if (kw.includes(q)) {
          score += 25;
          break;
        }
      }

      // 3. Category / Module / Route URL match
      if (catLower.includes(q)) score += 35;
      if (modLower.includes(q)) score += 30;
      if (hrefLower.includes(q)) score += 25;

      // 4. Multi-token coverage: if multiple words typed, check each token
      if (tokens.length > 1) {
        const fullCorpus = `${titleLower} ${catLower} ${modLower} ${hrefLower} ${kwString}`;
        const allTokensMatch = tokens.every((t) => fullCorpus.includes(t));
        if (allTokensMatch) {
          score += 45;
        }
      }

      if (score > 0) {
        scored.push({ screen: s, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((item) => item.screen).slice(0, 25);
  }, [searchQuery, allSearchableScreens]);

  // Global shortcut (Ctrl+K / Cmd+K) and Escape key listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }
      if (e.key === "Escape") {
        if (isMobileOpen) {
          setIsMobileOpen(false);
          return;
        }
        if (hoveredModule) {
          e.preventDefault();
          closeAllFlyouts();
          return;
        }
        if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
          return;
        }
        if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
          return;
        }
        if (isSearchOpen) {
          setIsSearchOpen(false);
          return;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, hoveredModule, isUserMenuOpen, isNotificationsOpen, isSearchOpen, closeAllFlyouts]);

  return (
    <>
      {/* MOBILE DRAWER BACKDROP */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[55] md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* UNIFIED CONTAINER FOR SIDEBAR + FLYOUTS TO MAINTAIN MOUSE INTERACTION */}
      <div 
        id="tree-outer-wrapper" 
        className={cn(
          "fixed top-0 left-0 h-full z-[60] pointer-events-none flex transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        onMouseLeave={() => scheduleClose(180)}
      >
        {/* 1. PRIMARY SIDEBAR (w-[280px] on mobile, w-[90px] on desktop, #07163d) */}
        <aside
          id="left-tree"
          ref={sidebarRef}
          onMouseEnter={() => {
            if (typeof window !== "undefined" && window.innerWidth >= 768) {
              cancelCloseTimer();
            }
          }}
          className="h-full w-[280px] sm:w-[300px] md:w-[90px] bg-[#07163d] text-white flex flex-col pointer-events-auto select-none shadow-[4px_0_24px_rgba(0,0,0,0.4)] shrink-0 border-r border-white/5 overflow-hidden"
        >
          {/* MOBILE DRAWER HEADER */}
          <div className="flex items-center justify-between p-3.5 border-b border-white/10 md:hidden bg-black/20">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/brand/range-icon-transparent.svg"
                alt="Range Bulk SMS Platform"
                className="w-8 h-8 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white leading-tight">Range SMS</span>
                <span className="text-[10px] text-[#FBCA07] font-medium">Enterprise Platform</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MOBILE DRAWER WALLET CARD */}
          <div className="p-3 border-b border-white/10 md:hidden bg-white/5">
            <NavWalletBadge variant="drawer" onNavigate={() => setIsMobileOpen(false)} />
          </div>

          {/* DESKTOP LOGO CONTAINER (78px x 78px circular badge matching live site) */}
          <div id="tree-logo" className="hidden md:flex items-center justify-center p-2 pt-2.5">
            <Link
              href="/dashboard"
              className="w-[78px] h-[78px] rounded-2xl bg-transparent hover:bg-white/5 border border-transparent flex flex-col items-center justify-center range-logo-badge group overflow-hidden transition-all duration-300"
              title="Range SMS - Enterprise Bulk SMS"
            >
              <img
                src="/images/brand/range-icon-transparent.svg"
                alt="Range Bulk SMS Platform"
                className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </Link>
          </div>

          {/* USER & NOTIFICATIONS BAR (compact 44px height for sleek spacing) */}
          <div id="tree-user" className="flex items-center justify-center h-[44px] border-b border-white/10 relative">
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
              <User className="w-[20px] h-[20px] transition-transform duration-200 group-hover:scale-110" strokeWidth={1.3} />
            </button>

            {/* Divider */}
            <div className="w-[1px] h-[18px] bg-white/10" />

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
              <Bell className="w-[20px] h-[20px] transition-transform duration-200 group-hover:scale-110" strokeWidth={1.3} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-[#FBCA07] rounded-full animate-ping opacity-75 ring-2 ring-[#07163d]" />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-[#FBCA07] rounded-full ring-2 ring-[#07163d]" />
            </button>
          </div>

          {/* PRIMARY MODULES LIST */}
          <div
            id="tree-module"
            ref={treeModuleRef}
            onScroll={updateFlyoutPosition}
            className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden sidebar-scrollbar pb-8"
          >
            {allowedNavigation.map((mod, modIdx) => {
              const isHovered = hoveredModule?.title === mod.title;
              const isActive = mod.href 
                ? (pathname === mod.href || pathname.startsWith(`${mod.href}/`))
                : pathname.startsWith(`/${mod.title.toLowerCase()}`);
              const isLast = modIdx === allowedNavigation.length - 1;
              const isExpanded = expandedMobileModule === mod.title;

              return (
                <div key={mod.title} className="w-full">
                  {mod.href && !mod.categories ? (
                    <>
                      {/* Desktop Module */}
                      <div
                        data-module={mod.title}
                        id={`nav-module-${mod.title.toLowerCase().replace(/\s+/g, '-')}`}
                        className="hidden md:flex w-full aspect-square shrink-0 relative flex-col items-center justify-center cursor-pointer group"
                        onMouseEnter={() => {
                          if (typeof window !== "undefined" && window.innerWidth < 768) return;
                          cancelCloseTimer();
                          setHoveredModule(mod);
                          setHoveredCategory(null);
                        }}
                      >
                        <Link
                          href={mod.href}
                          onClick={closeAllFlyouts}
                          className={cn(
                            "w-full h-full flex flex-col items-center justify-center text-white/75 hover:text-white range-module-btn relative group transition-colors duration-150",
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
                      </div>

                      {/* Mobile Module */}
                      <Link
                        href={mod.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex md:hidden items-center justify-between px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 border-l-3 transition-colors",
                          isActive ? "bg-[#04648C] text-white font-semibold border-[#FBCA07]" : "border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 text-white/90">
                            {mod.icon}
                          </div>
                          <span>{mod.title}</span>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Desktop Module */}
                      <div
                        data-module={mod.title}
                        id={`nav-module-${mod.title.toLowerCase().replace(/\s+/g, '-')}`}
                        className="hidden md:flex w-full aspect-square shrink-0 relative flex-col items-center justify-center cursor-pointer group"
                        onMouseEnter={(e) => {
                          if (typeof window !== "undefined" && window.innerWidth < 768) return;
                          cancelCloseTimer();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const sidebarRect = sidebarRef.current?.getBoundingClientRect() || {
                            top: 0,
                            bottom: window.innerHeight,
                            left: 0,
                            right: 90,
                            width: 90,
                          };
                          const initialSubMenuHeight = (mod.categories?.length || 0) * ITEM_HEIGHT + SUBMENU_HEADER_HEIGHT;
                          const pos = computeFlyoutPosition({
                            parentRect: rect,
                            sidebarRect,
                            submenuHeight: initialSubMenuHeight,
                            isLastItem: isLast,
                            viewportHeight: window.innerHeight,
                          });

                          setFlyoutPosition({
                            top: pos.top,
                            left: pos.left,
                            maxHeight: pos.maxHeight,
                          });
                          setHoveredModule(mod);
                          setHoveredCategory(null);
                        }}
                      >
                        {mod.href ? (
                          <Link
                            href={mod.href}
                            onClick={closeAllFlyouts}
                            className={cn(
                              "w-full h-full flex flex-col items-center justify-center text-white/75 hover:text-white range-module-btn relative group",
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
                              "w-full h-full flex flex-col items-center justify-center text-white/75 hover:text-white range-module-btn relative group",
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

                      {/* Mobile Accordion Module */}
                      <div className="block md:hidden border-b border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedMobileModule((prev) => (prev === mod.title ? null : mod.title));
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 border-l-3 transition-colors text-left cursor-pointer",
                            isActive || isExpanded ? "bg-[#04648C]/40 text-white font-medium border-[#FBCA07]" : "border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 text-white/90">
                              {mod.icon}
                            </div>
                            <span className="font-medium text-[13px]">{mod.title}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-white/50 transition-transform duration-200",
                              isExpanded && "rotate-180 text-[#FBCA07]"
                            )}
                          />
                        </button>

                        {/* Mobile Accordion Submenu */}
                        {isExpanded && mod.categories && (
                          <div className="bg-black/25 border-t border-white/10 py-1 px-3 space-y-3">
                            {mod.categories.map((cat) => (
                              <div key={cat.title} className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FBCA07] px-2 pt-1.5">
                                  {cat.title}
                                </div>
                                <ul className="space-y-0.5 list-none m-0 p-0">
                                  {cat.items.map((screen) => {
                                    const isCurrent = pathname === screen.href;
                                    return (
                                      <li key={screen.title}>
                                        <Link
                                          href={screen.href}
                                          onClick={() => {
                                            setIsMobileOpen(false);
                                          }}
                                          className={cn(
                                            "block px-2.5 py-1.5 text-xs rounded-md transition-colors",
                                            isCurrent
                                              ? "bg-[#04648C] text-white font-semibold"
                                              : "text-white/80 hover:text-white hover:bg-white/10"
                                          )}
                                        >
                                          {screen.title}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

        </aside>

        {/* 2. MULTI-LEVEL FLYOUT MENU (Layer 2 #subMenu + Layer 3 #deepMenu - Desktop only) */}
        {hoveredModule && hoveredModule.categories && (
          <div
            id="flyout-container"
            ref={flyoutContainerRef}
            onMouseEnter={cancelCloseTimer}
            onMouseLeave={() => scheduleClose(180)}
            className="hidden md:block absolute select-none pointer-events-auto"
            style={{ 
              top: `${flyoutPosition.top}px`,
              left: `${flyoutPosition.left}px`,
            }}
          >
            {/* LAYER 2: Submenu Categories (170px wide, Range teal #04648C) */}
            <div
              id="subMenu"
              ref={subMenuRef}
              className="w-[170px] bg-[#04648C] text-white flex flex-col border-r border-white/10 overflow-y-auto sidebar-scrollbar animate-flyout-sub shadow-[4px_6px_16px_rgba(0,0,0,0.3)] z-10 shrink-0"
              style={{
                maxHeight: `${flyoutPosition.maxHeight}px`,
              }}
            >
              {/* Module title header */}
              <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-white/50 border-b border-white/10 bg-[#04648C]/80">
                {hoveredModule.title}
              </div>
              <ul className="py-0 list-none m-0 p-0 divide-y divide-white/5" role="menu">
                {hoveredModule.categories.map((cat) => {
                  const isCatHovered = hoveredCategory?.title === cat.title;
                  return (
                    <li
                      key={cat.title}
                      data-category={cat.title}
                      role="menuitem"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "ArrowRight") {
                          setHoveredCategory(cat);
                        }
                      }}
                      onMouseEnter={(e) => {
                        cancelCloseTimer();
                        const catRect = e.currentTarget.getBoundingClientRect();
                        const flyoutTop = flyoutContainerRef.current?.getBoundingClientRect().top ?? flyoutPosition.top;
                        const catRelativeTop = catRect.top - flyoutTop;
                        const deepHeight = (cat.items?.length || 0) * ITEM_HEIGHT;
                        const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
                        const maxBottom = viewportHeight - 8;
                        const deepBottom = catRect.top + deepHeight;
                        let targetTop = catRelativeTop;
                        if (deepBottom > maxBottom) {
                          targetTop = Math.max(0, catRelativeTop - (deepBottom - maxBottom));
                        }
                        setDeepMenuTop(Math.round(targetTop));
                        setHoveredCategory(cat);
                      }}
                      className={cn(
                        "h-[38px] px-3 flex items-center justify-between text-[12px] font-medium text-white/90 hover:text-white range-menu-item cursor-pointer transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBCA07] focus-visible:ring-inset",
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

            {/* LAYER 3: Deep Menu Screens (180px wide, Range teal #04648C) */}
            {hoveredCategory && (
              <div
                id="deepMenu"
                ref={deepMenuRef}
                key={hoveredCategory.title}
                className="w-[180px] bg-[#04648C] text-white flex flex-col overflow-y-auto sidebar-scrollbar border-r border-white/10 animate-flyout-deep shadow-[4px_6px_18px_rgba(0,0,0,0.35)] shrink-0 z-20 absolute left-[170px] h-max"
                style={{
                  top: `${deepMenuTop}px`,
                  maxHeight: `${flyoutPosition.maxHeight}px`,
                }}
              >
                <ul className="py-0 list-none m-0 p-0 divide-y divide-white/5" role="menu">
                  {hoveredCategory.items.map((screen) => {
                    const isCurrent = pathname === screen.href;
                    return (
                      <li key={screen.title} role="menuitem" className="h-[38px] cursor-pointer group">
                        <Link
                          href={screen.href}
                          onClick={closeAllFlyouts}
                          className={cn(
                            "w-full h-full px-3.5 flex items-center text-[12px] text-white/90 hover:text-white range-menu-item transition-all duration-150 truncate border-l-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBCA07] focus-visible:ring-inset",
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
          className="fixed top-14 left-3 md:top-[80px] md:left-[90px] w-[calc(100%-24px)] max-w-[240px] md:w-[210px] bg-card text-card-foreground border border-border shadow-[0_12px_36px_rgba(0,0,0,0.25)] rounded-md z-[70] py-1.5 text-xs font-medium animate-in fade-in slide-in-from-left-2 duration-200"
          onMouseLeave={() => {
            if (typeof window !== "undefined" && window.innerWidth >= 768) {
              setIsUserMenuOpen(false);
              setIsAppsMenuOpen(false);
            }
          }}
        >
          {/* User Email Banner */}
          <div className="px-3.5 py-2 border-b border-border text-[11px] font-semibold text-muted-foreground truncate bg-muted/30">
            {user?.email || "ali@technologyhubjuba.com"}
          </div>

          {/* Quick Wallet Row */}
          <Link
            href="/wallet"
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/70 transition-colors border-b border-border text-foreground"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Billing &amp; Wallet</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Manage &rarr;
            </span>
          </Link>

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
                  className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/70 transition-colors font-semibold text-[#04648C] dark:text-[#38bdf8]"
                >
                  <span>Range SMS App</span>
                  <Check className="w-3.5 h-3.5 text-[#04648C] dark:text-[#38bdf8]" />
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
        <div className="fixed top-0 left-0 md:left-[90px] h-full w-full sm:w-[320px] bg-card text-card-foreground border-r border-border shadow-[0_16px_48px_rgba(0,0,0,0.3)] flex flex-col z-[70] animate-in slide-in-from-left duration-250 pointer-events-auto">
          {/* Header Tabs */}
          <div className="h-[46px] flex items-stretch border-b border-border bg-muted/40">
            <button
              type="button"
              onClick={() => setActiveNotiTab("notifications")}
              className={cn(
                "flex-1 flex items-center justify-center text-xs font-semibold border-b-2 transition-colors cursor-pointer",
                activeNotiTab === "notifications"
                  ? "border-[#04648C] text-[#04648C] dark:border-[#38bdf8] dark:text-[#38bdf8] bg-card"
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
                  ? "border-[#04648C] text-[#04648C] dark:border-[#38bdf8] dark:text-[#38bdf8] bg-card"
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

      {/* 5. FIXED TOP NAVIGATION BAR (Fixed in position, responsive left offset) */}
      {pathname !== "/tracking" && (
        <header
          id="top-navigation-bar"
          className="fixed top-0 left-0 md:left-[90px] right-0 h-14 bg-background/80 backdrop-blur-md border-b border-border/40 z-40 flex items-center justify-between px-2.5 sm:px-6 select-none transition-[left] duration-300"
        >
          {/* Mobile Hamburger & Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:hidden shrink-0">
            <button
              type="button"
              id="mobile-nav-toggle"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-foreground hover:bg-accent/60 transition-colors cursor-pointer active:scale-95 shrink-0"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <img
                src="/images/brand/range-icon-transparent.svg"
                alt="Range Bulk SMS Platform"
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="font-bold text-sm tracking-tight text-foreground hidden min-[400px]:inline">Range SMS</span>
            </Link>
          </div>

          <div className="hidden md:block" />

          {/* Right Action Icons: Wallet Badge, Search & Theme Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <NavWalletBadge />

            <button
              type="button"
              id="universalSelectorSearchIcon"
              onClick={() => setIsSearchOpen(true)}
              className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
              title="Search Screens (Ctrl+K)"
              aria-label="Search Screens"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <ThemeToggle />
          </div>
        </header>
      )}

      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/70 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200 pointer-events-auto"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-card border border-border rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-muted/20">
              <Search className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
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
                      <div className="text-xs font-semibold text-foreground group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors">
                        {s.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {s.module} {s.category ? `> ${s.category}` : ""}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-transform group-hover:translate-x-1" />
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
