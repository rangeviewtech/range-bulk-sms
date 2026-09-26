import { Metadata } from 'next';
import { appConfig } from '@/config/app';
import { appAssets } from '@/config/assets';

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  canonical?: string;
}

export function createMetadata({
  title,
  description = appConfig.description,
  image = appAssets.logo,
  noIndex = false,
  canonical,
}: MetadataProps = {}): Metadata {
  // Normalize title: strip any pre-existing brand suffixes to ensure uniform formatting
  const cleanTitle = title
    ? title.replace(/\s*\|\s*(Range Bulk SMS|Range SMS|Range View Technology Services|Range View Technology|Range View).*$/i, '').trim()
    : '';

  const fullTitle = cleanTitle ? `${cleanTitle} | ${appConfig.name}` : appConfig.name;

  return {
    title: cleanTitle
      ? {
          default: fullTitle,
          template: `%s | ${appConfig.name}`,
          absolute: fullTitle,
        }
      : {
          default: appConfig.name,
          template: `%s | ${appConfig.name}`,
        },
    description,
    authors: [{ name: appConfig.company }],
    metadataBase: new URL(appConfig.url),
    alternates: {
      canonical: canonical || undefined,
    },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: appAssets.favicon },
        { url: appAssets.faviconPng, type: 'image/png' },
        { url: appAssets.icon, type: 'image/svg+xml' },
      ],
      shortcut: [appAssets.favicon],
      apple: [{ url: appAssets.faviconPng }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: appConfig.name,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: appConfig.url,
      siteName: appConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
