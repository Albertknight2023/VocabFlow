import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

/* ── Card ── */

type CardVariant = "default" | "interactive" | "flat";

const cardStyles: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-card",
  interactive:
    "border border-border bg-surface shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all cursor-pointer",
  flat: "border border-border/60 bg-surface",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-card", cardStyles[variant], className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

/* ── Card.Header ── */

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between px-5 pt-5 pb-3", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

/* ── Card.Body ── */

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-5 py-4", className)} {...props} />
  ),
);
CardBody.displayName = "CardBody";

/* ── Card.Footer ── */

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center px-5 pb-5 pt-3 gap-2", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardBody, CardFooter };
