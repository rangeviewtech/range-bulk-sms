'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Note: Realistically this would fetch the user's current MFA status from the server
// For this template, it's a structural representation.

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        heading="Security Settings"
        description="Manage your account security, multi-factor authentication, and screen lock."
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Multi-Factor Authentication (MFA)</CardTitle>
            <CardDescription>
              Protect your account by requiring an additional code from your authenticator app when you sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="mfa-toggle" className="font-medium flex flex-col">
                <span>Authenticator App</span>
                <span className="font-normal text-muted-foreground text-sm">Use an app like Authy or Google Authenticator.</span>
              </Label>
              <Switch id="mfa-toggle" />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
            Status: <span className="font-medium text-foreground ml-2">Disabled</span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Screen Lock PIN</CardTitle>
            <CardDescription>
              Set a 6-digit PIN to unlock your session if you step away.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="pin-toggle" className="font-medium flex flex-col">
                <span>Inactivity Lock</span>
                <span className="font-normal text-muted-foreground text-sm">Requires a PIN after 15 minutes of inactivity.</span>
              </Label>
              <Switch id="pin-toggle" />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
            Status: <span className="font-medium text-foreground ml-2">Not Configured</span>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="default">Save Preferences</Button>
      </div>
    </div>
  );
}
