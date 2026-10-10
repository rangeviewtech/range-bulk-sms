'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FacebookSolid,
  InstagramSolid,
  XSolid,
  TikTokSolid,
  WhatsAppSolid,
  YouTubeSolid,
  LinkedInSolid,
  ThreadsSolid,
  GitHubSolid,
  TelegramSolid,
} from '@/components/icons/social-icons';

interface TopBarProps {
  className?: string;
  hideOnScroll?: boolean;
}

export function TopBar({ className, hideOnScroll = false }: TopBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!hideOnScroll) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);

  return (
    <div
      className={cn(
        'w-full bg-card text-muted-foreground text-xs py-1.5 border-b border-border/60 transition-all duration-300 overflow-hidden',
        hideOnScroll && isScrolled ? 'h-0 py-0 opacity-0 border-transparent' : 'h-auto opacity-100',
        className
      )}
    >
      <div className="mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[50px] flex justify-between items-center gap-4">
        {/* Contact Numbers & Emails */}
        <div className="flex items-center gap-2.5 2xl:gap-5 flex-wrap">
          {/* 3 Phone Numbers */}
          <div className="flex items-center gap-2 2xl:gap-3 text-[11px] 2xl:text-xs">
            <a
              href="tel:+256783100930"
              className="flex items-center gap-1 hover:text-foreground transition-colors group"
              title="MTN / Engineering Desk: +256 783 100 930"
            >
              <Phone className="h-3 w-3 text-primary group-hover:scale-110 transition-transform shrink-0" />
              <span>+256 783 100 930</span>
            </a>
            <span className="text-border select-none" aria-hidden="true">•</span>
            <a
              href="tel:+256700897453"
              className="flex items-center gap-1 hover:text-foreground transition-colors group"
              title="Airtel / Corporate Desk: +256 700 897 453"
            >
              <Phone className="h-3 w-3 text-primary group-hover:scale-110 transition-transform shrink-0" />
              <span>+256 700 897 453</span>
            </a>
            <span className="text-border select-none" aria-hidden="true">•</span>
            <a
              href="tel:+256393252962"
              className="flex items-center gap-1 hover:text-foreground transition-colors group"
              title="Kampala Head Office: +256 393 252 962"
            >
              <Phone className="h-3 w-3 text-primary group-hover:scale-110 transition-transform shrink-0" />
              <span>+256 393 252 962</span>
            </a>
          </div>

          {/* Vertical Divider */}
          <div className="h-3.5 w-px bg-border/70" aria-hidden="true"></div>

          {/* 2 Emails */}
          <div className="flex items-center gap-2 2xl:gap-3 text-[11px] 2xl:text-xs">
            <a
              href="mailto:info@rangeviewtech.com"
              className="flex items-center gap-1 hover:text-foreground transition-colors group"
              title="General Communications: info@rangeviewtech.com"
            >
              <Mail className="h-3 w-3 text-primary group-hover:scale-110 transition-transform shrink-0" />
              <span>info@rangeviewtech.com</span>
            </a>
            <span className="text-border select-none" aria-hidden="true">•</span>
            <a
              href="mailto:sales@rangeviewtech.com"
              className="flex items-center gap-1 hover:text-foreground transition-colors group"
              title="Sales & Enterprise Quotes: sales@rangeviewtech.com"
            >
              <Mail className="h-3 w-3 text-primary group-hover:scale-110 transition-transform shrink-0" />
              <span>sales@rangeviewtech.com</span>
            </a>
          </div>
        </div>

        {/* 10 Solid Social Media Icons */}
        <div className="flex items-center gap-1.5 shrink-0" aria-label="Social media channels">
          <a
            href="https://facebook.com/rangeviewtech"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="Facebook"
            title="Facebook"
          >
            <FacebookSolid className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://instagram.com/rangeviewtech"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="Instagram"
            title="Instagram"
          >
            <InstagramSolid className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://x.com/rangeviewtech"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="X (formerly Twitter)"
            title="X (Twitter)"
          >
            <XSolid className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://tiktok.com/@rangeviewtech"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="TikTok"
            title="TikTok"
          >
            <TikTokSolid className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://wa.me/256783100930"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="WhatsApp"
            title="WhatsApp (+256 783 100 930)"
          >
            <WhatsAppSolid className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://youtube.com/@rangeviewtech"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="YouTube"
            title="YouTube"
          >
            <YouTubeSolid className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://linkedin.com/company/rangeviewtech"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <LinkedInSolid className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://threads.net/@rangeviewtech"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="Threads"
            title="Threads"
          >
            <ThreadsSolid className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://github.com/rangeviewtech"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="GitHub"
            title="GitHub"
          >
            <GitHubSolid className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://t.me/rangeviewtech"
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground hover:scale-110"
            aria-label="Telegram"
            title="Telegram"
          >
            <TelegramSolid className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
