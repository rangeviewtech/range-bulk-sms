"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Terminal, Copy, Check, ShieldAlert } from 'lucide-react';
import { isDev, formatErrorForEnv } from '@/lib/env';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string; statusCode?: number; code?: string; details?: unknown };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const formatted = formatErrorForEnv(error);

  useEffect(() => {
    console.error('[Error Boundary Caught]:', error);
  }, [error]);

  const copyDiagnosticLog = () => {
    const log = JSON.stringify(formatted, null, 2);
    navigator.clipboard.writeText(log);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // DEVELOPMENT MODE: Rich diagnostic telemetry, stack trace, error payload details, copy button
  if (isDev) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center p-6 bg-slate-900 text-slate-100 rounded-lg my-8 max-w-4xl mx-auto border border-red-900 shadow-2xl">
        {/* DEV MODE BADGE */}
        <div className="flex items-center gap-2 px-3 py-1 bg-red-950 border border-red-700 text-red-400 rounded-full text-xs font-mono mb-6">
          <Terminal className="w-3.5 h-3.5" />
          <span>DEVELOPMENT MODE DIAGNOSTIC</span>
        </div>

        <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        
        <h2 className="text-2xl font-bold text-red-400 mb-2 font-mono">
          {formatted.title}
        </h2>
        
        <p className="text-slate-300 font-mono text-sm mb-6 max-w-2xl text-center bg-slate-950/70 p-3 rounded border border-slate-800">
          {formatted.message}
        </p>

        {/* VERBOSE DEV DIAGNOSTIC STACK TRACE & PAYLOAD */}
        <div className="w-full bg-slate-950 p-4 rounded-md border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto mb-6 text-left max-h-60 overflow-y-auto">
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2 mb-2">
            <span>Stack Trace & Diagnostics</span>
            <button 
              onClick={copyDiagnosticLog}
              className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 bg-slate-800 rounded text-[10px]"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied Log' : 'Copy Log'}</span>
            </button>
          </div>
          {formatted.digest && <div className="text-amber-400 mb-1">Digest: {formatted.digest}</div>}
          {formatted.code && <div className="text-cyan-400 mb-1">Code: {formatted.code}</div>}
          {formatted.stack ? (
            <pre className="text-slate-400 whitespace-pre-wrap leading-relaxed">{formatted.stack}</pre>
          ) : (
            <div className="text-slate-500 italic">No stack trace available.</div>
          )}
        </div>

        <div className="flex gap-4">
          <Button onClick={reset} variant="destructive" className="font-mono">
            Reset Component state
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" className="font-mono bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // PRODUCTION MODE: Minimal, clean, friendly, non-technical user feedback
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-8">
      <ShieldAlert className="w-20 h-20 text-muted-foreground/60 mb-6" />
      <h2 className="text-2xl font-semibold mb-3">Something went wrong</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        {formatted.message}
      </p>
      <Button onClick={reset} size="lg" variant="brand" className="shadow-sm">
        Try Again
      </Button>
    </div>
  );
}
