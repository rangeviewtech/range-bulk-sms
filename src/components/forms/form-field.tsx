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
}

export function FormField({ name, label, description, children, className }: FormFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn("space-y-2", className)}>
          {label && (
            <Label className={cn(error && "text-destructive")}>
              {label}
            </Label>
          )}
          {React.cloneElement(children as React.ReactElement, { ...field })}
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
