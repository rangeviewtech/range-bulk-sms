/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  ArrowDownAZ,
  Map as MapIcon,
  Ruler,
  Route,
  Globe,
  PlusSquare,
  ChevronsRight,
  BarChart2,
  Droplet,
  Trash,
  UserCircle,
  UserSquare,
  Copy,
  ArrowDown,
  ArrowUp,
  Hash
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
  const [leftActiveTab, setLeftActiveTab] = React.useState<"object" | "events" | "places">("object");
  const [isObjectPanelCollapsed, setIsObjectPanelCollapsed] = React.useState(false);
  
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = React.useState(true);
  const [isObjectListSettingsOpen, setIsObjectListSettingsOpen] = React.useState(false);
  const [isTripInfoOpen, setIsTripInfoOpen] = React.useState(false); // Hidden by default

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
  const [mapLayerType, setMapLayerType] = React.useState<"osm" | "humanitarian" | "satellite">("osm");
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
        <div 
          id="map" 
          className="absolute top-0 bottom-0 right-0 left-0 z-0"
        >
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

      {/* TRIP INFORMATION PANEL (SIDEBAR) */}
      {isTripInfoOpen && (
        <div 
          id="trip_information_panel" 
          className="absolute top-0 bottom-0 z-[500] bg-white border-r border-[#d8d8d8] overflow-hidden flex flex-col transition-transform duration-300"
          style={{ left: isObjectPanelCollapsed ? "0" : "650px", width: "385px" }}
        >
          {/* Header */}
          <div id="trip_information_header" className="h-[30px] leading-[29px] text-center text-white font-bold bg-[#1a4291] shrink-0 relative">
            <div 
              className="absolute right-1 top-1 cursor-pointer p-1" 
              title="Close"
              onClick={() => setIsTripInfoOpen(false)}
            >
              <X className="w-4 h-4 text-white" />
            </div>
            Trip Information
            <div className="absolute right-8 top-1 cursor-pointer p-1" title="Print Trip Info">
              <Printer className="w-4 h-4 text-white" />
            </div>
          </div>
          
          {/* Body */}
          <div id="trip_information_body" className="flex-1 overflow-auto bg-white text-sm text-foreground">
            
            <div className="trip_group_date float-left w-full">
              
              {/* Date Header Sticky */}
              <div className="trip_information_data_date sticky top-0 z-[100] h-[30px] flex items-center justify-between px-[10px] bg-[#234292] text-white shadow-[0px_1px_2px_#d2d2d2] float-left w-full box-border">
                <div className="inline-box p-1 px-[5px] pl-0 w-[100px] box-border">
                  <span className="mr-[5px] text-white/90">28 Aug</span>
                  <span className="font-bold">2024</span>
                </div>
                <div className="inline-box p-1 px-[5px] w-[55px] box-border flex flex-col-reverse text-right">
                  <span className="font-bold">45 km</span>
                </div>
              </div>

              {/* Trip Cards Container */}
              <div className="trip_information_data float-left w-full relative">
                
                {/* Single Trip Card */}
                <div className="trip_information_data_details active float-left border border-[#d8d8d8] m-[5px] mt-[5px] box-border w-[calc(100%-10px)] bg-[#f0f8ff] rounded-[6px] shadow-[0px_0px_5px_#d8d8d8] cursor-pointer hover:bg-[#f0f8ff]">
                  
                  {/* Start / End Timeline */}
                  <div className="trip_start_end_info relative pl-[16px] pr-[16px] pt-[5px] pb-[7px]">
                    <div className="absolute top-[8px] bottom-[7px] left-[21px] w-0 border-l border-dashed border-[#222] bg-[#d4d4d4]" />
                    
                    <div className="trip_start flex items-start leading-[18px] mt-[10px] ml-0 relative pl-[8px]">
                      <div className="absolute left-0 top-[4px] z-10 w-[6px] h-[6px] rounded-full border-2 border-[#4CAF50] bg-[#4CAF50]" />
                      <div className="trip_time w-[85px] text-black pl-[10px] shrink-0 font-bold">10:00 AM</div>
                      <div className="trip_address text-[11px] text-[#373e48] w-[calc(100%-110px)]">123 Start Address, City</div>
                    </div>

                    <div className="trip_end flex items-start leading-[18px] mt-[10px] ml-0 relative pl-[8px]">
                      <div className="absolute left-0 top-[8px] bottom-0 w-[10px] bg-[#f0f8ff] z-[3] -ml-[2px]" />
                      <div className="absolute left-0 top-[4px] z-10 w-[6px] h-[6px] rounded-full border-2 border-[#FF5722] bg-[#FF5722]" />
                      <div className="trip_time w-[85px] text-black pl-[10px] shrink-0 font-bold">11:30 AM</div>
                      <div className="trip_address text-[11px] text-[#373e48] w-[calc(100%-110px)]">456 End Address, City</div>
                    </div>
                  </div>

                  <div className="trip_info_sperate w-full border-t border-[#c5c5c5] mb-[10px]"></div>

                  {/* Trip Stats */}
                  <div className="trip_information_data_information pb-[10px] float-left w-full px-[10px]">
                    <div className="trip_box w-[75px] inline-block">
                      <label className="block text-black text-[11px]">Distance</label>
                      <span className="trip-running-distance font-bold text-[11px]">45 km</span>
                    </div>
                    <div className="trip_box w-[75px] inline-block">
                      <label className="block text-black text-[11px]">Duration</label>
                      <span className="trip-running-dur text-[#007905] font-bold text-[11px]">1h 30m</span>
                    </div>
                    <div className="trip_box w-[75px] inline-block">
                      <label className="block text-black text-[11px]">Avg Speed</label>
                      <span className="trip-svg-speed text-[#116fe4] font-bold text-[11px]">30 km/h</span>
                    </div>
                  </div>

                </div>

                {/* Additional Trip Card (Inactive) */}
                <div className="trip_information_data_details float-left border border-[#d8d8d8] m-[5px] mt-[0px] box-border w-[calc(100%-10px)] bg-[#f3f3f3] rounded-[6px] cursor-pointer hover:bg-[#f0f8ff]">
                  
                  {/* Start / End Timeline */}
                  <div className="trip_start_end_info relative pl-[16px] pr-[16px] pt-[5px] pb-[7px]">
                    <div className="absolute top-[8px] bottom-[7px] left-[21px] w-0 border-l border-dashed border-[#222] bg-[#d4d4d4]" />
                    
                    <div className="trip_start flex items-start leading-[18px] mt-[10px] ml-0 relative pl-[8px]">
                      <div className="absolute left-0 top-[4px] z-10 w-[6px] h-[6px] rounded-full border-2 border-[#4CAF50] bg-[#4CAF50]" />
                      <div className="trip_time w-[85px] text-black pl-[10px] shrink-0 font-bold">12:00 PM</div>
                      <div className="trip_address text-[11px] text-[#373e48] w-[calc(100%-110px)]">456 End Address, City</div>
                    </div>

                    <div className="trip_end flex items-start leading-[18px] mt-[10px] ml-0 relative pl-[8px]">
                      <div className="absolute left-0 top-[8px] bottom-0 w-[10px] bg-[#f3f3f3] group-hover:bg-[#f0f8ff] z-[3] -ml-[2px]" />
                      <div className="absolute left-0 top-[4px] z-10 w-[6px] h-[6px] rounded-full border-2 border-[#FF5722] bg-[#FF5722]" />
                      <div className="trip_time w-[85px] text-black pl-[10px] shrink-0 font-bold">01:15 PM</div>
                      <div className="trip_address text-[11px] text-[#373e48] w-[calc(100%-110px)]">789 Final Destination, City</div>
                    </div>
                  </div>

                  <div className="trip_info_sperate w-full border-t border-[#c5c5c5] mb-[10px]"></div>

                  {/* Trip Stats */}
                  <div className="trip_information_data_information pb-[10px] float-left w-full px-[10px]">
                    <div className="trip_box w-[75px] inline-block">
                      <label className="block text-black text-[11px]">Distance</label>
                      <span className="trip-running-distance font-bold text-[11px]">25 km</span>
                    </div>
                    <div className="trip_box w-[75px] inline-block">
                      <label className="block text-black text-[11px]">Duration</label>
                      <span className="trip-running-dur text-[#007905] font-bold text-[11px]">1h 15m</span>
                    </div>
                    <div className="trip_box w-[75px] inline-block">
                      <label className="block text-black text-[11px]">Avg Speed</label>
                      <span className="trip-svg-speed text-[#116fe4] font-bold text-[11px]">20 km/h</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
          
          <div id="trip_information_graph_panel"></div>
        </div>
      )}

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
          "absolute top-[44px] bottom-3 z-30 flex flex-col justify-between items-end pointer-events-none transition-all duration-200",
          (isDetailDrawerOpen && selectedVehicle) ? "right-[242px]" : isObjectListSettingsOpen ? "right-[320px]" : "right-2"
        )}
      >
        <div className="flex flex-col items-center gap-2 pointer-events-auto">
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
              <div className="absolute right-9 top-6 bg-white dark:bg-card border border-border shadow-lg rounded overflow-hidden text-xs font-semibold w-56 z-50">
                <div className="bg-[#2558c4] text-white px-2 py-2 flex items-center gap-2">
                  <div className="cursor-pointer hover:bg-white/20 p-0.5 rounded" onClick={() => setShowLayerMenu(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </div>
                  <span className="font-bold">Select Map</span>
                </div>
                <div className="p-1.5 space-y-0.5 text-slate-700 dark:text-slate-300">
                  <div 
                    onClick={() => { setMapLayerType("osm"); setShowLayerMenu(false); }}
                    className={cn("px-2 py-1.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-muted flex items-center gap-2", mapLayerType === "osm" && "bg-sky-50 text-[#2558c4]")}
                  >
                    <input type="radio" checked={mapLayerType === "osm"} readOnly className="w-3.5 h-3.5" />
                    <span>Google Roadmap</span>
                  </div>
                  <div 
                    onClick={() => { setMapLayerType("satellite"); setShowLayerMenu(false); }}
                    className={cn("px-2 py-1.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-muted flex items-center gap-2", mapLayerType === "satellite" && "bg-sky-50 text-[#2558c4]")}
                  >
                    <input type="radio" checked={mapLayerType === "satellite"} readOnly className="w-3.5 h-3.5" />
                    <span>Google Satellite</span>
                  </div>
                  <div 
                    onClick={() => { setMapLayerType("humanitarian"); setShowLayerMenu(false); }}
                    className={cn("px-2 py-1.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-muted flex items-center gap-2", mapLayerType === "humanitarian" && "bg-sky-50 text-[#2558c4]")}
                  >
                    <input type="radio" checked={mapLayerType === "humanitarian"} readOnly className="w-3.5 h-3.5" />
                    <span>Google Hybrid</span>
                  </div>
                  <div 
                    onClick={() => { setShowLayerMenu(false); }}
                    className="px-2 py-1.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-muted flex items-center gap-2"
                  >
                    <input type="radio" checked={false} readOnly className="w-3.5 h-3.5" />
                    <span>Google Terrain</span>
                  </div>
                </div>
              </div>
            )}
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Object With Path"><Route className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Call"><Phone className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Share Location"><Share2 className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Nearest Object"><User className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="POIs"><Globe className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Measure Distance"><Ruler className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Center Target"><Crosshair className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 hover:bg-muted hover:text-foreground" title="Add POI"><PlusSquare className="w-3.5 h-3.5" /></button>
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
          "absolute top-0 bottom-0 left-0 z-40 w-[650px] bg-[#fdfdfd] border-r-[2px] border-[#a5a5a5] flex flex-col transition-transform duration-300",
          isObjectPanelCollapsed && "-translate-x-[650px]"
        )}
      >
        {/* Trapezoid Collapse/Expand Handle on Right Border */}
        <button
          type="button"
          onClick={() => setIsObjectPanelCollapsed(!isObjectPanelCollapsed)}
          className="absolute right-[-10px] top-[87px] w-[10px] h-[70px] bg-[#a5a5a5] flex items-center justify-center cursor-pointer z-[500] hover:bg-[#dddddd]"
          style={{ clipPath: "polygon(0 0, 100% 13%, 100% 85%, 0% 100%)" }}
          title={isObjectPanelCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          {isObjectPanelCollapsed ? (
            <ChevronRight className="w-3 h-3 text-white -ml-1" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-white -ml-1" />
          )}
        </button>

        {/* LEFT PANEL HEADER (Production Parity) */}
        <div className="h-[40px] bg-[#234292] text-white flex items-center justify-between shrink-0 rounded-t relative">
          <div className="flex items-center h-full px-2">
            <button className="p-1.5 hover:bg-[#2c4da5] rounded">
              <Filter className="w-3.5 h-3.5 text-white" />
            </button>
            <div className="flex items-center gap-1.5 px-2 font-semibold text-[13px] border-r border-[#2c4da5] h-full relative">
              <span className="left_panel_tab_title tracking-wide">Object</span>
              {/* Active Tab Indicator Triangle */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-white"></div>
            </div>
            <div className="flex items-center ml-1">
              <button className="p-1.5 hover:bg-[#2c4da5] rounded" title="User">
                <User className="w-3.5 h-3.5 text-white" />
              </button>
              <button className="p-1.5 hover:bg-[#2c4da5] rounded" title="Users">
                <Users className="w-3.5 h-3.5 text-white" />
              </button>
              <button className="p-1.5 hover:bg-[#2c4da5] rounded" title="Tags">
                <Hash className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
          <div className="h-full flex items-center pr-2">
            <button 
              type="button" 
              onClick={() => {
                setTempColumnsConfig({ ...columnsConfig });
                setIsObjectListSettingsOpen(true);
                setIsDetailDrawerOpen(false);
              }}
              className="p-1.5 hover:bg-[#2c4da5] rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* TAB 1: OBJECT FLEET LIST */}
        {leftActiveTab === "object" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Status Summary Ribbon */}
            <div className="flex text-center text-[10px] bg-white shrink-0 shadow-sm border-b border-border">
              <div onClick={() => setStatusFilter("Running")} className="flex-1 py-[3px] bg-[#e6f9e6] cursor-pointer hover:bg-[#d8f0d8] border-r border-white">
                <div className="font-bold text-[#4caf50]">{counts.running}</div>
                <div className="text-[#4caf50] mt-[-3px] scale-90">Running</div>
              </div>
              <div onClick={() => setStatusFilter("Idle")} className="flex-1 py-[3px] bg-[#fff3e0] cursor-pointer hover:bg-[#ffefc2] border-r border-white">
                <div className="font-bold text-[#ff9800]">{counts.idle}</div>
                <div className="text-[#ff9800] mt-[-3px] scale-90">Idle</div>
              </div>
              <div onClick={() => setStatusFilter("Stopped")} className="flex-1 py-[3px] bg-[#ffebee] cursor-pointer hover:bg-[#ffdfdf] border-r border-white">
                <div className="font-bold text-[#f44336]">{counts.stopped}</div>
                <div className="text-[#f44336] mt-[-3px] scale-90">Stopped</div>
              </div>
              <div onClick={() => setStatusFilter("Inactive")} className="flex-1 py-[3px] bg-[#e3f2fd] cursor-pointer hover:bg-[#d5ebff] border-r border-white">
                <div className="font-bold text-[#2196f3]">{counts.inactive}</div>
                <div className="text-[#2196f3] mt-[-3px] scale-90">Inactive</div>
              </div>
              <div className="flex-1 py-[3px] bg-[#f5f5f5] border-r border-white">
                <div className="font-bold text-[#9e9e9e]">{counts.nodata}</div>
                <div className="text-[#9e9e9e] mt-[-3px] scale-90">NoData</div>
              </div>
              <div onClick={() => setStatusFilter("all")} className="flex-1 py-[3px] bg-[#eceff1] cursor-pointer hover:bg-[#e0e0e0]">
                <div className="font-bold text-[#607d8b]">{counts.total}</div>
                <div className="text-[#607d8b] mt-[-3px] scale-90">Total</div>
              </div>
            </div>

            {/* Search and Action Strip */}
            <div className="px-2 py-1.5 border-b border-border flex items-center gap-2 bg-white">
              <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer accent-[#234292] m-0" defaultChecked />
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by IMEI, VIN, Registration, Object Model, SIM Number, etc."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-transparent bg-white text-foreground outline-none focus:border-[#2558c4] transition-colors"
                />
              </div>
              <div className="flex items-center text-slate-700">
                <button type="button" className="p-1 hover:text-[#2558c4] cursor-pointer" title="Search">
                  <Search className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:text-[#2558c4] cursor-pointer" title="Reload">
                  <RotateCw className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:text-[#2558c4] cursor-pointer" title="Target">
                  <Crosshair className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:text-[#2558c4] cursor-pointer" title="Filter">
                  <Filter className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:text-[#2558c4] cursor-pointer" title="Sort">
                  <ArrowDownAZ className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-3 py-1 bg-slate-100/70 dark:bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-semibold flex items-center gap-1 cursor-pointer">
              <span>✕</span>
              <span>Collapse</span>
            </div>

            {/* 2-Tier Grouped Fleet List */}
            <div className="flex-1 overflow-auto divide-y divide-border/60 text-xs">
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
                      className="px-2 py-1.5 bg-[#f1f5f9] dark:bg-muted/70 flex items-center justify-between cursor-pointer font-bold text-foreground text-[11px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", !isExpanded && "-rotate-90")} />
                        <input type="checkbox" defaultChecked onClick={(e) => e.stopPropagation()} className="w-3.5 h-3.5 rounded cursor-pointer" />
                        <span className="text-[#334155]">{grpName}</span>
                      </div>
                      <span className="text-[#475569] font-semibold text-[10px]">[{grpVehicles.length}]</span>
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
        {leftActiveTab === "events" && (
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

            <div className="flex-1 overflow-auto text-xs divide-y divide-border/50">
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



        {/* TAB 4: GEOFENCE */}
        {leftActiveTab === "places" && (
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
      <div 
        className={cn(
          "absolute top-[44px] bottom-0 z-40 w-[300px] bg-white dark:bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 text-xs select-none",
          isObjectListSettingsOpen ? "translate-x-0 right-0" : "translate-x-[120%] right-0"
        )}
      >
          {/* Header (styled like .ui-dialog-titlebar) */}
          <div className="h-[36px] px-4 flex items-center justify-between font-bold text-white bg-[#234292]">
            <span className="text-[14px]">Object List</span>
            <button 
              type="button" 
              onClick={() => setIsObjectListSettingsOpen(false)}
              className="text-white hover:text-gray-200 cursor-pointer p-1"
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

{/* 6. TOP RIGHT FLOATING TOOLBAR (Map Pin, Engine, Gear - Restored based on new snippet) */}
      <div className="absolute top-2 right-2 z-40 flex shadow-md rounded overflow-hidden h-[32px]">
        {/* Map Pin (Active/White) */}
        <button type="button" className="bg-white w-[40px] h-full flex items-center justify-center cursor-pointer hover:bg-slate-50">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#234292" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
            <path d="M8 22h8" />
          </svg>
        </button>
        {/* Engine (Dark Blue - WIDE) */}
        <button type="button" className="bg-[#234292] w-[120px] h-full flex items-center pl-3 cursor-pointer hover:bg-blue-900">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 4.5l-2 3H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2h5c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2h-3v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1.5z"/>
            <circle cx="16" cy="12" r="2" />
          </svg>
        </button>
        {/* Settings (Light Blue) */}
        <button type="button" className="bg-[#5b85d9] w-[40px] h-full flex items-center justify-center cursor-pointer hover:bg-blue-500">
          <Settings className="w-[16px] h-[16px] text-white" strokeWidth={2.5} />
        </button>
      </div>

{/* 7. RIGHT FLOATING VEHICLE DETAIL DRAWER (ALL 16 CARDS MATCHING PRODUCTION EXACTLY) */}
      {isDetailDrawerOpen && selectedVehicle && !isObjectListSettingsOpen && (
        <div 
          className={cn(
            "absolute top-[44px] bottom-0 right-0 z-30 w-[242px] bg-white dark:bg-card border-l border-border flex flex-col transition-transform duration-300",
            isDetailDrawerOpen ? "translate-x-0" : "translate-x-[120%]"
          )}
        >
          
          <div className="h-[36px] px-3 flex items-center justify-between font-bold text-foreground bg-white border-b border-border shrink-0">
            <div className="flex items-center gap-1.5 text-[13px]">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{selectedVehicle.plate}</span>
            </div>
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-[#234292] cursor-pointer" />
              <button 
                type="button" 
                onClick={() => setIsDetailDrawerOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            
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
                <span className="font-bold">45.66 km</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Odometer</span>
                <div className="flex gap-[1px]">
                  {["0","0","9","2","7","8"].map((d, i) => (
                    <div key={i} className="w-[14px] h-[18px] flex items-center justify-center bg-[#f0f0f0] border border-[#a5a5a5] text-[10px] font-bold text-[#444]">
                      {d}
                    </div>
                  ))}
                  <div className="w-[14px] h-[18px] flex items-center justify-center bg-white border border-[#a5a5a5] text-[10px] font-bold text-[#444] ml-[2px]">
                    7
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Driver & Mobile */}
            <div className="text-[11px] space-y-1 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Driver</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">--</span>
                  <Edit3 className="w-2.5 h-2.5 text-muted-foreground/60 hover:text-foreground cursor-pointer" />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile</span>
                <span className="text-foreground">--</span>
              </div>
              <div className="flex justify-between items-center pt-0.5 text-[#2558c4] dark:text-[#29a4ff] font-semibold cursor-pointer">
                <span>More Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 6. Quick Action Icons (Outlined icons matching production) */}
            <div className="flex items-center justify-between px-2 pt-1 border-b border-border pb-3">
              <button className="text-[#3970ca] hover:text-blue-800"><Eye className="w-[15px] h-[15px]" strokeWidth={2.5} /></button>
              <button className="text-[#3970ca] hover:text-blue-800"><Share2 className="w-[15px] h-[15px]" strokeWidth={2.5} /></button>
              <button className="text-[#3970ca] hover:text-blue-800"><Navigation className="w-[15px] h-[15px]" strokeWidth={2.5} /></button>
              <button className="text-[#3970ca] hover:text-blue-800"><ShieldAlert className="w-[15px] h-[15px]" strokeWidth={2.5} /></button>
              <button className="text-[#3970ca] hover:text-blue-800"><Users className="w-[15px] h-[15px]" strokeWidth={2.5} /></button>
              <button className="text-[#3970ca] hover:text-blue-800"><Compass className="w-[15px] h-[15px]" strokeWidth={2.5} /></button>
            </div>

            {/* 7. FUEL CARD - matching production layout exactly */}
            <div className="border border-border rounded shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center justify-between font-bold text-xs border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-[#3970ca]" />
                  <span>Fuel</span>
                </div>
              </div>
              <div className="p-2 pb-3 border-b border-border text-center relative">
                {/* Truck and Thermometer Icons */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[#3970ca]">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 7h-3V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a3 3 0 0 0 6 0h2a3 3 0 0 0 6 0h2v-4l-2-7zM7 18a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm11 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm-1-8h3l1.5 5H17z" />
                  </svg>
                  <div className="w-[1px] h-[14px] bg-slate-300"></div>
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                  </svg>
                </div>

                {/* Gauge Background */}
                <div className="relative w-40 h-[70px] mx-auto mt-6">
                  <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                    {/* Blue Arc (E to 1/2) */}
                    <path d="M 10 50 A 40 40 0 0 1 50 10" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
                    {/* Green Arc (1/2 to F) */}
                    <path d="M 50 10 A 40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
                    
                    {/* Tick marks */}
                    <line x1="10" y1="50" x2="15" y2="50" stroke="#ef4444" strokeWidth="2" />
                    <line x1="50" y1="10" x2="50" y2="15" stroke="#eab308" strokeWidth="2" />
                    <line x1="90" y1="50" x2="85" y2="50" stroke="#22c55e" strokeWidth="2" />

                    {/* Labels */}
                    <text x="5" y="58" fontSize="7" fill="#ef4444" fontWeight="bold">E</text>
                    <text x="46" y="5" fontSize="7" fill="#eab308" fontWeight="bold">1/2</text>
                    <text x="92" y="58" fontSize="7" fill="#22c55e" fontWeight="bold">F</text>

                    {/* Needle pointing at ~40% (93/230) */}
                    <line x1="50" y1="50" x2="35" y2="25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="3" fill="#94a3b8" />
                  </svg>

                  {/* Gas Pump Icon inside Gauge */}
                  <div className="absolute left-[50%] bottom-1 -translate-x-[50%]">
                    <Fuel className="w-4 h-4 text-[#eab308]" />
                  </div>
                </div>
                <div className="text-[11px] font-bold mt-1">93 liter</div>
              </div>
              
              <div className="p-2 space-y-1 text-[10px] border-b border-border">
                <div className="flex justify-between border-b border-border/50 pb-1"><span className="text-muted-foreground">Tanks</span><span className="font-bold text-[#2558c4]">1</span></div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Refill</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block">1</span>
                    <span className="font-bold text-emerald-600">64 L</span>
                  </div>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Drain</span>
                  <div className="text-right">
                    <span className="font-bold text-muted-foreground block">NA</span>
                    <span className="font-bold text-rose-500">0</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tank Capacity</span>
                  <span className="font-bold text-foreground">230.0 liter</span>
                </div>
              </div>

              <div className="p-2 space-y-3 text-[10px]">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 font-bold"><Droplet className="w-3.5 h-3.5 text-[#2558c4]" /> Consumption</div>
                  <div className="flex justify-between text-muted-foreground"><span className="w-1/2">Sensor</span><span className="w-1/2 text-right">CAN</span></div>
                  <div className="flex justify-between font-bold text-foreground"><span className="w-1/2">56.91 liter</span><span className="w-1/2 text-right">0.00 liter</span></div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 font-bold"><Cloud className="w-3.5 h-3.5 text-[#2558c4]" /> Carbon Emission</div>
                  <div className="flex justify-between text-muted-foreground"><span className="w-1/2">Sensor</span><span className="w-1/2 text-right">CAN</span></div>
                  <div className="flex justify-between font-bold text-foreground"><span className="w-1/2">0.00</span><span className="w-1/2 text-right">NA</span></div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 font-bold"><Trash className="w-3.5 h-3.5 text-[#2558c4]" /> Waste <Info className="w-3 h-3 text-muted-foreground inline" /></div>
                  <div className="text-muted-foreground">Pre-defined</div>
                  <div className="font-bold text-foreground">6 liter</div>
                  <div className="text-right text-muted-foreground mt-1">Due to 3 hrs idling</div>
                  <div className="flex justify-between mt-3 text-muted-foreground"><span>Remaining</span><span className="font-bold text-foreground">0 km</span></div>
                  <div className="flex justify-between"><span>Updated</span><span className="font-bold text-foreground">02-09-2026 07:36 PM</span></div>
                </div>
              </div>
            </div>

            {/* 8. LOCATION CARD */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center justify-between font-bold text-xs border-b border-border">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Location</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-foreground" />
                  <Smartphone className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-foreground" />
                </div>
              </div>
              <div className="p-3 text-[10px] space-y-2">
                <div className="text-muted-foreground leading-relaxed">{selectedVehicle.fullAddress || "Mbarara Masaka Road,Pida,Lwengo, Uganda (SE)"}</div>
                <div className="font-bold text-muted-foreground">{selectedVehicle.lat || "-0.38633"}, {selectedVehicle.lng || "31.3166933"}</div>
                <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-muted-foreground">
                  <UserCircle className="w-4 h-4" />
                  <span>0°</span>
                </div>
              </div>
            </div>

            {/* 9. TODAY ACTIVITY */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center justify-between font-bold text-xs border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Today Activity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-foreground" />
                  <Car className="w-3 h-3 text-[#2558c4]" />
                </div>
              </div>
              <div className="p-2 space-y-2 text-[10px]">
                <div className="flex justify-between items-center border-b border-border pb-1">
                  <span className="font-bold text-sm">313 km</span>
                  <Car className="w-6 h-6 text-[#2558c4]" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Running</span><span className="font-bold text-emerald-600">08:19 hrs</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Idle</span><span className="font-bold text-amber-500">03:16 hrs</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Stop</span><span className="font-bold text-rose-500">08:02 hrs</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Inactive</span><span className="font-bold text-[#2558c4]">00:00 hrs</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Work Hour</span><span className="font-bold text-foreground">NA</span></div>
                </div>
                <div className="pt-2 border-t border-border space-y-2">
                  <div>
                    <div className="flex justify-between"><span className="font-bold text-emerald-600">Working Start</span><span className="font-bold">12:00 AM</span></div>
                    <div className="text-muted-foreground leading-tight mt-0.5">Albert Cook Road,Lungujja,Mengo,Ruba... Uganda (SE)</div>
                  </div>
                  <div>
                    <div className="flex justify-between"><span className="font-bold text-rose-500">Last Stop</span><span className="font-bold text-rose-500">07:18 PM</span></div>
                    <div className="text-muted-foreground leading-tight mt-0.5">Bigusha, Kiruhura, Uganda (SE)</div>
                  </div>
                  <div className="text-center pt-1"><button className="text-[#2558c4] font-bold flex items-center justify-center gap-1 w-full"><LineChart className="w-3 h-3" /> Show Log</button></div>
                </div>
              </div>
            </div>

            {/* 10. SPEED */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-border">
                <Gauge className="w-3.5 h-3.5" />
                <span>Speed</span>
              </div>
              <div className="p-3">
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-muted-foreground">Average Speed</span><span className="font-bold text-[#2558c4]">38 km/h</span>
                </div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-muted-foreground">Max Speed</span><span className="font-bold text-rose-500">108 km/h</span>
                </div>
                <div className="relative w-full h-[60px] flex justify-center items-end mt-4">
                  {/* Gauge half circle */}
                  <div className="w-32 h-16 bg-sky-100 rounded-t-full relative overflow-hidden flex items-end justify-center">
                    <div className="w-24 h-12 bg-white rounded-t-full"></div>
                    {/* Needle */}
                    <div className="absolute bottom-0 w-1 h-14 bg-[#2558c4] origin-bottom transform rotate-[25deg]"></div>
                    <div className="absolute bottom-[-4px] w-3 h-3 bg-[#2558c4] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 11. ALERT */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-border">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Alert</span>
              </div>
              <div className="p-2 text-[10px] flex justify-between">
                <span className="text-muted-foreground">Total</span><span className="font-bold">0</span>
              </div>
              <div className="border-t border-border p-2 text-center">
                <button className="text-[#2558c4] font-bold flex items-center justify-center gap-1 w-full"><Plus className="w-3 h-3" /> Alert</button>
              </div>
            </div>

            {/* 12. NO TEMPERATURE SENSOR */}
            <div className="bg-[#1e293b] text-white rounded overflow-hidden shadow-sm mt-3 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                <span className="text-xs font-semibold">No Temperature<br/>Sensor Found</span>
              </div>
              {/* Sun/cloud decoration */}
              <div className="relative w-8 h-8 opacity-50">
                <div className="absolute inset-0 bg-yellow-500 rounded-full blur-sm"></div>
              </div>
            </div>

            {/* 13. NEAR BY */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-border">
                <UserCircle className="w-3.5 h-3.5" />
                <span>Near By</span>
              </div>
            </div>

            {/* 14. GPS DEVICE PARAMETER */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-border">
                <MapPin className="w-3.5 h-3.5" />
                <span>GPS Device Parameter</span>
              </div>
              <div className="p-2 space-y-1.5 text-[10px] bg-white">
                <div className="flex justify-between"><span className="text-muted-foreground">Axis X</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Axis Y</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Axis Z</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SD status</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">BT Status</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GNSS Status</span><span className="font-semibold">1</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Int Battery</span><span className="font-semibold">4.04</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Satellite</span><span className="font-semibold">13</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ext Power</span><span className="font-semibold">28.3 Voltage</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Int Battery %</span><span className="font-semibold">0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Movement</span><span className="font-semibold">ON</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Angle</span><span className="font-semibold">123</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sleep Mode</span><span className="font-semibold">OFF</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Altitude</span><span className="font-semibold">1257</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">HDOP</span><span className="font-semibold">6</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PDOP</span><span className="font-semibold">11</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IMSI</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ICCID</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ICCID-2</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">MAC</span><span className="font-semibold">--</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Extd Battery</span><span className="font-semibold">NA</span></div>
              </div>
            </div>

            {/* 15. NETWORK PARAMETER */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-border">
                <Globe className="w-3.5 h-3.5" />
                <span>Network Parameter</span>
              </div>
              <div className="p-2 space-y-1.5 text-[10px] bg-white">
                <div className="flex justify-between"><span className="text-muted-foreground">GSM</span><span className="font-semibold">4</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cell Id</span><span className="font-semibold">0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Network Mode</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Network Type</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Operator</span><span className="font-semibold">Airtel</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PMN Code</span><span className="font-semibold">UGACE</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">OPCO Code</span><span className="font-semibold">AIRUG</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span className="font-semibold">Uganda</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zone</span><span className="font-semibold">Zone 41</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Network Rank</span><span className="font-semibold">Secondary</span></div>
              </div>
            </div>

            {/* 16. IMMOBILIZE BLOCK */}
            <div className="bg-[#6366f1] text-white rounded shadow-sm flex mt-3">
              <div className="bg-[#4f46e5]/40 w-10 flex items-center justify-center border-r border-indigo-400/30 shrink-0">
                <ShieldAlert className="w-5 h-5 text-indigo-100" />
              </div>
              <div className="flex-1 py-1 px-3 text-xs font-semibold leading-relaxed">
                <div className="flex justify-between items-center cursor-pointer hover:text-indigo-100 py-0.5 border-b border-indigo-400/20"><span>Immobilize</span><ChevronRight className="w-3 h-3" /></div>
                <div className="flex justify-between items-center cursor-pointer hover:text-indigo-100 py-0.5 border-b border-indigo-400/20"><span>Door</span><ChevronRight className="w-3 h-3" /></div>
                <div className="flex justify-between items-center cursor-pointer hover:text-indigo-100 py-0.5 border-b border-indigo-400/20"><span>Boot</span><ChevronRight className="w-3 h-3" /></div>
                <div className="flex justify-between items-center cursor-pointer hover:text-indigo-100 py-0.5"><span>Buzzer</span><ChevronRight className="w-3 h-3" /></div>
              </div>
            </div>

            {/* 17. OBJECT INFORMATION */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3">
              <div className="bg-[#2558c4] text-white px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Object Information</span>
              </div>
              <div className="p-2 space-y-1.5 text-[10px] bg-white">
                <div className="flex justify-between"><span className="text-muted-foreground">Purchase Date</span><span className="font-semibold text-foreground">--</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Purchase Amount</span><span className="font-semibold text-foreground">0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Seat Capacity</span><span className="font-semibold text-foreground">0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Capacity</span><span className="font-semibold text-foreground">0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Company Average</span><span className="font-semibold text-foreground">0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Object Brand</span><span className="font-semibold text-foreground">Ashok Leyland</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Permit Name</span><span className="font-semibold text-foreground">--</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Object Model</span><span className="font-semibold text-foreground">111/E4</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Age</span><span className="font-semibold text-foreground">0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">VIN(Chassis) Number</span><span className="font-semibold text-foreground">--</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Engine No.</span><span className="font-semibold text-foreground">--</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Object Category</span><span className="font-semibold text-foreground">movable</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fuel Type</span><span className="font-semibold text-foreground">--Select--</span></div>
              </div>
            </div>

            {/* 18. DOCUMENTS */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-border">
                <FileText className="w-3.5 h-3.5" />
                <span>Documents</span>
              </div>
              <div className="p-4 text-center text-xs text-muted-foreground">
                No Record Found
              </div>
              <div className="border-t border-border p-2">
                <button className="text-[#2558c4] w-full flex items-center justify-center gap-1 text-xs font-semibold hover:bg-slate-50 py-1 rounded">
                  <Plus className="w-3 h-3" /> Document
                </button>
              </div>
            </div>

            {/* 19. EXPENSE */}
            <div className="bg-[#06b6d4] text-white rounded overflow-hidden shadow-sm mt-3">
              <div className="p-3 flex items-center justify-between border-b border-cyan-400">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-8 h-8 text-yellow-300" />
                  <div className="text-xs font-bold leading-tight">Expense (last 7<br/>days)</div>
                </div>
                <div className="font-bold text-lg">USh0</div>
              </div>
              <div className="flex text-xs font-bold bg-[#0891b2]">
                <button className="flex-1 py-2 flex items-center justify-center gap-1 border-r border-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-3.5 h-3.5" /> Expense
                </button>
                <button className="flex-1 py-2 flex items-center justify-center gap-1 hover:bg-cyan-700">
                  <History className="w-3.5 h-3.5" /> History
                </button>
              </div>
            </div>

            {/* 20. GPS DEVICE INFO */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-border">
                <Wrench className="w-3.5 h-3.5" />
                <span>GPS Device Information</span>
              </div>
              <div className="p-3 border-b border-border">
                <div className="border border-[#2558c4] text-[#2558c4] font-bold p-1 text-xs rounded w-10 text-center">1</div>
              </div>
              <div className="p-2 space-y-1.5 text-[10px] bg-white">
                <div className="flex justify-between"><span className="text-muted-foreground">Device</span><span className="font-semibold text-foreground">FMB125</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Device Status</span><span className="font-semibold text-emerald-600">Connected</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last Date</span><div className="text-right font-semibold text-foreground"><div>6 Seconds ago</div><div className="text-muted-foreground font-normal">03-09-2026 12:13 AM</div></div></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IMEI</span><span className="font-semibold text-foreground">357073295191353</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Installation Date</span><span className="font-semibold text-foreground">--</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Warranty</span><span className="font-semibold text-foreground">0.0</span></div>
              </div>
            </div>

            {/* 21. DRIVER INFORMATION */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-[#3b82f6] text-white">
              <div className="px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-blue-400">
                <UserSquare className="w-3.5 h-3.5" />
                <span>Driver Information</span>
              </div>
              <div className="p-2 space-y-1.5 text-[10px] bg-white text-slate-800">
                <div className="flex justify-between"><span className="text-muted-foreground">Driver Number</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Age</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Driving Experience</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">License Available</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">License To Drive</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">License Expiry</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Life Ins. Expiry</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Mediclaim Expiry</span><span className="font-semibold">NA</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tanga ...</span><span className="font-semibold">NA</span></div>
              </div>
            </div>

            {/* 22. PASSENGER SEAT */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-[#3b82f6] text-white px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-blue-400">
                <Armchair className="w-3.5 h-3.5" />
                <span>Passenger Seat</span>
              </div>
              <div className="p-3 text-[10px] flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex gap-4 font-semibold text-muted-foreground">
                    <span>Occupied</span>
                    <span>Vacant</span>
                  </div>
                  <div className="flex gap-10 font-bold text-lg">
                    <span className="text-emerald-500">0</span>
                    <span className="text-red-500">0</span>
                  </div>
                </div>
                {/* Visual for seat */}
                <div className="w-16 h-20 bg-slate-100 rounded-md border border-slate-200 flex flex-col items-center justify-around py-1">
                   <div className="w-4 h-3 bg-slate-300 rounded-sm"></div>
                   <div className="flex gap-2">
                     <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                     <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                   </div>
                   <div className="flex gap-2">
                     <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                     <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                   </div>
                </div>
              </div>
            </div>

            {/* 23. RPM */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-border">
                <Gauge className="w-3.5 h-3.5 text-[#2558c4]" />
                <span>RPM</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-[10px] text-muted-foreground font-semibold">0</div>
                      <div className="text-xs font-bold text-emerald-600">RPM</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUp className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="text-[10px] text-muted-foreground font-semibold">Highest 0</div>
                      <div className="text-xs font-bold text-red-600">RPM</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative w-24 h-[48px] flex items-end justify-center">
                  <svg className="absolute top-0 w-full h-full" viewBox="0 0 100 50">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                    <line x1="50" y1="50" x2="15" y2="40" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="4" fill="#0ea5e9" />
                  </svg>
                  <div className="absolute bottom-0 font-bold text-xs">0</div>
                </div>
              </div>
            </div>

            {/* 24. REMINDER */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-rose-50 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-rose-200 text-rose-600">
                <Bell className="w-3.5 h-3.5" />
                <span>Reminder</span>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5 text-[10px] font-semibold">
                    <div className="flex justify-between w-24"><span className="text-rose-500">Due</span><span className="text-rose-500">0</span></div>
                    <div className="flex justify-between w-24"><span className="text-rose-500">Overdue</span><span className="text-rose-500">0</span></div>
                    <div className="flex justify-between w-24"><span className="text-emerald-500">Upcoming</span><span className="text-foreground">0</span></div>
                  </div>
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
                    <Bell className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-3">
                  <button className="w-full bg-rose-500 hover:bg-rose-600 text-white py-1.5 rounded text-xs font-semibold">
                    + Add Reminder
                  </button>
                </div>
              </div>
            </div>

            {/* 25. DOOR */}
            <div className="border border-border rounded overflow-hidden shadow-sm mt-3 bg-white">
              <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs border-b border-border">
                <DoorClosed className="w-3.5 h-3.5 text-[#2558c4]" />
                <span>Door</span>
              </div>
              <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
                No Record Found
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
