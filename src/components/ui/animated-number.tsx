"use client";

import React, { useState, useEffect } from "react";
import { NumberTicker } from "@/components/ui/number-ticker";

interface AnimatedNumberProps {
  value: string | number;
}

export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{value}</>;
  }

  const stringVal = String(value);
  const clean = stringVal.replace(/,/g, '');
  const match = clean.match(/[\d.]+/);
  const numericValue = match ? parseFloat(match[0]) : null;
  const hasDecimals = numericValue ? !Number.isInteger(numericValue) : false;
  
  if (numericValue === null) {
    return <>{value}</>;
  }

  const prefix = stringVal.substring(0, match!.index);
  const suffix = stringVal.substring(match!.index! + match![0].length);

  return (
    <span className="inline-flex items-center">
      {prefix}
      <NumberTicker 
        value={numericValue} 
        decimalPlaces={hasDecimals ? 1 : 0} 
      />
      {suffix}
    </span>
  );
}
