/**
 * Resolve the public API base displayed in copyable developer examples.
 * Do not publish a guessed production hostname when the deployment origin is
 * still configured as localhost.
 */
export function getPublicApiBaseUrl(): string {
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredAppUrl) return 'https://<your-deployed-web-app-domain>/api/v1';

  try {
    const appUrl = new URL(configuredAppUrl);
    if (appUrl.hostname === 'localhost' || appUrl.hostname === '127.0.0.1') {
      return 'https://<your-deployed-web-app-domain>/api/v1';
    }
    return new URL('/api/v1', appUrl).toString().replace(/\/$/, '');
  } catch {
    return 'https://<your-deployed-web-app-domain>/api/v1';
  }
}
