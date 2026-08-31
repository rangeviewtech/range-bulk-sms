'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { LanguageToggle } from "@/components/navigation/language-toggle";
import { useLanguage } from "@/hooks/use-language";
import { appAssets } from '@/config/assets';
import { appConfig } from '@/config/app';

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { dict } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const slides = appAssets.slides;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div
      className="relative min-h-screen w-full bg-white overflow-hidden select-none"
      style={{ fontFamily: FONT_STACK, fontSize: '13px', color: 'hsl(var(--foreground))' }}
    >
      {/* Background Carousel */}
      <div 
        id="img-holder"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {slides.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`Background Slide ${index + 1}`}
            className="auth-carousel-slide"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
              opacity: index === currentImageIndex ? 1 : 0,
              zIndex: index === currentImageIndex ? 2 : 1,
            }}
          />
        ))}
      </div>

      {/* Form Main Container */}
      <div
        className="form-main-container auth-fade-in"
        style={{
          position: 'fixed',
          width: '340px',
          height: '100vh',
          right: '0px',
          top: '0px',
          left: 'auto',
          margin: 'auto',
          backgroundColor: 'hsl(var(--card))',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px',
          zIndex: 20,
          boxShadow: '0 0 30px rgba(0,0,0,0.14)',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'background-color 0.3s ease',
        }}
      >
        {/* Theme & Language Icons */}
        <div
          className="auth-stagger-1"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ThemeToggle />
          <LanguageToggle />
        </div>

        {/* Centered Wrapper for Logo and Form */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          {/* Brand Logo */}
          <div className="auth-stagger-1">
            <img
              src={appAssets.logo}
              alt={`${appConfig.name} logo`}
              className="logo-container theme-logo-light"
              style={{
                margin: '0 auto 20px',
                width: '180px',
                height: '75px',
                objectFit: 'contain',
                transition: 'transform 0.3s ease',
              }}
            />
            <img
              src={appAssets.logoLight}
              alt={`${appConfig.name} logo`}
              className="logo-container theme-logo-dark"
              style={{
                margin: '0 auto 20px',
                width: '180px',
                height: '75px',
                objectFit: 'contain',
                transition: 'transform 0.3s ease',
              }}
            />
          </div>

          {/* Content Container */}
          <div
            className="main-container auth-stagger-2"
            style={{
              width: '100%',
              backgroundColor: 'hsl(var(--card))',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </div>

          {/* App Store Links */}
          <div className="application-container auth-stagger-5" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: FONT_STACK }}>
              {dict.common.getMobileApp || 'GET MOBILE & DESKTOP APP'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', direction: 'ltr' }}>
              <a href="https://play.google.com/store/apps/details?id=com.uffizio.trakzee&hl=en_IN" target="_blank" rel="noreferrer" title={dict.common.googlePlay || "Google Play Store"} className="auth-store-badge" style={{ flex: 1, textDecoration: 'none' }}>
                <img src={appAssets.storeBadges.googlePlay} alt="Google Play Store" style={{ width: '100%', height: '30px', objectFit: 'contain' }} />
              </a>
              <a href="https://apps.apple.com/in/app/trakzee/id1396516275" target="_blank" rel="noreferrer" title={dict.common.appStore || "Apple App Store"} className="auth-store-badge" style={{ flex: 1, textDecoration: 'none' }}>
                <img src={appAssets.storeBadges.appStore} alt="Apple App Store" style={{ width: '100%', height: '30px', objectFit: 'contain' }} />
              </a>
              <a href="https://apps.microsoft.com/store" target="_blank" rel="noreferrer" title={dict.common.microsoftStore || "Microsoft Store"} className="auth-store-badge" style={{ flex: 1, textDecoration: 'none' }}>
                <img src={appAssets.storeBadges.microsoftStore} alt="Microsoft Store" style={{ width: '100%', height: '30px', objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

