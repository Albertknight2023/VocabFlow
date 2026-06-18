import { type ReactNode, useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface TerminalCardProps {
  host?: string;
  path?: string;
  children?: ReactNode;
  className?: string;
  /** Text lines to "type out" one by one */
  lines?: string[];
  /** Auto-type speed in ms per character */
  typeSpeed?: number;
}

function TerminalCard({
  host = "neo",
  path = "~/projects",
  children,
  className,
  lines,
  typeSpeed = 30,
}: TerminalCardProps) {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [done, setDone] = useState(!lines || lines.length === 0);

  useEffect(() => {
    if (!lines || lines.length === 0) {
      setDone(true);
      return;
    }

    if (currentLineIdx >= lines.length) {
      setDone(true);
      return;
    }

    const currentLine = lines[currentLineIdx];
    if (currentCharIdx >= currentLine.length) {
      // line complete, move to next after delay
      const timer = setTimeout(() => {
        setTypedLines((prev) => [...prev, currentLine]);
        setCurrentLineIdx((i) => i + 1);
        setCurrentCharIdx(0);
      }, 200);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentCharIdx((i) => i + 1);
    }, typeSpeed);
    return () => clearTimeout(timer);
  }, [lines, currentLineIdx, currentCharIdx, typeSpeed]);

  const prompt = `${host}@portfolio:${path}$`;

  return (
    <div className={cn("rounded-card border border-zinc-800 bg-[#0c0c10] shadow-modal overflow-hidden", className)}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/80 bg-[#0f0f14]">
        <span className="size-3 rounded-full bg-red-500/80" />
        <span className="size-3 rounded-full bg-amber-500/80" />
        <span className="size-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 text-caption text-zinc-500 font-mono">
          {host} — bash — 80×24
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-4 font-mono text-body-sm leading-relaxed">
        {/* Prompt line */}
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 whitespace-nowrap select-none">{prompt}</span>
          {done && (
            <span className="inline-block w-2 h-[1.1em] bg-emerald-400/80 animate-pulse rounded-sm align-middle" />
          )}
        </div>

        {/* Typed content */}
        <div className="mt-1 space-y-0.5">
          {typedLines.map((line, i) => (
            <div key={i} className="text-zinc-300">
              {line}
            </div>
          ))}
          {!done && currentLineIdx < (lines?.length ?? 0) && (
            <div className="text-zinc-300">
              {lines![currentLineIdx].slice(0, currentCharIdx)}
              <span className="inline-block w-1.5 h-[1.1em] bg-zinc-300 animate-pulse rounded-sm align-middle ml-0.5" />
            </div>
          )}
        </div>

        {/* Children content (e.g. sessions list) */}
        {done && children && (
          <div className="mt-4 pt-4 border-t border-zinc-800/60">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── TerminalCard.Session ── */
interface SessionProps {
  name: string;
  time?: string;
  active?: boolean;
  onClick?: () => void;
}

function TerminalSession({ name, time, active, onClick }: SessionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-ui text-left transition-colors",
        active
          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
          : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
      )}
    >
      <span className="text-body-sm font-mono">{name}</span>
      {time && <span className="text-caption font-mono text-zinc-500">{time}</span>}
    </button>
  );
}

TerminalCard.Session = TerminalSession;

export { TerminalCard };
