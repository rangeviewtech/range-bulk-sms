'use client';

import React, { useEffect } from 'react';

export function RippleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Find closest interactive button / badge
      const target = (e.target as HTMLElement)?.closest(
        'button, .btn, [role="button"], .auth-btn-primary, .auth-btn-secondary, .auth-social-btn, .auth-store-badge'
      ) as HTMLElement | null;

      if (!target || target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
        return;
      }

      const rect = target.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height) * 2;
      const radius = diameter / 2;
      const x = e.clientX - rect.left - radius;
      const y = e.clientY - rect.top - radius;

      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // Determine ripple gradient color based on button theme/variant
      const isPrimary =
        target.classList.contains('auth-btn-primary') ||
        target.classList.contains('btn-primary') ||
        target.classList.contains('bg-primary') ||
        target.id === 'submit_button';

      if (isPrimary) {
        ripple.style.background =
          'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 60%, transparent 100%)';
      } else {
        ripple.style.background =
          'radial-gradient(circle, rgba(41, 164, 255, 0.35) 0%, rgba(41, 164, 255, 0.1) 60%, transparent 100%)';
      }

      // Ensure target button container preserves clipping
      const computedPos = window.getComputedStyle(target).position;
      if (computedPos === 'static') {
        target.style.position = 'relative';
      }
      target.style.overflow = 'hidden';

      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 650);
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return <>{children}</>;
}
