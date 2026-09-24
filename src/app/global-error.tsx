"use client";

import { isDev, formatErrorForEnv } from '@/lib/env';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const formatted = formatErrorForEnv(error);

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased font-sans">
        <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
          {isDev ? (
            <div className="w-full max-w-3xl bg-slate-900 text-slate-100 p-8 rounded-xl border border-red-800 text-left shadow-2xl">
              <div className="inline-block px-3 py-1 bg-red-950 border border-red-700 text-red-400 rounded-full text-xs font-mono mb-4">
                DEVELOPMENT GLOBAL ERROR
              </div>
              <h2 className="text-3xl font-mono font-bold text-red-400 mb-2">
                {formatted.title}
              </h2>
              <p className="font-mono text-sm text-slate-300 mb-6 bg-slate-950 p-3 rounded border border-slate-800">
                {formatted.message}
              </p>
              {formatted.stack && (
                <pre className="font-mono text-xs text-slate-400 bg-slate-950 p-4 rounded overflow-x-auto max-h-64 mb-6 border border-slate-800">
                  {formatted.stack}
                </pre>
              )}
              <button
                onClick={reset}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono rounded-md transition-colors"
              >
                Reload Global Application
              </button>
            </div>
          ) : (
            <div className="max-w-md text-center">
              <h2 className="text-3xl font-bold mb-4">Application Error</h2>
              <p className="text-muted-foreground mb-8">
                An unexpected error occurred. Please refresh the page or contact support if the problem persists.
              </p>
              <button
                onClick={reset}
                className="px-6 py-2.5 bg-brand-yellow hover:bg-amber-400 text-brand-dark font-semibold rounded-md shadow-sm transition-colors"
              >
                Reload Page
              </button>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
