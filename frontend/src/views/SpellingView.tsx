import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toastSuccess, toastError, toastWarning } from "../lib/toast";
import { getLearningCardsApi, recordProgressApi, spellingCheckApi } from "../api/learning";
import { incrementLearned } from "../stores/dailyProgress";
import { Button } from "../components/ui/Button";
import { PageShell, PageShellHeader, PageShellContent } from "../components/ui/PageShell";
import { WordCard } from "../components/WordCard";
import { BodySm } from "../components/ui/Typography";

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
  const [shaking, setShaking] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>();
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>();

  const current = useMemo(() => words[idx], [words, idx]);

  useEffect(() => {
    if (!id) return;
    getLearningCardsApi(id)
      .then((res) => setWords(res.data))
      .catch((err) => toastError(err.response?.data?.detail || "加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    return () => {
      clearTimeout(shakeTimer.current);
      clearTimeout(advanceTimer.current);
    };
  }, []);

  const check = async () => {
    if (!current || !input.trim()) return;
    setChecking(true);
    try {
      const { data } = await spellingCheckApi(current.id, input);
      try {
        await recordProgressApi(current.id, data.correct ? "mastered" : "reviewing", data.correct);
      } catch {
        if (import.meta.env.DEV) {
          toastWarning("进度保存失败（后端接口异常），但本次拼写结果已给出");
        }
      }

      if (data.correct) {
        incrementLearned(id);
        advanceTimer.current = setTimeout(() => {
          setInput("");
          if (idx < words.length - 1) {
            setIdx(idx + 1);
          } else {
            navigate("/");
          }
        }, 500);
      } else {
        setShaking(true);
        shakeTimer.current = setTimeout(() => {
          setShaking(false);
          setInput("");
        }, 500);
      }
    } catch (err: any) {
      toastError(err.response?.data?.detail || "检查失败");
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    if (idx < words.length - 1) {
      setIdx(idx + 1);
      setInput("");
      return;
    }
    toastSuccess("学习完成！");
    navigate("/");
  };

  const prev = () => {
    if (idx <= 0) return;
    setIdx(idx - 1);
    setInput("");
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
        <PageShellHeader title="拼写练习" backTo="/" />
        <PageShellContent className="flex items-center justify-center">
          <BodySm>该单词本暂无单词</BodySm>
        </PageShellContent>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageShellHeader
        title="拼写练习"
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
            mode="spelling"
            meaning={current.meaning}
            input={input}
            onInputChange={setInput}
            onCheck={check}
            onPrev={prev}
            onNext={next}
            checking={checking}
            hasPrev={idx > 0}
            hasNext={true}
            shaking={shaking}
          />
        </div>
      </PageShellContent>
    </PageShell>
  );
}

export default SpellingView;
