import { type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { H3, Caption } from "./Typography";

/* ── PageShell ── */
interface PageShellProps {
  children: ReactNode;
  className?: string;
}

function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("flex flex-col h-full overflow-hidden bg-background", className)}>
      {children}
    </div>
  );
}

/* ── PageShell.Header ── */
interface PageShellHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  actions?: ReactNode;
}

function PageShellHeader({ title, subtitle, backTo, actions }: PageShellHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex-shrink-0 border-b border-border bg-surface/80 backdrop-blur-sm dark:bg-surface">
      <div className="flex items-center gap-3 px-page py-3">
        {backTo && (
          <button
            type="button"
            aria-label="返回"
            onClick={() => navigate(backTo)}
            className="flex-shrink-0 inline-flex items-center justify-center size-8 rounded-ui border border-border bg-surface text-foreground-secondary hover:text-foreground hover:border-primary-400/30 transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <H3 className="truncate">{title}</H3>
          {subtitle && <Caption>{subtitle}</Caption>}
        </div>
        {actions && <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/* ── PageShell.Content ── */
interface PageShellContentProps {
  children: ReactNode;
  className?: string;
}

function PageShellContent({ children, className }: PageShellContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      <div className="p-page">{children}</div>
    </div>
  );
}

export { PageShell, PageShellHeader, PageShellContent };
