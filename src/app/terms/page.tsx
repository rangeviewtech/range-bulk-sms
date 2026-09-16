import { Metadata } from 'next';
import { LegalLayout } from '@/components/layout/legal-layout';
import { ShieldCheck, Scale } from 'lucide-react';
import { appConfig } from '@/config/app';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Terms & Conditions',
  description: `Terms and conditions governing use of ${appConfig.name} GPS tracking, fleet telemetry, and SaaS services.`,
});

const TOC = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'accounts', title: 'User Accounts & Security' },
  { id: 'telematics', title: 'Telematics & Geolocation Data' },
  { id: 'hardware-api', title: 'Hardware Integration & API Access' },
  { id: 'billing', title: 'Subscriptions, Billing & Cancellation' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'liability', title: 'Limitation of Liability & SLA' },
  { id: 'termination', title: 'Termination of Service' },
  { id: 'governing-law', title: 'Governing Law & Disputes' },
  { id: 'modifications', title: 'Changes to Terms' },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="These Terms of Service set out the rights, obligations, and legal standards governing your use of our GPS tracking and telematics platform."
      lastUpdated="Last Updated: August 31, 2026"
      icon={<Scale className="w-6 h-6 text-[#29A4FF]" />}
      toc={TOC}
    >
      <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
        {/* Quick Callout Box */}
        <div className="p-4 rounded-xl bg-[#29A4FF]/5 border border-[#29A4FF]/20 text-foreground">
          <h3 className="text-sm font-semibold text-[#29A4FF] flex items-center gap-2 mb-1">
            <ShieldCheck size={16} />
            Important Notice for Fleet & Enterprise Operators
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By creating an account, registering hardware units, or accessing our platform, you agree to these Terms. If you represent an organization, you certify that you have legal authority to bind that entity.
          </p>
        </div>

        {/* Section 1 */}
        <section id="acceptance" className="space-y-3 pt-2">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            Welcome to {appConfig.name}. By accessing or using our website, web application, mobile applications, APIs, and connected IoT hardware platforms (collectively, the &quot;Service&quot;), you confirm that you have read, understood, and agree to be bound by these Terms and Conditions (&quot;Terms&quot;).
          </p>
          <p>
            If you do not agree with any part of these Terms, you must immediately cease all access to and use of the Service.
          </p>
        </section>

        {/* Section 2 */}
        <section id="accounts" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            2. User Accounts & Security
          </h2>
          <p>
            To access certain features of the Service, you must register for an account. When creating your account, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Provide accurate, current, and complete registration information.</li>
            <li>Maintain and promptly update your profile and organizational credentials.</li>
            <li>Maintain the confidentiality of your login credentials, PINs, and MFA authentication keys.</li>
            <li>Promptly notify us of any unauthorized use or security breach involving your account.</li>
          </ul>
          <p>
            You are fully responsible for all activities and telemetry transmissions that occur under your account credentials.
          </p>
        </section>

        {/* Section 3 */}
        <section id="telematics" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            3. Telematics & Geolocation Data
          </h2>
          <p>
            Our Service captures real-time GPS coordinates, vehicle speed, engine diagnostic telemetry, ignition states, driving behavior, and sensor alerts from integrated devices:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-foreground">Owner Consent:</strong> You represent and warrant that you own or have explicit legal authorization from vehicle owners and drivers to monitor, track, and log geolocation data.</li>
            <li><strong className="text-foreground">Regulatory Compliance:</strong> You agree to comply with all regional labor, privacy, and transport regulations regarding vehicle tracking (e.g., GDPR, CCPA, ELD mandates).</li>
            <li><strong className="text-foreground">Data Storage & Export:</strong> Location logs are retained according to your subscription tier and can be exported via reports or automated webhooks.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="hardware-api" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            4. Hardware Integration & API Access
          </h2>
          <p>
            {appConfig.name} supports diverse GPS tracker protocols, OBD-II dongles, CAN bus readers, and IoT sensors. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Use certified hardware properly installed by qualified technicians.</li>
            <li>Not reverse-engineer, decompile, or tamper with our communication protocols or firmware.</li>
            <li>Respect API rate limits and avoid generating malicious traffic or server overloads.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="billing" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            5. Subscriptions, Billing & Cancellation
          </h2>
          <p>
            Access to premium fleet management tools is billed on a monthly or annual subscription basis per active unit.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-foreground">Automatic Renewal:</strong> Subscriptions renew automatically unless cancelled prior to the billing date.</li>
            <li><strong className="text-foreground">Taxes & Fees:</strong> Fees are exclusive of applicable national, state, or local taxes.</li>
            <li><strong className="text-foreground">Refund Policy:</strong> Payments are non-refundable except where required by mandatory local consumer protection legislation.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="intellectual-property" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            6. Intellectual Property
          </h2>
          <p>
            The Service, including its UI design, map visualizations, software code, algorithms, logos, trademarks, and documentation, is the exclusive property of {appConfig.name} and its licensors.
          </p>
        </section>

        {/* Section 7 */}
        <section id="liability" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            7. Limitation of Liability & SLA
          </h2>
          <p>
            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. GPS signals, cellular networks, satellite triangulation, and map provider APIs are subject to environmental and third-party interruptions beyond our reasonable control.
          </p>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            <strong>Disclaimer:</strong> {appConfig.name} is not liable for indirect, incidental, punitive, or consequential damages resulting from vehicle accidents, traffic violations, theft recovery failures, or connectivity outages.
          </div>
        </section>

        {/* Section 8 */}
        <section id="termination" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            8. Termination of Service
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that engage in fraudulent activity, security abuse, non-payment, or breach of these Terms, with or without prior notice.
          </p>
        </section>

        {/* Section 9 */}
        <section id="governing-law" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            9. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which our primary operating entity is registered, without regard to conflict of law principles.
          </p>
        </section>

        {/* Section 10 */}
        <section id="modifications" className="space-y-3">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">
            10. Changes to Terms
          </h2>
          <p>
            We may revise these Terms from time to time to reflect operational or legal updates. When changes are made, we will update the &quot;Last Updated&quot; date and notify active account administrators via email or in-app notification.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
