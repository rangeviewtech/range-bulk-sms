'use client';

import * as React from 'react';
import { useState } from 'react';
import { isDev, formatErrorForEnv } from '@/lib/env';
import { AlertTriangle, RefreshCw, LifeBuoy, Terminal, Copy, Check } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const formatted = formatErrorForEnv(error);

  const copyDiagnosticLog = () => {
    const log = JSON.stringify(formatted, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(log);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReload = () => {
    if (typeof reset === 'function') {
      reset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <html lang="en" className="dark">
      <head>
        <title>Application Error | Range Bulk SMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#0b1329] text-slate-100 antialiased font-sans min-h-screen flex flex-col justify-between selection:bg-[#FBCA07]/20 selection:text-[#FBCA07]">
        {/* Ambient background glows */}
        <div
          className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-500/10 rounded-full blur-3xl opacity-60"
          aria-hidden="true"
        />

        {/* Minimal Header */}
        <header className="w-full border-b border-slate-800/80 bg-[#0b1329]/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Brand Logo mark */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FBCA07] flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
                  R
                </div>
                <span className="font-bold text-lg tracking-tight text-white">Range View</span>
              </div>
            </div>
            <a
              href="mailto:support@rangeview.com"
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-[#FBCA07]" />
              <span>Contact Support</span>
            </a>
          </div>
        </header>

        {/* Main Error Container */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-2xl mx-auto w-full text-center relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-950/80 text-red-400 border border-red-800/80 mb-6 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>CRITICAL APPLICATION ERROR</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            System Runtime Interrupted
          </h1>

          {/* Short explanation */}
          <p className="text-base text-slate-300 max-w-lg mb-8 leading-relaxed">
            The platform root environment encountered an unexpected exception. Please reload
            the application to re-initialize your session.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-sm mb-10">
            <button
              onClick={handleReload}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#FBCA07] hover:bg-[#FBCA07]/90 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Platform</span>
            </button>

            <a
              href="mailto:support@rangeview.com"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <LifeBuoy className="w-4 h-4 text-[#FBCA07]" />
              <span>Support Desk</span>
            </a>
          </div>

          {/* Technical Diagnostics */}
          <div className="w-full text-left bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-[#FBCA07]" />
                <span className="text-[11px] font-semibold uppercase">Incident Telemetry</span>
              </div>
              <button
                onClick={copyDiagnosticLog}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ${
                  copied
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500">Error:</span>{' '}
                <span className="text-red-400 font-medium">{formatted.title}</span>
              </div>
              {formatted.digest && (
                <div>
                  <span className="text-slate-500">Digest:</span>{' '}
                  <span className="text-cyan-400">{formatted.digest}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Timestamp:</span> {formatted.timestamp}
              </div>
            </div>

            {isDev && formatted.stack && (
              <pre className="mt-3 p-3 bg-black/60 rounded border border-slate-800 text-[10px] text-slate-400 overflow-x-auto max-h-40 whitespace-pre-wrap">
                {formatted.stack}
              </pre>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Range View SMS Platform. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
