import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toastSuccess, toastError, toastWarning } from "../lib/toast";
import { getReviewQueueApi, recordProgressApi } from "../api/learning";
import { incrementReviewed } from "../stores/dailyProgress";
import { Button } from "../components/ui/Button";
import { PageShell, PageShellHeader, PageShellContent } from "../components/ui/PageShell";
import { WordCard } from "../components/WordCard";
import { BodySm } from "../components/ui/Typography";

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
      .catch((err) => toastError(err.response?.data?.detail || "加载复习队列失败"))
      .finally(() => setLoading(false));
  }, [id]);

  const mark = async (status: "mastered" | "reviewing" | "new", isCorrect: boolean) => {
    if (!current) return;
    setSubmitting(true);
    try {
      try {
        await recordProgressApi(current.id, status, isCorrect);
      } catch {
        if (import.meta.env.DEV) {
          toastWarning("进度保存失败（后端接口异常），已继续下一题");
        }
      }
      incrementReviewed(id);
      if (idx < words.length - 1) {
        setIdx(idx + 1);
      } else {
        toastSuccess("复习完成！");
        navigate("/");
      }
    } catch (err: any) {
      toastError(err.response?.data?.detail || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const prev = () => {
    if (idx <= 0) return;
    setIdx(idx - 1);
  };

  const next = () => {
    if (idx < words.length - 1) {
      setIdx(idx + 1);
      return;
    }
    toastSuccess("复习完成！");
    navigate("/");
  };

  if (loading) {
    return (
      <PageShell>
        <PageShellContent className="flex items-center justify-center">
          <BodySm>加载中...</BodySm>
        </PageShellContent>
      </PageShell>
    );
  }

  if (!words.length) {
    return (
      <PageShell>
        <PageShellHeader title="复习模式" backTo="/" />
        <PageShellContent className="flex items-center justify-center">
          <BodySm>当前无到期复习单词</BodySm>
        </PageShellContent>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageShellHeader
        title="复习模式"
        subtitle={`进度：${idx + 1} / ${words.length}`}
        backTo="/"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            返回单词本
          </Button>
        }
      />

      <PageShellContent className="flex items-center justify-center">
        <div className="mx-auto">
          <WordCard
            key={current.id}
            mode="review"
            title={current.text}
            subtitle={current.phonetic}
            meaning={current.meaning}
            example={current.example}
            onMastered={() => mark("mastered", true)}
            onReviewAgain={() => mark("reviewing", false)}
            onReset={() => mark("new", false)}
            onPrev={prev}
            onNext={next}
            submitting={submitting}
            hasPrev={idx > 0}
            hasNext={true}
          />
        </div>
      </PageShellContent>
    </PageShell>
  );
}

export default ReviewView;
