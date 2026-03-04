import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, variant = "outlined", ...props }, ref) => {
  const baseStyles = "flex w-full text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";
  
  const variants = {
    outlined: cn(
      "h-12 rounded-xl border-2 border-input bg-background px-4 py-3",
      "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
    ),
    filled: cn(
      "h-12 rounded-t-xl rounded-b-none border-0 border-b-2 border-input bg-secondary/50 px-4 py-3 pt-5",
      "focus-visible:outline-none focus-visible:border-primary focus-visible:bg-secondary/70"
    ),
    standard: cn(
      "h-10 rounded-none border-0 border-b-2 border-input bg-transparent px-1 py-2",
      "focus-visible:outline-none focus-visible:border-primary"
    ),
  };

  return (
    <input
      type={type}
      className={cn(baseStyles, variants[variant], className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };