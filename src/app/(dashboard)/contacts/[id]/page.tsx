import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MessageSquare, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { CountryFlagPhone } from '@/components/sms/country-flag-phone';
import { CarrierBadge } from '@/components/sms/carrier-badge';

export default function ContactDetailPage({ params: _params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/contacts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">John Doe</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Contact profile and conversation history</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send SMS
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-initial">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Phone Number & Network</span>
                <div className="flex flex-wrap items-center gap-2">
                  <CountryFlagPhone phone="+256700123456" asLink className="text-sm font-semibold text-foreground" />
                  <CarrierBadge phone="+256700123456" showIcon={false} size="sm" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>john@example.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Kampala, Uganda</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Groups & Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Groups</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">VIP</Badge>
                    <Badge variant="secondary">Customers</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">High Value</Badge>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Message History</CardTitle>
              <CardDescription>Recent SMS messages sent to this contact.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4 p-4 border rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Delivered</Badge>
                      <span className="text-sm text-muted-foreground">Oct 24, 2026 - 14:30</span>
                    </div>
                    <p className="text-sm">Hello John, your reservation for tomorrow at 8 PM is confirmed.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 border rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Delivered</Badge>
                      <span className="text-sm text-muted-foreground">Oct 20, 2026 - 09:15</span>
                    </div>
                    <p className="text-sm">Enjoy a 20% discount on your next visit using code VIP20.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
