import { useState, useEffect, useRef } from 'react';

export function useCountUp(
  end: number,
  duration: number = 1000,
  start: number = 0,
  decimals: number = 0
) {
  const [value, setValue] = useState(start);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    let animationFrame: number;

    const tick = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = timestamp - startTime.current;
      
      if (progress < duration) {
        // Ease out quad
        const easeProgress = 1 - (1 - progress / duration) * (1 - progress / duration);
        setValue(start + (end - start) * easeProgress);
        animationFrame = requestAnimationFrame(tick);
      } else {
        setValue(end);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
      startTime.current = null;
    };
  }, [end, duration, start]);

  return Number(value.toFixed(decimals));
}
