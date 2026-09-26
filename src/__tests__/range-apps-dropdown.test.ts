// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RangeAppsDropdown, RANGE_APPS, WaffleGridIcon } from '@/components/navigation/range-apps-dropdown';

describe('RangeAppsDropdown Component (Google-Style 3-Column App Switcher)', () => {
  it('defines the correct production domains and URLs for all 9 Range View ecosystem apps', () => {
    const expectedApps = [
      { id: 'range-bulk-sms', name: 'Range Bulk SMS', domain: 'www.sms.rangeview.com', isCurrent: true },
      { id: 'range-bulk-ussd', name: 'Range Bulk USSD', domain: 'www.ussd.rangeview.com' },
      { id: 'range-invoices', name: 'Range Invoices', domain: 'www.invoices.rangeview.com' },
      { id: 'range-students', name: 'Range Students', domain: 'www.students.rangeview.com' },
      { id: 'range-market', name: 'Range Market', domain: 'www.market.rangeview.com' },
      { id: 'range-wifi-billing', name: 'Range Wifi Billing', domain: 'www.wifi.rangeview.com' },
      { id: 'range-subscription', name: 'Range Subscription', domain: 'www.subscription.rangeview.com' },
      { id: 'range-gps-tracking', name: 'Range GPS Tracking', domain: 'www.gps.rangeview.com' },
      { id: 'range-pay', name: 'Range Pay', domain: 'www.pay.rangeview.com' },
    ];

    expect(RANGE_APPS.length).toBe(9);

    expectedApps.forEach(({ id, name, domain, isCurrent }) => {
      const app = RANGE_APPS.find((a) => a.id === id);
      expect(app).toBeDefined();
      expect(app?.name).toBe(name);
      expect(app?.domain).toBe(domain);
      if (isCurrent) {
        expect(app?.isCurrentApp).toBe(true);
      } else {
        expect(app?.isExternal).toBe(true);
      }
    });
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

  it('opens the dropdown on click and displays 3 items per row in a 3-column grid matching sample', () => {
    render(React.createElement(RangeAppsDropdown));

    const trigger = document.getElementById('top-nav-range-apps-trigger')!;
    fireEvent.click(trigger);

    // Header
    expect(screen.getByText('Range View Apps')).toBeDefined();
    expect(screen.getByText('Ecosystem')).toBeDefined();

    // Verify 3-column grid container in portaled dropdown
    const gridContainer = document.querySelector('.grid.grid-cols-3');
    expect(gridContainer).not.toBeNull();

    // All 9 app names rendered
    expect(screen.getByText('Range Bulk SMS')).toBeDefined();
    expect(screen.getByText('Range Bulk USSD')).toBeDefined();
    expect(screen.getByText('Range Invoices')).toBeDefined();
    expect(screen.getByText('Range Students')).toBeDefined();
    expect(screen.getByText('Range Market')).toBeDefined();
    expect(screen.getByText('Range Wifi Billing')).toBeDefined();
    expect(screen.getByText('Range Subscription')).toBeDefined();
    expect(screen.getByText('Range GPS Tracking')).toBeDefined();
    expect(screen.getByText('Range Pay')).toBeDefined();

    // Active badge for current app
    expect(screen.getByText('Active')).toBeDefined();

    // Brand Logos
    const smsLogo = screen.getByAltText('Range Bulk SMS Logo') as HTMLImageElement;
    expect(smsLogo).toBeDefined();
    expect(smsLogo.getAttribute('src')).toBe('/images/brand/range-icon-transparent.svg');

    const ussdLogo = screen.getByAltText('Range Bulk USSD Logo') as HTMLImageElement;
    expect(ussdLogo).toBeDefined();
    expect(ussdLogo.getAttribute('src')).toBe('/images/brand/range-ussd-icon.svg');

    const invoicesLogo = screen.getByAltText('Range Invoices Logo') as HTMLImageElement;
    expect(invoicesLogo).toBeDefined();
    expect(invoicesLogo.getAttribute('src')).toBe('/images/brand/range-invoices-icon.svg');

    // Accessible titles and destinations are preserved
    const smsTile = screen.getByTitle('Range Bulk SMS (www.sms.rangeview.com)');
    expect(smsTile).toBeDefined();

    const ussdTile = screen.getByTitle('Range Bulk USSD (www.ussd.rangeview.com)');
    expect(ussdTile).toBeDefined();
    expect(ussdTile.getAttribute('href')).toBe('https://www.ussd.rangeview.com');
    expect(ussdTile.getAttribute('target')).toBe('_blank');

    // Footer link
    const footerLink = screen.getByText('More from Range View').closest('a');
    expect(footerLink).not.toBeNull();
    expect(footerLink?.getAttribute('href')).toBe('https://www.rangeview.com');
    expect(footerLink?.getAttribute('target')).toBe('_blank');
  });
});
