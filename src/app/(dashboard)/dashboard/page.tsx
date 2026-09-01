"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Gauge, 
  MapPin, 
  AlertTriangle, 
  Fuel, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  ShieldCheck, 
  Radio, 
  Plus, 
  Send, 
  Download, 
  FileText, 
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Fleet Data
const FLEET_KPIS = [
  { label: "Total Fleet", value: "148", subtext: "Active telemetry devices", color: "text-foreground", bg: "bg-card" },
  { label: "Moving", value: "84", subtext: "56.7% of total fleet", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-950/20" },
  { label: "Stopped", value: "32", subtext: "21.6% stationary", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50/50 dark:bg-rose-950/20" },
  { label: "Idle (Engine ON)", value: "18", subtext: "12.2% idling", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/50 dark:bg-amber-950/20" },
  { label: "Inactive / Offline", value: "14", subtext: "9.5% no GPS signal", color: "text-muted-foreground", bg: "bg-muted/40" },
];

const RECENT_ALERTS = [
  { id: "ALT-9041", vehicle: "Truck-01 (KCD 849X)", driver: "John Kiprono", event: "Overspeed: 94 km/h in 80 km/h zone", type: "High", time: "2 mins ago", status: "Unread" },
  { id: "ALT-9040", vehicle: "Van-04 (KBZ 192A)", driver: "Ahmed Ali", event: "Geofence Exit: Port Reitz Terminal", type: "Medium", time: "14 mins ago", status: "Acknowledged" },
  { id: "ALT-9039", vehicle: "Trailer-12 (KDE 401M)", driver: "Peter Omondi", event: "Fuel Drain Detected: -42 Liters", type: "High", time: "28 mins ago", status: "Investigating" },
  { id: "ALT-9038", vehicle: "Pickup-08 (KCA 551P)", driver: "David Mwangi", event: "Main Power Disconnected (Tamper Alert)", type: "High", time: "45 mins ago", status: "Unread" },
  { id: "ALT-9037", vehicle: "Truck-05 (KCT 819Y)", driver: "Samuel Kimani", event: "Harsh Acceleration & Cornering", type: "Low", time: "1 hr ago", status: "Resolved" },
  { id: "ALT-9036", vehicle: "Bus-02 (KBQ 672C)", driver: "Hassan Omar", event: "SOS Panic Button Pressed", type: "High", time: "2 hrs ago", status: "Resolved" },
];

const RECENT_OBJECTS = [
  { name: "Truck-01 (KCD 849X)", model: "Scania R500", driver: "John Kiprono", speed: "78 km/h", status: "Moving", fuel: "74%", loc: "Mombasa - Nairobi Hwy, KM 142", lastUpdate: "10s ago" },
  { name: "Van-04 (KBZ 192A)", model: "Toyota HiAce", driver: "Ahmed Ali", speed: "0 km/h", status: "Stopped", fuel: "48%", loc: "Industrial Area, Warehouse 4", lastUpdate: "1m ago" },
  { name: "Trailer-12 (KDE 401M)", model: "Mercedes Actros", driver: "Peter Omondi", speed: "0 km/h (Ignition ON)", status: "Idle", fuel: "88%", loc: "Juba Customs Depot Yard B", lastUpdate: "35s ago" },
  { name: "Pickup-08 (KCA 551P)", model: "Isuzu D-Max", driver: "David Mwangi", speed: "54 km/h", status: "Moving", fuel: "62%", loc: "Airport North Road", lastUpdate: "15s ago" },
  { name: "Truck-05 (KCT 819Y)", model: "Volvo FH16", driver: "Samuel Kimani", speed: "0 km/h", status: "Inactive", fuel: "90%", loc: "Service Center Gate 2", lastUpdate: "4 hrs ago" },
];

export default function DashboardPage() {
  const [filterQuery, setFilterQuery] = React.useState("");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Gauge className="w-6 h-6 text-[#29a4ff]" />
            Fleet Telematics Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time GPS tracking overview, fleet telemetry health, and live event monitoring.
          </p>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex items-center gap-2">
          <Link
            href="/tracking"
            className="auth-btn-primary flex items-center gap-2 px-3.5"
            style={{ height: "36px", fontSize: "12px", borderRadius: "6px" }}
          >
            <MapPin className="w-4 h-4" />
            <span>Live Tracking Map</span>
          </Link>
          <Link
            href="/reports/activity/travel"
            className="auth-btn-secondary flex items-center gap-1.5 px-3"
            style={{ height: "36px", fontSize: "12px", borderRadius: "6px" }}
          >
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {FLEET_KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className={cn(
              "p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between transition-all hover:shadow-md",
              kpi.bg
            )}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </div>
            <div className={cn("text-3xl font-extrabold my-1", kpi.color)}>
              {kpi.value}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {kpi.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Section: Fleet Utilization & Fuel Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Status Donut & Telemetry KPIs */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#29a4ff]" />
              <h3 className="text-sm font-semibold text-foreground">Fleet Telemetry & Utilization Today</h3>
            </div>
            <span className="text-[11px] text-muted-foreground">Live Telemetry Stream</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border">
              <div className="text-xs text-muted-foreground">Total Distance Traveled</div>
              <div className="text-2xl font-bold text-foreground mt-1">14,892 km</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +12.4% vs yesterday
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border">
              <div className="text-xs text-muted-foreground">Total Fuel Consumed</div>
              <div className="text-2xl font-bold text-foreground mt-1">3,420 L</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Avg: 4.35 km/L</div>
            </div>
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border">
              <div className="text-xs text-muted-foreground">Engine Operating Hours</div>
              <div className="text-2xl font-bold text-foreground mt-1">612 hrs</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">82% active duty</div>
            </div>
          </div>

          {/* Live Fleet Ratio Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fleet Movement Split</span>
              <span>148 Total Active Units</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
              <div style={{ width: "56.7%" }} className="bg-emerald-500" title="Moving (56.7%)" />
              <div style={{ width: "21.6%" }} className="bg-rose-500" title="Stopped (21.6%)" />
              <div style={{ width: "12.2%" }} className="bg-amber-500" title="Idle (12.2%)" />
              <div style={{ width: "9.5%" }} className="bg-gray-400" title="Offline (9.5%)" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Moving (84)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Stopped (32)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Idle (18)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" /> Offline (14)</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & System Health */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-foreground">GPS Gateway Health</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Teltonika Protocol Gateway</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online (Port 5027)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Concox / GT06 Gateway</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online (Port 5023)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Queclink Gateway</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online (Port 5005)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reverse Geocoder API</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Operational (14ms)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-2">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Quick Management</div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/settings/object"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-muted/60 hover:bg-muted text-xs font-medium text-foreground transition-colors border border-border"
              >
                <Plus className="w-3.5 h-3.5 text-[#29a4ff]" /> Add Vehicle
              </Link>
              <Link
                href="/settings/driver"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-muted/60 hover:bg-muted text-xs font-medium text-foreground transition-colors border border-border"
              >
                <Plus className="w-3.5 h-3.5 text-[#29a4ff]" /> Add Driver
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Live Fleet Objects Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#29a4ff]" />
              Live Fleet Objects Telematics
            </h3>
            <p className="text-[11px] text-muted-foreground">Real-time coordinates, speed, and sensor telematics stream</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter vehicles or drivers..."
                className="h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-md outline-none focus:border-[#29a4ff] text-foreground"
              />
            </div>
            <Link
              href="/tracking"
              className="text-xs text-[#29a4ff] hover:underline font-semibold flex items-center gap-1"
            >
              View on Map <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
                <th className="py-2.5 px-3">Vehicle & Model</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Speed</th>
                <th className="py-2.5 px-3">Fuel Level</th>
                <th className="py-2.5 px-3">Current Location</th>
                <th className="py-2.5 px-3 text-right">Last Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {RECENT_OBJECTS.filter(o => !filterQuery || o.name.toLowerCase().includes(filterQuery.toLowerCase()) || o.driver.toLowerCase().includes(filterQuery.toLowerCase())).map((obj) => (
                <tr key={obj.name} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground">
                    <div>{obj.name}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">{obj.model}</div>
                  </td>
                  <td className="py-2.5 px-3 text-foreground">{obj.driver}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1",
                        obj.status === "Moving" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                        obj.status === "Stopped" && "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
                        obj.status === "Idle" && "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
                        obj.status === "Inactive" && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        obj.status === "Moving" && "bg-emerald-500",
                        obj.status === "Stopped" && "bg-rose-500",
                        obj.status === "Idle" && "bg-amber-500",
                        obj.status === "Inactive" && "bg-gray-400"
                      )} />
                      {obj.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">{obj.speed}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div style={{ width: obj.fuel }} className="h-full bg-[#29a4ff]" />
                      </div>
                      <span className="font-mono text-[11px]">{obj.fuel}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground max-w-xs truncate" title={obj.loc}>
                    {obj.loc}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[11px] text-muted-foreground">
                    {obj.lastUpdate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Recent Telematics Alerts & Security Events</h3>
          </div>
          <Link href="/reports/alert/object" className="text-xs text-[#29a4ff] hover:underline font-semibold">
            All Alerts ({RECENT_ALERTS.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Event Trigger</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {RECENT_ALERTS.map((alt) => (
                <tr key={alt.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">{alt.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{alt.vehicle}</td>
                  <td className="py-2.5 px-3 text-foreground">{alt.driver}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{alt.event}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        alt.type === "High" && "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
                        alt.type === "Medium" && "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
                        alt.type === "Low" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      )}
                    >
                      {alt.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">{alt.time}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[11px] font-medium text-foreground">{alt.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
