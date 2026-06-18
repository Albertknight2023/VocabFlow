import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getWordbookApi } from "../api/wordbooks";
import { getWordsByWordbookApi } from "../api/words";
import { Button } from "../components/ui/Button";
import { PageShell, PageShellHeader, PageShellContent } from "../components/ui/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { Display, H4, Body, BodySm } from "../components/ui/Typography";

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
        const matched = (wordsRes.data as Word[]).find((item) => item.id === parsedWordId);
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
    return (
      <PageShell>
        <PageShellContent>
          <BodySm>单词参数无效</BodySm>
        </PageShellContent>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageShellHeader
        title={loading ? "加载中..." : word?.text || "单词详情"}
        subtitle={book?.name || "单词本"}
        backTo={`/wordbooks/${parsedBookId}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`/wordbooks/${parsedBookId}`)}>
            返回单词列表
          </Button>
        }
      />

      <PageShellContent>
        <div className="max-w-2xl mx-auto">
          {word ? (
            <div className="space-y-4">
              <Card>
                <CardBody>
                  <Display>{word.text}</Display>
                  {word.phonetic && <BodySm className="mt-1">{word.phonetic}</BodySm>}
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <H4>释义</H4>
                  <Body className="mt-2 !text-foreground">{word.meaning}</Body>
                </CardBody>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                  <CardBody>
                    <H4>词性</H4>
                    <Body className="mt-2 !text-foreground">{word.part_of_speech || "未设置"}</Body>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <H4>英文释义</H4>
                    <Body className="mt-2 !text-foreground">{word.example || "未设置"}</Body>
                  </CardBody>
                </Card>
              </div>
            </div>
          ) : (
            <BodySm>暂无详情</BodySm>
          )}
        </div>
      </PageShellContent>
    </PageShell>
  );
}

export default WordDetailView;
