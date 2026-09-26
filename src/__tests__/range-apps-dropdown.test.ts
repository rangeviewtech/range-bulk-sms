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

  it('opens the dropdown on click and displays both apps with production domains and footer link', () => {
    render(React.createElement(RangeAppsDropdown));

    const trigger = document.getElementById('top-nav-range-apps-trigger')!;
    fireEvent.click(trigger);

    // Header
    expect(screen.getByText('Range View Apps')).toBeDefined();
    expect(screen.getByText('Ecosystem')).toBeDefined();

    // App Names
    expect(screen.getByText('Range Bulk SMS')).toBeDefined();
    expect(screen.getByText('Range Bulk USSD')).toBeDefined();

    // App Domains
    expect(screen.getByText('www.sms.rangeview.com')).toBeDefined();
    expect(screen.getByText('www.ussd.rangeview.com')).toBeDefined();

    // Active pill for current app
    expect(screen.getByText('Active')).toBeDefined();

    // Footer link
    const footerLink = screen.getByText('More from Range View').closest('a');
    expect(footerLink).not.toBeNull();
    expect(footerLink?.getAttribute('href')).toBe('https://www.rangeview.com');
    expect(footerLink?.getAttribute('target')).toBe('_blank');
  });
});
