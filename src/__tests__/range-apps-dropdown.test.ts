// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RangeAppsDropdown, RANGE_APPS, WaffleGridIcon } from '@/components/navigation/range-apps-dropdown';

describe('RangeAppsDropdown Component (Google-Style App Switcher)', () => {
  it('defines the correct production domains and URLs for Range View ecosystem apps', () => {
    const smsApp = RANGE_APPS.find((app) => app.id === 'range-bulk-sms');
    expect(smsApp).toBeDefined();
    expect(smsApp?.name).toBe('Range Bulk SMS');
    expect(smsApp?.domain).toBe('www.sms.rangeview.com');
    expect(smsApp?.url).toBe('https://www.sms.rangeview.com');
    expect(smsApp?.isCurrentApp).toBe(true);

    const ussdApp = RANGE_APPS.find((app) => app.id === 'range-bulk-ussd');
    expect(ussdApp).toBeDefined();
    expect(ussdApp?.name).toBe('Range Bulk USSD');
    expect(ussdApp?.domain).toBe('www.ussd.rangeview.com');
    expect(ussdApp?.url).toBe('https://www.ussd.rangeview.com');
    expect(ussdApp?.isExternal).toBe(true);

    // Verify official brand logo asset paths
    expect(smsApp?.logoSrc).toBe('/images/brand/range-icon-transparent.svg');
    expect(ussdApp?.logoSrc).toBe('/images/brand/range-ussd-icon.svg');
  });

  it('renders the 9-dot WaffleGridIcon with 9 circular dots', () => {
    const { container } = render(React.createElement(WaffleGridIcon));
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(9);
  });

  it('renders the trigger button with proper aria-label and title matching Google apps design', () => {
    render(React.createElement(RangeAppsDropdown));

    const trigger = document.getElementById('top-nav-range-apps-trigger');
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-label')).toBe('Range View apps');
    expect(trigger?.getAttribute('title')).toBe('Range View apps');
  });

  it('opens the dropdown on click and displays both apps with actual logos without exposing URLs on tile faces', () => {
    render(React.createElement(RangeAppsDropdown));

    const trigger = document.getElementById('top-nav-range-apps-trigger')!;
    fireEvent.click(trigger);

    // Header
    expect(screen.getByText('Range View Apps')).toBeDefined();
    expect(screen.getByText('Ecosystem')).toBeDefined();

    // Actual Brand Logos
    const smsLogo = screen.getByAltText('Range Bulk SMS Logo') as HTMLImageElement;
    expect(smsLogo).toBeDefined();
    expect(smsLogo.getAttribute('src')).toBe('/images/brand/range-icon-transparent.svg');

    const ussdLogo = screen.getByAltText('Range Bulk USSD Logo') as HTMLImageElement;
    expect(ussdLogo).toBeDefined();
    expect(ussdLogo.getAttribute('src')).toBe('/images/brand/range-ussd-icon.svg');

    // App Names
    expect(screen.getByText('Range Bulk SMS')).toBeDefined();
    expect(screen.getByText('Range Bulk USSD')).toBeDefined();

    // App category descriptions
    expect(screen.getByText('A2P & OTP Messaging')).toBeDefined();
    expect(screen.getByText('GSM Interactive Menus')).toBeDefined();

    // Explicitly verify URLs are NOT displayed on the face of the tiles
    expect(screen.queryByText('www.sms.rangeview.com')).toBeNull();
    expect(screen.queryByText('www.ussd.rangeview.com')).toBeNull();

    // Accessible titles and destinations are preserved
    const smsTile = screen.getByTitle('Range Bulk SMS (www.sms.rangeview.com)');
    expect(smsTile).toBeDefined();

    const ussdTile = screen.getByTitle('Range Bulk USSD (www.ussd.rangeview.com)');
    expect(ussdTile).toBeDefined();
    expect(ussdTile.getAttribute('href')).toBe('https://www.ussd.rangeview.com');
    expect(ussdTile.getAttribute('target')).toBe('_blank');

    // Active pill for current app
    expect(screen.getByText('Active')).toBeDefined();

    // Footer link
    const footerLink = screen.getByText('More from Range View').closest('a');
    expect(footerLink).not.toBeNull();
    expect(footerLink?.getAttribute('href')).toBe('https://www.rangeview.com');
    expect(footerLink?.getAttribute('target')).toBe('_blank');
  });
});
