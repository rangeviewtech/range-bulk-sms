import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { SplitScreenAuth } from '@/components/blocks/auth/split-screen-auth';
import { CenteredCardAuth } from '@/components/blocks/auth/centered-card-auth';
import { MinimalAuth } from '@/components/blocks/auth/minimal-auth';
import { SocialFirstAuth } from '@/components/blocks/auth/social-first-auth';
import { MagicLinkAuth } from '@/components/blocks/auth/magic-link-auth';
import { WizardAuth } from '@/components/blocks/auth/wizard-auth';

export default function AuthExamplesPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        heading="Authentication Layouts" 
        description="Various reusable authentication templates for different project needs."
      />

      <Tabs defaultValue="split" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="split">Split Screen</TabsTrigger>
          <TabsTrigger value="centered">Centered Card</TabsTrigger>
          <TabsTrigger value="minimal">Minimal</TabsTrigger>
          <TabsTrigger value="social">Social First</TabsTrigger>
          <TabsTrigger value="magic">Magic Link</TabsTrigger>
          <TabsTrigger value="wizard">Wizard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="split" className="mt-0">
          <SplitScreenAuth />
        </TabsContent>
        
        <TabsContent value="centered" className="mt-0">
          <CenteredCardAuth />
        </TabsContent>
        
        <TabsContent value="minimal" className="mt-0">
          <MinimalAuth />
        </TabsContent>
        
        <TabsContent value="social" className="mt-0">
          <SocialFirstAuth />
        </TabsContent>
        
        <TabsContent value="magic" className="mt-0">
          <MagicLinkAuth />
        </TabsContent>
        
        <TabsContent value="wizard" className="mt-0">
          <WizardAuth />
        </TabsContent>
      </Tabs>
    </div>
  );
}
