"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Settings, 
  Plus, 
  X, 
  Eye, 
  Pin, 
  Maximize2, 
  FileText, 
  GripVertical, 
  RotateCw, 
  Check, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Radio,
  SlidersHorizontal,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

// Vehicle Objects hierarchy for Filter Drawer
interface VehicleGroup {
  name: string;
  count: number;
  vehicles: Array<{ id: string; name: string; type: string }>;
}

const VEHICLE_GROUPS_DATA: VehicleGroup[] = [
  {
    name: "Mega Milk",
    count: 6,
    vehicles: [
      { id: "UA-347AP", name: "UA 347AP", type: "Truck" },
      { id: "UA-497EP", name: "UA 497EP", type: "Truck" },
      { id: "UA-498EP", name: "UA 498EP", type: "Truck" },
      { id: "UBH-279N", name: "UBH 279N", type: "Truck" },
      { id: "UBL-090W", name: "UBL 090W", type: "Truck" },
      { id: "UBN-3867X", name: "UBN 3867X", type: "Truck" },
    ],
  },
  {
    name: "Weldone Logistics",
    count: 3,
    vehicles: [
      { id: "UBM-755K", name: "UBM 755K", type: "Truck" },
      { id: "UBP-004L", name: "UBP 004L", type: "Truck" },
      { id: "UBQ-255H", name: "UBQ 255H", type: "Crane" },
    ],
  },
  {
    name: "walen",
    count: 1,
    vehicles: [
      { id: "UBH-168K", name: "UBH 168K", type: "Sinotruck" },
    ],
  },
];

// All available widgets configuration
interface WidgetConfig {
  id: string;
  title: string;
  category: "Activity" | "Log" | "E-Lock" | "CRM" | "Technician" | "Tariff";
  defaultChecked: boolean;
}

const ALL_WIDGETS: WidgetConfig[] = [
  // Activity
  { id: "fleet_status", title: "Fleet Status", category: "Activity", defaultChecked: true },
  { id: "model_wise", title: "Model wise Devices", category: "Activity", defaultChecked: true },
  { id: "brand_model", title: "Object Brand Model", category: "Activity", defaultChecked: true },
  { id: "web_mobile", title: "Web vs Mobile User", category: "Activity", defaultChecked: true },
  { id: "app_usage", title: "Application Usage", category: "Activity", defaultChecked: true },
  { id: "devices_project", title: "Devices vs Project", category: "Activity", defaultChecked: true },
  { id: "alert_summary", title: "Alert", category: "Activity", defaultChecked: true },
  { id: "immobilize", title: "Immobilize", category: "Activity", defaultChecked: true },
  { id: "immobilize_status", title: "Immobilize Status", category: "Activity", defaultChecked: true },
  { id: "object_group", title: "Object Group", category: "Activity", defaultChecked: false },
  { id: "object_type", title: "Object Type", category: "Activity", defaultChecked: false },

  // Log
  { id: "inactive_devices", title: "Inactive Devices", category: "Log", defaultChecked: true },
  { id: "faulty_devices", title: "Faulty Devices", category: "Log", defaultChecked: true },
  { id: "sms_log", title: "SMS Log", category: "Log", defaultChecked: true },
  { id: "email_log", title: "Email Log", category: "Log", defaultChecked: true },
  { id: "violation_log", title: "Violation Log", category: "Log", defaultChecked: true },
  { id: "schedule_status", title: "Schedule Report Status", category: "Log", defaultChecked: true },
  { id: "data_frequency", title: "Data Frequency", category: "Log", defaultChecked: true },

  // E-Lock
  { id: "active_elock", title: "Active E-Lock Status", category: "E-Lock", defaultChecked: false },

  // CRM
  { id: "open_closed_tickets", title: "Open vs Closed Tickets", category: "CRM", defaultChecked: true },
  { id: "tickets_priority", title: "Tickets by Priority", category: "CRM", defaultChecked: true },
  { id: "tickets_user", title: "Tickets by User", category: "CRM", defaultChecked: true },
  { id: "avg_resolution", title: "Average Resolution Time", category: "CRM", defaultChecked: true },
  { id: "ticket_trend", title: "Ticket Trend", category: "CRM", defaultChecked: true },
  { id: "pending_tickets_aging", title: "Pending Tickets Aging", category: "CRM", defaultChecked: true },

  // Technician
  { id: "task_status", title: "Task Status", category: "Technician", defaultChecked: true },
  { id: "category_status", title: "Category Wise Status", category: "Technician", defaultChecked: true },
  { id: "top_technicians", title: "Top Five Technician", category: "Technician", defaultChecked: true },
  { id: "category_task", title: "Category Wise Task", category: "Technician", defaultChecked: true },

  // Tariff
  { id: "tariff", title: "Tariff", category: "Tariff", defaultChecked: true },
];

export default function DashboardPage() {
  // Active Tab
  const [activeTab, setActiveTab] = React.useState("Overview");
  
  // Drawers
  const [isWidgetDrawerOpen, setIsWidgetDrawerOpen] = React.useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);

  // Selected Widgets State
  const [enabledWidgets, setEnabledWidgets] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_WIDGETS.forEach((w) => {
      initial[w.id] = w.defaultChecked;
    });
    return initial;
  });

  // Selected Vehicles Filter State
  const [selectedVehicles, setSelectedVehicles] = React.useState<Record<string, boolean>>({
    "UA-347AP": true,
    "UA-497EP": true,
    "UA-498EP": true,
    "UBH-279N": true,
    "UBL-090W": true,
    "UBN-3867X": true,
    "UBM-755K": true,
    "UBP-004L": true,
    "UBQ-255H": true,
    "UBH-168K": true,
  });

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    "Mega Milk": true,
    "Weldone Logistics": true,
    "walen": true,
  });

  const [vehicleSearch, setVehicleSearch] = React.useState("");

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Toggle vehicle selection
  const toggleVehicle = (id: string) => {
    setSelectedVehicles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle group vehicles
  const toggleAllInGroup = (group: VehicleGroup, checked: boolean) => {
    const updated = { ...selectedVehicles };
    group.vehicles.forEach((v) => {
      updated[v.id] = checked;
    });
    setSelectedVehicles(updated);
  };

  // Widget drawer categories
  const categories = ["Activity", "Log", "E-Lock", "CRM", "Technician", "Tariff"] as const;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f1f3f7] dark:bg-background text-foreground select-none relative overflow-x-hidden font-sans">
      
      {/* 1. TOP BLUE BANNER (Exact #1542b7, 40px height matching live Trakzee) */}
      <div className="h-[40px] bg-[#1542b7] text-white flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-2">
          <h1 className="text-[14px] font-semibold tracking-wide">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Universal Search */}
          <button 
            type="button"
            className="p-1 hover:text-[#29a4ff] transition-colors cursor-pointer"
            title="Search Dashboard"
          >
            <Search className="w-[17px] h-[17px]" />
          </button>

          {/* Filter Funnel Icon with indicator */}
          <button
            type="button"
            onClick={() => {
              setIsFilterDrawerOpen((prev) => !prev);
              setIsWidgetDrawerOpen(false);
            }}
            className={cn(
              "p-1 hover:text-[#29a4ff] transition-colors cursor-pointer relative",
              isFilterDrawerOpen && "text-[#29a4ff]"
            )}
            title="Filter Objects"
          >
            <Filter className="w-[17px] h-[17px]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#29a4ff] rounded-full" />
          </button>
        </div>
      </div>

      {/* 2. SUB-HEADER TABS BAR (Overview 28, +, Gear) */}
      <div className="h-[38px] bg-white dark:bg-card border-b border-border flex items-center justify-between px-4 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)] z-10">
        <div className="flex items-center h-full gap-1">
          {/* Overview Tab */}
          <div className="h-full flex items-center gap-2 px-3 border-b-2 border-[#1542b7] font-semibold text-[13px] text-[#1542b7] dark:text-[#29a4ff] bg-slate-50 dark:bg-muted/30 cursor-pointer">
            <GripVertical className="w-3.5 h-3.5 opacity-50" />
            <span>Overview (28)</span>
          </div>

          {/* Add Tab Button */}
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1"
            title="Add Custom Tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action: Open Widget Selector Drawer */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => {
              setIsWidgetDrawerOpen((prev) => !prev);
              setIsFilterDrawerOpen(false);
            }}
            className={cn(
              "p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
              isWidgetDrawerOpen && "bg-muted text-[#1542b7] dark:text-[#29a4ff]"
            )}
            title="Configure Dashboard Widgets"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID (3 Columns x Rows matching live Trakzee) */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          
          {/* WIDGET 1: Fleet Status */}
          {enabledWidgets.fleet_status && (
            <div className="bg-white dark:bg-card rounded border border-border shadow-sm flex flex-col h-[280px] overflow-hidden">
              {/* Card Header */}
              <div className="h-[36px] border-b border-border px-3 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60 cursor-grab" />
                  <span className="text-[12px] font-semibold text-foreground">Fleet Status</span>
                </div>
                <button type="button" className="text-muted-foreground hover:text-foreground p-0.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body: Donut Chart + Legend */}
              <div className="flex-1 p-3 flex items-center justify-between gap-2">
                {/* SVG Donut */}
                <div className="relative w-[150px] h-[150px] flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#e2e8f0" strokeWidth="18" />
                    {/* Running (10% - Green) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#16a34a" strokeWidth="18" strokeDasharray="23.8 238.8" strokeDashoffset="0" />
                    {/* Idle (10% - Yellow) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#eab308" strokeWidth="18" strokeDasharray="23.8 238.8" strokeDashoffset="-23.8" />
                    {/* Stopped (70% - Orange/Red) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ea580c" strokeWidth="18" strokeDasharray="167.1 238.8" strokeDashoffset="-47.6" />
                    {/* Inactive (10% - Blue) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0284c7" strokeWidth="18" strokeDasharray="23.8 238.8" strokeDashoffset="-214.7" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-bold text-foreground leading-tight">10</span>
                    <span className="text-[10px] text-muted-foreground">Objects</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="flex-1 space-y-1.5 text-[11px] pr-1">
                  <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Running</span>
                    </div>
                    <span className="font-semibold">1 (10%)</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 text-amber-700 dark:text-amber-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Idle</span>
                    </div>
                    <span className="font-semibold">1 (10%)</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/30 text-orange-700 dark:text-orange-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-600" />
                      <span>Stopped</span>
                    </div>
                    <span className="font-semibold">7 (70%)</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/50 dark:border-sky-800/30 text-sky-700 dark:text-sky-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-600" />
                      <span>InActive</span>
                    </div>
                    <span className="font-semibold">1 (10%)</span>
                  </div>

                  <div className="flex items-center justify-between px-1.5 text-muted-foreground text-[10px]">
                    <span>Other</span>
                    <span>0 (0%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WIDGET 2: Model wise Devices */}
          {enabledWidgets.model_wise && (
            <div className="bg-white dark:bg-card rounded border border-border shadow-sm flex flex-col h-[280px] overflow-hidden">
              <div className="h-[36px] border-b border-border px-3 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                <span className="text-[12px] font-semibold text-foreground">Model wise Devices</span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <button type="button" className="hover:text-foreground p-0.5"><FileText className="w-3.5 h-3.5" /></button>
                  <button type="button" className="hover:text-foreground p-0.5"><Maximize2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#b91c1c" strokeWidth="22" strokeDasharray="140 238.8" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#a16207" strokeWidth="22" strokeDasharray="40 238.8" strokeDashoffset="-140" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f472b6" strokeWidth="22" strokeDasharray="25 238.8" strokeDashoffset="-180" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#064e3b" strokeWidth="22" strokeDasharray="25 238.8" strokeDashoffset="-205" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0e7490" strokeWidth="22" strokeDasharray="8.8 238.8" strokeDashoffset="-230" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold text-foreground leading-tight">10</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WIDGET 3: Object Brand Model */}
          {enabledWidgets.brand_model && (
            <div className="bg-white dark:bg-card rounded border border-border shadow-sm flex flex-col h-[280px] overflow-hidden">
              <div className="h-[36px] border-b border-border px-3 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                <span className="text-[12px] font-semibold text-foreground">Object Brand Model</span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <button type="button" className="hover:text-foreground p-0.5"><FileText className="w-3.5 h-3.5" /></button>
                  <button type="button" className="hover:text-foreground p-0.5"><Maximize2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#b91c1c" strokeWidth="22" strokeDasharray="145 238.8" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0891b2" strokeWidth="22" strokeDasharray="50 238.8" strokeDashoffset="-145" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#818cf8" strokeWidth="22" strokeDasharray="25 238.8" strokeDashoffset="-195" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#475569" strokeWidth="22" strokeDasharray="18.8 238.8" strokeDashoffset="-220" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold text-foreground leading-tight">10</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WIDGET 4: Web vs Mobile User */}
          {enabledWidgets.web_mobile && (
            <div className="bg-white dark:bg-card rounded border border-border shadow-sm flex flex-col h-[280px] overflow-hidden">
              <div className="h-[36px] border-b border-border px-3 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                <span className="text-[12px] font-semibold text-foreground">Web vs Mobile User</span>
                <button type="button" className="text-muted-foreground hover:text-foreground p-0.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-[145px] h-[145px] rounded-full bg-[#3b82f6] shadow-inner flex items-center justify-center" />
              </div>
            </div>
          )}

          {/* WIDGET 5: Application Usage */}
          {enabledWidgets.app_usage && (
            <div className="bg-white dark:bg-card rounded border border-border shadow-sm flex flex-col h-[280px] overflow-hidden">
              <div className="h-[36px] border-b border-border px-3 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                <span className="text-[12px] font-semibold text-foreground">Application Usage</span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <button type="button" className="hover:text-foreground p-0.5"><FileText className="w-3.5 h-3.5" /></button>
                  <button type="button" className="hover:text-foreground p-0.5"><Maximize2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-[145px] h-[145px] rounded-full bg-[#06b6d4] shadow-inner flex items-center justify-center" />
              </div>
            </div>
          )}

          {/* WIDGET 6: Devices vs Project */}
          {enabledWidgets.devices_project && (
            <div className="bg-white dark:bg-card rounded border border-border shadow-sm flex flex-col h-[280px] overflow-hidden">
              <div className="h-[36px] border-b border-border px-3 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                <span className="text-[12px] font-semibold text-foreground">Devices vs Project</span>
                <button type="button" className="text-muted-foreground hover:text-foreground p-0.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center text-muted-foreground/60 text-sm font-medium">
                No Records Found
              </div>
            </div>
          )}

          {/* WIDGET 7: Alert Summary */}
          {enabledWidgets.alert_summary && (
            <div className="bg-white dark:bg-card rounded border border-border shadow-sm flex flex-col h-[280px] overflow-hidden">
              <div className="h-[36px] border-b border-border px-3 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                <span className="text-[12px] font-semibold text-foreground">Alerts Overview</span>
                <button type="button" className="text-muted-foreground hover:text-foreground p-0.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600">
                  <span>High Priority Alerts</span>
                  <span className="font-bold">4</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-600">
                  <span>Geofence Boundary Violations</span>
                  <span className="font-bold">2</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-sky-50 dark:bg-sky-950/30 text-sky-600">
                  <span>Sensor Maintenance Notices</span>
                  <span className="font-bold">1</span>
                </div>
              </div>
            </div>
          )}

          {/* WIDGET 8: Inactive Devices */}
          {enabledWidgets.inactive_devices && (
            <div className="bg-white dark:bg-card rounded border border-border shadow-sm flex flex-col h-[280px] overflow-hidden">
              <div className="h-[36px] border-b border-border px-3 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                <span className="text-[12px] font-semibold text-foreground">Inactive Telematics Devices</span>
                <button type="button" className="text-muted-foreground hover:text-foreground p-0.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 p-3 text-xs divide-y divide-border">
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-foreground">UA 498EP</span>
                  <span className="text-muted-foreground">Offline 4 hrs ago</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-foreground">UBH 168K</span>
                  <span className="text-muted-foreground">Offline 1 day ago</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. WIDGET SELECTOR SLIDE-OVER DRAWER (Right Side matching Images 1, 2, 3) */}
      {isWidgetDrawerOpen && (
        <div 
          className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px] flex justify-end"
          onClick={() => setIsWidgetDrawerOpen(false)}
        >
          <div
            className="w-[300px] h-full bg-white dark:bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header with Title Bar */}
            <div className="p-3 border-b border-border flex items-center justify-between gap-2 bg-slate-50 dark:bg-muted/40">
              <input
                type="text"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-[140px] px-2 py-1 text-xs border border-border rounded bg-white dark:bg-background text-foreground font-medium outline-none focus:border-[#1542b7]"
              />
              <div className="flex items-center gap-2 text-muted-foreground">
                <button type="button" className="hover:text-foreground"><Eye className="w-4 h-4" /></button>
                <button type="button" className="hover:text-foreground"><Pin className="w-4 h-4" /></button>
                <button 
                  type="button" 
                  onClick={() => setIsWidgetDrawerOpen(false)}
                  className="hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Select Widget Header */}
            <div className="px-3 py-2 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground bg-slate-100/60 dark:bg-muted/20">
              <span>Select Widget</span>
              <span className="text-[11px] text-muted-foreground font-normal">Size</span>
            </div>

            {/* Widgets Checkbox Tree */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              {categories.map((cat) => {
                const catWidgets = ALL_WIDGETS.filter((w) => w.category === cat);
                if (catWidgets.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                      {cat}
                    </div>
                    <div className="space-y-1.5 pl-1">
                      {catWidgets.map((w) => (
                        <div key={w.id} className="flex items-center justify-between group">
                          <label className="flex items-center gap-2 cursor-pointer flex-1 select-none">
                            <input
                              type="checkbox"
                              checked={!!enabledWidgets[w.id]}
                              onChange={(e) => {
                                setEnabledWidgets((prev) => ({
                                  ...prev,
                                  [w.id]: e.target.checked,
                                }));
                              }}
                              className="rounded border-border text-[#1542b7] focus:ring-[#1542b7] w-3.5 h-3.5"
                            />
                            <span className={cn(
                              "text-[12px] group-hover:text-foreground transition-colors",
                              enabledWidgets[w.id] ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>
                              {w.title}
                            </span>
                          </label>
                          <input 
                            type="checkbox" 
                            disabled 
                            className="w-3 h-3 rounded border-border opacity-40" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-border flex items-center justify-end gap-2 bg-slate-50 dark:bg-muted/30">
              <button
                type="button"
                onClick={() => setIsWidgetDrawerOpen(false)}
                className="px-4 py-1.5 rounded text-xs font-medium bg-[#1542b7] hover:bg-[#1542b7]/90 text-white cursor-pointer transition-colors shadow-sm"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setIsWidgetDrawerOpen(false)}
                className="px-4 py-1.5 rounded text-xs font-medium border border-border text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FILTER SLIDE-OVER DRAWER (Right Side matching Image 4) */}
      {isFilterDrawerOpen && (
        <div 
          className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px] flex justify-end"
          onClick={() => setIsFilterDrawerOpen(false)}
        >
          <div
            className="w-[620px] max-w-full h-full bg-white dark:bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Body (2 Columns: Dropdowns + Vehicle Object Tree) */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Column: Dropdowns */}
              <div className="w-[260px] border-r border-border p-4 space-y-4 overflow-y-auto bg-slate-50/50 dark:bg-muted/10 text-xs">
                <div>
                  <label className="block font-medium text-foreground mb-1">Company :</label>
                  <select className="w-full p-2 border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]">
                    <option value="All">All</option>
                    <option value="tech_hub">Technology Hub Ltd</option>
                    <option value="mega_milk">Mega Milk Fleet</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">Branch :</label>
                  <select className="w-full p-2 border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]">
                    <option value="All">All</option>
                    <option value="main">Main Yard</option>
                    <option value="depot_b">Depot Yard B</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">Vehicle Group :</label>
                  <select className="w-full p-2 border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]">
                    <option value="All">All</option>
                    <option value="heavy">Heavy Trucks</option>
                    <option value="light">Light Vans</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">Vehicle Type :</label>
                  <select className="w-full p-2 border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]">
                    <option value="All">All</option>
                    <option value="truck">Truck</option>
                    <option value="crane">Crane</option>
                    <option value="sinotruck">Sinotruck</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Object Selection Search & Tree */}
              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="space-y-2 mb-3">
                  <label className="block text-xs font-medium text-foreground">Object Selection :</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-8 pr-2 py-1.5 text-xs border border-border rounded bg-white dark:bg-card text-foreground outline-none focus:border-[#1542b7]"
                      />
                    </div>
                    <button type="button" className="p-1.5 border border-border rounded hover:bg-muted text-muted-foreground">
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grouped Tree List */}
                <div className="flex-1 overflow-y-auto border border-border rounded p-2 space-y-2 text-xs divide-y divide-border/40">
                  {VEHICLE_GROUPS_DATA.map((group) => {
                    const isExpanded = !!expandedGroups[group.name];
                    const allChecked = group.vehicles.every((v) => selectedVehicles[v.id]);

                    return (
                      <div key={group.name} className="pt-2 first:pt-0 space-y-1">
                        {/* Group Header */}
                        <div className="flex items-center justify-between p-1 bg-muted/40 rounded hover:bg-muted/70 transition-colors">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={(e) => toggleAllInGroup(group, e.target.checked)}
                              className="rounded border-border text-[#1542b7] focus:ring-[#1542b7] w-3.5 h-3.5"
                            />
                            <span className="font-semibold text-foreground">
                              {group.name} [ {group.count} ]
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.name)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Vehicle Items */}
                        {isExpanded && (
                          <div className="pl-6 space-y-1.5 py-1">
                            {group.vehicles
                              .filter((v) => !vehicleSearch || v.name.toLowerCase().includes(vehicleSearch.toLowerCase()))
                              .map((v) => (
                                <label key={v.id} className="flex items-center justify-between cursor-pointer group select-none">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={!!selectedVehicles[v.id]}
                                      onChange={() => toggleVehicle(v.id)}
                                      className="rounded border-border text-[#1542b7] focus:ring-[#1542b7] w-3.5 h-3.5"
                                    />
                                    <span className="text-[12px] font-medium text-foreground">{v.name}</span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">{v.type}</span>
                                </label>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-border flex items-center justify-between bg-slate-50 dark:bg-muted/30">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-[#1542b7] text-white hover:bg-[#1542b7]/90 transition-colors"
                >
                  Save Filter
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-[#1542b7] text-white hover:bg-[#1542b7]/90 transition-colors"
                >
                  Delete Filter
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="px-5 py-1.5 rounded text-xs font-medium bg-[#1542b7] text-white hover:bg-[#1542b7]/90 transition-colors shadow-sm"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
