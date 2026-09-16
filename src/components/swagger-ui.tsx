'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    SwaggerUIBundle?: (options: {
      spec: Record<string, unknown>;
      dom_id: string;
      deepLinking: boolean;
      validatorUrl: null;
    }) => unknown;
  }
}

export default function SwaggerUIComponent({ spec }: { spec: Record<string, unknown> }) {
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.async = true;
    script.onload = () => {
      if (active && window.SwaggerUIBundle)
        window.SwaggerUIBundle({
          spec,
          dom_id: '#swagger-ui',
          deepLinking: true,
          validatorUrl: null,
        });
    };
    script.onerror = () => {
      if (active) setError(true);
    };
    document.body.appendChild(script);
    return () => {
      active = false;
      script.onload = null;
      script.onerror = null;
      link.remove();
      script.remove();
    };
  }, [spec]);
  return (
    <>
      {error && <p role="alert">API documentation could not load. Please refresh and try again.</p>}
      <div id="swagger-ui" />
    </>
  );
}
