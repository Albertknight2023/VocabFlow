import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type TypoProps = HTMLAttributes<HTMLElement> & { as?: keyof HTMLElementTagNameMap };

const Display = forwardRef<HTMLHeadingElement, TypoProps>(
  ({ className, as: Tag = "h1", ...props }, ref) => (
    <Tag ref={ref} className={cn("text-display-lg tracking-tight", className)} {...props} />
  ),
);
Display.displayName = "Display";

const H1 = forwardRef<HTMLHeadingElement, TypoProps>(
  ({ className, as: Tag = "h1", ...props }, ref) => (
    <Tag ref={ref} className={cn("text-display", className)} {...props} />
  ),
);
H1.displayName = "H1";

const H2 = forwardRef<HTMLHeadingElement, TypoProps>(
  ({ className, as: Tag = "h2", ...props }, ref) => (
    <Tag ref={ref} className={cn("text-heading", className)} {...props} />
  ),
);
H2.displayName = "H2";

const H3 = forwardRef<HTMLHeadingElement, TypoProps>(
  ({ className, as: Tag = "h3", ...props }, ref) => (
    <Tag ref={ref} className={cn("text-subheading", className)} {...props} />
  ),
);
H3.displayName = "H3";

const H4 = forwardRef<HTMLHeadingElement, TypoProps>(
  ({ className, as: Tag = "h4", ...props }, ref) => (
    <Tag ref={ref} className={cn("text-label tracking-wide uppercase", className)} {...props} />
  ),
);
H4.displayName = "H4";

const Body = forwardRef<HTMLParagraphElement, TypoProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-body text-foreground-secondary", className)} {...props} />
  ),
);
Body.displayName = "Body";

const BodySm = forwardRef<HTMLParagraphElement, TypoProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-body-sm text-foreground-muted", className)} {...props} />
  ),
);
BodySm.displayName = "BodySm";

const Caption = forwardRef<HTMLSpanElement, TypoProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-caption text-foreground-muted", className)} {...props} />
  ),
);
Caption.displayName = "Caption";

const Code = forwardRef<HTMLElement, TypoProps>(
  ({ className, ...props }, ref) => (
    <code ref={ref} className={cn("text-code font-mono text-foreground-secondary", className)} {...props} />
  ),
);
Code.displayName = "Code";

export { Display, H1, H2, H3, H4, Body, BodySm, Caption, Code };
