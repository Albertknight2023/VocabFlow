# 部署前检查清单

> 用于确认系统就绪状态，准备部署或交付代码变更

---

## ✅ 前端检查 (frontend/)

- [ ] **依赖整合**
  - [ ] `npm ci` 完成，26 依赖安装
  - [ ] 无过期包警告
  - [ ] `package-lock.json` 存在并已提交

- [ ] **代码质量**
  - [ ] 运行 `npm run lint` 无错误
  - [ ] TypeScript 严格模式启用（`tsconfig.json` 中 `strict: true`）
  - [ ] 无 console.warn/error 污染生产代码
  - [ ] 移除所有临时 TODO 注释

- [ ] **构建验证**
  - [ ] `npm run build` 成功
    - [ ] 1826+ 模块已转换
    - [ ] CSS ≤ 30kB (gzipped)
    - [ ] JS ≤ 400kB (gzipped)
  - [ ] dist/ 文件夹存在，包含 index.html
  - [ ] Source maps 存在（可选，用于调试）

- [ ] **环境配置**
  - [ ] .env.development 配置正确（VITE_API_BASE_URL）
  - [ ] .env.production 配置正确（生产 API 地址）
  - [ ] 敏感信息未硬编码（密钥、令牌、密码）

- [ ] **动画组件**
  - [ ] AnimatedCharacters.tsx 导入无错误
  - [ ] animted-login.css 顺序正确（在 Tailwind 之后）
  - [ ] CSS 变量（--pupil-x, --pupil-y）定义完整
  - [ ] 60fps 性能（通过 Chrome DevTools Performance 验证）

- [ ] **认证流程**
  - [ ] LoginView 集成认证 Store
  - [ ] Token 存储于 localStorage
  - [ ] Axios 拦截器已启用（api/client.ts）
  - [ ] 登录后正确跳转到 /wordbooks

- [ ] **导航功能**
  - [ ] SpellingView prev/next 按钮存在且可点击
  - [ ] ReviewView prev/next 按钮存在且可点击
  - [ ] 按钮在 idx=0 时正确禁用
  - [ ] 响应式布局调试：sm 断点生效

---

## ✅ 后端检查 (backend/)

- [ ] **依赖整合**
  - [ ] `pip install -r requirements.txt` 完成
  - [ ] 虚拟环境已激活
  - [ ] Python 版本 ≥ 3.8

  ```bash
  python --version  # 应显示 3.8+
  ```

- [ ] **代码质量**
  - [ ] 无 import 错误
  - [ ] 无 SQL 注入漏洞
  - [ ] 错误信息用户友好（detail 字段清晰）
  - [ ] 移除调试 print 语句

- [ ] **数据库**
  - [ ] PostgreSQL 容器运行

  ```bash
  docker ps | grep postgres
  ```

  - [ ] 数据库表已创建

  ```bash
  psql -U <user> -d <dbname> -c "\dt"
  ```

  - [ ] migrations 已应用（如有）
  - [ ] 种子数据已导入（system_wordbooks）

- [ ] **API 端点**
  - [ ] POST /api/auth/register - 新用户注册 ✓
  - [ ] POST /api/auth/login - 用户登录 ✓
  - [ ] 返回结构：`{access_token, token_type, user}`
  - [ ] 错误状态码正确（401, 422, 500）

- [ ] **环境配置**
  - [ ] .env 文件存在且包含：
    - [ ] `SECRET_KEY` - JWT 密钥（≥32 字符随机）
    - [ ] `DATABASE_URL` - PostgreSQL 连接串
    - [ ] `DEBUG` - False（生产环境）
  - [ ] 敏感信息未提交到 Git

- [ ] **CORS 配置**
  - [ ] `allow_origins` 包含前端域名
  - [ ] 生产环境中使用环境变量（非 "\*"）

- [ ] **认证安全**
  - [ ] JWT 令牌过期时间设置（建议 24h）
  - [ ] 密码最小长度 ≥ 8 字符
  - [ ] bcrypt cost factor ≥ 12
  - [ ] 登录失败不泄露用户/邮箱存在信息

---

## ✅ 集成检查

- [ ] **前后端连接**
  - [ ] 前端 localhost:5173 可访问后端 localhost:8001

  ```bash
  curl -X POST http://localhost:8001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username_or_email":"test","password":"test"}'
  ```

  - [ ] 响应正确（200 OK 或 401）
  - [ ] CORS 头存在（Access-Control-Allow-Origin）

- [ ] **认证端到端**
  1. [ ] 打开前端登录页
  2. [ ] 清除 localStorage
  3. [ ] 输入正确用户凭证 → 登录成功 → 跳转到 wordbooks
  4. [ ] localStorage 包含 token 和 user 对象
  5. [ ] 刷新页面 → 仍保持登录状态
  6. [ ] 输入错误凭证 → 显示错误提示（"用户名/密码错误"）

- [ ] **动画交互**
  1. [ ] 打开登录页 → 四个角色可见
  2. [ ] 移动鼠标 → 眼睛追踪
  3. [ ] 每 0.8-2.6s → 自动眨眼
  4. [ ] 聚焦密码框 → 眼睛向左看
  5. [ ] 输入内容 → 口部微微打开
  6. [ ] 登录失败 → 角色表情显示错误状态

- [ ] **Word 导航**
  1. [ ] 进入学习模式 → SpellingView 显示第一个单词
  2. [ ] 点击右下"下一个"按钮 → 加载第二个单词
  3. [ ] 点击"上一个"按钮 → 回到第一个单词
  4. [ ] 在第一个单词时"上一个"按钮禁用 (disabled 状态)
  5. [ ] 在最后一个单词点击"下一个" → 显示完成提示

---

## ✅ 安全检查

- [ ] **密码安全**
  - [ ] 密码不在 localStorage (仅 token)
  - [ ] 密码不在 URL 或日志中
  - [ ] HTTPS 启用（生产环境）

- [ ] **令牌安全**
  - [ ] JWT 签名算法：HS256 或更强
  - [ ] token_type 为 "bearer"（小写）
  - [ ] 令牌过期时间 ≤ 24h

- [ ] **敏感数据**
  - [ ] 错误消息不泄露系统内部细节
  - [ ] 调试信息关闭（生产环境 DEBUG=False）
  - [ ] API 返回不包含密码哈希

---

## ✅ 性能检查

- [ ] **前端性能**
  - [ ] 首屏加载 ≤ 3s (Fast 3G)
  - [ ] 动画帧率 ≥ 50fps (Chrome DevTools Performance)
  - [ ] JavaScript 执行时间 ≤ 500ms
  - [ ] CSS 文件大小 ≤ 50kB

- [ ] **后端性能**
  - [ ] API 响应时间 ≤ 500ms (平均)
  - [ ] 数据库连接池已配置
  - [ ] 日志级别适当（不过度记录）

---

## ✅ 文档检查

- [ ] **代码注释**
  - [ ] 复杂逻辑有中文注释
  - [ ] 函数签名清晰（参数类型、返回值）
  - [ ] 移除冗余注释

- [ ] **提交记录**
  - [ ] 最后一次提交包含所有更改
  - [ ] 提交信息清晰且标准化（feat/fix/docs/...）
  - [ ] 附带修改文件清单

---

## ✅ 备份与版本控制

- [ ] **Git 清理**

  ```bash
  git status  # 无未跟踪文件（除 .env）
  git log --oneline -5  # 最近 5 条提交可见
  ```

- [ ] **分支管理**
  - [ ] 当前分支为 main/master（或指定分支）
  - [ ] 所有功能分支已合并
  - [ ] 无冲突标记（<<<<, ====, >>>>）

- [ ] **备份**
  - [ ] .env 文件已安全备份（不在 Git 中）
  - [ ] 数据库备份已做
  ```bash
  docker exec <postgres-container> pg_dump -U <user> <dbname> > backup.sql
  ```

---

## 🚀 部署阶段检查

### 若部署至 Docker

- [ ] Dockerfile 存在且有效
- [ ] docker-compose.yml 已配置（包含 frontend + backend + postgres）
- [ ] 构建无错误：`docker-compose build`
- [ ] 启动无错误：`docker-compose up -d`
- [ ] 服务可达性：
  - [ ] 前端：http://localhost:3000（或配置的端口）
  - [ ] 后端：http://localhost:8001（或配置的端口）
  - [ ] 数据库：localhost:5432 可连接

### 若部署至云（AWS/GCP/Azure）

- [ ] 镜像已推送到注册表（DockerHub/ECR）
- [ ] 环境变量已通过密钥管理服务配置（不硬编码）
- [ ] CDN/LoadBalancer 已配置
- [ ] SSL 证书已部署
- [ ] 监控告警已启用（CPU, 内存, 错误率)

---

## 📋 最终检查

| 检查项           | 状态 | 备注             |
| ---------------- | ---- | ---------------- |
| 所有单元测试通过 | ☐    |                  |
| 所有集成测试通过 | ☐    |                  |
| E2E 测试通过     | ☐    |                  |
| 代码审查已批准   | ☐    |                  |
| 性能基准达到     | ☐    |                  |
| 文档已更新       | ☐    |                  |
| 备份已确认       | ☐    |                  |
| **就绪部署**     | ☐    | ✓ 全部通过时勾选 |

---

## 🔄 部署后验证

- [ ] 前端加载正常（无 JS 错误）
- [ ] 登录功能可用
- [ ] 单词学习可访问
- [ ] 导航按钮功能正常
- [ ] 动画流畅
- [ ] 错误提示清晰
- [ ] 日志无异常报警

---

**生成时间**：2026-05-05  
**有效期**：发布前 7 天
