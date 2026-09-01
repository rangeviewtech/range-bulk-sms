"use client";

import * as React from "react";
import Link from "next/link";
import { 
  MapPin, 
  Search, 
  Filter, 
  Layers, 
  Maximize2, 
  Navigation, 
  Gauge, 
  Battery, 
  Radio, 
  Fuel, 
  Calendar, 
  Play, 
  ShieldAlert, 
  Power, 
  ChevronRight, 
  ChevronLeft,
  X,
  Compass,
  CheckCircle2,
  Clock,
  Car
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Fleet Vehicles for Live Tracking
const TRACKING_OBJECTS = [
  { id: "VEH-101", name: "Truck-01 (KCD 849X)", driver: "John Kiprono", type: "Heavy Truck", status: "Moving", speed: 78, heading: 45, fuel: 74, battery: "24.2 V", ignition: true, odo: 142850, lat: -1.286389, lng: 36.817223, address: "Mombasa - Nairobi Hwy, KM 142", lastUpdate: "5s ago", imei: "864910283019482" },
  { id: "VEH-102", name: "Van-04 (KBZ 192A)", driver: "Ahmed Ali", type: "Delivery Van", status: "Stopped", speed: 0, heading: 0, fuel: 48, battery: "12.6 V", ignition: false, odo: 58320, lat: -1.300000, lng: 36.850000, address: "Industrial Area, Warehouse 4", lastUpdate: "1m ago", imei: "864910283019483" },
  { id: "VEH-103", name: "Trailer-12 (KDE 401M)", driver: "Peter Omondi", type: "Prime Mover", status: "Idle", speed: 0, heading: 180, fuel: 88, battery: "24.6 V", ignition: true, odo: 310450, lat: 4.859363, lng: 31.571251, address: "Juba Customs Depot Yard B", lastUpdate: "12s ago", imei: "864910283019484" },
  { id: "VEH-104", name: "Pickup-08 (KCA 551P)", driver: "David Mwangi", type: "Utility Pickup", status: "Moving", speed: 54, heading: 270, fuel: 62, battery: "13.4 V", ignition: true, odo: 89400, lat: -1.319167, lng: 36.927500, address: "Airport North Road", lastUpdate: "8s ago", imei: "864910283019485" },
  { id: "VEH-105", name: "Truck-05 (KCT 819Y)", driver: "Samuel Kimani", type: "Heavy Truck", status: "Inactive", speed: 0, heading: 0, fuel: 90, battery: "11.8 V", ignition: false, odo: 215600, lat: -1.250000, lng: 36.800000, address: "Service Center Gate 2", lastUpdate: "4 hrs ago", imei: "864910283019486" },
  { id: "VEH-106", name: "Bus-02 (KBQ 672C)", driver: "Hassan Omar", type: "Passenger Coach", status: "Moving", speed: 82, heading: 90, fuel: 65, battery: "24.1 V", ignition: true, odo: 194200, lat: -1.2921, lng: 36.8219, address: "Uhuru Highway Roundabout", lastUpdate: "3s ago", imei: "864910283019487" },
];

export default function TrackingPage() {
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<"all" | "Moving" | "Stopped" | "Idle" | "Inactive">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedVehicle, setSelectedVehicle] = React.useState<typeof TRACKING_OBJECTS[0] | null>(TRACKING_OBJECTS[0]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [mapLayer, setMapLayer] = React.useState<"streets" | "satellite" | "hybrid">("streets");

  const filteredObjects = React.useMemo(() => {
    return TRACKING_OBJECTS.filter((obj) => {
      const matchTab = selectedStatusTab === "all" || obj.status === selectedStatusTab;
      const matchQuery = !searchQuery || obj.name.toLowerCase().includes(searchQuery.toLowerCase()) || obj.driver.toLowerCase().includes(searchQuery.toLowerCase()) || obj.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchQuery;
    });
  }, [selectedStatusTab, searchQuery]);

  return (
    <div className="relative w-full h-[calc(100vh-0px)] overflow-hidden flex bg-muted/20">
      {/* 1. LEFT COLLAPSIBLE FLEET OBJECT TREE PANEL (320px) */}
      <div
        className={cn(
          "h-full bg-card border-r border-border flex flex-col z-20 transition-all duration-300 shadow-xl",
          isSidebarCollapsed ? "w-0 -translate-x-full overflow-hidden" : "w-[330px] translate-x-0"
        )}
      >
        {/* Panel Header */}
        <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#29a4ff] animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Fleet Objects ({TRACKING_OBJECTS.length})</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(true)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Collapse Fleet List"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="grid grid-cols-5 border-b border-border text-[11px] font-semibold text-center bg-muted/10">
          <button
            type="button"
            onClick={() => setSelectedStatusTab("all")}
            className={cn("py-2 border-b-2 transition-colors", selectedStatusTab === "all" ? "border-[#29a4ff] text-[#29a4ff] bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            All<br/><span className="text-[10px] opacity-75">{TRACKING_OBJECTS.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatusTab("Moving")}
            className={cn("py-2 border-b-2 transition-colors", selectedStatusTab === "Moving" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            Run<br/><span className="text-[10px] opacity-75">{TRACKING_OBJECTS.filter(x => x.status === "Moving").length}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatusTab("Stopped")}
            className={cn("py-2 border-b-2 transition-colors", selectedStatusTab === "Stopped" ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            Stop<br/><span className="text-[10px] opacity-75">{TRACKING_OBJECTS.filter(x => x.status === "Stopped").length}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatusTab("Idle")}
            className={cn("py-2 border-b-2 transition-colors", selectedStatusTab === "Idle" ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            Idle<br/><span className="text-[10px] opacity-75">{TRACKING_OBJECTS.filter(x => x.status === "Idle").length}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatusTab("Inactive")}
            className={cn("py-2 border-b-2 transition-colors", selectedStatusTab === "Inactive" ? "border-gray-400 text-gray-600 dark:text-gray-400 bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            Off<br/><span className="text-[10px] opacity-75">{TRACKING_OBJECTS.filter(x => x.status === "Inactive").length}</span>
          </button>
        </div>

        {/* Search Filter Input */}
        <div className="p-2.5 border-b border-border bg-card">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search object, driver, plate..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-md outline-none focus:border-[#29a4ff] text-foreground"
            />
          </div>
        </div>

        {/* Objects List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {filteredObjects.map((obj) => {
            const isSelected = selectedVehicle?.id === obj.id;
            return (
              <div
                key={obj.id}
                onClick={() => setSelectedVehicle(obj)}
                className={cn(
                  "p-3 hover:bg-muted/50 cursor-pointer transition-colors space-y-1.5",
                  isSelected && "bg-[#29a4ff]/10 border-l-4 border-l-[#29a4ff]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        obj.status === "Moving" && "bg-emerald-500",
                        obj.status === "Stopped" && "bg-rose-500",
                        obj.status === "Idle" && "bg-amber-500",
                        obj.status === "Inactive" && "bg-gray-400"
                      )}
                    />
                    <span className="truncate">{obj.name}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-foreground">
                    {obj.speed > 0 ? `${obj.speed} km/h` : obj.status}
                  </span>
                </div>

                <div className="text-[11px] text-muted-foreground truncate">
                  {obj.address}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                  <span>Driver: <strong className="text-foreground font-medium">{obj.driver}</strong></span>
                  <span className="font-mono">{obj.lastUpdate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uncollapse Sidebar Toggle (when collapsed) */}
      {isSidebarCollapsed && (
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(false)}
          className="absolute top-4 left-4 z-30 p-2 rounded-md bg-card border border-border shadow-lg text-foreground hover:text-[#29a4ff]"
          title="Open Fleet List"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* 2. INTERACTIVE LIVE TELEMATICS MAP CANVAS */}
      <div className="flex-1 relative h-full bg-[#e5e3df] dark:bg-[#1a1d24] overflow-hidden">
        {/* Realistic SVG Vector Map Background with Road Grid */}
        <div className="absolute inset-0 opacity-80 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1"/>
                <path d="M 0 60 L 120 60" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.8"/>
                <path d="M 60 0 L 60 120" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Major Highway simulation */}
            <path d="M 0 250 Q 400 300 800 180 T 1600 400" fill="none" stroke="#fbbf24" strokeWidth="8" strokeOpacity="0.4" />
            <path d="M 0 250 Q 400 300 800 180 T 1600 400" fill="none" stroke="#ffffff" strokeWidth="4" strokeDasharray="12,12" strokeOpacity="0.8" />
            <path d="M 350 0 Q 500 400 650 900" fill="none" stroke="#60a5fa" strokeWidth="6" strokeOpacity="0.3" />
          </svg>
        </div>

        {/* Live GPS Telematics Vehicle Pins rendered on Map */}
        {TRACKING_OBJECTS.map((obj, i) => {
          const isSelected = selectedVehicle?.id === obj.id;
          // Offset positions across the canvas
          const leftOffsets = ["35%", "55%", "42%", "68%", "25%", "48%"];
          const topOffsets = ["38%", "28%", "62%", "45%", "72%", "52%"];

          return (
            <div
              key={obj.id}
              onClick={() => setSelectedVehicle(obj)}
              style={{ left: leftOffsets[i % 6], top: topOffsets[i % 6] }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 transition-transform duration-300"
            >
              {/* Pulsing ring for moving vehicles */}
              {obj.status === "Moving" && (
                <div className="absolute inset-0 -m-3 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
              )}

              {/* Pin Badge */}
              <div
                className={cn(
                  "px-2.5 py-1 rounded-full shadow-xl flex items-center gap-1.5 border-2 text-xs font-bold transition-all group-hover:scale-110",
                  obj.status === "Moving" && "bg-emerald-600 text-white border-emerald-300",
                  obj.status === "Stopped" && "bg-rose-600 text-white border-rose-300",
                  obj.status === "Idle" && "bg-amber-600 text-white border-amber-300",
                  obj.status === "Inactive" && "bg-gray-600 text-white border-gray-300",
                  isSelected && "ring-4 ring-[#29a4ff] scale-110"
                )}
              >
                <Navigation
                  className="w-3 h-3"
                  style={{ transform: `rotate(${obj.heading}deg)` }}
                />
                <span>{obj.name.split(" ")[0]}</span>
                {obj.speed > 0 && <span className="text-[10px] font-mono opacity-90">{obj.speed}k</span>}
              </div>
            </div>
          );
        })}

        {/* 3. FLOATING MAP CONTROLS (Top Right) */}
        <div className="absolute top-4 right-14 z-20 flex flex-col gap-2">
          <div className="bg-card border border-border shadow-md rounded-lg overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={() => setMapLayer("streets")}
              className={cn("p-2 text-xs hover:bg-muted font-medium transition-colors flex items-center gap-1.5", mapLayer === "streets" && "text-[#29a4ff] bg-muted/60")}
              title="Street Map Layer"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 text-xs hover:bg-muted font-medium transition-colors flex items-center gap-1.5 text-muted-foreground"
              title="Traffic Layer Toggle"
            >
              <Car className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. FLOATING VEHICLE TELEMETRY CARD (Bottom Left or when vehicle selected) */}
        {selectedVehicle && (
          <div className="absolute bottom-6 left-6 z-30 w-[380px] bg-card border border-border rounded-xl shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <div className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      selectedVehicle.status === "Moving" && "bg-emerald-500",
                      selectedVehicle.status === "Stopped" && "bg-rose-500",
                      selectedVehicle.status === "Idle" && "bg-amber-500",
                      selectedVehicle.status === "Inactive" && "bg-gray-400"
                    )}
                  />
                  {selectedVehicle.name}
                </div>
                <div className="text-[11px] text-muted-foreground">{selectedVehicle.type} • Driver: {selectedVehicle.driver}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-muted/40 rounded-lg border border-border">
                <div className="text-[10px] text-muted-foreground">Current Speed</div>
                <div className="text-base font-extrabold font-mono text-foreground mt-0.5">{selectedVehicle.speed} km/h</div>
              </div>
              <div className="p-2 bg-muted/40 rounded-lg border border-border">
                <div className="text-[10px] text-muted-foreground">Fuel Tank</div>
                <div className="text-base font-extrabold font-mono text-[#29a4ff] mt-0.5">{selectedVehicle.fuel}%</div>
              </div>
              <div className="p-2 bg-muted/40 rounded-lg border border-border">
                <div className="text-[10px] text-muted-foreground">Battery</div>
                <div className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedVehicle.battery}</div>
              </div>
            </div>

            {/* Address & Odometer */}
            <div className="text-xs space-y-1 bg-muted/20 p-2.5 rounded-lg border border-border">
              <div className="text-muted-foreground flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#29a4ff] shrink-0 mt-0.5" />
                <span className="text-[11px] text-foreground font-medium">{selectedVehicle.address}</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                <span>Odometer: <strong className="font-mono text-foreground">{selectedVehicle.odo.toLocaleString()} km</strong></span>
                <span>Signal: <strong className="text-emerald-600 dark:text-emerald-400">14 Satellites (Fix)</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/reports/activity/travel"
                className="auth-btn-primary flex items-center justify-center gap-1.5"
                style={{ height: "34px", fontSize: "11px" }}
              >
                <Play className="w-3.5 h-3.5" /> Route Playback
              </Link>
              <button
                type="button"
                onClick={() => alert(`Command sent to ${selectedVehicle.name}`)}
                className="auth-btn-secondary flex items-center justify-center gap-1.5"
                style={{ height: "34px", fontSize: "11px" }}
              >
                <Power className="w-3.5 h-3.5 text-rose-500" /> Send Command
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
