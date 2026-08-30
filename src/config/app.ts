export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Trakzee',
  shortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'Trakzee',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Access to the most powerful tracking platform in the entire telematics industry.',
  url: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000',
  ogImage: process.env.NEXT_PUBLIC_APP_OG_IMAGE || '/images/smart/smart_logo.svg',
  company: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Uffizio Telematics Platform',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'info@uffizio.in',
  version: '4.207.07',
} as const;
