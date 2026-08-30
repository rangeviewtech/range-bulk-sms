import Link from 'next/link';

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
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 space-y-1 shrink-0 border-r pr-4 min-h-[calc(100vh-100px)]">
        {links.map(l => (
          <Link key={l.href} href={l.href} className="block px-3 py-2 text-sm rounded-md hover:bg-muted">
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
