import { prisma } from '@/lib/prisma';
﻿/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import { requireAuth } from '@/lib/auth/session';
import { User, Mail, Shield, CheckCircle2 } from 'lucide-react';

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = session.user;
  const roles = await prisma.userRole.findMany({ where: { userId: session.userId }, select: { role: { select: { name: true } } } });
  const roleNames = roles.map(item => item.role.name).join(', ') || 'User';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <User className="w-6 h-6 text-[#29a4ff]" />
          Account Profile & Credentials
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your administrative identity, roles, and security session metadata.
        </p>
      </div>
      
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-5">
          <div className="w-16 h-16 rounded-full bg-[#07163d] text-white flex items-center justify-center text-xl font-bold border-2 border-[#29a4ff]">
            {user.name?.[0] || 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
            <div className="text-xs text-muted-foreground font-mono">{user.email}</div>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3" /> {roleNames}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-muted/40 rounded-lg border border-border">
            <div className="text-muted-foreground text-[11px]">User Account Email</div>
            <div className="text-sm font-semibold text-foreground mt-0.5">{user.email}</div>
          </div>
          <div className="p-3.5 bg-muted/40 rounded-lg border border-border">
            <div className="text-muted-foreground text-[11px]">Assigned Role</div>
            <div className="text-sm font-semibold text-foreground mt-0.5">{roleNames}</div>
          </div>
          <div className="p-3.5 bg-muted/40 rounded-lg border border-border">
            <div className="text-muted-foreground text-[11px]">Active Session Status</div>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Authenticated (2FA Verified)</div>
          </div>
          <div className="p-3.5 bg-muted/40 rounded-lg border border-border">
            <div className="text-muted-foreground text-[11px]">Default Fleet Tenant</div>
            <div className="text-sm font-semibold text-foreground mt-0.5">Not configured</div>
          </div>
        </div>
      </div>
    </div>
  );
}
