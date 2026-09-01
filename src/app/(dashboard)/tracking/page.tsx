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
  FileText
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
    id: "UBL-090W",
    name: "UBL 090W - Truck",
    plate: "UBL 090W",
    type: "Truck",
    group: "Mega Milk",
    status: "Stopped",
    speed: 0,
    voltage: "18.1V",
    batteryLevel: 40,
    gsm: 2,
    ignition: false,
    time: "01-09-2026 09:57:13 PM",
    address: "Mbarara - Masaka Road, Kibwera, Western Region",
    driver: "Paul Kato",
    mobile: "+256 705 090123",
    currentTrip: "18.20 km",
    odometer: "0024190",
    fuelLiter: 42,
    fuelCapacity: 200,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "14.10 liter",
    coords: { x: 35, y: 64 },
  },
  {
    id: "UBN-3867X",
    name: "UBN 3867X - Truck",
    plate: "UBN 3867X",
    type: "Truck",
    group: "Mega Milk",
    status: "Inactive",
    speed: 0,
    voltage: "4.3V",
    batteryLevel: 10,
    gsm: 1,
    ignition: false,
    time: "16-07-2026 08:37:42 PM",
    address: "Mbarara - Masaka Road, Kibwera, Western Region",
    driver: "Eric Mukasa",
    mobile: "--",
    currentTrip: "0.00 km",
    odometer: "0008450",
    fuelLiter: 10,
    fuelCapacity: 200,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "0.00 liter",
    coords: { x: 30, y: 68 },
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
    id: "UBP-004L",
    name: "UBP 004L - Truck",
    plate: "UBP 004L",
    type: "Truck",
    group: "Weldone Logistics",
    status: "Stopped",
    speed: 0,
    voltage: "25.6V",
    batteryLevel: 85,
    gsm: 4,
    ignition: false,
    time: "01-09-2026 10:10:04 PM",
    address: "Old Jinja Road, Namanve, Bbuto, Kira, Wakiso",
    driver: "Ali Hussein",
    mobile: "+256 707 004992",
    currentTrip: "38.50 km",
    odometer: "0031890",
    fuelLiter: 120,
    fuelCapacity: 260,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "28.50 liter",
    coords: { x: 72, y: 40 },
  },
  {
    id: "UBQ-255H",
    name: "UBQ 255H - Crane",
    plate: "UBQ 255H",
    type: "Mobile Crane",
    group: "Weldone Logistics",
    status: "Stopped",
    speed: 0,
    voltage: "25.3V",
    batteryLevel: 90,
    gsm: 3,
    ignition: false,
    time: "01-09-2026 10:17:59 PM",
    address: "Hima, Kasese, Uganda (SE)",
    driver: "Hassan Omar",
    mobile: "+256 708 255314",
    currentTrip: "12.00 km",
    odometer: "0019420",
    fuelLiter: 95,
    fuelCapacity: 220,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "19.30 liter",
    coords: { x: 28, y: 48 },
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
  const [isPlaybackMode, setIsPlaybackMode] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState("4X");
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = React.useState(false);
  const [isPlaybackSettingsOpen, setIsPlaybackSettingsOpen] = React.useState(true);
  const [isTripsDrawerOpen, setIsTripsDrawerOpen] = React.useState(true);

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
        /* PLAYBACK TOP TITLE BAR (White rounded pill matching Page 7) */
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white dark:bg-card border border-border shadow-2xl rounded px-3 py-1 flex items-center gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <span>UA 498EP</span>
            <List className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
          </div>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-1 font-semibold text-[11px] text-muted-foreground">
            <span>01-09-2026 12:00 AM To 01-09-2026 10:46 PM</span>
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

      {/* 3. RIGHT FLOATING PLAYBACK SETTINGS DRAWER (matching Page 7 exactly) */}
      {isPlaybackMode && isPlaybackSettingsOpen && (
        <div className="absolute top-14 right-14 z-30 w-[275px] bg-white dark:bg-card border border-border shadow-2xl rounded overflow-hidden text-xs animate-in slide-in-from-right duration-200">
          {/* Header Strip */}
          <div className="h-[32px] bg-[#2563eb] text-white px-3 flex items-center justify-between font-semibold text-[11px]">
            <span>Playback Settings</span>
            <div className="flex items-center gap-2">
              <button type="button" className="hover:text-white/80"><Move className="w-3 h-3" /></button>
              <button type="button" onClick={() => setIsPlaybackSettingsOpen(false)} className="hover:text-white/80"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Settings Options */}
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

      {/* 4. RIGHT FLOATING MAP ACTIONS TOOLBAR (Matching Page 7 vertical bar) */}
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

        {/* 10 km scale indicator */}
        <div className="mt-auto self-end text-[9px] font-bold bg-white/90 dark:bg-card/90 px-1 py-0.5 rounded border border-border text-foreground shadow">
          10 km
        </div>
      </div>

      {/* 5. PLAYBACK MODE: BOTTOM FLOATING TRANSPORT CONTROLLER & EXPANDABLE TRIPS DRAWER */}
      {isPlaybackMode && (
        <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center">
          
          {/* Main Floating Media Scrubber Pill (matching Page 7 exactly) */}
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
                <span>01-09-2026 10:46:25 PM</span>
              </div>
            </div>

            {/* Live / History Ratio Pill */}
            <div className="px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-[9px] flex items-center gap-2">
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

          {/* Expandable Trips Data Grid Drawer (Matching Page 7 exactly) */}
          {isTripsDrawerOpen && (
            <div className="w-full bg-white dark:bg-card border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-200 text-xs max-h-[320px] flex flex-col">
              
              {/* Header Blue Tool Strip */}
              <div className="h-[34px] bg-[#2563eb] text-white px-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <div className="px-2.5 py-1 bg-white text-[#2563eb] rounded-t flex items-center gap-1 font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Trips</span>
                  </div>
                  <button type="button" className="p-1 hover:text-white/80" title="Stoppage"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /></button>
                  <button type="button" className="p-1 hover:text-white/80" title="Idle"><span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" /></button>
                  <button type="button" className="p-1 hover:text-white/80" title="Overspeed"><Gauge className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-white/80" title="Fuel"><Fuel className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-white/80" title="Temperature"><Thermometer className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-white/80" title="Camera"><Camera className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => setIsTripsDrawerOpen(false)} className="p-1 hover:text-white/80"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>

                {/* Center Resize Handle */}
                <div className="w-12 h-1 bg-white/40 rounded-full cursor-row-resize" />

                {/* XLS Export Button */}
                <div className="flex items-center gap-2">
                  <button type="button" className="flex items-center gap-1 px-2 py-0.5 bg-white text-emerald-700 border border-emerald-600 rounded text-[10px] font-bold shadow-sm">
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>XLS</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
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
                    {/* Overall Summary Row (bold matching Page 7) */}
                    <tr className="bg-slate-200/60 dark:bg-muted/70 font-bold text-foreground text-[11px] border-b border-border">
                      <td className="p-1.5 pl-3" colSpan={4}></td>
                      <td className="p-1.5 text-right font-extrabold">10:22</td>
                      <td className="p-1.5 text-right font-extrabold">365.2</td>
                      <td className="p-1.5 text-right font-extrabold">35</td>
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
            </div>
          )}

        </div>
      )}

    </div>
  );
}
