import { requirePermission } from '@/lib/auth/authorization';
import { prisma as db } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SmtpEmailProvider } from '@/lib/communications/email/smtp-provider';
import { PandoraSmsProvider } from '@/lib/communications/sms/pandora-provider';

export const dynamic = 'force-dynamic';

export default async function ProvidersPage() {
  await requirePermission('settings.manage');
  const smtp = new SmtpEmailProvider();
  const pandora = new PandoraSmsProvider();
  
  // Real-time ping
  const isSmtpUp = await smtp.healthCheck();
  const isPandoraUp = await pandora.healthCheck();

  const _healthRecords = await db.providerHealth.findMany();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader 
        heading="Provider Health" 
        description="Status and circuit breaker states for external communication APIs."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>SMTP Primary</CardTitle>
            <CardDescription>System Email Provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Live Connection:</span>
              <Badge variant={isSmtpUp ? 'default' : 'destructive'}>
                {isSmtpUp ? 'Online' : 'Unreachable'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pandora SMS</CardTitle>
            <CardDescription>Regional SMS Provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Live Connection (Config):</span>
              <Badge variant={isPandoraUp ? 'default' : 'destructive'}>
                {isPandoraUp ? 'Configured' : 'Missing Credentials'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
