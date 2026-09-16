/**
 * Standardized Asset Configuration
 * 
 * To change logos, icons, or background slides without touching code:
 * Simply replace the files in /public/images/smart/ (or override via .env):
 * 
 * - Main Logo:             /images/smart/app-logo.svg  (or NEXT_PUBLIC_ASSET_LOGO)
 * - Standalone Icon/Mark:   /images/smart/app-icon.svg  (or NEXT_PUBLIC_ASSET_ICON)
 * - Mobile App QR Code:     /images/smart/app-qr.png    (or NEXT_PUBLIC_ASSET_QR)
 * - Background Slide 1:     /images/smart/slide-1.jpg   (or NEXT_PUBLIC_ASSET_SLIDE_1)
 * - Background Slide 2:     /images/smart/slide-2.png   (or NEXT_PUBLIC_ASSET_SLIDE_2)
 * - Background Slide 3:     /images/smart/slide-3.jpg   (or NEXT_PUBLIC_ASSET_SLIDE_3)
 * - Background Slide 4:     /images/smart/slide-4.jpg   (or NEXT_PUBLIC_ASSET_SLIDE_4)
 * - Google Play Store:      /images/smart/google-play-badge.svg
 * - Apple App Store:        /images/smart/app-store-badge.svg
 * - Microsoft Store:        /images/smart/microsoft-store-badge.svg
 */

export const appAssets = {
  // Brand Logos & Icons
  logo: process.env.NEXT_PUBLIC_ASSET_LOGO || '/images/brand/range-logo-light.svg',
  logoLight: process.env.NEXT_PUBLIC_ASSET_LOGO_LIGHT || '/images/brand/range-logo-dark.svg',
  icon: process.env.NEXT_PUBLIC_ASSET_ICON || '/images/brand/range-icon.svg',
  iconLight: process.env.NEXT_PUBLIC_ASSET_ICON_LIGHT || '/images/brand/range-icon.svg',
  qrCode: process.env.NEXT_PUBLIC_ASSET_QR || '/images/smart/app-qr.png',
  favicon: '/favicon.ico',
  faviconPng: '/favicon.png',

  // Background Carousel Slides
  slides: [
    process.env.NEXT_PUBLIC_ASSET_SLIDE_1 || '/images/smart/slide-1.jpg',
    process.env.NEXT_PUBLIC_ASSET_SLIDE_2 || '/images/smart/slide-2.png',
    process.env.NEXT_PUBLIC_ASSET_SLIDE_3 || '/images/smart/slide-3.jpg',
    process.env.NEXT_PUBLIC_ASSET_SLIDE_4 || '/images/smart/slide-4.jpg',
  ],

  // Store Badges
  storeBadges: {
    googlePlay: process.env.NEXT_PUBLIC_ASSET_GOOGLE_PLAY || '/images/smart/google-play-badge.svg',
    appStore: process.env.NEXT_PUBLIC_ASSET_APP_STORE || '/images/smart/app-store-badge.svg',
    microsoftStore: process.env.NEXT_PUBLIC_ASSET_MICROSOFT_STORE || '/images/smart/microsoft-store-badge.svg',
  },

  // Interface Icons
  uiIcons: {
    language: '/images/smart/icon-language.svg',
    search: '/images/smart/icon-search.svg',
    arrowLeft: '/images/smart/icon-arrow-left.svg',
    dropdown: '/images/smart/icon-dropdown.svg',
  },
} as const;
