import { Users, Send, Wallet, Activity, Contact, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

export function ClientDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title={<AnimatedShinyText className="inline-flex m-0 p-0 text-left items-start justify-start transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">Client Dashboard</AnimatedShinyText>}
        description="Manage your SMS campaigns and contacts."
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Link href="/wallet" className="w-full sm:w-44">
              <ShimmerButton
                shimmerColor="#ffffff"
                shimmerSize="0.1em"
                background="hsl(var(--secondary))"
                className="w-full h-10 px-5 shadow-none group"
              >
                <span className="flex items-center justify-center text-secondary-foreground font-semibold text-sm whitespace-pre-wrap tracking-tight">
                  <Wallet className="w-4 h-4 mr-2 shrink-0 transition-transform group-hover:scale-110" />
                  Top Up Wallet
                </span>
              </ShimmerButton>
            </Link>
            <Link href="/sms/send" className="w-full sm:w-44">
              <ShimmerButton
                shimmerColor="#ffffff"
                shimmerSize="0.1em"
                background="hsl(var(--primary))"
                className="w-full h-10 px-5 shadow-none group"
              >
                <span className="flex items-center justify-center text-primary-foreground font-semibold text-sm whitespace-pre-wrap tracking-tight">
                  <Send className="w-4 h-4 mr-2 shrink-0 transition-transform group-hover:translate-x-1" />
                  Send SMS
                </span>
              </ShimmerButton>
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Contacts", icon: Users, value: "5,432", trend: { value: "12%", isPositive: true, label: "this month" } },
          { title: "SMS Sent (Month)", icon: Send, value: "12,450", trend: { value: "8.4%", isPositive: true, label: "vs last month" } },
          { title: "Wallet Balance", icon: Wallet, value: "UGX 45,000", description: "~1,285 SMS capacity" },
          { title: "Delivery Rate", icon: Activity, value: "99.1%", trend: { value: "0.4%", isPositive: true } },
        ].map((kpi, i) => (
          <MetricCard
            key={i}
            title={kpi.title}
            icon={kpi.icon}
            value={kpi.value}
            trend={kpi.trend}
            description={kpi.description}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 pt-4">
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow shadow-none">
                <Activity className="w-3.5 h-3.5 text-inherit" />
              </div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-foreground/80">Recent Campaigns</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 rounded-full text-muted-foreground">
              <Link href="/sms/campaigns">
                View All
              </Link>
            </Button>
          </div>
          
          <div className="flex-1 rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
            {[
              { name: "Weekend Promo", status: "Completed", date: "2 days ago", count: 1200 },
              { name: "Flash Sale Alert", status: "Running", date: "Today", count: 4500 },
              { name: "Monthly Newsletter", status: "Draft", date: "Pending", count: 0 },
            ].map((campaign, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground tracking-tight">{campaign.name}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{campaign.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-semibold text-muted-foreground">{campaign.count} msgs</span>
                  <Badge variant={campaign.status === "Running" ? "default" : campaign.status === "Draft" ? "secondary" : "outline"} className="shadow-none">
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow shadow-none">
                <TrendingUp className="w-3.5 h-3.5 text-inherit" />
              </div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-foreground/80">Quick Actions</h2>
            </div>
          </div>
          <div className="flex-1 grid gap-4 sm:grid-cols-2">
            <Link href="/contacts/import" className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card p-8 hover:bg-muted/30 transition-colors shadow-none">
              <div className="p-3 bg-muted/60 dark:bg-muted/30 rounded-full shadow-none">
                <Contact className="h-6 w-6 text-brand-blue dark:text-brand-yellow" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">Import Contacts</span>
            </Link>
            <Link href="/reports/sms" className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card p-8 hover:bg-muted/30 transition-colors shadow-none">
              <div className="p-3 bg-muted/60 dark:bg-muted/30 rounded-full shadow-none">
                <TrendingUp className="h-6 w-6 text-brand-blue dark:text-brand-yellow" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">View Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
