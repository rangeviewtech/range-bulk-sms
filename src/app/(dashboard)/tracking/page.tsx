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
  Pause,
  RotateCcw,
  ShieldAlert, 
  Power, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
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
  Minus,
  Settings,
  Users,
  AlertTriangle,
  Grid,
  Info,
  Send,
  Wrench,
  Bell,
  Pin,
  Flame,
  Wifi,
  Key,
  Shield,
  Eye,
  Printer,
  FileSpreadsheet,
  Download,
  List,
  FastForward,
  Rewind,
  Flag,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FleetVehicle {
  id: string;
  name: string;
  plate: string;
  type: string;
  group: string;
  status: "Running" | "Idle" | "Stopped" | "Inactive";
  speed: number;
  voltage: string;
  batteryLevel: number;
  gsm: number;
  ignition: boolean;
  time: string;
  address: string;
  driver: string;
  mobile: string;
  currentTrip: string;
  odometer: string;
  fuelLiter: number;
  fuelCapacity: number;
  fuelRefill: number;
  fuelDrain: number;
  fuelConsumption: string;
  coords: { x: number; y: number };
}

const VEHICLES_DATA: FleetVehicle[] = [
  {
    id: "UA-498EP",
    name: "UA 498EP - Truck",
    plate: "UA 498EP",
    type: "Truck (Fuel Tanker)",
    group: "Mega Milk",
    status: "Running",
    speed: 41,
    voltage: "27.7V",
    batteryLevel: 95,
    gsm: 4,
    ignition: true,
    time: "01-09-2026 10:45:34 PM",
    address: "Kazo, Kiruhura, Uganda (NE)",
    driver: "Ntale Driver",
    mobile: "+256 701 498210",
    currentTrip: "92.50 km",
    odometer: "0013825",
    fuelLiter: 150,
    fuelCapacity: 270,
    fuelRefill: 183,
    fuelDrain: 60,
    fuelConsumption: "90.91 liter",
    coords: { x: 48, y: 44 },
  },
  {
    id: "UA-347AP",
    name: "UA 347AP - Truck",
    plate: "UA 347AP",
    type: "Truck",
    group: "Mega Milk",
    status: "Stopped",
    speed: 0,
    voltage: "25.5V",
    batteryLevel: 80,
    gsm: 3,
    ignition: false,
    time: "01-09-2026 10:43:22 PM",
    address: "Albert Cook Road, Lungujja, Mengo, Rubaga, Kampala",
    driver: "John Kiprono",
    mobile: "+256 702 347101",
    currentTrip: "45.10 km",
    odometer: "0048210",
    fuelLiter: 110,
    fuelCapacity: 250,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "34.20 liter",
    coords: { x: 65, y: 35 },
  },
  {
    id: "UA-497EP",
    name: "UA 497EP - Truck",
    plate: "UA 497EP",
    type: "Truck",
    group: "Mega Milk",
    status: "Stopped",
    speed: 0,
    voltage: "25.2V",
    batteryLevel: 75,
    gsm: 4,
    ignition: false,
    time: "01-09-2026 10:41:30 PM",
    address: "Mugore, Kiruhura, Uganda (SE)",
    driver: "Mawanda Driver",
    mobile: "+256 703 497552",
    currentTrip: "0.00 km",
    odometer: "0041333",
    fuelLiter: 55,
    fuelCapacity: 300,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "1.46 liter",
    coords: { x: 58, y: 52 },
  },
  {
    id: "UBH-279N",
    name: "UBH 279N - Truck",
    plate: "UBH 279N",
    type: "Truck",
    group: "Mega Milk",
    status: "Running",
    speed: 6,
    voltage: "25.6V",
    batteryLevel: 90,
    gsm: 3,
    ignition: true,
    time: "01-09-2026 10:44:01 PM",
    address: "Mbarara Masaka Road, Kibwera, PO BOX 1051, Uganda (NE)",
    driver: "David Mwangi",
    mobile: "+256 704 279883",
    currentTrip: "112.40 km",
    odometer: "0092104",
    fuelLiter: 190,
    fuelCapacity: 350,
    fuelRefill: 200,
    fuelDrain: 0,
    fuelConsumption: "78.40 liter",
    coords: { x: 38, y: 58 },
  },
  {
    id: "UBM-755K",
    name: "UBM 755K - Truck",
    plate: "UBM 755K",
    type: "Truck",
    group: "Weldone Logistics",
    status: "Stopped",
    speed: 0,
    voltage: "NA",
    batteryLevel: 60,
    gsm: 3,
    ignition: false,
    time: "01-09-2026 10:43:59 PM",
    address: "B25101, Olwiyo, Nwoya, Uganda (SW)",
    driver: "Peter Omondi",
    mobile: "+256 706 755441",
    currentTrip: "64.00 km",
    odometer: "0053120",
    fuelLiter: 85,
    fuelCapacity: 250,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "42.00 liter",
    coords: { x: 50, y: 25 },
  },
  {
    id: "UBH-168K",
    name: "UBH 168K - Sinotruck",
    plate: "UBH 168K",
    type: "Heavy Tipper",
    group: "walen",
    status: "Idle",
    speed: 0,
    voltage: "26.9V",
    batteryLevel: 92,
    gsm: 4,
    ignition: true,
    time: "01-09-2026 10:43:43 PM",
    address: "Lira - Mbale Road, Bugisa sub-region, Eastern Region",
    driver: "Samuel Kimani",
    mobile: "+256 709 168775",
    currentTrip: "84.30 km",
    odometer: "0078150",
    fuelLiter: 160,
    fuelCapacity: 320,
    fuelRefill: 150,
    fuelDrain: 0,
    fuelConsumption: "62.10 liter",
    coords: { x: 68, y: 28 },
  },
];

const PLAYBACK_TRIPS_DATA = [
  {
    startTime: "01-09-2026 12:00:00 AM",
    startLoc: "Kiruhura, Uganda",
    endTime: "01-09-2026 07:28:40 AM",
    endLoc: "Rwesirabo, Kiruhura, Uganda (SW)",
    running: "04:49",
    distance: "131.16",
    avgSpeed: "27",
    maxSpeed: "102",
    alerts: 5,
    driver: "Ntale Driver",
    status: "Unclassified"
  },
  {
    startTime: "01-09-2026 07:35:25 AM",
    startLoc: "Rwesirabo, Kiruhura, Uganda (SW)",
    endTime: "01-09-2026 12:53:42 PM",
    endLoc: "Mbarara Masaka Road, Lwengo (NE)",
    running: "01:49",
    distance: "102.59",
    avgSpeed: "57",
    maxSpeed: "96",
    alerts: 5,
    driver: "Ntale Driver",
    status: "Unclassified"
  },
  {
    startTime: "01-09-2026 01:40:38 PM",
    startLoc: "Mbarara Masaka Road, Lwengo (NE)",
    endTime: "01-09-2026 03:00:02 PM",
    endLoc: "Mugore, Kiruhura, Uganda (SE)",
    running: "00:53",
    distance: "37.9",
    avgSpeed: "43",
    maxSpeed: "83",
    alerts: 14,
    driver: "Ntale Driver",
    status: "Unclassified"
  },
  {
    startTime: "01-09-2026 04:00:42 PM",
    startLoc: "Mugore, Kiruhura, Uganda",
    endTime: "01-09-2026 10:46:25 PM",
    endLoc: "Kazo, Kiruhura, Uganda (NE)",
    running: "02:52",
    distance: "93.55",
    avgSpeed: "33",
    maxSpeed: "95",
    alerts: 2,
    driver: "Ntale Driver",
    status: "Unclassified"
  },
];

export default function TrackingPage() {
  // Mode: Live Tracking vs Playback
  const [isPlaybackMode, setIsPlaybackMode] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState("4X");
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = React.useState(false);
  const [isPlaybackSettingsOpen, setIsPlaybackSettingsOpen] = React.useState(true);
  const [isTripsDrawerOpen, setIsTripsDrawerOpen] = React.useState(false);

  // Selected vehicle & filters
  const [selectedVehicle, setSelectedVehicle] = React.useState<FleetVehicle>(VEHICLES_DATA[0]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isObjectPanelCollapsed, setIsObjectPanelCollapsed] = React.useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = React.useState(true);
  const [isPlaybackDropdownOpen, setIsPlaybackDropdownOpen] = React.useState(false);

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    "Mega Milk": true,
    "Weldone Logistics": true,
    "walen": true,
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const counts = {
    running: VEHICLES_DATA.filter((v) => v.status === "Running").length,
    idle: VEHICLES_DATA.filter((v) => v.status === "Idle").length,
    stopped: VEHICLES_DATA.filter((v) => v.status === "Stopped").length,
    inactive: VEHICLES_DATA.filter((v) => v.status === "Inactive").length,
    total: VEHICLES_DATA.length,
  };

  const filteredVehicles = React.useMemo(() => {
    return VEHICLES_DATA.filter((v) => {
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      const matchesSearch = !searchQuery || 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driver.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchQuery]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0c1e3d] text-foreground select-none flex flex-col font-sans">
      
      {/* 1. SATELLITE MAP CANVAS BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-[#0a1424] overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2400&q=80')`,
            filter: "brightness(0.85) contrast(1.1)",
          }}
        />

        {/* GPS Playback Path and Waypoint Markers */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Blue Active Route Segment */}
          <polyline
            points="530,220 500,280 440,320 440,420 460,530 520,580 500,640 440,680"
            fill="none"
            stroke="#00b4d8"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_10px_#00b4d8]"
          />

          {/* Black Stopped Route Segment */}
          <polyline
            points="530,520 580,590 620,660 610,700 500,740 440,680"
            fill="none"
            stroke="#1e293b"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Finish Checkered Flag */}
          <rect x="440" y="305" width="26" height="18" fill="white" stroke="#333" />
          <path d="M 440 305 L 453 305 L 453 314 L 440 314 Z" fill="black" />
          <path d="M 453 314 L 466 314 L 466 323 L 453 323 Z" fill="black" />

          {/* Start Green Flag */}
          <rect x="545" y="240" width="28" height="18" rx="3" fill="#22c55e" />
          <text x="552" y="253" fill="white" fontSize="10" fontWeight="bold">Start</text>
        </svg>

        {/* Numbered Waypoint Badges (Yellow [7], [6], Blue [2], Green [4]) */}
        <div className="absolute top-[24%] left-[42%] z-10 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center font-bold text-[11px] text-slate-950 shadow-lg">
          7
        </div>
        <div className="absolute top-[38%] left-[44%] z-10 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center font-bold text-[11px] text-slate-950 shadow-lg">
          6
        </div>
        <div className="absolute top-[52%] left-[53%] z-10 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#2563eb] border-2 border-white flex items-center justify-center font-bold text-[11px] text-white shadow-lg">
          2
        </div>
        <div className="absolute top-[72%] left-[42%] z-10 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#22c55e] border-2 border-white flex items-center justify-center font-bold text-[11px] text-white shadow-lg">
          4
        </div>
        <div className="absolute top-[67%] left-[64%] z-10 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#84cc16] border-2 border-white flex items-center justify-center font-bold text-[11px] text-slate-950 shadow-lg">
          2
        </div>

        {/* Vehicle Simulator Top Top-View Marker */}
        <div 
          className="absolute top-[28%] left-[54%] z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
        >
          {/* Silver Truck Top View */}
          <div className="w-6 h-12 bg-slate-300 border-2 border-slate-600 rounded-sm shadow-2xl flex flex-col items-center justify-between p-0.5">
            <div className="w-full h-3 bg-slate-800 rounded-xs" />
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
          </div>
          {/* Telemetry Tooltip Badge */}
          <div className="mt-1 px-2.5 py-1 bg-slate-900/95 border border-[#29a4ff]/40 text-[#29a4ff] text-[10px] font-bold rounded shadow-2xl whitespace-nowrap">
            12 km/hr - 0.01 km - 01-09-2026 12:00:00 AM
          </div>
        </div>

        {/* Live Vehicle Markers On Map (when in normal tracking mode) */}
        {!isPlaybackMode && filteredVehicles.map((v) => {
          const isSelected = selectedVehicle.id === v.id;
          return (
            <div
              key={v.id}
              onClick={() => {
                setSelectedVehicle(v);
                setIsDetailDrawerOpen(true);
              }}
              style={{ top: `${v.coords.y}%`, left: `${v.coords.x}%` }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform duration-200 group hover:scale-125",
                isSelected && "scale-125 z-20"
              )}
            >
              <div className={cn(
                "w-7 h-10 rounded-sm shadow-2xl flex flex-col items-center justify-between p-1 border border-white/80 transition-all",
                v.status === "Running" && "bg-[#22c55e]",
                v.status === "Stopped" && "bg-[#ea580c]",
                v.status === "Idle" && "bg-[#eab308]",
                v.status === "Inactive" && "bg-[#0284c7]",
                isSelected && "ring-4 ring-[#29a4ff] shadow-[0_0_20px_#29a4ff]"
              )}>
                <div className="w-4 h-2 bg-slate-900/60 rounded-xs" />
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>

              <div className={cn(
                "mt-1 px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-lg",
                v.status === "Running" ? "bg-[#15803d]" : "bg-[#c2410c]"
              )}>
                {v.plate} &bull; {v.speed} km/h
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. TOP PLAYBACK TOOLBAR (Switch between Live Tracking and Playback) */}
      {!isPlaybackMode ? (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsPlaybackDropdownOpen(!isPlaybackDropdownOpen)}
            className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Playback</span>
          </button>

          {isPlaybackDropdownOpen && (
            <div className="mt-1 w-[140px] bg-white dark:bg-card border border-border shadow-2xl rounded text-xs py-1 animate-in fade-in zoom-in-95 duration-100">
              {["Today", "Last 24 Hour", "Yesterday", "This Week", "Last Week", "This Month", "Last Month", "Custom"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setIsPlaybackDropdownOpen(false);
                    setIsPlaybackMode(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted text-foreground transition-colors cursor-pointer text-[11px]"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* PLAYBACK TOP TITLE BAR (White rounded pill matching Images 1, 2, 3) */
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white/95 dark:bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-md px-4 py-1.5 flex items-center gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <span>{selectedVehicle.plate}</span>
            <List className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          <div className="h-4 w-[1px] bg-border" />

          <div className="font-semibold text-[11px] text-muted-foreground">
            01-09-2026 12:00 AM To 01-09-2026 10:46 PM
          </div>

          <div className="flex items-center gap-2 text-muted-foreground ml-2">
            <button type="button" className="hover:text-foreground p-1" title="Excel Report"><FileSpreadsheet className="w-3.5 h-3.5" /></button>
            <button type="button" className="hover:text-foreground p-1" title="Print"><Printer className="w-3.5 h-3.5" /></button>
            <button type="button" className="hover:text-foreground p-1" title="Share"><Share2 className="w-3.5 h-3.5" /></button>
            <button 
              type="button" 
              onClick={() => setIsPlaybackSettingsOpen(!isPlaybackSettingsOpen)}
              className={cn("p-1 hover:text-foreground", isPlaybackSettingsOpen && "text-[#2563eb]")}
              title="Playback Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button" 
              onClick={() => setIsPlaybackMode(false)}
              className="p-1 text-rose-600 hover:text-rose-700 font-bold"
              title="Exit Playback"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. RIGHT FLOATING PLAYBACK SETTINGS DRAWER (matching Images 1, 2, 3) */}
      {isPlaybackMode && isPlaybackSettingsOpen && (
        <div className="absolute top-14 right-3 z-30 w-[270px] bg-white dark:bg-card border border-border shadow-2xl rounded-md overflow-hidden text-xs animate-in slide-in-from-right duration-200">
          {/* Header Strip */}
          <div className="h-[32px] bg-[#2563eb] text-white px-3 flex items-center justify-between font-semibold text-[11px]">
            <span>Playback Settings</span>
            <div className="flex items-center gap-2">
              <button type="button" className="hover:text-white/80"><Maximize2 className="w-3 h-3" /></button>
              <button type="button" onClick={() => setIsPlaybackSettingsOpen(false)} className="hover:text-white/80"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Settings Options */}
          <div className="p-3 space-y-2.5 text-[11px]">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3 h-3 text-[#2563eb] rounded" />
                <span>Trip Calculation</span>
              </label>
              <select className="h-6 px-1.5 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>Ignition</option>
                <option>GPS</option>
                <option>Sensor</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-sky-600">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-foreground">Stoppage more than</span>
              </label>
              <select className="h-6 px-1.5 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>14 Min</option>
                <option>30 Min</option>
                <option>1 Hour</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-foreground">Idle more than</span>
              </label>
              <select className="h-6 px-1.5 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>14 Min</option>
                <option>30 Min</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3 h-3 rounded" />
                <span>Speed more than</span>
              </label>
              <select className="h-6 px-1.5 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>60 km/hr</option>
                <option>80 km/hr</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-rose-600">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-foreground">Alerts</span>
              </label>
              <select className="h-6 px-2 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>All</option>
                <option>Overspeed</option>
                <option>Geofence</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-3 h-3 text-[#2563eb] rounded" />
              <span>Route</span>
              <div className="ml-auto flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Emergency Lights</span>
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
              </div>
            </div>

            <div className="pt-1 border-t border-border">
              <label className="flex items-center gap-1.5 cursor-pointer text-rose-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-foreground">Data Points</span>
              </label>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                It may have an impact on the responsiveness of your map if you have lot of data points on path.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. RIGHT FLOATING MAP ACTIONS TOOLBAR */}
      <div className="absolute top-14 right-3 z-20 flex flex-col gap-1">
        <div className="bg-white dark:bg-card border border-border shadow-xl rounded flex flex-col text-muted-foreground overflow-hidden">
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground transition-colors" title="Search Location"><Search className="w-4 h-4" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground transition-colors" title="Map Layers"><Layers className="w-4 h-4" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground transition-colors" title="Traffic Layer"><Radio className="w-4 h-4" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground transition-colors" title="Measurement Tool"><SlidersHorizontal className="w-4 h-4" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground transition-colors" title="Geofences"><Shield className="w-4 h-4" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground transition-colors" title="POI Markers"><MapPin className="w-4 h-4" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground transition-colors" title="Share Live Location"><Share2 className="w-4 h-4" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground transition-colors" title="Zoom In"><Plus className="w-4 h-4" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground transition-colors" title="Zoom Out"><Minus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* 5. NORMAL MODE: LEFT FLOATING OBJECT FLEET GRID PANEL */}
      {!isPlaybackMode && (
        <div
          className={cn(
            "absolute top-3 left-3 bottom-3 z-30 w-[630px] max-w-[calc(100vw-30px)] bg-white dark:bg-card border border-border shadow-2xl rounded flex flex-col transition-all duration-300 overflow-hidden",
            isObjectPanelCollapsed && "-translate-x-[640px]"
          )}
        >
          {/* Blue Header Strip */}
          <div className="h-[36px] bg-[#1542b7] text-white px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <button type="button" className="flex items-center gap-1.5 text-white hover:text-[#29a4ff]">
                <Navigation className="w-3.5 h-3.5" />
                <span>Object</span>
              </button>
              <button type="button" className="text-white/70 hover:text-white"><Users className="w-3.5 h-3.5" /></button>
              <button type="button" className="text-white/70 hover:text-white"><AlertTriangle className="w-3.5 h-3.5" /></button>
              <button type="button" className="text-white/70 hover:text-white"><Grid className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="text-white/80 hover:text-white"><Settings className="w-3.5 h-3.5" /></button>
              <button
                type="button"
                onClick={() => setIsObjectPanelCollapsed(true)}
                className="text-white/80 hover:text-white"
                title="Collapse Object Panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 6-Pill Status Filter Ribbon */}
          <div className="grid grid-cols-6 border-b border-border text-center text-[11px] font-semibold">
            <div 
              onClick={() => setStatusFilter("Running")}
              className="py-1.5 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r border-border cursor-pointer hover:brightness-95"
            >
              <div className="text-xs font-bold">{counts.running}</div>
              <div className="text-[9px] uppercase">Running</div>
            </div>
            <div 
              onClick={() => setStatusFilter("Idle")}
              className="py-1.5 bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-r border-border cursor-pointer hover:brightness-95"
            >
              <div className="text-xs font-bold">{counts.idle}</div>
              <div className="text-[9px] uppercase">Idle</div>
            </div>
            <div 
              onClick={() => setStatusFilter("Stopped")}
              className="py-1.5 bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-r border-border cursor-pointer hover:brightness-95"
            >
              <div className="text-xs font-bold">{counts.stopped}</div>
              <div className="text-[9px] uppercase">Stopped</div>
            </div>
            <div 
              onClick={() => setStatusFilter("Inactive")}
              className="py-1.5 bg-sky-100/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-r border-border cursor-pointer hover:brightness-95"
            >
              <div className="text-xs font-bold">{counts.inactive}</div>
              <div className="text-[9px] uppercase">Inactive</div>
            </div>
            <div className="py-1.5 bg-slate-100 dark:bg-muted/40 text-muted-foreground border-r border-border cursor-pointer">
              <div className="text-xs font-bold">0</div>
              <div className="text-[9px] uppercase">NoData</div>
            </div>
            <div 
              onClick={() => setStatusFilter("all")}
              className="py-1.5 bg-slate-200/60 dark:bg-muted text-foreground cursor-pointer hover:brightness-95"
            >
              <div className="text-xs font-bold">{counts.total}</div>
              <div className="text-[9px] uppercase">Total</div>
            </div>
          </div>

          {/* Search & Actions Ribbon */}
          <div className="p-2 border-b border-border flex items-center gap-2 bg-slate-50/50 dark:bg-muted/20">
            <input type="checkbox" defaultChecked className="rounded border-border w-3.5 h-3.5 text-[#1542b7]" />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by IMEI, VIN, Registration, Object Model, SIM Number, etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-2 pr-6 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]"
              />
              <Search className="w-3.5 h-3.5 absolute right-2 top-2 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button type="button" className="p-1 hover:text-foreground"><RotateCw className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:text-foreground"><Compass className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:text-foreground"><Filter className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:text-foreground"><SlidersHorizontal className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Group Header & Collapse Bar */}
          <div className="px-3 py-1 bg-slate-100/70 dark:bg-muted/40 border-b border-border flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
            <span>&gt; Collapse</span>
          </div>

          {/* Detailed Telematics Vehicles Tree View */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60 text-xs">
            {["Mega Milk", "Weldone Logistics", "walen"].map((grpName) => {
              const grpVehicles = filteredVehicles.filter((v) => v.group === grpName);
              const isExpanded = !!expandedGroups[grpName];
              if (grpVehicles.length === 0) return null;

              return (
                <div key={grpName} className="space-y-0.5">
                  <div 
                    onClick={() => toggleGroup(grpName)}
                    className="px-3 py-1.5 bg-slate-200/60 dark:bg-muted/70 flex items-center justify-between cursor-pointer font-bold text-foreground text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", !isExpanded && "-rotate-90")} />
                      <input type="checkbox" defaultChecked onClick={(e) => e.stopPropagation()} className="w-3 h-3 rounded" />
                      <span>{grpName}</span>
                    </div>
                    <span className="text-muted-foreground font-semibold">[{grpVehicles.length}]</span>
                  </div>

                  {isExpanded && (
                    <div className="divide-y divide-border/40">
                      {grpVehicles.map((v) => {
                        const isSelected = selectedVehicle.id === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => {
                              setSelectedVehicle(v);
                              setIsDetailDrawerOpen(true);
                            }}
                            className={cn(
                              "p-2 pl-6 flex items-start gap-2 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-muted/40",
                              isSelected && "bg-sky-50 dark:bg-sky-950/30 border-l-4 border-[#1542b7]"
                            )}
                          >
                            <input type="checkbox" defaultChecked onClick={(e) => e.stopPropagation()} className="mt-1 w-3 h-3 rounded shrink-0" />
                            
                            <div className="mt-1 shrink-0">
                              <span
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full block",
                                  v.status === "Running" && "bg-emerald-500 ring-2 ring-emerald-300",
                                  v.status === "Stopped" && "bg-rose-500",
                                  v.status === "Idle" && "bg-amber-400",
                                  v.status === "Inactive" && "bg-sky-500"
                                )}
                              />
                            </div>

                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#1542b7] dark:text-[#29a4ff] truncate">{v.name}</span>
                                <span className="text-[10px] font-bold text-foreground">{v.speed} km/h</span>
                              </div>

                              <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                                <span>{v.time}</span>
                                <div className="flex items-center gap-1.5">
                                  <Key className={cn("w-3 h-3", v.ignition ? "text-emerald-600" : "text-rose-500")} />
                                  <Battery className="w-3 h-3 text-emerald-600" />
                                  <Wifi className="w-3 h-3 text-emerald-600" />
                                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{v.voltage}</span>
                                </div>
                              </div>

                              <div className="text-[10px] text-muted-foreground/80 truncate">
                                {v.address}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. NORMAL MODE: RIGHT FLOATING DETAIL & FUEL GAUGE DRAWER */}
      {!isPlaybackMode && isDetailDrawerOpen && selectedVehicle && (
        <div className="absolute top-3 right-14 bottom-3 z-30 w-[310px] bg-white dark:bg-card border border-border shadow-2xl rounded flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 text-xs">
          <div className="h-[34px] bg-[#1542b7] text-white px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-white/80" />
              <Bell className="w-3.5 h-3.5 text-white/80" />
              <Wrench className="w-3.5 h-3.5 text-white/80" />
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-white/80" />
              <button 
                type="button" 
                onClick={() => setIsDetailDrawerOpen(false)}
                className="hover:text-destructive"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="font-bold text-sm text-foreground">{selectedVehicle.plate}</div>
              <Info className="w-4 h-4 text-[#1542b7] dark:text-[#29a4ff]" />
            </div>

            <div className="w-full h-[85px] bg-slate-100 dark:bg-muted/40 rounded flex items-center justify-center p-2 border border-border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80"
                alt="Fuel Tanker Truck"
                className="h-full w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className={cn(
                "px-2.5 py-0.5 rounded font-bold text-white text-[11px]",
                selectedVehicle.status === "Running" ? "bg-emerald-600" : "bg-rose-600"
              )}>
                {selectedVehicle.status}
              </span>
              <span className="text-muted-foreground font-semibold text-[11px]">00:24</span>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-muted/20 p-2.5 rounded border border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Current Trip</span>
                <span className="font-bold text-foreground">{selectedVehicle.currentTrip}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground">Odometer</span>
                <div className="flex gap-0.5 font-mono text-xs font-bold">
                  {selectedVehicle.odometer.split("").map((ch, i) => (
                    <span key={i} className="px-1 py-0.5 bg-slate-900 text-white rounded-xs">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver</span>
                <span className="font-semibold text-foreground">{selectedVehicle.driver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile</span>
                <span className="text-foreground">{selectedVehicle.mobile}</span>
              </div>
            </div>

            <div className="grid grid-cols-6 border-y border-border py-2 text-center text-muted-foreground">
              <button type="button" className="hover:text-[#1542b7] flex justify-center"><Navigation className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center"><Send className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center"><Share2 className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center"><ShieldAlert className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center"><Layers className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center"><Eye className="w-3.5 h-3.5" /></button>
            </div>

            {/* Fuel Gauge */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fuel Telemetry</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Sensor Active</span>
              </div>

              <div className="relative w-full h-[120px] flex items-center justify-center">
                <svg className="w-[180px] h-[100px]" viewBox="0 0 200 110">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 60 45" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 60 45 A 80 80 0 0 1 140 45" fill="none" stroke="#f59e0b" strokeWidth="14" />
                  <path d="M 140 45 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" />
                  <line x1="100" y1="95" x2="140" y2="45" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="95" r="7" fill="#1e293b" />
                  <text x="25" y="105" fontSize="10" fontWeight="bold" fill="#ef4444">E</text>
                  <text x="170" y="105" fontSize="10" fontWeight="bold" fill="#10b981">F</text>
                </svg>
                <div className="absolute bottom-1 flex flex-col items-center">
                  <span className="text-sm font-extrabold text-foreground">{selectedVehicle.fuelLiter} liter</span>
                </div>
              </div>

              <div className="text-[11px] space-y-1 bg-slate-50 dark:bg-muted/20 p-2 rounded border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanks</span>
                  <span className="font-bold text-foreground">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refill</span>
                  <span className="font-semibold text-emerald-600">2 ({selectedVehicle.fuelRefill} L)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drain</span>
                  <span className="font-semibold text-rose-600">1 ({selectedVehicle.fuelDrain} L)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tank Capacity</span>
                  <span className="font-bold text-foreground">{selectedVehicle.fuelCapacity}.0 Liter</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1">
                  <span className="text-muted-foreground">Consumption Sensor</span>
                  <span className="font-bold text-foreground">{selectedVehicle.fuelConsumption}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. PLAYBACK MODE: BOTTOM FLOATING TRANSPORT CONTROLLER & EXPANDABLE TRIPS DRAWER */}
      {isPlaybackMode && (
        <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center">
          
          {/* Main Floating Media Scrubber Pill (matching Images 1, 2, 3) */}
          <div className="mb-2 bg-slate-900/95 text-white backdrop-blur-md border border-white/20 shadow-2xl rounded-lg px-4 py-2 flex items-center gap-4 text-xs animate-in slide-in-from-bottom-2 duration-200">
            
            {/* Speed Multiplier Pill [4X ^] */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-white/10"
              >
                <span>{playbackSpeed}</span>
                <ChevronUp className="w-3 h-3" />
              </button>

              {isSpeedMenuOpen && (
                <div className="absolute bottom-full mb-1 left-0 w-16 bg-slate-900 border border-white/20 rounded shadow-2xl text-center py-1 divide-y divide-white/10 font-bold text-xs">
                  {["1X", "2X", "3X", "4X", "5X", "6X"].map((spd) => (
                    <div
                      key={spd}
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        setIsSpeedMenuOpen(false);
                      }}
                      className={cn(
                        "py-1 hover:bg-blue-600 cursor-pointer transition-colors",
                        playbackSpeed === spd && "bg-blue-600 text-white"
                      )}
                    >
                      {spd}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scrubber Transport Controls */}
            <div className="flex items-center gap-2">
              <button type="button" className="p-1 hover:text-[#29a4ff]"><RotateCcw className="w-3.5 h-3.5" /></button>
              <button 
                type="button" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>
              <button type="button" className="p-1 hover:text-[#29a4ff]"><FastForward className="w-3.5 h-3.5" /></button>
            </div>

            {/* Scrubber Progress Bar */}
            <div className="w-[280px] flex flex-col gap-0.5">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="42"
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#29a4ff]"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>01-09-2026 12:00:00 AM</span>
                <span>01-09-2026 10:46:25 PM</span>
              </div>
            </div>

            {/* Live / History Ratio Pill */}
            <div className="px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-[10px] flex items-center gap-2">
              <span className="text-cyan-400 font-bold">Live (93.95%)</span>
              <span className="text-slate-400">History (6.05%)</span>
            </div>

            {/* Expand Bottom Trips Drawer Button */}
            <button
              type="button"
              onClick={() => setIsTripsDrawerOpen(!isTripsDrawerOpen)}
              className="p-1 hover:text-[#29a4ff] transition-colors"
              title="Toggle Trips Data Grid"
            >
              <ChevronUp className={cn("w-4 h-4 transition-transform", isTripsDrawerOpen && "rotate-180")} />
            </button>
          </div>

          {/* Expandable Trips Data Grid Drawer (matching Image 3) */}
          {isTripsDrawerOpen && (
            <div className="w-full bg-white dark:bg-card border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-200 text-xs max-h-[300px] flex flex-col">
              {/* Header Tabs */}
              <div className="h-[36px] bg-slate-100 dark:bg-muted/70 px-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-4 font-bold text-foreground text-xs">
                  <span className="text-[#1542b7] dark:text-[#29a4ff] border-b-2 border-[#1542b7] dark:border-[#29a4ff] pb-1 cursor-pointer">Trips</span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Stoppage</span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Idle</span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Overspeed</span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex items-center gap-1 px-2 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold">
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>XLS</span>
                  </button>
                  <button type="button" onClick={() => setIsTripsDrawerOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-x-auto overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-slate-50 dark:bg-muted/30 text-muted-foreground font-semibold text-[11px]">
                      <th className="p-2 pl-4">Start Time</th>
                      <th className="p-2">Start Location</th>
                      <th className="p-2">End Time</th>
                      <th className="p-2">End Location</th>
                      <th className="p-2 text-right">Running</th>
                      <th className="p-2 text-right">Distance (km)</th>
                      <th className="p-2 text-right">Avg Speed (km/h)</th>
                      <th className="p-2 text-right">Max Speed (km/h)</th>
                      <th className="p-2 text-right">Alerts</th>
                      <th className="p-2">Driver</th>
                      <th className="p-2 pr-4">Trip Status</th>
                    </tr>
                    {/* Summary Row */}
                    <tr className="bg-slate-200/50 dark:bg-muted/50 font-bold text-foreground text-[11px] border-b border-border">
                      <td className="p-1.5 pl-4" colSpan={4}>Overall Total Summary</td>
                      <td className="p-1.5 text-right text-emerald-600">10:22</td>
                      <td className="p-1.5 text-right">365.2</td>
                      <td className="p-1.5 text-right">35</td>
                      <td className="p-1.5 text-right text-rose-600">102</td>
                      <td className="p-1.5 text-right text-rose-600">26</td>
                      <td className="p-1.5" colSpan={2}></td>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {PLAYBACK_TRIPS_DATA.map((trip, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors text-[11px]">
                        <td className="p-2 pl-4 font-medium text-foreground">{trip.startTime}</td>
                        <td className="p-2 text-muted-foreground truncate max-w-[180px]">{trip.startLoc}</td>
                        <td className="p-2 font-medium text-foreground">{trip.endTime}</td>
                        <td className="p-2 text-muted-foreground truncate max-w-[180px]">{trip.endLoc}</td>
                        <td className="p-2 text-right font-semibold text-foreground">{trip.running}</td>
                        <td className="p-2 text-right font-bold text-foreground">{trip.distance}</td>
                        <td className="p-2 text-right text-foreground">{trip.avgSpeed}</td>
                        <td className="p-2 text-right text-rose-600 font-semibold">{trip.maxSpeed}</td>
                        <td className="p-2 text-right font-bold text-amber-600">{trip.alerts}</td>
                        <td className="p-2 text-foreground">{trip.driver}</td>
                        <td className="p-2 pr-4 text-muted-foreground">{trip.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
