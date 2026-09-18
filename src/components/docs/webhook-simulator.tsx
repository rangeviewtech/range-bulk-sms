'use client';

import * as React from 'react';
import { Radio, Send, CheckCircle2, AlertTriangle, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WebhookSimulator() {
  const [eventType, setEventType] = React.useState<string>('message.delivered');
  const [webhookUrl, setWebhookUrl] = React.useState<string>('https://webhook.site/test-receiver');
  const [webhookSecret, setWebhookSecret] = React.useState<string>('whsec_test_secret_key_84920');
  const [phone, setPhone] = React.useState<string>('+256700123456');
  const [isSending, setIsSending] = React.useState(false);
  const [result, setResult] = React.useState<{
    success?: boolean;
    error?: string;
    durationMs?: number;
    status?: number;
    payload?: Record<string, unknown>;
  } | null>(null);

  const mockMessageId = React.useMemo(() => `msg_test_${crypto.randomUUID().slice(0, 12)}`, []);

  const simulatedPayload = React.useMemo(() => {
    const status = eventType.replace('message.', '').toUpperCase();
    return {
      id: `evt_test_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      type: eventType,
      createdAt: new Date().toISOString(),
      data: {
        messageId: mockMessageId,
        recipient: phone,
        status,
        deliveredAt: status === 'DELIVERED' ? new Date().toISOString() : null,
        failedAt: ['FAILED', 'UNDELIVERED', 'REJECTED'].includes(status) ? new Date().toISOString() : null,
        failureReason: status === 'FAILED' ? 'Simulated handset unreachable' : null,
        simulated: true,
      },
    };
  }, [eventType, mockMessageId, phone]);

  const handleSimulate = async () => {
    setIsSending(true);
    setResult(null);
    const startTime = Date.now();

    try {
      const res = await fetch('/api/v1/sandbox/simulate-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          webhookSecret,
          messageId: mockMessageId,
          recipientPhone: phone,
          status: eventType.replace('message.', '').toUpperCase(),
        }),
      });

      const data = await res.json();
      const durationMs = Date.now() - startTime;

      if (res.ok) {
        setResult({
          success: true,
          status: data.dispatchResult?.statusCode || 200,
          durationMs: data.dispatchResult?.durationMs || durationMs,
          payload: data.simulatedEvent,
          error: data.dispatchResult?.error,
        });
      } else {
        setResult({
          success: false,
          error: data.detail || data.title || 'Simulation request rejected',
          durationMs,
        });
      }
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Network error during simulation',
        durationMs: Date.now() - startTime,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full space-y-6 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Radio className="h-5 w-5 text-[#04648C] dark:text-[#FBCA07]" />
          Interactive Webhooks & DLR Delivery Simulator
        </h2>
        <p className="text-xs text-muted-foreground">
          Test real-time delivery receipt callbacks with HMAC SHA-256 signatures before deploying to production.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Card */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Delivery Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-[#04648C] outline-none"
            >
              <option value="message.delivered">message.delivered (Handset delivery confirmed)</option>
              <option value="message.failed">message.failed (Carrier network rejection)</option>
              <option value="message.undelivered">message.undelivered (Handset offline/timeout)</option>
              <option value="message.sent">message.sent (Dispatched to carrier)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Destination Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-api.com/webhooks/sms"
              className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-[#04648C] outline-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Internal private IP ranges (127.0.0.1, 10.x, 192.168.x) are blocked by SSRF protection.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-[#FBCA07]" /> Webhook HMAC Secret
            </label>
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full p-2 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-[#04648C] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Recipient Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-[#04648C] outline-none"
            />
          </div>

          <Button
            onClick={handleSimulate}
            disabled={isSending}
            className="w-full bg-[#04648C] hover:bg-[#034f6f] text-white font-semibold text-xs h-9 rounded-xl flex items-center justify-center gap-2 shadow-sm"
          >
            {isSending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Dispatched...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" /> Send Simulated Webhook Event
              </>
            )}
          </Button>

          {/* Delivery Attempt Feedback */}
          {result && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
                result.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                )}
                <span>
                  {result.success ? `Webhook Dispatched (HTTP ${result.status})` : 'Simulation Failed'}
                </span>
                {result.durationMs !== undefined && (
                  <span className="text-[11px] font-mono text-muted-foreground ml-auto">
                    {result.durationMs} ms
                  </span>
                )}
              </div>
              {result.error && <p className="text-[11px] opacity-90">{result.error}</p>}
            </div>
          )}
        </div>

        {/* Payload Preview Card */}
        <div className="flex flex-col rounded-2xl border border-border bg-[#07163D] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#03102E] border-b border-border/40 text-xs text-slate-300">
            <span className="font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Event Payload (application/json)
            </span>
            <span className="text-[10px] font-mono text-[#FBCA07] uppercase font-bold">
              X-Range-Signature: sha256=...
            </span>
          </div>
          <div className="p-4 flex-1 overflow-x-auto text-slate-100 font-mono text-xs leading-relaxed">
            <pre className="whitespace-pre">{JSON.stringify(simulatedPayload, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
