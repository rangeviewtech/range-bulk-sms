'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Copy } from 'lucide-react';

export default function TemplatesPage() {
  const mockTemplates = [
    { id: '1', name: 'Order Confirmation', category: 'Transactional', message: 'Hi {{name}}, your order #{{orderId}} has been confirmed and will be shipped soon.', variables: ['name', 'orderId'] },
    { id: '2', name: 'Weekend Promo', category: 'Marketing', message: 'Don\'t miss out! Get 20% off all items this weekend using code {{code}}.', variables: ['code'] },
    { id: '3', name: 'Appointment Reminder', category: 'Reminders', message: 'Hello, this is a reminder for your appointment on {{date}} at {{time}}.', variables: ['date', 'time'] },
  ];

  return (
    <>
      <PageHeader
        title="SMS Templates"
        description="Manage your reusable message templates."
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        }
      />
      
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <Badge variant="secondary" className="mt-1 font-normal text-xs">{template.category}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-md text-sm font-sans whitespace-pre-wrap flex-1 mb-4 border border-border/50">
                {template.message}
              </div>

              <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                <div className="flex flex-wrap gap-1">
                  {template.variables.map(v => (
                    <span key={v} className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Copy className="w-3 h-3 mr-1.5" />
                  Use
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
