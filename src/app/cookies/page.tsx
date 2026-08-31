import { Metadata } from 'next';
import { LegalLayout } from '@/components/layout/legal-layout';
import { Cookie, Settings, CheckCircle2, Shield, Sliders } from 'lucide-react';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: `Cookie Policy | ${appConfig.name}`,
  description: `Understand how ${appConfig.name} uses cookies, local storage, and caching to ensure optimal platform performance.`,
};

const TOC = [
  { id: 'what-are-cookies', title: 'What Are Cookies?' },
  { id: 'categories', title: 'Categories of Cookies We Use' },
  { id: 'essential-cookies', title: '1. Strictly Essential Cookies' },
  { id: 'functional-cookies', title: '2. Functional & Preference Cookies' },
  { id: 'analytics-cookies', title: '3. Performance & Telemetry Cookies' },
  { id: 'pwa-storage', title: 'PWA Offline Cache & Local Storage' },
  { id: 'managing-cookies', title: 'Managing Cookie Preferences' },
  { id: 'updates', title: 'Updates to this Policy' },
];

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Discover what cookies and browser storage technologies we utilize, why we use them, and how you can control your preferences."
      lastUpdated="Last Updated: August 31, 2026"
      icon={<Cookie className="w-6 h-6 text-[#29A4FF]" />}
      toc={TOC}
    >
      <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
        {/* Summary Card */}
        <div className="p-4 rounded-xl bg-[#29A4FF]/5 border border-[#29A4FF]/20 text-foreground">
          <h3 className="text-sm font-semibold text-[#29A4FF] flex items-center gap-2 mb-1">
            <Sliders size={16} />
            Quick Summary
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We use essential session cookies for secure sign-in, language/theme preferences, and PWA offline caching. We do not use intrusive third-party cross-site advertising cookies.
          </p>
        </div>

        {/* Section 1 */}
        <section id="what-are-cookies" className="space-y-3 pt-2">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            What Are Cookies & Local Storage?
          </h2>
          <p>
            Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, remember your customized settings (such as dark/light mode and preferred language), and provide encrypted session authentication.
          </p>
          <p>
            In addition to HTTP cookies, our application utilizes modern browser storage technologies such as <code>localStorage</code>, <code>sessionStorage</code>, and <code>IndexedDB</code> for Progressive Web App (PWA) offline support.
          </p>
        </section>

        {/* Section 2 */}
        <section id="categories" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            Categories of Cookies We Use
          </h2>
          <p>
            We organize our cookies into clear functional categories:
          </p>
        </section>

        {/* Essential Cookies */}
        <section id="essential-cookies" className="space-y-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" />
            1. Strictly Essential Cookies (Always Active)
          </h3>
          <p>
            These cookies are required for the website to function securely and cannot be switched off in our systems:
          </p>
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/70 text-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-2.5">Cookie Name</th>
                  <th className="p-2.5">Provider</th>
                  <th className="p-2.5">Purpose</th>
                  <th className="p-2.5">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2.5 font-mono text-[#29A4FF]">session_token</td>
                  <td className="p-2.5">First-party</td>
                  <td className="p-2.5">Encrypted JWT user authentication session</td>
                  <td className="p-2.5">7 days</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-[#29A4FF]">__cf_bm / cf_clearance</td>
                  <td className="p-2.5">Cloudflare</td>
                  <td className="p-2.5">Bot protection & Turnstile challenge validation</td>
                  <td className="p-2.5">30 mins</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-[#29A4FF]">app_language</td>
                  <td className="p-2.5">First-party</td>
                  <td className="p-2.5">Stores selected language (e.g., EN, DE, ES, AR)</td>
                  <td className="p-2.5">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Functional Cookies */}
        <section id="functional-cookies" className="space-y-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Settings size={16} className="text-[#29A4FF]" />
            2. Functional & Preference Cookies
          </h3>
          <p>
            These cookies enable enhanced functionality and personalization:
          </p>
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/70 text-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-2.5">Storage Key</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Purpose</th>
                  <th className="p-2.5">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2.5 font-mono text-[#29A4FF]">theme</td>
                  <td className="p-2.5">localStorage</td>
                  <td className="p-2.5">Remembers light/dark theme appearance</td>
                  <td className="p-2.5">Persistent</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-[#29A4FF]">sidebar_collapsed</td>
                  <td className="p-2.5">localStorage</td>
                  <td className="p-2.5">Remembers dashboard menu toggle state</td>
                  <td className="p-2.5">Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Analytics Cookies */}
        <section id="analytics-cookies" className="space-y-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Shield size={16} className="text-purple-500" />
            3. Performance & System Telemetry Cookies
          </h3>
          <p>
            These anonymous metrics help us measure web page load speeds, error rates, and optimize server responsiveness without collecting identifying personal data.
          </p>
        </section>

        {/* PWA Local Storage */}
        <section id="pwa-storage" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            Progressive Web App (PWA) Offline Storage
          </h2>
          <p>
            When you install or use the {appConfig.name} PWA, service workers cache interface icons, stylesheets, and map geometries into your browser&apos;s cache storage so you can access vehicles and telematics dashboards seamlessly even with low or intermittent cellular reception.
          </p>
        </section>

        {/* Managing Cookies */}
        <section id="managing-cookies" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            Managing Cookie Preferences
          </h2>
          <p>
            You can configure your browser to block or alert you about cookies. However, disabling essential cookies will prevent logging in and utilizing live GPS fleet mapping.
          </p>
          <p>
            For instructions on clearing or configuring cookies in major browsers:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            <li>Google Chrome: Settings → Privacy & Security → Cookies</li>
            <li>Mozilla Firefox: Options → Privacy & Security → Enhanced Tracking Protection</li>
            <li>Apple Safari: Preferences → Privacy → Manage Website Data</li>
            <li>Microsoft Edge: Settings → Cookies and Site Permissions</li>
          </ul>
        </section>

        {/* Updates */}
        <section id="updates" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            Updates to this Cookie Policy
          </h2>
          <p>
            We may update this policy periodically to reflect additions to our features or regulatory requirements. Please review this page periodically.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
