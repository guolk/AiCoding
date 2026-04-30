# 核心代码说明文档

## 1. 项目架构总览

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                          用户界面层                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  Pages  │ │Components│ │  Router │ │  Layout │          │
│  │  (页面) │ │  (组件)  │ │  (路由) │ │  (布局) │          │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘          │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
┌───────┴────────────┴────────────┴────────────┴──────────────┐
│                         状态管理层                              │
│  ┌─────────────────┐  ┌─────────────────┐                    │
│  │  AuthContext    │  │  ToastContext   │                    │
│  │  (认证状态)      │  │  (通知状态)      │                    │
│  └────────┬────────┘  └────────┬────────┘                    │
└───────────┼─────────────────────┼─────────────────────────────┘
            │                     │
┌───────────┴─────────────────────┴─────────────────────────────┐
│                         数据管理层                              │
│  ┌─────────────────┐  ┌─────────────────┐                    │
│  │  React Query    │  │  API Service    │                    │
│  │  (缓存/状态)     │  │  (数据获取)      │                    │
│  └────────┬────────┘  └────────┬────────┘                    │
└───────────┼─────────────────────┼─────────────────────────────┘
            │                     │
┌───────────┴─────────────────────┴─────────────────────────────┐
│                         基础设施层                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  TypeScript │ │   Hooks     │ │   Zod       │            │
│  │  (类型系统)  │ │ (自定义Hook) │ │ (验证Schema)│            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 数据流

```
用户操作 → UI组件 → React Query → API服务 → 后端API
              ↓
         Context更新
              ↓
         UI重新渲染
```

---

## 2. 类型系统

### 2.1 类型定义总览

所有类型集中定义在 `src/types/index.ts`，确保类型一致性。

### 2.2 核心类型详解

#### 基础实体类型

```typescript
// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  status: UserStatus;
  createdAt: string;
  lastLogin: string | null;
}

// 角色类型
export interface Role {
  id: number;
  name: string;
  description: string;
  permissionIds: number[];
  createdAt: string;
  isDefault: boolean;
}

// 权限类型
export interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  parentId: number | null;
  children?: Permission[];
}
```

**类型特点：**

| 类型 | 用途 | 关键字段 |
|------|------|---------|
| `User` | 用户实体 | id, username, email, roleId, status |
| `Role` | 角色实体 | id, name, permissionIds, isDefault |
| `Permission` | 权限实体 | id, code, parentId, children |
| `UserStatus` | 枚举类型 | 'active', 'inactive', 'locked' |

#### 表单类型

```typescript
// 登录表单
export interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

// 创建/编辑用户表单
export interface UserFormData {
  username: string;
  email: string;
  roleId: number;
  password?: string;
  confirmPassword?: string;
  status: UserStatus;
}
```

**表单类型关联：**

- 表单类型通过 `z.infer<typeof schema>` 从Zod Schema自动生成
- 确保前端表单字段与后端API要求一致

#### API响应类型

```typescript
// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 登录响应
export interface LoginResponse {
  user: User & { role: Role; permissions: Permission[] };
  token: string;
}
```

**API响应设计原则：**

1. **统一包装**：所有API响应使用相同的结构
2. **类型泛型**：`PaginatedResponse<T>` 支持任意数据类型
3. **元数据**：分页响应包含总数、当前页、页大小等元数据

---

## 3. 状态管理

### 3.1 AuthContext - 认证状态管理

#### 设计思路

**传统jQuery方式的问题：**

```javascript
// jQuery全局变量方式（问题：难以追踪、类型不安全）
window.currentUser = { id: 1, username: 'admin' };
window.isAuthenticated = true;
localStorage.setItem('token', 'xxx');

// 问题：
// 1. 全局变量容易被意外修改
// 2. 没有类型检查
// 3. 状态变化无法触发UI更新
// 4. 持久化逻辑分散在各处
```

**React Context + useReducer方案：**

```typescript
// 状态定义
interface AuthState {
  isAuthenticated: boolean;
  user: (User & { role: Role; permissions: Permission[] }) | null;
  token: string | null;
}

// Action类型（有限状态机）
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: LoginResponse }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_AUTH'; payload: AuthState };
```

#### Reducer纯函数

```typescript
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
      
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
      
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
      
    case 'LOGOUT':
      return initialState;
      
    case 'RESTORE_AUTH':
      return {
        ...action.payload,
        isLoading: false,
        error: null,
      };
      
    default:
      return state;
  }
}
```

**为什么用useReducer？**

| 特性 | useState | useReducer |
|------|---------|------------|
| 状态复杂度 | 简单状态 | 复杂状态、多子状态 |
| 状态间依赖 | 需手动处理 | reducer自动处理 |
| 可测试性 | 一般 | 高（纯函数） |
| 调试追踪 | 困难 | 清晰（Action日志） |

**本项目使用useReducer的原因：**

1. 认证状态涉及多个关联字段（isAuthenticated, user, token）
2. 需要明确的状态转换流程
3. 便于追踪状态变化历史
4. 纯函数便于测试

#### Provider组件

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 恢复认证状态（从sessionStorage）
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth) as AuthState;
        dispatch({ type: 'RESTORE_AUTH', payload: authData });
      } catch (e) {
        console.error('Failed to parse auth data:', e);
      }
    }
  }, []);

  // 持久化认证状态
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.token) {
      const authToSave: AuthState = {
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      };
      sessionStorage.setItem('auth', JSON.stringify(authToSave));
      
      // "记住我"功能：额外保存到localStorage
      if (state.token) {
        localStorage.setItem('token', state.token);
      }
    }
  }, [state.isAuthenticated, state.user, state.token]);

  // 登录方法
  const login = useCallback(async (data: LoginFormData): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await api.login(data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      return false;
    }
  }, []);

  // 登出方法
  const logout = useCallback(() => {
    sessionStorage.removeItem('auth');
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**持久化策略：**

| 存储位置 | 用途 | 生命周期 |
|---------|------|---------|
| `sessionStorage` | 认证状态 | 浏览器标签页关闭即清除 |
| `localStorage` | Token（记住我） | 持久化，需手动清除 |

#### useAuth Hook

```typescript
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  // 安全检查：确保在Provider内使用
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
```

**使用示例：**

```typescript
// 在组件中使用
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Link to="/login">登录</Link>;
  }
  
  return (
    <div>
      <span>欢迎，{user?.username}</span>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

### 3.2 ToastContext - 通知状态管理

#### 设计模式

采用**发布-订阅模式**，通过Context全局管理通知状态。

```typescript
// 通知类型
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Context类型
interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}
```

**为什么使用独立的ToastContext？**

1. **关注点分离**：通知逻辑独立于业务逻辑
2. **全局访问**：任何组件都可以触发通知
3. **统一管理**：所有通知在一处处理，便于维护

#### 使用示例

```typescript
function UserForm() {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: api.createUser,
    
    onSuccess: () => {
      showSuccess('用户创建成功');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    
    onError: (error) => {
      showError('创建失败：' + error.message);
    },
  });
  
  // ...
}
```

---

## 4. 数据管理

### 4.1 React Query 配置

#### 为什么选择React Query？

| 特性 | jQuery $.ajax | React Query |
|------|--------------|-------------|
| 数据缓存 | 需手动实现 | 自动缓存 |
| 状态同步 | 手动管理 | 自动同步 |
| 错误重试 | 手动编写 | 内置支持 |
| 乐观更新 | 复杂实现 | 简单配置 |
| 开发工具 | 无 | DevTools支持 |

#### 核心配置

```typescript
// src/services/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5分钟内数据视为新鲜
      gcTime: 10 * 60 * 1000,         // 10分钟后清理缓存
      
      // 重试策略
      retry: (failureCount, error) => {
        // 客户端错误（4xx）不重试
        if (error instanceof ApiError) {
          if (error.status && error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        // 其他错误最多重试3次
        return failureCount < 3;
      },
      
      // 重试延迟（指数退避）
      retryDelay: (attemptIndex) => 
        Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // 窗口聚焦时自动刷新
      refetchOnWindowFocus: true,
      
      // 重新连接时自动刷新
      refetchOnReconnect: true,
    },
  },
});
```

**配置参数详解：**

| 参数 | 值 | 说明 |
|------|---|------|
| `staleTime` | 5分钟 | 数据在这段时间内不会重新获取 |
| `gcTime` | 10分钟 | 缓存保留时间，超过后清理 |
| `retry` | 动态 | 4xx错误不重试，其他最多3次 |
| `retryDelay` | 指数退避 | 1s → 2s → 4s → 最多30s |
| `refetchOnWindowFocus` | true | 用户切回页面时刷新数据 |

#### 查询键设计

```typescript
export const queryKeys = {
  users: {
    all: ['users'] as const,
    list: (params?: { page?: number; search?: string; status?: string; roleId?: number }) =>
      [...queryKeys.users.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.users.all, 'detail', id] as const,
  },
  
  roles: {
    all: ['roles'] as const,
    list: () => [...queryKeys.roles.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.roles.all, 'detail', id] as const,
  },
  
  // ...
};
```

**查询键层级结构：**

```
['users']                    ← 顶级（用于失效所有用户相关缓存）
['users', 'list']            ← 列表级别
['users', 'list', { page: 1 }]  ← 具体查询
['users', 'detail', 1]       ← 单个用户
```

**为什么这样设计？**

1. **精细控制**：可以失效特定层级的缓存
2. **类型安全**：`as const` 确保类型正确
3. **可读性**：键名清晰表达查询含义

### 4.2 API服务层

#### 架构设计

```typescript
// src/services/api.ts

// 1. 自定义错误类
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 2. Mock数据（模拟后端）
const mockUsers: User[] = [
  { id: 1, username: 'admin', email: 'admin@example.com', ... },
  { id: 2, username: 'user1', email: 'user1@example.com', ... },
  // ...
];

// 3. API方法
export const api = {
  // 登录
  async login(data: LoginRequest): Promise<LoginResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(
      u => u.username === data.username && u.status === 'active'
    );
    
    if (!user) {
      throw new ApiError('用户名或密码错误', 401);
    }
    
    const role = mockRoles.find(r => r.id === user.roleId);
    const permissions = role ? getPermissionsByIds(role.permissionIds) : [];
    
    return {
      user: { ...user, role: role!, permissions },
      token: 'mock-jwt-token-' + Date.now(),
    };
  },
  
  // 获取用户列表（分页）
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    roleId?: number;
  }): Promise<PaginatedResponse<User>> {
    // 实现：筛选、分页、排序
    // ...
  },
  
  // 创建用户
  async createUser(data: CreateUserRequest): Promise<User> {
    // 实现：创建新用户
    // ...
  },
  
  // 更新用户
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    // 实现：更新用户
    // ...
  },
  
  // 删除用户
  async deleteUser(id: number): Promise<void> {
    // 实现：删除用户
    // ...
  },
};
```

**为什么使用服务层？**

| 优势 | 说明 |
|------|------|
| **关注点分离** | 数据获取逻辑与UI组件分离 |
| **易于测试** | 可以单独测试API方法 |
| **易于替换** | 从Mock切换到真实API只需修改此处 |
| **统一处理** | 错误处理、请求拦截统一在服务层处理 |

### 4.3 数据获取模式

#### useQuery - 数据查询

```typescript
function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<UserStatus | 'all'>('all');
  const [roleId, setRoleId] = useState<number | undefined>();
  
  // 防抖搜索
  const debouncedSearch = useDebounce(search, 300);
  
  // 查询用户列表
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.users.list({
      page,
      search: debouncedSearch,
      status: status === 'all' ? undefined : status,
      roleId,
    }),
    queryFn: () => api.getUsers({
      page,
      search: debouncedSearch,
      status: status === 'all' ? undefined : status,
      roleId,
    }),
    // 当搜索参数变化时，保持之前的数据显示
    placeholderData: keepPreviousData,
  });
  
  // 查询角色列表（用于筛选）
  const { data: rolesData } = useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: api.getRoles,
  });
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>重新加载</Button>
      </div>
    );
  }
  
  return (
    <Table
      columns={columns}
      data={data?.items || []}
      loading={isLoading}
    />
  );
}
```

**useQuery状态管理：**

```
┌─────────────────────────────────────────────────────┐
│                    useQuery 状态                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  isLoading     →   首次加载中                      │
│  isFetching    →   任何时候加载中（包括刷新）      │
│  isSuccess     →   数据获取成功                    │
│  isError       →   获取失败                        │
│  data          →   获取到的数据                    │
│  error         →   错误信息                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### useMutation - 数据修改

```typescript
function UsersPage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  
  // 删除用户Mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteUser,
    
    // 乐观更新：请求前就更新UI
    onMutate: async (id) => {
      // 1. 取消正在进行的相关查询
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });
      
      // 2. 保存当前状态（用于回滚）
      const previousData = queryClient.getQueryData(
        queryKeys.users.list()
      );
      
      // 3. 乐观更新缓存
      queryClient.setQueryData(
        queryKeys.users.list(),
        (old: PaginatedResponse<User> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter(u => u.id !== id),
            total: old.total - 1,
          };
        }
      );
      
      // 返回context用于回滚
      return { previousData };
    },
    
    // 请求成功
    onSuccess: () => {
      showSuccess('用户删除成功');
    },
    
    // 请求失败：回滚
    onError: (error, _id, context) => {
      showError('删除失败：' + error.message);
      
      // 回滚到之前的状态
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.users.list(),
          context.previousData
        );
      }
    },
    
    // 请求完成后：失效缓存，获取最新数据
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
  
  const handleDelete = (user: User) => {
    if (window.confirm(`确定要删除用户 "${user.username}" 吗？`)) {
      deleteMutation.mutate(user.id);
    }
  };
}
```

**乐观更新流程图：**

```
用户点击删除
      ↓
   onMutate
      ├── 取消相关查询
      ├── 保存当前状态
      └── 乐观更新缓存（UI立即响应）
      ↓
   发送API请求
      ↓
   请求成功？
   ├── 是 → onSuccess → 显示成功提示
   └── 否 → onError → 回滚缓存 + 显示错误
      ↓
   onSettled
      └── 失效缓存，获取最新数据
```

**为什么使用乐观更新？**

| 场景 | 乐观更新 | 等待响应 |
|------|---------|---------|
| 用户体验 | 立即反馈，感觉很快 | 有延迟，等待加载 |
| 失败处理 | 需要回滚逻辑 | 无需额外处理 |
| 适用场景 | 高频操作、删除、点赞 | 重要操作、创建、支付 |

本项目中，**删除操作**使用乐观更新，因为：
1. 删除操作相对简单
2. 用户期望立即看到效果
3. 失败时可以清晰地回滚

---

## 5. 表单处理

### 5.1 为什么选择 React Hook Form + Zod？

#### 技术对比

| 方案 | 性能 | 类型安全 | 开发体验 | 包大小 |
|------|------|---------|---------|--------|
| jQuery 原生验证 | 一般 | ❌ 无 | 繁琐 | 无（手写） |
| Formik + Yup | 较慢 | ✅ 有 | 好 | 较大 |
| **React Hook Form + Zod** | **快** | ✅ **有** | **优秀** | **小** |

#### React Hook Form 优势

1. **非受控组件**：不使用 state 管理每个输入值
2. **极少重渲染**：输入变化时不会触发整棵树重渲染
3. **原生支持**：直接使用 DOM ref，接近原生性能

### 5.2 Zod Schema 设计

```typescript
// src/schemas/index.ts
import { z } from 'zod';

// 创建用户Schema
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  
  email: z
    .string()
    .email('请输入有效的邮箱地址'),
  
  password: z
    .string()
    .min(6, '密码至少需要6个字符'),
  
  confirmPassword: z
    .string()
    .min(6, '确认密码至少需要6个字符'),
  
  roleId: z
    .coerce
    .number({ invalid_type_error: '请选择角色' }),
})
// 交叉验证：两次密码必须一致
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],  // 错误显示在哪个字段
  }
);

// 自动生成TypeScript类型
export type CreateUserFormData = z.infer<typeof createUserSchema>;
```

**Schema vs 类型的关系：**

```
Zod Schema               →  运行时验证
     ↓
z.infer<typeof schema>   →  编译时类型
```

**为什么使用 Zod 而不是手写类型？**

| 特性 | 手写TypeScript类型 | Zod Schema |
|------|------------------|------------|
| 编译时检查 | ✅ 有 | ✅ 有（通过z.infer） |
| 运行时验证 | ❌ 无 | ✅ 有 |
| 错误消息 | 无 | 可自定义 |
| 数据转换 | 无 | `z.coerce` 支持 |
| 交叉验证 | 无 | `refine` 支持 |

### 5.3 表单组件实现

```typescript
// src/pages/UsersPage.tsx 中的表单部分
function AddUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  
  // 1. 初始化React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),  // 绑定Zod验证
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: 2,  // 默认普通用户
    },
  });
  
  // 2. 提交处理
  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await api.createUser({
        username: data.username,
        email: data.email,
        password: data.password,
        roleId: data.roleId,
        status: 'active',
      });
      
      showSuccess('用户创建成功');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      
      setIsOpen(false);
      reset();  // 重置表单
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建失败';
      showError(message);
    }
  };
  
  // 3. 渲染表单
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="添加用户"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="用户名"
          placeholder="请输入用户名"
          error={errors.username?.message}
          {...register('username')}
        />
        
        <Input
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <Input
          label="密码"
          type="password"
          placeholder="请输入密码"
          error={errors.password?.message}
          {...register('password')}
        />
        
        <Input
          label="确认密码"
          type="password"
          placeholder="请再次输入密码"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        
        <Select
          label="角色"
          placeholder="请选择角色"
          error={errors.roleId?.message}
          options={rolesData?.items.map(r => ({
            value: String(r.id),
            label: r.name,
          })) || []}
          {...register('roleId')}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            取消
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
          >
            创建
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

**React Hook Form 核心概念：**

| 概念 | 说明 |
|------|------|
| `register` | 将输入框注册到表单，返回 `{ name, onChange, onBlur, ref }` |
| `handleSubmit` | 处理表单提交，自动进行验证 |
| `formState.errors` | 验证错误信息 |
| `formState.isSubmitting` | 提交中状态 |
| `reset` | 重置表单到默认值 |
| `zodResolver` | 连接React Hook Form和Zod的桥梁 |

### 5.4 表单组件封装

#### Input 组件

```typescript
// src/components/Input.tsx
import * as React from 'react';

// 使用forwardRef让组件可以接受ref（React Hook Form需要）
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
  }
>(({ label, error, className, ...props }, ref) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className || ''}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
```

**为什么使用 forwardRef？**

React Hook Form 使用 `ref` 来直接操作 DOM 元素，以获得最佳性能。如果不使用 `forwardRef`，表单验证将无法正常工作。

---

## 6. 自定义 Hook

### 6.1 usePagination - 分页Hook

```typescript
// src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  total: number;
  pageSize?: number;
  initialPage?: number;
}

export function usePagination(options: UsePaginationOptions) {
  const { total, pageSize = 10, initialPage = 1 } = options;
  
  // 当前页码
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);
  
  // 计算起始索引和结束索引
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  
  // 计算要显示的页码（带省略号）
  const visiblePages = useMemo(() => {
    const delta = 2;  // 当前页前后显示多少个
    const range: (number | string)[] = [];
    
    for (let i = 1; i <= totalPages; i++) {
      // 始终显示第一页、最后一页、当前页附近的页
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    
    return range;
  }, [currentPage, totalPages]);
  
  // 导航方法
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  
  // 是否可以导航
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  
  return {
    // 状态
    currentPage,
    totalPages,
    pageSize,
    startIndex,
    endIndex,
    total,
    
    // 显示的页码
    visiblePages,
    
    // 导航方法
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage,
    
    // 导航状态
    canGoPrevious,
    canGoNext,
  };
}
```

**使用示例：**

```typescript
function SomeComponent() {
  const pagination = usePagination({
    total: 100,
    pageSize: 10,
    initialPage: 1,
  });
  
  return (
    <Pagination
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      visiblePages={pagination.visiblePages}
      onPageChange={pagination.goToPage}
      canGoPrevious={pagination.canGoPrevious}
      canGoNext={pagination.canGoNext}
      onPrevious={pagination.goToPreviousPage}
      onNext={pagination.goToNextPage}
    />
  );
}
```

### 6.2 useDebounce - 防抖Hook

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // 设置定时器，延迟更新值
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // 清理函数：value变化或组件卸载时清除定时器
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
```

**使用场景 - 搜索框：**

```typescript
function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);  // 300ms延迟
  
  // 只有当debouncedSearch变化时才发送请求
  const { data } = useQuery({
    queryKey: ['users', 'search', debouncedSearch],
    queryFn: () => api.searchUsers(debouncedSearch),
    enabled: debouncedSearch.length > 0,  // 至少输入1个字符才搜索
  });
  
  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="搜索用户..."
    />
  );
}
```

**防抖 vs 节流：**

| 概念 | 说明 | 适用场景 |
|------|------|---------|
| **防抖 (Debounce)** | 等待一段时间，没有新输入才执行 | 搜索输入、窗口调整 |
| **节流 (Throttle)** | 一段时间内最多执行一次 | 滚动监听、按钮点击 |

---

## 7. 路由系统

### 7.1 React Router v6 配置

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { queryClient } from '@/services/queryClient';
import { PrivateRoute } from '@/router/PrivateRoute';
import ToastContainer from '@/components/ToastContainer';

// 页面组件
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import RolesPage from '@/pages/RolesPage';
import PermissionsPage from '@/pages/PermissionsPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* 公开路由：登录页 */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* 受保护路由：需要登录 */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <UsersPage />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/roles"
                element={
                  <PrivateRoute>
                    <RolesPage />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/permissions"
                element={
                  <PrivateRoute>
                    <PermissionsPage />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
              
              {/* 重定向：根路径到仪表盘 */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404：重定向到仪表盘 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          
          {/* 全局通知容器 */}
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### 7.2 路由守卫 - PrivateRoute

```typescript
// src/router/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // 未登录：重定向到登录页，并保存当前路径
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}  // 登录后可以跳转回来
        replace
      />
    );
  }
  
  // 已登录：渲染子组件
  return <>{children}</>;
}
```

**登录后跳转回原页面：**

```typescript
// src/pages/LoginPage.tsx
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data);
    
    if (success) {
      // 从location.state获取之前的路径
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };
}
```

---

## 8. 组件设计

### 8.1 组件设计原则

| 原则 | 说明 | 示例 |
|------|------|------|
| **单一职责** | 一个组件只做一件事 | Button只负责按钮样式和状态 |
| **可组合** | 组件可以组合使用 | Layout包含Sidebar和Content |
| **可复用** | 组件可以在多处使用 | Modal、Input、Table |
| **类型安全** | 完整的TypeScript类型 | 所有props都有类型定义 |
| **无障碍** | 支持键盘导航和屏幕阅读器 | 使用forwardRef、语义化HTML |

### 8.2 通用组件示例

#### Button 组件

```typescript
// src/components/Button.tsx
import * as React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center
          font-medium rounded-md
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className || ''}
        `}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**组件设计亮点：**

1. **变体系统**：primary/secondary/danger 三种样式变体
2. **尺寸系统**：sm/md/lg 三种尺寸
3. **加载状态**：内置 loading 状态和动画
4. **组合式样式**：使用 Tailwind 的工具类组合
5. **无障碍支持**：正确处理 disabled 状态，使用 forwardRef

#### Modal 组件

```typescript
// src/components/Modal.tsx
import * as React from 'react';
import { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // 1. 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);
  
  // 2. ESC键关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);
  
  // 3. 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* 模态框内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative bg-white rounded-lg shadow-xl
            w-full ${sizeClasses[size]}
            transform transition-all
          `}
        >
          {/* 头部 */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* 内容 */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Modal组件特性：**

| 特性 | 实现方式 |
|------|---------|
| 背景锁定 | `document.body.style.overflow = 'hidden'` |
| ESC键关闭 | 监听 `keydown` 事件 |
| 点击背景关闭 | 判断 `e.target === e.currentTarget` |
| 尺寸控制 | sm/md/lg 三种预设尺寸 |
| 可访问性 | 键盘操作支持，焦点管理 |

---

## 9. 数据流总览

### 9.1 完整数据流图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           用户操作                                    │
│  点击按钮、输入表单、选择选项、滚动页面等                              │
└───────────────────────────────────────┬─────────────────────────────┘
                                        │
┌───────────────────────────────────────▼─────────────────────────────┐
│                          UI 组件层                                    │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Pages      │  │ Components  │  │   Layout    │                 │
│  │  (页面)      │  │  (组件)      │  │  (布局)      │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
└─────────┼─────────────────┼─────────────────┼────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    React Hook 层                                      │
│                                                                       │
│  useState / useReducer ──────────────────────────────────────────┐  │
│                                                                      │  │
│  useQuery / useMutation ────► React Query Cache                   │  │
│  (数据获取/修改)              (状态管理、缓存)                       │  │
│                                                                      │  │
│  useAuth / useToast ───────► Context Provider                     │  │
│  (自定义Hook)                (全局状态共享)                          │  │
│                                                                      │  │
│  usePagination / useDebounce                                         │  │
│  (业务逻辑Hook)                                                      │  │
└───────────────────────────────────────┬─────────────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
              ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│   API Service 层      │  │    Context 层        │  │   Local/Session   │
│                      │  │                      │  │     Storage        │
│  api.getUsers()      │  │  AuthContext         │  │                    │
│  api.createUser()    │  │  ToastContext        │  │  auth, token      │
│  api.updateUser()    │  │                      │  │                    │
│  api.deleteUser()    │  │  状态变化触发UI更新   │  │  持久化存储       │
└──────────┬───────────┘  └──────────────────────┘  └──────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        后端 API / Mock 数据                           │
│                                                                       │
│  真实后端 API           Mock数据（当前使用）                          │
│  ┌─────────────┐       ┌─────────────┐                             │
│  │ GET /users  │       │ mockUsers[] │                             │
│  │ POST /users │       │ mockRoles[] │                             │
│  │ PUT /users  │       │ mockPerms[] │                             │
│  │ DELETE /    │       │             │                             │
│  └─────────────┘       └─────────────┘                             │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 关键模块调用关系

| 模块 | 依赖 | 被依赖 | 职责 |
|------|------|--------|------|
| `types/index.ts` | 无 | 所有模块 | TypeScript类型定义 |
| `schemas/index.ts` | types | 表单组件 | Zod验证Schema |
| `services/api.ts` | types | React Query | 数据获取和提交 |
| `services/queryClient.ts` | 无 | React Query | 查询键和缓存配置 |
| `context/AuthContext.tsx` | services/api, types | 页面组件 | 认证状态管理 |
| `context/ToastContext.tsx` | 无 | 页面组件 | 通知状态管理 |
| `hooks/*.ts` | react | 页面组件 | 可复用逻辑 |
| `components/*.tsx` | react, hooks | pages | 可复用UI组件 |
| `pages/*.tsx` | 所有其他模块 | App.tsx | 页面级组件 |
| `App.tsx` | pages, router, providers | main.tsx | 路由和Provider配置 |

---

## 10. 关键决策总结

### 10.1 技术选型决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 状态管理 | Context + useReducer | 简单够用，避免Redux复杂度 |
| 数据管理 | React Query | 自动缓存、重试、乐观更新 |
| 表单处理 | React Hook Form + Zod | 高性能、类型安全、声明式验证 |
| 样式方案 | Tailwind CSS | 快速开发、一致的设计系统 |
| 路由方案 | React Router v6 | 生态成熟、功能完善 |
| 构建工具 | Vite | 快速冷启动、HMR、TypeScript支持 |
| 测试方案 | Playwright | 跨浏览器、可靠、现代API |
| 组件文档 | Storybook | 组件隔离、交互测试 |

### 10.2 架构决策

| 决策 | 说明 |
|------|------|
| **分层架构** | UI层 → Hook层 → 服务层 → 基础设施层 |
| **关注点分离** | 业务逻辑与UI分离，数据获取与展示分离 |
| **类型优先** | 所有API、组件、状态都有完整类型定义 |
| **渐进式迁移** | Strangler Fig模式，新旧代码共存 |
| **乐观更新** | 删除等操作立即反馈，失败时回滚 |
| **防抖搜索** | 避免频繁API调用，提升性能 |

### 10.3 与jQuery版本的核心差异

| 方面 | jQuery版本 | React版本 |
|------|-----------|-----------|
| **开发模式** | 命令式（DOM操作） | 声明式（状态驱动） |
| **状态管理** | 全局变量、localStorage | Context、Reducer、React Query |
| **数据流** | 双向绑定（手动同步） | 单向数据流（状态→UI） |
| **类型安全** | 无 | TypeScript严格模式 |
| **数据缓存** | 无（每次重新请求） | React Query自动缓存 |
| **组件复用** | 复制粘贴 | 组件化、组合式 |
| **开发体验** | 调试困难 | React DevTools、HMR |

---

## 11. 扩展指南

### 11.1 添加新功能步骤

1. **定义类型** → `src/types/index.ts`
2. **定义Schema** → `src/schemas/index.ts`（如果有表单）
3. **添加API方法** → `src/services/api.ts`
4. **添加查询键** → `src/services/queryClient.ts`
5. **创建组件** → `src/components/`（如果需要可复用组件）
6. **创建页面** → `src/pages/`
7. **配置路由** → `src/App.tsx`
8. **添加测试** → `e2e/*.spec.ts`
9. **添加Storybook** → `src/components/*.stories.tsx`（如果有新组件）

### 11.2 代码规范

```typescript
// 1. 类型定义放在最前面
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

// 2. 使用默认导出
export default function MyComponent({ title, onClick }: MyComponentProps) {
  // 3. 状态声明
  const [count, setCount] = useState(0);
  
  // 4. 自定义Hook
  const { user } = useAuth();
  
  // 5. useQuery/useMutation
  const { data } = useQuery({
    queryKey: ['my-data'],
    queryFn: api.getMyData,
  });
  
  // 6. 回调函数（使用useCallback）
  const handleClick = useCallback(() => {
    // 处理逻辑
  }, []);
  
  // 7. 计算属性（使用useMemo）
  const doubledCount = useMemo(() => {
    return count * 2;
  }, [count]);
  
  // 8. 副作用（使用useEffect）
  useEffect(() => {
    // 副作用逻辑
  }, []);
  
  // 9. 返回JSX
  return (
    <div>
      <h1>{title}</h1>
      {/* ... */}
    </div>
  );
}
```

### 11.3 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| **组件** | PascalCase | `UserForm`, `DashboardPage` |
| **Hook** | camelCase，use前缀 | `useAuth`, `usePagination` |
| **类型/接口** | PascalCase | `User`, `LoginFormData` |
| **常量** | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY` |
| **变量/函数** | camelCase | `currentPage`, `handleSubmit` |
| **文件** | PascalCase（组件） | `UserForm.tsx`, `Button.tsx` |
| **文件** | camelCase（其他） | `useAuth.ts`, `api.ts` |
