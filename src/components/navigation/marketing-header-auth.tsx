'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Send,
  MessageSquare,
  Wallet,
  ArrowRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { ThemeToggle } from '@/components/navigation/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface HeaderUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: string[];
  status?: string;
}

interface MarketingHeaderAuthProps {
  initialUser?: HeaderUser | null;
  className?: string;
  showThemeToggle?: boolean;
  children?: React.ReactNode;
}

export function MarketingHeaderAuth({
  initialUser = null,
  className = '',
  showThemeToggle = true,
  children,
}: MarketingHeaderAuthProps) {
  const [user, setUser] = useState<HeaderUser | null>(initialUser);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if initialUser changes from server
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Client-side session synchronization check
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.isAuth && data.user) {
              setUser(data.user);
            } else {
              setUser(null);
            }
          }
        }
      } catch {
        // Fall back to server prop state
      }
    }

    checkSession();

    const handleSessionUpdated = () => checkSession();
    window.addEventListener('range_session_updated', handleSessionUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('range_session_updated', handleSessionUpdated);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Robust hover handling with debounce to prevent flicker
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  // In-place logout: stays on current page without redirect to /login
  const handleLogout = async (e?: React.SyntheticEvent | Event) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const res = await fetch('/api/auth/logout?redirect=false', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        setUser(null);
        setIsOpen(false);
        toast.success('Logged out successfully');
        window.dispatchEvent(new Event('range_session_updated'));
      } else {
        // Fallback
        setUser(null);
        setIsOpen(false);
        toast.success('Logged out');
      }
    } catch {
      setUser(null);
      setIsOpen(false);
      toast.success('Logged out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userInitials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const userRole = user?.roles?.[0] || 'Client';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Theme Switcher Toggle */}
      {showThemeToggle && <ThemeToggle />}
      {children}

      {user ? (
        /* Authenticated: Active Session Avatar & Hover Dropdown */
        <div
          className="relative inline-flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open user profile menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
                className="group relative flex items-center gap-2 p-0.5 rounded-full border border-border/80 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer bg-background"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border/40 group-hover:scale-105 transition-transform">
                    <AvatarImage src={user.image || ''} alt={user.name || user.email || 'User Avatar'} />
                    <AvatarFallback className="bg-[#04648C]/10 text-[#04648C] dark:bg-[#FBCA07]/20 dark:text-[#FBCA07] font-bold text-xs sm:text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Active session green indicator dot */}
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
                    title="Active session"
                  />
                </div>

                <div className="hidden lg:flex flex-col items-start pr-1 text-left">
                  <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                    {user.name || user.email?.split('@')[0] || 'My Account'}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                    {userRole}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 hidden lg:block mr-1 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64 p-1.5 rounded-xl border bg-popover text-popover-foreground shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150 z-[100]"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* User Profile Summary Header */}
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={user.image || ''} alt={user.name || user.email || 'User Avatar'} />
                    <AvatarFallback className="bg-[#04648C]/10 text-[#04648C] dark:bg-[#FBCA07]/20 dark:text-[#FBCA07] font-bold text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.name || 'Range User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-normal">
                      {user.email || 'user@range.ug'}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-900 border border-amber-500/30 dark:bg-primary/15 dark:text-primary dark:border-primary/30">
                        {userRole}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        ● Active
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1 bg-border/60" />

              {/* Primary Dashboard Redirect Link */}
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-[#04648C] dark:text-[#FBCA07] bg-[#04648C]/10 dark:bg-[#FBCA07]/10 hover:bg-[#04648C]/15 dark:hover:bg-[#FBCA07]/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </Link>
              </DropdownMenuItem>

              {/* Quick Navigation Links */}
              <div className="pt-1 space-y-0.5">
                <DropdownMenuItem asChild>
                  <Link
                    href="/sms/send"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Send className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Send SMS Message</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/sms/campaigns"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-accent cursor-pointer transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Broadcast Campaigns</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/wallet"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Wallet &amp; Billing</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/settings/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-1 bg-border/60" />

              {/* In-Place Logout Action */}
              <DropdownMenuItem
                disabled={isLoggingOut}
                onSelect={(e) => {
                  e.preventDefault();
                  handleLogout(e);
                }}
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        /* Unauthenticated: Sign In & Get Started Buttons */
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-xs font-semibold">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 text-xs shadow-xs"
          >
            <Link href="/register">
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
