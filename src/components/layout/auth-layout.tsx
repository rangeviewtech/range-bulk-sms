/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { LanguageToggle } from "@/components/navigation/language-toggle";
import { useLanguage } from "@/hooks/use-language";
import { appAssets } from '@/config/assets';
import { appConfig } from '@/config/app';
import { AuthLink } from '@/components/ui/auth-link';

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
      className="relative min-h-screen w-full bg-white overflow-hidden"
      style={{ fontFamily: FONT_STACK, fontSize: '13px', color: 'hsl(var(--foreground))' }}
    >
      {/* Background Carousel */}
      <div 
        id="img-holder"
        className="select-none pointer-events-none right-0 sm:right-[340px] bg-slate-950"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {slides.map((src, index) => {
          const isActive = index === currentImageIndex;
          return (
            <React.Fragment key={src}>
              {/* Ambient Blurred Backdrop */}
              <img
                src={src}
                alt=""
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-5%',
                  left: '-5%',
                  width: '110%',
                  height: '110%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  filter: 'blur(32px) brightness(0.6)',
                  transform: 'scale(1.12)',
                  opacity: isActive ? 0.8 : 0,
                  transition: 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: isActive ? 1 : 0,
                }}
              />
              {/* Razor-sharp Foreground Hero Slide */}
              <img
                src={src}
                alt={`Background Slide ${index + 1}`}
                className="auth-carousel-slide"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  minHeight: '100%',
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: isActive ? 3 : 2,
                }}
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Main Container */}
      <div
        className="form-main-container auth-fade-in select-text w-full sm:w-[340px]"
        style={{
          position: 'fixed',
          maxWidth: '100%',
          height: '100dvh',
          right: '0px',
          top: '0px',
          left: 'auto',
          backgroundColor: 'hsl(var(--card))',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 24px',
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

        {/* Content Wrapper (Safe vertical layout with no top-clipping on short screens) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', margin: 'auto 0', paddingTop: '16px', paddingBottom: '16px', boxSizing: 'border-box' }}>
          {/* Brand Logo */}
          <div className="auth-stagger-1">
            <img
              src={appAssets.logo}
              alt={`${appConfig.name} logo`}
              className="logo-container theme-logo-light"
              style={{
                margin: '0 auto 20px',
                width: '260px',
                maxWidth: '90%',
                height: 'auto',
                maxHeight: '76px',
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
                width: '260px',
                maxWidth: '90%',
                height: 'auto',
                maxHeight: '76px',
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

          <div className="application-container auth-stagger-5" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
            {/* Legal Links Footer */}
            <div style={{ marginTop: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flexWrap: 'wrap', width: '100%' }}>
              <AuthLink
                href="/terms"
                external
                style={{
                  fontSize: '10.5px',
                  fontFamily: FONT_STACK,
                  whiteSpace: 'nowrap',
                }}
              >
                {dict.legal?.termsAndConditions || 'Terms & Conditions'}
              </AuthLink>
              <span aria-hidden="true" style={{ fontSize: '10px', color: 'var(--brand-link)', opacity: 0.5 }}>&bull;</span>
              <AuthLink
                href="/privacy"
                external
                style={{
                  fontSize: '10.5px',
                  fontFamily: FONT_STACK,
                  whiteSpace: 'nowrap',
                }}
              >
                {dict.legal?.privacyPolicy || 'Privacy Policy'}
              </AuthLink>
              <span aria-hidden="true" style={{ fontSize: '10px', color: 'var(--brand-link)', opacity: 0.5 }}>&bull;</span>
              <AuthLink
                href="/cookies"
                external
                style={{
                  fontSize: '10.5px',
                  fontFamily: FONT_STACK,
                  whiteSpace: 'nowrap',
                }}
              >
                {dict.legal?.cookiePolicy || 'Cookie Policy'}
              </AuthLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

