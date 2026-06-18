import { useState } from "react";
import { Trash2, Sparkles, Users, Eye } from "lucide-react";
import { Button } from "../components/ui/Button";
import { TextSwapButton } from "../components/ui/TextSwapButton";
import { Card, CardHeader, CardBody, CardFooter } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { PageShell, PageShellHeader, PageShellContent } from "../components/ui/PageShell";
import { Display, H1, H2, H3, H4, Body, BodySm, Caption, Code } from "../components/ui/Typography";
import { BurstWordbookCard } from "../components/BurstWordbookCard";
import { Loader } from "../components/ui/Loader";
import { TerminalCard } from "../components/ui/TerminalCard";
import { RainbowCard } from "../components/ui/RainbowCard";
import { StatsCard } from "../components/ui/StatsCard";

const demoBooks: Array<{
  id: number; name: string; description?: string; category?: string; is_system: boolean; owner_id?: number | null;
}> = [
  { id: 1, name: "CET4 核心词汇", category: "CET4", is_system: true, owner_id: null },
  { id: 2, name: "考研英语词汇", category: "考研", is_system: true, owner_id: null },
  { id: 3, name: "IELTS Academic", category: "IELTS", is_system: true, owner_id: null },
  { id: 4, name: "我的日常积累", category: "general", is_system: false, owner_id: 1 },
  { id: 5, name: "TOEFL 高频词", category: "TOEFL", is_system: true, owner_id: null },
];

function ComponentLibraryView() {
  const [, setCount] = useState(0);

  return (
    <PageShell>
      <PageShellHeader
        title="组件库"
        subtitle="uiverse.io 精选 — Button · Card · Loader · Terminal · Rainbow · Stats"
        backTo="/"
      />

      <PageShellContent>
        <div className="max-w-6xl mx-auto space-y-10 pb-20">

          {/* ════════════════ Button ════════════════ */}
          <Card>
            <CardHeader>
              <H2>Button 按钮</H2>
              <BodySm>3D border-b 按压 — carlosepcc 风格</BodySm>
            </CardHeader>
            <CardBody className="space-y-5">
              {/* Variants */}
              <div>
                <H4 className="mb-2">Variants</H4>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              {/* Special */}
              <div>
                <H4 className="mb-2">Special — pill · text-swap</H4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="pill" size="2xl">Play demo</Button>
                  <TextSwapButton topText="Get Started" bottomText="Right Now" />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <H4 className="mb-2">Sizes</H4>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">XL</Button>
                  <Button size="2xl">2XL</Button>
                </div>
              </div>

              {/* Icon */}
              <div>
                <H4 className="mb-2">Icon</H4>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="icon-sm"><Sparkles className="size-4" /></Button>
                  <Button size="icon-md" variant="outline"><Sparkles className="size-4" /></Button>
                  <Button variant="primary" icon={<Sparkles className="size-4" />}>With icon</Button>
                  <Button variant="destructive" size="sm" icon={<Trash2 className="size-3" />}>Delete</Button>
                </div>
              </div>

              {/* Loading */}
              <div>
                <H4 className="mb-2">Loading state</H4>
                <div className="flex flex-wrap items-center gap-2">
                  <Button loading>Loading</Button>
                  <Button loading variant="outline">Please wait</Button>
                  <Button loading variant="destructive">Deleting</Button>
                  <Button loading size="sm">Saving</Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ════════════════ RainbowCard ════════════════ */}
          <Card>
            <CardHeader>
              <H2>RainbowCard 动态卡片</H2>
              <BodySm>4 种 hover 动画变体 — bars / bubbles / sweep / burst</BodySm>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* bars — original 5-color bars */}
                <div>
                  <H4 className="mb-2">bars — 5 条彩色横条交替滑入</H4>
                  <div className="flex flex-wrap gap-4">
                    <RainbowCard variant="bars" heading="HEADING" actionLabel="More Info" />
                    <RainbowCard variant="bars" heading="单词统计" actionLabel="查看详情">
                      本月新增 <strong>1,234</strong> 词
                    </RainbowCard>
                    <RainbowCard variant="bars" heading="PROFILE" actionLabel="Open" />
                  </div>
                </div>

                {/* bubbles — concentric circles from bottom-left */}
                <div>
                  <H4 className="mb-2">bubbles — 3 层同心圆从左下扩散</H4>
                  <div className="flex flex-wrap gap-4">
                    <RainbowCard variant="bubbles" heading="HEADING" actionLabel="More Info" />
                    <RainbowCard variant="bubbles" heading="单词统计" actionLabel="查看详情">
                      本月新增 <strong>1,234</strong> 词
                    </RainbowCard>
                    <RainbowCard variant="bubbles" heading="PROFILE" actionLabel="Open" />
                  </div>
                </div>

                {/* sweep — gradient sweep from bottom-right */}
                <div>
                  <H4 className="mb-2">sweep — 渐变矩形从右下旋入</H4>
                  <div className="flex flex-wrap gap-4">
                    <RainbowCard variant="sweep" heading="HEADING" actionLabel="More Info" />
                    <RainbowCard variant="sweep" heading="单词统计" actionLabel="查看详情">
                      本月新增 <strong>1,234</strong> 词
                    </RainbowCard>
                    <RainbowCard variant="sweep" heading="PROFILE" actionLabel="Open" />
                  </div>
                </div>

                {/* burst — single circle from top-right */}
                <div>
                  <H4 className="mb-2">burst — 单圆从右上爆开 800%</H4>
                  <div className="flex flex-wrap gap-4">
                    <RainbowCard variant="burst" heading="HEADING" actionLabel="More Info" />
                    <RainbowCard variant="burst" heading="单词统计" actionLabel="查看详情">
                      本月新增 <strong>1,234</strong> 词
                    </RainbowCard>
                    <RainbowCard variant="burst" heading="PROFILE" actionLabel="Open" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ════════════════ StatsCard ════════════════ */}
          <Card>
            <CardHeader>
              <H2>StatsCard 统计卡片</H2>
              <BodySm>纯色背景 + hover 下沉 + 顶部彩条阴影 + 图标透明度变化</BodySm>
            </CardHeader>
            <CardBody>
              <div className="grid gap-3 grid-cols-2 max-w-md">
                <StatsCard
                  value={2000}
                  label="单词总量"
                  bg="#673ab7"
                  shadowColor="#2196f3"
                  icon={<Users className="size-9 text-white" />}
                />
                <StatsCard
                  value={1999}
                  label="已掌握"
                  bg="rgb(41,49,79)"
                  shadowColor="rgb(244,67,54)"
                  icon={<Eye className="size-9 text-white" />}
                />
              </div>
            </CardBody>
          </Card>

          {/* ════════════════ TerminalCard ════════════════ */}
          <Card>
            <CardHeader>
              <H2>TerminalCard 终端卡片</H2>
              <BodySm>打字机效果 · 暗色终端 · Session 列表</BodySm>
            </CardHeader>
            <CardBody>
              <TerminalCard
                host="neo"
                path="~/projects"
                lines={[
                  "$ ls -la",
                  "drwxr-xr-x  12 neo  staff   384 May 19 10:30 .",
                  "drwxr-xr-x   8 neo  staff   256 May 17 14:22 wordbook-app",
                  "drwxr-xr-x  10 neo  staff   320 May 15 08:45 ui-components",
                  "",
                  "$ _",
                ]}
                typeSpeed={20}
              >
                <div className="space-y-2">
                  <H4 className="!text-emerald-400 !font-mono !text-xs !tracking-widest mb-3">SESSIONS</H4>
                  <TerminalCard.Session name="wordbook-app" time="2h ago" active />
                  <TerminalCard.Session name="api-server" time="5h ago" />
                  <TerminalCard.Session name="ui-components" time="1d ago" />
                </div>
              </TerminalCard>
            </CardBody>
          </Card>

          {/* ════════════════ Alert ════════════════ */}
          <Card>
            <CardHeader>
              <H2>Alert 提示条</H2>
              <BodySm>4 种变体 — success / info / warning / error</BodySm>
            </CardHeader>
            <CardBody className="space-y-2">
              <Alert variant="success">Success — Everything went smoothly!</Alert>
              <Alert variant="info">Info — This is some information for you.</Alert>
              <Alert variant="warning">Warning — Be careful with this next step.</Alert>
              <Alert variant="error">Error — Something went wrong.</Alert>
            </CardBody>
          </Card>

          {/* ════════════════ Loader ════════════════ */}
          <Card>
            <CardHeader>
              <H2>Loader 加载指示器</H2>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <H4>bar</H4>
                  <Loader variant="bar" size="md" label="Loading..." />
                </div>
                <div className="space-y-2">
                  <H4>spinner</H4>
                  <Loader variant="spinner" size="md" label="加载中..." />
                </div>
                <div className="space-y-2">
                  <H4>dots</H4>
                  <Loader variant="dots" size="md" label="处理中..." />
                </div>
                <div className="space-y-2">
                  <H4>pulse</H4>
                  <Loader variant="pulse" size="md" label="在线" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ════════════════ Card ════════════════ */}
          <Card>
            <CardHeader><H2>Card 卡片容器</H2></CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card variant="default">
                  <CardHeader><H3>default</H3></CardHeader>
                  <CardBody><BodySm>标准卡片</BodySm></CardBody>
                  <CardFooter><Button size="sm">操作</Button></CardFooter>
                </Card>
                <Card variant="interactive">
                  <CardHeader><H3>interactive</H3></CardHeader>
                  <CardBody><BodySm>hover 浮起</BodySm></CardBody>
                  <CardFooter><Button size="sm" variant="outline">点击</Button></CardFooter>
                </Card>
                <Card variant="flat">
                  <CardHeader><H3>flat</H3></CardHeader>
                  <CardBody><BodySm>轻量无阴影</BodySm></CardBody>
                </Card>
              </div>
            </CardBody>
          </Card>

          {/* ════════════════ Typography ════════════════ */}
          <Card>
            <CardHeader><H2>Typography</H2></CardHeader>
            <CardBody className="space-y-2">
              <Display>Display · 3rem</Display>
              <H1>H1 · 2.25rem</H1>
              <H2>H2 · 1.75rem</H2>
              <H3>H3 · 1.25rem</H3>
              <H4>H4 · 0.875rem label</H4>
              <Body>Body · 1rem paragraph text for reading and descriptions.</Body>
              <BodySm>BodySm · 0.875rem secondary text.</BodySm>
              <Caption>Caption · 0.75rem muted</Caption>
              <Code>Code · 0.8125rem monospace</Code>
            </CardBody>
          </Card>

          {/* ════════════════ BurstWordbookCard ════════════════ */}
          <Card>
            <CardHeader>
              <H2>BurstWordbookCard 爆开单词书</H2>
              <BodySm>burst 动画 + WordbookCard 尺寸 — 三色：橙=自建 · 青=海外 · 翠=国内</BodySm>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {demoBooks.map((book) => (
                  <BurstWordbookCard
                    key={book.id}
                    book={book}
                    wordCount={Math.floor(Math.random() * 2000) + 100}
                    currentUserId={1}
                    badge={book.is_system ? (!book.owner_id ? "官方词书" : "已导入") : "我的词书"}
                    onClick={() => setCount((c) => c + 1)}
                  />
                ))}
              </div>
            </CardBody>
          </Card>

          {/* ════════════════ Design Tokens ════════════════ */}
          <Card>
            <CardHeader><H2>Design Tokens</H2></CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-body-sm">
                <div><code className="bg-elevated px-1 rounded">p-page 1.5rem</code></div>
                <div><code className="bg-elevated px-1 rounded">p-section 2rem</code></div>
                <div><code className="bg-elevated px-1 rounded">rounded-ui 0.5rem</code></div>
                <div><code className="bg-elevated px-1 rounded">rounded-card 0.75rem</code></div>
                <div><code className="bg-elevated px-1 rounded">rounded-modal 1rem</code></div>
                <div><code className="bg-elevated px-1 rounded">shadow ui/card/elevated/modal</code></div>
              </div>
            </CardBody>
          </Card>

        </div>
      </PageShellContent>
    </PageShell>
  );
}

export default ComponentLibraryView;
