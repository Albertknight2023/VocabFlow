import { cn } from "../../lib/utils";

type LoaderVariant = "bar" | "spinner" | "dots" | "pulse";

interface LoaderProps {
  variant?: LoaderVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap: Record<string, string> = {
  sm: "h-0.5",
  md: "h-1",
  lg: "h-1.5",
};

const spinnerSizeMap: Record<string, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-[3px]",
  lg: "size-8 border-4",
};

function Loader({ variant = "bar", size = "md", className, label }: LoaderProps) {
  if (variant === "bar") {
    return (
      <div className={cn("space-y-1.5", className)}>
        {label && <p className="text-caption text-foreground-muted">{label}</p>}
        <div className={cn("w-full overflow-hidden rounded-full bg-primary-100", sizeMap[size])}>
          <div className="h-full w-1/3 animate-[loader-bar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
        </div>
        <style>{`@keyframes loader-bar { 0% { transform: translateX(-100%); } 50% { transform: translateX(250%); } 100% { transform: translateX(-100%); } }`}</style>
      </div>
    );
  }

  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "animate-spin rounded-full border-primary-200 border-t-primary-500",
            spinnerSizeMap[size],
          )}
        />
        {label && <span className="text-body-sm text-foreground-muted">{label}</span>}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "animate-bounce rounded-full bg-primary-400",
              size === "sm" ? "size-1.5" : size === "lg" ? "size-3" : "size-2",
            )}
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
          />
        ))}
        {label && <span className="ml-1 text-body-sm text-foreground-muted">{label}</span>}
      </div>
    );
  }

  // pulse
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "animate-pulse rounded-full bg-primary-500",
          size === "sm" ? "size-2" : size === "lg" ? "size-4" : "size-3",
        )}
      />
      {label && <span className="text-body-sm text-foreground-muted">{label}</span>}
    </div>
  );
}

export { Loader };
