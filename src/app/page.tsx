import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config/app';
import { ArrowRight, Palette } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-background text-foreground">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6">
        {appConfig.name}
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
        {appConfig.description}
      </p>
      <div className="flex gap-4 items-center justify-center">
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="gap-2">
          <Link href="/design-system">
            <Palette className="w-4 h-4" /> Design System
          </Link>
        </Button>
      </div>
    </main>
  );
}
