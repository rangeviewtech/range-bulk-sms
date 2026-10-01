"use client";

import React, { useState, useEffect } from "react";
import { useCountUp } from "@/hooks/use-count-up";

interface AnimatedNumberProps {
  value: string | number;
}

export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const stringVal = String(value);
  const clean = stringVal.replace(/,/g, '');
  const match = clean.match(/[\d.]+/);
  const numericValue = match ? parseFloat(match[0]) : null;
  const hasDecimals = numericValue ? !Number.isInteger(numericValue) : false;
  
  const animatedValue = useCountUp(
    numericValue || 0,
    1500, // duration
    0,
    hasDecimals ? 1 : 0
  );

  if (!mounted || numericValue === null) {
    return <>{value}</>;
  }

  const formattedValue = animatedValue.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 1 : 0,
    maximumFractionDigits: hasDecimals ? 1 : 0,
  });

  const displayValue = stringVal.replace(/[\d.,]+/, formattedValue);

  return <>{displayValue}</>;
}
