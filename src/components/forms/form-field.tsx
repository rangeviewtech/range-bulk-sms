"use client";

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function FormField({ name, label, description, children, className, required }: FormFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn("space-y-1 pointer-events-auto", className)}>
          {label && (
            <Label htmlFor={name} required={required} className={cn(error && "text-destructive", "cursor-pointer")}>
              {label}
            </Label>
          )}
          {React.isValidElement(children) ? (
            React.cloneElement(children as React.ReactElement<{ id?: string; error?: boolean; "aria-invalid"?: string }>, {
              id: (children.props as { id?: string }).id || name,
              ...field,
              error: !!error,
              "aria-invalid": error ? "true" : undefined,
            })
          ) : (
            children
          )}
          {description && !error && (
            <p className="text-[0.8rem] text-muted-foreground">{description}</p>
          )}
          {error && (
            <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
          )}
        </div>
      )}
    />
  );
}
