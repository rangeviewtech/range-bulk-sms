import { LegalLayout } from '@/components/layout/legal-layout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" subtitle="How we handle your data" lastUpdated="January 1, 2024">
      <h1 id="privacy">Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2 id="collection">1. Data Collection</h2>
      <p>We collect information necessary to provide our Bulk SMS services, including your account details, phone number data, message content, contact lists, and API usage data.</p>

      <h2 id="handling">2. Phone Number and Contact List Privacy</h2>
      <p>Your contact lists and recipient phone numbers are your proprietary data. We process this data solely for the purpose of message delivery and do not sell, share, or market to your contacts.</p>

      <h2 id="content">3. Message Content Privacy</h2>
      <p>Message content is encrypted in transit and at rest. We do not monitor message content except as required by law or to enforce our terms against spam, fraud, or abuse.</p>

      <h2 id="billing">4. Billing Data</h2>
      <p>Payment information is processed securely by our payment providers. We do not store full credit card numbers on our servers.</p>

      <h2 id="sharing">5. Data Sharing</h2>
      <p>We share necessary data with telecom carriers and aggregators solely for the purpose of routing and delivering your SMS messages.</p>
    </LegalLayout>
  );
}
