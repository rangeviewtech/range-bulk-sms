import { Metadata } from 'next';
import { LegalLayout } from '@/components/layout/legal-layout';
import { ShieldCheck, Lock, Eye, Server, UserCheck, Globe, Database } from 'lucide-react';
import { appConfig } from '@/config/app';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Privacy Policy',
  description: `Learn how ${appConfig.name} collects, protects, and manages telematics data, personal information, and location metrics.`,
});

const TOC = [
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'telematics-data', title: 'Telematics & Location Processing' },
  { id: 'how-we-use-data', title: 'How We Use Information' },
  { id: 'data-sharing', title: 'Data Sharing & Third Parties' },
  { id: 'security-measures', title: 'Security & Encryption' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'your-rights', title: 'Your Privacy Rights (GDPR / CCPA)' },
  { id: 'international-transfers', title: 'International Data Transfers' },
  { id: 'contact-dpo', title: 'Contact Our Privacy Officer' },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="We are dedicated to safeguarding your privacy and ensuring maximum transparency regarding how your telematics, location, and account data is handled."
      lastUpdated="Last Updated: August 31, 2026"
      icon={<ShieldCheck className="w-6 h-6 text-[#29A4FF]" />}
      toc={TOC}
    >
      <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
        {/* Callout */}
        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-foreground">
          <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 mb-1">
            <Lock size={16} />
            Commitment to Zero Data Monetization
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We never sell, rent, or trade your fleet telemetry, trip histories, driver metrics, or personal identity details to data brokers or third-party advertisers.
          </p>
        </div>

        {/* Section 1 */}
        <section id="information-we-collect" className="space-y-3 pt-2">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            1. Information We Collect
          </h2>
          <p>When you register and use {appConfig.name}, we collect the following categories of information:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-foreground">Account Details:</strong> Full name, business email address, phone number, organization name, and password hashes.</li>
            <li><strong className="text-foreground">Authentication & Security Logs:</strong> IP address, device fingerprints, login timestamps, MFA audit logs, and Cloudflare Turnstile verification outcomes.</li>
            <li><strong className="text-foreground">Billing Data:</strong> Transaction histories, invoice details, and masked payment tokens processed securely via PCI-DSS compliant providers.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section id="telematics-data" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            2. Telematics & Location Processing
          </h2>
          <p>
            As a telematics platform, our core function involves streaming and analyzing live IoT hardware data:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>GPS Coordinates (Latitude, Longitude, Altitude, Direction, Speed).</li>
            <li>Engine telemetry (RPM, fuel consumption, odometer, battery voltage, temperature sensors).</li>
            <li>Driver safety metrics (harsh acceleration, sudden braking, sharp turning, idling time).</li>
            <li>Geofence entries/exits, trip starts/stops, and sensor panic alarms.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="how-we-use-data" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            3. How We Use Information
          </h2>
          <p>We process your data for strict operational purposes:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>To render live maps, calculate fleet ETAs, and generate historical replay routes.</li>
            <li>To dispatch security alerts, SMS/WhatsApp/Email notifications, and critical maintenance notices.</li>
            <li>To detect anomalous activities, prevent bot attacks, and ensure system uptime.</li>
            <li>To provide responsive customer support and troubleshoot hardware tracker configurations.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="data-sharing" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            4. Data Sharing & Third Parties
          </h2>
          <p>We share data solely with trusted infrastructure subprocessors under strict data protection agreements:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-foreground">Map Providers:</strong> Mapbox, Google Maps, OpenStreetMap (for tile rendering and reverse geocoding without exposing personal IDs).</li>
            <li><strong className="text-foreground">Security & Anti-Bot:</strong> Cloudflare Turnstile (for automated bot mitigation).</li>
            <li><strong className="text-foreground">Communications:</strong> Twilio, SendGrid, Telegram Bot API, WhatsApp Business API (for OTP and alert delivery).</li>
            <li><strong className="text-foreground">Cloud Infrastructure:</strong> High-security ISO-27001 / SOC-2 compliant cloud hosting data centers.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="security-measures" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            5. Security & Encryption
          </h2>
          <p>
            We implement state-of-the-art security safeguards to protect your telemetry against unauthorized access, loss, or alteration:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>TLS 1.3 / HTTPS encryption in transit for all web and mobile traffic.</li>
            <li>AES-256 encryption at rest for database records and historical GPS backups.</li>
            <li>Argon2 / BCrypt cryptographic hashing for account passwords.</li>
            <li>Multi-Factor Authentication (MFA/2FA) support with TOTP, SMS, and messaging channels.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="data-retention" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            6. Data Retention
          </h2>
          <p>
            Trip logs, location coordinates, and event history are retained according to your chosen plan duration (e.g., 30, 90, or 365 days). Upon account termination, data is queued for secure permanent deletion within 30 calendar days.
          </p>
        </section>

        {/* Section 7 */}
        <section id="your-rights" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            7. Your Privacy Rights (GDPR, CCPA & Global Laws)
          </h2>
          <p>Depending on your jurisdiction, you possess the right to:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-foreground">Access & Portability:</strong> Request a copy of your stored personal and fleet data in JSON/CSV format.</li>
            <li><strong className="text-foreground">Rectification:</strong> Correct inaccurate or incomplete account records.</li>
            <li><strong className="text-foreground">Erasure (&quot;Right to be Forgotten&quot;):</strong> Request the permanent deletion of your account and personal identifiers.</li>
            <li><strong className="text-foreground">Restriction of Processing:</strong> Limit or object to specific automated processing workflows.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section id="international-transfers" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            8. International Data Transfers
          </h2>
          <p>
            Where data is transferred internationally, we ensure robust transfer mechanisms such as EU Standard Contractual Clauses (SCCs) and adherence to local data sovereignty laws.
          </p>
        </section>

        {/* Section 9 */}
        <section id="contact-dpo" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            9. Contact Our Data Protection Officer
          </h2>
          <p>
            To exercise your privacy rights, request data exports, or submit inquiries, please reach out to:
          </p>
          <div className="p-3.5 rounded-lg bg-muted/60 border border-border text-xs space-y-1 text-foreground">
            <div><strong>Data Protection Officer (DPO)</strong></div>
            <div>Email: <a href="mailto:privacy@trakzee.com" className="text-[#29A4FF] hover:underline">privacy@trakzee.com</a></div>
            <div>Support: <a href="mailto:support@trakzee.com" className="text-[#29A4FF] hover:underline">support@trakzee.com</a></div>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
