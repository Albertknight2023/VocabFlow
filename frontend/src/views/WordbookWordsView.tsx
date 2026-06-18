import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toastSuccess, toastError } from "../lib/toast";
import { ArrowUpDown, Check } from "lucide-react";
import { getWordbookApi } from "../api/wordbooks";
import { createWordApi, deleteWordApi, previewWordApi, getWordsByWordbookApi } from "../api/words";
import { Button } from "../components/ui/Button";
import { PageShell, PageShellHeader, PageShellContent } from "../components/ui/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { H2, H3, Body, BodySm, H4 } from "../components/ui/Typography";

interface Word {
  id: number; text: string; meaning: string; part_of_speech?: string;
}

interface WordPreview {
  text: string; meaning: string; part_of_speech?: string;
  phonetic?: string; english_definition: string; example?: string;
}

type SortMode = "az" | "newest" | "oldest";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "az", label: "A – Z" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

function WordbookWordsView() {
  const { wordbookId } = useParams();
  const parsedId = Number(wordbookId);

  const [bookName, setBookName] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [wordText, setWordText] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [addingWord, setAddingWord] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewData, setPreviewData] = useState<WordPreview | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!parsedId) return;
    const load = async () => {
      try {
        const [bookRes, wordsRes] = await Promise.all([
          getWordbookApi(parsedId), getWordsByWordbookApi(parsedId),
        ]);
        setBookName(bookRes.data.name);
        setWords(wordsRes.data);
      } catch { toastError("Failed to load"); }
      finally { setLoading(false); }
    };
    load();
  }, [parsedId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const sortedWords = useMemo(() => {
    const sorted = [...words];
    switch (sortMode) {
      case "az":
        sorted.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
        break;
      case "newest":
        sorted.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        sorted.sort((a, b) => a.id - b.id);
        break;
    }
    return sorted;
  }, [words, sortMode]);

  const reloadWords = async () => {
    const { data } = await getWordsByWordbookApi(parsedId);
    setWords(data);
  };

  // ── word actions ──
  const submitPreview = async () => {
    if (!wordText.trim()) return;
    setPreviewLoading(true); setPreviewError("");
    try {
      const { data } = await previewWordApi(wordText);
      setPreviewData(data); setPreviewOpen(true);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Preview failed";
      setPreviewError(detail); toastError(detail);
    } finally { setPreviewLoading(false); }
  };

  const confirmAddWord = async () => {
    if (!previewData) return;
    setAddingWord(true);
    try {
      const { data } = await createWordApi(parsedId, {
        text: previewData.text, part_of_speech: previewData.part_of_speech,
        phonetic: previewData.phonetic, meaning: previewData.meaning,
        english_definition: previewData.english_definition || previewData.example,
      });
      setWords((prev) => (prev.some((item) => item.id === data.id) ? prev : [data, ...prev]));
      setWordText(""); setPreviewOpen(false); setPreviewData(null); setPreviewError("");
      toastSuccess("Word added");
    } catch (err: any) { toastError(err.response?.data?.detail || "Failed"); }
    finally { setAddingWord(false); }
  };

  const removeWord = async (wordId: number) => {
    try { await deleteWordApi(wordId); toastSuccess("Word deleted"); await reloadWords(); }
    catch (err: any) { toastError(err.response?.data?.detail || "Failed"); }
  };

  if (!parsedId) {
    return <PageShell><PageShellContent><BodySm>Invalid wordbook</BodySm></PageShellContent></PageShell>;
  }

  return (
    <PageShell>
      <PageShellHeader
        title={bookName || "Wordbook"}
        subtitle={`${words.length} words`}
        backTo="/"
      />

      <PageShellContent>
        <div className="max-w-4xl mx-auto w-full space-y-6">

          {/* Add word — stays at top */}
          <Card className="sticky top-0 z-10">
            <CardBody>
              <H2>Add Word</H2>
              <div className="mt-4 flex gap-2">
                <input
                  className="flex-1 h-10 rounded-ui border border-border bg-background px-3 text-body placeholder:text-foreground-muted focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20 outline-none transition"
                  placeholder="Enter an English word, e.g. abandon"
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitPreview()}
                />
                <Button onClick={submitPreview} loading={previewLoading}>
                  Search
                </Button>
              </div>
              {previewError && (
                <div className="mt-3 rounded-ui border border-destructive-200 bg-destructive-50 px-3 py-2 text-body-sm text-destructive-600">
                  {previewError}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Word list */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4 shrink-0">
                <H2>Words</H2>

                {/* Sort dropdown */}
                <div className="relative" ref={sortRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ArrowUpDown className="size-3.5" />}
                    onClick={() => setSortOpen((v) => !v)}
                  >
                    {SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? "Sort"}
                  </Button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 rounded-ui border border-border bg-surface shadow-modal py-1 z-30">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-body-sm text-foreground-secondary hover:bg-elevated hover:text-foreground transition"
                          onClick={() => { setSortMode(opt.value); setSortOpen(false); }}
                        >
                          <Check className={`size-3.5 ${sortMode === opt.value ? "opacity-100" : "opacity-0"}`} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!loading && sortedWords.length === 0 ? (
                <div className="rounded-card border border-dashed border-border p-6 text-center">
                  <BodySm>No words yet. Add one above.</BodySm>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedWords.map((word) => (
                    <div key={word.id} className="flex items-start justify-between rounded-ui border border-border bg-elevated px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-semibold text-foreground truncate">{word.text}</p>
                        <p className="mt-1 text-body-sm text-foreground-secondary">{word.meaning}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0 ml-2" onClick={() => removeWord(word.id)}>
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </PageShellContent>

      {/* ── Preview modal ── */}
      {previewOpen && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-2xl rounded-modal border border-border bg-surface shadow-modal p-5 animate-scale-in">
            <H3>Confirm</H3>
            <BodySm className="mt-1">Preview will be added to the current wordbook.</BodySm>
            <div className="mt-4 space-y-3 rounded-card border border-border bg-elevated p-4">
              <div><H4>Word</H4><p className="mt-1 text-display text-foreground">{previewData.text}</p></div>
              <div><H4>Translation</H4><Body className="mt-1 !text-foreground">{previewData.meaning}</Body></div>
              <div><H4>Definition</H4><Body className="mt-1 !text-foreground">{previewData.english_definition || previewData.example || "N/A"}</Body></div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" className="bg-[#ddd] border-0 hover:bg-[#c5c5c5] text-[rgb(27,27,27)]" onClick={() => { setPreviewOpen(false); setPreviewData(null); setPreviewError(""); }}>Cancel</Button>
              <Button size="sm" onClick={confirmAddWord} loading={addingWord}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default WordbookWordsView;
