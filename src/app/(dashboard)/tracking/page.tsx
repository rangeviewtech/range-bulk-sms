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
  Car,
  RotateCw,
  SlidersHorizontal,
  Volume2,
  Share2,
  Plus,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Fleet Vehicles for Live Tracking
const TRACKING_OBJECTS = [
  { id: "VEH-101", name: "UA 347AP (Truck)", driver: "John Kiprono", group: "Mega Milk", type: "Heavy Truck", status: "Moving", speed: 78, heading: 45, fuel: 74, battery: "24.2 V", ignition: true, odo: 142850, lat: 4.859363, lng: 31.571251, address: "Customs Depot Yard B, Juba", lastUpdate: "5s ago", imei: "864910283019482" },
  { id: "VEH-102", name: "UA 497EP (Truck)", driver: "Ahmed Ali", group: "Mega Milk", type: "Delivery Van", status: "Stopped", speed: 0, heading: 0, fuel: 48, battery: "12.6 V", ignition: false, odo: 58320, lat: 4.862100, lng: 31.584000, address: "Gudele Roundabout, Juba", lastUpdate: "1m ago", imei: "864910283019483" },
  { id: "VEH-103", name: "UBM 755K (Truck)", driver: "Peter Omondi", group: "Weldone Logistics", type: "Prime Mover", status: "Idle", speed: 0, heading: 180, fuel: 88, battery: "24.6 V", ignition: true, odo: 310450, lat: 4.845000, lng: 31.560000, address: "Airport North Road, Juba", lastUpdate: "12s ago", imei: "864910283019484" },
  { id: "VEH-104", name: "UBP 004L (Truck)", driver: "David Mwangi", group: "Weldone Logistics", type: "Utility Pickup", status: "Moving", speed: 54, heading: 270, fuel: 62, battery: "13.4 V", ignition: true, odo: 89400, lat: 4.871000, lng: 31.590000, address: "Munuki Sector 4, Juba", lastUpdate: "8s ago", imei: "864910283019485" },
  { id: "VEH-105", name: "UBH 168K (Sinotruck)", driver: "Samuel Kimani", group: "walen", type: "Heavy Tipper", status: "Inactive", speed: 0, heading: 0, fuel: 90, battery: "11.8 V", ignition: false, odo: 215600, lat: 4.830000, lng: 31.540000, address: "Service Yard Gate 2, Juba", lastUpdate: "4 hrs ago", imei: "864910283019486" },
  { id: "VEH-106", name: "UBQ 255H (Crane)", driver: "Hassan Omar", group: "Weldone Logistics", type: "Mobile Crane", status: "Stopped", speed: 0, heading: 90, fuel: 65, battery: "24.1 V", ignition: false, odo: 194200, lat: 4.851000, lng: 31.578000, address: "Nile Port Terminal, Juba", lastUpdate: "23m ago", imei: "864910283019487" },
];

export default function TrackingPage() {
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<"all" | "Moving" | "Stopped" | "Idle" | "Inactive">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedVehicle, setSelectedVehicle] = React.useState<typeof TRACKING_OBJECTS[0] | null>(TRACKING_OBJECTS[0]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [mapLayer, setMapLayer] = React.useState<"streets" | "satellite" | "hybrid">("streets");
  const [showGeofences, setShowGeofences] = React.useState(true);
  const [showTraffic, setShowTraffic] = React.useState(false);

  const filteredObjects = React.useMemo(() => {
    return TRACKING_OBJECTS.filter((obj) => {
      const matchTab = selectedStatusTab === "all" || obj.status === selectedStatusTab;
      const matchQuery = !searchQuery || 
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        obj.driver.toLowerCase().includes(searchQuery.toLowerCase()) || 
        obj.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchQuery;
    });
  }, [selectedStatusTab, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f1f3f7] dark:bg-background text-foreground select-none relative overflow-hidden font-sans">
      
      {/* 1. TOP BLUE BANNER (Exact #1542b7, 40px height matching Dashboard) */}
      <div className="h-[40px] bg-[#1542b7] text-white flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#29a4ff]" />
          <h1 className="text-[14px] font-semibold tracking-wide">Live Tracking</h1>
          <span className="text-[11px] text-white/70 ml-2 hidden sm:inline">
            Real-time GPS telematics map & fleet dispatch
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Map Button */}
          <button 
            type="button"
            className="p-1 hover:text-[#29a4ff] transition-colors cursor-pointer"
            title="Refresh GPS Telemetry"
          >
            <RotateCw className="w-[16px] h-[16px]" />
          </button>

          {/* Toggle Geofences */}
          <button
            type="button"
            onClick={() => setShowGeofences(!showGeofences)}
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border",
              showGeofences ? "bg-white/20 border-white/40 text-white" : "border-white/20 text-white/60 hover:text-white"
            )}
          >
            Geofences: {showGeofences ? "ON" : "OFF"}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            className="p-1 hover:text-[#29a4ff] transition-colors cursor-pointer"
            title="Toggle Fullscreen Map"
          >
            <Maximize2 className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>

      {/* 2. SUB-HEADER TOOLBAR STRIP (Breadcrumb + Controls) */}
      <div className="h-[38px] bg-white dark:bg-card border-b border-border flex items-center justify-between px-4 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)] z-10 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="font-semibold text-foreground">Tracking</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1542b7]/10 text-[#1542b7] dark:text-[#29a4ff] border border-[#1542b7]/20">
            {TRACKING_OBJECTS.length} Active Vehicles
          </span>
        </div>

        {/* Map Layers & Tool Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded border border-border overflow-hidden bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setMapLayer("streets")}
              className={cn("px-2 py-0.5 rounded text-[11px] font-medium transition-colors", mapLayer === "streets" ? "bg-white dark:bg-card text-[#1542b7] dark:text-[#29a4ff] shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground")}
            >
              Streets
            </button>
            <button
              type="button"
              onClick={() => setMapLayer("satellite")}
              className={cn("px-2 py-0.5 rounded text-[11px] font-medium transition-colors", mapLayer === "satellite" ? "bg-white dark:bg-card text-[#1542b7] dark:text-[#29a4ff] shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground")}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapLayer("hybrid")}
              className={cn("px-2 py-0.5 rounded text-[11px] font-medium transition-colors", mapLayer === "hybrid" ? "bg-white dark:bg-card text-[#1542b7] dark:text-[#29a4ff] shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground")}
            >
              Hybrid
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE MAP & FLEET OBJECT TREE SPLIT CANVAS */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* LEFT COLLAPSIBLE FLEET OBJECT TREE PANEL (310px) */}
        <div
          className={cn(
            "h-full bg-white dark:bg-card border-r border-border flex flex-col z-20 transition-all duration-300 shadow-lg shrink-0",
            isSidebarCollapsed ? "w-0 -translate-x-full overflow-hidden" : "w-[310px] translate-x-0"
          )}
        >
          {/* Panel Header */}
          <div className="p-2.5 border-b border-border bg-slate-50/60 dark:bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#29a4ff] animate-pulse" />
              <h2 className="text-xs font-bold text-foreground">Fleet Objects ({TRACKING_OBJECTS.length})</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              title="Collapse Fleet List"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Status Filter Tabs (All, Run, Stop, Idle, Inactive) */}
          <div className="grid grid-cols-5 border-b border-border text-[11px] font-semibold text-center bg-slate-50/40 dark:bg-muted/10">
            <button
              type="button"
              onClick={() => setSelectedStatusTab("all")}
              className={cn("py-1.5 border-b-2 transition-colors cursor-pointer", selectedStatusTab === "all" ? "border-[#1542b7] text-[#1542b7] dark:text-[#29a4ff] bg-white dark:bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              All ({TRACKING_OBJECTS.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab("Moving")}
              className={cn("py-1.5 border-b-2 transition-colors cursor-pointer", selectedStatusTab === "Moving" ? "border-emerald-600 text-emerald-600 bg-white dark:bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Run ({TRACKING_OBJECTS.filter(x => x.status === "Moving").length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab("Stopped")}
              className={cn("py-1.5 border-b-2 transition-colors cursor-pointer", selectedStatusTab === "Stopped" ? "border-orange-600 text-orange-600 bg-white dark:bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Stop ({TRACKING_OBJECTS.filter(x => x.status === "Stopped").length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab("Idle")}
              className={cn("py-1.5 border-b-2 transition-colors cursor-pointer", selectedStatusTab === "Idle" ? "border-amber-500 text-amber-600 bg-white dark:bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Idle ({TRACKING_OBJECTS.filter(x => x.status === "Idle").length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab("Inactive")}
              className={cn("py-1.5 border-b-2 transition-colors cursor-pointer", selectedStatusTab === "Inactive" ? "border-sky-600 text-sky-600 bg-white dark:bg-card" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Off ({TRACKING_OBJECTS.filter(x => x.status === "Inactive").length})
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2 border-b border-border bg-slate-50/30">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vehicle, driver, plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-card border border-border rounded outline-none focus:border-[#1542b7]"
              />
            </div>
          </div>

          {/* Vehicle List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {filteredObjects.map((v) => {
              const isSelected = selectedVehicle?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={cn(
                    "p-2.5 cursor-pointer transition-all duration-150 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-muted/40",
                    isSelected && "bg-[#1542b7]/10 dark:bg-[#1542b7]/20 border-l-4 border-[#1542b7] pl-2"
                  )}
                >
                  {/* Status Indicator Dot */}
                  <div className="mt-1 shrink-0">
                    <span
                      className={cn(
                        "w-2.5 h-2.5 rounded-full block",
                        v.status === "Moving" && "bg-emerald-500 animate-pulse ring-2 ring-emerald-300 dark:ring-emerald-900",
                        v.status === "Stopped" && "bg-orange-500",
                        v.status === "Idle" && "bg-amber-400",
                        v.status === "Inactive" && "bg-sky-400"
                      )}
                    />
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate">{v.name}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.2 rounded",
                        v.status === "Moving" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
                        v.status === "Stopped" && "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400",
                        v.status === "Idle" && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                        v.status === "Inactive" && "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400"
                      )}>
                        {v.speed} km/h
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {v.driver} &bull; {v.group}
                    </div>

                    <div className="text-[10px] text-muted-foreground/80 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{v.address}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsed Expand Toggle Button */}
        {isSidebarCollapsed && (
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute top-4 left-4 z-30 p-2 bg-white dark:bg-card border border-border shadow-md rounded-md hover:bg-muted text-foreground transition-all cursor-pointer"
            title="Expand Fleet List"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* RIGHT MAP CANVAS AREA */}
        <div className="flex-1 relative flex flex-col h-full overflow-hidden bg-slate-200 dark:bg-slate-900">
          
          {/* Simulated High-Res Vector Map with Road Grid and Geofence Overlays */}
          <div className="absolute inset-0 overflow-hidden select-none">
            {/* Map Grid Pattern */}
            <div className="w-full h-full opacity-60 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]" />
            
            {/* Simulated Road Arteries */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300 dark:stroke-slate-700/60" strokeWidth="4">
              <path d="M-50,200 Q300,220 600,180 T1200,300 T1800,250" fill="none" strokeWidth="8" className="stroke-slate-300/80 dark:stroke-slate-700" />
              <path d="M400,-50 Q450,300 420,600 T500,1100" fill="none" strokeWidth="6" className="stroke-slate-300/80 dark:stroke-slate-700" />
              <path d="M100,500 L900,100" fill="none" strokeWidth="4" strokeDasharray="6,6" className="stroke-amber-400/40" />
            </svg>

            {/* Geofence Polygon Overlay */}
            {showGeofences && (
              <div className="absolute top-[28%] left-[34%] w-[260px] h-[190px] border-2 border-dashed border-[#29a4ff] bg-[#29a4ff]/10 rounded-2xl pointer-events-none flex items-start p-2">
                <span className="text-[10px] font-bold bg-[#1542b7] text-white px-2 py-0.5 rounded shadow">
                  Zone: Juba Customs Yard B
                </span>
              </div>
            )}

            {/* Interactive Vehicle Markers on Map */}
            {filteredObjects.map((obj, i) => {
              const isSelected = selectedVehicle?.id === obj.id;
              // Map mock coordinates to screen positions
              const offsets = [
                { top: "35%", left: "42%" },
                { top: "25%", left: "60%" },
                { top: "45%", left: "38%" },
                { top: "55%", left: "50%" },
                { top: "70%", left: "30%" },
                { top: "40%", left: "75%" },
              ];
              const pos = offsets[i % offsets.length];

              return (
                <div
                  key={obj.id}
                  onClick={() => setSelectedVehicle(obj)}
                  style={{ top: pos.top, left: pos.left }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-125 z-20 group",
                    isSelected && "scale-125 z-30"
                  )}
                >
                  {/* Pin Graphic */}
                  <div className={cn(
                    "p-1.5 rounded-full shadow-lg border-2 flex items-center justify-center transition-all",
                    obj.status === "Moving" && "bg-emerald-600 border-white text-white",
                    obj.status === "Stopped" && "bg-orange-600 border-white text-white",
                    obj.status === "Idle" && "bg-amber-500 border-white text-white",
                    obj.status === "Inactive" && "bg-sky-600 border-white text-white",
                    isSelected && "ring-4 ring-[#29a4ff] shadow-2xl scale-110"
                  )}>
                    <Car className="w-3.5 h-3.5" />
                  </div>

                  {/* Marker Tooltip Badge */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 bg-slate-900/90 text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap pointer-events-none group-hover:block transition-all">
                    {obj.name} &bull; {obj.speed} km/h
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Controls Floating in Top Right */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
            <div className="bg-white dark:bg-card border border-border shadow-md rounded-md overflow-hidden flex flex-col">
              <button type="button" className="p-2 hover:bg-muted text-foreground cursor-pointer" title="Zoom In">
                <Plus className="w-4 h-4" />
              </button>
              <div className="h-[1px] bg-border" />
              <button type="button" className="p-2 hover:bg-muted text-foreground cursor-pointer" title="Zoom Out">
                <Minus className="w-4 h-4" />
              </button>
            </div>
            
            <button
              type="button"
              className="p-2 bg-white dark:bg-card border border-border shadow-md rounded-md hover:bg-muted text-foreground cursor-pointer"
              title="Reset Center"
            >
              <Compass className="w-4 h-4 text-[#1542b7] dark:text-[#29a4ff]" />
            </button>
          </div>

          {/* BOTTOM LIVE TELEMETRY DASHBOARD STRIP (Selected Vehicle Telematics) */}
          {selectedVehicle && (
            <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 dark:bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-2xl p-3 animate-in slide-in-from-bottom-3 duration-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Vehicle Identity */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md",
                    selectedVehicle.status === "Moving" ? "bg-emerald-600" : "bg-orange-600"
                  )}>
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{selectedVehicle.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        IMEI: {selectedVehicle.imei}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#1542b7] dark:text-[#29a4ff]" />
                      <span>{selectedVehicle.address} ({selectedVehicle.lat.toFixed(4)}, {selectedVehicle.lng.toFixed(4)})</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Telemetry Metrics Pill Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs w-full md:w-auto">
                  {/* Speed */}
                  <div className="p-2 rounded bg-slate-50 dark:bg-muted/40 border border-border flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-[#1542b7] dark:text-[#29a4ff]" />
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Speed</div>
                      <div className="font-bold text-foreground">{selectedVehicle.speed} km/h</div>
                    </div>
                  </div>

                  {/* Ignition */}
                  <div className="p-2 rounded bg-slate-50 dark:bg-muted/40 border border-border flex items-center gap-2">
                    <Power className={cn("w-4 h-4", selectedVehicle.ignition ? "text-emerald-600" : "text-rose-500")} />
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Ignition</div>
                      <div className={cn("font-bold", selectedVehicle.ignition ? "text-emerald-600" : "text-rose-500")}>
                        {selectedVehicle.ignition ? "ON" : "OFF"}
                      </div>
                    </div>
                  </div>

                  {/* Fuel */}
                  <div className="p-2 rounded bg-slate-50 dark:bg-muted/40 border border-border flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Fuel Level</div>
                      <div className="font-bold text-foreground">{selectedVehicle.fuel}% (74 L)</div>
                    </div>
                  </div>

                  {/* Odometer */}
                  <div className="p-2 rounded bg-slate-50 dark:bg-muted/40 border border-border flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Odometer</div>
                      <div className="font-bold text-foreground">{selectedVehicle.odo.toLocaleString()} km</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/reports/activity/travel?vehicle=${selectedVehicle.id}`}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-[#1542b7] hover:bg-[#1542b7]/90 text-white shadow-sm transition-colors"
                  >
                    Travel History
                  </Link>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
