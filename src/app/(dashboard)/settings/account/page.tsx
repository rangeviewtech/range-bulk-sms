'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputError } from "@/components/ui/input-error";
import { Label } from "@/components/ui/label";
import { useFormValidation } from "@/hooks/use-form-validation";
import { accountProfileSchema, type AccountProfileInput } from "@/lib/validations/settings";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AccountSettingsPage() {
  const [saving, setSaving] = useState(false);

  const { values, errors, touched, setFieldValue, handleBlur, validateAll } =
    useFormValidation<AccountProfileInput>({
      schema: accountProfileSchema,
      initialValues: {
        fullName: 'John Doe',
        emailAddress: 'john@example.com',
        companyName: 'Acme Corp',
      },
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateAll();
    if (!isValid) return;

    setSaving(true);
    try {
      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Account profile updated successfully');
    } catch {
      toast.error('Failed to update account settings');
    } finally {
      setSaving(false);
    }
  };

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
        <CardContent>
          <form onSubmit={handleSave} noValidate className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="fullName" required>Full Name</Label>
              <Input
                id="fullName"
                value={values.fullName}
                onChange={(e) => setFieldValue('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                error={touched.fullName && !!errors.fullName}
                aria-describedby={touched.fullName && errors.fullName ? 'fullName-error' : undefined}
                required
              />
              {touched.fullName && errors.fullName && (
                <InputError id="fullName-error" message={errors.fullName} />
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="emailAddress" required>Email Address</Label>
              <Input
                id="emailAddress"
                type="email"
                value={values.emailAddress}
                onChange={(e) => setFieldValue('emailAddress', e.target.value)}
                onBlur={() => handleBlur('emailAddress')}
                error={touched.emailAddress && !!errors.emailAddress}
                aria-describedby={touched.emailAddress && errors.emailAddress ? 'emailAddress-error' : undefined}
                required
              />
              {touched.emailAddress && errors.emailAddress && (
                <InputError id="emailAddress-error" message={errors.emailAddress} />
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={values.companyName ?? ''}
                onChange={(e) => setFieldValue('companyName', e.target.value)}
                onBlur={() => handleBlur('companyName')}
                error={touched.companyName && !!errors.companyName}
                aria-describedby={touched.companyName && errors.companyName ? 'companyName-error' : undefined}
              />
              {touched.companyName && errors.companyName && (
                <InputError id="companyName-error" message={errors.companyName} />
              )}
            </div>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
