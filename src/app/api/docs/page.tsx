import { Metadata } from 'next';
import { getApiDocs } from '@/lib/swagger';
import { DocsPortal } from '@/components/docs/docs-portal';

export const metadata: Metadata = {
  title: 'Range Bulk SMS Developer Portal & Public API Documentation',
  description:
    'Comprehensive REST API reference, isolated Sandbox, multi-language code snippets, and real-time delivery receipt webhooks for Range Bulk SMS messaging platform.',
  openGraph: {
    title: 'Range Bulk SMS Developer Portal',
    description: 'Enterprise Bulk SMS and Messaging Platform Public API Documentation',
    type: 'website',
  },
};

export default async function DocsPage() {
  const spec = await getApiDocs();

  return <DocsPortal spec={spec} />;
}
