"use client";

import * as React from "react";
import Link from "next/link";
import { PieChart, TrendingUp, Gauge, Battery, Fuel, DollarSign, ChevronRight } from "lucide-react";

export default function ChartsIndexPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <PieChart className="w-6 h-6 text-[#29a4ff]" />
          Visual Analytics & Telemetry Charts
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Interactive telemetry graphs, speed profiles, and fuel sensor diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speed vs Time Graphic Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#29a4ff]" />
              <h3 className="text-sm font-semibold text-foreground">Speed Vs Time Profile</h3>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase">Telemetry Graph</span>
          </div>
          <div className="h-44 rounded-lg bg-muted/30 border border-border p-4 flex items-end justify-between gap-1">
            {[42, 65, 78, 84, 80, 72, 0, 0, 54, 68, 82, 75, 60, 45, 0, 70, 78, 82].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div 
                  style={{ height: `${(v / 90) * 100}%` }} 
                  className={v > 80 ? "w-full bg-rose-500 rounded-t" : v === 0 ? "w-full bg-amber-400 h-1 rounded" : "w-full bg-[#29a4ff] rounded-t"}
                  title={`${v} km/h`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-muted-foreground">Speed limit: 80 km/h</span>
            <Link href="/charts/activity/speed-time" className="text-[#29a4ff] font-semibold hover:underline flex items-center gap-1">
              Detailed Chart <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Battery & Fuel Telemetry Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-foreground">Fuel Consumption vs Distance</h3>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase">Sensor Graph</span>
          </div>
          <div className="h-44 rounded-lg bg-muted/30 border border-border p-4 flex items-end justify-between gap-1">
            {[90, 88, 85, 82, 80, 78, 76, 75, 72, 70, 68, 65, 62, 60, 58, 55, 52, 48].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div 
                  style={{ height: `${(v / 100) * 100}%` }} 
                  className="w-full bg-emerald-500 rounded-t"
                  title={`${v}% Fuel`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-muted-foreground">Linear drain without anomalies</span>
            <Link href="/charts/fuel" className="text-[#29a4ff] font-semibold hover:underline flex items-center gap-1">
              Detailed Fuel Chart <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
