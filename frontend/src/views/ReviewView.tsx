import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getReviewQueueApi, recordProgressApi } from "../api/learning";
import { Button } from "../components/ui/Button";

interface Word {
  id: number;
  text: string;
  meaning: string;
  phonetic?: string;
  example?: string;
}

function ReviewView() {
  const navigate = useNavigate();
  const { wordbookId } = useParams();
  const id = Number(wordbookId);

  const [words, setWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const current = useMemo(() => words[idx], [words, idx]);

  useEffect(() => {
    if (!id) return;
    getReviewQueueApi(id)
      .then((res) => setWords(res.data))
      .catch((err) =>
        toast.error(err.response?.data?.detail || "加载复习队列失败"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const mark = async (
    status: "mastered" | "reviewing" | "new",
    isCorrect: boolean,
  ) => {
    if (!current) return;
    setSubmitting(true);
    try {
      try {
        await recordProgressApi(current.id, status, isCorrect);
      } catch {
        if (import.meta.env.DEV) {
          toast.warning("进度保存失败（后端接口异常），已继续下一题");
        }
      }
      if (idx < words.length - 1) {
        setIdx(idx + 1);
      } else {
        toast.success("复习完成");
        navigate("/wordbooks");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-10 text-center">加载中...</div>;
  if (!words.length)
    return <div className="py-10 text-center">当前无到期复习单词</div>;

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">复习模式</h2>
        <Button onClick={() => navigate("/wordbooks")}>返回单词本</Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="text-sm text-gray-500">
          进度：{idx + 1} / {words.length}
        </div>
        <div>
          <div className="text-2xl font-bold">{current.text}</div>
          <div className="text-sm text-gray-600">{current.phonetic || ""}</div>
          <div className="mt-3 text-lg">{current.meaning}</div>
          {current.example ? (
            <div className="mt-2 text-sm text-gray-500">
              例句：{current.example}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button disabled={submitting} onClick={() => mark("mastered", true)}>
            已掌握
          </Button>
          <Button
            disabled={submitting}
            onClick={() => mark("reviewing", false)}
          >
            未掌握
          </Button>
          <Button disabled={submitting} onClick={() => mark("new", false)}>
            重置为新词
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReviewView;
