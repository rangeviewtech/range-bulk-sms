import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Page Not Found',
  description: 'The requested page could not be found.',
});

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-8">
      <FileQuestion className="w-24 h-24 text-muted-foreground mb-8" />
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8">Could not find requested resource</p>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
