// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LanguageToggle } from '@/components/navigation/language-toggle';

// Mock useLanguage hook
vi.mock('@/hooks/use-language', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    currentLanguageMeta: {
      code: 'en',
      name: 'English',
      flag: 'gb',
      direction: 'ltr',
    },
    dict: {
      common: {
        searchPlaceholder: 'Search language...',
      },
    },
  }),
}));

afterEach(() => {
  cleanup();
});

describe('LanguageToggle Component', () => {
  it('renders trigger button with flag and accessible aria-label', () => {
    render(React.createElement(LanguageToggle));

    const trigger = document.getElementById('top-nav-language-toggle-trigger');
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-label')).toBe('Select language');
    expect(trigger?.getAttribute('title')).toBe('Select language');

    const flagImg = screen.getByAltText('English') as HTMLImageElement;
    expect(flagImg).toBeDefined();
    expect(flagImg.getAttribute('src')).toContain('gb.png');
  });

  it('renders dropdown content and allows searching languages', () => {
    render(React.createElement(LanguageToggle));

    const trigger = document.getElementById('top-nav-language-toggle-trigger')!;
    fireEvent.click(trigger);

    // Search input exists
    const searchInput = screen.getByPlaceholderText('Search language...') as HTMLInputElement;
    expect(searchInput).toBeDefined();

    // English item is present
    expect(screen.getByText('English')).toBeDefined();
  }, 15000);
});
