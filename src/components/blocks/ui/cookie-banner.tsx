'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // In a real app, you would check localStorage or cookies to see if already accepted
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="w-[calc(100vw-2rem)] sm:w-[400px] bg-card p-6 rounded-xl border shadow-lg relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-4">
          <div className="hidden sm:flex mt-1">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold tracking-tight text-lg flex items-center gap-2">
                <Cookie className="w-5 h-5 text-primary sm:hidden" />
                We value your privacy
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={() => setIsVisible(false)} className="sm:w-full">
                Accept All
              </Button>
              <Button onClick={() => setIsVisible(false)} variant="outline" className="sm:w-full">
                Reject All
              </Button>
            </div>
            <div className="text-xs text-center sm:text-left">
              <Link href="/" className="text-muted-foreground hover:text-foreground underline">
                Manage Preferences
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
