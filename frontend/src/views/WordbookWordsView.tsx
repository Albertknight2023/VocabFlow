import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { getWordbookApi } from "../api/wordbooks";
import {
  createWordApi,
  deleteWordApi,
  previewWordApi,
  getWordsByWordbookApi,
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
}

interface WordPreview {
  text: string;
  meaning: string;
  part_of_speech?: string;
  phonetic?: string;
  english_definition: string;
  example?: string;
}

function WordbookWordsView() {
  const { wordbookId } = useParams();
  const parsedId = Number(wordbookId);

  const [book, setBook] = useState<Wordbook | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [wordText, setWordText] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [addingWord, setAddingWord] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewData, setPreviewData] = useState<WordPreview | null>(null);

  const goHome = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    if (!parsedId) return;

    const load = async () => {
      try {
        const [bookRes, wordsRes] = await Promise.all([
          getWordbookApi(parsedId),
          getWordsByWordbookApi(parsedId),
        ]);
        setBook(bookRes.data);
        setWords(wordsRes.data);
      } catch {
        toast.error("加载单词本失败");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [parsedId]);

  const reloadWords = async () => {
    const { data } = await getWordsByWordbookApi(parsedId);
    setWords(data);
  };

  const submitPreview = async () => {
    if (!wordText.trim()) return;
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const { data } = await previewWordApi(wordText);
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
    if (!previewData) return;
    setAddingWord(true);
    try {
      const { data } = await createWordApi(parsedId, {
        text: previewData.text,
        part_of_speech: previewData.part_of_speech,
        phonetic: previewData.phonetic,
        meaning: previewData.meaning,
        english_definition:
          previewData.english_definition || previewData.example,
      });
      setWords((prev) => {
        if (prev.some((item) => item.id === data.id)) {
          return prev;
        }
        return [data, ...prev];
      });
      setWordText("");
      setPreviewOpen(false);
      setPreviewData(null);
      setPreviewError("");
      toast.success("单词已添加");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "添加失败");
    } finally {
      setAddingWord(false);
    }
  };

  const removeWord = async (wordId: number) => {
    try {
      await deleteWordApi(wordId);
      toast.success("单词已删除");
      await reloadWords();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "删除失败");
    }
  };

  if (!parsedId) {
    return <div className="text-sm text-zinc-500">单词本参数无效</div>;
  }

  return (
    <div className="flex min-h-[calc(100dvh-7.5rem)] max-h-[calc(100dvh-7.5rem)] flex-col gap-5 overflow-hidden py-2">
      <section className="rounded-2xl border border-zinc-200 bg-white/95 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              {book?.name || "单词本"}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {loading ? "加载中..." : `${words.length} 个单词`}
              {book?.description ? ` · ${book.description}` : ""}
            </p>
          </div>
          <Button size="sm" onClick={goHome}>
            返回主页
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white/95 p-5 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          添加单词
        </h2>
        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            className="h-10 rounded-lg border border-zinc-300 px-3"
            placeholder="只输入英文单词，例如 abandon"
            value={wordText}
            onChange={(e) => setWordText(e.target.value)}
          />
          <Button
            className="h-10 px-5 text-sm"
            onClick={submitPreview}
            disabled={previewLoading}
          >
            {previewLoading ? "搜索中..." : "搜索"}
          </Button>
        </div>
        {previewError ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {previewError}
          </div>
        ) : null}
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-200 bg-white/95 p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            当前词书单词
          </h2>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {!loading && words.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
              这个单词本还没有单词，先添加一个。
            </div>
          ) : null}

          {words.map((word) => (
            <div
              key={word.id}
              className="flex items-start justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
            >
              <div>
                <div className="text-lg font-semibold text-zinc-900">
                  {word.text}
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-700">
                  {word.meaning}
                </div>
              </div>
              <Button size="sm" onClick={() => removeWord(word.id)}>
                删除
              </Button>
            </div>
          ))}
        </div>
      </section>

      {previewOpen && previewData ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
            <h4 className="text-lg font-semibold">确认联网补全结果</h4>
            <p className="mt-1 text-sm text-gray-600">
              确认后将把以下信息添加到当前词书。
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
                  中文翻译
                </div>
                <div className="mt-1 text-gray-800">{previewData.meaning}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  英文释义
                </div>
                <div className="mt-1 text-gray-800">
                  {previewData.english_definition ||
                    previewData.example ||
                    "未找到英文释义"}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setPreviewOpen(false);
                  setPreviewData(null);
                  setPreviewError("");
                }}
              >
                取消
              </Button>
              <Button size="sm" onClick={confirmAddWord} disabled={addingWord}>
                {addingWord ? "添加中..." : "确认添加"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default WordbookWordsView;
