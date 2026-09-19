'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BaseAuthLinkProps {
  external?: boolean;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  id?: string;
  'aria-label'?: string;
}

export type AuthLinkAnchorProps = BaseAuthLinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'children'> & {
    href: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  };

export type AuthLinkButtonProps = BaseAuthLinkProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'> & {
    href?: undefined | '#';
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };

export type AuthLinkProps = AuthLinkAnchorProps | AuthLinkButtonProps;

/**
 * AuthLink provides a unified, accessible link component for authentication screens.
 * Features:
 * - Center-outward expanding underline animation on hover and focus-visible.
 * - Center-inward contracting animation on unhover/blur.
 * - Automatically renders Next.js `<Link>` for navigation routes.
 * - Automatically renders semantic `<button type="button">` for in-page action triggers.
 * - Full accessibility with :focus-visible outlines, reduced motion support, and high contrast mode.
 */
export function AuthLink(props: AuthLinkProps) {
  const { className, children, style, id } = props;
  const mergedClassName = cn('auth-link auth-animated-link', className);

  if (!props.href || props.href === '#') {
    const { onClick, external: _ext, className: _c, children: _ch, style: _st, id: _id, ...buttonProps } = props as AuthLinkButtonProps;
    return (
      <button
        type="button"
        id={id}
        onClick={onClick}
        className={mergedClassName}
        style={style}
        {...buttonProps}
      >
        {children}
      </button>
    );
  }

  const { href, onClick, external, target, rel, className: _c, children: _ch, style: _st, id: _id, ...anchorProps } = props as AuthLinkAnchorProps;
  const isExternal = external || target === '_blank';
  const computedRel = isExternal ? rel || 'noopener noreferrer' : rel;
  const computedTarget = isExternal ? target || '_blank' : target;

  return (
    <Link
      href={href}
      id={id}
      onClick={onClick}
      target={computedTarget}
      rel={computedRel}
      className={mergedClassName}
      style={style}
      {...anchorProps}
    >
      {children}
    </Link>
  );
}
