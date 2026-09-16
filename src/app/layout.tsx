import { AppProviders } from '@/providers/app-providers';
import { createMetadata } from '@/lib/metadata';
import { PWARegister } from '@/components/pwa/pwa-register';
import { CookieBanner } from '@/components/blocks/ui/cookie-banner';

import './globals.css';
import './range-legacy.css';
import './chatbot-legacy.css';

export const metadata = createMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-full antialiased font-sans">
        <AppProviders>
          <PWARegister />
          <CookieBanner />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
