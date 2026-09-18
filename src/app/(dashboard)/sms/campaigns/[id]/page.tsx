'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, CheckCircle2, XCircle, FileDown } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

const deliveryData = [
  { name: 'Delivered', value: 14500, color: '#04648C' },
  { name: 'Pending', value: 550, color: '#FBCA07' },
  { name: 'Failed', value: 350, color: '#e11d48' },
];

export default function CampaignAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Link href="/sms/campaigns">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Campaign Analytics"
        description={`Detailed performance report for campaign ID: ${id}`}
        action={
          <Button variant="outline" className="w-full sm:w-auto">
            <FileDown className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="transition-all hover:border-secondary/40 hover:shadow-xs">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <h2 className="text-3xl font-bold mt-1">15,400</h2>
              </div>
              <div className="p-2.5 bg-primary/20 text-slate-900 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:border-secondary/40 hover:shadow-xs">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                <h2 className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">94.1%</h2>
              </div>
              <div className="p-2.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:border-secondary/40 hover:shadow-xs">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <h2 className="text-3xl font-bold mt-1">154,000 <span className="text-lg font-medium text-muted-foreground">UGX</span></h2>
              </div>
              <div className="p-2.5 bg-secondary/15 text-secondary dark:text-secondary-foreground rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:border-secondary/40 hover:shadow-xs">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <h2 className="text-3xl font-bold mt-1 text-rose-600 dark:text-rose-400">350</h2>
              </div>
              <div className="p-2.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>Delivery Breakdown</CardTitle>
            <CardDescription>Status of all messages in this campaign</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="h-[260px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {
                      deliveryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
            <div className="flex justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="success">COMPLETED</Badge>
            </div>
            <div className="flex justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Sender ID</span>
              <span className="font-medium">RANGESMS</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Started At</span>
              <span className="font-medium text-sm">Sep 15, 2026, 09:00 AM</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Completed At</span>
              <span className="font-medium text-sm">Sep 15, 2026, 09:45 AM</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-2">Message Preview</span>
              <div className="p-3 bg-muted rounded-md text-sm font-sans whitespace-pre-wrap border border-border/50">
                Hi {'{{name}}'}, our biggest sale of the year starts tomorrow! Get up to 50% off on all items. Visit rangesms.com/sale
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
