"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Download, Printer, Filter, MapPin, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STOPPAGE_DATA = [
  { vehicle: "Truck-01 (KCD 849X)", driver: "John Kiprono", stopTime: "2026-09-01 07:14", resumeTime: "2026-09-01 07:48", duration: "00h 34m", location: "TotalEnergies Service Station, Mtito Andei", lat: -2.689, lng: 38.167, ignition: "OFF", fuelLevel: "82%" },
  { vehicle: "Van-04 (KBZ 192A)", driver: "Ahmed Ali", stopTime: "2026-09-01 08:30", resumeTime: "2026-09-01 09:45", duration: "01h 15m", location: "Sameer Industrial Park Gate 3", lat: -1.328, lng: 36.872, ignition: "OFF", fuelLevel: "46%" },
  { vehicle: "Trailer-12 (KDE 401M)", driver: "Peter Omondi", stopTime: "2026-09-01 06:10", resumeTime: "2026-09-01 07:20", duration: "01h 10m", location: "Nimule Border Inspection Bay 2", lat: 3.597, lng: 32.062, ignition: "OFF", fuelLevel: "88%" },
  { vehicle: "Pickup-08 (KCA 551P)", driver: "David Mwangi", stopTime: "2026-09-01 09:15", resumeTime: "2026-09-01 10:05", duration: "00h 50m", location: "JKIA Cargo Village Parking A", lat: -1.332, lng: 36.931, ignition: "OFF", fuelLevel: "60%" },
  { vehicle: "Bus-02 (KBQ 672C)", driver: "Hassan Omar", stopTime: "2026-09-01 08:50", resumeTime: "2026-09-01 09:12", duration: "00h 22m", location: "Naivasha Highway Travelers Rest", lat: -0.717, lng: 36.431, ignition: "OFF", fuelLevel: "70%" },
];

export default function StoppageReportPage() {
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
            <span className="text-foreground font-semibold">Stoppage Report</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-rose-500" />
            Vehicle Stoppage & Parking Report
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

      <div className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#29a4ff]" /> Filter Parameters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground font-medium block mb-1">Date</label>
            <select className="w-full h-8 px-2 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground">
              <option>Today (01 Sep 2026)</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-medium block mb-1">Vehicle</label>
            <select className="w-full h-8 px-2 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground">
              <option>All Vehicles</option>
              <option>Truck-01</option>
              <option>Van-04</option>
              <option>Trailer-12</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-medium block mb-1">Min Duration</label>
            <select className="w-full h-8 px-2 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground">
              <option>&gt; 10 mins</option>
              <option>&gt; 30 mins</option>
              <option>&gt; 1 hour</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" className="w-full auth-btn-primary" style={{ height: "32px", fontSize: "12px", borderRadius: "6px" }}>
              Filter Stoppages
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground">Stoppage Records ({STOPPAGE_DATA.length})</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search location, vehicle..." className="h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Stop Time</th>
                <th className="py-2.5 px-3">Resume Time</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
                <th className="py-2.5 px-3">Stoppage Location</th>
                <th className="py-2.5 px-3">Ignition</th>
                <th className="py-2.5 px-3 text-right">Fuel Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {STOPPAGE_DATA.filter(r => !search || r.vehicle.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase())).map((row, i) => (
                <tr key={i} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground">{row.vehicle}</td>
                  <td className="py-2.5 px-3 text-foreground">{row.driver}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{row.stopTime}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{row.resumeTime}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">{row.duration}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#29a4ff] shrink-0" />
                      <span className="truncate max-w-xs">{row.location}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                      {row.ignition}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">{row.fuelLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
