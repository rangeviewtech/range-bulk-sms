"use client";

import * as React from "react";
import dynamic from "next/dynamic";
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
  Unlock,
  Smartphone,
  Signal,
  CreditCard,
  Armchair,
  DoorClosed,
  Edit3,
  ChevronsRight,
  ArrowDownAZ
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapVehicle } from "@/components/map/leaflet-osm-map";

// Dynamic import for Leaflet map (client-only)
const LeafletOsmMap = dynamic(
  () => import("@/components/map/leaflet-osm-map").then((mod) => mod.LeafletOsmMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#e5e3df] flex items-center justify-center text-muted-foreground text-xs font-semibold">
        Loading OpenStreetMap...
      </div>
    )
  }
);

interface FleetVehicle extends MapVehicle {
  group: string;
  subGroup: string;
  avgSpeed: number;
  maxSpeed: number;
  batteryLevel: number;
  gsm: number;
  ignition: boolean;
  fullAddress: string;
  mobile: string;
  currentTrip: string;
  odometer: string;
  fuelLiter: number;
  fuelCapacity: number;
  fuelRefill: number;
  fuelDrain: number;
  fuelConsumption: string;
  duration: string;
  runningHrs: string;
  idleHrs: string;
  stopHrs: string;
  inactiveHrs: string;
  workingStart: string;
  brand: string;
  model: string;
  deviceModel: string;
  imei: string;
  operator: string;
  satellites: number;
  altitude: number;
  expiryDate?: string;
}

const VEHICLES_DATA: FleetVehicle[] = [
  {
    id: "UA-347AP",
    name: "UA 347AP - Truck",
    plate: "UA 347AP",
    type: "Truck",
    group: "Mega Milk",
    subGroup: "Mega Milk",
    status: "Running",
    speed: 39,
    avgSpeed: 5,
    maxSpeed: 26,
    voltage: "28.3V",
    batteryLevel: 95,
    gsm: 5,
    ignition: true,
    time: "02-09-2026 10:53:52 PM",
    address: "Kaguta Road,Kiruhura,Western Region, Western Region, Uganda ...",
    fullAddress: "Kaguta Road,Kiruhura,Western Region, Western Region, Uganda (NW)",
    driver: "--",
    mobile: "--",
    currentTrip: "38.70 km",
    odometer: "0092688",
    fuelLiter: 134,
    fuelCapacity: 230,
    fuelRefill: 64,
    fuelDrain: 0,
    fuelConsumption: "56.91 liter",
    lat: -0.1983,
    lng: 30.8251,
    duration: "00:01",
    runningHrs: "00:04 hrs",
    idleHrs: "00:05 hrs",
    stopHrs: "04:10 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "12:00 AM",
    brand: "Ashok Leyland",
    model: "111/E4",
    deviceModel: "FMB125",
    imei: "357073295191353",
    operator: "Airtel",
    satellites: 14,
    altitude: 1177,
    expiryDate: "--",
  },
  {
    id: "UA-497EP",
    name: "UA 497EP - Truck",
    plate: "UA 497EP",
    type: "Truck",
    group: "Mega Milk",
    subGroup: "Mega Milk",
    status: "Stopped",
    speed: 0,
    avgSpeed: 42,
    maxSpeed: 75,
    voltage: "25.4V",
    batteryLevel: 75,
    gsm: 4,
    ignition: false,
    time: "02-09-2026 10:02:38 PM",
    address: "Mugore,Kiruhura, Uganda (NE)",
    fullAddress: "Mugore,Kiruhura, Western Region, Uganda (NE)",
    driver: "--",
    mobile: "+256 703 497552",
    currentTrip: "0.00 km",
    odometer: "0041333",
    fuelLiter: 55,
    fuelCapacity: 300,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "1.46 liter",
    lat: -0.2155,
    lng: 30.8410,
    duration: "00:00",
    runningHrs: "01:20 hrs",
    idleHrs: "00:15 hrs",
    stopHrs: "04:10 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "08:00 AM",
    brand: "Isuzu",
    model: "FVR 34",
    deviceModel: "FMC130",
    imei: "357073295191480",
    operator: "MTN",
    satellites: 12,
    altitude: 1240,
    expiryDate: "--",
  },
  {
    id: "UA-498EP",
    name: "UA 498EP - Truck",
    plate: "UA 498EP",
    type: "Truck (Fuel Tanker)",
    group: "Mega Milk",
    subGroup: "Mega Milk",
    status: "Stopped",
    speed: 0,
    avgSpeed: 38,
    maxSpeed: 82,
    voltage: "25.4V",
    batteryLevel: 95,
    gsm: 5,
    ignition: false,
    time: "02-09-2026 10:02:34 PM",
    address: "Kabawo,Nateete,Rubaga,Kampala,P.O. BOX 6940, Uganda (NE)",
    fullAddress: "Kabawo,Nateete,Rubaga,Kampala,P.O. BOX 6940, Uganda (NE)",
    driver: "--",
    mobile: "+256 701 498210",
    currentTrip: "92.50 km",
    odometer: "0013825",
    fuelLiter: 150,
    fuelCapacity: 270,
    fuelRefill: 183,
    fuelDrain: 60,
    fuelConsumption: "90.91 liter",
    lat: 0.2985,
    lng: 32.5350,
    duration: "00:12",
    runningHrs: "03:40 hrs",
    idleHrs: "00:20 hrs",
    stopHrs: "00:10 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "06:30 AM",
    brand: "Scania",
    model: "G460",
    deviceModel: "FMB125",
    imei: "357073295191992",
    operator: "Airtel",
    satellites: 16,
    altitude: 1310,
    expiryDate: "--",
  },
  {
    id: "UBH-279N",
    name: "UBH 279N - Truck",
    plate: "UBH 279N",
    type: "Truck",
    group: "Mega Milk",
    subGroup: "Mega Milk",
    status: "Stopped",
    speed: 0,
    avgSpeed: 45,
    maxSpeed: 78,
    voltage: "22.1V",
    batteryLevel: 60,
    gsm: 3,
    ignition: false,
    time: "02-09-2026 09:37:05 PM",
    address: "Mbarara - Masaka Road,Kibwera,Western Region,",
    fullAddress: "Mbarara - Masaka Road,Kibwera,PO BOX 1051, Western Region, Uganda (SE)",
    driver: "--",
    mobile: "--",
    currentTrip: "112.40 km",
    odometer: "0092104",
    fuelLiter: 190,
    fuelCapacity: 350,
    fuelRefill: 200,
    fuelDrain: 0,
    fuelConsumption: "78.40 liter",
    lat: -0.5841,
    lng: 30.6521,
    duration: "00:00",
    runningHrs: "04:10 hrs",
    idleHrs: "00:30 hrs",
    stopHrs: "02:15 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "05:00 AM",
    brand: "Mercedes-Benz",
    model: "Actros 3340",
    deviceModel: "FMB125",
    imei: "357073295191204",
    operator: "MTN",
    satellites: 11,
    altitude: 1420,
    expiryDate: "--",
  },
  {
    id: "UBL-090W",
    name: "UBL 090W - Truck",
    plate: "UBL 090W",
    type: "Truck",
    group: "Mega Milk",
    subGroup: "Mega Milk",
    status: "Stopped",
    speed: 0,
    avgSpeed: 40,
    maxSpeed: 70,
    voltage: "18.1V",
    batteryLevel: 50,
    gsm: 3,
    ignition: false,
    time: "02-09-2026 09:49:31 PM",
    address: "Mbarara - Masaka Road,Kibwera,Western Region,",
    fullAddress: "Mbarara - Masaka Road,Kibwera,Western Region, Uganda (SE)",
    driver: "--",
    mobile: "--",
    currentTrip: "45.10 km",
    odometer: "0054210",
    fuelLiter: 110,
    fuelCapacity: 250,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "32.40 liter",
    lat: -0.5910,
    lng: 30.6720,
    duration: "00:00",
    runningHrs: "02:10 hrs",
    idleHrs: "00:15 hrs",
    stopHrs: "01:45 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "08:30 AM",
    brand: "Fuso",
    model: "Canter",
    deviceModel: "FMB125",
    imei: "357073295191311",
    operator: "Airtel",
    satellites: 13,
    altitude: 1290,
    expiryDate: "--",
  },
  {
    id: "UBN-3867X",
    name: "UBN 3867X - Truck",
    plate: "UBN 3867X",
    type: "Truck",
    group: "Mega Milk",
    subGroup: "Mega Milk",
    status: "Inactive",
    speed: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    voltage: "4.3V",
    batteryLevel: 10,
    gsm: 1,
    ignition: false,
    time: "16-07-2026 08:37:42 PM",
    address: "Mbarara - Masaka Road,Kibwera,Western Region,",
    fullAddress: "Mbarara - Masaka Road,Kibwera,Western Region, Uganda (SE)",
    driver: "--",
    mobile: "--",
    currentTrip: "0.00 km",
    odometer: "0011980",
    fuelLiter: 20,
    fuelCapacity: 200,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "0.00 liter",
    lat: -0.6010,
    lng: 30.6810,
    duration: "00:00",
    runningHrs: "00:00 hrs",
    idleHrs: "00:00 hrs",
    stopHrs: "00:00 hrs",
    inactiveHrs: "120:00 hrs",
    workingStart: "--",
    brand: "Tata",
    model: "Prima",
    deviceModel: "FMB125",
    imei: "357073295191422",
    operator: "MTN",
    satellites: 0,
    altitude: 1280,
    expiryDate: "--",
  },
  {
    id: "UBM-755K",
    name: "UBM 755K - Truck",
    plate: "UBM 755K",
    type: "Truck",
    group: "Weldone Logistics",
    subGroup: "Weldone Logistics",
    status: "Stopped",
    speed: 0,
    avgSpeed: 35,
    maxSpeed: 65,
    voltage: "NA",
    batteryLevel: 80,
    gsm: 4,
    ignition: false,
    time: "02-09-2026 10:02:09 PM",
    address: "RN27,Goli, Uganda (SE)",
    fullAddress: "RN27,Goli, Uganda (SE)",
    driver: "--",
    mobile: "--",
    currentTrip: "12.30 km",
    odometer: "0067340",
    fuelLiter: 95,
    fuelCapacity: 250,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "14.20 liter",
    lat: 2.3812,
    lng: 31.2141,
    duration: "00:00",
    runningHrs: "01:05 hrs",
    idleHrs: "00:10 hrs",
    stopHrs: "03:20 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "09:00 AM",
    brand: "Hino",
    model: "500",
    deviceModel: "FMB125",
    imei: "357073295191771",
    operator: "Airtel",
    satellites: 14,
    altitude: 1050,
    expiryDate: "--",
  },
  {
    id: "UBP-004L",
    name: "UBP 004L - Truck",
    plate: "UBP 004L",
    type: "Truck",
    group: "Weldone Logistics",
    subGroup: "Weldone Logistics",
    status: "Stopped",
    speed: 0,
    avgSpeed: 28,
    maxSpeed: 60,
    voltage: "25.5V",
    batteryLevel: 90,
    gsm: 5,
    ignition: false,
    time: "02-09-2026 09:12:40 PM",
    address: "Old Jinja Road,Namanve,Bbuto,Kira,Wakiso,002...",
    fullAddress: "Old Jinja Road,Namanve,Bbuto,Kira,Wakiso,00256, Uganda (SW)",
    driver: "--",
    mobile: "--",
    currentTrip: "18.40 km",
    odometer: "0038910",
    fuelLiter: 140,
    fuelCapacity: 280,
    fuelRefill: 50,
    fuelDrain: 0,
    fuelConsumption: "8.50 liter",
    lat: 0.3512,
    lng: 32.6841,
    duration: "00:05",
    runningHrs: "00:45 hrs",
    idleHrs: "00:25 hrs",
    stopHrs: "01:10 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "10:00 AM",
    brand: "MAN",
    model: "TGS",
    deviceModel: "FMB125",
    imei: "357073295191884",
    operator: "MTN",
    satellites: 15,
    altitude: 1190,
    expiryDate: "--",
  },
  {
    id: "UBQ-255H",
    name: "UBQ 255H - Crane",
    plate: "UBQ 255H",
    type: "Crane",
    group: "Weldone Logistics",
    subGroup: "Weldone Logistics",
    status: "Stopped",
    speed: 0,
    avgSpeed: 20,
    maxSpeed: 45,
    voltage: "25.4V",
    batteryLevel: 85,
    gsm: 4,
    ignition: false,
    time: "02-09-2026 08:38:02 PM",
    address: "Hima,Kasese, Uganda (SE)",
    fullAddress: "Hima,Kasese, Uganda (SE)",
    driver: "--",
    mobile: "--",
    currentTrip: "5.00 km",
    odometer: "0023400",
    fuelLiter: 210,
    fuelCapacity: 400,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "15.00 liter",
    lat: 0.2812,
    lng: 30.1841,
    duration: "00:00",
    runningHrs: "00:30 hrs",
    idleHrs: "00:10 hrs",
    stopHrs: "05:00 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "07:30 AM",
    brand: "Liebherr",
    model: "LTM 1050",
    deviceModel: "FMB125",
    imei: "357073295191199",
    operator: "Airtel",
    satellites: 13,
    altitude: 980,
    expiryDate: "--",
  },
  {
    id: "UA-807DX",
    name: "UA 807DX - Ambula...",
    plate: "UA 807DX",
    type: "Ambulance",
    group: "walen",
    subGroup: "walen",
    status: "Stopped",
    speed: 0,
    avgSpeed: 55,
    maxSpeed: 95,
    voltage: "12.9V",
    batteryLevel: 90,
    gsm: 4,
    ignition: false,
    time: "02-09-2026 10:03:32 PM",
    address: "Apac Road,Te-Obia,Central,Lira Municipality,Northern Region,...",
    fullAddress: "Apac Road,Te-Obia,Central,Lira Municipality,Northern Region, Uganda (SW)",
    driver: "--",
    mobile: "--",
    currentTrip: "34.00 km",
    odometer: "0048120",
    fuelLiter: 60,
    fuelCapacity: 80,
    fuelRefill: 0,
    fuelDrain: 0,
    fuelConsumption: "12.10 liter",
    lat: 2.2512,
    lng: 32.9041,
    duration: "00:00",
    runningHrs: "01:10 hrs",
    idleHrs: "00:05 hrs",
    stopHrs: "02:30 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "08:15 AM",
    brand: "Toyota",
    model: "HiAce",
    deviceModel: "FMB125",
    imei: "357073295191662",
    operator: "MTN",
    satellites: 14,
    altitude: 1080,
    expiryDate: "--",
  },
  {
    id: "UBH-168K",
    name: "UBH 168K - Sinotruck",
    plate: "UBH 168K",
    type: "Heavy Tipper",
    group: "walen",
    subGroup: "walen",
    status: "Running",
    speed: 7,
    avgSpeed: 48,
    maxSpeed: 80,
    voltage: "26.6V",
    batteryLevel: 92,
    gsm: 4,
    ignition: true,
    time: "02-09-2026 10:03:14 PM",
    address: "Busia Road,Tororo, Uganda (SE)",
    fullAddress: "Busia Road,Tororo, Eastern Region, Uganda (SE)",
    driver: "--",
    mobile: "--",
    currentTrip: "84.30 km",
    odometer: "0078150",
    fuelLiter: 160,
    fuelCapacity: 320,
    fuelRefill: 150,
    fuelDrain: 0,
    fuelConsumption: "62.10 liter",
    lat: 0.6914,
    lng: 34.1812,
    duration: "00:25",
    runningHrs: "03:10 hrs",
    idleHrs: "00:10 hrs",
    stopHrs: "00:30 hrs",
    inactiveHrs: "00:00 hrs",
    workingStart: "07:00 AM",
    brand: "Sinotruk",
    model: "HOWO 371",
    deviceModel: "FMB125",
    imei: "357073295191550",
    operator: "Airtel",
    satellites: 15,
    altitude: 1680,
    expiryDate: "--",
  },
];

export default function TrackingPage() {
  const [leftActiveTab, setLeftActiveTab] = React.useState<"object" | "driver" | "address" | "geofence">("object");
  const [isObjectPanelCollapsed, setIsObjectPanelCollapsed] = React.useState(false);
  
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = React.useState(true);
  const [isObjectListSettingsOpen, setIsObjectListSettingsOpen] = React.useState(false);

  const [selectedVehicle, setSelectedVehicle] = React.useState<FleetVehicle>(VEHICLES_DATA[0]); // UA 347AP
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const [hoveredAddress, setHoveredAddress] = React.useState<{ id: string; text: string; top: number; left: number } | null>(null);
  const [hoveredHeaderTip, setHoveredHeaderTip] = React.useState<{ text: string; top: number; left: number } | null>(null);

  // Object List Column Visibility Config
  const [columnsConfig, setColumnsConfig] = React.useState({
    objectNumber: true,
    objectName: true,
    ignition: true,
    power: true,
    gsm: true,
    gps: true,
    ac: false,
    sos: false,
    immobilize: false,
    voltage: true,
    obd: false,
    passengerSeat: false,
    address: true,
    driver: true,
    expiryDate: true,
    objectActivity: false,
  });

  const [tempColumnsConfig, setTempColumnsConfig] = React.useState({ ...columnsConfig });
  const [settingsSearch, setSettingsSearch] = React.useState("");

  // Map Zoom & Layer State (Default to Satellite matching production)
  const [zoomLevel, setZoomLevel] = React.useState<number>(8);
  const [mapLayerType, setMapLayerType] = React.useState<"osm" | "humanitarian" | "satellite">("satellite");
  const [showLayerMenu, setShowLayerMenu] = React.useState(false);

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    "Mega Milk": true,
    "Mega Milk-sub": true,
    "Weldone Logistics": true,
    "Weldone Logistics-sub": true,
    "walen": true,
    "walen-sub": true,
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const counts = {
    running: 1,
    idle: 0,
    stopped: 8,
    inactive: 2,
    nodata: 0,
    total: 11,
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
    <div className="relative w-full h-screen overflow-hidden bg-[#e5e3df] text-foreground select-none flex flex-col font-sans">
      
      {/* 1. REAL LIVE LEAFLET OPENSTREETMAP / SATELLITE MAP COMPONENT */}
      <div className="absolute inset-0 z-0">
        <LeafletOsmMap
          vehicles={filteredVehicles}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={(v) => {
            const fullV = VEHICLES_DATA.find((item) => item.id === v.id);
            if (fullV) setSelectedVehicle(fullV);
            setIsDetailDrawerOpen(true);
            setIsObjectListSettingsOpen(false);
          }}
          zoomLevel={zoomLevel}
          mapLayerType={mapLayerType}
        />
      </div>

      {/* 2. TOP PLAYBACK RIBBON (MATCHING MEDIA_1788374352320.PNG) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            alert("Playback mode activated for " + selectedVehicle.plate);
          }}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-1 text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          style={{
            clipPath: "polygon(0 0, 100% 0, 88% 100%, 12% 100%)",
          }}
          title="Playback Route History"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Playback</span>
        </button>
      </div>

      {/* 3. RIGHT MAP ACTIONS TOOLBAR */}
      <div 
        className={cn(
          "absolute top-2 bottom-3 z-30 flex flex-col justify-between items-end pointer-events-none transition-all duration-200",
          (isDetailDrawerOpen || isObjectListSettingsOpen) ? "right-[328px]" : "right-2"
        )}
      >
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
          {/* Top Blue Double Chevrons Expand Button */}
          <button
            type="button"
            onClick={() => {
              setIsDetailDrawerOpen(!isDetailDrawerOpen);
              setIsObjectListSettingsOpen(false);
            }}
            className="w-8 h-8 rounded bg-[#1e40af] hover:bg-[#1e3a8a] text-white flex items-center justify-center shadow-lg cursor-pointer transition-colors"
            title="Toggle Detail Drawer"
          >
            <ChevronsRight className={cn("w-4 h-4 transition-transform", !isDetailDrawerOpen && "rotate-180")} />
          </button>

          {/* Right Map Action Buttons */}
          <div className="relative w-8 bg-white dark:bg-card border border-border shadow-lg rounded flex flex-col items-center py-1 text-muted-foreground overflow-visible gap-0.5">
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Search Location"><Search className="w-3.5 h-3.5" /></button>
            
            {/* Layer Selector */}
            <button 
              type="button" 
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={cn("p-1.5 hover:bg-muted hover:text-foreground", showLayerMenu && "text-[#2558c4]")} 
              title="Map Layers"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {showLayerMenu && (
              <div className="absolute right-9 top-6 bg-white dark:bg-card border border-border shadow-2xl rounded p-2 text-xs font-semibold w-48 space-y-1 z-50">
                <div 
                  onClick={() => { setMapLayerType("satellite"); setShowLayerMenu(false); }}
                  className={cn("p-1.5 rounded cursor-pointer hover:bg-muted flex items-center justify-between", mapLayerType === "satellite" && "bg-sky-50 text-[#2558c4]")}
                >
                  <span>Satellite / Hybrid</span>
                  {mapLayerType === "satellite" && <Check className="w-3 h-3 text-[#2558c4]" />}
                </div>
                <div 
                  onClick={() => { setMapLayerType("osm"); setShowLayerMenu(false); }}
                  className={cn("p-1.5 rounded cursor-pointer hover:bg-muted flex items-center justify-between", mapLayerType === "osm" && "bg-sky-50 text-[#2558c4]")}
                >
                  <span>OpenStreetMap</span>
                  {mapLayerType === "osm" && <Check className="w-3 h-3 text-[#2558c4]" />}
                </div>
                <div 
                  onClick={() => { setMapLayerType("humanitarian"); setShowLayerMenu(false); }}
                  className={cn("p-1.5 rounded cursor-pointer hover:bg-muted flex items-center justify-between", mapLayerType === "humanitarian" && "bg-sky-50 text-[#2558c4]")}
                >
                  <span>OSM Humanitarian</span>
                  {mapLayerType === "humanitarian" && <Check className="w-3 h-3 text-[#2558c4]" />}
                </div>
              </div>
            )}
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Follow Object"><Crosshair className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Routing"><Navigation className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="POIs"><Flag className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Share Location"><Share2 className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Street View"><Users className="w-3.5 h-3.5" /></button>
            <button 
              type="button" 
              onClick={() => {
                setTempColumnsConfig({ ...columnsConfig });
                setIsObjectListSettingsOpen(!isObjectListSettingsOpen);
                setIsDetailDrawerOpen(false);
              }}
              className={cn("p-1.5 hover:bg-muted hover:text-foreground", isObjectListSettingsOpen && "text-[#2563eb]")}
              title="Object List Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Map Zoom Controls & Scale Indicator */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="bg-white dark:bg-card border border-border rounded shadow flex flex-col overflow-hidden text-muted-foreground">
            <button 
              type="button" 
              onClick={() => setZoomLevel((z) => Math.min(z + 1, 19))} 
              className="p-1.5 hover:bg-muted hover:text-foreground"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="h-[1px] bg-border" />
            <button 
              type="button" 
              onClick={() => setZoomLevel((z) => Math.max(z - 1, 4))} 
              className="p-1.5 hover:bg-muted hover:text-foreground"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[9px] font-bold bg-white/90 dark:bg-card/90 px-1.5 py-0.5 rounded border border-border text-foreground shadow">
            {zoomLevel >= 15 ? "500 m" : zoomLevel >= 13 ? "1 km" : zoomLevel >= 8 ? "50 km" : "1000 km"}
          </div>
        </div>
      </div>

      {/* 4. LEFT FLEET OBJECT PANEL WITH COLLAPSE HANDLE (MATCHING MEDIA_1788374330745.PNG) */}
      <div
        className={cn(
          "absolute top-2 left-2 bottom-2 z-30 w-[800px] max-w-[calc(100vw-20px)] bg-white dark:bg-card border border-border shadow-2xl rounded flex flex-col transition-all duration-300 overflow-visible",
          isObjectPanelCollapsed && "-translate-x-[820px]"
        )}
      >
        {/* Trapezoid Collapse/Expand Handle on Right Border */}
        <button
          type="button"
          onClick={() => setIsObjectPanelCollapsed(!isObjectPanelCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-12 bg-slate-300 dark:bg-muted hover:bg-slate-400 dark:hover:bg-muted/80 text-foreground flex items-center justify-center cursor-pointer rounded-r-md shadow-md z-40 transition-colors border border-l-0 border-border"
          title={isObjectPanelCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          {isObjectPanelCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Top Navigation Strip */}
        <div className="h-[34px] bg-[#1e40af] text-white px-3 flex items-center justify-between shrink-0 rounded-t">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLeftActiveTab("object")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded transition-colors",
                leftActiveTab === "object" ? "bg-white/20 text-white font-bold" : "text-white/80 hover:text-white"
              )}
            >
              <Navigation className="w-3 h-3 rotate-45" />
              <span>Object</span>
            </button>

            <button
              type="button"
              onClick={() => setLeftActiveTab("driver")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded transition-colors",
                leftActiveTab === "driver" ? "bg-white/20 text-white font-bold" : "text-white/80 hover:text-white"
              )}
              title="Drivers"
            >
              <Users className="w-3 h-3" />
              {leftActiveTab === "driver" && <span>Driver</span>}
            </button>

            <button
              type="button"
              onClick={() => setLeftActiveTab("address")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded transition-colors",
                leftActiveTab === "address" ? "bg-white/20 text-white font-bold" : "text-white/80 hover:text-white"
              )}
              title="Address POIs"
            >
              <MapPin className="w-3 h-3" />
              {leftActiveTab === "address" && <span>Address</span>}
            </button>

            <button
              type="button"
              onClick={() => setLeftActiveTab("geofence")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded transition-colors",
                leftActiveTab === "geofence" ? "bg-white/20 text-white font-bold" : "text-white/80 hover:text-white"
              )}
              title="Geofences"
            >
              <Grid className="w-3 h-3" />
              {leftActiveTab === "geofence" && <span>Geofence</span>}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => {
                setTempColumnsConfig({ ...columnsConfig });
                setIsObjectListSettingsOpen(true);
                setIsDetailDrawerOpen(false);
              }}
              className="text-white/80 hover:text-white cursor-pointer"
              title="Object List Column Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TAB 1: OBJECT FLEET LIST */}
        {leftActiveTab === "object" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Status Summary Ribbon */}
            <div className="flex border-b border-border text-center text-[10px] font-semibold bg-white dark:bg-card shrink-0">
              <div onClick={() => setStatusFilter("Running")} className="flex-1 py-1.5 border-t-4 border-t-emerald-500 cursor-pointer hover:bg-slate-50">
                <div className="text-sm font-bold text-emerald-500">{counts.running}</div>
                <div className="text-[9px] text-muted-foreground font-normal">Running</div>
              </div>
              <div onClick={() => setStatusFilter("Idle")} className="flex-1 py-1.5 border-t-4 border-t-amber-400 cursor-pointer hover:bg-slate-50 border-l border-border/40">
                <div className="text-sm font-bold text-amber-500">{counts.idle}</div>
                <div className="text-[9px] text-muted-foreground font-normal">Idle</div>
              </div>
              <div onClick={() => setStatusFilter("Stopped")} className="flex-1 py-1.5 border-t-4 border-t-rose-500 cursor-pointer hover:bg-slate-50 border-l border-border/40">
                <div className="text-sm font-bold text-rose-500">{counts.stopped}</div>
                <div className="text-[9px] text-muted-foreground font-normal">Stopped</div>
              </div>
              <div onClick={() => setStatusFilter("Inactive")} className="flex-1 py-1.5 border-t-4 border-t-sky-500 cursor-pointer hover:bg-slate-50 border-l border-border/40">
                <div className="text-sm font-bold text-sky-500">{counts.inactive}</div>
                <div className="text-[9px] text-muted-foreground font-normal">Inactive</div>
              </div>
              <div className="flex-1 py-1.5 border-t-4 border-t-slate-300 border-l border-border/40">
                <div className="text-sm font-bold text-slate-400">{counts.nodata}</div>
                <div className="text-[9px] text-muted-foreground font-normal">NoData</div>
              </div>
              <div onClick={() => setStatusFilter("all")} className="flex-1 py-1.5 border-t-4 border-t-slate-400 cursor-pointer hover:bg-slate-50 border-l border-border/40 bg-slate-100/50">
                <div className="text-sm font-bold text-slate-600">{counts.total}</div>
                <div className="text-[9px] text-muted-foreground font-normal">Total</div>
              </div>
            </div>

            {/* Search and Action Strip */}
            <div className="p-2 border-b border-border flex items-center gap-2 bg-slate-50/50 dark:bg-muted/20">
              <input type="checkbox" defaultChecked className="rounded border-border w-3.5 h-3.5 text-[#2558c4]" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by IMEI, VIN, Registration, Object Model, SIM Number, etc."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-2 pr-6 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#2558c4]"
                />
                <Search className="w-3.5 h-3.5 absolute right-2 top-2 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <button type="button" className="p-1 hover:text-foreground" title="Refresh"><RotateCw className="w-3.5 h-3.5" /></button>
                <button type="button" className="p-1 hover:text-foreground" title="Target"><Crosshair className="w-3.5 h-3.5" /></button>
                <button type="button" className="p-1 hover:text-foreground" title="Filter"><Filter className="w-3.5 h-3.5" /></button>
                <button type="button" className="p-1 hover:text-foreground" title="Sort"><ArrowDownAZ className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="px-3 py-1 bg-slate-100/70 dark:bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-semibold flex items-center gap-1 cursor-pointer">
              <span>✕</span>
              <span>Collapse</span>
            </div>

            {/* 2-Tier Grouped Fleet List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60 text-xs">
              {["Mega Milk", "Weldone Logistics", "walen"].map((grpName) => {
                const grpVehicles = filteredVehicles.filter((v) => v.group === grpName);
                const isExpanded = !!expandedGroups[grpName];
                const isSubExpanded = !!expandedGroups[`${grpName}-sub`];
                if (grpVehicles.length === 0) return null;

                return (
                  <div key={grpName} className="space-y-0.5">
                    {/* Top Tier Group Header */}
                    <div 
                      onClick={() => toggleGroup(grpName)}
                      className="px-2 py-1.5 bg-slate-200/70 dark:bg-muted/70 flex items-center justify-between cursor-pointer font-bold text-foreground text-[11px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", !isExpanded && "-rotate-90")} />
                        <span>{grpName}</span>
                      </div>
                      <span className="text-muted-foreground font-semibold text-[10px]">[{grpVehicles.length}]</span>
                    </div>

                    {isExpanded && (
                      <div className="space-y-0.5">
                        {/* Sub-Tier Group Row */}
                        <div 
                          onClick={() => toggleGroup(`${grpName}-sub`)}
                          className="px-5 py-1 bg-slate-100 dark:bg-muted/40 flex items-center justify-between cursor-pointer font-bold text-muted-foreground text-[10px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <ChevronDown className={cn("w-3 h-3 transition-transform", !isSubExpanded && "-rotate-90")} />
                            <input type="checkbox" defaultChecked onClick={(e) => e.stopPropagation()} className="w-3 h-3 rounded" />
                            <span>{grpName}</span>
                          </div>
                          <span className="text-muted-foreground font-semibold">[{grpVehicles.length}]</span>
                        </div>

                        {isSubExpanded && (
                          <div className="divide-y divide-border/40">
                            {grpVehicles.map((v) => {
                              const isSelected = selectedVehicle.id === v.id;
                              return (
                                <div
                                  key={v.id}
                                  onClick={() => {
                                    setSelectedVehicle(v);
                                    setIsDetailDrawerOpen(true);
                                    setIsObjectListSettingsOpen(false);
                                  }}
                                  className={cn(                                    "p-2 pl-3 flex items-center gap-2 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-muted/40 border-b border-border/50",
                                    "odd:bg-slate-50 even:bg-white dark:odd:bg-card dark:even:bg-muted/10",
                                    isSelected && "bg-[#e2e8f0] odd:bg-[#e2e8f0] even:bg-[#e2e8f0] dark:bg-sky-950/60 dark:odd:bg-sky-950/60 dark:even:bg-sky-950/60"
                                  )}
                                >
                                  <input type="checkbox" defaultChecked onClick={(e) => e.stopPropagation()} className="w-3 h-3 rounded shrink-0" />
                                  
                                  <div className="shrink-0 flex items-center justify-center w-4 h-4 bg-blue-600 rounded-sm relative">
                                    <span
                                      className={cn(
                                        "w-2 h-2 rounded-full block",
                                        v.status === "Running" && "bg-emerald-400",
                                        v.status === "Stopped" && "bg-rose-500",
                                        v.status === "Idle" && "bg-amber-400",
                                        v.status === "Inactive" && "bg-sky-400"
                                      )}
                                    />
                                  </div>

                                  <div className="flex-1 flex items-center min-w-0 gap-2">
                                    {/* Name & Time Column */}
                                    <div className="flex flex-col min-w-[150px] max-w-[180px]">
                                      <div className="flex items-center gap-1">
                                        <span className="font-bold text-[#1a56db] dark:text-[#29a4ff] text-[11px] truncate">{v.name}</span>
                                      </div>
                                      <span className="text-[9px] text-muted-foreground">{v.time}</span>
                                    </div>

                                    {/* Speed Column */}
                                    <div className="w-[30px] shrink-0 text-center text-[10px] text-foreground font-semibold">
                                      {v.speed === 0 ? "0" : v.speed}
                                    </div>

                                    {/* Telemetry Icons Column */}
                                    <div className="flex items-center gap-1.5 shrink-0 w-[80px]">
                                      {columnsConfig.ignition && (
                                        <Key className={cn("w-3 h-3", v.ignition ? "text-emerald-600" : "text-rose-500")} />
                                      )}
                                      {columnsConfig.power && (
                                        <Battery className={cn("w-3 h-3", v.batteryLevel > 20 ? "text-emerald-600" : "text-rose-500")} />
                                      )}
                                      {columnsConfig.gsm && (
                                        <Signal className="w-3 h-3 text-emerald-600" />
                                      )}
                                      {columnsConfig.gps && (
                                        <Wifi className="w-3 h-3 text-emerald-600" />
                                      )}
                                      <Lock className="w-3 h-3 text-emerald-600" />
                                    </div>

                                    {/* Voltage Column */}
                                    <div className="w-[40px] shrink-0 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                      {columnsConfig.voltage && v.voltage}
                                    </div>

                                    {/* Address Column */}
                                    {columnsConfig.address && (
                                      <div 
                                        className="flex-1 min-w-[150px] text-[10px] text-muted-foreground truncate hover:text-[#2558c4] cursor-pointer"
                                        onMouseEnter={(e) => {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          setHoveredAddress({ id: v.id, text: v.fullAddress, top: rect.top, left: rect.right + 10 });
                                        }}
                                        onMouseLeave={() => setHoveredAddress(null)}
                                      >
                                        {v.address}
                                      </div>
                                    )}

                                    {/* Driver & Expiry Columns */}
                                    <div className="flex items-center gap-4 shrink-0 text-[10px] w-[50px] justify-end">
                                      {columnsConfig.driver && <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer">{v.driver}</span>}
                                      {columnsConfig.expiryDate && <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer">{v.expiryDate}</span>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
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
                  className="w-full pl-2 pr-6 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#2558c4]"
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
                    <div className="font-bold text-[#1a56db] dark:text-[#29a4ff]">Ntale Driver</div>
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
                    <div className="font-bold text-[#1a56db] dark:text-[#29a4ff]">Mawanda Driver</div>
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
                  className="w-full pl-2 pr-6 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#2558c4]"
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
                  className="w-full pl-2 pr-6 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#2558c4]"
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

      {/* FLOATING ADDRESS TOOLTIP ON HOVER */}
      {hoveredAddress && (
        <div 
          className="fixed z-50 bg-white dark:bg-card border border-border shadow-2xl p-2 rounded text-[11px] font-medium text-foreground max-w-[280px] pointer-events-none animate-in fade-in duration-100"
          style={{ top: `${hoveredAddress.top}px`, left: `${hoveredAddress.left}px` }}
        >
          {hoveredAddress.text}
        </div>
      )}

      {/* FLOATING EXPIRY DATE / DRIVER TOOLTIP */}
      {hoveredHeaderTip && (
        <div 
          className="fixed z-50 bg-slate-900 text-white border border-slate-700 shadow-xl px-2 py-1 rounded text-[10px] font-semibold pointer-events-none animate-in fade-in duration-100"
          style={{ top: `${hoveredHeaderTip.top}px`, left: `${hoveredHeaderTip.left}px` }}
        >
          {hoveredHeaderTip.text}
        </div>
      )}

      {/* 5. OBJECT LIST SETTINGS DRAWER (EXACT 100% PARITY WITH PRODUCTION MEDIA_1788366432773.PNG) */}
      {isObjectListSettingsOpen && (
        <div className="absolute top-2 right-12 bottom-2 z-30 w-[300px] bg-white dark:bg-card border border-border shadow-2xl rounded flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 text-xs select-none">
          {/* Header */}
          <div className="p-3 border-b border-border flex items-center justify-between font-bold text-foreground">
            <span className="text-sm">Object List</span>
            <button 
              type="button" 
              onClick={() => setIsObjectListSettingsOpen(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-2 border-b border-border flex items-center gap-2 bg-slate-50 dark:bg-muted/20">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search"
                value={settingsSearch}
                onChange={(e) => setSettingsSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#2558c4]"
              />
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-muted-foreground" />
            </div>
            <button 
              type="button" 
              onClick={() => setSettingsSearch("")}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Reset"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="text-[10px] text-muted-foreground italic leading-tight">
              *If no space available, remove some widgets to add new ones.
            </div>

            {/* Object Name Section */}
            <div className="space-y-1.5 border-b border-border pb-3">
              <div className="font-bold text-xs text-foreground">Object Name</div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                <input 
                  type="checkbox" 
                  checked={tempColumnsConfig.objectNumber} 
                  onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, objectNumber: e.target.checked })}
                  className="rounded text-[#2558c4] w-3.5 h-3.5" 
                />
                <span>Object Number</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                <input 
                  type="checkbox" 
                  checked={tempColumnsConfig.objectName} 
                  onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, objectName: e.target.checked })}
                  className="rounded text-[#2558c4] w-3.5 h-3.5" 
                />
                <span>Object Name</span>
              </label>
            </div>

            {/* Choose Columns Section */}
            <div className="space-y-2">
              <div className="font-bold text-xs text-foreground">Choose Columns</div>

              {/* Sensors Category */}
              <div className="border border-border rounded p-2 space-y-1.5 bg-slate-50/50 dark:bg-muted/10">
                <div className="flex items-center justify-between font-semibold text-xs text-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-[#2558c4] w-3.5 h-3.5" />
                    <span>Sensors</span>
                  </label>
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60 cursor-grab" />
                </div>

                <div className="pl-4 space-y-1 text-[11px] text-muted-foreground">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.ignition} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, ignition: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>Ignition</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.power} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, power: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>Power</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.gsm} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, gsm: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>GSM</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.gps} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, gps: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>GPS</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.ac} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, ac: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>Air Condition</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.sos} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, sos: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>SOS</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.immobilize} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, immobilize: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>Immobilize</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.voltage} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, voltage: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>External voltage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.obd} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, obd: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>OBD</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.passengerSeat} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, passengerSeat: e.target.checked })}
                      className="rounded text-[#2558c4] w-3 h-3" 
                    />
                    <span>Passenger Seat</span>
                  </label>
                </div>
              </div>

              {/* Address Category */}
              <div className="border border-border rounded p-2 space-y-1.5 bg-slate-50/50 dark:bg-muted/10">
                <div className="flex items-center justify-between font-semibold text-xs text-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.address} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, address: e.target.checked })}
                      className="rounded text-[#2558c4] w-3.5 h-3.5" 
                    />
                    <span>Address</span>
                  </label>
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60 cursor-grab" />
                </div>
              </div>

              {/* Driver Category */}
              <div className="border border-border rounded p-2 space-y-1.5 bg-slate-50/50 dark:bg-muted/10">
                <div className="flex items-center justify-between font-semibold text-xs text-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.driver} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, driver: e.target.checked })}
                      className="rounded text-[#2558c4] w-3.5 h-3.5" 
                    />
                    <span>Driver</span>
                  </label>
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60 cursor-grab" />
                </div>
              </div>

              {/* Expiry Date Category */}
              <div className="border border-border rounded p-2 space-y-1.5 bg-slate-50/50 dark:bg-muted/10">
                <div className="flex items-center justify-between font-semibold text-xs text-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.expiryDate} 
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, expiryDate: e.target.checked })}
                      className="rounded text-[#2558c4] w-3.5 h-3.5" 
                    />
                    <span>Expiry Date</span>
                  </label>
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60 cursor-grab" />
                </div>
              </div>

              {/* Object Activity Category */}
              <div className="border border-border rounded p-2 space-y-1.5 bg-slate-50/50 dark:bg-muted/10">
                <div className="flex items-center justify-between font-semibold text-xs text-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={tempColumnsConfig.objectActivity}
                      onChange={(e) => setTempColumnsConfig({ ...tempColumnsConfig, objectActivity: e.target.checked })}
                      className="rounded text-[#2558c4] w-3.5 h-3.5" 
                    />
                    <span>Object Activity</span>
                  </label>
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60 cursor-grab" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-2 border-t border-border bg-slate-50 dark:bg-muted/20 flex gap-2">
            <button 
              type="button" 
              onClick={() => {
                setColumnsConfig({ ...tempColumnsConfig });
                setIsObjectListSettingsOpen(false);
              }}
              className="flex-1 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded font-bold text-xs shadow transition-colors cursor-pointer"
            >
              Save
            </button>
            <button 
              type="button" 
              onClick={() => setIsObjectListSettingsOpen(false)}
              className="flex-1 py-1.5 bg-white dark:bg-card border border-border hover:bg-muted text-foreground rounded font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 6. RIGHT FLOATING VEHICLE DETAIL DRAWER (ALL 16 CARDS MATCHING PRODUCTION EXACTLY) */}
      {isDetailDrawerOpen && selectedVehicle && !isObjectListSettingsOpen && (
        <div className="absolute top-2 right-2 bottom-2 z-30 w-[320px] bg-white dark:bg-card border border-border shadow-2xl rounded flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 text-xs select-none">
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            
            {/* 1. Vehicle Title & Info */}
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="font-bold text-sm text-foreground">{selectedVehicle.plate}</div>
              <Info className="w-4 h-4 text-[#2558c4] dark:text-[#29a4ff] cursor-pointer" />
            </div>

            {/* 2. Vehicle 3D Render Image (Fuel Tanker White Truck) */}
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
                selectedVehicle.status === "Running" ? "bg-emerald-600" : selectedVehicle.status === "Idle" ? "bg-amber-500" : "bg-rose-600"
              )}>
                {selectedVehicle.status}
              </span>
              <span className="text-muted-foreground font-semibold text-[11px]">{selectedVehicle.duration}</span>
            </div>

            {/* 4. Current Trip & Odometer */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between items-center text-[11px] mt-1">
                <span className="text-muted-foreground">Current Trip</span>
                <span className="font-bold">72.89 km</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Odometer</span>
                <div className="flex gap-0.5">
                  {["0","0","9","2","7","2","2"].map((d, i) => (
                    <div key={i} className="w-4 h-5 flex items-center justify-center bg-white border border-border text-[10px] font-bold rounded-xs shadow-sm">
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Driver & Mobile */}
            <div className="text-[11px] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Driver</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">{selectedVehicle.driver}</span>
                  <Edit3 className="w-2.5 h-2.5 text-muted-foreground/60 hover:text-foreground cursor-pointer" />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile</span>
                <span className="text-foreground">{selectedVehicle.mobile}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5 text-[#2558c4] dark:text-[#29a4ff] font-semibold cursor-pointer">
                <span>More Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 6. Quick Action Icons (Outlined icons matching production) */}
            <div className="flex items-center justify-between px-2 pt-1 border-b border-border pb-3">
              <button className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4" /></button>
              <button className="text-blue-600 hover:text-blue-800"><Share2 className="w-4 h-4" /></button>
              <button className="text-blue-600 hover:text-blue-800"><Navigation className="w-4 h-4" /></button>
              <button className="text-blue-600 hover:text-blue-800"><ShieldAlert className="w-4 h-4" /></button>
              <button className="text-blue-600 hover:text-blue-800"><Users className="w-4 h-4" /></button>
              <button className="text-blue-600 hover:text-blue-800"><Compass className="w-4 h-4" /></button>
            </div>

            {/* 7. FUEL CARD - matching production layout */}
            <div className="border border-border rounded flex flex-col mt-3">
              <div className="flex items-center justify-between p-2 border-b border-border text-foreground font-bold text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Fuel</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 border border-blue-200 rounded text-blue-600 hover:bg-blue-50"><Car className="w-3 h-3" /></button>
                  <button className="p-1 border border-border rounded text-muted-foreground hover:bg-muted"><LineChart className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="p-3 flex flex-col items-center border-b border-border/50 bg-white">
                <div className="relative w-32 h-[72px] flex items-end justify-center">
                  {/* SVG Semi-circle gauge */}
                  <svg className="absolute top-0 w-full h-[64px]" viewBox="0 0 100 50">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 30 20" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 30 20 A 40 40 0 0 1 70 20" fill="none" stroke="#f59e0b" strokeWidth="8" />
                    <path d="M 70 20 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                    {/* Needle */}
                    <line x1="50" y1="50" x2="70" y2="25" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="4" fill="#0ea5e9" />
                  </svg>
                  <div className="w-full flex justify-between px-2 pb-1 relative z-10">
                    <span className="font-bold text-[10px] text-red-500">E</span>
                    <span className="font-bold text-[10px] text-emerald-500">F</span>
                  </div>
                </div>
                <div className="font-bold text-xs mt-2">134 liter</div>
              </div>
              
              <div className="p-2 space-y-1.5 text-[10px] border-b border-border/50">
                <div className="flex justify-between"><span className="text-muted-foreground">Tanks</span><span className="font-semibold">1</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Refill</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">1 (64 L)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Drain</span><span className="font-semibold">NA (0)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tank Capacity</span><span className="font-semibold">230.0 Liter</span></div>
              </div>

              <div className="p-2 space-y-1.5 text-[9px] text-muted-foreground">
                <div className="flex justify-between"><span>Consumption</span><span className="font-semibold text-foreground">Sensor: 56.91 liter | CAN: 0.00 liter</span></div>
                <div className="flex justify-between"><span>Carbon Emission</span><span className="font-semibold text-foreground">Sensor: 0.00 | CAN: NA</span></div>
                <div className="flex justify-between"><span>Waste</span><span className="font-semibold text-foreground">Pre-defined: 0 Liter</span></div>
              </div>
            </div>

            {/* 8. LOCATION CARD */}
            <div className="border border-border rounded overflow-hidden shadow-xs">
              <div className="bg-slate-100 dark:bg-muted/70 px-3 py-1.5 flex items-center justify-between font-bold text-xs text-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2558c4]" />
                  <span>Location</span>
                </div>
                <Compass className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-foreground" />
              </div>
              <div className="p-2.5 space-y-1.5 text-[11px]">
                <div className="text-muted-foreground leading-snug">{selectedVehicle.fullAddress}</div>
                <div className="font-mono text-[10px] font-bold text-[#2558c4] dark:text-[#29a4ff]">{selectedVehicle.lat}, {selectedVehicle.lng}</div>
              </div>
            </div>

            {/* 9. TODAY ACTIVITY CARD */}
            <div className="border border-border rounded overflow-hidden shadow-xs">
              <div className="bg-[#2558c4] text-white px-3 py-1.5 flex items-center justify-between font-bold text-xs">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Today Activity</span>
                </div>
                <Car className="w-3 h-3" />
              </div>
              <div className="p-2.5 space-y-2 text-[11px]">
                <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2 rounded flex justify-between">
                  <span className="text-muted-foreground text-xs font-semibold">Distance</span>
                  <span className="font-extrabold text-sm text-[#2558c4] dark:text-[#29a4ff]">{selectedVehicle.currentTrip}</span>
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

            {/* 10. FUEL CONSUMPTION CIRCLE */}
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

            {/* 11. PASSENGER SEAT DIAGRAM */}
            <div className="border border-border rounded overflow-hidden shadow-xs p-2.5 space-y-2">
              <div className="font-bold text-xs text-foreground flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-[#2558c4]" />
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

            {/* 12. RPM DIAL GAUGE */}
            <div className="border border-border rounded overflow-hidden shadow-xs p-2.5 space-y-2">
              <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-[#2558c4]" />
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

            {/* 13. REMINDER BELL CARD */}
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

            {/* 14. DOOR CARD */}
            <div className="border border-border rounded overflow-hidden shadow-xs">
              <div className="bg-slate-100 dark:bg-muted/70 px-3 py-1.5 flex items-center justify-between font-bold text-xs text-foreground">
                <div className="flex items-center gap-1.5">
                  <DoorClosed className="w-3.5 h-3.5 text-[#2558c4]" />
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
