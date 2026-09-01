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
  GripVertical,
  Maximize,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Snowflake,
  Sun,
  DollarSign,
  History,
  Lock,
  Smartphone,
  Signal,
  CreditCard,
  Armchair,
  DoorClosed
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
  avgSpeed: number;
  maxSpeed: number;
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
  coords: { x: number; y: number; lat: string; lng: string };
  duration: string;
  runningHrs: string;
  idleHrs: string;
  stopHrs: string;
  inactiveHrs: string;
  workingStart: string;
  workingStartAddr: string;
  brand: string;
  model: string;
  deviceModel: string;
  imei: string;
  operator: string;
  satellites: number;
  altitude: number;
}

const VEHICLES_DATA: FleetVehicle[] = [
  {
    id: "UA-347AP",
    name: "UA 347AP - Truck",
    plate: "UA 347AP",
    type: "Truck (Fuel Tanker)",
    group: "Mega Milk",
    status: "Running",
    speed: 6,
    avgSpeed: 5,
    maxSpeed: 26,
    voltage: "28.3V",
    batteryLevel: 95,
    gsm: 5,
    ignition: true,
    time: "02-09-2026 12:16:57 AM",
    address: "Kiribedda, Nateete, Rubaga, Kampala, P.O. BOX 6940, Uganda (SE)",
    driver: "--",
    mobile: "--",
    currentTrip: "2.15 km",
    odometer: "0082318",
    fuelLiter: 186,
    fuelCapacity: 230,
    fuelRefill: 68,
    fuelDrain: 0,
    fuelConsumption: "0.00 liter",
    coords: { x: 55, y: 52, lat: "0.3006866", lng: "32.5363015" },
    duration: "00:08",
    runningHrs: "00:04 hrs",
    idleHrs: "00:05 hrs",
    stopHrs: "00:00 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "12:00 AM",
    workingStartAddr: "Albert Cook Road, Lungujja, Mengo, Rubaga, Kampala, Uganda (SW)",
    brand: "Ashok Leyland",
    model: "111/E4",
    deviceModel: "FMB125",
    imei: "357073295191353",
    operator: "Airtel",
    satellites: 14,
    altitude: 1177,
  },
  {
    id: "UA-497EP",
    name: "UA 497EP - Truck",
    plate: "UA 497EP",
    type: "Truck",
    group: "Mega Milk",
    status: "Stopped",
    speed: 0,
    avgSpeed: 42,
    maxSpeed: 75,
    voltage: "24.9V",
    batteryLevel: 75,
    gsm: 4,
    ignition: false,
    time: "02-09-2026 12:14:40 AM",
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
    coords: { x: 58, y: 52, lat: "0.201412", lng: "30.821102" },
    duration: "00:00",
    runningHrs: "01:20 hrs",
    idleHrs: "00:15 hrs",
    stopHrs: "04:10 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "08:00 AM",
    workingStartAddr: "Mugore Central depot, Kiruhura",
    brand: "Isuzu",
    model: "FVR 34",
    deviceModel: "FMC130",
    imei: "357073295191480",
    operator: "MTN",
    satellites: 12,
    altitude: 1240,
  },
  {
    id: "UA-498EP",
    name: "UA 498EP - Truck",
    plate: "UA 498EP",
    type: "Truck (Fuel Tanker)",
    group: "Mega Milk",
    status: "Running",
    speed: 51,
    avgSpeed: 38,
    maxSpeed: 82,
    voltage: "27.8V",
    batteryLevel: 95,
    gsm: 5,
    ignition: true,
    time: "02-09-2026 12:16:54 AM",
    address: "Mbarara Masaka Road, Lwengo, Uganda (NE)",
    driver: "Ntale Driver",
    mobile: "+256 701 498210",
    currentTrip: "92.50 km",
    odometer: "0013825",
    fuelLiter: 150,
    fuelCapacity: 270,
    fuelRefill: 183,
    fuelDrain: 60,
    fuelConsumption: "90.91 liter",
    coords: { x: 48, y: 44, lat: "0.224190", lng: "30.791400" },
    duration: "00:12",
    runningHrs: "03:40 hrs",
    idleHrs: "00:20 hrs",
    stopHrs: "00:10 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "06:30 AM",
    workingStartAddr: "Kaguta Highway Junction",
    brand: "Scania",
    model: "G460",
    deviceModel: "FMB125",
    imei: "357073295191992",
    operator: "Airtel",
    satellites: 16,
    altitude: 1310,
  },
  {
    id: "UBH-279N",
    name: "UBH 279N - Truck",
    plate: "UBH 279N",
    type: "Truck",
    group: "Mega Milk",
    status: "Stopped",
    speed: 0,
    avgSpeed: 45,
    maxSpeed: 78,
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
    coords: { x: 38, y: 58, lat: "0.601240", lng: "30.654120" },
    duration: "00:00",
    runningHrs: "04:10 hrs",
    idleHrs: "00:30 hrs",
    stopHrs: "02:15 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "05:00 AM",
    workingStartAddr: "Mbarara Depot",
    brand: "Mercedes-Benz",
    model: "Actros 3340",
    deviceModel: "FMB125",
    imei: "357073295191204",
    operator: "MTN",
    satellites: 11,
    altitude: 1420,
  },
  {
    id: "UBH-168K",
    name: "UBH 168K - Sinotruck",
    plate: "UBH 168K",
    type: "Heavy Tipper",
    group: "walen",
    status: "Running",
    speed: 44,
    avgSpeed: 48,
    maxSpeed: 80,
    voltage: "26.6V",
    batteryLevel: 92,
    gsm: 4,
    ignition: true,
    time: "02-09-2026 12:16:56 AM",
    address: "Sironko Kapchorwa Road, Bunambutye, Bugisa",
    driver: "Samuel Kimani",
    mobile: "+256 709 168775",
    currentTrip: "84.30 km",
    odometer: "0078150",
    fuelLiter: 160,
    fuelCapacity: 320,
    fuelRefill: 150,
    fuelDrain: 0,
    fuelConsumption: "62.10 liter",
    coords: { x: 68, y: 28, lat: "1.291400", lng: "34.341200" },
    duration: "00:25",
    runningHrs: "03:10 hrs",
    idleHrs: "00:10 hrs",
    stopHrs: "00:30 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "07:00 AM",
    workingStartAddr: "Muyembe Quarry Depot",
    brand: "Sinotruk",
    model: "HOWO 371",
    deviceModel: "FMB125",
    imei: "357073295191550",
    operator: "Airtel",
    satellites: 15,
    altitude: 1680,
  },
];

export default function TrackingPage() {
  const [leftActiveTab, setLeftActiveTab] = React.useState<"object" | "driver" | "address" | "geofence">("object");
  const [isObjectPanelCollapsed, setIsObjectPanelCollapsed] = React.useState(false);
  
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = React.useState(true);
  const [isPinTabDrawerOpen, setIsPinTabDrawerOpen] = React.useState(false);

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
    running: 3,
    idle: 0,
    stopped: 6,
    inactive: 1,
    total: 10,
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
            {selectedVehicle.name} - {selectedVehicle.speed} km/h
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

      {/* 4. LEFT FLOATING FLEET PANEL */}
      <div
        className={cn(
          "absolute top-3 left-3 bottom-3 z-30 w-[580px] max-w-[calc(100vw-30px)] bg-white dark:bg-card border border-border shadow-2xl rounded flex flex-col transition-all duration-300 overflow-hidden",
          isObjectPanelCollapsed && "-translate-x-[600px]"
        )}
      >
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

      {/* 5. RIGHT FLOATING VEHICLE DETAIL DRAWER (ALL CARDS MATCHING EXACT SCREENSHOTS) */}
      {isDetailDrawerOpen && selectedVehicle && !isPinTabDrawerOpen && (
        <div className="absolute top-3 right-14 bottom-3 z-30 w-[320px] bg-white dark:bg-card border border-border shadow-2xl rounded flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 text-xs">
          
          {/* Blue Top Utility Bar */}
          <div className="h-[34px] bg-[#1542b7] text-white px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <button type="button" className="hover:text-sky-300" title="Pin Tab"><Pin className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-sky-300" title="Alerts"><Bell className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-sky-300" title="Maintenance"><Wrench className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => {
                  setIsPinTabDrawerOpen(true);
                  setIsDetailDrawerOpen(false);
                }}
                className="hover:text-sky-300"
                title="Configure Tooltip Widgets"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => setIsDetailDrawerOpen(false)}
                className="hover:text-rose-300"
                title="Close"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            
            {/* 1. Vehicle Title & Info */}
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="font-bold text-sm text-foreground">{selectedVehicle.plate}</div>
              <Info className="w-4 h-4 text-[#1542b7] dark:text-[#29a4ff] cursor-pointer" />
            </div>

            {/* 2. Vehicle 3D Render Image */}
            <div className="w-full h-[85px] bg-slate-100 dark:bg-muted/40 rounded flex items-center justify-center p-2 border border-border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80"
                alt="Fuel Tanker Truck"
                className="h-full w-auto object-contain"
              />
            </div>

            {/* 3. Status Badge & Duration */}
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-2.5 py-0.5 rounded font-bold text-white text-[11px]",
                selectedVehicle.status === "Running" ? "bg-emerald-600" : "bg-rose-600"
              )}>
                {selectedVehicle.status}
              </span>
              <span className="text-muted-foreground font-semibold text-[11px]">{selectedVehicle.duration}</span>
            </div>

            {/* 4. Current Trip & Odometer */}
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

            {/* 5. Driver & Mobile */}
            <div className="text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver</span>
                <span className="font-semibold text-foreground">{selectedVehicle.driver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile</span>
                <span className="text-foreground">{selectedVehicle.mobile}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5 text-[#1542b7] dark:text-[#29a4ff] font-semibold cursor-pointer">
                <span>More Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 6. Quick Action Icons Strip */}
            <div className="grid grid-cols-6 border-y border-border py-2 text-center text-muted-foreground">
              <button type="button" className="hover:text-[#1542b7] flex justify-center" title="Navigate"><Navigation className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center" title="Send"><Send className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center" title="Share"><Share2 className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center" title="Security"><ShieldAlert className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center" title="Layers"><Layers className="w-3.5 h-3.5" /></button>
              <button type="button" className="hover:text-[#1542b7] flex justify-center" title="Live View"><Eye className="w-3.5 h-3.5" /></button>
            </div>

            {/* 7. FUEL CARD */}
            <div className="border border-border rounded overflow-hidden shadow-xs">
              <div className="bg-[#1542b7] text-white px-3 py-1.5 flex items-center justify-between font-bold text-xs">
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-300" />
                  <span>Fuel</span>
                </div>
                <Car className="w-3 h-3" />
              </div>

              <div className="p-2.5 space-y-2">
                <div className="relative w-full h-[100px] flex items-center justify-center">
                  <svg className="w-[160px] h-[90px]" viewBox="0 0 200 110">
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 20 100 A 80 80 0 0 1 60 45" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 60 45 A 80 80 0 0 1 140 45" fill="none" stroke="#f59e0b" strokeWidth="12" />
                    <path d="M 140 45 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round" />
                    <line x1="100" y1="95" x2="152" y2="52" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="100" cy="95" r="6" fill="#1e293b" />
                    <text x="25" y="105" fontSize="10" fontWeight="bold" fill="#ef4444">E</text>
                    <text x="170" y="105" fontSize="10" fontWeight="bold" fill="#10b981">F</text>
                  </svg>
                  <div className="absolute bottom-0 flex flex-col items-center">
                    <span className="text-xs font-extrabold text-foreground">{selectedVehicle.fuelLiter} liter</span>
                  </div>
                </div>

                <div className="text-[11px] space-y-1 bg-slate-50 dark:bg-muted/20 p-2 rounded">
                  <div className="flex justify-between"><span>Tanks</span><span className="font-bold">1</span></div>
                  <div className="flex justify-between"><span>Refill</span><span className="font-semibold text-emerald-600">1 (68 L)</span></div>
                  <div className="flex justify-between"><span>Drain</span><span className="font-semibold text-muted-foreground">NA (0)</span></div>
                  <div className="flex justify-between"><span>Tank Capacity</span><span className="font-bold">{selectedVehicle.fuelCapacity}.0 Liter</span></div>
                </div>

                <div className="text-[10px] space-y-1 border-t border-border pt-1 text-muted-foreground">
                  <div className="flex justify-between"><span>Consumption</span><span className="font-bold text-foreground">0.00 liter</span></div>
                  <div className="flex justify-between"><span>Carbon Emission</span><span className="font-bold text-foreground">Sensor: NA | CAN: NA</span></div>
                  <div className="flex justify-between"><span>Waste</span><span className="font-bold text-foreground">0 liter</span></div>
                  <div className="flex justify-between"><span>Remaining</span><span className="font-bold text-foreground">0 km</span></div>
                </div>
              </div>
            </div>

            {/* 8. LOCATION CARD */}
            <div className="border border-border rounded overflow-hidden shadow-xs">
              <div className="bg-slate-100 dark:bg-muted/70 px-3 py-1.5 flex items-center justify-between font-bold text-xs text-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1542b7]" />
                  <span>Location</span>
                </div>
                <Compass className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-foreground" />
              </div>
              <div className="p-2.5 space-y-1.5 text-[11px]">
                <div className="text-muted-foreground leading-snug">{selectedVehicle.address}</div>
                <div className="font-mono text-[10px] font-bold text-[#1542b7] dark:text-[#29a4ff]">{selectedVehicle.coords.lat}, {selectedVehicle.coords.lng}</div>
              </div>
            </div>

            {/* 9. TODAY ACTIVITY CARD */}
            <div className="border border-border rounded overflow-hidden shadow-xs">
              <div className="bg-[#1542b7] text-white px-3 py-1.5 flex items-center justify-between font-bold text-xs">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Today Activity</span>
                </div>
                <Car className="w-3 h-3" />
              </div>
              <div className="p-2.5 space-y-2 text-[11px]">
                <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2 rounded flex justify-between">
                  <span className="text-muted-foreground text-xs font-semibold">Distance</span>
                  <span className="font-extrabold text-sm text-[#1542b7] dark:text-[#29a4ff]">0 km</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Running</span><span className="font-bold text-emerald-600">{selectedVehicle.runningHrs}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Idle</span><span className="font-bold text-amber-500">{selectedVehicle.idleHrs}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Stop</span><span className="font-bold text-rose-500">{selectedVehicle.stopHrs}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Inactive</span><span className="font-bold text-sky-500">{selectedVehicle.inactiveHrs}</span></div>
                </div>
                <div className="border-t border-border pt-1 text-[10px]">
                  <div><span className="font-bold text-foreground">Working Start: </span><span className="text-muted-foreground">{selectedVehicle.workingStart}</span></div>
                  <div className="pt-0.5"><span className="font-bold text-rose-600">Last Stop: </span><span className="text-muted-foreground">--</span></div>
                </div>
              </div>
            </div>

            {/* 10. FUEL CONSUMPTION CIRCLE (Image 5) */}
            <div className="border border-border rounded overflow-hidden shadow-xs p-2.5 space-y-2">
              <div className="flex items-center justify-between font-bold text-xs text-foreground">
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fuel Cons...</span>
                </div>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 flex flex-col items-center justify-center text-[9px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40">
                  <RotateCw className="w-4 h-4 text-amber-600 mb-0.5" />
                  <span>Fuel</span>
                </div>
                <div className="text-[10px] space-y-0.5 text-right">
                  <div><span className="text-muted-foreground">Distance: </span><strong className="text-foreground">0 ltr</strong></div>
                  <div><span className="text-muted-foreground">Duration: </span><strong className="text-foreground">0 ltr</strong></div>
                  <div><span className="text-muted-foreground">CO2 E...: </span><strong className="text-foreground">0 kg</strong></div>
                  <div><span className="text-muted-foreground">Waste: </span><strong className="text-foreground">0 ltr</strong></div>
                </div>
              </div>
              <div className="text-[9px] text-muted-foreground text-center">Due to 0 hrs idling</div>
            </div>

            {/* 11. PASSENGER SEAT DIAGRAM CARD (Image 5) */}
            <div className="border border-border rounded overflow-hidden shadow-xs p-2.5 space-y-2">
              <div className="font-bold text-xs text-foreground flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-[#1542b7]" />
                  <span>Passenger Seat</span>
                </div>
                <div className="flex gap-2 text-[10px]">
                  <span>Occupied <strong className="text-blue-600">0</strong></span>
                  <span>Vacant <strong className="text-rose-600">0</strong></span>
                </div>
              </div>
              <div className="w-full h-14 bg-slate-100 dark:bg-muted/40 rounded border border-border flex items-center justify-center">
                <div className="grid grid-cols-6 gap-1 p-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-xs bg-slate-300 dark:bg-slate-700 border border-slate-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* 12. RPM DIAL GAUGE CARD (Image 5) */}
            <div className="border border-border rounded overflow-hidden shadow-xs p-2.5 space-y-2">
              <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-[#1542b7]" />
                <span>RPM</span>
              </div>
              <div className="flex justify-between text-xs">
                <div><span className="text-muted-foreground">Lowest</span> <strong className="text-emerald-600">0 RPM</strong></div>
                <div><span className="text-muted-foreground">Highest</span> <strong className="text-rose-600">0 RPM</strong></div>
              </div>
              <div className="relative w-full h-[50px] flex items-center justify-center">
                <svg className="w-[120px] h-[50px]" viewBox="0 0 200 100">
                  <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                  <line x1="100" y1="90" x2="100" y2="40" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="90" r="5" fill="#ef4444" />
                </svg>
                <div className="absolute bottom-0 text-[10px] font-bold text-muted-foreground">RPM 0</div>
              </div>
            </div>

            {/* 13. REMINDER BELL CARD (Matching Image 1 & Screenshot media_1788297454474.png) */}
            <div className="rounded overflow-hidden shadow-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reminder</span>
                  </div>
                  <div className="text-[11px] text-rose-900 dark:text-rose-300 mt-1">Due: <strong className="text-sm font-extrabold text-rose-600">0</strong></div>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg ring-4 ring-rose-200 dark:ring-rose-900">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
              </div>

              <div className="grid grid-cols-2 text-[10px] border-t border-rose-200 dark:border-rose-900 pt-1.5 text-rose-900 dark:text-rose-200">
                <div>Overdue: <strong>0</strong></div>
                <div className="text-right">Upcoming: <strong>0</strong></div>
              </div>

              <button
                type="button"
                className="w-full py-1.5 bg-[#881337] hover:bg-[#70102b] text-white rounded font-bold text-xs shadow cursor-pointer transition-colors"
              >
                + Add Reminder
              </button>
            </div>

            {/* 14. DOOR CARD (Matching Screenshot media_1788297454474.png) */}
            <div className="border border-border rounded overflow-hidden shadow-xs">
              <div className="bg-slate-100 dark:bg-muted/70 px-3 py-1.5 flex items-center justify-between font-bold text-xs text-foreground">
                <div className="flex items-center gap-1.5">
                  <DoorClosed className="w-3.5 h-3.5 text-[#1542b7]" />
                  <span>Door</span>
                </div>
              </div>
              <div className="p-3 text-center text-xs text-muted-foreground">
                No Record Found
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
