import { PageHeader } from '@/components/layout/page-header';
import { CookieBanner } from '@/components/blocks/ui/cookie-banner';
import { DashboardSkeleton, ProfileSkeleton } from '@/components/blocks/ui/skeleton-layouts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function UiExamplesPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        heading="UI Components & Blocks" 
        description="Reusable composite UI blocks like cookie banners and loading skeletons."
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Skeletons</h2>
        <p className="text-muted-foreground text-sm">Use these layout-specific skeletons while fetching data to prevent layout shift.</p>
        
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Layout Skeleton</CardTitle>
            <CardDescription>Mirrors a standard dashboard overview page.</CardDescription>
          </CardHeader>
          <CardContent className="bg-muted/30 p-6 rounded-b-xl border-t">
            <DashboardSkeleton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Form Skeleton</CardTitle>
            <CardDescription>Mirrors a standard user profile settings page.</CardDescription>
          </CardHeader>
          <CardContent className="bg-muted/30 p-6 rounded-b-xl border-t">
            <ProfileSkeleton />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 pt-8">
        <h2 className="text-xl font-semibold tracking-tight">Cookie Banner</h2>
        <p className="text-muted-foreground text-sm">A floating cookie consent banner will appear at the bottom right of your screen (simulated with a 1.5s delay).</p>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center text-sm text-primary">
            Look at the bottom right corner of the screen.
          </CardContent>
        </Card>
      </div>

      <CookieBanner />
    </div>
  );
}
