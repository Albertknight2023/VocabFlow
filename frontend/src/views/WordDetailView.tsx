import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getWordbookApi } from "../api/wordbooks";
import { getWordsByWordbookApi } from "../api/words";
import { Button } from "../components/ui/Button";

interface Wordbook {
  id: number;
  name: string;
}

interface Word {
  id: number;
  text: string;
  meaning: string;
  part_of_speech?: string;
  example?: string;
  phonetic?: string;
}

function WordDetailView() {
  const navigate = useNavigate();
  const { wordbookId, wordId } = useParams();
  const parsedBookId = Number(wordbookId);
  const parsedWordId = Number(wordId);

  const [book, setBook] = useState<Wordbook | null>(null);
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parsedBookId || !parsedWordId) return;

    const load = async () => {
      try {
        const [bookRes, wordsRes] = await Promise.all([
          getWordbookApi(parsedBookId),
          getWordsByWordbookApi(parsedBookId),
        ]);
        setBook(bookRes.data);

        const matched = (wordsRes.data as Word[]).find(
          (item) => item.id === parsedWordId,
        );
        if (!matched) {
          toast.error("未找到该单词");
          navigate(`/wordbooks/${parsedBookId}`);
          return;
        }

        setWord(matched);
      } catch {
        toast.error("加载单词详情失败");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, parsedBookId, parsedWordId]);

  if (!parsedBookId || !parsedWordId) {
    return <div className="text-sm text-zinc-500">单词参数无效</div>;
  }

  return (
    <div className="space-y-5 py-2">
      <section className="rounded-2xl border border-zinc-200 bg-white/95 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.25em] text-zinc-400">
              WORD DETAIL
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              {loading ? "加载中..." : word?.text || "单词详情"}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {book?.name || "单词本"}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/wordbooks/${parsedBookId}`)}
          >
            返回单词列表
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {word ? (
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                单词
              </div>
              <div className="mt-1 text-3xl font-bold text-zinc-900">
                {word.text}
              </div>
              {word.phonetic ? (
                <div className="mt-1 text-sm text-zinc-500">
                  {word.phonetic}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                释义
              </div>
              <div className="mt-2 text-base leading-7 text-zinc-800">
                {word.meaning}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  词性
                </div>
                <div className="mt-2 text-zinc-800">
                  {word.part_of_speech || "未设置"}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  英文释义
                </div>
                <div className="mt-2 text-zinc-800">
                  {word.example || "未设置"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-500">暂无详情</div>
        )}
      </section>
    </div>
  );
}

export default WordDetailView;
