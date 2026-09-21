'use client';

import * as React from 'react';
import { Search, Hash, BookOpen, AlertCircle, ArrowRight, X } from 'lucide-react';

interface SearchItem {
  id: string;
  category: 'Endpoint' | 'Schema' | 'Error Code' | 'Guide';
  title: string;
  subtitle: string;
  href: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

const SEARCH_ITEMS: SearchItem[] = [
  // Endpoints
  {
    id: 'ep-send',
    category: 'Endpoint',
    title: '/api/v1/sms/send',
    subtitle: 'Send a single SMS message (Immediate / Sandbox simulated)',
    href: '#/SMS/sendSingleSms',
    method: 'POST',
  },
  {
    id: 'ep-bulk',
    category: 'Endpoint',
    title: '/api/v1/sms/bulk',
    subtitle: 'Submit multiple messages or batch dispatches asynchronously',
    href: '#/SMS/sendBulkSms',
    method: 'POST',
  },
  {
    id: 'ep-schedule',
    category: 'Endpoint',
    title: '/api/v1/sms/schedule',
    subtitle: 'Schedule SMS dispatches for future timestamps with recurrence',
    href: '#/SMS/scheduleSms',
    method: 'POST',
  },
  {
    id: 'ep-status',
    category: 'Endpoint',
    title: '/api/v1/sms/status/{id}',
    subtitle: 'Retrieve real-time message status, delivery report, and carrier logs',
    href: '#/SMS/getMessageStatus',
    method: 'GET',
  },
  {
    id: 'ep-balance',
    category: 'Endpoint',
    title: '/api/v1/balance',
    subtitle: 'Query active wallet credits and currency',
    href: '#/Wallet/getWalletBalance',
    method: 'GET',
  },
  {
    id: 'ep-contacts',
    category: 'Endpoint',
    title: '/api/v1/contacts',
    subtitle: 'Paginated address book list and contact creation',
    href: '#/Contacts/listContacts',
    method: 'GET',
  },
  {
    id: 'ep-sender-ids',
    category: 'Endpoint',
    title: '/api/v1/sender-ids',
    subtitle: 'List verified alphanumeric sender IDs registered to account',
    href: '#/Sender%20IDs/listSenderIds',
    method: 'GET',
  },
  {
    id: 'ep-sim-dlr',
    category: 'Endpoint',
    title: '/api/v1/sandbox/simulate-delivery',
    subtitle: 'Simulate DLR delivery callbacks with HMAC SHA-256 signature',
    href: '#/Sandbox/simulateDeliveryCallback',
    method: 'POST',
  },
  // Schemas
  {
    id: 'schema-sms-req',
    category: 'Schema',
    title: 'SmsRequest',
    subtitle: 'Payload specification for single SMS dispatch',
    href: '#/components/schemas/SmsRequest',
  },
  {
    id: 'schema-dlr',
    category: 'Schema',
    title: 'DeliveryReport',
    subtitle: 'Carrier delivery report object with recipient states',
    href: '#/components/schemas/DeliveryReport',
  },
  {
    id: 'schema-problem-details',
    category: 'Schema',
    title: 'ProblemDetails (RFC 9457)',
    subtitle: 'Standardized machine-readable error format',
    href: '#/components/schemas/ProblemDetails',
  },
  // Error Codes
  {
    id: 'err-insufficient-balance',
    category: 'Error Code',
    title: 'insufficient_balance (HTTP 402)',
    subtitle: 'Account has insufficient credits for the requested dispatch',
    href: '#/components/schemas/ProblemDetails',
  },
  {
    id: 'err-invalid-recipient',
    category: 'Error Code',
    title: 'invalid_recipient (HTTP 400)',
    subtitle: 'Recipient telephone number failed international E.164 format validation',
    href: '#/components/schemas/ProblemDetails',
  },
  {
    id: 'err-invalid-sender',
    category: 'Error Code',
    title: 'invalid_sender (HTTP 400)',
    subtitle: 'Sender ID is unapproved, suspended, or does not belong to account',
    href: '#/components/schemas/ProblemDetails',
  },
  {
    id: 'err-rate-limit',
    category: 'Error Code',
    title: 'rate_limit_exceeded (HTTP 429)',
    subtitle: 'Throughput or velocity threshold exceeded for current API key',
    href: '#/components/schemas/ProblemDetails',
  },
  // Guides
  {
    id: 'guide-quickstart',
    category: 'Guide',
    title: 'First SMS in 5 Minutes',
    subtitle: 'Step-by-step onboarding for sending initial test SMS',
    href: '#quickstart',
  },
  {
    id: 'guide-deterministic-numbers',
    category: 'Guide',
    title: 'Deterministic Sandbox Numbers',
    subtitle: 'Pre-configured test phone numbers (+999000000001 - +999000000006)',
    href: '#quickstart',
  },
  {
    id: 'guide-webhooks-security',
    category: 'Guide',
    title: 'Webhook HMAC SHA-256 Verification',
    subtitle: 'Validating signatures on incoming delivery receipts',
    href: '#webhooks',
  },
];

export function DocsSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts (Escape to close, Cmd+K to toggle)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCH_ITEMS;
    return SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    onClose();
    if (item.href.startsWith('#')) {
      window.location.hash = item.href;
    }
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_64px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Global Documentation Search"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-muted/30">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyNavigation}
            placeholder="Search endpoints, parameters, schemas, error codes..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-muted-foreground hover:text-foreground rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-background border rounded text-muted-foreground shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-border/50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No matching documentation results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-secondary/15 text-foreground' : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {item.category === 'Endpoint' ? (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.method === 'POST'
                              ? 'bg-[#04648C] text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {item.method}
                        </span>
                      ) : item.category === 'Schema' ? (
                        <Hash className="h-4 w-4 text-[#04648C] dark:text-[#FBCA07]" />
                      ) : item.category === 'Error Code' ? (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-[#FBCA07]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{item.title}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isSelected ? 'text-[#04648C] dark:text-[#FBCA07] translate-x-1' : 'text-muted-foreground'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Keys Hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1 py-0.5 border rounded bg-background">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 border rounded bg-background">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 border rounded bg-background">↵</kbd> to select
            </span>
          </div>
          <span>Range Developer Documentation</span>
        </div>
      </div>
    </div>
  );
}
