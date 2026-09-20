"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";

interface FormInputProps extends React.ComponentProps<typeof Input> {
  name: string;
  label?: string;
  description?: string;
}

export function FormInput({ name, label, description, className, required, ...props }: FormInputProps) {
  return (
    <FormField name={name} label={label} description={description} required={required} className={className}>
      <Input required={required} {...props} />
    </FormField>
  );
}
