"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, RefreshCw, Cpu, Database, ChevronRight, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

interface SystemData {
  status: string;
  timestamp: string;
  metrics: {
    totalUsers: number;
    totalClients: number;
    totalAgents: number;
    totalMessages: number;
    totalCampaigns: number;
    gatewaysCount: number;
  };
  providers: {
    name: string;
    displayName: string;
    type: string;
    isActive: boolean;
    priority: number;
  }[];
  recentLogs: {
    id: string;
    action: string | null;
    eventName: string;
    resourceType: string | null;
    outcome: string;
    status?: string;
    recordedAt: string;
    timestamp: string;
  }[];
  system: {
    uptimeSeconds: number;
    nodeVersion: string;
    memoryUsedMB: number;
    memoryTotalMB: number;
    environment: string;
  };
}

export default function SystemPage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSystemData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/system");
      if (!res.ok) throw new Error("Failed to load system metrics");
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching system data";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  const memPercent = data
    ? Math.round((data.system.memoryUsedMB / Math.max(1, data.system.memoryTotalMB)) * 100)
    : 0;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-background min-h-[calc(100vh-4rem)]">
      
      {/* Breadcrumb matching UI Skills site */}
      <nav className="flex items-center text-sm font-medium text-muted-foreground/70 mb-2">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Admin</Link>
        <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
        <span className="text-foreground">System Health</span>
      </nav>

      {/* Page Header matching minimalist clean style */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-border/40">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            System Monitor
          </h1>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            Real-time infrastructure health, process metrics, and carrier connectivity status connected to the core engine.
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={fetchSystemData} 
          disabled={loading} 
          className="w-full sm:w-auto font-medium rounded-full px-5 py-5 shadow-none bg-muted/50 hover:bg-muted"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Sync Metrics
        </Button>
      </div>

      {/* Top 3 Health Cards - Minimalist with subtle borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 pt-2">
        
        {/* Node Process & Memory */}
        <Card className="shadow-none border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-[11px]">
              Node.js Heap Memory
            </CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-foreground">
              {data ? `${data.system.memoryUsedMB} MB` : "..."}
              <span className="text-sm font-normal text-muted-foreground ml-1.5">
                / {data?.system.memoryTotalMB || 0}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <Progress value={memPercent} className="h-1.5 bg-muted-foreground/20" />
              <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                <span>{memPercent}% ALOC</span>
                <span className="font-mono">v{data?.system.nodeVersion.replace('v', '')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Server Uptime & Status */}
        <Card className="shadow-none border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-[11px]">
              Core Engine Uptime
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-foreground">
              {data ? formatUptime(data.system.uptimeSeconds) : "..."}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400">
                {data?.status || "HEALTHY"}
              </Badge>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                ENV: {data?.system.environment || "dev"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Database Entities */}
        <Card className="shadow-none border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-[11px]">
              Live Records
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-foreground">
              {data ? data.metrics.totalMessages.toLocaleString() : "..."}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-4">
              {data?.metrics.totalClients || 0} clients • {data?.metrics.totalAgents || 0} agents
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gateway Status & Audit Trail - 2 Columns */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 pt-4">
        
        {/* Gateway Status - styled like UI-Skills code blocks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium tracking-wide uppercase text-muted-foreground">Configured Gateways</h2>
          </div>
          
          {!data || data.providers.length === 0 ? (
            <div className="p-6 rounded-2xl border border-border/40 bg-muted/10 text-sm text-muted-foreground text-center">
              No active providers detected.
            </div>
          ) : (
            <div className="space-y-3">
              {data.providers.map((p) => (
                <div key={p.name} className="p-4 rounded-2xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground">{p.displayName}</p>
                    <p className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider">
                      {p.type} • PRIORITY {p.priority}
                    </p>
                  </div>
                  <div>
                    {p.isActive ? (
                      <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400 shadow-none">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full text-[10px] uppercase shadow-none">Disabled</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Activities */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium tracking-wide uppercase text-muted-foreground">Recent Audit Stream</h2>
          </div>
          
          {!data || data.recentLogs.length === 0 ? (
            <div className="p-6 rounded-2xl border border-border/40 bg-muted/10 text-sm text-muted-foreground text-center">
              No audit logs recorded.
            </div>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-muted/10 overflow-hidden divide-y divide-border/30">
              {data.recentLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold font-mono text-foreground/90 tracking-tight">
                      {log.action || log.eventName}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/70">
                      {log.resourceType || "System"} • {format(new Date(log.recordedAt || log.timestamp), "MMM dd, HH:mm")}
                    </p>
                  </div>
                  <Badge 
                    variant={log.outcome === "SUCCESS" ? "outline" : "destructive"} 
                    className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest shadow-none ${
                      log.outcome === "SUCCESS" ? "text-muted-foreground border-border/50 bg-background/50" : ""
                    }`}
                  >
                    {log.outcome || log.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
