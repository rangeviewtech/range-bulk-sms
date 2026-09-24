import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createMetadata } from '@/lib/metadata';
import {
  ArrowRight,
  MessageSquare,
  Megaphone,
  Code,
  Users,
  BarChart3,
  Briefcase,
  ShieldCheck,
  Zap,
  Check,
  Cpu,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RangeLogo } from '@/components/brand/range-logo';
import { MarketingHeaderAuth } from '@/components/navigation/marketing-header-auth';
import { verifySession } from '@/lib/auth/session';

export const metadata = createMetadata({
  title: 'Enterprise Bulk SMS Platform | Range View Technology',
  description:
    'Deliver high-volume SMS across Uganda and East Africa with carrier-grade reliability, dedicated alphanumeric sender IDs, hardware gateways, and developer APIs.',
  canonical: '/',
});

const features = [
  {
    title: 'Instant Bulk Messaging',
    description:
      'Dispatched via direct carrier SMPP routes to MTN, Airtel, and regional networks with ultra-low latency.',
    icon: MessageSquare,
  },
  {
    title: 'Targeted Campaigns',
    description:
      'Schedule automated broadcasts, personalize with dynamic variables, and track engagement with 4-step wizard.',
    icon: Megaphone,
  },
  {
    title: 'Hardware SMS Gateways',
    description:
      'Turn Android devices or ESP32 GSM modules into native local gateways with instant 6-digit PIN pairing.',
    icon: Cpu,
  },
  {
    title: 'Developer REST API',
    description:
      'Integrate SMS dispatch, sender ID checks, and real-time webhook delivery receipts in minutes.',
    icon: Code,
  },
  {
    title: 'Contact Intelligence',
    description:
      'Organize unlimited audiences into dynamic groups, tag VIP contacts, and bulk-import CSV spreadsheets.',
    icon: Users,
  },
  {
    title: 'Audited Carrier DLRs',
    description:
      'Monitor handset delivery receipts, network latency, and throughput in real-time with Recharts analytics.',
    icon: BarChart3,
  },
  {
    title: 'Agent / Reseller Portal',
    description:
      'Multi-tenant white-label accounts, sub-client wallet allocations, and automated commission tracking.',
    icon: Briefcase,
  },
  {
    title: 'Mobile Money Top-ups',
    description:
      'Instant prepaid wallet funding via MTN Mobile Money and Airtel Money with automatic billing receipts.',
    icon: CreditCard,
  },
  {
    title: 'Regulatory UCC Compliance',
    description:
      'Automated sender ID verification, opt-out management, and strict regulatory compliance safeguards.',
    icon: ShieldCheck,
  },
];

const stats = [
  { label: 'Carrier Delivery Rate', value: '99.2%' },
  { label: 'Avg Dispatch Latency', value: '< 2.5s' },
  { label: 'Peak Burst Capacity', value: '100K+/min' },
  { label: 'Base Rate per SMS', value: '35 UGX' },
];

const pricingPlans = [
  {
    name: 'Starter',
    badge: 'Standard',
    price: '45',
    unit: 'UGX / SMS',
    description: 'Perfect for small businesses, schools, and growing startups.',
    features: [
      'Up to 10,000 SMS / month',
      'Shared or custom Sender ID',
      'Web Dashboard & CSV Import',
      'Email & Community Support',
      'Standard HTTP API access',
    ],
    cta: 'Start Free Trial',
    href: '/register',
    popular: false,
  },
  {
    name: 'Growth',
    badge: 'Most Popular',
    price: '38',
    unit: 'UGX / SMS',
    description: 'Engineered for high-volume commercial campaigns and retail alerts.',
    features: [
      'Up to 250,000 SMS / month',
      'Up to 5 Dedicated Sender IDs',
      'Android & ESP32 Hardware Gateways',
      'Automated Webhook Receipts',
      'Priority Carrier Handoff',
      '24/7 Dedicated Support',
    ],
    cta: 'Get Started Now',
    href: '/register',
    popular: true,
  },
  {
    name: 'Enterprise',
    badge: 'Custom Volume',
    price: '32',
    unit: 'UGX / SMS',
    description: 'Carrier-grade capacity for financial institutions and telecom aggregators.',
    features: [
      'Unlimited Monthly SMS Volume',
      'Direct SMPP / Tier-1 Connections',
      'Multi-tenant Reseller Sub-accounts',
      'Custom SLA & 99.99% Uptime Guarantee',
      'Dedicated Account Manager',
      'Bespoke Route Optimization',
    ],
    cta: 'Contact Enterprise',
    href: '/support',
    popular: false,
  },
];

export default async function HomePage() {
  const session = await verifySession().catch(() => null);
  const initialUser = session?.isAuth && session.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        roles: Array.isArray(session.user.roles)
          ? session.user.roles.map((r: { role?: { name: string } | string }) =>
              typeof r.role === 'object' && r.role !== null ? r.role.name : String(r.role || '')
            ).filter(Boolean)
          : [],
        status: session.user.status,
      }
    : null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://bulk.rangeview.co.ug/#organization',
        name: 'Range View Technology Services Uganda Limited',
        url: 'https://bulk.rangeview.co.ug',
        logo: 'https://bulk.rangeview.co.ug/images/brand/range-icon-transparent.svg',
        description: 'Enterprise Telecom Messaging Aggregator and Bulk SMS Provider in Uganda.',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+256-700-000000',
          contactType: 'customer support',
          areaServed: 'UG',
          availableLanguage: ['English', 'Luganda'],
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://bulk.rangeview.co.ug/#software',
        name: 'Range Bulk SMS Platform',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'UGX',
          lowPrice: '32',
          highPrice: '45',
          offerCount: '3',
        },
        description: 'Carrier-grade bulk SMS platform across Uganda with dedicated alphanumeric sender IDs, hardware gateways, and developer APIs.',
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Sticky Enterprise Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <RangeLogo variant="auto" size="sm" asLink href="/" />
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <Link
                href="/gateways"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Hardware Gateways
              </Link>
              <Link
                href="/api/docs"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                API Docs
              </Link>
            </nav>
          </div>

          <MarketingHeaderAuth initialUser={initialUser} />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_50%_0%,rgba(251,202,7,0.12),transparent_70%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium text-foreground mb-8">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>Carrier-Grade Bulk SMS &amp; Mobile Infrastructure • East Africa</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
            Send Millions of SMS with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-[#FBCA07] to-[#04648C]">
              Carrier-Grade
            </span>{' '}
            Precision
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Empower your business with instant bulk SMS broadcasts, dedicated alphanumeric sender
            IDs, native Android &amp; ESP32 hardware gateways, and high-throughput developer APIs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
              <Link href="/register">
                Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
              <Link href="/dashboard">Launch Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 md:mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 bg-card/80 backdrop-blur-xs border border-border rounded-2xl shadow-xs">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-2">
                <div className="text-2xl sm:text-4xl font-extrabold text-[#04648C] dark:text-[#FBCA07]">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30">
            Platform Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything You Need to Scale Communications
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Built from the ground up to support modern businesses, financial institutions, telecom
            resellers, and software engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => (
            <Card
              key={item.title}
              className="border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hardware Gateways Spotlight */}
      <section className="py-16 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="px-3 py-1 text-emerald-600 border-emerald-600/30">
                Hybrid Infrastructure
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Pair Your Own Hardware &amp; Bypass Aggregator Markups
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Connect your Android smartphones or ESP32 GSM modules directly into Range SMS. Use
                your existing carrier SIM bundles (unlimited local SMS bundles) to dispatch messages
                with zero per-SMS cloud fees.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                  <span>Instant 6-digit pairing code generation</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                  <span>Real-time battery level and cellular signal (dBm) telemetry</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                  <span>Automatic carrier failover to cloud SMPP routes</span>
                </li>
              </ul>
              <div>
                <Button asChild className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                  <Link href="/gateways">Explore Gateways</Link>
                </Button>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-card rounded-2xl border border-border shadow-md space-y-4 font-mono text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span>MTN Gateway #1 (Android 14)</span>
                </div>
                <span className="text-emerald-500 font-semibold">● ONLINE</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signal Strength:</span>
                  <span className="font-semibold">-72 dBm (Excellent)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Battery Level:</span>
                  <span className="font-semibold">94% (Charging)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispatched Today:</span>
                  <span className="font-semibold">14,280 SMS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Carrier:</span>
                  <span className="font-semibold">MTN Uganda 4G</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30">
            Simple &amp; Transparent
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Volume-Based Pricing in Uganda Shillings (UGX)
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            No hidden setup fees, no monthly maintenance charges. Top up on-demand via MTN MoMo or
            Airtel Money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'border-2 border-primary shadow-lg relative bg-card'
                  : 'border-border bg-card/60'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  {!plan.popular && (
                    <Badge variant="secondary" className="text-xs">
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="pt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">{plan.unit}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
                  Includes:
                </div>
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-6 border-t border-border">
                <Button
                  asChild
                  className={`w-full font-semibold ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'variant-outline'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Developer API Section */}
      <section className="py-16 bg-muted/40 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <Badge variant="outline" className="px-3 py-1 text-primary border-primary/30">
                Developer Friendly
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Integrate in Minutes with Clean REST APIs
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Generate scoped API keys, dispatch messages programmatically, and receive webhook
                notifications for delivery reports. SDKs available for Node.js, Python, PHP, and Go.
              </p>
              <div className="pt-2 flex gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/api/docs">View API Documentation</Link>
                </Button>
                <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/developer/api-keys">Get API Keys</Link>
                </Button>
              </div>
            </div>

            <div className="bg-slate-950 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-xl overflow-x-auto text-xs font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span>cURL • Send Message Request</span>
                <span className="text-[10px]">POST /api/v1/sms/send</span>
              </div>
              <pre className="pt-3 leading-relaxed">
{`curl -X POST https://api.rangesms.com/api/v1/sms/send \\
  -H "Authorization: Bearer rsk_live_9948271a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+256700123456",
    "from": "RANGESMS",
    "message": "Your verification code is 849201."
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Enterprise Footer */}
      <footer className="border-t border-border bg-card text-foreground mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-4">
              <RangeLogo variant="auto" size="sm" asLink href="/" />
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Range Bulk SMS is a premier enterprise communications platform operated by{' '}
                <strong className="text-foreground">Range View Technology Services</strong>.
                Powering mission-critical SMS alerts, marketing, and hardware telemetry across Uganda.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Kampala, Uganda • East Africa</p>
                <p>Support: support@rangesms.com</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                Platform
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sms/send" className="hover:text-primary transition-colors">Send SMS</Link></li>
                <li><Link href="/sms/campaigns" className="hover:text-primary transition-colors">Campaigns</Link></li>
                <li><Link href="/contacts" className="hover:text-primary transition-colors">Contacts</Link></li>
                <li><Link href="/sender-ids" className="hover:text-primary transition-colors">Sender IDs</Link></li>
                <li><Link href="/gateways" className="hover:text-primary transition-colors">Gateways</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                Developers
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/api/docs" className="hover:text-primary transition-colors">API Documentation</Link></li>
                <li><Link href="/developer/api-keys" className="hover:text-primary transition-colors">API Keys</Link></li>
                <li><Link href="/developer/webhooks" className="hover:text-primary transition-colors">Webhooks</Link></li>
                <li><Link href="/developer/api-usage" className="hover:text-primary transition-colors">Usage Metrics</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                Legal &amp; Trust
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                <li><Link href="/support" className="hover:text-primary transition-colors">Help &amp; Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Range View Technology Services. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
