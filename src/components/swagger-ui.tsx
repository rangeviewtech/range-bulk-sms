'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import '@/styles/swagger-theme.css';

declare global {
  interface Window {
    SwaggerUIBundle?: (options: {
      spec: Record<string, unknown>;
      dom_id: string;
      deepLinking: boolean;
      filter: boolean;
      displayRequestDuration: boolean;
      displayOperationId: boolean;
      docExpansion: string;
      defaultModelsExpandDepth: number;
      validatorUrl: null;
      syntaxHighlight?: {
        activated: boolean;
        theme: string;
      };
      requestSnippetsEnabled?: boolean;
      tryItOutEnabled?: boolean;
    }) => unknown;
  }
}

interface SwaggerUIProps {
  spec: Record<string, unknown>;
  environment?: 'sandbox' | 'production';
}

export default function SwaggerUIComponent({ spec }: SwaggerUIProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    let active = true;

    // Load Swagger UI CDN CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css';
    document.head.appendChild(link);

    // Load Swagger UI Bundle
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.async = true;

    script.onload = () => {
      if (active && window.SwaggerUIBundle) {
        try {
          window.SwaggerUIBundle({
            spec,
            dom_id: '#swagger-ui',
            deepLinking: true,
            filter: true,
            displayRequestDuration: true,
            displayOperationId: true,
            docExpansion: 'list',
            defaultModelsExpandDepth: 1,
            validatorUrl: null,
            syntaxHighlight: {
              activated: true,
              theme: isDark ? 'nord' : 'idea',
            },
            requestSnippetsEnabled: true,
            tryItOutEnabled: true,
          });
          setIsLoading(false);
        } catch {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    script.onerror = () => {
      if (active) {
        setError(true);
        setIsLoading(false);
      }
    };

    document.body.appendChild(script);

    return () => {
      active = false;
      script.onload = null;
      script.onerror = null;
      link.remove();
      script.remove();
    };
  }, [spec, isDark]);

  return (
    <div className="w-full relative">
      {isLoading && (
        <div className="py-16 text-center space-y-3" role="status">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#04648C] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-xs text-muted-foreground font-medium">Initializing Range API Explorer...</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200 text-xs text-center" role="alert">
          API documentation could not load. Please verify your connection or refresh the page.
        </div>
      )}
      <div id="swagger-ui" className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'} />
    </div>
  );
}
