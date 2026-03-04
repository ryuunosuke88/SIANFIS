import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground",
        outline: "border border-border text-foreground bg-background",
        waiting: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        called: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        skipped: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        tonal: "bg-primary/10 text-primary",
        elevated: "bg-card text-foreground shadow-material-1 border border-border/50",
      },
      size: {
        default: "px-3 py-1.5 text-xs",
        sm: "px-2 py-1 text-[10px]",
        lg: "px-4 py-2 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({ className, variant, size, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };