"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Loader2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "default" | "destructive";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "default",
  loading = false,
  icon,
}: ConfirmationDialogProps) {
  const isDestructive = variant === "destructive";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
        <AlertDialogHeader className="border-b-0 pb-1 bg-transparent pt-6 px-6 text-left sm:text-left">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "p-2.5 rounded-full shrink-0 flex items-center justify-center",
                isDestructive
                  ? "bg-destructive/10 text-destructive dark:bg-destructive/20"
                  : "bg-primary/10 text-primary dark:bg-primary/20"
              )}
            >
              {icon || (isDestructive ? (
                <AlertTriangle className="w-5 h-5 stroke-[2.25]" />
              ) : (
                <AlertCircle className="w-5 h-5 stroke-[2.25]" />
              ))}
            </div>
            <div className="space-y-1 flex-1">
              <AlertDialogTitle className="text-base font-semibold leading-6 text-foreground">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="p-4 sm:px-6 bg-muted/20 border-t border-border mt-5 sm:items-center">
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={buttonVariants({
              variant: isDestructive ? "destructive" : "default",
            })}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
