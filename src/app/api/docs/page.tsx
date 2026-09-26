import { createMetadata } from '@/lib/metadata';
import { getApiDocs } from '@/lib/swagger';
import { DocsPortal } from '@/components/docs/docs-portal';

export const metadata = createMetadata({
  title: 'API Documentation',
  description:
    'Comprehensive REST API reference, isolated Sandbox, multi-language code snippets, and real-time delivery receipt webhooks for Range Bulk SMS messaging platform.',
});

export default async function DocsPage() {
  const spec = await getApiDocs();

  return <DocsPortal spec={spec} />;
}
