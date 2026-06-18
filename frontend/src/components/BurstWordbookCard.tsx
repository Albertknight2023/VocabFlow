import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { getWordbookColor, getBurstColor, type CategoryColor } from "../utils/wordbook-colors";

export interface BurstWordbookCardBook {
  id: number;
  name: string;
  description?: string;
  category?: string;
  is_system: boolean;
  owner_id?: number | null;
}

interface WordbookCardAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

interface BurstWordbookCardProps {
  book: BurstWordbookCardBook;
  wordCount: number;
  currentUserId: number | null;
  badge?: string;
  selected?: boolean;
  actions?: WordbookCardAction[];
  onClick?: () => void;
  className?: string;
  muted?: boolean;
}

export function BurstWordbookCard({
  book,
  wordCount,
  currentUserId,
  badge,
  selected = false,
  actions,
  onClick,
  className,
  muted = false,
}: BurstWordbookCardProps) {
  const color: CategoryColor = getWordbookColor({
    name: book.name,
    category: book.category,
    is_system: book.is_system,
    owner_id: book.owner_id,
    currentUserId,
  });
  const burstColor = getBurstColor(book);
  const IconComponent = color.icon;

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-card bg-white text-left shadow-card border border-border/40 transition-all duration-300",
          muted && "grayscale-[40%] brightness-95 cursor-default",
          !muted && "group-hover:bg-transparent group-hover:border-transparent",
          !muted && (selected
            ? "ring-2 ring-primary-400/20 shadow-elevated"
            : "hover:-translate-y-1 hover:shadow-elevated"),
          className,
        )}
      >
        {/* Burst circle */}
        {!muted && (
          <div
            className={cn(
              "absolute h-[5em] w-[5em] -top-[2.5em] -right-[2.5em] rounded-full group-hover:scale-[1000%] duration-500 z-0",
              burstColor,
            )}
          />
        )}

        {/* Decorative icon */}
        <IconComponent
          className={cn(
            "pointer-events-none absolute -bottom-6 -left-6 size-28 text-zinc-200 group-hover:text-white/20 transition-all duration-300 group-hover:scale-110",
          )}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col p-3">
          {/* Book name */}
          <h3 className="text-subheading font-bold leading-tight line-clamp-2 text-zinc-800 group-hover:text-white transition-colors duration-300">
            {book.name}
          </h3>

          {book.description && (
            <p className="mt-1 text-body-sm line-clamp-2 leading-snug text-zinc-500 group-hover:text-white/80 transition-colors duration-300">
              {book.description}
            </p>
          )}

          <div className="flex-1" />

          {/* Word count + badge */}
          <div className="text-right">
            <span className="text-heading font-bold text-zinc-700 group-hover:text-white transition-colors duration-300">
              {wordCount}词
            </span>
            {badge && (
              <span className="block text-caption text-zinc-400 group-hover:text-white/70 transition-colors duration-300">
                {badge}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Hover toolbar */}
      {actions && actions.length > 0 && (
        <div className="absolute inset-x-2 top-2 z-20 flex justify-center opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none">
          <div className="inline-flex items-center gap-0.5 rounded-full border border-white/30 bg-white/90 backdrop-blur-sm shadow-elevated p-0.5">
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                aria-label={action.label}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={cn(
                  "rounded-full p-1.5 transition-colors",
                  action.destructive
                    ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                    : "text-zinc-500 hover:bg-white hover:text-zinc-900",
                )}
              >
                {action.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="absolute top-2 right-2 z-20 size-2.5 rounded-full bg-primary-500 ring-2 ring-white" />
      )}
    </div>
  );
}
