'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Server, Smartphone, Cpu, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AddGatewayPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('ANDROID');
  const [throughput, setThroughput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pairingCode, setPairingCode] = useState('');
  const [createdGatewayId, setCreatedGatewayId] = useState('');

  const handleCreateAndPair = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create the gateway
      const createRes = await fetch('/api/v1/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          maxThroughput: throughput ? parseInt(throughput) : undefined
        })
      });
      
      const createData = await createRes.json();
      
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || 'Failed to create gateway');
      }

      setCreatedGatewayId(createData.gateway.id);

      // 2. Generate Pairing Code
      const pairRes = await fetch('/api/v1/gateways/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayId: createData.gateway.id })
      });

      const pairData = await pairRes.json();

      if (!pairRes.ok || !pairData.success) {
        throw new Error(pairData.error || 'Failed to generate pairing code');
      }

      setPairingCode(pairData.pairingCode);
      
    } catch (err: unknown) {
      setError((err instanceof Error ? (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)) : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/gateways">
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Physical Gateway</h1>
          <p className="text-muted-foreground text-sm">
            Configure a new Android Phone or ESP32 Module to send SMS.
          </p>
        </div>
      </div>

      {!pairingCode ? (
        <Card>
          <form onSubmit={handleCreateAndPair}>
            <CardHeader>
              <CardTitle>Gateway Details</CardTitle>
              <CardDescription>Enter the details for your new hardware gateway.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Gateway Name</label>
                <Input 
                  placeholder="e.g., MTN Uganda Primary Phone" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hardware Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANDROID">Android Phone (App)</SelectItem>
                    <SelectItem value="ESP32_GSM">ESP32 + GSM/LTE Module</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rate Limit (SMS / min) - Optional</label>
                <Input 
                  type="number" 
                  placeholder="Leave empty for unlimited" 
                  value={throughput} 
                  onChange={(e) => setThroughput(e.target.value)} 
                />
                <p className="text-xs text-muted-foreground">Useful to prevent network operator bans.</p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-4 flex justify-end">
              <Button type="submit" disabled={loading || !name}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate Pairing Code
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card className="border-green-500/30 overflow-hidden">
          <div className="h-1 bg-green-500 w-full" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center rounded-full mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Gateway Created</CardTitle>
            <CardDescription>
              Your gateway is ready to pair. Follow the instructions below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex flex-col items-center justify-center p-8 bg-muted/40 rounded-xl border border-dashed border-border">
              <span className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-widest">
                Pairing Code
              </span>
              <span className="text-5xl font-mono font-bold text-foreground tracking-[0.2em]">
                {pairingCode}
              </span>
              <span className="text-xs text-muted-foreground mt-4">
                Expires in 10 minutes
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">How to connect:</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Open the Range SMS {type === 'ANDROID' ? 'Android App' : 'ESP32 Config Portal'}.</li>
                <li>Select "Pair new Gateway".</li>
                <li>Enter the 6-digit code shown above.</li>
                <li>Wait for the device to show as <strong>Online</strong> in your dashboard.</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 pt-4 flex justify-between">
             <Link href="/gateways">
               <Button variant="outline">Back to Gateways</Button>
             </Link>
             <Button variant="default" onClick={() => router.push('/gateways')}>
               Done
             </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
