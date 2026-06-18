import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

type RainbowVariant = "bars" | "bubbles" | "sweep" | "burst";

interface RainbowCardProps {
  heading: string;
  children?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: RainbowVariant;
  /** burst 变体的圆颜色，默认橙色 */
  burstColor?: string;
  className?: string;
}

/* ── shared shell ── */

function RainbowCard({
  heading,
  children,
  actionLabel,
  onAction,
  variant = "bars",
  burstColor = "bg-[#FF5800]",
  className,
}: RainbowCardProps) {
  return (
    <div className={cn("h-32 w-60 bg-white rounded-card relative group p-3 z-0 overflow-hidden shadow-card border border-border/40", className)}>
      {variant === "bars" && <BarsBg />}
      {variant === "bubbles" && <BubblesBg />}
      {variant === "sweep" && <SweepBg />}
      {variant === "burst" && <BurstBg color={burstColor} />}

      <h1 className="z-20 font-bold text-subheading group-hover:text-white transition-colors duration-100 relative">
        {heading}
      </h1>

      {children && (
        <div className="z-20 relative mt-1 text-body-sm text-foreground-secondary group-hover:text-white/80 transition-colors duration-100">
          {children}
        </div>
      )}

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="text-caption absolute bottom-3 left-3 text-[#6C3082] group-hover:text-white transition-colors duration-100"
        >
          <span className="relative before:h-[0.16em] before:absolute before:w-full before:content-[''] before:bg-[#6C3082] group-hover:before:bg-white before:bottom-0 before:left-0 duration-100">
            {actionLabel}
          </span>
        </button>
      )}
    </div>
  );
}

/* ─── backgrounds ─── */

function BarsBg() {
  const bars = [
    { left: "left-0", from: "bottom-full", to: "group-hover:translate-y-full", color: "bg-[#FDEE00]", delay: "" },
    { left: "left-[20%]", from: "top-full", to: "group-hover:-translate-y-full", color: "bg-[#7CFC00]", delay: "delay-[50ms]" },
    { left: "left-[40%]", from: "bottom-full", to: "group-hover:translate-y-full", color: "bg-[#007FFF]", delay: "delay-[100ms]" },
    { left: "left-[60%]", from: "top-full", to: "group-hover:-translate-y-full", color: "bg-[#FF5800]", delay: "delay-[150ms]" },
    { left: "left-[80%]", from: "bottom-full", to: "group-hover:translate-y-full", color: "bg-[#FF66CC]", delay: "delay-[200ms]" },
  ];
  return (
    <>
      {bars.map((bar, i) => (
        <div
          key={i}
          className={cn("absolute h-full w-[20%] z-[-1] duration-[400ms] ease-out", bar.left, bar.from, bar.to, bar.color, bar.delay)}
        />
      ))}
    </>
  );
}

function BubblesBg() {
  return (
    <>
      <div className="h-[7em] w-[7em] bg-[#FDEE00] rounded-full absolute bottom-full -left-[3.5em] group-hover:scale-[550%] z-[-1] duration-[400ms]" />
      <div className="h-[6em] w-[6em] bg-[#7CFC00] rounded-full absolute bottom-full -left-[3.5em] group-hover:scale-[400%] z-[-1] duration-[400ms]" />
      <div className="h-[5em] w-[5em] bg-[#007FFF] rounded-full absolute bottom-full -left-[3.5em] group-hover:scale-[300%] z-[-1] duration-[400ms]" />
    </>
  );
}

function SweepBg() {
  return (
    <div className="z-[-1] h-full w-[200%] rounded-card bg-gradient-to-br from-green-400 via-lime-400 to-yellow-400 absolute bottom-full right-0 group-hover:-rotate-90 group-hover:h-[300%] duration-500 origin-bottom-right" />
  );
}

function BurstBg({ color }: { color: string }) {
  return (
    <div className={cn("absolute h-[5em] w-[5em] -top-[2.5em] -right-[2.5em] rounded-full group-hover:scale-[1000%] duration-500 z-[-1]", color)} />
  );
}

export { RainbowCard };
export type { RainbowVariant };
