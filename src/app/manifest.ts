import type { MetadataRoute } from 'next';
import { appConfig } from '@/config/app';
import { appAssets } from '@/config/assets';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${appConfig.name} - Enterprise Bulk SMS Platform`,
    short_name: appConfig.shortName || appConfig.name,
    description: appConfig.description,
    start_url: '/login',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#04648C',
    icons: [
      {
        src: appAssets.icon,
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: appAssets.icon,
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
