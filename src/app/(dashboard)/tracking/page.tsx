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
  ArrowUpDown,
  FolderX,
  Check,
  MoreVertical,
  UploadCloud,
  FileUp,
  Bluetooth,
  Cloud,
  GripVertical
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
    id: "UA-347AP",
    name: "UA 347AP - Truck",
    plate: "UA 347AP",
    type: "Truck (Fuel Tanker)",
    group: "Mega Milk",
    status: "Running",
    speed: 15,
    voltage: "28.3V",
    batteryLevel: 95,
    gsm: 4,
    ignition: true,
    time: "02-09-2026 12:09:00 AM",
    address: "Muteesa 1 Road, Lungujja, Mengo, Rubaga, Kampala, P.O",
    driver: "--",
    mobile: "--",
    currentTrip: "0.06 km",
    odometer: "0082317",
    fuelLiter: 191,
    fuelCapacity: 230,
    fuelRefill: 68,
    fuelDrain: 0,
    fuelConsumption: "0.00 liter",
    coords: { x: 55, y: 52 },
  },
  {
    id: "UA-497EP",
    name: "UA 497EP - Truck",
    plate: "UA 497EP",
    type: "Truck",
    group: "Mega Milk",
    status: "Stopped",
    speed: 0,
    voltage: "25.1V",
    batteryLevel: 75,
    gsm: 4,
    ignition: false,
    time: "02-09-2026 12:08:39 AM",
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
    id: "UA-498EP",
    name: "UA 498EP - Truck",
    plate: "UA 498EP",
    type: "Truck (Fuel Tanker)",
    group: "Mega Milk",
    status: "Running",
    speed: 25,
    voltage: "27.8V",
    batteryLevel: 95,
    gsm: 4,
    ignition: true,
    time: "02-09-2026 12:09:03 AM",
    address: "Kaguta Road, Kiruhura, Uganda (SE)",
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
    id: "UBH-279N",
    name: "UBH 279N - Truck",
    plate: "UBH 279N",
    type: "Truck",
    group: "Mega Milk",
    status: "Stopped",
    speed: 0,
    voltage: "23.1V",
    batteryLevel: 60,
    gsm: 3,
    ignition: false,
    time: "01-09-2026 11:58:10 PM",
    address: "Mbarara Masaka Road, Kibwera, PO BOX 1051, Uganda (SE)",
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
    voltage: "18.2V",
    batteryLevel: 40,
    gsm: 2,
    ignition: false,
    time: "01-09-2026 11:57:25 PM",
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
    time: "02-09-2026 12:01:12 AM",
    address: "Gulu - Arua Road, Pakabu, Nwoya, Northern",
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
    time: "01-09-2026 11:10:11 PM",
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
    voltage: "25.2V",
    batteryLevel: 90,
    gsm: 3,
    ignition: false,
    time: "01-09-2026 11:47:59 PM",
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
    status: "Running",
    speed: 34,
    voltage: "26.6V",
    batteryLevel: 92,
    gsm: 4,
    ignition: true,
    time: "02-09-2026 12:09:02 AM",
    address: "Sironko Kapchorwa Road, Muyembe, Bugisa",
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

export default function TrackingPage() {
  // Left panel active tab: object, driver, address, geofence
  const [leftActiveTab, setLeftActiveTab] = React.useState<"object" | "driver" | "address" | "geofence">("object");
  const [isObjectPanelCollapsed, setIsObjectPanelCollapsed] = React.useState(false);
  
  // Right side drawers
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = React.useState(false);
  const [isPinTabDrawerOpen, setIsPinTabDrawerOpen] = React.useState(true);
  const [activePinTab, setActivePinTab] = React.useState<"live" | "engine" | "tpms" | "ble">("live");
  const [widgetSearchQuery, setWidgetSearchQuery] = React.useState("");

  // Selected vehicle & filters
  const [selectedVehicle, setSelectedVehicle] = React.useState<FleetVehicle>(VEHICLES_DATA[0]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

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
            filter: "brightness(0.9) contrast(1.05)",
          }}
        />

        {/* Live Vector Road Arteries */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polyline
            points="580,510 570,540 540,560 550,580 580,550 560,500 580,510"
            fill="none"
            stroke="#00b4d8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_#00b4d8]"
          />
          <rect x="535" y="495" width="24" height="15" rx="2" fill="#22c55e" />
        </svg>

        {/* Map Street & Business Name Label Badges */}
        <div className="absolute top-[28%] left-[62%] -translate-x-1/2 text-white/90 font-bold text-xs drop-shadow-[0_1px_3px_black]">
          Albert Cook Rd
        </div>
        <div className="absolute top-[32%] left-[66%] -translate-x-1/2 bg-white/90 dark:bg-card/90 px-2 py-0.5 rounded border shadow text-[10px] font-bold text-foreground flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>HAWK EVENTS COMPANY LIMITED</span>
        </div>
        <div className="absolute top-[42%] left-[72%] -translate-x-1/2 bg-white/90 dark:bg-card/90 px-2 py-0.5 rounded border shadow text-[10px] font-bold text-foreground flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Beda Shots Photography</span>
        </div>
        <div className="absolute top-[68%] left-[58%] -translate-x-1/2 bg-white/90 dark:bg-card/90 px-2 py-0.5 rounded border shadow text-[10px] font-bold text-foreground flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Mengo Market</span>
        </div>
        <div className="absolute top-[72%] left-[60%] -translate-x-1/2 bg-white/90 dark:bg-card/90 px-2 py-0.5 rounded border shadow text-[10px] font-bold text-foreground flex items-center gap-1">
          <Fuel className="w-3 h-3 text-amber-500" />
          <span>Shell</span>
        </div>

        {/* Selected Live Vehicle 3D Top Marker */}
        <div 
          className="absolute top-[52%] left-[57%] z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
          onClick={() => {
            setIsDetailDrawerOpen(true);
            setIsPinTabDrawerOpen(false);
          }}
        >
          <div className="w-6 h-12 bg-slate-300 border-2 border-slate-600 rounded-sm shadow-2xl flex flex-col items-center justify-between p-0.5 ring-4 ring-[#29a4ff]">
            <div className="w-full h-3 bg-slate-800 rounded-xs" />
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
          </div>
          <div className="mt-1 px-2 py-0.5 bg-[#15803d] text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
            UA 347AP - Truck - 15 km/h
          </div>
        </div>
      </div>

      {/* 2. TOP PLAYBACK BUTTON */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <button
          type="button"
          className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Playback</span>
        </button>
      </div>

      {/* 3. RIGHT FLOATING MAP ACTIONS TOOLBAR */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1">
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
          <button 
            type="button" 
            onClick={() => {
              setIsPinTabDrawerOpen(!isPinTabDrawerOpen);
              setIsDetailDrawerOpen(false);
            }}
            className={cn("p-2 hover:bg-muted hover:text-foreground", isPinTabDrawerOpen && "text-[#2563eb]")}
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-auto self-end text-[9px] font-bold bg-white/90 dark:bg-card/90 px-1 py-0.5 rounded border border-border text-foreground shadow">
          0.005 km
        </div>
      </div>

      {/* 4. LEFT FLOATING FLEET PANEL (#divObject with 4 interactive tabs) */}
      <div
        className={cn(
          "absolute top-3 left-3 bottom-3 z-30 w-[580px] max-w-[calc(100vw-30px)] bg-white dark:bg-card border border-border shadow-2xl rounded flex flex-col transition-all duration-300 overflow-hidden",
          isObjectPanelCollapsed && "-translate-x-[600px]"
        )}
      >
        {/* Blue Header Strip with 4 Main Tabs */}
        <div className="h-[36px] bg-[#1542b7] text-white px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLeftActiveTab("object")}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded transition-colors",
                leftActiveTab === "object" ? "bg-blue-600/60 text-white font-bold" : "text-white/80 hover:text-white"
              )}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Object</span>
            </button>

            <button
              type="button"
              onClick={() => setLeftActiveTab("driver")}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded transition-colors",
                leftActiveTab === "driver" ? "bg-blue-600/60 text-white font-bold" : "text-white/80 hover:text-white"
              )}
              title="Drivers"
            >
              <Users className="w-3.5 h-3.5" />
              {leftActiveTab === "driver" && <span>Driver</span>}
            </button>

            <button
              type="button"
              onClick={() => setLeftActiveTab("address")}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded transition-colors",
                leftActiveTab === "address" ? "bg-blue-600/60 text-white font-bold" : "text-white/80 hover:text-white"
              )}
              title="Address POIs"
            >
              <MapPin className="w-3.5 h-3.5" />
              {leftActiveTab === "address" && <span>Address</span>}
            </button>

            <button
              type="button"
              onClick={() => setLeftActiveTab("geofence")}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded transition-colors",
                leftActiveTab === "geofence" ? "bg-blue-600/60 text-white font-bold" : "text-white/80 hover:text-white"
              )}
              title="Geofences"
            >
              <Grid className="w-3.5 h-3.5" />
              {leftActiveTab === "geofence" && <span>Geofence</span>}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => {
                setIsPinTabDrawerOpen(true);
                setIsDetailDrawerOpen(false);
              }}
              className="text-white/80 hover:text-white"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsObjectPanelCollapsed(true)}
              className="text-white/80 hover:text-white"
              title="Collapse Panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: OBJECT FLEET LIST */}
        {leftActiveTab === "object" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-6 border-b border-border text-center text-[11px] font-semibold">
              <div onClick={() => setStatusFilter("Running")} className="py-1 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r border-border cursor-pointer">
                <div className="text-xs font-bold">{counts.running}</div>
                <div className="text-[9px] uppercase">Running</div>
              </div>
              <div onClick={() => setStatusFilter("Idle")} className="py-1 bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-r border-border cursor-pointer">
                <div className="text-xs font-bold">{counts.idle}</div>
                <div className="text-[9px] uppercase">Idle</div>
              </div>
              <div onClick={() => setStatusFilter("Stopped")} className="py-1 bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-r border-border cursor-pointer">
                <div className="text-xs font-bold">{counts.stopped}</div>
                <div className="text-[9px] uppercase">Stopped</div>
              </div>
              <div onClick={() => setStatusFilter("Inactive")} className="py-1 bg-sky-100/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-r border-border cursor-pointer">
                <div className="text-xs font-bold">{counts.inactive}</div>
                <div className="text-[9px] uppercase">Inactive</div>
              </div>
              <div className="py-1 bg-slate-100 dark:bg-muted/40 text-muted-foreground border-r border-border">
                <div className="text-xs font-bold">0</div>
                <div className="text-[9px] uppercase">NoData</div>
              </div>
              <div onClick={() => setStatusFilter("all")} className="py-1 bg-slate-200/60 dark:bg-muted text-foreground cursor-pointer">
                <div className="text-xs font-bold">{counts.total}</div>
                <div className="text-[9px] uppercase">Total</div>
              </div>
            </div>

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

            <div className="px-3 py-1 bg-slate-100/70 dark:bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-semibold">
              <span>&gt; Collapse</span>
            </div>

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
                                setIsPinTabDrawerOpen(false);
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
                                  <span className="text-[10px] font-bold text-foreground">{v.speed}</span>
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

        {/* TAB 2: DRIVER DIRECTORY */}
        {leftActiveTab === "driver" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-border text-center text-[10px] font-semibold">
              <div className="grid grid-cols-4 border-b border-border">
                <div className="py-1 bg-sky-100/70 dark:bg-sky-950/40 text-sky-800 border-r"><div className="font-bold text-xs">2</div><div>Available</div></div>
                <div className="py-1 bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 border-r"><div className="font-bold text-xs">0</div><div>Not available</div></div>
                <div className="py-1 bg-purple-100/70 dark:bg-purple-950/40 text-purple-800 border-r"><div className="font-bold text-xs">0</div><div>On Leave</div></div>
                <div className="py-1 bg-slate-100 dark:bg-muted text-foreground"><div className="font-bold text-xs">2</div><div>Total</div></div>
              </div>
              <div className="grid grid-cols-2">
                <div className="py-1 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 border-r"><div className="font-bold text-xs">2</div><div>Allocated</div></div>
                <div className="py-1 bg-rose-100/70 dark:bg-rose-950/40 text-rose-800"><div className="font-bold text-xs">0</div><div>Not Allocated</div></div>
              </div>
            </div>

            <div className="p-2 border-b border-border flex items-center gap-2 bg-slate-50/50 dark:bg-muted/20">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-2 pr-6 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]"
                />
                <Search className="w-3.5 h-3.5 absolute right-2 top-2 text-muted-foreground" />
              </div>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><RotateCw className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><Filter className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto text-xs divide-y divide-border/50">
              <div className="px-3 py-1 bg-slate-200/60 dark:bg-muted/70 flex justify-between font-bold text-[11px]">
                <span>Mega Milk</span>
                <span>[ 2 ] -</span>
              </div>
              <div className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <div>
                    <div className="font-bold text-[#1542b7] dark:text-[#29a4ff]">Ntale Driver</div>
                    <div className="text-[10px] text-muted-foreground">UA 498EP</div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-muted-foreground flex items-center gap-2">
                  <span>Allocated Via: <strong className="text-foreground">Default</strong></span>
                  <MoreVertical className="w-3.5 h-3.5 cursor-pointer" />
                </div>
              </div>
              <div className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <div>
                    <div className="font-bold text-[#1542b7] dark:text-[#29a4ff]">Mawanda Driver</div>
                    <div className="text-[10px] text-muted-foreground">UA 497EP</div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-muted-foreground flex items-center gap-2">
                  <span>Allocated Via: <strong className="text-foreground">Default</strong></span>
                  <MoreVertical className="w-3.5 h-3.5 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="p-2 border-t border-border bg-slate-50 dark:bg-muted/20 flex gap-2">
              <button type="button" className="flex-1 py-1.5 bg-[#2563eb] text-white rounded font-bold text-xs shadow">XLS</button>
              <button type="button" className="flex-1 py-1.5 bg-[#2563eb] text-white rounded font-bold text-xs shadow">PDF</button>
            </div>
          </div>
        )}

        {/* TAB 3: ADDRESS POIS */}
        {leftActiveTab === "address" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-border flex items-center gap-2 bg-slate-50/50 dark:bg-muted/20">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-2 pr-6 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]"
                />
                <Search className="w-3.5 h-3.5 absolute right-2 top-2 text-muted-foreground" />
              </div>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><RotateCw className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><MapPin className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><UploadCloud className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><Filter className="w-3.5 h-3.5" /></button>
            </div>

            <div className="px-3 py-1.5 bg-slate-100 dark:bg-muted/50 border-b border-border flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
              <input type="checkbox" className="w-3 h-3 rounded" />
              <span>Address Name</span>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 text-xs text-muted-foreground">
              Address not found
            </div>

            <div className="p-2 border-t border-border bg-slate-50 dark:bg-muted/20 flex gap-2">
              <button type="button" className="flex-1 py-1.5 bg-[#2563eb] text-white rounded font-bold text-xs shadow">XLS</button>
              <button type="button" className="flex-1 py-1.5 bg-[#2563eb] text-white rounded font-bold text-xs shadow">PDF</button>
            </div>
          </div>
        )}

        {/* TAB 4: GEOFENCE */}
        {leftActiveTab === "geofence" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-border flex items-center gap-2 bg-slate-50/50 dark:bg-muted/20">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-2 pr-6 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]"
                />
                <Search className="w-3.5 h-3.5 absolute right-2 top-2 text-muted-foreground" />
              </div>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><RotateCw className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><Grid className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><Filter className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><SlidersHorizontal className="w-3.5 h-3.5" /></button>
            </div>

            <div className="px-3 py-1.5 bg-slate-100 dark:bg-muted/50 border-b border-border flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
              <input type="checkbox" className="w-3 h-3 rounded" />
              <span>Geofence Name</span>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 text-xs text-muted-foreground">
              Geofence not found
            </div>

            <div className="p-2 border-t border-border bg-slate-50 dark:bg-muted/20 flex gap-2">
              <button type="button" className="flex-1 py-1.5 bg-[#2563eb] text-white rounded font-bold text-xs shadow">KML</button>
              <button type="button" className="flex-1 py-1.5 bg-[#2563eb] text-white rounded font-bold text-xs shadow">XLS</button>
              <button type="button" className="flex-1 py-1.5 bg-[#2563eb] text-white rounded font-bold text-xs shadow">PDF</button>
            </div>
          </div>
        )}
      </div>

      {/* 5. RIGHT FLOATING "PIN TAB / TOOLTIP WIDGET" DRAWER (Matching Images 1, 2, 3, 4, 5) */}
      {isPinTabDrawerOpen && (
        <div className="absolute top-3 right-14 bottom-3 z-30 w-[310px] bg-white dark:bg-card border border-border shadow-2xl rounded flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 text-xs">
          
          {/* Header Title */}
          <div className="p-3 pb-2 border-b border-border font-bold text-sm text-foreground">
            Pin Tab
          </div>

          {/* 4 Top Category Cards (Live, Engine Param..., TPMS, BLE) */}
          <div className="grid grid-cols-4 gap-1.5 p-2.5 border-b border-border bg-slate-50/50 dark:bg-muted/20">
            <button
              type="button"
              onClick={() => setActivePinTab("live")}
              className={cn(
                "p-2 rounded border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                activePinTab === "live" ? "border-[#2563eb] bg-sky-50 dark:bg-sky-950/40 text-[#2563eb] font-bold shadow-xs" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <MapPin className="w-4 h-4" />
              <span className="text-[10px]">Live</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePinTab("engine")}
              className={cn(
                "p-2 rounded border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                activePinTab === "engine" ? "border-[#2563eb] bg-sky-50 dark:bg-sky-950/40 text-[#2563eb] font-bold shadow-xs" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Cloud className="w-4 h-4" />
              <span className="text-[10px] truncate max-w-full">Engine...</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePinTab("tpms")}
              className={cn(
                "p-2 rounded border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                activePinTab === "tpms" ? "border-[#2563eb] bg-sky-50 dark:bg-sky-950/40 text-[#2563eb] font-bold shadow-xs" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <CircleDot className="w-4 h-4" />
              <span className="text-[10px]">TPMS</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePinTab("ble")}
              className={cn(
                "p-2 rounded border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                activePinTab === "ble" ? "border-[#2563eb] bg-sky-50 dark:bg-sky-950/40 text-[#2563eb] font-bold shadow-xs" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Bluetooth className="w-4 h-4" />
              <span className="text-[10px]">BLE</span>
            </button>
          </div>

          {/* Subheader & Search */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="font-bold text-xs text-foreground">Tooltip Widget</div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={widgetSearchQuery}
                onChange={(e) => setWidgetSearchQuery(e.target.value)}
                className="w-full pl-2 pr-6 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#2563eb]"
              />
              <RefreshCw className="w-3.5 h-3.5 absolute right-2 top-2 text-muted-foreground cursor-pointer" />
            </div>
            <p className="text-[9px] text-muted-foreground leading-tight">
              *If no space available, remove some widgets to add new ones.
            </p>
            <div className="font-semibold text-xs text-foreground pt-1">Select Tooltip Widget</div>
          </div>

          {/* Scrollable Tooltip Widget Checkbox Trees (Images 1-5) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 divide-y divide-border/60">
            
            {/* 1. Object Info */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>Object Info</span>
              </label>
              <div className="pl-4 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Status</span></label>
                  <GripVertical className="w-3 h-3 cursor-grab" />
                </div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Driver Information</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Work Hour</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Odometer</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Follow</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Share Live Location</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Navigate</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Find Near By</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Mode</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Street View</span></label></div>
              </div>
            </div>

            {/* 2. Fuel */}
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>Fuel</span>
              </label>
              <div className="pl-4 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Level</span></label><GripVertical className="w-3 h-3" /></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Refill and Drain</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Blind Area</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Waste</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Tank Capacity</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Consumption</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Consumption ( CAN )</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Carbon Emission</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Number of Tank</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Remaining</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Updated</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" className="w-3 h-3 rounded" /><span>Tank-Wise Consumption</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" className="w-3 h-3 rounded" /><span>Distance</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" className="w-3 h-3 rounded" /><span>Duration</span></label></div>
              </div>
            </div>

            {/* 3. Location */}
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>Location</span>
              </label>
              <div className="pl-4 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Address</span></label><GripVertical className="w-3 h-3" /></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" className="w-3 h-3 rounded" /><span>Geofence</span></label></div>
              </div>
            </div>

            {/* 4. Today Activity */}
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>Today Activity</span>
              </label>
              <div className="pl-4 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Distance</span></label><GripVertical className="w-3 h-3" /></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Running</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Stop</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Inactive</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Idle</span></label></div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Last Stop</span></label></div>
              </div>
            </div>

            {/* 5. Speed */}
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>Speed</span>
              </label>
            </div>

            {/* 6. Alert */}
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>Alert</span>
              </label>
            </div>

            {/* 7. Temperature */}
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>Temperature</span>
              </label>
            </div>

            {/* 8. Near By */}
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>Near By</span>
              </label>
            </div>

            {/* 9. GPS Device Parameters */}
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#2563eb] rounded" />
                <span>GPS Device Parameters</span>
              </label>
              <div className="pl-4 space-y-1 text-[11px] text-muted-foreground">
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Internal Battery</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Satellite</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>External power</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Internal Battery %</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Movement</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Angle</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Sleep Mode</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Altitude</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>HDOP</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>PDOP</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>Extd Battery</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>IMSI</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>ICCID</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>MAC</span></label></div>
                <div><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 rounded" /><span>ICCID-2</span></label></div>
              </div>
            </div>

          </div>

          {/* Footer Action Buttons */}
          <div className="p-2 border-t border-border bg-slate-50 dark:bg-muted/20 flex gap-2">
            <button
              type="button"
              onClick={() => setIsPinTabDrawerOpen(false)}
              className="flex-1 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded font-bold text-xs shadow"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setIsPinTabDrawerOpen(false)}
              className="flex-1 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded font-bold text-xs shadow"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

      {/* 6. RIGHT FLOATING VEHICLE DETAIL & FUEL GAUGE DRAWER (when selected) */}
      {isDetailDrawerOpen && selectedVehicle && !isPinTabDrawerOpen && (
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
              <span className="text-muted-foreground font-semibold text-[11px]">00:00</span>
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

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fuel</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Sensor Active</span>
              </div>

              <div className="relative w-full h-[120px] flex items-center justify-center">
                <svg className="w-[180px] h-[100px]" viewBox="0 0 200 110">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 60 45" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 60 45 A 80 80 0 0 1 140 45" fill="none" stroke="#f59e0b" strokeWidth="14" />
                  <path d="M 140 45 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" />
                  
                  <line x1="100" y1="95" x2="155" y2="50" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
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
                  <span className="font-semibold text-emerald-600">1 (68 L)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drain</span>
                  <span className="font-semibold text-muted-foreground">NA (0)</span>
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

    </div>
  );
}
