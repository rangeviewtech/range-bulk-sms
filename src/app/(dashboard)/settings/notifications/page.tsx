import { generateTelegramLinkingToken } from '@/app/(auth)/actions';
import { z } from 'zod';
import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/dal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationPhoneInput } from '@/components/forms/notification-phone-input';
import { redirect } from 'next/navigation';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Notification Preferences',
  description: 'Manage SMS, Telegram, and email notification preferences.',
});

const CATEGORIES = [
  { id: 'SECURITY', label: 'Security & Alerts', desc: 'Login alerts, password changes.' },
  { id: 'MARKETING', label: 'Marketing & Promos', desc: 'News, offers, and tips.' },
  { id: 'SYSTEM', label: 'System Notifications', desc: 'Maintenance, updates.' }
];

export default async function NotificationSettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const feedback = await searchParams;
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  const prefs = await prisma.notificationPreference.findMany({
    where: { userId: session.userId }
  });

  const getChannels = (cat: string) => {
    const p = prefs.find(x => x.category === cat);
    return p ? p.channels : ['EMAIL', 'IN_APP']; // defaults
  };

  async function savePreferences(formData: FormData) {
    'use server';
    const s = await requireAuth();

    const parsed = z.string().trim().regex(/^(?:\+[1-9]\d{6,14})?$/).safeParse(formData.get('phone'));
    if (!parsed.success) redirect('/settings/notifications?error=phone');
    const phone = parsed.data;

    try {
    await prisma.$transaction(async tx => {
    await tx.user.update({
      where: { id: s.userId },
      data: {
        phone: phone || null,
        whatsappConsent: CATEGORIES.some(cat => formData.get(cat.id + '_WHATSAPP') === 'on'),
      }
    });
    
    for (const cat of CATEGORIES) {
      const email = formData.get(`${cat.id}_EMAIL`) === 'on';
      const sms = formData.get(`${cat.id}_SMS`) === 'on';
      const inapp = formData.get(`${cat.id}_IN_APP`) === 'on';
      const telegram = formData.get(`${cat.id}_TELEGRAM`) === 'on';
      const whatsapp = formData.get(`${cat.id}_WHATSAPP`) === 'on';
      
      const channels = [];
      if (email) channels.push('EMAIL');
      if (sms) channels.push('SMS');
      if (inapp) channels.push('IN_APP');
      if (telegram) channels.push('TELEGRAM');
      if (whatsapp) channels.push('WHATSAPP');

      await tx.notificationPreference.upsert({
        where: { userId_category: { userId: s.userId, category: cat.id } },
        update: { channels },
        create: { userId: s.userId, category: cat.id, channels }
      });
    }

    });
    } catch { redirect('/settings/notifications?error=save'); }
    redirect('/settings/notifications?saved=true');
  }

  async function linkTelegram() {
    'use server';
    const result = await generateTelegramLinkingToken();
    if (result.url) redirect(result.url);
    redirect('/settings/notifications?error=link');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notification Preferences</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage how you receive alerts and messages.</p>
      </div>

      {feedback.error && <p role="alert" className="text-destructive">Unable to save. Check the international phone number and try again.</p>}
      {feedback.saved && <p role="status">Notification preferences saved.</p>}
      <form action={savePreferences}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Numbers and IDs for messaging platforms.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="phone">Phone Number (For SMS &amp; WhatsApp)</Label>
                <NotificationPhoneInput defaultValue={user?.phone || ''} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
                <Input id="telegramChatId" readOnly aria-describedby="telegram-help" defaultValue={user?.telegramChatId || ''} placeholder="Not linked" />
                <Button type="submit" formAction={linkTelegram} formNoValidate variant="outline">Link Telegram account</Button>
                <p id="telegram-help" className="text-sm text-muted-foreground">Telegram IDs are set only after verified bot linking.</p>
              </div>
            </CardContent>
          </Card>

          {CATEGORIES.map((cat) => {
            const channels = getChannels(cat.id);
            return (
              <Card key={cat.id}>
                <CardHeader>
                  <CardTitle>{cat.label}</CardTitle>
                  <CardDescription>{cat.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${cat.id}_EMAIL`}>Email</Label>
                    <Switch id={`${cat.id}_EMAIL`} name={`${cat.id}_EMAIL`} defaultChecked={channels.includes('EMAIL')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${cat.id}_SMS`}>SMS</Label>
                    <Switch id={`${cat.id}_SMS`} name={`${cat.id}_SMS`} defaultChecked={channels.includes('SMS')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${cat.id}_IN_APP`}>In-App</Label>
                    <Switch id={`${cat.id}_IN_APP`} name={`${cat.id}_IN_APP`} defaultChecked={channels.includes('IN_APP')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${cat.id}_TELEGRAM`}>Telegram</Label>
                    <Switch id={`${cat.id}_TELEGRAM`} name={`${cat.id}_TELEGRAM`} defaultChecked={channels.includes('TELEGRAM')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${cat.id}_WHATSAPP`}>WhatsApp</Label>
                    <Switch id={`${cat.id}_WHATSAPP`} name={`${cat.id}_WHATSAPP`} defaultChecked={channels.includes('WHATSAPP')} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">Save Preferences</Button>
        </div>
      </form>
    </div>
  );
}
