"use client";

import * as React from "react";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  Clock, 
  Gauge, 
  MapPin, 
  Fuel, 
  ChevronRight,
  Search,
  RotateCw,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

const TRAVEL_DATA = [
  { vehicle: "UA 347AP (Truck)", driver: "John Kiprono", start: "2026-09-01 06:15", startLoc: "Customs Depot Gate 4", end: "2026-09-01 11:45", endLoc: "Nimule Border Yard", distance: 154.2, duration: "05h 30m", stopTime: "00h 42m", maxSpeed: 84, avgSpeed: 52, fuelUsed: 38.5 },
  { vehicle: "UA 497EP (Truck)", driver: "Ahmed Ali", start: "2026-09-01 07:00", startLoc: "Juba Central Warehouse", end: "2026-09-01 12:10", endLoc: "Gudele Industrial Depot", distance: 62.4, duration: "03h 15m", stopTime: "01h 55m", maxSpeed: 68, avgSpeed: 38, fuelUsed: 12.1 },
  { vehicle: "UBM 755K (Truck)", driver: "Peter Omondi", start: "2026-09-01 05:30", startLoc: "Nimule Border Customs", end: "2026-09-01 12:30", endLoc: "Juba Bridge Terminal", distance: 192.8, duration: "07h 00m", stopTime: "01h 10m", maxSpeed: 76, avgSpeed: 44, fuelUsed: 54.0 },
  { vehicle: "UBP 004L (Truck)", driver: "David Mwangi", start: "2026-09-01 08:20", startLoc: "Juba Airport Hangar", end: "2026-09-01 11:50", endLoc: "Munuki Freight Terminal", distance: 48.6, duration: "02h 10m", stopTime: "01h 20m", maxSpeed: 72, avgSpeed: 42, fuelUsed: 8.4 },
  { vehicle: "UBH 168K (Sinotruck)", driver: "Samuel Kimani", start: "2026-09-01 06:00", startLoc: "Service Yard Gate 2", end: "2026-09-01 12:00", endLoc: "Yei Highway Depot", distance: 160.0, duration: "04h 45m", stopTime: "01h 15m", maxSpeed: 80, avgSpeed: 58, fuelUsed: 42.0 },
];

export default function TravelSummaryReportPage() {
  const [dateRange, setDateRange] = React.useState("today");
  const [searchFilter, setSearchFilter] = React.useState("");

  const totalDistance = TRAVEL_DATA.reduce((acc, row) => acc + row.distance, 0);
  const totalFuel = TRAVEL_DATA.reduce((acc, row) => acc + row.fuelUsed, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f1f3f7] dark:bg-background text-foreground select-none relative overflow-x-hidden font-sans">
      
      {/* 1. TOP BLUE BANNER (Exact #1542b7, 40px height matching Dashboard & Tracking) */}
      <div className="h-[40px] bg-[#1542b7] text-white flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#29a4ff]" />
          <h1 className="text-[14px] font-semibold tracking-wide">Travel Report</h1>
          <span className="text-[11px] text-white/70 ml-2 hidden sm:inline">
            Vehicle daily travel duration, distance & route summaries
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => window.print()} className="p-1 hover:text-[#29a4ff] transition-colors" title="Print Report">
            <Printer className="w-[16px] h-[16px]" />
          </button>
          <button type="button" className="p-1 hover:text-[#29a4ff] transition-colors" title="Export Excel">
            <Download className="w-[16px] h-[16px]" />
          </button>
          <button type="button" className="p-1 hover:text-[#29a4ff] transition-colors" title="Refresh">
            <RotateCw className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>

      {/* 2. SUB-HEADER TOOLBAR STRIP */}
      <div className="h-[38px] bg-white dark:bg-card border-b border-border flex items-center justify-between px-4 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)] z-10 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Reports</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-muted-foreground">Activity</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="font-semibold text-foreground">Travel Summary</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">
            Total Distance: <strong className="text-foreground">{totalDistance.toFixed(1)} km</strong> &bull; Total Fuel: <strong className="text-foreground">{totalFuel.toFixed(1)} L</strong>
          </span>
        </div>
      </div>

      {/* 3. MAIN CONTENT BODY */}
      <div className="flex-1 p-3 space-y-3">
        
        {/* Filter Parameters Bar */}
        <div className="bg-white dark:bg-card p-3 rounded border border-border shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="font-semibold text-foreground">Date :</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-8 px-2 border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]"
              >
                <option value="today">Today (01 Sep 2026)</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="font-semibold text-foreground">Object :</label>
              <select className="h-8 px-2 border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]">
                <option>All Vehicles (10)</option>
                <option>Mega Milk [6]</option>
                <option>Weldone Logistics [3]</option>
                <option>walen [1]</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search report rows..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-8 pl-8 pr-3 border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]"
              />
            </div>
            <button
              type="button"
              className="h-8 px-4 rounded bg-[#1542b7] hover:bg-[#1542b7]/90 text-white font-medium shadow-sm transition-colors cursor-pointer"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-card rounded border border-border shadow-sm overflow-hidden">
          <div className="h-[36px] bg-slate-50/70 dark:bg-muted/30 px-3 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
            <span>Travel Logs ({TRAVEL_DATA.length} records)</span>
            <span className="text-[11px] text-muted-foreground font-normal">Auto-updated via GPS telematics</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-100/50 dark:bg-muted/20 text-muted-foreground font-semibold">
                  <th className="p-2.5 pl-3">Vehicle</th>
                  <th className="p-2.5">Driver</th>
                  <th className="p-2.5">Start Time & Location</th>
                  <th className="p-2.5">End Time & Location</th>
                  <th className="p-2.5 text-right">Distance</th>
                  <th className="p-2.5 text-right">Duration</th>
                  <th className="p-2.5 text-right">Max Speed</th>
                  <th className="p-2.5 text-right">Avg Speed</th>
                  <th className="p-2.5 text-right pr-3">Fuel Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {TRAVEL_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-[#1542b7] dark:text-[#29a4ff]">{row.vehicle}</td>
                    <td className="p-2.5 text-foreground">{row.driver}</td>
                    <td className="p-2.5">
                      <div className="font-medium text-foreground">{row.start}</div>
                      <div className="text-[10px] text-muted-foreground">{row.startLoc}</div>
                    </td>
                    <td className="p-2.5">
                      <div className="font-medium text-foreground">{row.end}</div>
                      <div className="text-[10px] text-muted-foreground">{row.endLoc}</div>
                    </td>
                    <td className="p-2.5 text-right font-bold text-foreground">{row.distance} km</td>
                    <td className="p-2.5 text-right text-foreground">{row.duration}</td>
                    <td className="p-2.5 text-right text-rose-600 font-medium">{row.maxSpeed} km/h</td>
                    <td className="p-2.5 text-right text-foreground">{row.avgSpeed} km/h</td>
                    <td className="p-2.5 text-right pr-3 font-semibold text-amber-600">{row.fuelUsed} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
