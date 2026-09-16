import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SmsSettingsPage() {
  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">SMS Preferences</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>Set up defaults for your quick campaigns.</CardDescription>
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
          <Button>Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
