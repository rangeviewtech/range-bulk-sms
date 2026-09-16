'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Check, Send } from 'lucide-react';

export default function NewCampaignPage() {
  const [step, setStep] = useState(1);

  const steps = [
    { id: 1, title: 'Details' },
    { id: 2, title: 'Recipients' },
    { id: 3, title: 'Message' },
    { id: 4, title: 'Review' },
  ];

  return (
    <>
      <PageHeader
        title="Create Campaign"
        description="Launch a new SMS marketing campaign in 4 easy steps."
      />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Progress Bar */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-muted rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          <div className="relative flex justify-between">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                    step > s.id 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : step === s.id 
                        ? 'bg-background border-primary text-primary' 
                        : 'bg-background border-muted text-muted-foreground'
                  }`}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-xs font-medium ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[step - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 min-h-[300px]">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input placeholder="e.g. Summer Promo 2026" />
                </div>
                <div className="space-y-2">
                  <Label>Sender ID</Label>
                  <Select defaultValue="RANGESMS">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sender ID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANGESMS">RANGESMS</SelectItem>
                      <SelectItem value="INFO">INFO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Contact Groups</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g1">All Customers (15,400)</SelectItem>
                      <SelectItem value="g2">VIP Members (1,200)</SelectItem>
                      <SelectItem value="g3">Leads (5,000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea rows={6} placeholder="Type your campaign message..." />
                </div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Variables: {'{{name}}'}, {'{{company}}'}</span>
                  <span>0 characters | 1 segment</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-4">Campaign Summary</h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-muted-foreground">Name:</div>
                  <div className="font-medium">Summer Promo 2026</div>
                  <div className="text-muted-foreground">Sender ID:</div>
                  <div className="font-medium">RANGESMS</div>
                  <div className="text-muted-foreground">Recipients:</div>
                  <div className="font-medium">15,400 (All Customers)</div>
                  <div className="text-muted-foreground">Est. Cost:</div>
                  <div className="font-medium">154,000 UGX</div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border p-6">
            <Button 
              variant="outline" 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            {step < 4 ? (
              <Button onClick={() => setStep(Math.min(4, step + 1))}>
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Launch Campaign <Send className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
