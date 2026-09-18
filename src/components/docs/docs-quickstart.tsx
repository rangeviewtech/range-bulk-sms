'use client';

import * as React from 'react';
import { Copy, Check, Terminal, Zap, Shield, ArrowRight } from 'lucide-react';
import { DETERMINISTIC_TEST_NUMBERS } from '@/lib/sms/sandbox';

export function DocsQuickStart({
  environment,
  onSwitchToSnippets,
}: {
  environment: 'sandbox' | 'production';
  onSwitchToSnippets?: () => void;
}) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleCurl = `curl --request POST \\
  --url ${environment === 'sandbox' ? 'http://localhost:3000/api/v1/sms/send' : 'https://api.rangesms.com/v1/sms/send'} \\
  --header 'Authorization: Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx' \\
  --header 'Content-Type: application/json' \\
  --header 'Idempotency-Key: ${crypto.randomUUID()}' \\
  --data '{
    "to": "+999000000001",
    "senderId": "RANGE",
    "message": "Hello from Range Bulk SMS Developer API!"
  }'`;

  return (
    <div className="w-full space-y-8 py-6">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#04648C]/10 via-background to-[#FBCA07]/10 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FBCA07] text-[#141B2D]">
              <Zap className="h-3.5 w-3.5" /> High-Throughput Messaging
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
              REST / JSON
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
              OpenAPI 3.0.3
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Deterministic Sandbox Available
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Range Bulk SMS Developer Platform
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Integrate enterprise-grade SMS dispatch, real-time carrier delivery receipts (DLR), address book sync, and scheduled campaigns into your backend. Connect via standard HTTP REST endpoints with zero vendor lock-in.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href="#/SMS/sendSingleSms"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04648C] hover:bg-[#034f6f] text-white font-medium text-sm transition-all shadow-sm"
            >
              Explore API Reference <ArrowRight className="h-4 w-4" />
            </a>
            <button
              onClick={onSwitchToSnippets}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-medium text-sm transition-all"
            >
              Multi-Language SDKs
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Quick Start Guide */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Terminal className="h-5 w-5 text-[#04648C] dark:text-[#FBCA07]" />
          Send Your First SMS in 5 Minutes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#04648C] dark:text-[#FBCA07] uppercase tracking-wider">
              <span className="h-6 w-6 rounded-full bg-[#04648C]/10 dark:bg-[#FBCA07]/20 flex items-center justify-center font-bold">1</span>
              Obtain API Key
            </div>
            <h3 className="font-semibold text-foreground text-sm">Generate your developer credentials</h3>
            <p className="text-xs text-muted-foreground">
              Navigate to the dashboard API Keys section. Sandbox keys start with <code>rsms_test_</code> and let you test for free without billing your wallet.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#04648C] dark:text-[#FBCA07] uppercase tracking-wider">
              <span className="h-6 w-6 rounded-full bg-[#04648C]/10 dark:bg-[#FBCA07]/20 flex items-center justify-center font-bold">2</span>
              Select Test Environment
            </div>
            <h3 className="font-semibold text-foreground text-sm">Safe isolated execution</h3>
            <p className="text-xs text-muted-foreground">
              Toggle the header switch to <strong>Sandbox</strong>. Requests to <code>/api/v1</code> will exercise real validation logic without reaching mobile network operators.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#04648C] dark:text-[#FBCA07] uppercase tracking-wider">
              <span className="h-6 w-6 rounded-full bg-[#04648C]/10 dark:bg-[#FBCA07]/20 flex items-center justify-center font-bold">3</span>
              Dispatch Outbound SMS
            </div>
            <h3 className="font-semibold text-foreground text-sm">Submit POST /api/v1/sms/send</h3>
            <p className="text-xs text-muted-foreground">
              Provide recipient phone, message body, and optional idempotency key. Use test recipient <code>+999000000001</code> for guaranteed delivery simulation.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#04648C] dark:text-[#FBCA07] uppercase tracking-wider">
              <span className="h-6 w-6 rounded-full bg-[#04648C]/10 dark:bg-[#FBCA07]/20 flex items-center justify-center font-bold">4</span>
              Verify Delivery Receipt
            </div>
            <h3 className="font-semibold text-foreground text-sm">Inspect status & Webhook callbacks</h3>
            <p className="text-xs text-muted-foreground">
              Poll <code>/api/v1/sms/status/&#123;id&#125;</code> or receive HMAC-signed Webhook events directly at your webhook server.
            </p>
          </div>
        </div>
      </div>

      {/* Copyable Quickstart Code Block */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>Executable cURL Request Sample</span>
            <span className="text-xs font-normal text-muted-foreground">({environment.toUpperCase()})</span>
          </h3>
          <button
            onClick={() => copyToClipboard(sampleCurl, 'curl')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            {copiedKey === 'curl' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedKey === 'curl' ? 'Copied!' : 'Copy cURL'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#07163D] text-slate-100 font-mono text-xs overflow-x-auto shadow-inner border border-border">
          <pre className="whitespace-pre">{sampleCurl}</pre>
        </div>
      </div>

      {/* Deterministic Sandbox Numbers Reference Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#04648C] dark:text-[#FBCA07]" />
            Deterministic Sandbox Test Phone Numbers (Reserved Non-Routable)
          </h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="p-3">Test Phone Number</th>
                <th className="p-3">Simulated Outcome</th>
                <th className="p-3">HTTP Status</th>
                <th className="p-3">Carrier / Wallet Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              <tr>
                <td className="p-3 font-bold text-[#04648C] dark:text-[#FBCA07]">{DETERMINISTIC_TEST_NUMBERS.DELIVERED}</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-sans">DELIVERED (Instant successful handset receipt)</td>
                <td className="p-3">201 Created</td>
                <td className="p-3 font-sans text-muted-foreground">None (0 UGX)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#04648C] dark:text-[#FBCA07]">{DETERMINISTIC_TEST_NUMBERS.REJECTED}</td>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-sans">REJECTED (Carrier firewall / blacklisted recipient)</td>
                <td className="p-3">201 Created</td>
                <td className="p-3 font-sans text-muted-foreground">None (0 UGX)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#04648C] dark:text-[#FBCA07]">{DETERMINISTIC_TEST_NUMBERS.UNDELIVERED}</td>
                <td className="p-3 text-amber-600 dark:text-amber-400 font-sans">UNDELIVERED (Network timeout / handset switched off)</td>
                <td className="p-3">201 Created</td>
                <td className="p-3 font-sans text-muted-foreground">None (0 UGX)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#04648C] dark:text-[#FBCA07]">{DETERMINISTIC_TEST_NUMBERS.INSUFFICIENT_BALANCE}</td>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-sans">INSUFFICIENT_BALANCE (Low wallet credit simulation)</td>
                <td className="p-3 text-rose-600">402 Payment Required</td>
                <td className="p-3 font-sans text-muted-foreground">None (0 UGX)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#04648C] dark:text-[#FBCA07]">{DETERMINISTIC_TEST_NUMBERS.INVALID_SENDER}</td>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-sans">INVALID_SENDER (Unapproved sender ID error)</td>
                <td className="p-3 text-rose-600">400 Bad Request</td>
                <td className="p-3 font-sans text-muted-foreground">None (0 UGX)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#04648C] dark:text-[#FBCA07]">{DETERMINISTIC_TEST_NUMBERS.QUEUED_THEN_DELIVERED}</td>
                <td className="p-3 text-blue-600 dark:text-blue-400 font-sans">QUEUED → SUBMITTED → DELIVERED (Lifecycle progression)</td>
                <td className="p-3">201 Created</td>
                <td className="p-3 font-sans text-muted-foreground">None (0 UGX)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
