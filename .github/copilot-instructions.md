# Copilot Instructions for This Repository

## Build, lint, and test commands

### Frontend (`frontend`)

- Install dependencies: `npm ci`
- Start dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test suite: not configured in `package.json`
- Run a single test: not available (no test runner configured)

### Backend (`backend`)

- Install dependencies: `pip install -r requirements.txt`
- Run API (dev): `python run.py` (starts Uvicorn on `0.0.0.0:8001` with reload)
- Test suite: not configured in repository
- Lint: not configured in repository
- Run a single test: not available (no test runner configured)

### Database

- Start PostgreSQL for local development: `docker compose up -d postgres`

## High-level architecture

- This is a split app: **FastAPI + SQLAlchemy backend** in `backend/app` and **React + Vite frontend** in `frontend/src`.
- Frontend uses an Axios client (`src/api/client.ts`) whose base URL defaults to `http://<current-host>:8001/api` unless `VITE_API_BASE_URL` is set.
- Authentication is JWT-based:
  - Backend issues tokens in `/api/auth/login` and `/api/auth/register`.
  - Frontend stores `token` and `user` in `localStorage` via Zustand (`src/stores/authStore.ts`).
  - Axios request interceptor adds `Authorization: Bearer <token>`.
  - Routing is guarded in `src/router/AppRoutes.tsx` by `isAuthed`.
- Core domain model:
  - `users`, `wordbooks`, `words`
  - Many-to-many join tables: `wordbook_words` (books↔words), `user_system_wordbooks` (user subscriptions to shared/system books)
  - Learning progress: `user_word_progress` and `practice_records`
- On backend startup (`app/main.py`), the app:
  - creates tables via `Base.metadata.create_all`
  - applies small schema backfills (`ensure_word_columns`, `ensure_wordbook_columns`)
  - seeds/updates system wordbooks from `app/data/system_wordbooks.py`
- Dictionary enrichment flow (`app/services/dictionary.py`):
  - validates input as English word
  - fetches definitions from dictionaryapi.dev
  - translates meanings to Chinese via Google Translate endpoint
  - caches lookup/translation results in-memory for 5 minutes

## Key conventions in this codebase

- **Meaning fields are intentionally bilingual-structured** in backend word creation:
  - `meaning` is Chinese translation (user-facing meaning)
  - `example` often stores English definition/example text
  - Do not assume `meaning` is English when adding features.
- **Wordbook access control pattern** is reused across routes:
  - Owner can modify own non-system books.
  - Non-owners can access only subscribed system/published books.
  - Preserve this logic when adding endpoints.
- **System wordbooks are subscription-based**, not copied per user:
  - User-visible wordbooks merge owned books + subscribed system books.
  - Frontend currently uses `/wordbooks/system/{id}/subscribe|unsubscribe` for system books.
- **Frontend API modules mirror backend route groups** (`auth.ts`, `wordbooks.ts`, `words.ts`, `learning.ts`); keep new endpoints added in both layers.
- **Error messages are shown directly to users** (`err.response?.data?.detail || fallback`) in many views; backend `detail` text should stay user-readable.
- **No Alembic migration workflow is present**; schema compatibility changes are currently handled in startup hooks.

## AI Coding Principles — Skill Framework

> 基于「AI Skills for Real Engineers」核心原则，规范 AI 编码行为。

### 1. 先思考再编码 (Think Before Coding)

- **理解需求再动手**：在写任何代码前，先复述你对问题的理解，确认无误后再开始。
- **规划方案**：给出 2-3 句话的实施方案，说明你准备改哪些文件、为什么这样改。
- **一次性把事情做对**：宁可多花 30 秒思考，也不要仓促写出需要反复修改的代码。

### 2. 简洁优先 (Simplicity First)

- **最小可行实现**：始终选择最简单、最直接的方案。不要过度设计。
- **新增代码克制**：每次改动尽量控制在 50 行以内，超过时主动说明理由。
- **不引入不必要的抽象**：如果一个问题用普通函数就能解决，不要创建新的类、服务或中间层。
- **复用已有代码**：优先使用项目中已有的工具函数、组件、模式，避免重复造轮子。

### 3. 精准修改 (Precision Editing)

- **只改必须改的**：不顺手"优化"无关代码，不格式化未改动的文件。
- **明确改动范围**：每次修改前说明"我将修改以下 X 个文件：..."
- **新增依赖要谨慎**：引入任何新 npm/pip 包前，必须解释为什么现有依赖无法满足需求。
- **保持代码风格一致**：严格遵循项目现有的代码风格，不要引入新的模式或风格。

### 4. 目标驱动执行 (Goal-Driven Execution)

- **始终回溯目标**：每次回答结束时，确认改动是否真正解决了用户的原始问题。
- **不偏离需求**：用户要什么就做什么，不擅自扩展需求范围。
- **完成后验证**：改动后说明如何验证（如：运行哪个命令、检查哪个页面）。
- **遇到不确定时主动询问**：如果信息不够做出最佳决策，优先提问而非猜测。

### 5. 沟通规范

- **每次回复结构清晰**：先给出结论/方案摘要 → 再展示代码改动 → 最后说明验证方式。
- **代码改动用 diff 格式**：优先展示 `diff` 或明确指出"在文件的 X 行后插入 Y"。
- **解释为什么**：每个改动都要简要说明原因，而不是只丢出代码。

