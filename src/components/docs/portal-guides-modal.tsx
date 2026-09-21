'use client';

import * as React from 'react';
import { X, Shield, AlertTriangle, Gauge, CheckCircle2, Copy, Check } from 'lucide-react';
import { PORTAL_COLORS } from './portal-tokens';

export type GuideTopic = 'authentication' | 'errors' | 'rate-limits' | 'best-practices';

interface PortalGuidesModalProps {
  topic: GuideTopic | null;
  onClose: () => void;
}

export function PortalGuidesModal({ topic, onClose }: PortalGuidesModalProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!topic) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 duration-200 animate-in fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl border shadow-[0_24px_64px_rgba(0,0,0,0.4)] p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: PORTAL_COLORS.cardBg,
          borderColor: PORTAL_COLORS.border,
          color: PORTAL_COLORS.primaryText,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close guide modal"
          className="absolute top-4 right-4 p-1.5 rounded-md hover:opacity-80 transition-opacity cursor-pointer"
          style={{ color: PORTAL_COLORS.secondaryText, backgroundColor: PORTAL_COLORS.elevatedBg }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Authentication Guide */}
        {topic === 'authentication' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: PORTAL_COLORS.elevatedBg, color: PORTAL_COLORS.accentBlue }}
              >
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: PORTAL_COLORS.primaryText }}>
                  API Authentication & Security
                </h2>
                <p className="text-sm" style={{ color: PORTAL_COLORS.secondaryText }}>
                  Authenticate your server requests using secure API Bearer keys.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm" style={{ color: PORTAL_COLORS.secondaryText }}>
              <p>
                All REST API requests to Range Bulk SMS must be transmitted over HTTPS with an authorized API key provided in the <code>Authorization</code> request header.
              </p>

              <div
                className="p-4 rounded-xl border relative font-mono text-xs"
                style={{ backgroundColor: PORTAL_COLORS.codeBg, borderColor: PORTAL_COLORS.border }}
              >
                <span className="text-[#35B6FF]">Authorization</span>: Bearer rsms_live_9b83f0...
                <button
                  onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY')}
                  className={`absolute right-3 top-3 p-1.5 rounded transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-600 text-white border border-emerald-600 shadow-sm'
                      : 'hover:opacity-80'
                  }`}
                  style={copied ? undefined : { color: PORTAL_COLORS.secondaryText }}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <h3 className="font-semibold text-base mt-4" style={{ color: PORTAL_COLORS.primaryText }}>
                Key Formats
              </h3>
              <ul className="space-y-2 list-disc pl-5">
                <li><code>rsms_test_...</code>: Sandbox testing keys. Operates with non-routable numbers (+999000000001 - +999000000006) without billing your account.</li>
                <li><code>rsms_live_...</code>: Production keys. Transmits directly to live cellular carrier routes. Deducts balance from your active wallet.</li>
              </ul>

              <h3 className="font-semibold text-base mt-4" style={{ color: PORTAL_COLORS.primaryText }}>
                IP Whitelisting
              </h3>
              <p>
                You can configure CIDR or static IPv4 whitelists for each API key in your developer settings. Unlisted IPs attempting to authenticate will receive an immediate <code>403 Forbidden</code> response.
              </p>
            </div>
          </div>
        )}

        {/* Error Codes Guide */}
        {topic === 'errors' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: PORTAL_COLORS.elevatedBg, color: PORTAL_COLORS.primaryYellow }}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: PORTAL_COLORS.primaryText }}>
                  RFC 9457 Standardized Problem Details
                </h2>
                <p className="text-sm" style={{ color: PORTAL_COLORS.secondaryText }}>
                  All error responses return machine-readable RFC 9457 standard JSON.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm" style={{ color: PORTAL_COLORS.secondaryText }}>
              <div
                className="p-4 rounded-xl border font-mono text-xs overflow-x-auto"
                style={{ backgroundColor: PORTAL_COLORS.codeBg, borderColor: PORTAL_COLORS.border }}
              >
                <pre>{`{
  "type": "https://docs.rangesms.com/errors/invalid-recipient",
  "title": "Invalid recipient phone number",
  "status": 400,
  "detail": "The recipient phone number must be in E.164 international format.",
  "code": "invalid_recipient",
  "instance": "/api/v1/sms/send",
  "requestId": "req_01jabc123456"
}`}</pre>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg border" style={{ borderColor: PORTAL_COLORS.border, backgroundColor: PORTAL_COLORS.elevatedBg }}>
                  <span className="font-mono font-bold text-amber-400">400 Bad Request:</span> Malformed payload or validation failure (e.g. missing E.164 phone formatting).
                </div>
                <div className="p-3 rounded-lg border" style={{ borderColor: PORTAL_COLORS.border, backgroundColor: PORTAL_COLORS.elevatedBg }}>
                  <span className="font-mono font-bold text-rose-400">401 Unauthorized:</span> Missing or invalid API key in the Authorization header.
                </div>
                <div className="p-3 rounded-lg border" style={{ borderColor: PORTAL_COLORS.border, backgroundColor: PORTAL_COLORS.elevatedBg }}>
                  <span className="font-mono font-bold text-rose-400">403 Forbidden:</span> Key lacks required permissions, is expired, revoked, or client IP is not in whitelist.
                </div>
                <div className="p-3 rounded-lg border" style={{ borderColor: PORTAL_COLORS.border, backgroundColor: PORTAL_COLORS.elevatedBg }}>
                  <span className="font-mono font-bold text-purple-400">429 Too Many Requests:</span> Distributed rate limit threshold exceeded. Check <code>Retry-After</code> header.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rate Limits Guide */}
        {topic === 'rate-limits' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: PORTAL_COLORS.elevatedBg, color: PORTAL_COLORS.successGreen }}
              >
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: PORTAL_COLORS.primaryText }}>
                  Distributed Rate Limits & Quotas
                </h2>
                <p className="text-sm" style={{ color: PORTAL_COLORS.secondaryText }}>
                  Governed via Upstash Redis distributed sliding window counters.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm" style={{ color: PORTAL_COLORS.secondaryText }}>
              <p>
                To safeguard throughput and ensure guaranteed quality of service, endpoints enforce standard distributed rate limits per API key:
              </p>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: PORTAL_COLORS.border }}>
                    <th className="py-2 font-semibold">Tier / Route</th>
                    <th className="py-2 font-semibold">Rate Limit</th>
                    <th className="py-2 font-semibold">Burst Allowance</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: PORTAL_COLORS.border }}>
                  <tr>
                    <td className="py-2.5 font-mono text-xs">/api/v1/sms/send</td>
                    <td className="py-2.5">60 requests / min</td>
                    <td className="py-2.5">100 concurrent</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-mono text-xs">/api/v1/sms/bulk</td>
                    <td className="py-2.5">20 batches / min</td>
                    <td className="py-2.5">1,000 numbers/batch</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-mono text-xs">/api/v1/balance</td>
                    <td className="py-2.5">120 requests / min</td>
                    <td className="py-2.5">150 concurrent</td>
                  </tr>
                </tbody>
              </table>

              <h3 className="font-semibold text-base mt-4" style={{ color: PORTAL_COLORS.primaryText }}>
                Rate Limit Response Headers
              </h3>
              <ul className="space-y-1 font-mono text-xs list-disc pl-5">
                <li>X-RateLimit-Limit: 60</li>
                <li>X-RateLimit-Remaining: 58</li>
                <li>X-RateLimit-Reset: 1726700000</li>
              </ul>
            </div>
          </div>
        )}

        {/* Best Practices Guide */}
        {topic === 'best-practices' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: PORTAL_COLORS.elevatedBg, color: PORTAL_COLORS.accentBlue }}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: PORTAL_COLORS.primaryText }}>
                  Production Integration Best Practices
                </h2>
                <p className="text-sm" style={{ color: PORTAL_COLORS.secondaryText }}>
                  Guidelines for building reliable and resilient messaging applications.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm" style={{ color: PORTAL_COLORS.secondaryText }}>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border" style={{ borderColor: PORTAL_COLORS.border, backgroundColor: PORTAL_COLORS.elevatedBg }}>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: PORTAL_COLORS.primaryText }}>
                    1. Always Supply an Idempotency-Key
                  </h4>
                  <p className="text-xs">
                    Pass a unique UUID in the <code>Idempotency-Key</code> header with every outbound SMS. This guarantees exactly-once dispatch even if your network connection drops during response delivery.
                  </p>
                </div>

                <div className="p-4 rounded-xl border" style={{ borderColor: PORTAL_COLORS.border, backgroundColor: PORTAL_COLORS.elevatedBg }}>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: PORTAL_COLORS.primaryText }}>
                    2. Use Asynchronous Webhooks for Delivery Status
                  </h4>
                  <p className="text-xs">
                    Instead of polling <code>/api/v1/sms/status/:id</code> in tight loops, register a webhook URL. Range will stream HMAC SHA-256 signed delivery events (DLR) to your server as soon as the carrier handset responds.
                  </p>
                </div>

                <div className="p-4 rounded-xl border" style={{ borderColor: PORTAL_COLORS.border, backgroundColor: PORTAL_COLORS.elevatedBg }}>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: PORTAL_COLORS.primaryText }}>
                    3. Leverage Bulk Endpoints for Batch Notifications
                  </h4>
                  <p className="text-xs">
                    When dispatching announcements to over 5 recipients, use <code>/api/v1/sms/bulk</code> instead of looping through single SMS API calls to maximize throughput.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
