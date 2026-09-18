'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ArrowRight, Settings2, FileSpreadsheet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function CustomSmsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Personalized SMS"
        description="Send customized messages using data from your spreadsheet."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">1</span>
                Upload Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-muted/20">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Upload CSV or Excel file</h3>
                  <p className="text-sm text-muted-foreground mb-4">Max file size 10MB. Must include a column for phone numbers.</p>
                  <Button variant="secondary">
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">2</span>
                Map Columns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number Column *</Label>
                  <Select defaultValue="col_phone">
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="col_phone">Phone (Detected)</SelectItem>
                      <SelectItem value="col_name">First Name</SelectItem>
                      <SelectItem value="col_amount">Amount Due</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4 border-t mt-4">
                <h4 className="text-sm font-medium mb-3">Available Variables</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="font-mono bg-muted/50">{`{{First Name}}`}</Badge>
                  <Badge variant="outline" className="font-mono bg-muted/50">{`{{Last Name}}`}</Badge>
                  <Badge variant="outline" className="font-mono bg-muted/50">{`{{Amount Due}}`}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">3</span>
                Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                rows={5}
                placeholder="Hi {{First Name}}, your balance of {{Amount Due}} is due tomorrow..."
                defaultValue="Hi {{First Name}}, this is a reminder that your balance of {{Amount Due}} is due on Friday. Thank you!"
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border p-4 bg-muted/10">
              <Button>
                Continue to Review <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="w-4 h-4 text-primary" />
                Live Preview
              </CardTitle>
              <CardDescription>Preview for Row 1</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg font-sans text-sm min-h-[120px] whitespace-pre-wrap border border-border/50">
                Hi John, this is a reminder that your balance of $150.00 is due on Friday. Thank you!
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <span className="text-xs text-muted-foreground">Row 1 of 500</span>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


