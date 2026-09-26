// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { NotFoundContent } from '@/components/feedback/not-found-content';
import ErrorPage from '@/app/error';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/non-existent-route',
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    resolvedTheme: 'dark',
    setTheme: vi.fn(),
  }),
}));

describe('Error & 404 Pages UI/UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('404 Page (NotFoundContent)', () => {
    it('renders the 404 status badge, heading, and clear user-facing explanation', () => {
      render(React.createElement(NotFoundContent));

      expect(screen.getByText(/HTTP 404 • ROUTE NOT FOUND/i)).toBeTruthy();
      expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeTruthy();
      expect(
        screen.getByText(/The requested address could not be located/i)
      ).toBeTruthy();
    });

    it('renders primary CTA to go back home pointing to /dashboard', () => {
      render(React.createElement(NotFoundContent));

      const homeLink = screen.getByRole('link', { name: /Go Back Home/i });
      expect(homeLink).toBeTruthy();
      expect(homeLink.getAttribute('href')).toBe('/dashboard');
    });

    it('renders secondary CTA to contact support pointing to /support', () => {
      render(React.createElement(NotFoundContent));

      const supportLinks = screen.getAllByRole('link', { name: /Contact Support|Support Center/i });
      expect(supportLinks.length).toBeGreaterThan(0);
      const contactSupportLink = supportLinks.find(
        (el) => el.textContent?.includes('Contact Support')
      );
      expect(contactSupportLink).toBeDefined();
      expect(contactSupportLink?.getAttribute('href')).toBe('/support');
    });

    it('renders return to previous page action button', () => {
      render(React.createElement(NotFoundContent));

      const backBtn = screen.getByRole('button', { name: /Return to Previous Page/i });
      expect(backBtn).toBeTruthy();
    });

    it('renders helpful platform destination quick shortcuts', () => {
      render(React.createElement(NotFoundContent));

      expect(screen.getByText(/Send Broadcast/i)).toBeTruthy();
      expect(screen.getByText(/Scheduled SMS/i)).toBeTruthy();
      expect(screen.getByText(/Delivery Reports/i)).toBeTruthy();
      expect(screen.getByText(/Help & Support/i)).toBeTruthy();
    });

    it('renders the language switcher toggle in the header', () => {
      render(React.createElement(NotFoundContent));

      const langTrigger = screen.getByRole('button', { name: /Select language/i });
      expect(langTrigger).toBeTruthy();
    });
  });

  describe('500 Error Page (ErrorPage)', () => {
    it('renders error title, explanation, and action buttons', () => {
      const resetMock = vi.fn();
      const testError = new Error('Database connection failed') as Error & {
        digest?: string;
        statusCode?: number;
      };
      testError.statusCode = 500;
      testError.digest = 'ERR_TEST_123';

      render(React.createElement(ErrorPage, { error: testError, reset: resetMock }));

      expect(screen.getByRole('heading', { name: /Something Went Wrong/i })).toBeTruthy();
      expect(screen.getByText(/Database connection failed/i)).toBeTruthy();

      const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
      expect(tryAgainBtn).toBeTruthy();
      fireEvent.click(tryAgainBtn);
      expect(resetMock).toHaveBeenCalledTimes(1);

      const homeLink = screen.getByRole('link', { name: /Go Back Home/i });
      expect(homeLink.getAttribute('href')).toBe('/dashboard');

      const supportLink = screen.getByRole('link', { name: /Contact Support/i });
      expect(supportLink.getAttribute('href')).toBe('/support');
    });

    it('toggles technical diagnostic telemetry details on demand', () => {
      const resetMock = vi.fn();
      const testError = new Error('Query timeout') as Error & {
        digest?: string;
      };
      testError.digest = 'DIGEST_XYZ';

      render(React.createElement(ErrorPage, { error: testError, reset: resetMock }));

      const telemetryToggle = screen.getByRole('button', {
        name: /Technical Diagnostics & Telemetry/i,
      });
      expect(telemetryToggle).toBeTruthy();

      // Diagnostics should display digest reference
      expect(screen.getByText(/DIGEST_X/i)).toBeTruthy();
    });

    it('renders the language switcher toggle in the header', () => {
      render(
        React.createElement(ErrorPage, {
          error: new Error('Critical server error') as Error & { digest?: string },
          reset: vi.fn(),
        })
      );

      const langTrigger = screen.getByRole('button', { name: /Select language/i });
      expect(langTrigger).toBeTruthy();
    });
  });
});
