import { LegalLayout } from '@/components/layout/legal-layout';

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" subtitle="Information about how we use cookies" lastUpdated="January 1, 2024">
      <h1 id="cookies">Cookie Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2 id="what-are-cookies">1. What are Cookies?</h2>
      <p>Cookies are small text files stored on your device when you visit our Bulk SMS platform.</p>

      <h2 id="essential">2. Essential Cookies</h2>
      <p>We use essential cookies to maintain your session, secure your account, and remember your dashboard preferences. The platform cannot function properly without these cookies.</p>

      <h2 id="analytics">3. Analytics Cookies</h2>
      <p>We use analytics cookies to understand how you interact with our platform, such as which campaign reporting features are used most frequently, to help us improve the service.</p>

      <h2 id="management">4. Managing Cookies</h2>
      <p>You can control or delete cookies through your browser settings. However, disabling essential cookies will prevent you from accessing your account or managing your SMS campaigns.</p>
    </LegalLayout>
  );
}
