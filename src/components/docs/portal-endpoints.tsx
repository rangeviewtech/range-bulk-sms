'use client';

import * as React from 'react';
import {
  Wallet,
  Users,
  Tag,
  Share2,
  BarChart3,
  ChevronRight,
  Send,
  Calendar,
  Layers,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { PORTAL_COLORS, HTTP_METHOD_COLORS } from './portal-tokens';

export interface EndpointItem {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  category: 'Finance' | 'Contacts' | 'Messaging' | 'Webhooks';
  icon: React.ComponentType<{ className?: string }>;
  requestSample?: string;
  responseSample?: string;
}

export const ENDPOINTS_DATA: EndpointItem[] = [
  {
    id: 'SingleSmsSend',
    name: 'Single SMS Dispatch',
    method: 'POST',
    path: '/api/v1/sms/send',
    description: 'Submit an outbound SMS message for immediate queuing and delivery.',
    category: 'Messaging',
    icon: Send,
    requestSample: `curl -X POST https://api.range.co.ug/v1/sms/send \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "to": "+256700123456",\n    "message": "Your verification code is 849201.",\n    "senderId": "RANGE"\n  }'`,
    responseSample: `{\n  "success": true,\n  "messageId": "msg_01j7abc98124",\n  "status": "QUEUED",\n  "recipientCount": 1,\n  "cost": 45.0,\n  "currency": "UGX"\n}`,
  },
  {
    id: 'BulkSmsSend',
    name: 'Bulk SMS Broadcast',
    method: 'POST',
    path: '/api/v1/sms/bulk',
    description: 'Submit batch messages or announcements to multiple recipients simultaneously.',
    category: 'Messaging',
    icon: Layers,
    requestSample: `curl -X POST https://api.range.co.ug/v1/sms/bulk \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "messages": [{\n      "recipients": ["+256700111111", "+256700222222"],\n      "message": "System maintenance alert for tonight.",\n      "senderId": "RANGE"\n    }]\n  }'`,
    responseSample: `{\n  "success": true,\n  "batchId": "batch_981204812",\n  "queuedCount": 2,\n  "status": "SUBMITTED"\n}`,
  },
  {
    id: 'ScheduleSms',
    name: 'Schedule SMS',
    method: 'POST',
    path: '/api/v1/sms/schedule',
    description: 'Schedule SMS dispatches for a future date/time with optional recurring cron rules.',
    category: 'Messaging',
    icon: Calendar,
    requestSample: `curl -X POST https://api.range.co.ug/v1/sms/schedule \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "to": "+256700123456",\n    "message": "Appointment reminder for tomorrow.",\n    "scheduledAt": "2026-09-19T09:00:00Z"\n  }'`,
    responseSample: `{\n  "success": true,\n  "scheduleId": "sch_01j8912401",\n  "scheduledAt": "2026-09-19T09:00:00Z",\n  "status": "SCHEDULED"\n}`,
  },
  {
    id: 'WalletBalance',
    name: 'Wallet & Balance',
    method: 'GET',
    path: '/api/v1/balance',
    description: 'Check your real-time prepaid account balance, credit limit, and SMS capacity.',
    category: 'Finance',
    icon: Wallet,
    requestSample: `curl -X GET https://api.range.co.ug/v1/balance \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    responseSample: `{\n  "data": {\n    "balance": 2019540.0,\n    "currency": "UGX",\n    "smsCredits": 44878,\n    "status": "ACTIVE"\n  }\n}`,
  },
  {
    id: 'SenderId',
    name: 'Sender IDs Registry',
    method: 'POST',
    path: '/api/v1/sender-ids',
    description: 'Register and manage approved alphanumeric Sender IDs for SMS broadcasts.',
    category: 'Messaging',
    icon: Tag,
    requestSample: `curl -X POST https://api.range.co.ug/v1/sender-ids \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "senderId": "RANGE",\n    "purpose": "Transactional verification notifications"\n  }'`,
    responseSample: `{\n  "id": "sdr_01jabc89214",\n  "senderId": "RANGE",\n  "status": "APPROVED",\n  "purpose": "Transactional verification notifications",\n  "createdAt": "2026-09-18T18:00:00Z"\n}`,
  },
  {
    id: 'Contact',
    name: 'Contacts & Address Book',
    method: 'POST',
    path: '/api/v1/contacts',
    description: 'Create, query, update, or tag contacts and audience groups.',
    category: 'Contacts',
    icon: Users,
    requestSample: `curl -X POST https://api.range.co.ug/v1/contacts \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "phone": "+256700123456",\n    "name": "Sarah Namubiru",\n    "email": "sarah@example.ug"\n  }'`,
    responseSample: `{\n  "id": "7d34bc12-98aa-43e1-b45e-8490a0c4f821",\n  "phone": "+256700123456",\n  "name": "Sarah Namubiru",\n  "email": "sarah@example.ug",\n  "createdAt": "2026-09-18T18:00:00Z"\n}`,
  },
  {
    id: 'WebhookDeliveryEvent',
    name: 'Delivery Receipts (DLR)',
    method: 'GET',
    path: '/api/webhooks/sms/delivery',
    description: 'Receive cryptographically signed delivery receipts and carrier status updates.',
    category: 'Webhooks',
    icon: BarChart3,
    requestSample: `curl -X GET https://api.range.co.ug/api/webhooks/sms/delivery \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    responseSample: `{\n  "id": "evt_test_98f12a4b89c0",\n  "type": "message.delivered",\n  "createdAt": "2026-09-18T18:30:00Z",\n  "data": {\n    "messageId": "msg_01j7abc98124",\n    "recipient": "+256700123456",\n    "status": "DELIVERED",\n    "deliveredAt": "2026-09-18T18:30:01Z"\n  }\n}`,
  },
  {
    id: 'WebhookSimulateRequest',
    name: 'Sandbox Delivery Simulator',
    method: 'POST',
    path: '/api/v1/sandbox/simulate-delivery',
    description: 'Simulate delivery events, network delays, and carrier failures in isolated sandbox.',
    category: 'Webhooks',
    icon: Share2,
    requestSample: `curl -X POST https://api.range.co.ug/v1/sandbox/simulate-delivery \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "webhookUrl": "https://webhook.site/demo",\n    "status": "DELIVERED",\n    "recipientPhone": "+256700123456"\n  }'`,
    responseSample: `{\n  "success": true,\n  "eventId": "evt_test_98f12a4b89c0",\n  "delivered": true,\n  "signature": "sha256=a89b..."\n}`,
  },
];

interface PortalEndpointsProps {
  searchQuery: string;
  selectedCategory: string;
  onOpenSwagger?: () => void;
}

export function PortalEndpoints({
  searchQuery,
  selectedCategory,
  onOpenSwagger: _onOpenSwagger,
}: PortalEndpointsProps) {
  const [selectedEndpoint, setSelectedEndpoint] = React.useState<EndpointItem | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Filter endpoints (shows complete reference catalog in default view, full set on filter/search)
  const filtered = React.useMemo(() => {
    const source = ENDPOINTS_DATA;
    return source.filter((ep) => {
      const matchesCat =
        selectedCategory === 'All Categories' || ep.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ep.name.toLowerCase().includes(query) ||
        ep.path.toLowerCase().includes(query) ||
        ep.description.toLowerCase().includes(query) ||
        ep.method.toLowerCase().includes(query) ||
        ep.category.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="space-y-4 py-4">
      {/* Section Header */}
      <div>
        <h2
          className="text-xl sm:text-2xl font-bold tracking-tight"
          style={{ color: PORTAL_COLORS.primaryText }}
        >
          API Endpoints
        </h2>
        <p
          className="text-xs sm:text-sm mt-1"
          style={{ color: PORTAL_COLORS.secondaryText }}
        >
          Explore our complete set of API endpoints for messaging, contacts, and webhooks.
        </p>
      </div>

      {/* Stacked Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div
            className="p-8 text-center rounded-2xl border"
            style={{
              backgroundColor: PORTAL_COLORS.cardBg,
              borderColor: PORTAL_COLORS.border,
              color: PORTAL_COLORS.secondaryText,
            }}
          >
            No endpoints matched your search or category filter.
          </div>
        ) : (
          filtered.map((endpoint) => {
            const Icon = endpoint.icon;
            const methodStyle = HTTP_METHOD_COLORS[endpoint.method] || HTTP_METHOD_COLORS.GET;

            return (
              <div
                key={endpoint.id}
                data-endpoint-id={endpoint.id}
                onClick={() => setSelectedEndpoint(endpoint)}
                className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.003] hover:shadow-lg"
                style={{
                  backgroundColor: PORTAL_COLORS.cardBg,
                  borderColor: PORTAL_COLORS.border,
                }}
              >
                {/* Left side: Icon + Title + Method + Description */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 pr-2 sm:pr-4">
                  {/* Icon Box */}
                  <div
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: PORTAL_COLORS.elevatedBg,
                      color: PORTAL_COLORS.accentBlue,
                      border: `1px solid ${PORTAL_COLORS.borderLight}`,
                    }}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                      <span
                        className="font-bold text-xs sm:text-sm truncate"
                        style={{ color: PORTAL_COLORS.primaryText }}
                      >
                        {endpoint.name}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wide border"
                        style={{
                          backgroundColor: methodStyle.bg,
                          color: methodStyle.text,
                          borderColor: methodStyle.border,
                        }}
                      >
                        {endpoint.method}
                      </span>
                    </div>
                    <p
                      className="text-xs mt-0.5 sm:mt-1 line-clamp-2 sm:truncate"
                      style={{ color: PORTAL_COLORS.secondaryText }}
                    >
                      {endpoint.description}
                    </p>
                  </div>
                </div>

                {/* Right side: Category tag + Chevron */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span
                    className="hidden md:inline-block px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-medium border"
                    style={{
                      backgroundColor: PORTAL_COLORS.elevatedBg,
                      borderColor: PORTAL_COLORS.border,
                      color: PORTAL_COLORS.secondaryText,
                    }}
                  >
                    {endpoint.category}
                  </span>
                  <ChevronRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    style={{ color: PORTAL_COLORS.secondaryText }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Endpoint Detail Slide-Over / Modal */}
      {selectedEndpoint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 duration-200 animate-in fade-in">
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border shadow-[0_24px_64px_rgba(0,0,0,0.4)] p-6 animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: PORTAL_COLORS.cardBg,
              borderColor: PORTAL_COLORS.border,
              color: PORTAL_COLORS.primaryText,
            }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedEndpoint(null)}
              aria-label="Close endpoint details"
              className="absolute top-4 right-4 p-1.5 rounded-md hover:opacity-80 transition-opacity cursor-pointer"
              style={{ color: PORTAL_COLORS.secondaryText, backgroundColor: PORTAL_COLORS.elevatedBg }}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: PORTAL_COLORS.elevatedBg, color: PORTAL_COLORS.accentBlue }}
                >
                  <selectedEndpoint.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold" style={{ color: PORTAL_COLORS.primaryText }}>
                      {selectedEndpoint.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wide border"
                      style={{
                        backgroundColor: HTTP_METHOD_COLORS[selectedEndpoint.method].bg,
                        color: HTTP_METHOD_COLORS[selectedEndpoint.method].text,
                        borderColor: HTTP_METHOD_COLORS[selectedEndpoint.method].border,
                      }}
                    >
                      {selectedEndpoint.method}
                    </span>
                  </div>
                  <p className="font-mono text-xs mt-0.5" style={{ color: PORTAL_COLORS.accentBlue }}>
                    {selectedEndpoint.path}
                  </p>
                </div>
              </div>

              <p className="text-sm" style={{ color: PORTAL_COLORS.secondaryText }}>
                {selectedEndpoint.description}
              </p>

              {/* cURL Request Sample */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: PORTAL_COLORS.secondaryText }}>
                    cURL Request Sample
                  </span>
                  <button
                    onClick={() => handleCopy(selectedEndpoint.requestSample)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-all duration-200 ${
                      copied
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white font-medium border border-emerald-600 hover:border-emerald-700 shadow-sm'
                        : 'hover:opacity-80'
                    }`}
                    style={
                      copied
                        ? undefined
                        : { color: PORTAL_COLORS.accentBlue, backgroundColor: PORTAL_COLORS.elevatedBg }
                    }
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-white stroke-[2.5]" />
                        <span className="text-white font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div
                  className="p-3.5 rounded-xl border font-mono text-xs overflow-x-auto"
                  style={{
                    backgroundColor: PORTAL_COLORS.mainBg,
                    borderColor: PORTAL_COLORS.border,
                    color: PORTAL_COLORS.primaryText,
                  }}
                >
                  <pre className="whitespace-pre">{selectedEndpoint.requestSample}</pre>
                </div>
              </div>

              {/* Response Sample */}
              {selectedEndpoint.responseSample && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: PORTAL_COLORS.secondaryText }}>
                    Response Sample (200 OK)
                  </span>
                  <div
                    className="p-3.5 rounded-xl border font-mono text-xs overflow-x-auto"
                    style={{
                      backgroundColor: PORTAL_COLORS.mainBg,
                      borderColor: PORTAL_COLORS.border,
                      color: PORTAL_COLORS.primaryText,
                    }}
                  >
                    <pre className="whitespace-pre">{selectedEndpoint.responseSample}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
