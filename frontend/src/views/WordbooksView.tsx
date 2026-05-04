import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createWordbookApi,
  deleteWordbookApi,
  getSystemWordbooksApi,
  getWordbooksApi,
  subscribeSystemWordbookApi,
  unsubscribeSystemWordbookApi,
  updateWordbookApi,
} from "../api/wordbooks";
import {
  createWordApi,
  deleteWordApi,
  getWordsByWordbookApi,
  previewWordApi,
} from "../api/words";
import { Button } from "../components/ui/Button";

interface Wordbook {
  id: number;
  name: string;
  description?: string;
  category?: string;
  is_system: boolean;
}

interface Word {
  id: number;
  text: string;
  meaning: string;
  part_of_speech?: string;
  phonetic?: string;
}

interface WordPreview {
  text: string;
  meaning: string;
  part_of_speech?: string;
  phonetic?: string;
  example?: string;
}

function WordbooksView() {
  const navigate = useNavigate();
  const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
  const [systemWordbooks, setSystemWordbooks] = useState<Wordbook[]>([]);
  const [wordsMap, setWordsMap] = useState<Record<number, Word[]>>({});

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewWordbookId, setPreviewWordbookId] = useState<number | null>(
    null,
  );
  const [previewData, setPreviewData] = useState<WordPreview | null>(null);

  const [wordForm, setWordForm] = useState<
    Record<
      number,
      {
        text: string;
      }
    >
  >({});

  const subscribedSystemIds = useMemo(
    () => new Set(wordbooks.filter((b) => b.is_system).map((b) => b.id)),
    [wordbooks],
  );

  const loadWordbooks = async () => {
    const [myRes, systemRes] = await Promise.all([
      getWordbooksApi(),
      getSystemWordbooksApi(),
    ]);
    setWordbooks(myRes.data);
    setSystemWordbooks(systemRes.data);

    const entries = await Promise.all(
      myRes.data.map(async (book: Wordbook) => {
        const wordsRes = await getWordsByWordbookApi(book.id);
        return [book.id, wordsRes.data] as const;
      }),
    );
    setWordsMap(Object.fromEntries(entries));
  };

  useEffect(() => {
    loadWordbooks().catch(() => toast.error("加载单词本失败"));
  }, []);

  const addWordbook = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createWordbookApi({ name, description, category });
      setName("");
      setDescription("");
      setCategory("");
      toast.success("单词本创建成功");
      await loadWordbooks();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "创建失败");
    } finally {
      setLoading(false);
    }
  };

  const removeBook = async (book: Wordbook) => {
    try {
      await deleteWordbookApi(book.id);
      toast.success("单词本已删除");
      await loadWordbooks();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "删除失败");
    }
  };

  const toggleSystem = async (book: Wordbook) => {
    try {
      if (subscribedSystemIds.has(book.id)) {
        await unsubscribeSystemWordbookApi(book.id);
        toast.success(`已移除 ${book.name}`);
      } else {
        await subscribeSystemWordbookApi(book.id);
        toast.success(`已添加 ${book.name}`);
      }
      await loadWordbooks();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "操作失败");
    }
  };

  const openEditBook = (book: Wordbook) => {
    setEditingId(book.id);
    setEditName(book.name || "");
    setEditDescription(book.description || "");
    setEditCategory(book.category || "");
    setEditOpen(true);
  };

  const submitEditBook = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      await updateWordbookApi(editingId, {
        name: editName,
        description: editDescription,
        category: editCategory,
      });
      toast.success("已更新");
      setEditOpen(false);
      await loadWordbooks();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "更新失败");
    }
  };

  const addWord = async (wordbookId: number) => {
    const cur = wordForm[wordbookId] || {
      text: "",
    };
    if (!cur.text.trim()) return;

    setPreviewLoading(true);
    setPreviewError("");
    setPreviewWordbookId(wordbookId);

    try {
      const { data } = await previewWordApi(cur.text);
      setPreviewError("");
      setPreviewData(data);
      setPreviewOpen(true);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "预览失败";
      setPreviewError(detail);
      toast.error(detail);
    } finally {
      setPreviewLoading(false);
    }
  };

  const confirmAddWord = async () => {
    if (!previewWordbookId || !previewData) return;

    try {
      await createWordApi(previewWordbookId, {
        text: previewData.text,
      });
      setWordForm((prev) => ({
        ...prev,
        [previewWordbookId]: { text: "" },
      }));
      setPreviewOpen(false);
      setPreviewData(null);
      setPreviewError("");
      setPreviewWordbookId(null);
      toast.success("单词已添加");
      await loadWordbooks();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "添加单词失败");
    }
  };

  const removeWord = async (wordId: number) => {
    try {
      await deleteWordApi(wordId);
      toast.success("单词已删除");
      await loadWordbooks();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "删除单词失败");
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">单词本管理</h2>
          <p className="text-sm text-gray-600">创建、编辑并组织你的学习词本</p>
        </div>
        <Button className="rounded-xl" onClick={() => navigate(-1)}>
          返回
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-lg font-semibold">创建单词本</h3>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="分类（如 CET4）"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="描述"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button className="w-full" onClick={addWordbook} disabled={loading}>
            {loading ? "创建中..." : "新建词本"}
          </Button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-lg font-semibold">系统单词本</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {systemWordbooks.map((book) => {
              const subscribed = subscribedSystemIds.has(book.id);
              return (
                <div
                  key={book.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{book.name}</div>
                    <Button size="sm" onClick={() => toggleSystem(book)}>
                      {subscribed ? "移除" : "添加"}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {book.description || "暂无描述"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">我的单词本</h3>
        {wordbooks.filter((b) => !b.is_system).length === 0 ? (
          <p className="text-sm text-gray-600">暂无单词本，先创建一个。</p>
        ) : (
          <div className="space-y-5">
            {wordbooks
              .filter((b) => !b.is_system)
              .map((book) => {
                const form = wordForm[book.id] || {
                  text: "",
                };
                return (
                  <div
                    key={book.id}
                    className="rounded-xl border border-gray-200 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-semibold">{book.name}</h4>
                        <p className="text-sm text-gray-600">
                          {book.description || "暂无描述"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openEditBook(book)}>
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/spelling/${book.id}`)}
                        >
                          拼写
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/review/${book.id}`)}
                        >
                          复习
                        </Button>
                        <Button size="sm" onClick={() => removeBook(book)}>
                          删除
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                      <input
                        className="rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="只输入英文单词，例如 apple"
                        value={form.text}
                        onChange={(e) =>
                          setWordForm((p) => ({
                            ...p,
                            [book.id]: { text: e.target.value },
                          }))
                        }
                      />
                      <Button size="sm" onClick={() => addWord(book.id)}>
                        {previewLoading && previewWordbookId === book.id
                          ? "联网补全中..."
                          : "联网补全添加"}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      系统会联网补全中文释义、词性和例句，纯数字或无效英文会直接拒绝。
                    </div>

                    <div className="space-y-2">
                      {(wordsMap[book.id] || []).map((word) => (
                        <div
                          key={word.id}
                          className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                        >
                          <div>
                            <div className="font-medium">
                              {word.text}{" "}
                              {word.phonetic ? (
                                <span className="text-sm text-gray-500">
                                  {word.phonetic}
                                </span>
                              ) : null}
                            </div>
                            {word.part_of_speech ? (
                              <div className="text-xs text-gray-500">
                                词性：{word.part_of_speech}
                              </div>
                            ) : null}
                            <div className="text-sm text-gray-600">
                              {word.meaning}
                            </div>
                          </div>
                          <Button size="sm" onClick={() => removeWord(word.id)}>
                            删除
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
            <h4 className="text-lg font-semibold">编辑单词本</h4>
            <p className="mt-1 text-sm text-gray-600">
              修改名称、分类和描述后保存。
            </p>

            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="名称"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="分类（如 CET4）"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                rows={4}
                placeholder="描述"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button size="sm" onClick={() => setEditOpen(false)}>
                取消
              </Button>
              <Button size="sm" onClick={submitEditBook}>
                保存
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {previewOpen && previewData ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
            <h4 className="text-lg font-semibold">确认联网补全结果</h4>
            <p className="mt-1 text-sm text-gray-600">
              确认后将把以下信息添加到当前单词本。
            </p>

            <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  单词
                </div>
                <div className="mt-1 text-xl font-semibold text-gray-900">
                  {previewData.text}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  词性
                </div>
                <div className="mt-1 text-gray-800">
                  {previewData.part_of_speech || "未找到"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  释义
                </div>
                <div className="mt-1 text-gray-800">{previewData.meaning}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  例句
                </div>
                <div className="mt-1 text-gray-800">
                  {previewData.example || "未找到例句"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  音标
                </div>
                <div className="mt-1 text-gray-800">
                  {previewData.phonetic || "未找到音标"}
                </div>
              </div>
            </div>

            {previewError ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {previewError}
              </div>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setPreviewOpen(false);
                  setPreviewData(null);
                  setPreviewError("");
                  setPreviewWordbookId(null);
                }}
              >
                取消
              </Button>
              <Button size="sm" onClick={confirmAddWord}>
                确认添加
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default WordbooksView;
