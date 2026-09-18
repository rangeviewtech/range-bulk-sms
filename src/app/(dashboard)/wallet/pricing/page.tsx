'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, RefreshCw, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SMS Pricing & Coverage</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transparent per-SMS rates across all supported domestic and international carrier routes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search country or network..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh pricing"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Domestic Rate</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <Globe className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX 45.00</div>
            <p className="text-xs text-muted-foreground mt-1">MTN & Airtel Uganda tier 1 direct route</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">East Africa EAC</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">From UGX 65.00</div>
            <p className="text-xs text-muted-foreground mt-1">Kenya, Tanzania, Rwanda cross-border</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">International Hub</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Globe className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">From UGX 110.00</div>
            <p className="text-xs text-muted-foreground mt-1">Global 190+ countries via Tier 1 aggregators</p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Rate Table */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Global Coverage Pricing</CardTitle>
          <CardDescription>
            Showing {pricing.length} rate rules. All prices exclude standard VAT.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="space-y-3 p-4 sm:p-0 py-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-full bg-muted/40 animate-pulse rounded" />
              ))}
            </div>
          ) : pricing.length === 0 ? (
            <div className="text-center py-10 m-4 sm:m-0 border border-dashed rounded-lg">
              <p className="text-sm font-medium text-foreground">No matching country or network found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for a different country code, country name, or carrier.
              </p>
            </div>
          ) : (
            <div className="w-full">
              <Table className="min-w-[650px]">
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
                          <span className="font-medium text-xs bg-muted/50 px-2 py-1 rounded">
                            {item.networkName || item.networkCode || 'All Networks'}
                          </span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
