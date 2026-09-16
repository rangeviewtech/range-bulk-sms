import { getApiDocs } from '@/lib/swagger';
import SwaggerUI from '@/components/swagger-ui';

export const metadata = {
  title: 'API Documentation | Master Project',
  description: 'API Documentation for the Master Project backend endpoints.',
};

export default async function DocsPage() {
  const spec = await getApiDocs();
  
  return (
    <div className="w-full min-h-screen p-4 py-8 bg-gray-50 dark:bg-gray-950">
      <div className="w-full h-full min-h-screen bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}
