"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Server, RefreshCw, Cpu, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Monitor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time infrastructure health, process metrics, and carrier connectivity status.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSystemData} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </Button>
      </div>

      {/* Top 3 Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Node Process & Memory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Node.js Heap Memory</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? `${data.system.memoryUsedMB} MB` : "..."}
              <span className="text-xs font-normal text-muted-foreground ml-2">
                / {data?.system.memoryTotalMB || 0} MB
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <Progress value={memPercent} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{memPercent}% allocated</span>
                <span>Node {data?.system.nodeVersion}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Server Uptime & Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Server Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {data ? formatUptime(data.system.uptimeSeconds) : "..."}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-emerald-600 border-emerald-600/30 bg-emerald-500/10 text-xs">
                {data?.status || "HEALTHY"}
              </Badge>
              <span className="text-xs text-muted-foreground">Env: {data?.system.environment || "development"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Database Entities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Database Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? data.metrics.totalMessages.toLocaleString() : "..."}
              <span className="text-xs font-normal text-muted-foreground ml-1.5">messages</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {data?.metrics.totalClients || 0} clients • {data?.metrics.totalAgents || 0} agents • {data?.metrics.totalCampaigns || 0} campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gateway Status & Audit Trail */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gateway Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Configured SMS Gateways</CardTitle>
            <CardDescription>Live outbound provider connection statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {!data || data.providers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No providers detected.</p>
            ) : (
              <div className="space-y-4">
                {data.providers.map((p) => (
                  <div key={p.name} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm text-foreground">{p.displayName}</p>
                        <p className="text-xs text-muted-foreground">Protocol: {p.type} • Priority: {p.priority}</p>
                      </div>
                    </div>
                    <div>
                      {p.isActive ? (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-600/30 bg-emerald-500/10">
                          Operational
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Audit Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent System Events</CardTitle>
            <CardDescription>Latest administrative and authentication events</CardDescription>
          </CardHeader>
          <CardContent>
            {!data || data.recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No audit logs recorded.</p>
            ) : (
              <div className="space-y-3">
                {data.recentLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center border-b pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium font-mono text-foreground">{log.action || log.eventName}</p>
                      <p className="text-xs text-muted-foreground">
                        Resource: {log.resourceType || "System"} • {format(new Date(log.recordedAt || log.timestamp), "MMM dd, HH:mm:ss")}
                      </p>
                    </div>
                    <Badge variant={log.outcome === "SUCCESS" ? "outline" : "destructive"} className="text-xs">
                      {log.outcome || log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
