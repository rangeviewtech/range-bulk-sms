import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Login',
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
