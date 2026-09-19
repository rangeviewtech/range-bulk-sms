import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthLink } from '@/components/ui/auth-link';

describe('AuthLink Component', () => {
  it('renders a Next.js Link when href is provided', () => {
    render(<AuthLink href="/register">Create one</AuthLink>);
    const link = screen.getByRole('link', { name: /create one/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
    expect(link).toHaveClass('auth-link');
    expect(link).toHaveClass('auth-animated-link');
  });

  it('renders a semantic button when onClick is provided without href', () => {
    const handleClick = vi.fn();
    render(<AuthLink onClick={handleClick}>Forgot password?</AuthLink>);
    const button = screen.getByRole('button', { name: /forgot password\?/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('auth-link');
    expect(button).toHaveClass('auth-animated-link');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders a semantic button when href is "#" and onClick is provided', () => {
    const handleClick = vi.fn();
    render(<AuthLink href="#" onClick={handleClick}>Action</AuthLink>);
    const button = screen.getByRole('button', { name: /action/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('auth-link');
    expect(button).toHaveClass('auth-animated-link');
  });

  it('sets secure external link attributes when external is true', () => {
    render(
      <AuthLink href="/terms" external>
        Terms & Conditions
      </AuthLink>
    );
    const link = screen.getByRole('link', { name: /terms & conditions/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('sets secure external link attributes when target="_blank"', () => {
    render(
      <AuthLink href="/privacy" target="_blank">
        Privacy Policy
      </AuthLink>
    );
    const link = screen.getByRole('link', { name: /privacy policy/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('merges custom class names and custom inline styles', () => {
    render(
      <AuthLink href="/login" className="custom-test-class" style={{ fontSize: '14px' }}>
        Sign in
      </AuthLink>
    );
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toHaveClass('auth-link');
    expect(link).toHaveClass('auth-animated-link');
    expect(link).toHaveClass('custom-test-class');
    expect(link).toHaveStyle({ fontSize: '14px' });
  });

  it('supports accessibility attributes like id and aria-label', () => {
    render(
      <AuthLink href="/register" id="custom-link-id" aria-label="Register a new account">
        Create one
      </AuthLink>
    );
    const link = screen.getByRole('link', { name: /register a new account/i });
    expect(link).toHaveAttribute('id', 'custom-link-id');
    expect(link).toHaveAttribute('aria-label', 'Register a new account');
  });
});
