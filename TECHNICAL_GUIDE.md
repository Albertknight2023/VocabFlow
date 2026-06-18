# 技术实现指南 - 登录动画 & 认证集成

## 快速导航

- **动画实现**：[动画组件架构](#动画组件架构)
- **认证流程**：[认证工作流](#认证工作流)
- **导航功能**：[单词导航](#单词导航)
- **故障排除**：[常见问题](#常见问题)

---

## 动画组件架构

### 文件结构

```
frontend/src/
├── components/
│   └── AnimatedCharacters.tsx (230 行，主动画逻辑)
├── styles/
│   └── animated-login.css (420 行，布局和样式)
└── views/
    └── LoginView.tsx (集成入口)
```

### 数据流

```
用户鼠标移动
    ↓
handleMouseMove() 防抖
    ↓
计算 pupilX, pupilY 范围（水平 ±5px，垂直 ±4px）
    ↓
更新 CSS 变量 (--pupil-x, --pupil-y)
    ↓
CSS transform: translate() 实时移动瞳孔
```

### 关键 Zustand 状态

```typescript
{
  focusedField: "username" | "password" | null,  // 输入焦点
  isPasswordVisible: boolean,                     // 密码可见性
  isLoginError: boolean,                          // 登录错误状态
  isTyping: boolean                               // 输入中状态
}
```

### CSS 变量与动画类

| 变量/类      | 用途           | 范围                  |
| ------------ | -------------- | --------------------- |
| `--pupil-x`  | 瞳孔水平位置   | -5 ～ +5px            |
| `--pupil-y`  | 瞳孔竖直位置   | -4 ～ +4px            |
| `.blink`     | 眨眼状态       | 应用到 .pupil 元素    |
| `.look-left` | 密码聚焦时左看 | 应用到整个 .char 元素 |
| `.error`     | 登录错误表情   | 应用到 .mouth 元素    |
| `.talk`      | 打字时口部抖动 | 应用到 .mouth 元素    |

### 性能优化

```javascript
// 防抖鼠标移动（16ms = ~60fps）
const throttledMouseMove = throttle((e) => {
  const x = (e.clientX - rectX - centerX) / (width / 2);
  const y = (e.clientY - rectY - centerY) / (height / 2);
  // 计算并更新 CSS 变量
}, 16);

window.addEventListener("mousemove", throttledMouseMove);
```

### 眨眼定时器

```javascript
// 每个角色独立计时
const blinks = Object.fromEntries(
  [0, 1, 2, 3].map((i) => [
    i,
    () => {
      const delay = Math.random() * 1800 + 800; // 800-2600ms
      setTimeout(() => {
        setBlinking((prev) => ({ ...prev, [i]: true }));
        setTimeout(
          () => {
            setBlinking((prev) => ({ ...prev, [i]: false }));
          },
          Math.random() * 120 + 80,
        ); // 80-200ms 眨眼时长
        blinks[i](); // 递归调用
      }, delay);
    },
  ]),
);
```

---

## 认证工作流

### 后端 API 合约

#### POST /api/auth/register

```json
请求体：
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}

响应 (200 OK)：
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "avatar_url": null
  }
}
```

#### POST /api/auth/login

```json
请求体：
{
  "username_or_email": "john_doe",  // 或 "john@example.com"
  "password": "securepass123"
}

响应 (200 OK)：(同注册响应)

错误响应 (401)：
{
  "detail": "Incorrect username/email or password"
}
```

### 前端状态管理

#### authStore.ts 的 User 类型

```typescript
interface User {
  id: number;
  username: string;
  email: string; // ← 扩展字段
  avatar_url: string | null; // ← 扩展字段
}

interface AuthStore {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // 方法
  login(username: string, password: string): Promise<void>;
  register(username: string, email: string, password: string): Promise<void>;
  logout(): void;
  checkAuth(): void;
}
```

#### 本地存储结构

```javascript
localStorage.getItem("authStore") ===
  JSON.stringify({
    state: {
      token: "eyJhbGc...",
      user: {
        id: 1,
        username: "test_user",
        email: "test@example.com",
        avatar_url: null,
      },
      // ...
    },
    version: 0,
  });
```

### Axios 请求拦截器

```typescript
// src/api/client.ts
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 认证检查流程

```typescript
// 应用启动时
useEffect(() => {
  useAuthStore.getState().checkAuth();
}, []);

// 路由守卫
{
  path: '/wordbooks',
  component: WordbooksView,
  beforeEnter: (to, from, next) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      next();
    } else {
      next('/login');
    }
  }
}
```

---

## 单词导航

### SpellingView 导航实现

```typescript
const [idx, setIdx] = useState(0);

const prev = () => {
  if (idx > 0) {
    setIdx(idx - 1);
    // 自动聚焦输入框准备拼写
    inputRef.current?.focus();
    inputRef.current?.select();
  }
};

const next = async () => {
  // 验证当前拼写
  const result = await spellingCheckApi(...);

  if (idx < words.length - 1) {
    setIdx(idx + 1);
    // 重置输入框
    setUserInput('');
    setCheckResult(null);
  } else {
    // 显示完成提示
    toast.success('该词本已全部完成！');
  }
};
```

### ReviewView 导航实现

```typescript
const [idx, setIdx] = useState(0);
const [submitting, setSubmitting] = useState(false);

const prev = () => {
  if (idx > 0 && !submitting) {
    setIdx(idx - 1);
  }
};

const next = async () => {
  if (idx < words.length - 1) {
    setIdx(idx + 1);
  } else {
    // 返回词本列表
    navigate(`/wordbooks/${bookId}`);
    toast.success('复习完成！');
  }
};

const mark = async (status: 'known' | 'unknown') => {
  setSubmitting(true);
  try {
    // 记录学习进度
    await recordProgressApi(...);
    // 自动进入下一个
    await next();
  } finally {
    setSubmitting(false);
  }
};
```

### 按钮布局（Tailwind）

```jsx
// SpellingView 按钮行
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <Button onClick={check}>检查</Button>
  <div className="flex gap-2">
    <Button variant="outline" size="sm" onClick={prev} disabled={idx === 0}>
      <ChevronLeft className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={next}
      disabled={idx === words.length - 1}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

## 常见问题

### Q1：眼睛重叠了怎么办？

**A：** 检查 animated-login.css 中的 CSS 变量是否正确应用到目标角色。

```css
/* 例如紫色角色的眼睛间距 */
#c-purple {
  --eye-side: 48px; /* 眼睛距离中线距离 */
  --eye-w: 30px; /* 眼睛宽度 */
}
```

调整这些值后刷新浏览器，重新计算。

### Q2：密码输入时眼睛变黑？

**A：** 确保 authored-login.css 中没有对 `.pupil` 的不透明度修改。

```css
/* 检查是否有这样的规则 */
.char.password-focus .pupil {
  opacity: 0; /* ← 错误，会导致黑眼 */
  background: var(--eye-color);
}
```

移除类似规则。

### Q3：后端返回 401 Unauthorized？

**A：** 按照以下流程排查：

1. 确认用户存在：`SELECT * FROM users WHERE username_or_email = 'xxx';`
2. 检查密码是否正确哈希：`python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).verify('inputpass', record.password_hash))"`
3. 检查 JWT 密钥未修改：`backend/.env` 中的 `SECRET_KEY`

### Q4：登录后自动重定向失败？

**A：** 检查前端路由配置：

```typescript
// src/router/AppRoutes.tsx
<Route path="/login" element={<LoginView />} />
<Route path="/wordbooks" element={<ProtectedRoute><WordbooksView /></ProtectedRoute>} />

// ProtectedRoute 组件应检查 authStore.isAuthenticated
```

### Q5：动画卡顿（低于 60fps）？

**A：**

- 确认防抖延迟设置为 16ms（60fps）
- 检查浏览器开发者工具 Performance 面板是否有长任务
- 关闭其他标签页重试

### Q6：prev 按钮在第一个单词时仍可点击？

**A：** 检查按钮的 `disabled` 属性绑定：

```jsx
<Button onClick={prev} disabled={idx === 0}>
  {/* 必须明确 idx <= 0 时禁用 */}
</Button>
```

---

## 依赖兼容性

| 包名         | 版本    | 用途        |
| ------------ | ------- | ----------- |
| react        | 18.x    | UI 框架     |
| zustand      | 4.x     | 状态管理    |
| axios        | 1.x     | HTTP 客户端 |
| lucide-react | 0.x     | 图标库      |
| tailwindcss  | 3.x     | CSS 框架    |
| typescript   | 5.x     | 类型检查    |
| fastapi      | 0.115.0 | 后端框架    |
| sqlalchemy   | 2.0.35  | ORM         |
| python-jose  | 3.3.0   | JWT         |
| bcrypt       | 4.0.1   | 密码哈希    |

---

## 环境配置

### 前端 .env

```bash
VITE_API_BASE_URL=http://localhost:8001/api
# 默认：http://<current-host>:8001/api
```

### 后端 .env

```bash
SECRET_KEY=<you-secret-key>  # JWT 密钥，默认生成
DATABASE_URL=postgresql://user:pass@localhost/db
DEBUG=True
```

---

## 下一步优化建议

1. **动画性能**
   - 考虑使用 WebGL 渲染复杂动画
   - 添加启用/禁用动画的用户设置

2. **认证安全**
   - 添加 CSRF 保护
   - 实现 refresh token 轮换
   - 添加登录风险检测

3. **UX 改进**
   - 添加键盘导航（Spacebar/ArrowKeys）
   - 实现单词关键字搜索
   - 显示学习进度条

4. **测试覆盖**
   - 添加 Vitest 单元测试
   - 添加 Playwright E2E 测试

---

**最后更新**：2026-05-05  
**维护者**：Copilot
