# VocabFlow

> 交互式词汇学习平台 · Interactive vocabulary learning, from discovery to review.

VocabFlow 是一个 React + FastAPI 全栈词汇学习项目。用户可以创建自己的词书，浏览和订阅共享词书，查询英文单词并预览中文释义，再通过拼写练习与到期复习记录学习进度。项目使用 PostgreSQL 保存用户、词书、单词和练习记录。

## 核心流程

```text
注册／登录 → 创建或订阅词书 → 搜索单词并确认释义 → 拼写练习／卡片复习 → 记录进度 → 到期再次复习
```

## 已实现功能

| 模块 | 当前实现 | 主要代码 |
| --- | --- | --- |
| 用户账户 | 注册、登录、JWT 鉴权、个人资料接口；前端保存会话并为请求附加令牌 | `backend/app/routes/auth.py`、`frontend/src/stores/authStore.ts` |
| 词书管理 | 创建、编辑、删除个人词书；浏览系统／已发布词书，订阅与取消订阅，发布与下架个人词书 | `backend/app/routes/wordbooks.py`、`frontend/src/views/BookshelfView.tsx` |
| 查词与录入 | 校验英文输入，读取音标、词性与英文释义，翻译为中文；先预览再确认加入词书，重复单词可复用 | `backend/app/services/dictionary.py`、`frontend/src/views/WordbookWordsView.tsx` |
| 练习与复习 | 按词书练习拼写、核对答案、记录练习结果；根据下次复习时间筛选复习队列 | `backend/app/routes/learning.py`、`frontend/src/views/SpellingView.tsx`、`ReviewView.tsx` |
| 交互界面 | 深浅主题、词书看板、单词详情页，以及对焦点、输入、鼠标和登录错误作出反馈的动态登录角色 | `frontend/src/views/`、`frontend/src/components/AnimatedCharacters.tsx` |

系统预置了高频基础词、BNC、Oxford 3000 摘要、雅思、CET4 和 CET6 等词书，启动时由后端写入或更新。

### 查词是怎样工作的

当前版本的查词链路是**在线词典与翻译接口**，不是大模型 Agent：

1. 输入英文单词，后端检查格式，并向 [Free Dictionary API](https://dictionaryapi.dev/) 获取词性、音标和英文释义。
2. 按词性整理释义，调用 Google Translate 接口生成中文解释；查词与翻译结果在进程内缓存约 5 分钟。
3. 前端显示预览，用户确认后才写入词书；接口超时或找不到释义时返回可读的错误信息。

仓库当前代码**尚未包含 LLM/Agent 查词实现或提示词**。如果后续接入 Agent，可在此链路上增加语境消歧、多来源核对和结构化释义，但这些不属于当前已实现功能。

### 复习规则的边界

后端根据单词的正确次数设置 1–7 天的简化复习间隔，并记录复习次数、正确／错误次数及下一次复习时间。这是简化的到期复习机制，**不是 SM-2 等完整间隔重复算法**。

## 技术栈与目录

- 前端：React 19、TypeScript、Vite、Tailwind CSS、React Router、Zustand、Axios。
- 后端：Python、FastAPI、SQLAlchemy、Pydantic、JWT。
- 数据：PostgreSQL；`docker-compose.yml` 只启动本地开发数据库。

```text
backend/app/routes/       HTTP 接口：账户、词书、单词、练习
backend/app/services/     词典查询与中文释义处理
backend/app/models/       用户、词书、单词、学习进度数据模型
backend/app/data/         预置词书数据
frontend/src/api/         前端请求封装
frontend/src/views/       词书、查词、拼写、复习等页面
frontend/src/components/  交互组件与 UI 组件
```

## 本地运行

以下以 Windows PowerShell 为例。需要 Python 3.11、Node.js 和 npm；若使用仓库自带的 PostgreSQL 配置，还需要 Docker Desktop。

```powershell
git clone https://github.com/Albertknight2023/VocabFlow.git
cd VocabFlow
docker compose up -d postgres

cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe run.py
```

在另一个终端启动前端：

```powershell
cd VocabFlow\frontend
npm ci
npm run dev
```

- 前端默认地址：`http://localhost:5173`。
- API 默认地址：`http://localhost:8001`，交互式接口文档位于 `/docs`。
- 若前后端不在同一主机或端口，设置前端环境变量 `VITE_API_BASE_URL`。
- `backend/.env.example` 给出开发配置。默认密钥与数据库口令仅适合本地演示；公开部署前须替换，并且不要把真实凭据提交到 Git。

## 当前状态与后续工作

这是持续完善中的个人项目。当前 GitHub 版本已包含上述功能，但尚未配置自动化测试与 CI；在线查词依赖第三方服务和网络；登录令牌存放在浏览器本地存储中，生产部署仍需进一步加固安全配置。后续计划包括补充测试、完善部署流程，以及实现可验证的 Agent 辅助释义服务。

更多历史设计与开发说明可参见 [`TECHNICAL_GUIDE.md`](TECHNICAL_GUIDE.md) 和 [`README_DOCS.md`](README_DOCS.md)。如果它们与代码或本页描述不一致，以当前代码为准。
