"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormCheckboxProps {
  name: string;
  label: string;
  description?: string;
  className?: string;
}

export function FormCheckbox({ name, label, description, className }: FormCheckboxProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        <div className={cn("flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4", className)}>
          <Checkbox
            checked={value}
            onCheckedChange={onChange}
            {...field}
          />
          <div className="space-y-1 leading-none">
            <Label className={cn(error && "text-destructive")}>{label}</Label>
            {description && !error && <p className="text-[0.8rem] text-muted-foreground">{description}</p>}
            {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
          </div>
        </div>
      )}
    />
  );
}
