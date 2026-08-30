'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appAssets } from '@/config/assets';
import { appConfig } from '@/config/app';

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const languages = [
  { code: 'EN', name: 'English', flag: 'gb' },
  { code: 'DE', name: 'German', flag: 'de' },
  { code: 'ES', name: 'Spanish', flag: 'es' },
  { code: 'AE', name: 'Arabic', flag: 'sa' },
  { code: 'FR', name: 'French', flag: 'fr' },
  { code: 'FA', name: 'Persian', flag: 'ir' },
  { code: 'SQ', name: 'Albanian', flag: 'al' },
  { code: 'TH', name: 'Thai', flag: 'th' },
  { code: 'HE', name: 'Hebrew', flag: 'il' },
  { code: 'RU', name: 'Russian', flag: 'ru' },
  { code: 'PT', name: 'Portuguese', flag: 'pt' },
  { code: 'JA', name: 'Japanese', flag: 'jp' },
  { code: 'KO', name: 'Korean', flag: 'kr' },
  { code: 'ZH', name: 'Chinese', flag: 'cn' },
  { code: 'MN', name: 'Mongolian', flag: 'mn' },
  { code: 'NE', name: 'Nepali', flag: 'np' },
  { code: 'HI', name: 'Hindi', flag: 'in' },
  { code: 'IT', name: 'Italian', flag: 'it' },
  { code: 'MY', name: 'Burmese', flag: 'mm' },
  { code: 'TR', name: 'Turkish', flag: 'tr' },
  { code: 'SR', name: 'Serbian', flag: 'rs' },
  { code: 'HU', name: 'Hungarian', flag: 'hu' },
  { code: 'PL', name: 'Polish', flag: 'pl' },
  { code: 'DU', name: 'Dutch', flag: 'nl' },
  { code: 'TE', name: 'Telugu', flag: 'in' },
  { code: 'KM', name: 'Cambodian', flag: 'kh' },
  { code: 'IN', name: 'Indonesian', flag: 'id' },
  { code: 'GJ', name: 'Gujarati', flag: 'in' },
  { code: 'BN', name: 'Bengali', flag: 'bd' },
  { code: 'MR', name: 'Marathi', flag: 'in' },
  { code: 'KN', name: 'Kannada', flag: 'in' },
  { code: 'EL', name: 'Greek', flag: 'gr' },
  { code: 'BR', name: 'Portuguese Brazil', flag: 'br' },
  { code: 'CZ', name: 'Czech', flag: 'cz' },
  { code: 'MS', name: 'Malay', flag: 'my' },
  { code: 'TA', name: 'Tamil', flag: 'in' },
  { code: 'ML', name: 'Malayalam', flag: 'in' },
  { code: 'UR', name: 'Urdu', flag: 'pk' },
  { code: 'BS', name: 'Bosnian', flag: 'ba' },
  { code: 'HR', name: 'Croatian', flag: 'hr' },
  { code: 'GR', name: 'Greek Athens', flag: 'gr' },
  { code: 'AO', name: 'Portuguese AO', flag: 'ao' },
  { code: 'KU', name: 'Kurdish', flag: 'iq' },
  { code: 'AM', name: 'Amharic', flag: 'et' },
  { code: 'OM', name: 'Oromo', flag: 'et' },
  { code: 'TI', name: 'Tigrinya', flag: 'er' },
  { code: 'PA', name: 'Punjabi', flag: 'in' },
  { code: 'ET', name: 'Estonian', flag: 'ee' },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('Default Language');
  const [selectedFlag, setSelectedFlag] = useState<string | undefined>(undefined);

  const slides = appAssets.slides;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const filteredLanguages = languages.filter(l => l.name.toLowerCase().includes(langSearch.toLowerCase()));

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
        {langOpen && (
          <div
            id="dropdown-overlay"
            onClick={() => setLangOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'transparent' }}
          />
        )}
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
          <div style={{ position: 'relative' }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full transition-transform active:scale-95"
              onClick={() => setLangOpen(!langOpen)}
              aria-label="Select language"
            >
              {selectedFlag ? (
                <img
                  src={`https://flagcdn.com/20x15/${selectedFlag}.png`}
                  id="def-lang"
                  alt={selectedLang}
                  style={{
                    width: '18px',
                    height: '13px',
                    borderRadius: '1px',
                    objectFit: 'cover',
                    boxShadow: '0 0 1px rgba(0,0,0,0.3)',
                  }}
                />
              ) : (
                <Globe className="h-[1.2rem] w-[1.2rem] text-foreground" />
              )}
            </Button>

            {langOpen && (
              <div
                className="dropdown-content show"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 'auto',
                  backgroundColor: 'hsl(var(--card))',
                  minWidth: '230px',
                  border: '1px solid hsl(var(--border))',
                  zIndex: 40,
                  maxHeight: '260px',
                  overflow: 'auto',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  borderRadius: '6px',
                  marginTop: '4px',
                }}
              >
                <div style={{ position: 'sticky', top: 0, backgroundColor: 'hsl(var(--card))', zIndex: 2 }}>
                  <Search size={14} style={{ position: 'absolute', left: '9px', top: '8px', color: 'hsl(var(--muted-foreground))' }} />
                  <input
                    type="text"
                    placeholder="Search language..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    autoFocus
                    style={{
                      boxSizing: 'border-box',
                      fontSize: '13px',
                      padding: '5px 5px 5px 30px',
                      border: 'none',
                      borderBottom: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      width: '100%',
                      outline: 'none',
                      backgroundColor: 'hsl(var(--card))',
                      fontFamily: FONT_STACK,
                    }}
                  />
                </div>
                {filteredLanguages.map((l) => (
                  <a
                    key={l.code}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedLang(l.name);
                      setSelectedFlag(l.flag);
                      setLangOpen(false);
                    }}
                    style={{
                      color: selectedLang === l.name ? '#29A4FF' : 'hsl(var(--foreground))',
                      padding: '6px 10px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      borderBottom: '1px solid hsl(var(--border) / 0.5)',
                      fontFamily: FONT_STACK,
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'hsl(var(--accent))')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {l.flag ? (
                      <img 
                        src={`https://flagcdn.com/20x15/${l.flag}.png`} 
                        alt={l.name} 
                        style={{ width: '18px', height: '14px', borderRadius: '1px', objectFit: 'cover', flexShrink: 0, boxShadow: '0 0 1px rgba(0,0,0,0.3)' }} 
                      />
                    ) : (
                      <Globe size={14} style={{ flexShrink: 0, opacity: 0.7, color: 'hsl(var(--foreground))' }} />
                    )}
                    <span>{l.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
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
              Get Mobile & Desktop App
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
              <a href="https://play.google.com/store/apps/details?id=com.uffizio.trakzee&hl=en_IN" target="_blank" rel="noreferrer" title="Google Play Store" className="auth-store-badge" style={{ flex: 1, textDecoration: 'none' }}>
                <img src={appAssets.storeBadges.googlePlay} alt="Google Play Store" style={{ width: '100%', height: '30px', objectFit: 'contain' }} />
              </a>
              <a href="https://apps.apple.com/in/app/trakzee/id1396516275" target="_blank" rel="noreferrer" title="Apple App Store" className="auth-store-badge" style={{ flex: 1, textDecoration: 'none' }}>
                <img src={appAssets.storeBadges.appStore} alt="Apple App Store" style={{ width: '100%', height: '30px', objectFit: 'contain' }} />
              </a>
              <a href="https://apps.microsoft.com/store" target="_blank" rel="noreferrer" title="Microsoft Store" className="auth-store-badge" style={{ flex: 1, textDecoration: 'none' }}>
                <img src={appAssets.storeBadges.microsoftStore} alt="Microsoft Store" style={{ width: '100%', height: '30px', objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

