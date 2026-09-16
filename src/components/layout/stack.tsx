import * as React from "react";
import { cn } from "@/lib/utils";

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  wrap?: boolean;
}

export function Stack({
  className,
  direction = "col",
  align,
  justify,
  gap = 4,
  wrap = false,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "col" ? "flex-col" : "flex-row",
        align && {
          start: "items-start",
          center: "items-center",
          end: "items-end",
          stretch: "items-stretch",
          baseline: "items-baseline",
        }[align],
        justify && {
          start: "justify-start",
          center: "justify-center",
          end: "justify-end",
          between: "justify-between",
          around: "justify-around",
          evenly: "justify-evenly",
        }[justify],
        gap && {
          0: "gap-0",
          1: "gap-1",
          2: "gap-2",
          3: "gap-3",
          4: "gap-4",
          5: "gap-5",
          6: "gap-6",
          8: "gap-8",
          10: "gap-10",
          12: "gap-12",
        }[gap],
        wrap && "flex-wrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
