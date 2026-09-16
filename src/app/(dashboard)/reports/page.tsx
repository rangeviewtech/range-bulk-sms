/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, ChevronRight, Activity, MapPin, Gauge, Bell, Clock, Fuel, CreditCard, Shield, FileCheck } from "lucide-react";

const REPORT_SECTIONS = [
  {
    title: "Activity Reports",
    icon: <Activity className="w-5 h-5 text-emerald-500" />,
    items: [
      { name: "Travel Summary", href: "/reports/activity/travel", desc: "Comprehensive trip distance, driving time, and speed records" },
      { name: "Travel History", href: "/reports/activity/travel-history", desc: "Granular historical route and GPS track logs" },
      { name: "Trip Report", href: "/reports/activity/trip", desc: "Trip starts, destinations, and duration breakdown" },
      { name: "Stoppage & Idle", href: "/reports/activity/stoppage", desc: "Detailed vehicle stoppage locations and idle durations" },
    ]
  },
  {
    title: "Sensor & Telematics",
    icon: <Gauge className="w-5 h-5 text-[#29a4ff]" />,
    items: [
      { name: "Ignition Status", href: "/reports/sensor/ignition", desc: "Engine ON/OFF events with timestamps and locations" },
      { name: "Air Conditioner Misuse", href: "/reports/sensor/ac-misused", desc: "AC usage during vehicle stoppage audit" },
      { name: "Digital & Analog Ports", href: "/reports/sensor/digital-ports", desc: "Door sensors, temperature probes, and panic logs" },
    ]
  },
  {
    title: "Fuel & Expense Reports",
    icon: <Fuel className="w-5 h-5 text-amber-500" />,
    items: [
      { name: "Fuel Fill & Drain", href: "/reports/fuel/fill-drain", desc: "Automated fuel refueling and siphoning drain logs" },
      { name: "Fuel Economy", href: "/reports/fuel/economy", desc: "Kilometers per liter mileage calculations" },
      { name: "Expense Summary", href: "/reports/expense/summary", desc: "Maintenance, toll, driver allowance, and fleet operational costs" },
    ]
  },
];

export default function ReportsIndexPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-[#29a4ff]" />
          Fleet Telematics Reports Center
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Select an automated report module to analyze GPS tracking, sensor telemetry, and fuel records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REPORT_SECTIONS.map((sec) => (
          <div key={sec.title} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                {sec.icon}
                <h3 className="text-sm font-semibold text-foreground">{sec.title}</h3>
              </div>
              <div className="space-y-2">
                {sec.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block p-2.5 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border transition-all group"
                  >
                    <div className="text-xs font-semibold text-foreground group-hover:text-[#29a4ff] flex items-center justify-between">
                      <span>{item.name}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</div>
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
