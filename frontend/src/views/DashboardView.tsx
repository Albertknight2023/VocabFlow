import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteWordbookApi,
  getWordbooksApi,
  unsubscribeWordbookApi,
  updateWordbookApi,
} from "../api/wordbooks";
import { getWordsByWordbookApi } from "../api/words";
import { Button } from "../components/ui/Button";
import { getWordbookColor } from "../utils/wordbook-colors";

interface Wordbook {
  id: number;
  name: string;
  description?: string;
  category?: string;
  is_system: boolean;
  owner_id?: number | null;
}

function DashboardView() {
  const navigate = useNavigate();
  const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
  const [wordCounts, setWordCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [renameBook, setRenameBook] = useState<Wordbook | null>(null);
  const [renameValue, setRenameValue] = useState("");
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
        const wordsRes = await getWordsByWordbookApi(book.id);
        return [book.id, wordsRes.data.length] as const;
      }),
    );
    setWordCounts(Object.fromEntries(wordsEntries));
  };

  useEffect(() => {
    loadDashboard()
      .catch(() => toast.error("加载首页数据失败"))
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
    const myBook = visibleBooks.find((book) => book.name === "我的单词本");
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

  const startRename = (book: Wordbook) => {
    setRenameBook(book);
    setRenameValue(book.name);
  };

  const submitRename = async () => {
    if (!renameBook || !renameValue.trim()) return;
    try {
      await updateWordbookApi(renameBook.id, { name: renameValue.trim() });
      toast.success("单词本名称已更新");
      setRenameBook(null);
      await loadDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "更新失败");
    }
  };

  const deleteBook = async (book: Wordbook) => {
    try {
      await deleteWordbookApi(book.id);
      toast.success("单词本已删除");
      await loadDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "删除失败");
    }
  };

  const removeImportedBook = async (book: Wordbook) => {
    try {
      await unsubscribeWordbookApi(book.id);
      toast.success(`已从我的单词本移除 ${book.name}`);
      await loadDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "移除失败");
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-7.5rem)] max-h-[calc(100dvh-7.5rem)] flex-col gap-5 overflow-hidden py-2">
      <section className="rounded-2xl border border-zinc-200 bg-white/95 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-zinc-500">今日未打卡</div>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight text-zinc-900">
              我的单词本
            </h1>
          </div>
          <Button size="sm" onClick={() => setSwitcherOpen(true)}>
            切换词书
          </Button>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs tracking-[0.24em] text-zinc-400">
                当前词书
              </div>
              <div className="mt-1 text-xl font-semibold text-zinc-900">
                {selectedBook?.name || "我的单词本"}
              </div>
            </div>
            <div className="text-sm text-zinc-500">
              {loading ? "..." : `${selectedBookWords} 词`}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                selectedBook && navigate(`/spelling/${selectedBook.id}`)
              }
              className="rounded-full bg-[#ff4d4f] px-6 py-3 text-lg font-semibold text-white transition hover:brightness-95"
              disabled={!selectedBook}
            >
              学习
            </button>
            <button
              type="button"
              onClick={() =>
                selectedBook && navigate(`/review/${selectedBook.id}`)
              }
              className="rounded-full bg-[#2f56e8] px-6 py-3 text-lg font-semibold text-white transition hover:brightness-95"
              disabled={!selectedBook}
            >
              复习
            </button>
          </div>
        </div>
      </section>

      {switcherOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  切换词书
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  选择一个单词本，进入对应的单词列表。
                </p>
              </div>
              <Button size="sm" onClick={() => setSwitcherOpen(false)}>
                关闭
              </Button>
            </div>

            <div className="mt-5 grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {visibleBooks.map((book: Wordbook) => (
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
                  className={`rounded-2xl border p-4 text-left transition hover:border-zinc-300 hover:bg-white ${
                    selectedBookId === book.id
                      ? "border-[#2f56e8] bg-white shadow-sm"
                      : "border-zinc-200 bg-zinc-50"
                  }`}
                >
                  <div className="text-lg font-semibold text-zinc-900">
                    {book.name}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">
                    {wordCounts[book.id] ?? 0} 词
                  </div>
                  {selectedBookId === book.id ? (
                    <div className="mt-2 text-xs font-medium text-[#2f56e8]">
                      当前选中
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-200 bg-white/95 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            单词本
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            <button
              type="button"
              onClick={() => navigate("/wordbooks")}
              className="flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 transition hover:bg-zinc-100"
            >
              <div className="text-3xl">+</div>
              <div className="mt-2 text-sm">添加单词本</div>
            </button>

            {visibleBooks.map((book) => {
              const color = getWordbookColor({
                name: book.name,
                category: book.category,
                is_system: book.is_system,
                owner_id: book.owner_id,
                currentUserId,
              });
              const IconComponent = color.icon;
              return (
                <div key={book.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => navigate(`/wordbooks/${book.id}`)}
                    className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl ${color.borderColor} border-[3px] ${color.solidBg} p-4 text-left ${color.textColor} shadow-lg transition-[transform,box-shadow,filter] hover:-translate-y-1 hover:shadow-xl hover:saturate-150 hover:brightness-95`}
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>

                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex-shrink-0">
                        <h3 className="text-2xl font-black leading-tight tracking-tight line-clamp-2 sm:text-3xl">
                          {book.name}
                        </h3>
                      </div>

                      <div className="flex-1"></div>

                      <div className="flex-shrink-0 flex items-end justify-between">
                        <div className="ml-auto text-right">
                          <div
                            className={`text-lg font-bold ${color.textColor}`}
                          >
                            {wordCounts[book.id] ?? 0}词
                          </div>
                          {!isOwnedBook(book) ? (
                            <div
                              className={`mt-1 text-[11px] ${color.textColor} opacity-80`}
                            >
                              已导入
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <IconComponent
                      className={`pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 ${color.iconColor} opacity-85`}
                    />
                  </button>

                  <div className="pointer-events-none absolute inset-x-3 top-2 z-30 flex justify-center opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/85 p-1 shadow-lg backdrop-blur">
                      {isOwnedBook(book) ? (
                        <>
                          <button
                            type="button"
                            aria-label="编辑单词本"
                            title="编辑单词本"
                            className="rounded-full p-2 text-zinc-800 transition hover:bg-white"
                            onClick={() => navigate(`/wordbooks/${book.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="重命名单词本"
                            title="重命名单词本"
                            className="rounded-full p-2 text-zinc-800 transition hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(book);
                            }}
                          >
                            <PenLine className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="删除单词本"
                            title="删除单词本"
                            className="rounded-full p-2 text-red-600 transition hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  `确定删除单词本「${book.name}」吗？`,
                                )
                              ) {
                                deleteBook(book);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          aria-label="从我的单词本移除"
                          title="从我的单词本移除"
                          className="rounded-full p-2 text-zinc-800 transition hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImportedBook(book);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {renameBook ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg">
            <h4 className="text-lg font-semibold text-zinc-900">
              编辑单词本名字
            </h4>
            <p className="mt-1 text-sm text-zinc-500">修改后会立即生效。</p>

            <input
              className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="输入新的单词本名称"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button size="sm" onClick={() => setRenameBook(null)}>
                取消
              </Button>
              <Button size="sm" onClick={submitRename}>
                保存
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DashboardView;
