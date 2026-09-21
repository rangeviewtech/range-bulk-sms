import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NetworkBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  network: string | null | undefined;
}

/**
 * Renders a mobile network carrier badge using the official brand identity colors:
 * - MTN: Official MTN Canary Yellow (#FFCC00) with bold black text (#000000)
 * - Airtel: Official Airtel Crimson Red (#ED1C24) with bold white text (#FFFFFF)
 * - UTL (Uganda Telecom): Official UTL Blue (#0054A6) with white text
 * - Safaricom: Official Safaricom Green (#00A859) with white text
 * - Africell: Official Africell Purple (#782B8F) with white text
 * - Vodacom: Official Vodacom Red (#E60000) with white text
 */
export function NetworkBadge({
  network,
  className,
  ...props
}: NetworkBadgeProps) {
  if (!network) {
    return (
      <Badge
        variant="outline"
        className={cn("text-xs font-normal text-muted-foreground", className)}
        {...props}
      >
        All Networks
      </Badge>
    );
  }

  const name = network.trim();
  const lower = name.toLowerCase();

  // 1. MTN (MTN Uganda, MTN, etc.) -> Official MTN Yellow
  if (lower.includes("mtn")) {
    return (
      <Badge
        className={cn(
          "bg-[#FFCC00] text-black border border-[#E6B800] font-semibold text-xs px-2.5 py-0.5 shadow-xs tracking-tight hover:bg-[#FFD633] transition-colors",
          className
        )}
        {...props}
      >
        {name}
      </Badge>
    );
  }

  // 2. Airtel (Airtel Uganda, Airtel, etc.) -> Official Airtel Red
  if (lower.includes("airtel")) {
    return (
      <Badge
        className={cn(
          "bg-[#ED1C24] text-white border border-[#C7141B] font-semibold text-xs px-2.5 py-0.5 shadow-xs tracking-tight hover:bg-[#F0353C] transition-colors",
          className
        )}
        {...props}
      >
        {name}
      </Badge>
    );
  }

  // 3. Uganda Telecom (UTL) -> Official UTL Blue
  if (lower.includes("utl") || lower.includes("uganda telecom")) {
    return (
      <Badge
        className={cn(
          "bg-[#0054A6] text-white border border-[#004080] font-semibold text-xs px-2.5 py-0.5 shadow-xs tracking-tight hover:bg-[#0062C4] transition-colors",
          className
        )}
        {...props}
      >
        {name}
      </Badge>
    );
  }

  // 4. Safaricom -> Official Safaricom Green
  if (lower.includes("safaricom")) {
    return (
      <Badge
        className={cn(
          "bg-[#00A859] text-white border border-[#008F4C] font-semibold text-xs px-2.5 py-0.5 shadow-xs tracking-tight hover:bg-[#00BC63] transition-colors",
          className
        )}
        {...props}
      >
        {name}
      </Badge>
    );
  }

  // 5. Africell -> Official Africell Purple
  if (lower.includes("africell")) {
    return (
      <Badge
        className={cn(
          "bg-[#782B8F] text-white border border-[#621F77] font-semibold text-xs px-2.5 py-0.5 shadow-xs tracking-tight hover:bg-[#8D33A8] transition-colors",
          className
        )}
        {...props}
      >
        {name}
      </Badge>
    );
  }

  // 6. Vodacom -> Official Vodacom Red
  if (lower.includes("vodacom")) {
    return (
      <Badge
        className={cn(
          "bg-[#E60000] text-white border border-[#CC0000] font-semibold text-xs px-2.5 py-0.5 shadow-xs tracking-tight hover:bg-[#FF1A1A] transition-colors",
          className
        )}
        {...props}
      >
        {name}
      </Badge>
    );
  }

  // Fallback for generic / unknown networks
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs font-normal", className)}
      {...props}
    >
      {name}
    </Badge>
  );
}
