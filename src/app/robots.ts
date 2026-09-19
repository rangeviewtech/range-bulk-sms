import type { MetadataRoute } from 'next';
import { appConfig } from '@/config/app';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = appConfig.url.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/register',
          '/forgot-password',
          '/privacy',
          '/terms',
          '/cookies',
          '/api/docs',
        ],
        disallow: [
          '/dashboard',
          '/admin',
          '/settings',
          '/sms',
          '/contacts',
          '/campaigns',
          '/wallet',
          '/agent',
          '/developer',
          '/sender-ids',
          '/support',
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
