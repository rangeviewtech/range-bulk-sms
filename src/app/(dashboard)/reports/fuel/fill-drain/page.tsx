"use client";

import * as React from "react";
import Link from "next/link";
import { Fuel, Download, Printer, Filter, MapPin, Search, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FUEL_EVENTS = [
  { id: "FE-108", vehicle: "Trailer-12 (KDE 401M)", driver: "Peter Omondi", type: "Fill", time: "2026-09-01 05:45", startLevel: "28 L (14%)", endLevel: "180 L (90%)", volume: "+152.0 L", location: "Shell Nimule Border Highway", lat: 3.595, lng: 32.060 },
  { id: "FE-107", vehicle: "Truck-01 (KCD 849X)", driver: "John Kiprono", type: "Fill", time: "2026-09-01 06:20", startLevel: "45 L (22%)", endLevel: "160 L (80%)", volume: "+115.0 L", location: "TotalEnergies Port Reitz Depot", lat: -4.043, lng: 39.638 },
  { id: "FE-106", vehicle: "Truck-05 (KCT 819Y)", driver: "Samuel Kimani", type: "Drain", time: "2026-09-01 02:15", startLevel: "140 L (70%)", endLevel: "98 L (49%)", volume: "-42.0 L", location: "Service Center Unapproved Parking Bay", lat: -1.250, lng: 36.800 },
  { id: "FE-105", vehicle: "Bus-02 (KBQ 672C)", driver: "Hassan Omar", type: "Fill", time: "2026-09-01 05:50", startLevel: "30 L (20%)", endLevel: "120 L (80%)", volume: "+90.0 L", location: "Rubis Nairobi Central Station", lat: -1.288, lng: 36.828 },
];

export default function FuelFillDrainPage() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/reports" className="hover:text-foreground">Reports</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold">Fuel Fill & Drain</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Fuel className="w-6 h-6 text-amber-500" />
            Fuel Refuel & Drain Telematics Report
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => window.print()} className="auth-btn-secondary flex items-center gap-1.5 px-3" style={{ height: "34px", fontSize: "12px", borderRadius: "6px" }}>
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button type="button" className="auth-btn-primary flex items-center gap-1.5 px-3" style={{ height: "34px", fontSize: "12px", borderRadius: "6px" }}>
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Total Refueled Today</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">+357.0 L</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">3 Refuel events detected</div>
          </div>
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Total Drain / Theft Detected</div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">-42.0 L</div>
            <div className="text-[10px] text-rose-600 mt-0.5">1 Suspicious rapid drain alert</div>
          </div>
          <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Active Fuel CAN Probes</div>
            <div className="text-2xl font-bold font-mono text-[#29a4ff] mt-1">94 Units</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Ultrasonic & Capacitive sensors</div>
          </div>
          <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-950/50 text-[#29a4ff]">
            <Fuel className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground">Fuel Sensor Event Log ({FUEL_EVENTS.length})</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search event, vehicle..." className="h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Start Level</th>
                <th className="py-2.5 px-3">End Level</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {FUEL_EVENTS.filter(r => !search || r.vehicle.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase())).map((row) => (
                <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">{row.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{row.vehicle}</td>
                  <td className="py-2.5 px-3 text-foreground">{row.driver}</td>
                  <td className="py-2.5 px-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      row.type === "Fill" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    )}>
                      {row.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">{row.time}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{row.startLevel}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{row.endLevel}</td>
                  <td className={cn("py-2.5 px-3 text-right font-mono font-bold", row.type === "Fill" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                    {row.volume}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground truncate max-w-xs">{row.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
