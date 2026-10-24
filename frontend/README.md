# VocabFlow Frontend

React + TypeScript + Vite 前端，提供词书看板、词书发现与订阅、在线查词预览、拼写练习、到期复习和账户页面。项目总体介绍、后端启动方式与功能边界见[仓库首页 README](../README.md)。

## 本地开发

先按仓库首页说明启动 PostgreSQL 与 FastAPI 后端（默认 `http://localhost:8001`），然后在本目录运行：

```powershell
npm ci
npm run dev
```

浏览器访问 `http://localhost:5173`。前端默认请求当前主机的 `8001/api`；需要自定义时，可在本地 `.env.local` 中设置 `VITE_API_BASE_URL=http://localhost:8001/api`。

## 主要入口

- `src/router/AppRoutes.tsx`：登录保护和页面路由。
- `src/views/DashboardView.tsx`：词书看板、创建与管理。
- `src/views/BookshelfView.tsx`：发现和订阅词书。
- `src/views/WordbookWordsView.tsx`：查词、预览、确认录入和单词列表。
- `src/views/SpellingView.tsx`、`ReviewView.tsx`：拼写练习和复习。
- `src/api/`、`src/stores/`：API 请求封装、会话及本地状态。

## 检查

```powershell
npm run build
npm run lint
```

当前仓库未配置前端自动化测试；以上命令用于构建与静态检查。
