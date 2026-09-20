import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Update your personal and organizational details.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Manage your primary contact and company credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" required>Full Name</Label>
            <Input id="fullName" defaultValue="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailAddress" required>Email Address</Label>
            <Input id="emailAddress" type="email" defaultValue="john@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" defaultValue="Acme Corp" />
          </div>
          <Button className="w-full sm:w-auto">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
