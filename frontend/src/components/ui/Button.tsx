import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        // 3D 按压主按钮 — 底部厚边框，hover 加厚，active 压平
        primary: [
          "rounded-lg text-white",
          "bg-blue-500 border-blue-600 border-b-[4px]",
          "hover:brightness-110 hover:-translate-y-px hover:border-b-[6px]",
          "active:border-b-[2px] active:brightness-90 active:translate-y-[2px]",
        ],

        // 描边按钮
        outline: [
          "rounded-lg border-2 text-primary-600 font-medium",
          "border-primary-200 bg-transparent",
          "hover:border-primary-300 hover:bg-primary-50/50",
          "active:scale-[0.98]",
          "dark:border-primary-500/30 dark:text-primary-300",
          "dark:hover:bg-primary-950/30 dark:hover:border-primary-400/50",
        ],

        // 幽灵按钮
        ghost: [
          "rounded-lg border-0 bg-transparent text-foreground-secondary font-medium",
          "hover:bg-surface hover:text-foreground",
          "active:scale-[0.98]",
        ],

        // 3D 危险按钮
        destructive: [
          "rounded-lg text-white",
          "bg-destructive-500 border-destructive-600 border-b-[4px]",
          "hover:brightness-110 hover:-translate-y-px hover:border-b-[6px]",
          "active:border-b-[2px] active:brightness-90 active:translate-y-[2px]",
        ],

        // ── special ──

        // Pill 药丸 — 厚底阴影 3D 按压
        pill: [
          "rounded-xl text-zinc-900 font-bold border-2",
          "bg-yellow-400 border-yellow-500",
          "shadow-[0_6px_0_0_#b45309]",
          "hover:-translate-y-0.5 hover:shadow-[0_8px_0_0_#b45309]",
          "active:translate-y-[6px] active:shadow-[0_0px_0_0_#b45309]",
        ],
      },
      size: {
        sm: "h-8 px-3 text-caption",
        md: "h-9 px-4 text-body-sm",
        lg: "h-10 px-5 text-body",
        xl: "h-12 px-6 text-body",
        "2xl": "h-14 px-8 text-lg",
        "icon-sm": "h-8 w-8 p-0",
        "icon-md": "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

const Spinner = () => (
  <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Button = ({
  className,
  variant,
  size,
  icon,
  iconPosition = "left",
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const iconNode = loading ? <Spinner /> : icon && <span className="flex-shrink-0 size-4">{icon}</span>;
  const childrenNode = children && <span>{children}</span>;

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === "left" && iconNode}
      {childrenNode}
      {iconPosition === "right" && iconNode}
    </button>
  );
};

export { Button, buttonVariants };
