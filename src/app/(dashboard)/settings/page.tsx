"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Settings, 
  Building2, 
  Car, 
  Users, 
  MapPin, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  UploadCloud, 
  Wrench, 
  KeyRound,
  ChevronRight
} from "lucide-react";

const SETTINGS_CATEGORIES = [
  {
    title: "General Configuration",
    desc: "Organization metadata, company branches, and subuser access",
    items: [
      { name: "Company Profile", href: "/settings/company", icon: <Building2 className="w-4 h-4 text-[#29a4ff]" />, desc: "Business tax PIN, headquarters address, and regional units" },
      { name: "Company Subusers", href: "/settings/subuser", icon: <Users className="w-4 h-4 text-emerald-500" />, desc: "Delegate sub-account permissions and fleet access scopes" },
      { name: "Branch Management", href: "/settings/branch", icon: <MapPin className="w-4 h-4 text-purple-500" />, desc: "Configure branch depots, regional hubs, and loading bays" },
    ]
  },
  {
    title: "Fleet Hardware & Master Data",
    desc: "GPS devices, telemetry sensors, drivers, and geofences",
    items: [
      { name: "Object / Vehicle Management", href: "/settings/object", icon: <Car className="w-4 h-4 text-amber-500" />, desc: "Register GPS devices, IMEI hardware, and vehicle metadata" },
      { name: "Driver Directory & RFID", href: "/settings/driver", icon: <Users className="w-4 h-4 text-sky-500" />, desc: "Driver licenses, contact numbers, and RFID tag IDs" },
      { name: "Geofence Zones", href: "/settings/master/geofence", icon: <MapPin className="w-4 h-4 text-rose-500" />, desc: "Define circular and polygon operational boundaries" },
      { name: "Send Device Commands", href: "/settings/master/command", icon: <KeyRound className="w-4 h-4 text-indigo-500" />, desc: "GPRS relay engine cut, interval polling, and SOS triggers" },
    ]
  },
  {
    title: "Technician & Maintenance",
    desc: "Service schedules, task tracking, and technician dispatch",
    items: [
      { name: "Technician Roster", href: "/settings/technician", icon: <Wrench className="w-4 h-4 text-teal-500" />, desc: "Certified maintenance personnel and field technicians" },
      { name: "Service & Maintenance Rules", href: "/settings/reminder", icon: <Bell className="w-4 h-4 text-amber-500" />, desc: "Odometer-based oil changes, tire replacement alerts" },
      { name: "Bulk Hardware Update", href: "/settings/bulk/object", icon: <UploadCloud className="w-4 h-4 text-[#29a4ff]" />, desc: "Import and update fleet devices via CSV templates" },
    ]
  }
];

export default function SettingsHubPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#29a4ff]" />
          System Settings & Master Configuration Hub
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure telemetry gateways, fleet objects, driver security, and system preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SETTINGS_CATEGORIES.map((cat) => (
          <div key={cat.title} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-sm font-semibold text-foreground">{cat.title}</h3>
                <p className="text-[11px] text-muted-foreground">{cat.desc}</p>
              </div>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block p-3 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-[#29a4ff]">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 ml-6">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
