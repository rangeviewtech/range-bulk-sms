/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Plus, Search, Edit, Trash2, Shield, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const GEOFENCES = [
  { id: "GEO-01", name: "Mombasa Port Container Terminal", type: "Polygon", radius: "2.4 kmÂ²", speedLimit: "30 km/h", alerts: "In & Out", objectsCount: 42, status: "Active" },
  { id: "GEO-02", name: "Nairobi Industrial Area Hub", type: "Polygon", radius: "5.1 kmÂ²", speedLimit: "40 km/h", alerts: "In & Out", objectsCount: 68, status: "Active" },
  { id: "GEO-03", name: "Juba Customs Depot Yard B", type: "Circle", radius: "800 m", speedLimit: "20 km/h", alerts: "Out Only", objectsCount: 18, status: "Active" },
  { id: "GEO-04", name: "JKIA Cargo Freight Zone", type: "Polygon", radius: "3.2 kmÂ²", speedLimit: "25 km/h", alerts: "In & Out", objectsCount: 24, status: "Active" },
  { id: "GEO-05", name: "Dangerous Route Exclusion Zone", type: "Polygon", radius: "12.0 kmÂ²", speedLimit: "0 km/h (Restricted)", alerts: "Entry Alert", objectsCount: 148, status: "Restricted" },
];

export default function GeofenceManagementPage() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-[#29a4ff]" />
            Geofence & Zone Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define boundary zones, set regional speed restrictions, and configure automated geofence alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Drawing tool opened on map")}
          className="auth-btn-primary flex items-center gap-2 px-3.5"
          style={{ height: "36px", fontSize: "12px", borderRadius: "6px" }}
        >
          <Plus className="w-4 h-4" />
          <span>Create Geofence</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground">Configured Geofences ({GEOFENCES.length})</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search geofence name..."
              className="h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
                <th className="py-2.5 px-3">Zone ID</th>
                <th className="py-2.5 px-3">Geofence Name</th>
                <th className="py-2.5 px-3">Boundary Type</th>
                <th className="py-2.5 px-3">Area / Radius</th>
                <th className="py-2.5 px-3">Zone Speed Limit</th>
                <th className="py-2.5 px-3">Trigger Alerts</th>
                <th className="py-2.5 px-3">Linked Vehicles</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {GEOFENCES.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase())).map((g) => (
                <tr key={g.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">{g.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{g.name}</td>
                  <td className="py-2.5 px-3 text-foreground">{g.type}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">{g.radius}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{g.speedLimit}</td>
                  <td className="py-2.5 px-3 text-foreground">{g.alerts}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#29a4ff] font-semibold">{g.objectsCount} units</td>
                  <td className="py-2.5 px-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      g.status === "Active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    )}>
                      {g.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button type="button" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
