import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, variant = "outlined", ...props }, ref) => {
  const baseStyles = "flex w-full text-sm ring-offset-background placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none";
  
  const variants = {
    outlined: cn(
      "min-h-[100px] rounded-xl border-2 border-input bg-background px-4 py-3",
      "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
    ),
    filled: cn(
      "min-h-[100px] rounded-t-xl rounded-b-none border-0 border-b-2 border-input bg-secondary/50 px-4 py-3 pt-5",
      "focus-visible:outline-none focus-visible:border-primary focus-visible:bg-secondary/70"
    ),
    standard: cn(
      "min-h-[80px] rounded-none border-0 border-b-2 border-input bg-transparent px-1 py-2",
      "focus-visible:outline-none focus-visible:border-primary"
    ),
  };

  return (
    <textarea
      className={cn(baseStyles, variants[variant], className)}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };