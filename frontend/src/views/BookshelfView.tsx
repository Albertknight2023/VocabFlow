import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  deleteWordbookApi,
  getMarketplaceWordbooksApi,
  getWordbooksApi,
  publishWordbookApi,
  subscribeSystemWordbookApi,
  subscribeWordbookApi,
  unpublishWordbookApi,
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
  is_published: boolean;
  owner_id?: number | null;
}

function BookshelfView() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Wordbook[]>([]);
  const [marketBooks, setMarketBooks] = useState<Wordbook[]>([]);
  const [wordCounts, setWordCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
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

  const libraryBookIds = useMemo(
    () => new Set(books.map((book) => book.id)),
    [books],
  );

  const load = async () => {
    const [{ data }, { data: marketData }] = await Promise.all([
      getWordbooksApi(),
      getMarketplaceWordbooksApi(),
    ]);

    setBooks(data);
    setMarketBooks(marketData);

    const entries = await Promise.all(
      data.map(async (book: Wordbook) => {
        const wordsRes = await getWordsByWordbookApi(book.id);
        return [book.id, wordsRes.data.length] as const;
      }),
    );
    setWordCounts(Object.fromEntries(entries));
  };

  useEffect(() => {
    load()
      .catch(() => toast.error("加载词书失败"))
      .finally(() => setLoading(false));
  }, []);

  const totalUploadedWords = useMemo(
    () => Object.values(wordCounts).reduce((sum, c) => sum + c, 0),
    [wordCounts],
  );

  const isOwnedBook = (book: Wordbook) => book.owner_id === currentUserId;

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
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "更新失败");
    }
  };

  const deleteBook = async (book: Wordbook) => {
    try {
      await deleteWordbookApi(book.id);
      toast.success("单词本已删除");
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "删除失败");
    }
  };

  const toggleMarketBook = async (book: Wordbook) => {
    try {
      if (libraryBookIds.has(book.id)) {
        await unsubscribeWordbookApi(book.id);
        toast.success(`已从我的单词本移除 ${book.name}`);
      } else {
        if (book.is_system) {
          await subscribeSystemWordbookApi(book.id);
        } else {
          await subscribeWordbookApi(book.id);
        }
        toast.success(`已导入 ${book.name}`);
      }
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "导入失败");
    }
  };

  const togglePublishBook = async (book: Wordbook) => {
    try {
      if (book.is_published) {
        await unpublishWordbookApi(book.id);
        toast.success(`已下架 ${book.name}`);
      } else {
        await publishWordbookApi(book.id);
        toast.success(`已上传 ${book.name}`);
      }
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "操作失败");
    }
  };

  return (
    <div className="space-y-4 px-2 py-2 sm:px-3 md:px-4">
      <section className="rounded-2xl border border-zinc-200 bg-white/95 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            我的单词本
          </h2>
          <div className="text-sm text-zinc-500">
            {loading ? "..." : `${books.length} 本 · ${totalUploadedWords} 词`}
          </div>
        </div>
        <p className="mb-4 text-xs text-zinc-500">
          这里包含我创建的词书和从广场导入的词书；只有上传后的词书才会出现在广场里。
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <button
            type="button"
            onClick={() => navigate("/wordbooks")}
            className="flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 transition hover:bg-zinc-100"
          >
            <div className="text-3xl">+</div>
            <div className="mt-2 text-sm">添加词书</div>
          </button>

          {books.map((book) => {
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

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="flex-shrink-0">
                      <h3 className="line-clamp-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                        {book.name}
                      </h3>
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex-shrink-0 flex items-end justify-between">
                      <div className="ml-auto text-right">
                        <div className={`text-lg font-bold ${color.textColor}`}>
                          {wordCounts[book.id] ?? 0}词
                        </div>
                        {book.is_published ? (
                          <div
                            className={`mt-1 text-[11px] ${color.textColor} opacity-80`}
                          >
                            已上传
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
                          aria-label={
                            book.is_published ? "下架词书" : "上传词书"
                          }
                          title={book.is_published ? "下架词书" : "上传词书"}
                          className="rounded-full p-2 text-zinc-800 transition hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePublishBook(book);
                          }}
                        >
                          <Upload className="h-4 w-4" />
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
                        className="rounded-full p-2 text-red-600 transition hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMarketBook(book);
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
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white/95 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            词书广场
          </h2>
          <div className="text-sm text-zinc-500">
            导入后会自动进入我的单词本
          </div>
        </div>

        <div className="max-h-[56vh] overflow-y-auto pr-1 pb-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {marketBooks.map((book) => {
              const subscribed = libraryBookIds.has(book.id);
              const owned = isOwnedBook(book);
              const color = getWordbookColor({
                name: book.name,
                category: book.category,
                is_system: book.is_system,
                owner_id: book.owner_id,
                currentUserId,
              });
              const IconComponent = color.icon;

              return (
                <div
                  key={book.id}
                  className={`relative aspect-[3/4] overflow-hidden rounded-2xl ${color.borderColor} border-[3px] ${color.solidBg} p-4 text-left ${color.textColor} shadow-lg transition hover:shadow-xl`}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="flex-shrink-0 pr-2">
                      <h3 className="line-clamp-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                        {book.name}
                      </h3>
                    </div>

                    <div className="flex-1 overflow-hidden py-2">
                      <p
                        className={`line-clamp-2 text-xs leading-relaxed ${color.textColor} opacity-90`}
                      >
                        {book.description || "专业词表"}
                      </p>
                      <div
                        className={`mt-2 text-[11px] ${color.textColor} opacity-75`}
                      >
                        {book.is_system
                          ? "官方词书"
                          : owned
                            ? "我的词书"
                            : "用户词书"}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-end justify-end gap-2">
                      <Button
                        size="sm"
                        className="relative z-20 h-7 flex-1 border-white/40 bg-white/90 text-xs text-zinc-900 hover:bg-white"
                        onClick={() =>
                          owned
                            ? togglePublishBook(book)
                            : toggleMarketBook(book)
                        }
                      >
                        {owned
                          ? book.is_published
                            ? "下架"
                            : "上传"
                          : subscribed
                            ? "移除"
                            : "导入"}
                      </Button>
                    </div>
                  </div>

                  <IconComponent
                    className={`pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 ${color.iconColor} opacity-85`}
                  />
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

export default BookshelfView;
