/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Plus, Search, Edit, Trash2, Phone, CreditCard, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DRIVERS_LIST = [
  { id: "1", name: "John Kiprono", phone: "+254 712 345 678", license: "DL-890412-K", rfid: "RFID-990142", vehicle: "Truck-01 (KCD 849X)", status: "On Duty", expiry: "2028-04-15" },
  { id: "2", name: "Ahmed Ali", phone: "+254 722 987 654", license: "DL-654921-K", rfid: "RFID-990143", vehicle: "Van-04 (KBZ 192A)", status: "Off Duty", expiry: "2027-11-20" },
  { id: "3", name: "Peter Omondi", phone: "+211 928 472 910", license: "DL-334102-S", rfid: "RFID-990144", vehicle: "Trailer-12 (KDE 401M)", status: "On Duty", expiry: "2029-01-10" },
  { id: "4", name: "David Mwangi", phone: "+254 733 112 233", license: "DL-778419-K", rfid: "RFID-990145", vehicle: "Pickup-08 (KCA 551P)", status: "On Duty", expiry: "2027-09-30" },
  { id: "5", name: "Samuel Kimani", phone: "+254 700 554 433", license: "DL-119482-K", rfid: "RFID-990146", vehicle: "Truck-05 (KCT 819Y)", status: "Leave", expiry: "2026-10-05" },
  { id: "6", name: "Hassan Omar", phone: "+254 788 665 544", license: "DL-448201-K", rfid: "RFID-990147", vehicle: "Bus-02 (KBQ 672C)", status: "On Duty", expiry: "2028-08-12" },
];

export default function DriverManagementPage() {
  const [search, setSearch] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#29a4ff]" />
            Fleet Driver Directory & RFID Assignment
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage driver profiles, verify DL license validity, and assign RFID authentication tags.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="auth-btn-primary flex items-center gap-2 px-3.5"
          style={{ height: "36px", fontSize: "12px", borderRadius: "6px" }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Driver</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground">Registered Drivers ({DRIVERS_LIST.length})</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search driver name, license, RFID..."
              className="h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
                <th className="py-2.5 px-3">Driver Name</th>
                <th className="py-2.5 px-3">Phone Number</th>
                <th className="py-2.5 px-3">License No</th>
                <th className="py-2.5 px-3">RFID Tag ID</th>
                <th className="py-2.5 px-3">Assigned Vehicle</th>
                <th className="py-2.5 px-3">Duty Status</th>
                <th className="py-2.5 px-3">License Expiry</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {DRIVERS_LIST.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.license.toLowerCase().includes(search.toLowerCase()) || d.rfid.toLowerCase().includes(search.toLowerCase())).map((d) => (
                <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground">{d.name}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">{d.phone}</td>
                  <td className="py-2.5 px-3 font-mono text-foreground">{d.license}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#29a4ff] font-semibold">{d.rfid}</td>
                  <td className="py-2.5 px-3 font-medium text-foreground">{d.vehicle}</td>
                  <td className="py-2.5 px-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      d.status === "On Duty" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                      d.status === "Off Duty" && "bg-muted text-muted-foreground",
                      d.status === "Leave" && "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    )}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">{d.expiry}</td>
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

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold">Register New Fleet Driver</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Full Name *</label>
                <input type="text" placeholder="e.g. Samuel Karanja" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
              </div>
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Phone Number *</label>
                <input type="text" placeholder="+254 700 000 000" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
              </div>
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Driving License No *</label>
                <input type="text" placeholder="DL-123456-K" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
              </div>
              <div>
                <label className="text-muted-foreground font-medium block mb-1">RFID Key Tag ID</label>
                <input type="text" placeholder="RFID-990148" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="auth-btn-secondary" style={{ height: "34px", fontSize: "12px", padding: "0 14px" }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Driver registered successfully!");
                  setIsAddModalOpen(false);
                }}
                className="auth-btn-primary"
                style={{ height: "34px", fontSize: "12px", padding: "0 14px" }}
              >
                Save Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
