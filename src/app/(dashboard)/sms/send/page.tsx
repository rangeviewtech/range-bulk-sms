'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Clock, BookTemplate, Eye, FileText, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SendSmsPage() {
  const [message, setMessage] = useState('');
  
  const charCount = message.length;
  const segments = Math.ceil(charCount / 160) || 1;
  const encoding = /[^\x00-\x7F]/.test(message) ? 'Unicode' : 'GSM-7';
  const recipients = 1; // mock
  const cost = segments * recipients * 10; // mock

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Send SMS"
        description="Compose and send bulk SMS messages to your contacts."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
              <CardDescription>Configure your message sender and recipients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender">Sender ID</Label>
                  <Select defaultValue="RANGESMS">
                    <SelectTrigger id="sender">
                      <SelectValue placeholder="Select sender ID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANGESMS">RANGESMS</SelectItem>
                      <SelectItem value="INFO">INFO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Input id="recipients" placeholder="Enter phone numbers separated by comma" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label htmlFor="message">Message Content</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="h-8">
                      <BookTemplate className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <FileText className="w-4 h-4 mr-2" />
                      Variables
                    </Button>
                  </div>
                </div>
                <Textarea 
                  id="message" 
                  rows={6}
                  placeholder="Type your message here..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">Characters</div>
                  <div className="font-medium">{charCount}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Segments</div>
                  <div className="font-medium">{segments}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Encoding</div>
                  <div className="font-medium">{encoding}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Est. Cost</div>
                  <div className="font-medium">{cost} UGX</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border p-4 sm:p-6 bg-muted/10">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle>Message Preview</DialogTitle>
                    <DialogDescription>This is how your message will appear on a device.</DialogDescription>
                  </DialogHeader>
                  <div className="p-4 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap font-sans text-sm">
                    {message || 'Your message preview will appear here.'}
                  </div>
                  <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                    <Button type="button" variant="secondary">Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                  <TabsTrigger value="import">Import</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Enter numbers manually or copy-paste a list of comma-separated phone numbers.</p>
                </TabsContent>
                <TabsContent value="groups" className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Select one or more contact groups to send this message to.</p>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g1">VIP Customers (142)</SelectItem>
                      <SelectItem value="g2">Staff (45)</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>
                <TabsContent value="import" className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Upload a CSV or Excel file containing phone numbers and variables.</p>
                  <Input type="file" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground">Wallet Balance</span>
                <span className="font-semibold text-green-600 dark:text-green-400">45,000 UGX</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground">SMS Credits</span>
                <span className="font-semibold">4,500</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
