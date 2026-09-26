import { createMetadata } from '@/lib/metadata';
import { NotFoundContent } from '@/components/feedback/not-found-content';

export const metadata = createMetadata({
  title: 'Page Not Found',
  description: 'The requested page could not be found.',
});

export default function NotFound() {
  return <NotFoundContent />;
}
