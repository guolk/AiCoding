# 迁移完成后指南

## 1. 项目验证

### 1.1 功能验证清单

迁移完成后，请按照以下清单验证所有功能：

#### 认证模块

| 功能 | 测试步骤 | 预期结果 |
|------|---------|---------|
| 登录 | 使用正确的账号密码登录 | 成功跳转到仪表盘 |
| 登录失败 | 使用错误的密码 | 显示错误提示，不跳转 |
| 记住登录 | 勾选"记住我"后登录 | 刷新页面后保持登录状态 |
| 登出 | 点击"退出登录" | 返回到登录页面，清除会话 |
| 权限检查 | 使用不同角色登录 | 权限控制正确生效 |

#### 用户管理模块

| 功能 | 测试步骤 | 预期结果 |
|------|---------|---------|
| 查看用户列表 | 进入用户管理页面 | 显示所有用户列表 |
| 搜索用户 | 在搜索框输入关键词 | 列表自动筛选匹配的用户 |
| 状态筛选 | 选择不同状态 | 列表按状态筛选 |
| 角色筛选 | 选择不同角色 | 列表按角色筛选 |
| 添加用户 | 点击"添加用户"，填写表单提交 | 用户成功创建，列表刷新 |
| 编辑用户 | 点击"编辑"，修改信息提交 | 用户信息成功更新 |
| 删除用户 | 点击"删除"，确认删除 | 用户成功删除，列表刷新 |
| 分页 | 切换页码 | 正确显示对应页的数据 |

#### 角色管理模块

| 功能 | 测试步骤 | 预期结果 |
|------|---------|---------|
| 查看角色列表 | 进入角色管理页面 | 显示所有角色列表 |
| 添加角色 | 点击"添加角色"，填写表单 | 角色成功创建 |
| 编辑角色 | 点击"编辑"，修改信息 | 角色信息成功更新 |
| 删除角色 | 点击"删除"，确认删除 | 角色成功删除（无用户时） |
| 权限树 | 编辑角色权限 | 权限树正确显示，可勾选 |

#### 仪表盘模块

| 功能 | 测试步骤 | 预期结果 |
|------|---------|---------|
| 统计数据 | 进入仪表盘 | 显示正确的统计数据 |
| 最近活动 | 查看活动列表 | 显示最近活动记录 |

#### 系统设置模块

| 功能 | 测试步骤 | 预期结果 |
|------|---------|---------|
| 标签切换 | 点击不同设置标签 | 正确切换设置内容 |
| 保存设置 | 修改设置后点击保存 | 设置成功保存 |

### 1.2 快速测试命令

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 类型检查（确保无TypeScript错误）
npm run typecheck

# 4. 运行E2E测试
npm run test:e2e

# 5. 启动Storybook查看组件
npm run storybook

# 6. 构建生产版本（验证构建是否成功）
npm run build
```

---

## 2. 新旧功能对比

### 2.1 功能一致性

| 功能 | jQuery版本 | React版本 | 状态 |
|------|-----------|-----------|------|
| 用户登录 | ✅ | ✅ | 一致 |
| 用户登出 | ✅ | ✅ | 一致 |
| 记住登录 | ✅ | ✅ | 一致 |
| 权限检查 | ✅ | ✅ | 一致 |
| 查看用户列表 | ✅ | ✅ | 一致 |
| 搜索用户 | ✅ | ✅ | 一致 |
| 筛选用户 | ✅ | ✅ | 一致 |
| 添加用户 | ✅ | ✅ | 一致 |
| 编辑用户 | ✅ | ✅ | 一致 |
| 删除用户 | ✅ | ✅ | 一致 |
| 分页功能 | ✅ | ✅ | 一致 |
| 查看角色列表 | ✅ | ✅ | 一致 |
| 添加角色 | ✅ | ✅ | 一致 |
| 编辑角色 | ✅ | ✅ | 一致 |
| 删除角色 | ✅ | ✅ | 一致 |
| 权限树配置 | ✅ | ✅ | 一致 |
| 查看权限列表 | ✅ | ✅ | 一致 |
| 仪表盘统计 | ✅ | ✅ | 一致 |
| 最近活动列表 | ✅ | ✅ | 一致 |
| 系统设置 | ✅ | ✅ | 一致 |
| 标签切换 | ✅ | ✅ | 一致 |

### 2.2 用户体验改进

| 改进点 | jQuery版本 | React版本 |
|---------|-----------|-----------|
| **数据缓存** | 每次都重新请求 | React Query自动缓存 |
| **乐观更新** | 无 | 删除等操作立即反馈 |
| **错误重试** | 无 | 网络错误自动重试 |
| **后台刷新** | 无 | 窗口聚焦时自动刷新 |
| **类型安全** | 运行时错误 | 编译时检查 |
| **开发体验** | DOM操作繁琐 | 声明式开发 |
| **组件复用** | 复制粘贴 | 组件化开发 |
| **调试工具** | Console.log | React DevTools |

---

## 3. 开发指南

### 3.1 项目结构说明

```
src/
├── types/              # TypeScript类型定义
│   └── index.ts        # 所有类型集中定义
│
├── context/            # React Context（全局状态）
│   ├── AuthContext.tsx # 认证状态
│   └── ToastContext.tsx # 通知状态
│
├── hooks/              # 自定义Hook
│   ├── usePagination.ts # 分页Hook
│   └── useDebounce.ts   # 防抖Hook
│
├── services/           # 服务层
│   ├── api.ts          # API服务（数据获取）
│   └── queryClient.ts  # React Query配置
│
├── schemas/            # Zod验证Schema
│   └── index.ts        # 表单验证Schema
│
├── components/         # UI组件
│   ├── Button.tsx      # 按钮组件
│   ├── Input.tsx       # 输入框组件
│   ├── Select.tsx      # 下拉组件
│   ├── Modal.tsx       # 模态框组件
│   ├── Table.tsx       # 表格组件
│   ├── Pagination.tsx  # 分页组件
│   ├── Loading.tsx     # 加载组件
│   ├── ToastContainer.tsx # 通知容器
│   ├── Layout.tsx      # 布局组件
│   └── *.stories.tsx   # Storybook示例
│
├── pages/              # 页面组件
│   ├── LoginPage.tsx   # 登录页面
│   ├── DashboardPage.tsx # 仪表盘页面
│   ├── UsersPage.tsx   # 用户管理页面
│   ├── RolesPage.tsx   # 角色管理页面
│   ├── PermissionsPage.tsx # 权限管理页面
│   └── SettingsPage.tsx # 系统设置页面
│
├── router/             # 路由相关
│   └── PrivateRoute.tsx # 路由守卫
│
├── App.tsx             # 主应用组件
├── main.tsx            # 入口文件
└── index.css           # 全局样式
```

### 3.2 常用开发模式

#### 添加新页面

```typescript
// 1. 在 pages/ 创建新页面组件
// src/pages/NewPage.tsx
import Layout from '@/components/Layout';

export function NewPage() {
  return (
    <Layout>
      <div>
        <h1>新页面</h1>
        {/* 页面内容 */}
      </div>
    </Layout>
  );
}

export default NewPage;

// 2. 在 App.tsx 添加路由
// src/App.tsx
import NewPage from '@/pages/NewPage';

<Route
  path="/new-page"
  element={
    <PrivateRoute>
      <NewPage />
    </PrivateRoute>
  }
/>
```

#### 添加新组件

```typescript
// 1. 在 components/ 创建组件
// src/components/NewComponent.tsx
interface NewComponentProps {
  title: string;
  onClick?: () => void;
}

export function NewComponent({ title, onClick }: NewComponentProps) {
  return (
    <div className="border rounded p-4">
      <h3>{title}</h3>
      <button onClick={onClick}>点击</button>
    </div>
  );
}

export default NewComponent;

// 2. （可选）创建Storybook示例
// src/components/NewComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import NewComponent from './NewComponent';

const meta = {
  title: 'Components/NewComponent',
  component: NewComponent,
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof NewComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '示例标题',
  },
};
```

#### 添加新API方法

```typescript
// 1. 在 src/types/index.ts 添加类型
// src/types/index.ts
export interface NewData {
  id: number;
  name: string;
  // ...
}

// 2. 在 src/services/api.ts 添加API方法
// src/services/api.ts
export const api = {
  // ... 现有方法
  
  async getNewData(): Promise<NewData[]> {
    // 实现API调用
    // 注意：保持与jQuery版本相同的数据结构
  },
  
  async createNewData(data: NewDataRequest): Promise<NewData> {
    // 实现创建逻辑
  },
};

// 3. 在 src/services/queryClient.ts 添加查询键
// src/services/queryClient.ts
export const queryKeys = {
  // ... 现有键
  
  newData: {
    all: ['newData'] as const,
    list: () => [...queryKeys.newData.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.newData.all, 'detail', id] as const,
  },
};
```

### 3.3 React Query使用模式

#### 数据获取

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';

function SomeComponent() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.someData.list({ param: 'value' }),
    queryFn: () => api.getSomeData({ param: 'value' }),
    staleTime: 60 * 1000, // 1分钟缓存
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div>
        <p>{error.message}</p>
        <button onClick={() => refetch()}>重试</button>
      </div>
    );
  }

  return <div>{/* 使用数据 */}</div>;
}
```

#### 数据修改

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';

function SomeComponent() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const mutation = useMutation({
    mutationFn: api.createSomeData,
    
    // 乐观更新（请求前更新UI）
    onMutate: async (newData) => {
      // 1. 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: queryKeys.someData.all });
      
      // 2. 保存当前状态
      const previousData = queryClient.getQueryData(
        queryKeys.someData.list()
      );
      
      // 3. 乐观更新
      queryClient.setQueryData(
        queryKeys.someData.list(),
        (old: any) => ({
          ...old,
          items: [...old.items, newData],
          total: old.total + 1,
        })
      );
      
      // 返回context用于回滚
      return { previousData };
    },
    
    // 请求成功
    onSuccess: () => {
      showSuccess('创建成功');
      // 使缓存失效，获取最新数据
      queryClient.invalidateQueries({ queryKey: queryKeys.someData.all });
    },
    
    // 请求失败：回滚
    onError: (err, _newData, context) => {
      showError('创建失败：' + err.message);
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.someData.list(),
          context.previousData
        );
      }
    },
    
    // 请求完成后
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.someData.all });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate(newData)}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? '创建中...' : '创建'}
    </button>
  );
}
```

---

## 4. 常见问题解答

### Q1: 如何切换回jQuery版本？

**A:** 本项目采用Strangler Fig模式，两个版本共存：

```
项目结构：
├── legacy/           # jQuery版本（完整可独立运行）
├── src/              # React版本
└── index.html        # React版本入口
```

**运行jQuery版本：**
```bash
# 方式1：直接在浏览器打开 legacy/index.html
# 方式2：使用本地服务器
cd legacy
npx serve .  # 然后访问 http://localhost:3000
```

**运行React版本：**
```bash
npm install
npm run dev  # 访问 http://localhost:3000
```

### Q2: 如何处理前后端API迁移？

**A:** 本项目使用Mock API，迁移到真实后端时：

1. **修改API服务层**
```typescript
// src/services/api.ts
// 将mock数据替换为真实API调用

const API_BASE_URL = 'https://api.example.com';

export const api = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new ApiError('登录失败', response.status);
    }
    
    return response.json();
  },
  
  // ... 其他方法类似
};
```

2. **添加请求拦截器（可选）**
```typescript
// 添加token到请求头
const getToken = (): string | null => {
  return sessionStorage.getItem('token');
};

// 在fetch中添加
const response = await fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  },
  // ...
});
```

### Q3: TypeScript类型错误如何处理？

**A:** 首先确保所有类型定义正确：

```bash
# 运行类型检查
npm run typecheck
```

**常见错误及解决方案：**

1. **属性不存在**
```typescript
// 错误：Property 'id' does not exist on type 'unknown'
// 解决：确保类型定义正确
interface MyType {
  id: number;
  name: string;
}

// 或使用类型断言
const data = response.data as MyType;
```

2. **类型不兼容**
```typescript
// 错误：Type 'string' is not assignable to type 'number'
// 解决：确保类型一致
const value: number = Number(stringValue);
```

3. **可选属性访问**
```typescript
// 错误：Object is possibly 'undefined'
// 解决：使用可选链或空值合并
const name = user?.name ?? '默认名称';
```

### Q4: 如何添加新的表单验证？

**A:** 使用Zod Schema：

```typescript
// src/schemas/index.ts
import { z } from 'zod';

// 1. 定义Schema
export const newFormSchema = z.object({
  name: z
    .string()
    .min(2, '名称至少需要2个字符')
    .max(50, '名称不能超过50个字符'),
  
  email: z
    .string()
    .email('请输入有效的邮箱地址'),
  
  age: z.coerce
    .number()
    .int('年龄必须是整数')
    .min(18, '年龄不能小于18岁')
    .max(120, '年龄不能大于120岁'),
  
  password: z
    .string()
    .min(8, '密码至少需要8个字符'),
  
  confirmPassword: z
    .string(),
})
// 交叉验证
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }
);

// 2. 自动生成类型
export type NewFormData = z.infer<typeof newFormSchema>;

// 3. 在组件中使用
const { register, handleSubmit, formState: { errors } } = useForm<NewFormData>({
  resolver: zodResolver(newFormSchema),
  defaultValues: {
    name: '',
    email: '',
    age: 18,
    password: '',
    confirmPassword: '',
  },
});
```

### Q5: 如何优化性能？

**A:** React应用性能优化建议：

1. **使用React Query缓存**
```typescript
// 已经内置，确保staleTime配置合理
useQuery({
  queryKey: [...],
  queryFn: ...,
  staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  gcTime: 10 * 60 * 1000,  // 10分钟后清理缓存
});
```

2. **防抖搜索**
```typescript
// 已实现 useDebounce Hook
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300); // 300ms延迟

useQuery({
  queryKey: ['users', 'list', debouncedSearch],
  queryFn: () => api.getUsers({ search: debouncedSearch }),
});
```

3. **组件懒加载**
```typescript
// 对于大页面使用React.lazy
const UsersPage = lazy(() => import('@/pages/UsersPage'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Route path="/users" element={<UsersPage />} />
    </Suspense>
  );
}
```

4. **使用useMemo和useCallback**
```typescript
// 缓存计算结果
const filteredUsers = useMemo(() => {
  return users.filter(u => u.status === 'active');
}, [users]);

// 缓存回调函数
const handleClick = useCallback((id: number) => {
  // 处理逻辑
}, [/* 依赖项 */]);
```

---

## 5. 回滚方案

如果迁移后出现问题，可以按以下步骤回滚：

### 5.1 紧急回滚

```bash
# 1. 停止React版本服务
# Ctrl + C 停止 npm run dev

# 2. 启动jQuery版本
cd legacy
npx serve . -p 3000
```

### 5.2 数据同步

两个版本使用相同的Mock数据结构，实际生产环境中：

1. **数据库**：两个版本连接相同的数据库
2. **API接口**：确保API响应格式一致
3. **Session存储**：使用相同的Session Storage键名

### 5.3 逐步回滚策略

```
阶段1：保持两个版本同时运行
├── /login      → 可选择使用任一版本
├── /dashboard  → React版本（优先）
├── /users      → React版本
└── /settings   → jQuery版本（待验证）

阶段2：验证后完全切换
├── 所有路由 → React版本
└── legacy/ 保留作为备份

阶段3：回滚（如需要）
├── 所有路由 → jQuery版本
└── src/ 保留作为备份
```

---

## 6. 后续优化建议

### 6.1 短期优化（1-2周）

1. **添加更多单元测试**
2. **完善Storybook组件文档**
3. **添加错误边界（Error Boundaries）**
4. **优化移动端响应式设计**

### 6.2 中期优化（1-2月）

1. **集成真实后端API**
2. **添加用户体验追踪（Analytics）**
3. **实现国际化（i18n）**
4. **添加深色模式主题**

### 6.3 长期优化（3-6月）

1. **性能监控和优化**
2. **代码分割和按需加载**
3. **服务端渲染（SSR）或静态生成（SSG）**
4. **PWA支持（离线访问）**

---

## 7. 快速参考

### 7.1 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run typecheck    # 类型检查
npm run lint         # 代码检查

# 测试
npm run test:e2e     # 运行Playwright测试
npm run test:e2e:ui  # 运行Playwright测试UI

# 文档
npm run storybook    # 启动Storybook

# 构建
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
```

### 7.2 项目依赖

| 依赖 | 用途 | 版本 |
|------|------|------|
| React | UI框架 | ^18.3.1 |
| React Router | 路由 | ^6.28.0 |
| TanStack Query | 数据管理 | ^5.61.0 |
| React Hook Form | 表单处理 | ^7.53.0 |
| Zod | 验证Schema | ^3.23.8 |
| Tailwind CSS | 样式框架 | - |
| TypeScript | 类型系统 | ^5.7.0 |
| Playwright | E2E测试 | ^1.48.0 |
| Storybook | 组件文档 | ^8.4.0 |

### 7.3 关键文件

| 文件 | 用途 |
|------|------|
| `src/types/index.ts` | 所有TypeScript类型定义 |
| `src/services/api.ts` | API服务层 |
| `src/services/queryClient.ts` | React Query配置和查询键 |
| `src/schemas/index.ts` | Zod验证Schema |
| `src/context/AuthContext.tsx` | 认证状态管理 |
| `src/context/ToastContext.tsx` | 通知状态管理 |
| `src/App.tsx` | 主应用和路由配置 |
