"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

export interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  portalled?: boolean;
  container?: HTMLElement | null;
  zeroLag?: boolean;
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = "center", side = "bottom", sideOffset = 4, portalled = true, zeroLag = false, container, ...props }, ref) => {
  const isZeroLag = !portalled || zeroLag;
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  React.useLayoutEffect(() => {
    if (isZeroLag && contentRef.current) {
      const wrapper = contentRef.current.closest("[data-radix-popper-content-wrapper]") as HTMLElement | null;
      if (wrapper) {
        wrapper.style.setProperty("position", "absolute", "important");
        wrapper.style.setProperty("top", side === "top" ? "auto" : "100%", "important");
        wrapper.style.setProperty("bottom", side === "top" ? "100%" : "auto", "important");
        wrapper.style.setProperty("left", align === "end" ? "auto" : align === "center" ? "50%" : "0px", "important");
        wrapper.style.setProperty("right", align === "end" ? "0px" : "auto", "important");
        wrapper.style.setProperty("transform", align === "center" ? "translateX(-50%)" : "none", "important");
        wrapper.style.setProperty("margin-top", side === "top" ? "0px" : `${sideOffset}px`, "important");
        wrapper.style.setProperty("margin-bottom", side === "top" ? `${sideOffset}px` : "0px", "important");
        wrapper.setAttribute("data-zero-lag-wrapper", "true");
        wrapper.setAttribute("data-align", align);
        wrapper.setAttribute("data-side", side);
      }
    }
  }, [isZeroLag, align, side, sideOffset]);

  const content = (
    <PopoverPrimitive.Content
      ref={mergedRef}
      align={align}
      side={side}
      sideOffset={sideOffset}
      data-zero-lag={isZeroLag ? "true" : undefined}
      data-unportalled={!portalled ? "true" : undefined}
      data-align={align}
      data-side={side}
      style={{
        ...(props.style || {}),
        ["--popper-offset" as string]: `${sideOffset}px`,
      }}
      className={cn(
        "z-[110] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  );

  if (!portalled) {
    return content;
  }

  return (
    <PopoverPrimitive.Portal container={container}>
      {content}
    </PopoverPrimitive.Portal>
  );
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }

