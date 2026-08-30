import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while processing your request.",
  onRetry,
  icon,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mb-4 text-destructive">
        {icon || <AlertCircle className="h-10 w-10" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mb-6 text-sm text-muted-foreground max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
