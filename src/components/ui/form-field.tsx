import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement<{
    id?: string;
    "aria-invalid"?: boolean | "true" | "false";
    "aria-describedby"?: string;
  }>;
}

export function FormField({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-1 text-destructive font-bold">
              *
            </span>
            <span className="sr-only"> required</span>
          </>
        ) : null}
      </label>

      {React.cloneElement(children, {
        id: children.props.id || id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}

      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
