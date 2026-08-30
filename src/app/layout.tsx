import { AppProviders } from '@/providers/app-providers';
import { createMetadata } from '@/lib/metadata';
import { PWARegister } from '@/components/pwa/pwa-register';

import './globals.css';
import './trakzee-legacy.css';
import './chatbot-legacy.css';

export const metadata = createMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-full antialiased font-sans">
        <AppProviders>
          <PWARegister />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
