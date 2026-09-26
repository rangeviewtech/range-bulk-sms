'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  KeyRound,
  Activity,
  Webhook,
  BookOpen,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DeveloperPage() {
  const [copiedSnippet, setCopiedSnippet] = React.useState(false);

  const quickSnippet = `curl -X POST https://api.range.co.ug/v1/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+256700123456",
    "message": "Your verification code is 849201.",
    "senderId": "RANGE"
  }'`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(quickSnippet);
    setCopiedSnippet(true);
    toast.success('Quick-start cURL snippet copied to clipboard');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const HUB_MODULES = [
    {
      title: 'API Keys & Access Tokens',
      description: 'Generate, scope, and rotate production and sandbox Bearer tokens with IP whitelisting.',
      href: '/developer/api-keys',
      icon: KeyRound,
      badge: 'Security',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'API Telemetry & Throughput',
      description: 'Inspect live traffic, latency percentiles (p50/p95/p99), and error rates across all endpoints.',
      href: '/developer/api-usage',
      icon: Activity,
      badge: 'Monitoring',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Webhooks & Event Streams',
      description: 'Configure automated HTTP callbacks for instant delivery receipts (DLR) with HMAC-SHA256 signatures.',
      href: '/developer/webhooks',
      icon: Webhook,
      badge: 'Real-Time',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Public API Reference',
      description: 'Explore the full OpenAPI 3.0 specification with interactive request simulator and multi-language snippets.',
      href: '/api/docs',
      icon: BookOpen,
      badge: 'Docs',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Developer Hub
            </h1>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              v1.0 REST API Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Build high-throughput messaging workflows with programmatic APIs, webhooks, and sandbox testing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/api/docs" target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <span>Public Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/developer/api-keys">
            <Button size="sm" className="gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Create API Key</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Gateway Environment Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border/80 bg-card shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sandbox Gateway</span>
              <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                Non-billable
              </Badge>
            </div>
            <code className="text-xs font-mono font-semibold text-foreground">
              https://api.range.co.ug/v1
            </code>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            Online
          </Badge>
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-card shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Production Gateway</span>
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                Live Carriers
              </Badge>
            </div>
            <code className="text-xs font-mono font-semibold text-foreground">
              https://api.range.co.ug/v1
            </code>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            Online
          </Badge>
        </div>
      </div>

      {/* 4 Feature Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {HUB_MODULES.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className="group">
              <Card className="h-full bg-card border-border/80 hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {item.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform gap-1">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick-Start Code & Protocol Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick-start snippet (2 cols) */}
        <Card className="lg:col-span-2 bg-card border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Quick Start: Send First SMS</CardTitle>
                  <CardDescription className="text-xs">
                    Dispatch messages via cURL in under 60 seconds
                  </CardDescription>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySnippet}
                className="gap-1.5 text-xs"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy cURL'}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-muted/60 border border-border/60 font-mono text-xs text-foreground overflow-x-auto">
              <pre className="whitespace-pre">{quickSnippet}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Right: Architecture & SDKs (1 col) */}
        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Standards &amp; Reliability</CardTitle>
            <CardDescription className="text-xs">
              Built for enterprise reliability and compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">RFC 9457 Problem Details:</span>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Consistent machine-readable error responses across all endpoints.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Idempotency Keys:</span>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Pass <code className="font-mono text-[10px] bg-muted px-1 rounded">Idempotency-Key</code> header to prevent double billing on network retries.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Deterministic Testing:</span>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Test numbers <code className="font-mono text-[10px] bg-muted px-1 rounded">+999000000001</code> to verify delivery receipts without balance deduction.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <Link href="/api/docs" className="text-primary hover:underline font-semibold flex items-center gap-1">
                <span>Explore complete API documentation &rarr;</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
