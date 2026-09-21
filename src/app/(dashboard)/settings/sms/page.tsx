'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputError } from "@/components/ui/input-error";
import { Label } from "@/components/ui/label";
import { useFormValidation } from "@/hooks/use-form-validation";
import { smsPreferencesSchema, type SmsPreferencesInput } from "@/lib/validations/settings";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SmsSettingsPage() {
  const [saving, setSaving] = useState(false);

  const { values, errors, touched, setFieldValue, handleBlur, validateAll } =
    useFormValidation<SmsPreferencesInput>({
      schema: smsPreferencesSchema,
      initialValues: {
        defaultSenderId: 'ACME',
        webhookUrl: '',
      },
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateAll();
    if (!isValid) return;

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('SMS preferences saved successfully');
    } catch {
      toast.error('Failed to save SMS preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SMS Preferences</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Set up defaults and callback URLs for your quick campaigns.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>Default sender identity and delivery receipt callbacks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} noValidate className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="defaultSenderId" required>Default Sender ID</Label>
              <Input
                id="defaultSenderId"
                value={values.defaultSenderId}
                onChange={(e) => setFieldValue('defaultSenderId', e.target.value)}
                onBlur={() => handleBlur('defaultSenderId')}
                error={touched.defaultSenderId && !!errors.defaultSenderId}
                aria-describedby={touched.defaultSenderId && errors.defaultSenderId ? 'defaultSenderId-error' : undefined}
                required
              />
              {touched.defaultSenderId && errors.defaultSenderId && (
                <InputError id="defaultSenderId-error" message={errors.defaultSenderId} />
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="webhookUrl">Callback Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://..."
                value={values.webhookUrl ?? ''}
                onChange={(e) => setFieldValue('webhookUrl', e.target.value)}
                onBlur={() => handleBlur('webhookUrl')}
                error={touched.webhookUrl && !!errors.webhookUrl}
                aria-describedby={touched.webhookUrl && errors.webhookUrl ? 'webhookUrl-error' : undefined}
              />
              {touched.webhookUrl && errors.webhookUrl && (
                <InputError id="webhookUrl-error" message={errors.webhookUrl} />
              )}
            </div>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Preferences
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
