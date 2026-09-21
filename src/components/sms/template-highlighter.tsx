'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TemplateHighlighterProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The template string containing plain text and {{variable}} tags
   * e.g. "Dear {{customer}}, package #{{trackingNumber}} is out for delivery with driver {{driverName}}."
   */
  text: string;
  /**
   * Optional custom styling for the variable badges
   */
  variableClassName?: string;
  /**
   * Optional variant for variable appearance
   * - 'badge': High-contrast brand badge (default)
   * - 'on-primary': Contrast styling for rendering on brand yellow (bg-primary) surfaces
   * - 'subtle': Subtle text highlight with light border
   */
  variant?: 'badge' | 'on-primary' | 'subtle';
  /**
   * Whether the container should render as block or inline
   */
  as?: 'span' | 'div' | 'p';
}

const VARIABLE_REGEX = /(\{\{[a-zA-Z0-9_\s-]+\}\})/g;

export function TemplateHighlighter({
  text,
  variableClassName,
  variant = 'badge',
  as = 'span',
  className,
  ...props
}: TemplateHighlighterProps) {
  if (!text) return null;

  const parts = text.split(VARIABLE_REGEX);

  const getVariantClasses = () => {
    switch (variant) {
      case 'on-primary':
        // High-contrast dark badge designed specifically for brand yellow (bg-primary) bubbles
        return 'text-slate-950 bg-black/10 border-black/25 hover:bg-black/15 shadow-2xs';
      case 'subtle':
        return 'text-amber-800 dark:text-primary/90 bg-amber-500/10 dark:bg-primary/10 border-amber-500/20 dark:border-primary/20';
      case 'badge':
      default:
        // Rich amber in light mode, brand yellow in dark mode
        return 'text-amber-900 bg-amber-500/15 border-amber-500/30 hover:bg-amber-500/25 dark:text-primary dark:bg-primary/15 dark:border-primary/30 dark:hover:bg-primary/25 shadow-2xs';
    }
  };

  const content = parts.map((part, index) => {
    const isVariable = part.startsWith('{{') && part.endsWith('}}');

    if (isVariable) {
      const varName = part.slice(2, -2).trim();
      return (
        <span
          key={`var-${index}`}
          className={cn(
            'inline-flex items-center align-baseline font-mono font-semibold text-[0.88em] px-1.5 py-0.5 mx-0.5 rounded border transition-colors select-all cursor-default',
            getVariantClasses(),
            variableClassName
          )}
          title={`Variable tag: {{${varName}}}`}
          data-variable={varName}
        >
          {part}
        </span>
      );
    }

    return (
      <span key={`text-${index}`}>
        {part}
      </span>
    );
  });

  const Component = as;
  return (
    <Component
      className={cn('whitespace-pre-wrap leading-relaxed', className)}
      {...props}
    >
      {content}
    </Component>
  );
}
