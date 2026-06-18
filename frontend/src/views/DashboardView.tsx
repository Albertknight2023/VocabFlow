import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, Trash2, BookOpen } from "lucide-react";
import { TextSwapButton } from "../components/ui/TextSwapButton";
import { StatsCard } from "../components/ui/StatsCard";
import { toastSuccess, toastError } from "../lib/toast";
import {
  createWordbookApi,
  deleteWordbookApi,
  getWordbooksApi,
  unsubscribeWordbookApi,
  updateWordbookApi,
} from "../api/wordbooks";
import { getWordsByWordbookApi } from "../api/words";
import { Button } from "../components/ui/Button";
import { Display, H2, BodySm, Caption } from "../components/ui/Typography";
import { BurstWordbookCard } from "../components/BurstWordbookCard";
import { Alert } from "../components/ui/Alert";
import { getDailyProgress } from "../stores/dailyProgress";

interface Wordbook {
  id: number;
  name: string;
  description?: string;
  category?: string;
  is_system: boolean;
  owner_id?: number | null;
}

function getErrorDetail(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error as { response?: { data?: { detail?: string } } };
    return response.response?.data?.detail || fallback;
  }
  return fallback;
}

function DashboardView() {
  const navigate = useNavigate();
  const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
  const [wordCounts, setWordCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [editBook, setEditBook] = useState<Wordbook | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Wordbook | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const location = useLocation();
  const [daily, setDaily] = useState(() =>
    getDailyProgress(selectedBookId ?? 0),
  );

  useEffect(() => {
    setDaily(getDailyProgress(selectedBookId ?? 0));
  }, [location.pathname, selectedBookId]);
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? ((JSON.parse(raw) as { id?: number }).id ?? null) : null;
    } catch {
      return null;
    }
  }, []);

  const loadDashboard = async () => {
    const { data } = await getWordbooksApi();
    setWordbooks(data);

    const wordsEntries = await Promise.all(
      data.map(async (book: Wordbook) => {
        try {
          const wordsRes = await getWordsByWordbookApi(book.id);
          return [book.id, wordsRes.data.length] as const;
        } catch {
          return [book.id, 0] as const;
        }
      }),
    );
    setWordCounts(Object.fromEntries(wordsEntries));
  };

  useEffect(() => {
    loadDashboard()
      .catch(() => toastError("加载首页数据失败"))
      .finally(() => setLoading(false));
  }, []);

  const visibleBooks = useMemo(() => wordbooks, [wordbooks]);

  const isOwnedBook = (book: Wordbook) => book.owner_id === currentUserId;

  useEffect(() => {
    if (visibleBooks.length === 0) {
      setSelectedBookId(null);
      return;
    }

    const savedId = Number(window.localStorage.getItem("selected-wordbook-id"));
    const savedBook = visibleBooks.find((book) => book.id === savedId);
    const myBook = visibleBooks.find((book) => book.name === "My Wordbook");
    const fallbackBook = myBook || visibleBooks[0];

    if (savedBook) {
      setSelectedBookId(savedBook.id);
      return;
    }

    if (
      !selectedBookId ||
      !visibleBooks.some((book) => book.id === selectedBookId)
    ) {
      setSelectedBookId(fallbackBook.id);
      window.localStorage.setItem(
        "selected-wordbook-id",
        String(fallbackBook.id),
      );
    }
  }, [visibleBooks, selectedBookId]);

  const selectedBook = useMemo(
    () => visibleBooks.find((book) => book.id === selectedBookId) || null,
    [visibleBooks, selectedBookId],
  );

  const selectedBookWords = useMemo(() => {
    if (!selectedBook) return 0;
    return wordCounts[selectedBook.id] ?? 0;
  }, [selectedBook, wordCounts]);

  const openEdit = (book: Wordbook) => {
    setEditBook(book);
    setEditName(book.name);
    setEditCategory(book.category || "");
    setEditDescription(book.description || "");
  };

  const submitEdit = async () => {
    if (!editBook || !editName.trim()) return;
    try {
      await updateWordbookApi(editBook.id, {
        name: editName.trim(),
        category: editCategory.trim() || undefined,
        description: editDescription.trim() || undefined,
      });
      toastSuccess("Wordbook updated");
      setEditBook(null);
      await loadDashboard();
    } catch (error: unknown) {
      toastError(getErrorDetail(error, "更新失败"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (isOwnedBook(deleteTarget)) {
        await deleteWordbookApi(deleteTarget.id);
      } else {
        await unsubscribeWordbookApi(deleteTarget.id);
      }
      toastSuccess("Deleted");
      setDeleteTarget(null);
      await loadDashboard();
    } catch (error: unknown) {
      toastError(getErrorDetail(error, "Delete failed"));
    }
  };

  const submitCreate = async () => {
    if (!createName.trim()) return;
    setCreateLoading(true);
    try {
      await createWordbookApi({
        name: createName,
        description: createDescription,
        category: createCategory,
      });
      toastSuccess("Wordbook created");
      setCreateOpen(false);
      setCreateName("");
      setCreateCategory("");
      setCreateDescription("");
      await loadDashboard();
    } catch (error: unknown) {
      toastError(getErrorDetail(error, "Create failed"));
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-page pb-6 overflow-hidden max-w-6xl mx-auto w-full">
      {/* ── 顶部横幅 ── */}
      <section className="flex-none rounded-card border border-border bg-surface p-4">
        <div className="mb-4">
          {daily.learned + daily.reviewed > 0 ? (
            <Alert variant="success">Checked in today — keep it up!</Alert>
          ) : (
            <Alert variant="warning">
              Not checked in today — start learning!
            </Alert>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <Display className="!text-display">My Wordbooks</Display>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSwitcherOpen(true)}
          >
            Switch
          </Button>
        </div>

        {/* 今日统计 + 操作按钮 — 同行：卡片 2/3，按钮 1/3 */}
        <div className="flex items-end justify-between">
          <div className="grid grid-cols-2 gap-3 max-w-lg flex-1">
            <StatsCard
              value={daily.learned}
              label="Learned today"
              bg="#3b82f6"
              shadowColor="#60a5fa"
              icon={<BookOpen className="size-8 text-white" />}
            />
            <StatsCard
              value={daily.reviewed}
              label="Reviewed today"
              bg="rgb(41,49,79)"
              shadowColor="rgb(244,67,54)"
              icon={<Pencil className="size-8 text-white" />}
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <TextSwapButton
              topText="Learn"
              bottomText="Spell"
              onClick={() =>
                selectedBook && navigate(`/spelling/${selectedBook.id}`)
              }
              disabled={!selectedBook}
            />
            <TextSwapButton
              topText="Review"
              bottomText="Test"
              onClick={() =>
                selectedBook && navigate(`/review/${selectedBook.id}`)
              }
              disabled={!selectedBook}
            />
          </div>
        </div>
      </section>

      {/* ── 切换词书弹窗 ── */}
      {switcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-2xl rounded-modal border border-border bg-surface shadow-modal p-5 animate-scale-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <H2>Switch Wordbook</H2>
                <BodySm className="mt-1">
                  Select a wordbook to browse its words.
                </BodySm>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSwitcherOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="mt-5 grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {visibleBooks.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => {
                    setSelectedBookId(book.id);
                    window.localStorage.setItem(
                      "selected-wordbook-id",
                      String(book.id),
                    );
                    setSwitcherOpen(false);
                  }}
                  className={`rounded-card border p-4 text-left transition-all hover:border-primary-300 ${
                    selectedBookId === book.id
                      ? "border-primary-400 bg-primary-50/50 shadow-card"
                      : "border-border bg-surface hover:bg-elevated"
                  }`}
                >
                  <p className="text-body font-semibold text-foreground">
                    {book.name}
                  </p>
                  <Caption className="mt-1">
                    {wordCounts[book.id] ?? 0} 词
                  </Caption>
                  {selectedBookId === book.id && (
                    <p className="mt-2 text-caption font-medium text-primary-500">
                      Selected
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 单词库卡片区 ── */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card border border-border bg-surface p-3">
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <H2>Library</H2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {/* 添加按钮 */}
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex aspect-[3/4] flex-col items-center justify-center rounded-card border-2 border-dashed border-border text-foreground-muted transition-all hover:border-primary-300 hover:text-primary-500 active:scale-[0.97]"
            >
              <span className="text-display font-light">+</span>
              <Caption className="mt-1">Add</Caption>
            </button>

            {/* 单词本卡片 */}
            {visibleBooks.map((book) => {
              const owned = isOwnedBook(book);
              return (
                <BurstWordbookCard
                  key={book.id}
                  book={book}
                  wordCount={wordCounts[book.id] ?? 0}
                  currentUserId={currentUserId}
                  badge={owned ? undefined : "Imported"}
                  onClick={() => navigate(`/wordbooks/${book.id}`)}
                  actions={[
                    ...(owned
                      ? [
                          {
                            label: "Edit",
                            icon: <Pencil className="size-3.5" />,
                            onClick: () => openEdit(book),
                          },
                        ]
                      : []),
                    {
                      label: "Delete",
                      icon: <Trash2 className="size-3.5" />,
                      onClick: () => setDeleteTarget(book),
                      destructive: true,
                    },
                  ]}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 编辑弹窗 ── */}
      {editBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-modal border border-border bg-surface p-5 shadow-modal animate-scale-in">
            <h4 className="text-subheading font-semibold text-foreground">
              Edit Wordbook
            </h4>
            <BodySm className="mt-1">修改名称、分类和描述后保存。</BodySm>

            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-ui border border-border bg-background px-3 py-2 text-body focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20 outline-none transition"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
              />
              <input
                className="w-full rounded-ui border border-border bg-background px-3 py-2 text-body-sm focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20 outline-none transition"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Category (e.g. CET4)"
              />
              <textarea
                className="w-full rounded-ui border border-border bg-background px-3 py-2 text-body-sm focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20 outline-none transition"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-[#ddd] border-0 hover:bg-[#c5c5c5] text-[rgb(27,27,27)]"
                onClick={() => setEditBook(null)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={submitEdit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 删除确认弹窗 ── */}
      {deleteTarget && (
        <div
          className="fixed 
        inset-0 
        z-50 flex 
        items-center 
        justify-center
         bg-black/35 p-4"
        >
          <div
            className="w-[380px] rounded-[20px] bg-white flex flex-col gap-2 
                      px-6 py-10 
          relative shadow-[20px_20px_30px_rgba(0,0,0,0.068)]"
          >
            {/* 内容 */}
            <div className="w-full flex flex-col gap-[5px] mb-4">
              <p className="text-[20px] font-bold text-[rgb(27,27,27)]">
                Delete this wordbook?
              </p>
              <p className="font-thin text-[rgb(102,102,102)] text-body-sm">
                This action cannot be undone. This will delete "
                {deleteTarget.name}" and all its words.
              </p>
            </div>

            {/* 按钮 */}
            <div className="w-full flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg bg-[#ddd] border-0 hover:bg-[#c5c5c5] text-[rgb(27,27,27)] px-4"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 rounded-lg px-4"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 创建单词本弹窗 ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-modal border border-border bg-surface p-5 shadow-modal animate-scale-in">
            <h4 className="text-subheading font-semibold text-foreground">
              Create Wordbook
            </h4>
            <BodySm className="mt-1">
              Create a new wordbook to start learning.
            </BodySm>

            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-ui border border-border bg-background px-3 py-2 text-body focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20 outline-none transition"
                placeholder="Name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
              <input
                className="w-full rounded-ui border border-border bg-background px-3 py-2 text-body-sm focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20 outline-none transition"
                placeholder="Category (e.g. CET4)"
                value={createCategory}
                onChange={(e) => setCreateCategory(e.target.value)}
              />
              <textarea
                className="w-full rounded-ui border border-border bg-background px-3 py-2 text-body-sm focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20 outline-none transition"
                rows={3}
                placeholder="Description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-[#ddd] border-0 hover:bg-[#c5c5c5] text-[rgb(27,27,27)]"
                onClick={() => {
                  setCreateOpen(false);
                  setCreateName("");
                  setCreateCategory("");
                  setCreateDescription("");
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={submitCreate} loading={createLoading}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardView;
