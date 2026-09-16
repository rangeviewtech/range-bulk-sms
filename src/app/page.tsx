import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config/app';
import { createMetadata } from '@/lib/metadata';
import { ArrowRight, MessageSquare, Megaphone, Code, Users, BarChart3, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = createMetadata({
  title: 'Enterprise Bulk SMS Platform',
  description: 'Send SMS to thousands of recipients instantly. Manage campaigns, contacts, sender IDs, and developer APIs from one powerful platform.',
});

const features = [
  {
    title: 'Instant SMS',
    description: 'Deliver messages globally with high throughput and unmatched reliability.',
    icon: MessageSquare,
  },
  {
    title: 'Campaign Management',
    description: 'Schedule, target, and manage large-scale text marketing campaigns easily.',
    icon: Megaphone,
  },
  {
    title: 'Developer API',
    description: 'Integrate SMS capabilities directly into your applications with our robust REST API.',
    icon: Code,
  },
  {
    title: 'Contact Management',
    description: 'Organize your audience with dynamic groups, custom fields, and easy imports.',
    icon: Users,
  },
  {
    title: 'Delivery Reports',
    description: 'Track delivery status and engagement metrics in real-time with detailed analytics.',
    icon: BarChart3,
  },
  {
    title: 'Agent/Reseller Program',
    description: 'White-label our platform and resell SMS services to your own clients.',
    icon: Briefcase,
  }
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center text-center px-4">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          Enterprise Bulk SMS Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          Send SMS to thousands of recipients instantly. Manage campaigns, contacts, sender IDs, and developer APIs from one powerful platform.
        </p>
        <div className="flex flex-col gap-4 items-center justify-center sm:flex-row w-full sm:w-auto">
          <Button asChild size="lg" className="gap-2 w-full sm:w-auto h-12 px-8 text-base">
            <Link href="/register">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2 w-full sm:w-auto h-12 px-8 text-base">
            <Link href="/login">
              Sign In
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 border-t border-border/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to scale your communications</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Powerful features built for enterprises, agencies, and developers.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border border-border/50 bg-card hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
