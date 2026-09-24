import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://unpkg.com https://challenges.cloudflare.com;
      style-src 'self' 'unsafe-inline' https://unpkg.com;
      img-src 'self' blob: data: https://www.google-analytics.com https://flagcdn.com https://images.unsplash.com;
      connect-src 'self' https://www.google-analytics.com https://challenges.cloudflare.com ${process.env.NODE_ENV === 'development' ? 'ws: wss:' : ''};
      frame-src https://challenges.cloudflare.com;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      ${process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests;' : ''}
    `;

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, '').replace(/\s+/g, ' ').trim(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },

      {
        source: '/reset-password',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              source: '/_next/static/(.*)',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                },
              ],
            },
          ]
        : []),
    ];
  },

  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/api/docs',
        permanent: true,
      },
    ];
  },

  // Response compression (Brotli & Gzip)
  compress: true,

  // Bundle optimization for heavy third-party modules
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Add your image domains here
      // { protocol: 'https', hostname: 'example.com' },
    ],
  },

  // Strict mode for catching bugs early
  reactStrictMode: true,

  // Output configuration
  poweredByHeader: false,
};

export default nextConfig;


