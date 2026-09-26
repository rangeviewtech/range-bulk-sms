'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NetworkBadge } from '@/components/sms/network-badge';
import { 
  Search, 
  ArrowLeft, 
  RefreshCw, 
  Globe, 
  Sparkles, 
  Calculator, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  PhoneCall, 
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AIRTEL_SMS_TIERS,
  AIRTEL_USSD_TIERS,
  AIRTEL_SETUP_FEES,
  calculateAirtelSmsRate,
  calculateAirtelUssdRate,
} from '@/lib/telecom/airtel-rates';

interface PricingItem {
  id: string;
  countryCode: string;
  countryName: string;
  networkCode: string | null;
  networkName: string | null;
  sellingPrice: number | string;
  currency: string;
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Telecom Volume Calculator State
  const [calcService, setCalcService] = useState<'sms' | 'ussd'>('sms');
  const [calcVolume, setCalcVolume] = useState<number>(100000);

  const calculatedRate = calcService === 'sms' 
    ? calculateAirtelSmsRate(calcVolume) 
    : calculateAirtelUssdRate(calcVolume);

  const fetchPricing = useCallback(async (query = search) => {
    try {
      const url = query ? `/api/pricing?q=${encodeURIComponent(query)}` : '/api/pricing';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load pricing table');
      const data = await res.json();
      setPricing(data.pricing || []);
    } catch {
      toast.error('Failed to load rates table');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPricing(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, fetchPricing]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPricing(search);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-muted-foreground hover:text-foreground">
              <Link href="/wallet" className="flex items-center gap-1 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Wallet
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Telecom Rates & Pricing Bands</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Official Airtel Uganda bulk messaging volume tiers, USSD sessions, and global carrier coverage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/sender-ids/apply">
            <Button size="sm" variant="outline" className="text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Register Sender ID
            </Button>
          </Link>
        </div>
      </div>

      {/* Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Airtel High Volume SMS</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <Sparkles className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">From UGX 0.50 / SMS</div>
            <p className="text-xs text-muted-foreground mt-1">VAT Inclusive official high-volume band</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bulk USSD Direct</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <PhoneCall className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">From UGX 2.50 / Session</div>
            <p className="text-xs text-muted-foreground mt-1">Interactive 2-way corporate menus</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sender ID Setup</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX 250,000</div>
            <p className="text-xs text-muted-foreground mt-1">One-time registration (VAT Incl.)</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs: Telecom Volume Bands vs Global Coverage */}
      <Tabs defaultValue="airtel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="airtel" className="text-xs sm:text-sm">
            <Layers className="h-4 w-4 mr-1.5" />
            Airtel Direct Volume Tiers
          </TabsTrigger>
          <TabsTrigger value="global" className="text-xs sm:text-sm">
            <Globe className="h-4 w-4 mr-1.5" />
            Global Carrier Coverage
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Airtel Official Volume Tiers & Calculator */}
        <TabsContent value="airtel" className="space-y-6">
          {/* Interactive Tier Calculator */}
          <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-card to-muted/30">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Interactive Volume & Rate Estimator</CardTitle>
                  </div>
                  <CardDescription>
                    Calculate exact cost according to official Airtel Uganda tiered regulatory bands.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                  <Button
                    size="sm"
                    variant={calcService === 'sms' ? 'default' : 'ghost'}
                    className="h-8 text-xs font-semibold"
                    onClick={() => setCalcService('sms')}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" /> Bulk SMS
                  </Button>
                  <Button
                    size="sm"
                    variant={calcService === 'ussd' ? 'default' : 'ghost'}
                    className="h-8 text-xs font-semibold"
                    onClick={() => setCalcService('ussd')}
                  >
                    <PhoneCall className="h-3.5 w-3.5 mr-1" /> Bulk USSD
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="volume-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Planned {calcService === 'sms' ? 'SMS Messages' : 'USSD Sessions'} Volume
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="volume-input"
                      type="number"
                      min={1}
                      step={10000}
                      value={calcVolume}
                      onChange={(e) => setCalcVolume(Math.max(1, Number(e.target.value) || 0))}
                      className="font-mono text-base"
                    />
                    <div className="flex gap-1.5">
                      {[100000, 500000, 2000000].map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-9"
                          onClick={() => setCalcVolume(preset)}
                        >
                          {(preset / 1000).toLocaleString()}k
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-background/80 shadow-sm space-y-1 text-center md:text-right">
                  <span className="text-xs text-muted-foreground">Applicable Unit Rate</span>
                  <div className="text-2xl sm:text-3xl font-black text-primary">
                    UGX {calculatedRate.ratePerUnit.toFixed(2)}
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    Tier: {calculatedRate.tier.name}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-muted/40 border text-xs">
                <div>
                  <span className="text-muted-foreground">Total Estimated Cost (VAT Incl.):</span>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    UGX {calculatedRate.totalCostUgx.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Contracting Status:</span>
                  <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {calculatedRate.isNegotiable ? 'Negotiable Custom SLA' : 'Standard Telecom Rate'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sender ID Setup Fee:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    UGX {AIRTEL_SETUP_FEES.SENDER_ID_REGISTRATION_UGX.toLocaleString()} (One-time)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk SMS Pricing Bands */}
          <Card className="border-secondary/20 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Airtel Bulk SMS Pricing Bands (VAT Incl.)
                  </CardTitle>
                  <CardDescription>
                    Official volume discount structure for outbound application-to-person (A2P) SMS.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  8 Volume Tiers
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {/* Desktop Table View */}
              <div className="hidden md:block w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Band / Tier</TableHead>
                      <TableHead>Volume Range (Messages)</TableHead>
                      <TableHead>Rate Per SMS (UGX)</TableHead>
                      <TableHead>Terms & SLA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {AIRTEL_SMS_TIERS.map((tier, idx) => (
                      <TableRow key={tier.id} className={calculatedRate.tier.id === tier.id ? 'bg-primary/5 font-semibold' : ''}>
                        <TableCell className="font-medium">
                          Tier {idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {tier.name}
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          UGX {tier.rateUgx.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {tier.isNegotiable ? (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                              Negotiable / Enterprise
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Standard Direct Bind</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card Deck View (Zero horizontal scroll down to 320px) */}
              <div className="block md:hidden divide-y">
                {AIRTEL_SMS_TIERS.map((tier, idx) => (
                  <div key={tier.id} className={`p-4 space-y-1.5 ${calculatedRate.tier.id === tier.id ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Tier {idx + 1}</span>
                      <span className="font-black text-primary text-base">UGX {tier.rateUgx.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Volume: {tier.name}</span>
                      {tier.isNegotiable && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                          Enterprise
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bulk USSD Pricing Bands */}
          <Card className="border-secondary/20 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <PhoneCall className="h-5 w-5 text-secondary dark:text-primary" />
                    Airtel Bulk USSD Session Pricing Bands (VAT Incl.)
                  </CardTitle>
                  <CardDescription>
                    Interactive corporate USSD session rates for real-time mobile menu services.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  8 Session Tiers
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {/* Desktop Table View */}
              <div className="hidden md:block w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Band / Tier</TableHead>
                      <TableHead>Session Volume Range</TableHead>
                      <TableHead>Rate Per Session (UGX)</TableHead>
                      <TableHead>Terms & SLA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {AIRTEL_USSD_TIERS.map((tier, idx) => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">
                          USSD Tier {idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {tier.name}
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          UGX {tier.rateUgx.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {tier.isNegotiable ? (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                              Negotiable / High Volume
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Standard Direct Gateway</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card Deck View */}
              <div className="block md:hidden divide-y">
                {AIRTEL_USSD_TIERS.map((tier, idx) => (
                  <div key={tier.id} className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">USSD Tier {idx + 1}</span>
                      <span className="font-black text-secondary dark:text-primary text-base">UGX {tier.rateUgx.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Sessions: {tier.name}</span>
                      {tier.isNegotiable && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                          Negotiable
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Global Carrier Coverage */}
        <TabsContent value="global" className="space-y-6">
          <Card className="border-secondary/20 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Global Coverage & Carrier Routes</CardTitle>
                <CardDescription>
                  Showing {pricing.length} carrier rate rules. All prices exclude standard VAT.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search country or network..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    aria-label="Search country or carrier network"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  aria-label="Refresh pricing table"
                  className="shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {loading ? (
                <div className="space-y-3 p-4 sm:p-0 py-6" role="status" aria-label="Loading pricing rules">
                  <span className="sr-only">Loading pricing rules...</span>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-full bg-muted/40 animate-pulse rounded" />
                  ))}
                </div>
              ) : pricing.length === 0 ? (
                <div className="text-center py-10 m-4 sm:m-0 border border-dashed rounded-lg">
                  <p className="text-sm font-medium text-foreground">No matching country or network found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try searching for a different country code, country name, or carrier network.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Country</TableHead>
                          <TableHead>Country Code</TableHead>
                          <TableHead>Network / Operator</TableHead>
                          <TableHead>Price Per SMS</TableHead>
                          <TableHead>Route Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pricing.map((item) => {
                          const priceNum = Number(item.sellingPrice || 0);
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-semibold text-foreground">
                                {item.countryName}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {item.countryCode}
                              </TableCell>
                              <TableCell>
                                <NetworkBadge network={item.networkName || item.networkCode} />
                              </TableCell>
                              <TableCell className="font-bold text-secondary dark:text-primary">
                                {item.currency} {priceNum.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  Direct Tier 1
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card Deck View (Zero horizontal scroll down to 320px) */}
                  <div className="block md:hidden divide-y">
                    {pricing.map((item) => {
                      const priceNum = Number(item.sellingPrice || 0);
                      return (
                        <div key={item.id} className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-foreground">{item.countryName}</span>
                            <span className="font-bold text-secondary dark:text-primary">
                              {item.currency} {priceNum.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono">{item.countryCode}</span>
                            <NetworkBadge network={item.networkName || item.networkCode} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
