'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Smartphone, Cpu, Plus, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

interface GatewayDevice {
  batteryLevel?: number | null;
  signalStrength?: number | null;
}

interface Gateway {
  id: string;
  name: string;
  type: string;
  status: string;
  devices: GatewayDevice[];
  maxThroughput?: number;
}

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGateways() {
      try {
        const res = await fetch('/api/v1/gateways');
        const data = await res.json();
        if (data.success) {
          setGateways(data.gateways);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGateways();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ANDROID': return <Smartphone className="w-8 h-8 text-blue-500" />;
      case 'ESP32_GSM': return <Cpu className="w-8 h-8 text-green-500" />;
      default: return <Server className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Physical Gateways</h1>
          <p className="text-muted-foreground">
            Manage your Android and ESP32 hardware SMS gateways.
          </p>
        </div>
        <Link href="/gateways/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Gateway
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading gateways...</div>
      ) : gateways.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Server className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No Gateways Configured</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-2 mb-6">
              You haven't added any physical hardware gateways yet. Add an Android phone or ESP32 module to start sending SMS natively without a cloud provider.
            </p>
            <Link href="/gateways/add">
              <Button variant="outline">Pair a Device</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((gw) => (
            <Card key={gw.id} className="relative overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    {getIcon(gw.type)}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-full text-xs font-medium border">
                    {gw.status === 'ONLINE' ? (
                      <><Wifi className="w-3.5 h-3.5 text-green-500" /> <span className="text-green-600 dark:text-green-400">Online</span></>
                    ) : (
                      <><WifiOff className="w-3.5 h-3.5 text-red-500" /> <span className="text-red-600 dark:text-red-400">Offline</span></>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg mt-4">{gw.name}</CardTitle>
                <CardDescription className="text-xs font-mono">{gw.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{gw.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Throughput</span>
                    <span className="font-medium">{gw.maxThroughput ? `${gw.maxThroughput} /min` : 'Unlimited'}</span>
                  </div>
                  
                  {gw.devices && gw.devices.length > 0 && (
                    <div className="pt-3 border-t mt-3 flex justify-between text-xs">
                      <span className="text-muted-foreground">Battery: {gw.devices[0].batteryLevel || '--'}%</span>
                      <span className="text-muted-foreground">Signal: {gw.devices[0].signalStrength || '--'} dBm</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
