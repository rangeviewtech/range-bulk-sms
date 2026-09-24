'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getVariableColorTheme } from '@/components/sms/variable-textarea';
import { getAllVariablesList, getSampleValueForVariable } from '@/lib/sms/custom-variables';

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
   * - 'badge': Multi-color variable theme matching the editor (default)
   * - 'on-primary': Contrast styling for rendering on brand yellow (bg-primary) surfaces
   * - 'subtle': Subtle text highlight with light border
   * - 'plain': Clean inline text with subtle dotted underline for realistic SMS simulator
   */
  variant?: 'badge' | 'on-primary' | 'subtle' | 'plain';
  /**
   * Whether the container should render as block or inline
   */
  as?: 'span' | 'div' | 'p';
  /**
   * Whether to resolve and display the sample preview value instead of the {{variable}} tag
   */
  resolveSampleValues?: boolean;
  /**
   * Optional custom dictionary of variable replacements (e.g. from a spreadsheet row)
   */
  customValues?: Record<string, string>;
}

const VARIABLE_REGEX = /(\{\{[a-zA-Z0-9_\s-]+\}\})/g;

export function TemplateHighlighter({
  text,
  variableClassName,
  variant = 'badge',
  as = 'span',
  resolveSampleValues = false,
  customValues,
  className,
  ...props
}: TemplateHighlighterProps) {
  if (!text) return null;

  const parts = text.split(VARIABLE_REGEX);
  
  const allVars = resolveSampleValues ? getAllVariablesList() : [];

  const getVariantClasses = (varName: string) => {
    switch (variant) {
      case 'on-primary':
        // High-contrast dark badge designed specifically for brand yellow (bg-primary) bubbles
        return 'text-slate-950 bg-black/10 border-black/25 hover:bg-black/15 shadow-2xs';
      case 'subtle':
        return 'text-amber-800 dark:text-primary/90 bg-amber-500/10 dark:bg-primary/10 border-amber-500/20 dark:border-primary/20';
      case 'plain':
        return 'text-foreground underline decoration-dotted decoration-foreground/35 underline-offset-2';
      case 'badge':
      default:
        // Distinct, vibrant color specific to this variable token
        return getVariableColorTheme(varName).badgeClass;
    }
  };

  const content = parts.map((part, index) => {
    const isVariable = part.startsWith('{{') && part.endsWith('}}');

    if (isVariable) {
      const varName = part.slice(2, -2).trim();
      let displayValue = part;

      if (customValues && customValues[varName] !== undefined) {
        displayValue = customValues[varName] || `[Empty ${varName}]`;
      } else if (resolveSampleValues) {
        displayValue = getSampleValueForVariable(varName, allVars);
      }

      if (variant === 'plain') {
        return (
          <span
            key={`var-${index}`}
            className={cn(
              'font-medium text-foreground underline decoration-dotted decoration-foreground/40 underline-offset-2',
              variableClassName
            )}
            title={resolveSampleValues ? `Sample value for {{${varName}}}` : `Variable tag: {{${varName}}}`}
            data-variable={varName}
          >
            {displayValue}
          </span>
        );
      }

      return (
        <span
          key={`var-${index}`}
          className={cn(
            'inline-flex items-center align-baseline font-medium text-[0.9em] px-1.5 py-0.5 mx-0.5 rounded border transition-colors select-all cursor-default shadow-2xs',
            getVariantClasses(varName),
            variableClassName
          )}
          title={resolveSampleValues ? `Sample value for {{${varName}}}` : `Variable tag: {{${varName}}}`}
          data-variable={varName}
        >
          {displayValue}
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
