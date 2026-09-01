"use client";

import * as React from "react";
import Link from "next/link";
import { Settings, Plus, Search, Filter, Edit, Trash2, ShieldCheck, Radio, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const OBJECTS_LIST = [
  { id: "1", name: "Truck-01", plate: "KCD 849X", imei: "864910283019482", sim: "+254712345678", device: "Teltonika FMB920", type: "Heavy Truck", group: "Northern Corridor", odo: 142850, status: "Active", expiry: "2027-12-31" },
  { id: "2", name: "Van-04", plate: "KBZ 192A", imei: "864910283019483", sim: "+254722987654", device: "Concox GT06N", type: "Delivery Van", group: "Nairobi City", odo: 58320, status: "Active", expiry: "2027-08-15" },
  { id: "3", name: "Trailer-12", plate: "KDE 401M", imei: "864910283019484", sim: "+211928472910", device: "Teltonika FMB125", type: "Prime Mover", group: "Cross Border Juba", odo: 310450, status: "Active", expiry: "2028-01-10" },
  { id: "4", name: "Pickup-08", plate: "KCA 551P", imei: "864910283019485", sim: "+254733112233", device: "Queclink GV55", type: "Utility Pickup", group: "Airport Operations", odo: 89400, status: "Active", expiry: "2027-06-30" },
  { id: "5", name: "Truck-05", plate: "KCT 819Y", imei: "864910283019486", sim: "+254700554433", device: "Teltonika FMB920", type: "Heavy Truck", group: "Northern Corridor", odo: 215600, status: "Suspended", expiry: "2026-08-01" },
];

export default function ObjectSettingsPage() {
  const [search, setSearch] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#29a4ff]" />
            Object / Vehicle Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Register GPS telemetry hardware, calibrate sensors, and assign fleet groups.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="auth-btn-primary flex items-center gap-2 px-3.5"
          style={{ height: "36px", fontSize: "12px", borderRadius: "6px" }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground">Registered Fleet Objects ({OBJECTS_LIST.length})</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicle, IMEI, plate..."
              className="h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
                <th className="py-2.5 px-3">Vehicle Name</th>
                <th className="py-2.5 px-3">Plate Number</th>
                <th className="py-2.5 px-3">Device Model</th>
                <th className="py-2.5 px-3">Device IMEI</th>
                <th className="py-2.5 px-3">SIM Card</th>
                <th className="py-2.5 px-3">Fleet Group</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {OBJECTS_LIST.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.plate.toLowerCase().includes(search.toLowerCase()) || o.imei.includes(search)).map((obj) => (
                <tr key={obj.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground">{obj.name}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">{obj.plate}</td>
                  <td className="py-2.5 px-3 text-foreground">{obj.device}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">{obj.imei}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">{obj.sim}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{obj.group}</td>
                  <td className="py-2.5 px-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      obj.status === "Active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    )}>
                      {obj.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button type="button" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold">Register New GPS Telematics Object</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Vehicle Name *</label>
                <input type="text" placeholder="e.g. Truck-09" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
              </div>
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Registration Plate *</label>
                <input type="text" placeholder="e.g. KCG 104D" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
              </div>
              <div>
                <label className="text-muted-foreground font-medium block mb-1">GPS Device Model *</label>
                <select className="w-full h-8 px-2 bg-muted/40 border border-border rounded-md outline-none text-foreground">
                  <option>Teltonika FMB920</option>
                  <option>Teltonika FMB125 (Fuel CAN)</option>
                  <option>Concox GT06N</option>
                  <option>Queclink GV55</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground font-medium block mb-1">IMEI Number (15 digits) *</label>
                <input type="text" placeholder="864910283019000" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
              </div>
              <div>
                <label className="text-muted-foreground font-medium block mb-1">SIM Card Number</label>
                <input type="text" placeholder="+254700112233" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
              </div>
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Fleet Group</label>
                <select className="w-full h-8 px-2 bg-muted/40 border border-border rounded-md outline-none text-foreground">
                  <option>Northern Corridor</option>
                  <option>Nairobi City</option>
                  <option>Cross Border Juba</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="auth-btn-secondary"
                style={{ height: "34px", fontSize: "12px", padding: "0 14px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Object registered successfully!");
                  setIsAddModalOpen(false);
                }}
                className="auth-btn-primary"
                style={{ height: "34px", fontSize: "12px", padding: "0 14px" }}
              >
                Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
