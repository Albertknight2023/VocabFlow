import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 hover:translate-y-[-2px] hover:shadow-sm",
  {
    variants: {
      variant: {
        default: "border-zinc-200 bg-white text-black hover:bg-gray-100",
        destructive: "border-zinc-200 bg-white text-black hover:bg-gray-100",
        outline: "border-zinc-200 bg-white text-black hover:bg-gray-100",
        secondary: "border-zinc-200 bg-white text-black hover:bg-gray-100",
        ghost: "border-zinc-200 bg-white text-black hover:bg-gray-100",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-7 px-2.5 text-xs",
        lg: "h-9 px-4 text-lg",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
);

export { Button, buttonVariants };
