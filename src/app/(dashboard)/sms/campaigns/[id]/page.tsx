'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertCircle, FileDown } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

const deliveryData = [
  { name: 'Delivered', value: 14500, color: '#22c55e' },
  { name: 'Failed', value: 350, color: '#ef4444' },
  { name: 'Pending', value: 550, color: '#f59e0b' },
];

export default function CampaignAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <>
      <div className="mb-4">
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
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <h2 className="text-3xl font-bold mt-1">15,400</h2>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                <h2 className="text-3xl font-bold mt-1 text-green-600">94.1%</h2>
              </div>
              <div className="p-3 bg-green-500/10 text-green-600 rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <h2 className="text-3xl font-bold mt-1">154,000 <span className="text-lg font-medium text-muted-foreground">UGX</span></h2>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <h2 className="text-3xl font-bold mt-1 text-red-600">350</h2>
              </div>
              <div className="p-3 bg-red-500/10 text-red-600 rounded-full">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Delivery Breakdown</CardTitle>
            <CardDescription>Status of all messages in this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
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
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">COMPLETED</Badge>
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
    </>
  );
}
