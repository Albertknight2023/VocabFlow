import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { toastSuccess, toastError } from "../lib/toast";
import {
  getMarketplaceWordbooksApi,
  getWordbooksApi,
  subscribeSystemWordbookApi,
  subscribeWordbookApi,
} from "../api/wordbooks";
import { PageShell, PageShellHeader, PageShellContent } from "../components/ui/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { H2, BodySm } from "../components/ui/Typography";
import { BurstWordbookCard } from "../components/BurstWordbookCard";

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
  const [myBooks, setMyBooks] = useState<Wordbook[]>([]);
  const [marketBooks, setMarketBooks] = useState<Wordbook[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? ((JSON.parse(raw) as { id?: number }).id ?? null) : null;
    } catch {
      return null;
    }
  }, []);

  const myBookIds = useMemo(() => new Set(myBooks.map((b) => b.id)), [myBooks]);

  const load = async () => {
    const [{ data: myData }, { data: marketData }] = await Promise.all([
      getWordbooksApi(),
      getMarketplaceWordbooksApi(),
    ]);
    setMyBooks(myData);
    setMarketBooks(marketData);
  };

  useEffect(() => {
    load().catch(() => toastError("Failed to load")).finally(() => setLoading(false));
  }, []);

  const importBook = async (book: Wordbook) => {
    try {
      if (book.is_system) await subscribeSystemWordbookApi(book.id);
      else await subscribeWordbookApi(book.id);
      toastSuccess(`Imported "${book.name}"`);
      await load();
    } catch (err: any) {
      toastError(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <PageShell>
      <PageShellHeader
        title="Marketplace"
        subtitle={loading ? "Loading..." : `${marketBooks.length} books available`}
        backTo="/"
      />

      <PageShellContent>
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <H2>Discover</H2>
                  <BodySm>Import books to start learning.</BodySm>
                </div>
              </div>

              {marketBooks.length === 0 && !loading ? (
                <div className="text-center py-10">
                  <BodySm>No books available yet. Create one on the <button onClick={() => navigate("/")} className="text-primary-500 hover:underline">Home</button> page.</BodySm>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {marketBooks.map((book) => {
                    const added = myBookIds.has(book.id);
                    return (
                      <BurstWordbookCard
                        key={book.id}
                        book={book}
                        wordCount={0}
                        currentUserId={currentUserId}
                        badge={added ? "Added" : book.is_system ? "Official" : "Community"}
                        muted={added}
                        actions={
                          added
                            ? undefined
                            : [{
                                label: "Import",
                                icon: <Download className="size-4" />,
                                onClick: () => importBook(book),
                              }]
                        }
                      />
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </PageShellContent>
    </PageShell>
  );
}

export default BookshelfView;
