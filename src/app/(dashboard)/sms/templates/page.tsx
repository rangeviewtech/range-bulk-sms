'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  message: string;
  variables: string[];
}

const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: '1',
    name: 'Order Confirmation',
    category: 'Transactional',
    message: 'Hi {{name}}, your order #{{orderId}} has been confirmed and will be shipped soon.',
    variables: ['name', 'orderId'],
  },
  {
    id: '2',
    name: 'Weekend Promo',
    category: 'Marketing',
    message: "Don't miss out! Get 20% off all items this weekend using code {{code}}.",
    variables: ['code'],
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    category: 'Reminders',
    message: 'Hello, this is a reminder for your appointment on {{date}} at {{time}}.',
    variables: ['date', 'time'],
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Template Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Transactional');
  const [newMessage, setNewMessage] = useState('');

  const filteredTemplates = templates.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q)
    );
  });

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMessage.trim()) {
      toast.error('Please enter a template name and message body.');
      return;
    }

    // Extract {{var}} placeholders
    const matches = newMessage.match(/\{\{([^}]+)\}\}/g) || [];
    const extractedVariables = Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, '').trim())));

    const created: TemplateItem = {
      id: String(Date.now()),
      name: newName.trim(),
      category: newCategory,
      message: newMessage.trim(),
      variables: extractedVariables,
    };

    setTemplates((prev) => [created, ...prev]);
    toast.success(`Template "${created.name}" created successfully!`);
    setCreateDialogOpen(false);
    setNewName('');
    setNewMessage('');
  };

  const handleCopy = (t: TemplateItem) => {
    navigator.clipboard.writeText(t.message);
    setCopiedId(t.id);
    toast.success(`Copied "${t.name}" to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success(`Template "${name}" deleted.`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="SMS Templates"
        description="Manage your reusable message templates."
        action={
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            <p className="font-medium text-foreground">No templates found</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Try a different search query or create a new reusable template.
            </p>
            <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Template
            </Button>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{template.name}</h3>
                    <Badge variant="secondary" className="mt-1 font-normal text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(template.id, template.name)}
                      aria-label={`Delete ${template.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-md text-sm font-sans whitespace-pre-wrap flex-1 mb-4 border border-border/50">
                  {template.message}
                </div>

                <div className="mt-auto pt-4 border-t border-border flex justify-between items-center gap-2">
                  <div className="flex flex-wrap gap-1">
                    {template.variables.length > 0 ? (
                      template.variables.map((v) => (
                        <span
                          key={v}
                          className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"
                        >
                          {`{{${v}}}`}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No variables</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={() => handleCopy(template)}
                  >
                    {copiedId === template.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create SMS Template</DialogTitle>
            <DialogDescription>
              Design reusable message templates with dynamic placeholders like {'{{name}}'}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTemplate} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <DialogBody>
              <div className="space-y-2">
                <Label htmlFor="template-name" required>Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g. Welcome Message"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger id="template-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transactional">Transactional</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Reminders">Reminders</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="OTP">OTP &amp; Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-body" required>Message Body</Label>
                <Textarea
                  id="template-body"
                  rows={4}
                  placeholder="e.g. Hello {{name}}, thank you for contacting us!"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Variables formatted as <span className="font-mono">{`{{variable}}`}</span> will be automatically recognized.
                </p>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

