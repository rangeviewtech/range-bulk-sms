import { LegalLayout } from '@/components/layout/legal-layout';

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" subtitle="Terms and conditions for using our platform" lastUpdated="January 1, 2024">
      <h1 id="terms">Terms & Conditions</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>By accessing and using the Range SMS platform, you agree to comply with these terms. If you do not agree, do not use our services.</p>

      <h2 id="services">2. Bulk SMS Services</h2>
      <p>We provide a platform for sending bulk SMS, managing contacts, and API integration. Delivery of messages is subject to network availability and carrier policies. We do not guarantee 100% delivery rates due to factors beyond our control.</p>

      <h2 id="sender-id">3. Sender ID Usage</h2>
      <p>You must only use Sender IDs that you are legally authorized to use. Misrepresentation or spoofing is strictly prohibited and will result in immediate account termination.</p>

      <h2 id="consent">4. Opt-Out and Consent Requirements</h2>
      <p>You are solely responsible for ensuring you have explicit consent (opt-in) from recipients before sending messages. You must provide a clear opt-out mechanism in your communications as required by applicable laws (e.g., TCPA, GDPR).</p>

      <h2 id="api">5. API Access</h2>
      <p>API access is provided subject to rate limits. Abuse of the API, including spamming or denial of service attacks, will result in immediate access revocation.</p>

      <h2 id="billing">6. Billing and Wallet Terms</h2>
      <p>Services are prepaid via the platform wallet. Wallet balances are non-refundable unless required by law. Message costs may vary by destination and carrier.</p>
    </LegalLayout>
  );
}
