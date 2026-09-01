"use client";

import * as React from "react";
import Link from "next/link";
import { Gauge, Download, Filter, Calendar, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SPEED_DATA = [
  { time: "06:00", speed: 0, ignition: false, status: "Stopped" },
  { time: "06:15", speed: 42, ignition: true, status: "Moving" },
  { time: "06:30", speed: 68, ignition: true, status: "Moving" },
  { time: "06:45", speed: 78, ignition: true, status: "Moving" },
  { time: "07:00", speed: 84, ignition: true, status: "Overspeed" },
  { time: "07:15", speed: 80, ignition: true, status: "Moving" },
  { time: "07:30", speed: 74, ignition: true, status: "Moving" },
  { time: "07:45", speed: 0, ignition: false, status: "Stopped" },
  { time: "08:00", speed: 0, ignition: true, status: "Idle" },
  { time: "08:15", speed: 56, ignition: true, status: "Moving" },
  { time: "08:30", speed: 72, ignition: true, status: "Moving" },
  { time: "08:45", speed: 82, ignition: true, status: "Overspeed" },
  { time: "09:00", speed: 65, ignition: true, status: "Moving" },
  { time: "09:15", speed: 48, ignition: true, status: "Moving" },
  { time: "09:30", speed: 0, ignition: false, status: "Stopped" },
];

export default function SpeedTimeChartPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/charts" className="hover:text-foreground">Charts</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold">Speed Vs Time</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Gauge className="w-6 h-6 text-[#29a4ff]" />
            Speed Vs Time Telemetry Analysis
          </h1>
        </div>

        <button type="button" className="auth-btn-primary flex items-center gap-1.5 px-3" style={{ height: "34px", fontSize: "12px", borderRadius: "6px" }}>
          <Download className="w-3.5 h-3.5" /> Export Chart PNG
        </button>
      </div>

      <div className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground font-medium block mb-1">Select Vehicle</label>
            <select className="w-full h-8 px-2 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground">
              <option>Truck-01 (KCD 849X)</option>
              <option>Van-04 (KBZ 192A)</option>
              <option>Trailer-12 (KDE 401M)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-medium block mb-1">Date</label>
            <select className="w-full h-8 px-2 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground">
              <option>Today (01 Sep 2026)</option>
              <option>Yesterday</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" className="w-full auth-btn-primary" style={{ height: "32px", fontSize: "12px", borderRadius: "6px" }}>
              Plot Telemetry
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Vehicle Velocity Profile (km/h over Time)</h3>
            <p className="text-[11px] text-muted-foreground">Threshold Limit: 80 km/h</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#29a4ff] rounded-sm" /> Normal Speed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Overspeed (&gt;80)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" /> Stoppage / Idle</span>
          </div>
        </div>

        <div className="h-64 bg-muted/20 border border-border rounded-xl p-5 flex items-end justify-between gap-2 relative">
          <div className="absolute left-0 right-0 top-[20%] border-b border-dashed border-rose-500/60 z-0">
            <span className="absolute right-3 -top-4 text-[10px] font-bold font-mono text-rose-500">SPEED LIMIT (80 KM/H)</span>
          </div>

          {SPEED_DATA.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 z-10 group h-full justify-end">
              <div 
                style={{ height: `${Math.max(4, (item.speed / 100) * 100)}%` }}
                className={cn(
                  "w-full rounded-t transition-all group-hover:opacity-80",
                  item.speed > 80 ? "bg-rose-500" : item.speed === 0 ? "bg-amber-400" : "bg-[#29a4ff]"
                )}
                title={`${item.time}: ${item.speed} km/h (${item.status})`}
              />
              <span className="text-[9px] font-mono text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
