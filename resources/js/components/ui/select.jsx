import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef(({ className, children, variant = "outlined", ...props }, ref) => {
  const baseStyles = "flex w-full items-center justify-between text-sm ring-offset-background placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none cursor-pointer";
  
  const variants = {
    outlined: cn(
      "h-12 rounded-xl border-2 border-input bg-background px-4 py-3 pr-10",
      "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
    ),
    filled: cn(
      "h-12 rounded-t-xl rounded-b-none border-0 border-b-2 border-input bg-secondary/50 px-4 py-3 pt-5 pr-10",
      "focus:outline-none focus:border-primary focus:bg-secondary/70"
    ),
    standard: cn(
      "h-10 rounded-none border-0 border-b-2 border-input bg-transparent px-1 py-2 pr-8",
      "focus:outline-none focus:border-primary"
    ),
  };

  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  );
});
Select.displayName = "Select";

export { Select };