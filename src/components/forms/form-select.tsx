"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  name: string;
  label?: string;
  description?: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function FormSelect({ name, label, description, options, placeholder = "Select an option", className, required }: FormSelectProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        <div className={cn("space-y-2", className)}>
          {label && <Label required={required} className={cn(error && "text-destructive")}>{label}</Label>}
          <Select onValueChange={onChange} value={value}>
            <SelectTrigger {...field}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && !error && <p className="text-[0.8rem] text-muted-foreground">{description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
        </div>
      )}
    />
  );
}
