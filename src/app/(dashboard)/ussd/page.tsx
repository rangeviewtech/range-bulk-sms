'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  PhoneCall, 
  Smartphone, 
  RotateCcw, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Zap,
  Activity,
  Code
} from 'lucide-react';
import { AIRTEL_USSD_TIERS } from '@/lib/telecom/airtel-rates';
import { processUssdSession, UssdSessionResponse } from '@/lib/ussd/ussd-simulator';

export default function UssdPage() {
  // Simulator State
  const [serviceCode, setServiceCode] = useState('*284#');
  const [sessionActive, setSessionActive] = useState(false);
  const [historyText, setHistoryText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentResponse, setCurrentResponse] = useState<UssdSessionResponse | null>(null);
  const [sessionLogs, setSessionLogs] = useState<string[]>([]);

  const handleStartSession = (code = serviceCode) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setSessionActive(true);
    setHistoryText('');
    setUserInput('');

    const res = processUssdSession({
      sessionId: `USSD_SES_${Date.now()}`,
      msisdn: '256701234567',
      serviceCode: cleanCode,
      text: '',
    });

    setCurrentResponse(res);
    setSessionLogs([`[DIAL] ${cleanCode}`, `[GATEWAY] ${res.action}: ${res.message.replace(/\n/g, ' ')}`]);
  };

  const handleSendInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sessionActive || !currentResponse || currentResponse.action === 'END') return;

    const trimmed = userInput.trim();
    if (!trimmed) return;

    const newHistory = historyText ? `${historyText}*${trimmed}` : trimmed;
    setHistoryText(newHistory);
    setUserInput('');

    const res = processUssdSession({
      sessionId: currentResponse.sessionId,
      msisdn: '256701234567',
      serviceCode,
      text: newHistory,
    });

    setCurrentResponse(res);
    setSessionLogs((prev) => [
      ...prev,
      `[INPUT] ${trimmed}`,
      `[GATEWAY] ${res.action}: ${res.message.replace(/\n/g, ' ')}`,
    ]);

    if (res.action === 'END') {
      setSessionActive(false);
    }
  };

  const handleResetSession = () => {
    setSessionActive(false);
    setHistoryText('');
    setUserInput('');
    setCurrentResponse(null);
    setSessionLogs([]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-mono">
              Airtel & UCC Compliant
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bulk USSD Portal & Simulator</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Interactive real-time session service (*XXX#), handset sandbox, and telecom tiered rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/wallet/pricing">
            <Button size="sm" variant="outline" className="text-xs">
              <Layers className="h-3.5 w-3.5 mr-1.5 text-primary" />
              View USSD Rates
            </Button>
          </Link>
          <Link href="/sender-ids/apply">
            <Button size="sm" className="text-xs bg-primary text-primary-foreground font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Request Short Code
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Short Code Routing</CardTitle>
            <PhoneCall className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">*284#</div>
            <p className="text-xs text-muted-foreground mt-1">Direct Airtel MSC/HLR bind</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Volume Pricing</CardTitle>
            <Zap className="h-4 w-4 text-secondary dark:text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">From UGX 2.50</div>
            <p className="text-xs text-muted-foreground mt-1">Per completed session (VAT Incl.)</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Session Latency</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">&lt; 1.2s</div>
            <p className="text-xs text-muted-foreground mt-1">Real-time GSM MAP turnaround</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Handset Storage</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 MB (Session)</div>
            <p className="text-xs text-muted-foreground mt-1">Ephemeral memory, high privacy</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Interactive Simulator & Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Handset Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-primary/20 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Interactive Handset Simulator</CardTitle>
                </div>
                <Badge 
                  variant={sessionActive ? 'default' : 'secondary'}
                  className={sessionActive ? 'bg-emerald-500 text-white text-[10px]' : 'text-[10px]'}
                >
                  {sessionActive ? 'LIVE SESSION (CON)' : currentResponse?.action === 'END' ? 'ENDED (END)' : 'IDLE'}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Test real-time multi-level USSD menu traversal as rendered on subscriber handsets.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Dialing Bar */}
              <div className="space-y-1.5">
                <label htmlFor="service-code" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  USSD Short Code
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="service-code"
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value)}
                    placeholder="*284#"
                    className="font-mono font-bold tracking-widest text-center text-lg"
                    disabled={sessionActive}
                  />
                  {!sessionActive ? (
                    <Button 
                      type="button" 
                      onClick={() => handleStartSession()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <PhoneCall className="h-4 w-4 mr-1.5" /> Dial
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={handleResetSession}
                      className="font-semibold"
                    >
                      <RotateCcw className="h-4 w-4 mr-1.5" /> End
                    </Button>
                  )}
                </div>
              </div>

              {/* Handset Mock Screen */}
              <div className="border-4 border-muted-foreground/20 rounded-2xl bg-zinc-950 text-zinc-100 p-4 shadow-inner min-h-[260px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800 pb-1 mb-2 font-mono">
                  <span>AIRTEL UG</span>
                  <span>USSD Service</span>
                  <span>100%</span>
                </div>

                <div className="flex-1 flex flex-col justify-center my-2">
                  {currentResponse ? (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 space-y-3">
                      <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-zinc-100">
                        {currentResponse.message}
                      </pre>
                      {currentResponse.action === 'CON' && (
                        <form onSubmit={handleSendInput} className="flex gap-2 pt-2 border-t border-zinc-800">
                          <Input
                            autoFocus
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Reply (e.g. 1)"
                            className="bg-zinc-950 border-zinc-700 text-zinc-100 text-xs h-8 font-mono"
                          />
                          <Button 
                            type="submit" 
                            size="sm" 
                            className="h-8 px-3 bg-primary text-primary-foreground font-bold"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-zinc-500 text-xs space-y-1 py-8">
                      <Smartphone className="h-8 w-8 mx-auto opacity-40 mb-2" />
                      <p>Handset screen in standby.</p>
                      <p className="text-[11px] opacity-75">Dial <code className="text-zinc-300 font-mono">*284#</code> above to initiate session.</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[10px] text-zinc-500 text-center font-mono border-t border-zinc-900">
                  {currentResponse?.action === 'END' ? 'Session completed' : sessionActive ? 'Session active: 20s timeout window' : 'Ready'}
                </div>
              </div>

              {/* Fast Option Buttons */}
              {sessionActive && currentResponse?.action === 'CON' && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground mr-1">Quick Select:</span>
                  {['1', '2', '3', '4'].map((digit) => (
                    <Button
                      key={digit}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 w-8 p-0 font-mono text-xs font-bold"
                      onClick={() => {
                        setUserInput(digit);
                      }}
                    >
                      {digit}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="h-7 text-xs ml-1 bg-primary text-primary-foreground font-semibold"
                    onClick={() => handleSendInput()}
                  >
                    Send Choice
                  </Button>
                </div>
              )}

              {/* Live Session Protocol Logs */}
              {sessionLogs.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold flex items-center gap-1">
                      <Terminal className="h-3.5 w-3.5 text-primary" /> Session Protocol Trace
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setSessionLogs([])}
                      className="text-[10px] text-muted-foreground hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5 font-mono text-[11px] space-y-1 max-h-32 overflow-y-auto border">
                    {sessionLogs.map((log, idx) => (
                      <div key={idx} className="leading-tight">
                        <span className={log.startsWith('[GATEWAY]') ? 'text-primary font-semibold' : 'text-foreground'}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Specifications & Use Cases (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* USSD Use Cases & Workflow */}
          <Card className="border-secondary/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-secondary dark:text-primary" />
                Enterprise Bulk USSD Applications
              </CardTitle>
              <CardDescription className="text-xs">
                Key business use cases deployed over Airtel Uganda GSM cellular network:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Mobile Banking & Wallets
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Balance inquiries, mini-statements, PIN-authenticated transactions, and account alerts.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Customer Self-Service
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Interactive help menus, ticket tracking, branch locators, and automated order lookups.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Surveys & Registrations
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Zero-data feedback collection, field surveys, member registration, and voting polls.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Utilities & Airtime
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Electricity token generation, water bill lookups, voucher redemption, and data vending.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Official Airtel USSD Tiered Pricing */}
          <Card className="border-secondary/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Airtel Bulk USSD Tiered Pricing Bands (VAT Incl.)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Official volume-based rates per completed 20-second session window:
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  8 Tiers
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 pt-0">
              <div className="rounded-lg border overflow-hidden">
                <div className="hidden sm:grid sm:grid-cols-3 bg-muted/50 p-2.5 text-xs font-bold border-b">
                  <span>Session Volume Band</span>
                  <span className="text-center">Rate / Session</span>
                  <span className="text-right">Contracting SLA</span>
                </div>
                <div className="divide-y text-xs">
                  {AIRTEL_USSD_TIERS.map((tier) => (
                    <div key={tier.id} className="p-2.5 flex flex-col sm:grid sm:grid-cols-3 items-start sm:items-center justify-between gap-1 sm:gap-0">
                      <span className="font-medium text-foreground">{tier.name}</span>
                      <span className="font-bold text-secondary dark:text-primary sm:text-center">
                        UGX {tier.rateUgx.toFixed(2)}
                      </span>
                      <span className="sm:text-right">
                        {tier.isNegotiable ? (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                            Negotiable / Custom SLA
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Standard Direct</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gateway Webhook & SMPP Architecture */}
          <Card className="border-secondary/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Developer Interconnect & Webhook Format</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Handle real-time session HTTP callbacks from Range Telecom Gateway:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-xs">
              <div className="rounded-lg bg-zinc-950 p-3 text-zinc-100 font-mono text-[11px] overflow-x-auto space-y-2">
                <div className="text-zinc-400">{'// Inbound HTTP POST from Gateway to your server:'}</div>
                <div>{`POST /api/ussd-callback`}</div>
                <div className="text-emerald-400">{`{
  "sessionId": "USSD_948201",
  "msisdn": "256701234567",
  "serviceCode": "*284#",
  "text": "1"
}`}</div>
                <div className="text-zinc-400 pt-1">{'// Expected Response (CON for menu, END to terminate):'}</div>
                <div className="text-amber-300">{`{
  "action": "CON",
  "message": "Welcome to MyBank\\n1. Check Balance\\n2. Transfer"
}`}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
