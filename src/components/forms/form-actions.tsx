"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  showCancel?: boolean;
}

export function FormActions({
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onCancel,
  loading = false,
  showCancel = true,
  className,
  ...props
}: FormActionsProps) {
  return (
    <div className={cn("flex items-center justify-end space-x-4 pt-4 border-t", className)} {...props}>
      {showCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );
}
