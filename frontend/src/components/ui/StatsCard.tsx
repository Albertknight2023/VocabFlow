import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface StatsCardProps {
  value: string | number;
  label: string;
  bg?: string;
  shadowColor?: string;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const StatsCard = ({
  value,
  label,
  bg = "#673ab7",
  shadowColor: _shadowColor,
  icon,
  className,
  onClick,
}: StatsCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg p-5 transition relative duration-200 cursor-pointer",
        "border-b-[4px] border-black/20",
        "hover:brightness-110 hover:-translate-y-px",
        "active:border-b-[2px] active:brightness-90 active:translate-y-[2px]",
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      <p className="text-white text-2xl font-bold">{value}</p>
      <p className="text-white text-sm opacity-70">{label}</p>

      {icon && (
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 opacity-20 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
          {icon}
        </div>
      )}
    </div>
  );
};

export { StatsCard };
