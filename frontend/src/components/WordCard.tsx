import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronLeft, ChevronRight, Check, Eye } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

interface WordCardSpellingProps {
  mode: "spelling";
  meaning: string;
  input: string;
  onInputChange: (value: string) => void;
  onCheck: () => void;
  onPrev: () => void;
  onNext: () => void;
  checking?: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  shaking?: boolean;
}

interface WordCardReviewProps {
  mode: "review";
  title?: string;
  subtitle?: string;
  meaning: string;
  example?: string;
  onMastered: () => void;
  onReviewAgain: () => void;
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  submitting?: boolean;
  hasPrev: boolean;
  hasNext: boolean;
}

type WordCardProps = WordCardSpellingProps | WordCardReviewProps;

export function WordCard(props: WordCardProps) {
  if (props.mode === "spelling") {
    const { meaning, input, onInputChange, onCheck, onPrev, onNext, checking, hasPrev, hasNext, shaking } = props;

    return (
      <div className="w-[640px] max-w-full rounded-card border border-border bg-surface shadow-card p-8">
        {/* 中文释义 — 与复习卡片释义区相同样式 */}
        <div className="rounded-card bg-primary-50/50 p-5 border border-primary-100/60 h-[200px] overflow-y-auto mb-6">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-foreground leading-relaxed mb-2 text-body">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground-secondary">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-2 text-foreground-secondary text-body-sm">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-2 text-foreground-secondary text-body-sm">{children}</ol>
                ),
                code: ({ children }) => (
                  <code className="bg-surface border border-border px-1 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-300 bg-primary-50/50 pl-3 py-2 my-2 italic text-foreground-secondary text-body-sm">{children}</blockquote>
                ),
              }}
            >
              {meaning}
            </ReactMarkdown>
          </div>
        </div>

        <div className={cn("mb-6", shaking && "animate-[shake_0.4s_ease-in-out]")}>
          <input
            className={cn(
              "w-full h-14 rounded-lg border bg-elevated px-5 text-center text-lg placeholder:text-foreground-muted outline-none transition-colors duration-200",
              shaking
                ? "border-destructive-400 focus:border-destructive-400 focus:ring-2 focus:ring-destructive-400/20"
                : "border-border focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
            )}
            placeholder="Type the English word..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCheck()}
            autoFocus
          />
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              icon={<ChevronLeft className="size-4" />}
              onClick={onPrev}
              disabled={!hasPrev || checking}
            >
              Prev
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<ChevronRight className="size-4" />}
              iconPosition="right"
              onClick={onNext}
              disabled={!hasNext || checking}
            >
              Next
            </Button>
          </div>

          <Button
            onClick={onCheck}
            loading={checking}
            size="lg"
            icon={<Check className="size-4" />}
          >
            Check
          </Button>
        </div>
      </div>
    );
  }

  // Review mode
  const [revealed, setRevealed] = useState(false);
  const { title, subtitle, meaning, example, onMastered, onReviewAgain, onReset, onPrev, onNext, submitting, hasPrev, hasNext } = props;

  return (
    <div className="w-[640px] max-w-full rounded-card border border-border bg-surface shadow-card p-8">
      {/* 单词标题 */}
      {title && (
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-1.5 text-body-sm text-foreground-muted">{subtitle}</p>
          )}
        </div>
      )}

      {/* 释义区域 — 始终渲染 + min-height 保持卡片大小稳定 */}
      <div className="relative mb-5">
        <div className={`rounded-card bg-primary-50/50 p-5 border border-primary-100/60 h-[200px] overflow-y-auto transition duration-300 ${revealed ? "" : "blur-[6px] select-none pointer-events-none"}`}>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-foreground leading-relaxed mb-2 text-body">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground-secondary">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-2 text-foreground-secondary text-body-sm">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-2 text-foreground-secondary text-body-sm">{children}</ol>
                ),
                code: ({ children }) => (
                  <code className="bg-surface border border-border px-1 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-300 bg-primary-50/50 pl-3 py-2 my-2 italic text-foreground-secondary text-body-sm">{children}</blockquote>
                ),
              }}
            >
              {meaning}
            </ReactMarkdown>
          </div>
        </div>

        {/* 未揭示时的遮罩层 */}
        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-card cursor-pointer bg-primary-50/30 border-2 border-dashed border-primary-200 hover:border-primary-300 hover:bg-primary-50/60 transition-colors duration-200"
          >
            <Eye className="size-8 mb-2 text-primary-300" />
            <p className="text-body text-foreground-muted font-medium">Tap to reveal definition</p>
            <p className="text-caption text-foreground-muted mt-1">Try to recall the meaning first</p>
          </button>
        )}
      </div>

      {/* 例句区域 — 始终渲染占位 */}
      <div className={`mb-6 px-4 py-3 rounded-lg bg-elevated border border-border h-[68px] overflow-y-auto transition duration-300 ${revealed ? "" : "blur-[4px] select-none pointer-events-none"} ${!example ? "invisible" : ""}`}>
        <span className="text-caption text-foreground-muted font-semibold uppercase tracking-wide">Example</span>
        <p className="mt-1 text-body-sm text-foreground-secondary italic leading-relaxed">{example || " "}</p>
      </div>

      {/* 操作按钮区 — 固定高度防止 loading 时布局变化 */}
      <div className="flex items-center justify-between gap-3 min-h-[40px]">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={<ChevronLeft className="size-4" />}
            onClick={onPrev}
            disabled={!hasPrev || submitting}
          >
            Prev
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<ChevronRight className="size-4" />}
            iconPosition="right"
            onClick={onNext}
            disabled={!hasNext || submitting}
          >
            Next
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {revealed ? (
            <>
              <Button
                onClick={onReset}
                loading={submitting}
                variant="ghost"
                size="sm"
              >
                Reset
              </Button>
              <Button
                onClick={onReviewAgain}
                loading={submitting}
                variant="outline"
                size="sm"
              >
                Again
              </Button>
              <Button
                onClick={onMastered}
                loading={submitting}
                variant="primary"
                size="sm"
              >
                Mastered
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setRevealed(true)}
              variant="outline"
              size="md"
              icon={<Eye className="size-4" />}
            >
              Show
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
