import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl text-card-foreground transition-all duration-300",
      {
        "bg-card border border-border/50 shadow-card hover:shadow-card-hover": variant === "default",
        "bg-card border border-border/50 shadow-material-2 hover:shadow-material-3": variant === "elevated",
        "bg-secondary/50 border-0": variant === "filled",
        "bg-transparent border border-border": variant === "outlined",
      },
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };