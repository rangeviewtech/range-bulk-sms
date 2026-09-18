import Link from 'next/link';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Design System',
  description: 'Core design tokens, components, and layout foundations.',
});

const links = [
  { href: '/design-system', label: 'Overview' },
  { href: '/design-system/colors', label: 'Colors' },
  { href: '/design-system/typography', label: 'Typography' },
  { href: '/design-system/components', label: 'Components' },
  { href: '/design-system/forms', label: 'Forms' },
  { href: '/design-system/data-display', label: 'Data Display' },
  { href: '/design-system/feedback', label: 'Feedback' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <aside className="w-full md:w-56 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-r pb-3 md:pb-0 pr-0 md:pr-4 shrink-0 min-h-0 md:min-h-[calc(100vh-100px)]">
        {links.map(l => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap px-3 py-1.5 text-sm rounded-md hover:bg-muted font-medium transition-colors">
            {l.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
