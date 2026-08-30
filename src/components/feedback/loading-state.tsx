import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  fullPage?: boolean;
}

export function LoadingState({
  message = "Loading...",
  fullPage = false,
  className,
  ...props
}: LoadingStateProps) {
  const content = (
    <div
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      {...props}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      {content}
    </div>
  );
}
