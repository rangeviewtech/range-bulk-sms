/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
"use client";

import * as React from "react";
import Link from "next/link";
import { FileCheck, Download, Printer, Filter, Search, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const DOCS_DATA = [
  { vehicle: "Truck-01 (KCD 849X)", docType: "Commercial Insurance", issuer: "Jubilee Insurance", expiry: "2027-08-30", daysLeft: 363, status: "Valid" },
  { vehicle: "Truck-01 (KCD 849X)", docType: "NTSA Speed Governor Inspection", issuer: "NTSA Vehicle Inspection", expiry: "2026-09-15", daysLeft: 14, status: "Expiring Soon" },
  { vehicle: "Van-04 (KBZ 192A)", docType: "Road Tax & PSV License", issuer: "County Government", expiry: "2027-03-31", daysLeft: 211, status: "Valid" },
  { vehicle: "Trailer-12 (KDE 401M)", docType: "COMESA Yellow Card", issuer: "COMESA Regional Insurance", expiry: "2026-08-25", daysLeft: -7, status: "Expired" },
  { vehicle: "Pickup-08 (KCA 551P)", docType: "EPRA Transit Goods Permit", issuer: "EPRA Petroleum Authority", expiry: "2027-12-31", daysLeft: 486, status: "Valid" },
];

export default function ObjectDocumentsPage() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/reports" className="hover:text-foreground">Reports</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold">Object Documents</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-[#29a4ff]" />
            Vehicle Compliance & Document Expiry Status
          </h1>
        </div>

        <button type="button" className="auth-btn-primary flex items-center gap-1.5 px-3" style={{ height: "34px", fontSize: "12px", borderRadius: "6px" }}>
          <Download className="w-3.5 h-3.5" /> Export Excel
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground">Monitored Documents ({DOCS_DATA.length})</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search document, vehicle..." className="h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-md outline-none text-foreground" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Document Type</th>
                <th className="py-2.5 px-3">Issuing Authority</th>
                <th className="py-2.5 px-3">Expiry Date</th>
                <th className="py-2.5 px-3 text-right">Validity Remaining</th>
                <th className="py-2.5 px-3 text-right">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {DOCS_DATA.filter(r => !search || r.vehicle.toLowerCase().includes(search.toLowerCase()) || r.docType.toLowerCase().includes(search.toLowerCase())).map((row, i) => (
                <tr key={i} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground">{row.vehicle}</td>
                  <td className="py-2.5 px-3 text-foreground font-medium">{row.docType}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{row.issuer}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-foreground">{row.expiry}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">
                    {row.daysLeft > 0 ? `${row.daysLeft} days` : `Expired (${Math.abs(row.daysLeft)}d ago)`}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      row.status === "Valid" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                      row.status === "Expiring Soon" && "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
                      row.status === "Expired" && "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    )}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
