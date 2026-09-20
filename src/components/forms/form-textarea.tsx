"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./form-field";

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  name: string;
  label?: string;
  description?: string;
}

export function FormTextarea({ name, label, description, className, required, ...props }: FormTextareaProps) {
  return (
    <FormField name={name} label={label} description={description} required={required} className={className}>
      <Textarea required={required} {...props} />
    </FormField>
  );
}
