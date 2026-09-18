/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
        className="form-main-container auth-fade-in w-full sm:w-[340px]"
        style={{
          position: 'fixed',
          maxWidth: '100%',
          height: '100vh',
          right: '0px',
          top: '0px',
          left: 'auto',
          margin: 'auto',
          backgroundColor: 'hsl(var(--card))',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 24px',
          boxSizing: 'border-box',
          zIndex: 20,
          boxShadow: '0 0 30px rgba(0,0,0,0.14)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
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

        {/* Centered Wrapper for Logo and Form (Safe scroll-centering with margin: auto 0) */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', margin: 'auto 0', paddingTop: '24px', paddingBottom: '36px', boxSizing: 'border-box' }}>
          {/* Brand Logo */}
          <div className="auth-stagger-1">
            <img
              src={appAssets.logo}
              alt={`${appConfig.name} logo`}
              className="logo-container theme-logo-light"
              style={{
                margin: '0 auto 24px',
                width: '275px',
                maxWidth: '92%',
                height: 'auto',
                maxHeight: '88px',
                objectFit: 'contain',
                transition: 'transform 0.3s ease',
              }}
            />
            <img
              src={appAssets.logoLight}
              alt={`${appConfig.name} logo`}
              className="logo-container theme-logo-dark"
              style={{
                margin: '0 auto 24px',
                width: '275px',
                maxWidth: '92%',
                height: 'auto',
                maxHeight: '88px',
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

          <div className="application-container auth-stagger-5" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
            {/* Legal Links Footer */}
            <div style={{ marginTop: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flexWrap: 'wrap', width: '100%' }}>
              <Link
                href="/terms"
                target="_blank"
                className="auth-link"
                style={{
                  fontSize: '10.5px',
                  color: 'var(--brand-link)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontFamily: FONT_STACK,
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {dict.legal?.termsAndConditions || 'Terms & Conditions'}
              </Link>
              <span aria-hidden="true" style={{ fontSize: '10px', color: 'var(--brand-link)', opacity: 0.5 }}>&bull;</span>
              <Link
                href="/privacy"
                target="_blank"
                className="auth-link"
                style={{
                  fontSize: '10.5px',
                  color: 'var(--brand-link)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontFamily: FONT_STACK,
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {dict.legal?.privacyPolicy || 'Privacy Policy'}
              </Link>
              <span aria-hidden="true" style={{ fontSize: '10px', color: 'var(--brand-link)', opacity: 0.5 }}>&bull;</span>
              <Link
                href="/cookies"
                target="_blank"
                className="auth-link"
                style={{
                  fontSize: '10.5px',
                  color: 'var(--brand-link)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontFamily: FONT_STACK,
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {dict.legal?.cookiePolicy || 'Cookie Policy'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

