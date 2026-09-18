'use client';

import * as React from 'react';
import { GitBranch, Calendar, ShieldCheck, Tag } from 'lucide-react';

interface Release {
  version: string;
  date: string;
  status: 'CURRENT' | 'BETA' | 'DEPRECATED';
  summary: string;
  changes: {
    type: 'Added' | 'Changed' | 'Security' | 'Fixed';
    description: string;
  }[];
}

const RELEASES: Release[] = [
  {
    version: 'v1.0.0',
    date: '2026-09-18',
    status: 'CURRENT',
    summary: 'Public Enterprise Bulk SMS API Launch with full OpenAPI 3.0.3 contract and isolated Sandbox.',
    changes: [
      {
        type: 'Added',
        description: 'Single SMS dispatch endpoint (/api/v1/sms/send) with support for both "to" and "recipients".',
      },
      {
        type: 'Added',
        description: 'Deterministic Sandbox non-routable numbers (+999000000001 - +999000000006) for non-billable test execution.',
      },
      {
        type: 'Added',
        description: 'Asynchronous bulk SMS batch ingestion (/api/v1/sms/bulk) with wallet cost deduplication.',
      },
      {
        type: 'Added',
        description: 'Real-time scheduled dispatches (/api/v1/sms/schedule) and status lookups (/api/v1/sms/status/{id}).',
      },
      {
        type: 'Added',
        description: 'Interactive DLR delivery callback simulator with canonical HMAC SHA-256 signatures.',
      },
      {
        type: 'Security',
        description: 'Enforced tenant isolation, constant-time secret comparison, and SSRF filtering on webhook endpoints.',
      },
      {
        type: 'Changed',
        description: 'Standardized error responses to RFC 9457 Problem Details format (application/problem+json).',
      },
    ],
  },
];

export function ChangelogPanel() {
  return (
    <div className="w-full space-y-6 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-[#04648C] dark:text-[#FBCA07]" />
          API Changelog & Versioning Policy
        </h2>
        <p className="text-xs text-muted-foreground">
          Track additions, breaking change announcements, and security enhancements for the Range Bulk SMS platform.
        </p>
      </div>

      {/* Versioning Policy Card */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs text-xs space-y-2">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Backwards Compatibility Guarantee
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          The <code>/v1/</code> API is permanently backwards-compatible. New fields may be added to responses, but existing fields and endpoints will not be removed or mutated without a minimum 12-month deprecation sunset notice.
        </p>
      </div>

      {/* Release Timeline */}
      <div className="space-y-6">
        {RELEASES.map((release) => (
          <div
            key={release.version}
            className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#04648C] dark:text-[#FBCA07]" />
                <span className="text-base font-bold text-foreground">{release.version}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {release.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{release.date}</span>
              </div>
            </div>

            <p className="text-xs text-foreground font-medium">{release.summary}</p>

            <ul className="space-y-2 text-xs">
              {release.changes.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      c.type === 'Added'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : c.type === 'Security'
                        ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                        : c.type === 'Changed'
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {c.type}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{c.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
