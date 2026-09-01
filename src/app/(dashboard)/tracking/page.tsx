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
  Palette,
  Move,
  Phone,
  Tag,
  Crosshair,
  User,
  Thermometer,
  Camera,
  Activity,
  CircleDot,
  FileText,
  FileCode,
  FileBox,
  LineChart,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ArrowUpDown
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

// PLAYBACK TRIPS DATA (Image 2)
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
    endLoc: "Mbarara Masaka Road, Lwengo, Uganda (NE)",
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
    startLoc: "Mbarara Masaka Road, Lwengo, Uganda (NE)",
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
    endTime: "01-09-2026 11:58:19 PM",
    endLoc: "Kazo, Kiruhura, Uganda (NE)",
    running: "04:04",
    distance: "157.12",
    avgSpeed: "39",
    maxSpeed: "95",
    alerts: 2,
    driver: "Ntale Driver",
    status: "Unclassified"
  },
];

// PLAYBACK EVENTS DATA (Image 3)
const PLAYBACK_EVENTS_DATA = [
  {
    event: "Idle 1",
    time: "01-09-2026 08:47:27 AM",
    duration: "00:17:50",
    address: "Mbarara Masaka Road, Kibwera, PO BOX 1051, Uganda (NE)",
    driver: "Ntale Driver"
  },
  {
    event: "Idle 2",
    time: "01-09-2026 09:18:55 AM",
    duration: "00:21:50",
    address: "Mbarara Masaka Road, Kibwera, PO BOX 1051, Uganda (SW)",
    driver: "Ntale Driver"
  },
  {
    event: "Idle 3",
    time: "01-09-2026 09:48:55 AM",
    duration: "00:40:30",
    address: "Mbarara Masaka Road, Kibwera, PO BOX 1051, Uganda (SE)",
    driver: "Ntale Driver"
  },
  {
    event: "Idle 4",
    time: "01-09-2026 10:58:17 AM",
    duration: "00:33:00",
    address: "Mbarara Masaka Road, Kibwera, PO BOX 1051, Uganda (NE)",
    driver: "Ntale Driver"
  },
  {
    event: "Idle 5",
    time: "01-09-2026 12:36:26 PM",
    duration: "00:17:16",
    address: "Mbarara Masaka Road, Lwengo, Uganda (NE)",
    driver: "Ntale Driver"
  },
  {
    event: "Stoppage 1",
    time: "01-09-2026 12:53:42 PM",
    duration: "00:46:56",
    address: "Mbarara Masaka Road, Lwengo, Uganda (NE)",
    driver: "Ntale Driver"
  },
];

// PLAYBACK DATA POINTS (Image 4)
const PLAYBACK_DATAPOINTS_DATA = [
  { status: "Running", time: "01-09-2026 12:00:00 AM", lat: "0.0759983", lng: "30.9686966", speed: 12, distance: "0.01", address: "Kiruhura, Uganda", driver: "Ntale Driver", battery: "0" },
  { status: "Running", time: "01-09-2026 12:00:02 AM", lat: "0.0760183", lng: "30.9687316", speed: 7, distance: "0.01", address: "Kiruhura, Uganda (SE)", driver: "Ntale Driver", battery: "0" },
  { status: "Running", time: "01-09-2026 12:00:10 AM", lat: "0.0760383", lng: "30.9687916", speed: 6, distance: "0.02", address: "Kiruhura, Uganda (SE)", driver: "Ntale Driver", battery: "0" },
  { status: "Running", time: "01-09-2026 12:00:12 AM", lat: "0.076055", lng: "30.9688333", speed: 13, distance: "0.02", address: "Kiruhura, Uganda (SE)", driver: "Ntale Driver", battery: "0" },
  { status: "Running", time: "01-09-2026 12:00:14 AM", lat: "0.0760915", lng: "30.968855", speed: 6, distance: "0.03", address: "Kiruhura, Uganda (SF)", driver: "Ntale Driver", battery: "0" },
  { status: "Running", time: "01-09-2026 12:00:24 AM", lat: "0.0761916", lng: "30.9689883", speed: 7, distance: "0.04", address: "Kiruhura, Uganda (NE)", driver: "Ntale Driver", battery: "0" },
];

export default function TrackingPage() {
  // Mode: Live Tracking vs Playback
  const [isPlaybackMode, setIsPlaybackMode] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState("4X");
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = React.useState(false);
  const [isPlaybackSettingsOpen, setIsPlaybackSettingsOpen] = React.useState(true);
  
  // Bottom drawer state & active tab
  const [isTripsDrawerOpen, setIsTripsDrawerOpen] = React.useState(true);
  const [activeBottomTab, setActiveBottomTab] = React.useState<"trips" | "events" | "datapoints" | "fuel" | "stoppage">("trips");

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
      
      {/* 1. SATELLITE MAP CANVAS BACKGROUND (Matching Page 7 satellite imagery) */}
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

        {/* Vehicle Simulator Top-View Marker with exact tooltips */}
        <div 
          className="absolute top-[28%] left-[54%] z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
        >
          <div className="w-6 h-12 bg-slate-300 border-2 border-slate-600 rounded-sm shadow-2xl flex flex-col items-center justify-between p-0.5">
            <div className="w-full h-3 bg-slate-800 rounded-xs" />
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
          </div>
          <div className="mt-1 px-2.5 py-1 bg-slate-900/95 border border-[#29a4ff]/40 text-[#29a4ff] text-[10px] font-bold rounded shadow-2xl whitespace-nowrap">
            12 km/hr - 0.01 km - 01-09-2026 12:00:00 AM
          </div>
        </div>
      </div>

      {/* 2. TOP PLAYBACK TOOLBAR */}
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
        /* PLAYBACK TOP TITLE BAR (White rounded pill matching Page 7) */
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white dark:bg-card border border-border shadow-2xl rounded px-3 py-1 flex items-center gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <span>UA 498EP</span>
            <List className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
          </div>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-1 font-semibold text-[11px] text-muted-foreground">
            <span>01-09-2026 12:00 AM To 01-09-2026 11:58 PM</span>
            <Calendar className="w-3.5 h-3.5 text-muted-foreground ml-1" />
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground ml-1">
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
            {/* Red Circular Exit Button */}
            <button 
              type="button" 
              onClick={() => setIsPlaybackMode(false)}
              className="w-4 h-4 rounded-full bg-[#ef4444] text-white flex items-center justify-center font-bold hover:bg-red-600 transition-colors cursor-pointer ml-1"
              title="Exit Playback"
            >
              <X className="w-2.5 h-2.5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* 3. RIGHT FLOATING PLAYBACK SETTINGS DRAWER */}
      {isPlaybackMode && isPlaybackSettingsOpen && (
        <div className="absolute top-14 right-14 z-30 w-[275px] bg-white dark:bg-card border border-border shadow-2xl rounded overflow-hidden text-xs animate-in slide-in-from-right duration-200">
          <div className="h-[32px] bg-[#2563eb] text-white px-3 flex items-center justify-between font-semibold text-[11px]">
            <span>Playback Settings</span>
            <div className="flex items-center gap-2">
              <button type="button" className="hover:text-white/80"><Move className="w-3 h-3" /></button>
              <button type="button" onClick={() => setIsPlaybackSettingsOpen(false)} className="hover:text-white/80"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="p-3 space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>Trip Calculation</span>
              </label>
              <select className="h-6 px-1 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>Ignition</option>
                <option>GPS</option>
                <option>Sensor</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Stoppage more than</span>
              </label>
              <select className="h-6 px-1 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>14 Min</option>
                <option>30 Min</option>
                <option>1 Hour</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Idle more than</span>
              </label>
              <select className="h-6 px-1 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>14 Min</option>
                <option>30 Min</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                <Activity className="w-3 h-3 text-rose-500" />
                <span>Speed more than</span>
              </label>
              <select className="h-6 px-1 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>60 km/hr</option>
                <option>80 km/hr</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Alerts</span>
              </label>
              <select className="h-6 px-2 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>All</option>
                <option>Overspeed</option>
                <option>Geofence</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-3.5 h-3.5 rounded" />
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>InActive</span>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-3.5 h-3.5 rounded" />
              <Fuel className="w-3 h-3 text-emerald-600" />
              <span>Fuel</span>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span className="text-cyan-500 font-bold">~</span>
                <span>Route</span>
              </label>
            </div>

            <div className="flex items-center justify-between pl-5">
              <select className="h-6 px-1 text-[10px] border border-border rounded bg-white dark:bg-muted outline-none">
                <option>Emergency Lights</option>
                <option>Speed Gradient</option>
              </select>
              <Palette className="w-3.5 h-3.5 text-indigo-500 cursor-pointer" />
            </div>

            <div className="pt-2 border-t border-border">
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Data Points</span>
              </label>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                It may have an impact on the responsiveness of your map if you have lot of data-points on path.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. RIGHT FLOATING MAP ACTIONS TOOLBAR */}
      <div className="absolute top-14 right-3 z-20 flex flex-col gap-1">
        <div className="bg-white dark:bg-card border border-border shadow-xl rounded flex flex-col text-muted-foreground overflow-hidden">
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Search Location"><Search className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Map Layers"><Layers className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Traffic Light"><Grid className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Driver Directory"><User className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="POI Markers"><MapPin className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Antenna / Radar"><Radio className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Phone Call"><Phone className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Tags"><Tag className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Share Location"><Share2 className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Measure Ruler"><SlidersHorizontal className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Center Target"><Crosshair className="w-3.5 h-3.5" /></button>
          <div className="h-[1px] bg-border" />
          <button type="button" className="p-2 hover:bg-muted hover:text-foreground" title="Settings"><Settings className="w-3.5 h-3.5" /></button>
        </div>

        <div className="mt-auto self-end text-[9px] font-bold bg-white/90 dark:bg-card/90 px-1 py-0.5 rounded border border-border text-foreground shadow">
          10 km
        </div>
      </div>

      {/* 5. PLAYBACK MODE: BOTTOM FLOATING TRANSPORT CONTROLLER & EXPANDABLE DRAWER */}
      {isPlaybackMode && (
        <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center">
          
          {/* Main Floating Media Scrubber Pill */}
          <div className="mb-2 bg-[#1e293b] text-white backdrop-blur-md border border-white/20 shadow-2xl rounded px-3 py-1.5 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-2 duration-200">
            
            {/* Speed Multiplier Pill [4X ^] */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-white/10"
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

            {/* Transport Actions */}
            <div className="flex items-center gap-2 text-white">
              <button type="button" className="p-1 hover:text-[#29a4ff]"><RotateCcw className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:text-[#29a4ff]"><FileText className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:text-[#29a4ff]"><Filter className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:text-[#29a4ff]"><CircleDot className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:text-[#29a4ff]"><Car className="w-3.5 h-3.5" /></button>
            </div>

            {/* Scrubber Progress Bar */}
            <div className="w-[240px] flex flex-col gap-0.5">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="42"
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#29a4ff]"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>01-09-2026 12:00:00 AM</span>
                <span>01-09-2026 11:58:19 PM</span>
              </div>
            </div>

            {/* Live / History Ratio Pill */}
            <div className="px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-[9px] flex items-center gap-2">
              <span className="text-cyan-400 font-bold">Live (94.18%)</span>
              <span className="text-slate-400">History (5.82%)</span>
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

          {/* Bottom Telematics Drawer Bar & Panels (Matching Images 1, 2, 3, 4, 5) */}
          <div className="w-full flex flex-col">
            
            {/* Header Blue Tool Strip */}
            <div className="h-[34px] bg-[#2563eb] text-white px-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <button type="button" className="p-1 hover:text-white/80" title="User"><User className="w-3.5 h-3.5" /></button>
                
                {/* Trips Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("trips");
                    setIsTripsDrawerOpen(true);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-t flex items-center gap-1 font-bold text-xs transition-colors",
                    activeBottomTab === "trips" && isTripsDrawerOpen ? "bg-white text-[#2563eb]" : "text-white hover:bg-blue-700"
                  )}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Trips</span>
                </button>

                {/* Stoppage Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("stoppage");
                    setIsTripsDrawerOpen(true);
                  }}
                  className={cn(
                    "p-1.5 rounded-t flex items-center gap-1 transition-colors",
                    activeBottomTab === "stoppage" && isTripsDrawerOpen ? "bg-white text-[#2563eb]" : "text-white hover:bg-blue-700"
                  )}
                  title="Stoppage"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                </button>

                {/* Events Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("events");
                    setIsTripsDrawerOpen(true);
                  }}
                  className={cn(
                    "px-2 py-1 rounded-t flex items-center gap-1 font-bold text-xs transition-colors",
                    activeBottomTab === "events" && isTripsDrawerOpen ? "bg-white text-[#2563eb]" : "text-white hover:bg-blue-700"
                  )}
                  title="Events"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" />
                  {activeBottomTab === "events" && isTripsDrawerOpen && <span>Events</span>}
                </button>

                {/* Overspeed Tab */}
                <button type="button" className="p-1 hover:text-white/80" title="Overspeed"><Gauge className="w-3.5 h-3.5" /></button>

                {/* Fuel Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("fuel");
                    setIsTripsDrawerOpen(true);
                  }}
                  className={cn(
                    "px-2 py-1 rounded-t flex items-center gap-1 font-bold text-xs transition-colors",
                    activeBottomTab === "fuel" && isTripsDrawerOpen ? "bg-white text-[#2563eb]" : "text-white hover:bg-blue-700"
                  )}
                  title="Fuel Graph"
                >
                  <Fuel className="w-3.5 h-3.5" />
                  {activeBottomTab === "fuel" && isTripsDrawerOpen && <span>Fuel</span>}
                </button>

                <button type="button" className="p-1 hover:text-white/80" title="Temperature"><Thermometer className="w-3.5 h-3.5" /></button>
                <button type="button" className="p-1 hover:text-white/80" title="Camera"><Camera className="w-3.5 h-3.5" /></button>

                {/* Data Points Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("datapoints");
                    setIsTripsDrawerOpen(true);
                  }}
                  className={cn(
                    "px-2 py-1 rounded-t flex items-center gap-1 font-bold text-xs transition-colors",
                    activeBottomTab === "datapoints" && isTripsDrawerOpen ? "bg-white text-[#2563eb]" : "text-white hover:bg-blue-700"
                  )}
                  title="Data Points"
                >
                  <Activity className="w-3.5 h-3.5" />
                  {activeBottomTab === "datapoints" && isTripsDrawerOpen && <span>Data Points</span>}
                </button>

                {/* Collapse / Expand toggle */}
                <button 
                  type="button" 
                  onClick={() => setIsTripsDrawerOpen(!isTripsDrawerOpen)} 
                  className="p-1 hover:text-white/80"
                >
                  {isTripsDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Center Resize Handle */}
              <div className="w-12 h-1 bg-white/40 rounded-full cursor-row-resize" />

              {/* Export Buttons */}
              <div className="flex items-center gap-1.5">
                {activeBottomTab === "datapoints" ? (
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <button type="button" className="px-1.5 py-0.5 bg-white text-slate-800 border rounded shadow-xs">XML</button>
                    <button type="button" className="px-1.5 py-0.5 bg-white text-emerald-700 border border-emerald-600 rounded shadow-xs">XLS</button>
                    <button type="button" className="px-1.5 py-0.5 bg-white text-sky-700 border border-sky-600 rounded shadow-xs">CSV</button>
                    <button type="button" className="px-1.5 py-0.5 bg-white text-rose-700 border border-rose-600 rounded shadow-xs">PDF</button>
                  </div>
                ) : activeBottomTab === "fuel" ? (
                  <div className="flex items-center gap-1 text-white">
                    <button type="button" className="p-1 hover:text-white/80"><ZoomIn className="w-3 h-3" /></button>
                    <button type="button" className="p-1 hover:text-white/80"><ZoomOut className="w-3 h-3" /></button>
                    <button type="button" className="p-1 hover:text-white/80"><ChevronLeft className="w-3 h-3" /></button>
                    <button type="button" className="p-1 hover:text-white/80"><ChevronRight className="w-3 h-3" /></button>
                    <button type="button" className="p-1 hover:text-white/80"><RefreshCw className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <button type="button" className="flex items-center gap-1 px-2 py-0.5 bg-white text-emerald-700 border border-emerald-600 rounded text-[10px] font-bold shadow-sm">
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>XLS</span>
                  </button>
                )}
              </div>
            </div>

            {/* EXPANDED CONTENT DRAWER (Trips, Events, Data Points, Fuel Graph) */}
            {isTripsDrawerOpen && (
              <div className="w-full bg-white dark:bg-card border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-200 text-xs max-h-[300px] min-h-[220px] flex flex-col overflow-hidden">
                
                {/* 1. TRIPS TAB (Image 2) */}
                {activeBottomTab === "trips" && (
                  <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-slate-100 dark:bg-muted/50 text-foreground font-bold text-[11px]">
                          <th className="p-2 pl-3">Start Time</th>
                          <th className="p-2">Start Location</th>
                          <th className="p-2">End Time</th>
                          <th className="p-2">End Location</th>
                          <th className="p-2 text-right">Running</th>
                          <th className="p-2 text-right">Distance</th>
                          <th className="p-2 text-right">Average Speed (km/hr)</th>
                          <th className="p-2 text-right">Max Speed (km/hr)</th>
                          <th className="p-2 text-right">Alerts</th>
                          <th className="p-2">Driver</th>
                          <th className="p-2 pr-3">Trip Status</th>
                        </tr>
                        <tr className="bg-slate-200/60 dark:bg-muted/70 font-bold text-foreground text-[11px] border-b border-border">
                          <td className="p-1.5 pl-3" colSpan={4}></td>
                          <td className="p-1.5 text-right font-extrabold">11:34</td>
                          <td className="p-1.5 text-right font-extrabold">428.77</td>
                          <td className="p-1.5 text-right font-extrabold">37</td>
                          <td className="p-1.5 text-right font-extrabold">102</td>
                          <td className="p-1.5 text-right font-extrabold">26</td>
                          <td className="p-1.5" colSpan={2}></td>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {PLAYBACK_TRIPS_DATA.map((trip, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors text-[11px]">
                            <td className="p-2 pl-3 font-medium text-foreground">{trip.startTime}</td>
                            <td className="p-2 text-muted-foreground truncate max-w-[200px]">{trip.startLoc}</td>
                            <td className="p-2 font-medium text-foreground">{trip.endTime}</td>
                            <td className="p-2 text-muted-foreground truncate max-w-[200px]">{trip.endLoc}</td>
                            <td className="p-2 text-right font-semibold text-foreground">{trip.running}</td>
                            <td className="p-2 text-right font-bold text-foreground">{trip.distance}</td>
                            <td className="p-2 text-right text-foreground">{trip.avgSpeed}</td>
                            <td className="p-2 text-right text-foreground">{trip.maxSpeed}</td>
                            <td className="p-2 text-right font-bold text-foreground">{trip.alerts}</td>
                            <td className="p-2 text-foreground">{trip.driver}</td>
                            <td className="p-2 pr-3 text-muted-foreground">{trip.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 2. EVENTS TAB (Image 3) */}
                {activeBottomTab === "events" && (
                  <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-slate-100 dark:bg-muted/50 text-foreground font-bold text-[11px]">
                          <th className="p-2 pl-3">Event</th>
                          <th className="p-2">
                            <div className="flex items-center gap-1 cursor-pointer">
                              <span>Time</span>
                              <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </th>
                          <th className="p-2">Event Duration</th>
                          <th className="p-2">Address</th>
                          <th className="p-2 pr-3">Driver</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {PLAYBACK_EVENTS_DATA.map((ev, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors text-[11px]">
                            <td className="p-2 pl-3 font-bold text-foreground">{ev.event}</td>
                            <td className="p-2 text-foreground">{ev.time}</td>
                            <td className="p-2 font-semibold text-foreground">{ev.duration}</td>
                            <td className="p-2 text-muted-foreground truncate max-w-[400px]">{ev.address}</td>
                            <td className="p-2 pr-3 text-foreground">{ev.driver}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. DATA POINTS TAB (Image 4) */}
                {activeBottomTab === "datapoints" && (
                  <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-slate-100 dark:bg-muted/50 text-foreground font-bold text-[11px]">
                          <th className="p-2 pl-3">
                            <div className="flex items-center gap-1 cursor-pointer">
                              <span>Status</span>
                              <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </th>
                          <th className="p-2">
                            <div className="flex items-center gap-1 cursor-pointer">
                              <span>Time</span>
                              <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </th>
                          <th className="p-2">Latitude</th>
                          <th className="p-2">Longitude</th>
                          <th className="p-2 text-right">
                            <div className="flex items-center justify-end gap-1 cursor-pointer">
                              <span>Speed</span>
                              <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </th>
                          <th className="p-2 text-right">Distance(km)</th>
                          <th className="p-2">Address</th>
                          <th className="p-2">Driver</th>
                          <th className="p-2 pr-3 text-right">
                            <div className="flex items-center justify-end gap-1 cursor-pointer">
                              <span>Battery Voltage %</span>
                              <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {PLAYBACK_DATAPOINTS_DATA.map((dp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors text-[11px]">
                            <td className="p-2 pl-3 font-semibold text-emerald-600">{dp.status}</td>
                            <td className="p-2 font-medium text-foreground">{dp.time}</td>
                            <td className="p-2 text-muted-foreground font-mono">{dp.lat}</td>
                            <td className="p-2 text-muted-foreground font-mono">{dp.lng}</td>
                            <td className="p-2 text-right font-bold text-foreground">{dp.speed}</td>
                            <td className="p-2 text-right text-foreground">{dp.distance}</td>
                            <td className="p-2 text-muted-foreground truncate max-w-[200px]">{dp.address}</td>
                            <td className="p-2 text-foreground">{dp.driver}</td>
                            <td className="p-2 pr-3 text-right text-muted-foreground">{dp.battery}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. FUEL GRAPH & SENSOR TAB (Image 5) */}
                {activeBottomTab === "fuel" && (
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left Sensor Selection Sidebar */}
                    <div className="w-[170px] border-r border-border p-2 bg-slate-50 dark:bg-muted/20 text-xs shrink-0">
                      <div className="font-bold text-foreground mb-2 text-[11px]">Select sensor</div>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-foreground font-medium">
                        <input type="checkbox" defaultChecked className="w-3 h-3 text-blue-600 rounded" />
                        <span>BLE Fuel Level 1</span>
                      </label>
                    </div>

                    {/* Right Interactive SVG Fuel Graph Line */}
                    <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
                      <div className="relative w-full h-[160px]">
                        {/* Y-axis label */}
                        <div className="absolute left-0 top-0 text-[10px] text-muted-foreground font-bold -rotate-90 origin-top-left translate-y-24">
                          BLE Fuel Level 1 (ltr)
                        </div>

                        {/* Chart Grid Lines & Graph */}
                        <svg className="w-full h-full pl-8 pb-4" viewBox="0 0 800 140" preserveAspectRatio="none">
                          {/* Horizontal Grid lines */}
                          <line x1="0" y1="10" x2="800" y2="10" stroke="#e2e8f0" strokeDasharray="3,3" />
                          <line x1="0" y1="40" x2="800" y2="40" stroke="#e2e8f0" strokeDasharray="3,3" />
                          <line x1="0" y1="70" x2="800" y2="70" stroke="#e2e8f0" strokeDasharray="3,3" />
                          <line x1="0" y1="100" x2="800" y2="100" stroke="#e2e8f0" strokeDasharray="3,3" />
                          <line x1="0" y1="130" x2="800" y2="130" stroke="#cbd5e1" />

                          {/* Y-axis ticks */}
                          <text x="-5" y="14" fontSize="9" fill="#94a3b8" textAnchor="end">200</text>
                          <text x="-5" y="44" fontSize="9" fill="#94a3b8" textAnchor="end">150</text>
                          <text x="-5" y="74" fontSize="9" fill="#94a3b8" textAnchor="end">100</text>
                          <text x="-5" y="104" fontSize="9" fill="#94a3b8" textAnchor="end">50</text>
                          <text x="-5" y="134" fontSize="9" fill="#94a3b8" textAnchor="end">0</text>

                          {/* Pink / Red Fuel Telemetry Line (with sudden Refill jump at ~16:00) */}
                          <polyline
                            points="
                              0,58 
                              50,59 
                              100,62 
                              150,68 
                              200,75 
                              250,85 
                              300,92 
                              350,96 
                              400,99 
                              450,105 
                              500,108 
                              505,32 
                              550,33 
                              600,34 
                              650,36 
                              700,37 
                              750,42 
                              800,48
                            "
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        {/* X-axis Timestamp labels */}
                        <div className="flex justify-between pl-8 text-[10px] text-muted-foreground font-semibold">
                          <span>00:00</span>
                          <span>04:00</span>
                          <span>08:00</span>
                          <span>12:00</span>
                          <span>16:00</span>
                          <span>20:00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
