"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Save, Mail, Phone, MapPin, Globe, Shield, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompanySettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#29a4ff]" />
            Company & Fleet Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage organization identity, fleet tier subscription, and regional localization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Company settings saved successfully!")}
          className="auth-btn-primary flex items-center gap-2 px-4"
          style={{ height: "36px", fontSize: "12px", borderRadius: "6px" }}
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2.5">Organization Details</h3>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-muted-foreground font-medium block mb-1">Company Name</label>
              <input type="text" defaultValue="Rangeview Telematics Logistics Ltd" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground font-medium" />
            </div>
            <div>
              <label className="text-muted-foreground font-medium block mb-1">Registration Tax PIN / VAT</label>
              <input type="text" defaultValue="P051892401M" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground font-mono" />
            </div>
            <div>
              <label className="text-muted-foreground font-medium block mb-1">Official Email</label>
              <input type="email" defaultValue="ali@technologyhubjuba.com" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
            </div>
            <div>
              <label className="text-muted-foreground font-medium block mb-1">Support Phone</label>
              <input type="tel" defaultValue="+211 928 000 111" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground font-mono" />
            </div>
            <div className="col-span-2">
              <label className="text-muted-foreground font-medium block mb-1">Headquarters Physical Address</label>
              <input type="text" defaultValue="Technology Hub Plaza, Block 4B, Airport Road, Juba" className="w-full h-8 px-2.5 bg-muted/40 border border-border rounded-md outline-none text-foreground" />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2.5 pt-2">Regional & Telemetry Settings</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-muted-foreground font-medium block mb-1">Default Timezone</label>
              <select defaultValue="Africa/Nairobi" className="w-full h-8 px-2 bg-muted/40 border border-border rounded-md outline-none text-foreground">
                <option value="Africa/Nairobi">East Africa Time (UTC+3)</option>
                <option value="Africa/Juba">Central Africa Time (UTC+2)</option>
                <option value="UTC">UTC / GMT</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground font-medium block mb-1">Distance Unit</label>
              <select defaultValue="km" className="w-full h-8 px-2 bg-muted/40 border border-border rounded-md outline-none text-foreground">
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground font-medium block mb-1">Speed Unit</label>
              <select defaultValue="kmh" className="w-full h-8 px-2 bg-muted/40 border border-border rounded-md outline-none text-foreground">
                <option value="kmh">km/h</option>
                <option value="mph">mph</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2.5 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#29a4ff]" />
              Subscription Tier
            </h3>
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1.5 text-xs">
              <div className="font-bold text-foreground">Trakzee Enterprise Fleet</div>
              <div className="text-muted-foreground text-[11px]">148 / 250 Active Telematics Licenses</div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                <div style={{ width: "59.2%" }} className="h-full bg-[#29a4ff]" />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground space-y-1">
              <div>• Real-time 5s GPS stream</div>
              <div>• Fuel CAN bus analytics</div>
              <div>• Unlimited Geofence zones</div>
              <div>• 1 Year Telematics storage</div>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <button
              type="button"
              className="w-full auth-btn-secondary"
              style={{ height: "32px", fontSize: "11px" }}
            >
              Manage Billing & Licenses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
