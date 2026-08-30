"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Gauge,
  MapPin,
  FileText,
  PieChart,
  Settings,
  CloudUpload,
  User,
  Bell,
  ChevronRight,
  LogOut,
  KeyRound,
  Users,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export type NavItem = {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  iconClass?: string;
  children?: NavItem[];
};

// Data
const TRAKZEE_NAV: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Gauge className="w-6 h-6 mb-1.5" strokeWidth={1.25} />,
  },
  {
    title: "Tracking",
    href: "/tracking",
    icon: <MapPin className="w-6 h-6 mb-1.5" strokeWidth={1.25} />,
  },
  {
    title: "Reports",
    icon: <FileText className="w-6 h-6 mb-1.5" strokeWidth={1.25} />,
    children: [
      { 
        title: "Activity", 
        children: [
          { title: "Travel" }, 
          { title: "Travel History" },
          { title: "Trip" },
          { title: "Stoppage" },
          { title: "Idle" },
          { title: "Inactive" },
          { title: "Object Status" },
          { title: "Daywise Distance" },
          { title: "Speed vs Distance" },
          { title: "Object Location" },
          { title: "Overspeed Summary" }
        ] 
      },
      { 
        title: "Geofence-Address", 
        children: [
          { title: "Geofence" }, 
          { title: "Address" },
          { title: "Geofence Visited Summary" }
        ] 
      },
      { 
        title: "Sensor", 
        children: [
          { title: "Ignition" }, 
          { title: "Air Conditioner" },
          { title: "Analog Data" },
          { title: "RFID Data" },
          { title: "Digital Ports" },
          { title: "Air Conditioner Misused" },
          { title: "Immobilize" }
        ] 
      },
      { 
        title: "Alert", 
        children: [
          { title: "Object Alert" }, 
          { title: "Alert Status" }
        ] 
      },
      { 
        title: "Reminder", 
        children: [
          { title: "Reminder Status" }, 
          { title: "Acknowledgement History" }
        ] 
      },
      { 
        title: "Expense", 
        children: [
          { title: "Expense" }, 
          { title: "Object Cost" },
          { title: "Maintenance History" },
          { title: "Category Wise Expense" },
          { title: "Object Monthly Cost" }
        ] 
      },
      { 
        title: "Fuel", 
        children: [
          { title: "Fill-Drain" }, 
          { title: "Fuel Economy" },
          { title: "Fuel Consumption" },
          { title: "Fuel Abnormal Consumption" },
          { title: "Digital Port - Fuel Summary" },
          { title: "Work Hour Vs Fuel Mileage" },
          { title: "Fuel Dashboard" },
          { title: "Fuel Expense Summary" }
        ] 
      },
      { 
        title: "Billing", 
        children: [
          { title: "Payment Detail" }, 
          { title: "Postpaid Billing History" },
          { title: "Object Expiry Log" },
          { title: "Admin Wise Object" },
          { title: "Object Payment Detail Summary" }
        ] 
      },
      { title: "Logs", children: [{ title: "System Logs" }] },
      { 
        title: "Hardware Maintenance", 
        children: [
          { title: "Technician Task Summary" }, 
          { title: "Company Service Task" }
        ] 
      },
      { 
        title: "Document", 
        children: [
          { title: "Object Document status" }, 
          { title: "Driver Document status" }
        ] 
      },
    ],
  },
  {
    title: "Charts",
    icon: <PieChart className="w-6 h-6 mb-1.5" strokeWidth={1.25} />,
    children: [
      { 
        title: "Activity", 
        children: [
          { title: "Speed Vs Time" }, 
          { title: "Battery Voltage" }, 
          { title: "Battery Percentage" }
        ] 
      },
      { 
        title: "Alert", 
        children: [
          { title: "Alerts" }
        ] 
      },
      {
        title: "Fuel", 
        children: [
          { title: "Fuel" }, 
          { title: "Fill-Drain" }, 
          { title: "Fuel Economy" }
        ] 
      },
      { 
        title: "Expense", 
        children: [
          { title: "Cost Distribution" }, 
          { title: "Cost By Time" }
        ] 
      },
      { 
        title: "Analytics",
        children: [
          { title: "Temperature" },
          { title: "Fuel" }
        ]
      }
    ],
  },
  {
    title: "Settings",
    icon: <Settings className="w-6 h-6 mb-1.5" strokeWidth={1.25} />,
    children: [
      {
        title: "General",
        children: [
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
        children: [
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
        children: [
          { title: "Technician", href: "/settings/technician" },
          { title: "Technician Task", href: "/settings/technician/task" },
        ],
      },
      {
        title: "Billing",
        children: [
          { title: "Tariff Plan", href: "/settings/billing/tariff" },
        ],
      },
      {
        title: "Bulk Action",
        children: [
          { title: "Bulk Object Update", href: "/settings/bulk/object" },
        ],
      },
    ],
  },
];

interface TrakzeeSidebarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null; } | null;
}

export function TrakzeeSidebar({ user }: TrakzeeSidebarProps) {
  const [activeModule, setActiveModule] = React.useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'notifications' | 'announcements'>('notifications');

  // Close flyouts if cursor leaves the entire sidebar area
  const handleMouseLeave = () => {
    setActiveModule(null);
  };

  return (
    <>
    <div 
      className="fixed top-0 left-0 h-full w-[90px] bg-[#07163d] text-white flex flex-col z-[60] shadow-xl"
      onMouseLeave={handleMouseLeave}
    >
      {/* LOGO AREA */}
      <div 
        className="flex items-center justify-center border-b border-white/20"
        style={{ height: '78px', margin: '8px 6px' }}
      >
        <div className="flex items-center gap-2">
          {/* Using a text-based logo matching the screenshot, with the correct blue dot */}
          <span className="font-bold text-[16px] tracking-wider text-white">uffizio<span className="text-[#3b82f6]">.</span></span>
        </div>
      </div>

      {/* User & Notifications Area */}
      <div className="flex justify-center gap-6 py-5 relative">
        
        {/* USER PROFILE */}
        <div 
          className="cursor-pointer group/user"
        >
          <User className="w-[22px] h-[22px] text-gray-300 group-hover/user:text-white transition-colors" strokeWidth={1.25} />
          
          {/* User Flyout (White Background) */}
          <div className="absolute top-0 left-[90px] hidden group-hover/user:flex flex-col bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] border border-gray-100 w-[180px] z-[60] py-1 text-[12px] font-medium text-[#444] font-sans">
            <div className="px-4 py-2 border-b border-[#f5f5f5] truncate" title="test@example.com">
              {user?.email || "ali@technologyhubjuba.com"}
            </div>
            <Link href="/settings/security" className="px-4 py-2 border-b border-[#f5f5f5] hover:bg-gray-50 transition-colors">
              Change Password
            </Link>
            <Link href="/settings/subuser" className="px-4 py-2 border-b border-[#f5f5f5] hover:bg-gray-50 transition-colors">
              Set Subuser
            </Link>
            
            {/* Applications (Nested Flyout) */}
            <div className="relative group/apps">
              <Link href="/applications" className="px-4 py-2 border-b border-[#f5f5f5] hover:bg-gray-50 transition-colors flex items-center justify-between">
                <span>Applications</span>
                <ChevronRight className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
              </Link>
              
              {/* Nested Applications Menu */}
              <div className="absolute top-0 left-full hidden group-hover/apps:flex flex-col bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] border border-gray-100 w-[160px] text-[12px] font-medium text-[#444] py-1">
                <Link href="/lite" className="px-4 py-2 border-b border-[#f5f5f5] hover:bg-gray-50 transition-colors">
                  Trakzee Lite
                </Link>
                <Link href="/standard" className="px-4 py-2 border-b border-[#f5f5f5] hover:bg-gray-50 transition-colors font-semibold text-[#333]">
                  Trakzee Standard
                </Link>
                <Link href="/settings/default-app" className="px-4 py-2 hover:bg-gray-50 transition-colors">
                  Set default Application
                </Link>
              </div>
            </div>

            <form action="/api/auth/logout" method="POST" className="w-full">
              <button type="submit" className="w-full !font-sans !font-medium !text-left !px-4 !py-2 !bg-transparent !border-0 !text-[#444] hover:bg-gray-50 transition-colors cursor-pointer">
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* NOTIFICATIONS BELL */}
        <div className="relative cursor-pointer hover:text-white group/bell" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
          <Bell className="w-[22px] h-[22px] text-gray-300 group-hover/bell:text-white transition-colors" strokeWidth={1.25} />
          {/* Notification dot - currently hidden as in production when count is 0 */}
          <span className="hidden absolute top-[-2px] right-[-2px] w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

      </div>

      {/* Primary Navigation Modules */}
      <div className="flex-1 flex flex-col [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#999] [&::-webkit-scrollbar-thumb]:rounded-[5px]">
        {TRAKZEE_NAV.map((item, index) => (
          <div 
            key={item.title}
            className="relative h-[80px] w-[90px]"
            onMouseEnter={() => setActiveModule(item.title)}
          >
            {item.href && !item.children ? (
              <Link 
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors",
                  "hover:bg-[#234292]",
                  activeModule === item.title && "bg-[#234292]"
                )}
              >
                {item.icon ? item.icon : (item.iconClass && <span className={cn(item.iconClass, "mb-1")} />)}
                <span className="text-[11px] text-center w-full truncate px-1 mt-1 font-normal text-gray-300">{item.title}</span>
              </Link>
            ) : (
              <div 
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors",
                  "hover:bg-[#234292]",
                  activeModule === item.title && "bg-[#234292]"
                )}
              >
                {item.icon ? item.icon : (item.iconClass && <span className={cn(item.iconClass, "mb-1")} />)}
                <span className="text-[11px] text-center w-full truncate px-1 mt-1 font-normal text-gray-300">{item.title}</span>
              </div>
            )}

            {/* Level 2 Flyout Menu */}
            {item.children && activeModule === item.title && (
              <FlyoutMenu items={item.children} isRoot={true} positionUpwards={index > TRAKZEE_NAV.length / 2} />
            )}
          </div>
        ))}
      </div>

      {/* Bottom Cloud Icon */}
        <div className="flex-shrink-0 w-[90px] h-[50px] flex items-center justify-center mt-auto cursor-pointer hover:bg-[#234292] transition-colors border-t border-[#1b2b52]/50">
          <CloudUpload className="w-7 h-7 text-gray-300 hover:text-white transition-colors" strokeWidth={1} />
        </div>
    </div>

    {/* Full Height Notifications Panel */}
    {isNotificationsOpen && (
      <div className="fixed top-0 left-[90px] h-full w-[300px] bg-white border-r shadow-lg flex flex-col z-40 animate-in slide-in-from-left-8 duration-200">
        
        {/* Tabs */}
        <div className="flex text-xs h-[40px] border-b border-gray-200">
          <div 
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "flex-1 text-center flex items-center justify-center font-medium cursor-pointer transition-colors",
              activeTab === "notifications" ? "bg-white text-gray-700" : "bg-[#234292] text-white hover:bg-[#1b2b52]"
            )}
          >
            Notifications
          </div>
          <div 
            onClick={() => setActiveTab("announcements")}
            className={cn(
              "flex-1 text-center flex items-center justify-center font-medium cursor-pointer transition-colors pr-8",
              activeTab === "announcements" ? "bg-white text-gray-700" : "bg-[#234292] text-white hover:bg-[#1b2b52]"
            )}
          >
            Announcements
          </div>
          
          {/* Close Button */}
          <button 
            onClick={() => setIsNotificationsOpen(false)}
            className="absolute right-0 top-0 h-[40px] w-[40px] flex items-center justify-center bg-[#234292] text-white hover:bg-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-filters (Only show when Notifications is active) */}
        {activeTab === "notifications" && (
          <div className="flex bg-white border-b border-gray-200">
            <div className="flex-1 flex flex-col items-center justify-center py-2 border-b-2 border-red-500 bg-[#ffeaeb] cursor-pointer">
              <span className="text-red-600 font-bold text-sm">0</span>
              <span className="text-red-600 text-[10px] mt-0.5">High</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-2 bg-[#fff4e6] cursor-pointer border-b-2 border-transparent hover:border-[#e98316]/50">
              <span className="text-[#e98316] font-bold text-sm">0</span>
              <span className="text-[#e98316] text-[10px] mt-0.5">Medium</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-2 bg-[#e6f4ea] cursor-pointer border-b-2 border-transparent hover:border-green-500/50">
              <span className="text-green-600 font-bold text-sm">0</span>
              <span className="text-green-600 text-[10px] mt-0.5">Low</span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-gray-400 text-sm">
          {activeTab === "notifications" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 opacity-20 flex items-center justify-center"><Bell className="w-8 h-8" /></div>
              <span>No notifications to show.</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 opacity-20 flex items-center justify-center"><FileText className="w-8 h-8" /></div>
              <span>No announcements.</span>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}

// Recursive Flyout Menu Component
function FlyoutMenu({ items, isRoot, positionUpwards }: { items: NavItem[], isRoot?: boolean, positionUpwards?: boolean }) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  return (
    <div 
      className={cn(
        "absolute w-[200px] bg-[#1a3a91] text-white shadow-xl flex flex-col z-[100]",
        isRoot ? "left-[90px]" : "left-[200px]", // shift to right by the width of the parent menu
        positionUpwards ? "bottom-0 top-auto" : "top-0"
      )}
      style={{ minHeight: '100%' }}
    >
      {items.map((item, index) => (
        <div 
          key={item.title}
          className="relative group/menuitem"
          onMouseEnter={() => setActiveItem(item.title)}
          onMouseLeave={() => setActiveItem(null)}
        >
          {item.href ? (
            <Link 
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 text-[13px] hover:bg-[#112a73] transition-colors w-full cursor-pointer",
                activeItem === item.title && "bg-[#112a73]"
              )}
            >
              <span className="truncate">{item.title}</span>
              {item.children && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          ) : (
            <div 
              className={cn(
                "flex items-center justify-between px-4 py-3 text-[13px] hover:bg-[#112a73] transition-colors w-full cursor-pointer",
                activeItem === item.title && "bg-[#112a73]"
              )}
            >
              <span className="truncate">{item.title}</span>
              {item.children && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </div>
          )}

          {/* Recursive Level 3+ Flyout */}
          {item.children && activeItem === item.title && (
            <FlyoutMenu 
              items={item.children} 
              isRoot={false} 
              positionUpwards={index > items.length / 2} 
            />
          )}
        </div>
      ))}
    </div>
  );
}
