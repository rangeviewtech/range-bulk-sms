import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Register',
  description: 'Create your Trakzee account for GPS tracking and fleet telematics.',
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
