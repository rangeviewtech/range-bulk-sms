# Component Standards

This guide defines how to create new components.

## Workflow

1. **Identify the Type:** Is it a UI primitive, a layout wrapper, or a feature-specific component?
2. **Location:** Place it in the correct folder under `src/components/`.
3. **File Naming:** Use `kebab-case.tsx`.

## Standard Component Template

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  customProp?: boolean;
}

export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, customProp, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn("base-classes", customProp && "conditional-classes", className)}
        {...props}
      >
        {/* Content */}
      </div>
    )
  }
)
MyComponent.displayName = "MyComponent"
```

## Rules
- Always support a `className` prop.
- Forward refs for primitive UI components.
- Use `cva` for complex variant logic.
