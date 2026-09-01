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
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const TRAVEL_DATA = [
  { vehicle: "Truck-01 (KCD 849X)", driver: "John Kiprono", start: "2026-09-01 06:15", startLoc: "Mombasa Port Gate 4", end: "2026-09-01 11:45", endLoc: "Voi Junction Depot", distance: 154.2, duration: "05h 30m", stopTime: "00h 42m", maxSpeed: 84, avgSpeed: 52, fuelUsed: 38.5 },
  { vehicle: "Van-04 (KBZ 192A)", driver: "Ahmed Ali", start: "2026-09-01 07:00", startLoc: "Nairobi Central Warehouse", end: "2026-09-01 12:10", endLoc: "Thika Industrial Depot", distance: 62.4, duration: "03h 15m", stopTime: "01h 55m", maxSpeed: 68, avgSpeed: 38, fuelUsed: 12.1 },
  { vehicle: "Trailer-12 (KDE 401M)", driver: "Peter Omondi", start: "2026-09-01 05:30", startLoc: "Nimule Border Customs", end: "2026-09-01 12:30", endLoc: "Juba Bridge Terminal", distance: 192.8, duration: "07h 00m", stopTime: "01h 10m", maxSpeed: 76, avgSpeed: 44, fuelUsed: 54.0 },
  { vehicle: "Pickup-08 (KCA 551P)", driver: "David Mwangi", start: "2026-09-01 08:20", startLoc: "Wilson Airport Hangar", end: "2026-09-01 11:50", endLoc: "JKIA Freight Terminal", distance: 48.6, duration: "02h 10m", stopTime: "01h 20m", maxSpeed: 72, avgSpeed: 42, fuelUsed: 8.4 },
  { vehicle: "Bus-02 (KBQ 672C)", driver: "Hassan Omar", start: "2026-09-01 06:00", startLoc: "Nairobi Bus Station", end: "2026-09-01 12:00", endLoc: "Nakuru Express Stop", distance: 160.0, duration: "04h 45m", stopTime: "01h 15m", maxSpeed: 80, avgSpeed: 58, fuelUsed: 42.0 },
];

export default function TravelSummaryReportPage() {
  const [dateRange, setDateRange] = React.useState("today");
  const [searchFilter, setSearchFilter] = React.useState("");

  const totalDistance = TRAVEL_DATA.reduce((acc, row) => acc + row.distance, 0);
  const totalFuel = TRAVEL_DATA.reduce((acc, row) => acc + row.fuelUsed, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/reports" className="hover:text-foreground">Reports</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold">Travel Summary</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#29a4ff]" />
            Vehicle Travel Summary Report
          </h1>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="auth-btn-secondary flex items-center gap-1.5 px-3"
            style={{ height: "34px", fontSize: "12px", borderRadius: "6px" }}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            type="button"
            className="auth-btn-primary flex items-center gap-1.5 px-3"
            style={{ height: "34px", fontSize: "12px", borderRadius: "6px" }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters Card */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#29a4ff]" /> Report Parameters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground font-medium block mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full h-8 px-2 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground"
            >
              <option value="today">Today (01 Sep 2026)</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-medium block mb-1">Fleet / Vehicle</label>
            <select className="w-full h-8 px-2 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground">
              <option>All Active Vehicles (148)</option>
              <option>Heavy Cargo Fleet</option>
              <option>Delivery Vans</option>
              <option>Passenger Buses</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-medium block mb-1">Min Stoppage Filter</label>
            <select className="w-full h-8 px-2 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground">
              <option>&gt; 5 minutes</option>
              <option>&gt; 15 minutes</option>
              <option>&gt; 30 minutes</option>
              <option>All Stoppages</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full auth-btn-primary"
              style={{ height: "32px", fontSize: "12px", borderRadius: "6px" }}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-card border border-border shadow-sm">
          <div className="text-[11px] text-muted-foreground">Total Travel Distance</div>
          <div className="text-xl font-bold font-mono text-foreground mt-0.5">{totalDistance.toFixed(1)} km</div>
        </div>
        <div className="p-3.5 rounded-lg bg-card border border-border shadow-sm">
          <div className="text-[11px] text-muted-foreground">Total Fuel Estimated</div>
          <div className="text-xl font-bold font-mono text-[#29a4ff] mt-0.5">{totalFuel.toFixed(1)} Liters</div>
        </div>
        <div className="p-3.5 rounded-lg bg-card border border-border shadow-sm">
          <div className="text-[11px] text-muted-foreground">Vehicles Traveled</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{TRAVEL_DATA.length} Units</div>
        </div>
        <div className="p-3.5 rounded-lg bg-card border border-border shadow-sm">
          <div className="text-[11px] text-muted-foreground">Max Fleet Speed</div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">84 km/h</div>
        </div>
      </div>

      {/* Travel Summary Datatable */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground">Travel Records ({TRAVEL_DATA.length})</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search record..."
              className="h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Start Time & Location</th>
                <th className="py-2.5 px-3">End Time & Location</th>
                <th className="py-2.5 px-3 text-right">Distance</th>
                <th className="py-2.5 px-3 text-right">Travel Time</th>
                <th className="py-2.5 px-3 text-right">Stop Time</th>
                <th className="py-2.5 px-3 text-right">Max Speed</th>
                <th className="py-2.5 px-3 text-right">Fuel Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {TRAVEL_DATA.filter(r => !searchFilter || r.vehicle.toLowerCase().includes(searchFilter.toLowerCase()) || r.driver.toLowerCase().includes(searchFilter.toLowerCase())).map((row) => (
                <tr key={row.vehicle} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground">{row.vehicle}</td>
                  <td className="py-2.5 px-3 text-foreground">{row.driver}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-mono text-[11px]">{row.start}</div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">{row.startLoc}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-mono text-[11px]">{row.end}</div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">{row.endLoc}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">{row.distance} km</td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{row.duration}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{row.stopTime}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400">{row.maxSpeed} km/h</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#29a4ff] font-semibold">{row.fuelUsed} L</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30 font-bold text-foreground text-xs">
                <td colSpan={4} className="py-2.5 px-3">Total Summary ({TRAVEL_DATA.length} Trips)</td>
                <td className="py-2.5 px-3 text-right font-mono">{totalDistance.toFixed(1)} km</td>
                <td colSpan={3} className="py-2.5 px-3"></td>
                <td className="py-2.5 px-3 text-right font-mono text-[#29a4ff]">{totalFuel.toFixed(1)} L</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
