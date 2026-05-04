import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  getLearningCardsApi,
  recordProgressApi,
  spellingCheckApi,
} from "../api/learning";
import { Button } from "../components/ui/Button";

interface Word {
  id: number;
  text: string;
  meaning: string;
  phonetic?: string;
}

function SpellingView() {
  const navigate = useNavigate();
  const { wordbookId } = useParams();
  const id = Number(wordbookId);

  const [words, setWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<string>("");

  const current = useMemo(() => words[idx], [words, idx]);

  useEffect(() => {
    if (!id) return;
    getLearningCardsApi(id)
      .then((res) => setWords(res.data))
      .catch((err) => toast.error(err.response?.data?.detail || "加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  const check = async () => {
    if (!current || !input.trim()) return;
    setChecking(true);
    try {
      const { data } = await spellingCheckApi(current.id, input);
      try {
        await recordProgressApi(
          current.id,
          data.correct ? "mastered" : "reviewing",
          data.correct,
        );
      } catch {
        if (import.meta.env.DEV) {
          toast.warning("进度保存失败（后端接口异常），但本次拼写结果已给出");
        }
      }
      setResult(data.correct ? "正确" : `错误，正确拼写：${data.expected}`);
      if (data.correct) {
        toast.success("拼写正确");
      } else {
        toast.error("拼写错误");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "检查失败");
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    if (idx < words.length - 1) {
      setIdx(idx + 1);
      setInput("");
      setResult("");
      return;
    }
    toast.success("本轮拼写完成");
    navigate("/wordbooks");
  };

  if (loading) return <div className="py-10 text-center">加载中...</div>;
  if (!words.length)
    return <div className="py-10 text-center">该单词本暂无单词</div>;

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">拼写练习</h2>
        <Button onClick={() => navigate("/wordbooks")}>返回单词本</Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="text-sm text-gray-500">
          进度：{idx + 1} / {words.length}
        </div>
        <div>
          <div className="text-sm text-gray-500">根据中文释义拼写单词：</div>
          <div className="mt-1 text-2xl font-bold">{current.meaning}</div>
          {current.phonetic ? (
            <div className="text-sm text-gray-500">{current.phonetic}</div>
          ) : null}
        </div>

        <input
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
          placeholder="输入英文单词"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
        />

        {result ? <div className="text-sm font-medium">{result}</div> : null}

        <div className="flex gap-2">
          <Button onClick={check} disabled={checking}>
            {checking ? "检查中..." : "检查"}
          </Button>
          <Button onClick={next}>下一个</Button>
        </div>
      </div>
    </div>
  );
}

export default SpellingView;
