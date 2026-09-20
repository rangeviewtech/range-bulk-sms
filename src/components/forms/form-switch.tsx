"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormSwitchProps {
  name: string;
  label: string;
  description?: string;
  className?: string;
  required?: boolean;
}

export function FormSwitch({ name, label, description, className, required }: FormSwitchProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        <div className={cn("flex flex-row items-center justify-between rounded-lg border p-4", className)}>
          <div className="space-y-0.5">
            <Label htmlFor={name} required={required} className={cn("text-base", error && "text-destructive")}>{label}</Label>
            {description && !error && <p className="text-[0.8rem] text-muted-foreground">{description}</p>}
            {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
          </div>
          <Switch
            id={name}
            checked={value}
            onCheckedChange={onChange}
            {...field}
          />
        </div>
      )}
    />
  );
}
