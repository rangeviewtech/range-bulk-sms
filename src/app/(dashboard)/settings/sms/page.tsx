import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SmsSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SMS Preferences</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Set up defaults and callback URLs for your quick campaigns.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>Default sender identity and delivery receipt callbacks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Sender ID</label>
            <Input defaultValue="ACME" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Callback Webhook URL</label>
            <Input type="url" placeholder="https://..." />
          </div>
          <Button className="w-full sm:w-auto">Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
