import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { getWordbookColor, type CategoryColor } from "../utils/wordbook-colors";

export interface WordbookCardBook {
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

interface WordbookCardProps {
  book: WordbookCardBook;
  wordCount: number;
  currentUserId: number | null;
  /** Additional badge below word count */
  badge?: string;
  /** Highlight as selected */
  selected?: boolean;
  /** Hover toolbar actions */
  actions?: WordbookCardAction[];
  onClick?: () => void;
  className?: string;
}

export function WordbookCard({
  book,
  wordCount,
  currentUserId,
  badge,
  selected = false,
  actions,
  onClick,
  className,
}: WordbookCardProps) {
  const color: CategoryColor = getWordbookColor({
    name: book.name,
    category: book.category,
    is_system: book.is_system,
    owner_id: book.owner_id,
    currentUserId,
  });
  const IconComponent = color.icon;

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-card border text-left shadow-card transition-all duration-200",
          selected
            ? "border-primary-400 ring-2 ring-primary-400/20 shadow-elevated"
            : `${color.borderColor} hover:-translate-y-1 hover:shadow-elevated`,
          color.solidBg,
          className,
        )}
      >
        {/* Decorative icon */}
        <IconComponent
          className={cn(
            "pointer-events-none absolute -bottom-6 -left-6 size-28 opacity-30 transition-transform duration-300 group-hover:scale-110",
            color.iconColor,
          )}
        />

        {/* Card content */}
        <div className="relative z-10 flex h-full flex-col p-3">
          {/* Book name */}
          <h3 className={cn("text-subheading font-black leading-tight line-clamp-2", color.textColor)}>
            {book.name}
          </h3>

          {/* Description (optional, for marketplace cards) */}
          {book.description && (
            <p className={cn("mt-1 text-body-sm line-clamp-2 leading-snug opacity-75", color.textColor)}>
              {book.description}
            </p>
          )}

          <div className="flex-1" />

          {/* Word count + badge */}
          <div className="flex items-end justify-between">
            <div className="text-right w-full">
              <span className={cn("text-heading font-bold", color.textColor)}>
                {wordCount}词
              </span>
              {badge && (
                <span className={cn("block text-caption opacity-60", color.textColor)}>
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Hover toolbar */}
      {actions && actions.length > 0 && (
        <div className="absolute inset-x-2 top-2 z-20 flex justify-center opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none">
          <div className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-surface/90 backdrop-blur-sm dark:bg-surface dark:border-border p-0.5 shadow-elevated">
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
                    ? "text-destructive-500 hover:bg-destructive-50 hover:text-destructive-600"
                    : "text-foreground-secondary hover:bg-surface hover:text-foreground",
                )}
              >
                {action.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-2 right-2 z-20 size-2.5 rounded-full bg-primary-500 ring-2 ring-surface" />
      )}
    </div>
  );
}
