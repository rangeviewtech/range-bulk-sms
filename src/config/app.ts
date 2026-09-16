export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Range SMS',
  shortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'Range SMS',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Enterprise Bulk SMS Management Platform',
  url: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000',
  ogImage: process.env.NEXT_PUBLIC_APP_OG_IMAGE || '/images/smart/smart_logo.svg',
  company: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Range View Technology Services',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@rangesms.com',
  version: '4.207.07',
} as const;
