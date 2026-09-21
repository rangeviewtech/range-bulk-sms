import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string | null;
}

export function InputError({ message, className, id, ...props }: InputErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "text-[11.5px] font-medium text-destructive mt-1 leading-tight animate-in fade-in slide-in-from-top-1 duration-150",
        className
      )}
      {...props}
    >
      {message}
    </p>
  );
}
