import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

type AlertVariant = "success" | "info" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const styles: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: "bg-success-50 dark:bg-success-50/10",
    border: "border-l-success-500",
    text: "text-success-700 dark:text-success-400",
    icon: "text-success-500",
  },
  info: {
    bg: "bg-primary-50 dark:bg-primary-50/10",
    border: "border-l-primary-500",
    text: "text-primary-700 dark:text-primary-400",
    icon: "text-primary-500",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-50/10",
    border: "border-l-amber-500",
    text: "text-amber-800 dark:text-amber-400",
    icon: "text-amber-500",
  },
  error: {
    bg: "bg-destructive-50 dark:bg-destructive-50/10",
    border: "border-l-destructive-500",
    text: "text-destructive-700 dark:text-destructive-400",
    icon: "text-destructive-500",
  },
};

const IconCircle = ({ className }: { className?: string }) => (
  <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className={cn("size-5 flex-shrink-0 mr-2", className)}>
    <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

export function Alert({ variant = "info", children, className }: AlertProps) {
  const s = styles[variant];
  return (
    <div
      role="alert"
      className={cn(
        "border-l-4 p-2 rounded-ui flex items-center transition duration-300 ease-in-out hover:brightness-95 dark:hover:brightness-110",
        s.bg, s.border, s.text,
        className,
      )}
    >
      <IconCircle className={s.icon} />
      <span className="text-caption font-semibold">{children}</span>
    </div>
  );
}
