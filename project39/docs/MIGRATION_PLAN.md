# 详细迁移方案文档

## 1. 项目概述

### 1.1 迁移目标

将一个约3000行代码的传统jQuery多页面应用完整迁移到React+TypeScript+React Query技术栈，实现以下目标：

- **功能完全兼容**：所有现有功能保持不变
- **渐进式迁移**：支持Strangler Fig模式，新旧代码可共存
- **类型安全**：TypeScript严格模式，零类型错误
- **现代化架构**：组件化、状态管理、数据缓存
- **可测试性**：完整的单元测试和E2E测试
- **可维护性**：清晰的代码结构和文档

### 1.2 技术栈对比

| 类别 | 原技术栈 | 新技术栈 | 迁移收益 |
|------|---------|---------|---------|
| **UI框架** | jQuery 3.7 | React 18 | 组件化、声明式开发 |
| **语言** | ES5 JavaScript | TypeScript 5 | 类型安全、更好的IDE支持 |
| **数据获取** | $.ajax | TanStack Query (React Query) | 自动缓存、重试、乐观更新 |
| **表单** | 自定义验证 | React Hook Form + Zod | 类型安全、更简洁的验证 |
| **状态管理** | 全局变量 | React Context + useReducer | 可预测、可调试 |
| **样式** | 原生CSS | Tailwind CSS | 快速开发、响应式 |
| **路由** | Hash路由 | React Router v6 | 声明式路由、嵌套路由 |
| **构建工具** | 无 | Vite | 热更新、快速构建 |

### 1.3 功能模块清单

| 模块 | 功能描述 | 优先级 |
|------|---------|--------|
| **认证模块** | 登录、登出、权限检查 | P0 - 最高 |
| **仪表盘** | 统计数据、最近活动 | P0 - 最高 |
| **用户管理** | 用户CRUD、搜索、分页 | P0 - 最高 |
| **角色管理** | 角色CRUD、权限树 | P1 - 高 |
| **权限管理** | 权限列表查看 | P1 - 高 |
| **系统设置** | 多标签页配置 | P2 - 中 |

---

## 2. 迁移策略详解

### 2.1 Strangler Fig模式（绞杀者模式）

#### 2.1.1 模式原理

Strangler Fig模式是一种渐进式重构策略，允许新旧代码在生产环境中共存，逐步用新代码替换旧代码，最终完全替代旧系统。

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用入口层                                  │
│                    (路由控制器/反向代理)                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   jQuery页面   │     │   React页面   │     │   混合页面    │
│  (legacy/)    │     │    (src/)     │     │ (部分迁移)    │
└───────────────┘     └───────────────┘     └───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │     共享数据层         │
                    │  - Mock API服务        │
                    │  - Session Storage     │
                    │  - Local Storage       │
                    └───────────────────────┘
```

#### 2.1.2 实现步骤

**阶段1：并行运行（第1周）**

1. **创建React项目骨架**
   - 初始化Vite+React+TypeScript项目
   - 配置Tailwind CSS
   - 配置React Router
   - 配置React Query

2. **创建适配层**
   - 保持API服务层与jQuery版本完全相同的数据结构
   - 共享认证状态（通过Session Storage）
   - 实现相同的Mock数据

3. **路由配置**
   ```
   /login        → 可选择使用旧版或新版
   /dashboard    → React版本
   /users        → React版本
   /roles        → jQuery版本（待迁移）
   /settings     → jQuery版本（待迁移）
   ```

**阶段2：模块迁移（第2-4周）**

按优先级逐个迁移模块：

```
第2周：认证模块 + 仪表盘
  - AuthContext
  - LoginPage
  - DashboardPage

第3周：用户管理模块
  - UsersPage
  - UserFormModal
  - 搜索、筛选、分页

第4周：角色管理 + 权限管理 + 系统设置
  - RolesPage
  - PermissionsPage
  - SettingsPage
```

**阶段3：完全替换（第5周）**

- 移除jQuery代码
- 清理适配层
- 执行完整测试

#### 2.1.3 数据同步策略

**认证状态同步**

```typescript
// 新旧版本共享的认证状态
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// 存储位置
// - Session Storage: 当前会话
// - Local Storage: 记住登录

// React版本读取
useEffect(() => {
  const storedAuth = sessionStorage.getItem('auth');
  if (storedAuth) {
    const authData: AuthState = JSON.parse(storedAuth);
    dispatch({ type: 'RESTORE_AUTH', payload: authData });
  }
}, []);

// jQuery版本读取
var storedAuth = Utils.getSessionStorage('auth');
if (storedAuth) {
  Auth.currentUser = storedAuth.user;
  Auth.token = storedAuth.token;
}
```

**API服务层保持一致**

```typescript
// ✅ 正确做法：保持相同的数据结构
// src/services/api.ts
interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  status: 'active' | 'inactive' | 'pending';
  // ... 与jQuery版本完全相同
}

// legacy/js/api.js
var mockData = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      roleId: 1,
      status: 'active',
      // ... 与React版本完全相同
    }
  ]
};
```

### 2.2 状态管理迁移策略

#### 2.2.1 jQuery状态管理分析

**问题分析**

```javascript
// ❌ jQuery方式的问题

// 1. 全局变量，难以追踪
var Auth = {
  currentUser: null,
  token: null,
  permissions: []
};

// 2. 手动同步到Storage
var Users = {
  state: {
    currentPage: 1,
    searchKeyword: '',
    selectedIds: []
  },
  
  loadData: function() {
    // 手动管理状态
    Utils.setSessionStorage('usersState', this.state);
  }
};

// 3. 事件驱动的状态变更
$('#search-input').on('input', function() {
  Users.state.searchKeyword = $(this).val();
  Users.state.currentPage = 1;
  Users.loadData();  // 手动触发更新
});
```

**存在的问题**

| 问题 | 影响 |
|------|------|
| 全局变量污染 | 命名冲突、难以追踪 |
| 手动状态同步 | 容易遗忘、不一致 |
| 无类型安全 | 运行时错误 |
| 难以调试 | 没有时间旅行、状态快照 |

#### 2.2.2 React Context + useReducer方案

**架构设计**

```
┌─────────────────────────────────────────────────────────────┐
│                        App Component                          │
└─────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ AuthProvider  │     │ ToastProvider │     │ ThemeProvider │
│  (认证状态)    │     │  (通知状态)    │     │  (主题状态)    │
└───────────────┘     └───────────────┘     └───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    各子组件            │
                    │  - useAuth() Hook     │
                    │  - useToast() Hook    │
                    │  - useTheme() Hook    │
                    └───────────────────────┘
```

**AuthContext完整实现**

```typescript
// src/context/AuthContext.tsx

// 1. 定义状态类型
interface AuthState {
  isAuthenticated: boolean;
  user: (User & { role: Role; permissions: Permission[] }) | null;
  token: string | null;
}

// 2. 定义Action类型（可追溯的状态变更）
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: LoginResponse }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_AUTH'; payload: AuthState };

// 3. 定义纯函数Reducer
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return state;  // 不改变状态，用于显示loading
      
    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
      
    case 'LOGIN_FAILURE':
      return initialState;
      
    case 'LOGOUT':
      return initialState;
      
    case 'RESTORE_AUTH':
      return action.payload;
      
    default:
      return state;
  }
}

// 4. Context定义
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 5. Provider组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 恢复存储的认证状态（自动同步）
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData: AuthState = JSON.parse(storedAuth);
        if (authData.token && authData.user) {
          dispatch({ type: 'RESTORE_AUTH', payload: authData });
        }
      } catch {
        sessionStorage.removeItem('auth');
      }
    }
  }, []);

  // 登录逻辑（带副作用处理）
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await api.login(credentials);
      
      const authState: AuthState = {
        isAuthenticated: true,
        user: response.user,
        token: response.token,
      };

      // 自动同步到Storage
      sessionStorage.setItem('auth', JSON.stringify(authState));
      sessionStorage.setItem('token', response.token);
      
      if (credentials.remember) {
        localStorage.setItem('auth_remember', JSON.stringify(authState));
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败';
      setError(message);
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 登出逻辑
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      // 清理Storage
      sessionStorage.removeItem('auth');
      sessionStorage.removeItem('token');
      localStorage.removeItem('auth_remember');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // 权限检查方法
  const hasPermission = useCallback(
    (code: string): boolean => {
      if (!state.user?.permissions) return false;
      return state.user.permissions.some((p) => p.code === code);
    },
    [state.user]
  );

  const hasAnyPermission = useCallback(
    (codes: string[]): boolean => {
      return codes.some((code) => hasPermission(code));
    },
    [hasPermission]
  );

  const isAdmin = useCallback((): boolean => {
    return state.user?.role?.code === 'admin';
  }, [state.user]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 6. 自定义Hook（简化使用）
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**使用示例**

```typescript
// 在组件中使用
function SomeComponent() {
  const { user, logout, hasPermission, isAdmin } = useAuth();

  return (
    <div>
      <p>当前用户: {user?.username}</p>
      
      {/* 权限控制 */}
      {hasPermission('user:delete') && (
        <button onClick={handleDelete}>删除用户</button>
      )}
      
      {/* 角色控制 */}
      {isAdmin() && (
        <button>管理员专属操作</button>
      )}
      
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

#### 2.2.3 状态管理对比

| 特性 | jQuery方式 | React Context方式 |
|------|-----------|------------------|
| **状态定义** | 全局变量 | 类型化State接口 |
| **状态变更** | 直接赋值 | Reducer纯函数 |
| **变更追踪** | 无 | Action类型（可追溯） |
| **自动同步** | 手动操作 | Effect自动同步 |
| **类型安全** | 无 | TypeScript严格类型 |
| **调试** | console.log | React DevTools |
| **时间旅行** | 不支持 | 支持（使用Redux DevTools） |
| **组件共享** | 全局访问 | Context Provider |

### 2.3 数据获取迁移策略

#### 2.3.1 jQuery数据获取分析

```javascript
// ❌ jQuery方式的问题

var Users = {
  state: {
    currentPage: 1,
    cachedData: null  // 手动缓存
  },
  
  loadData: function(forceRefresh) {
    var self = this;
    
    // 1. 手动检查缓存
    if (!forceRefresh && self.state.cachedData) {
      self.renderUsersList(self.state.cachedData);
      return;
    }
    
    // 2. 手动显示loading
    Utils.showLoading();
    
    // 3. 手动处理请求
    $.ajax({
      url: '/api/users',
      method: 'GET',
      data: {
        page: self.state.currentPage,
        search: self.state.searchKeyword
      },
      success: function(response) {
        // 4. 手动缓存
        self.state.cachedData = response;
        
        // 5. 手动更新UI
        self.renderUsersList(response.items);
        self.renderPagination(response);
        
        // 6. 手动隐藏loading
        Utils.hideLoading();
      },
      error: function(xhr) {
        Utils.hideLoading();
        Utils.showToast(xhr.responseJSON.message, 'error');
      }
    });
  },
  
  createUser: function(data) {
    var self = this;
    
    $.ajax({
      url: '/api/users',
      method: 'POST',
      data: data,
      success: function() {
        // 7. 手动清除缓存
        self.state.cachedData = null;
        
        // 8. 手动重新加载
        self.loadData(true);
      }
    });
  },
  
  // 搜索防抖 - 手动实现
  searchTimer: null,
  handleSearch: function(keyword) {
    var self = this;
    
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    this.searchTimer = setTimeout(function() {
      self.state.searchKeyword = keyword;
      self.state.currentPage = 1;
      self.loadData();
    }, 300);
  }
};
```

**存在的问题**

| 问题 | 说明 |
|------|------|
| **手动缓存管理** | 容易忘记清除缓存、缓存不一致 |
| **手动loading状态** | 每个请求都要手动控制 |
| **手动错误处理** | 重复的错误处理代码 |
| **无重试机制** | 网络错误时没有自动重试 |
| **无乐观更新** | 用户操作后需要等待请求完成 |
| **手动防抖** | 每个搜索框都要实现防抖 |
| **无并发处理** | 快速切换筛选条件可能导致竞态条件 |

#### 2.3.2 React Query方案

**架构设计**

```
┌─────────────────────────────────────────────────────────────────┐
│                        QueryClient                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Cache     │  │  Mutation   │  │    Query Cache      │   │
│  │  (5分钟)    │  │  State      │  │  staleTime: 5min   │   │
│  └─────────────┘  └─────────────┘  │  gcTime: 10min     │   │
│                                     └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   useQuery    │     │ useMutation │     │  useQueries   │
│  (数据获取)    │     │  (数据变更)    │     │  (并行查询)    │
└───────────────┘     └───────────────┘     └───────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ 自动管理状态   │     │ 乐观更新      │     │ 缓存失效      │
│ - isLoading   │     │ - 快速反馈    │     │ - 自动刷新    │
│ - error       │     │ - 回滚机制    │     │ - invalidate  │
│ - data        │     │ - onMutate    │     │ - queryKey    │
└───────────────┘     └───────────────┘     └───────────────┘
```

**QueryClient配置**

```typescript
// src/services/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 缓存策略：5分钟内数据视为新鲜
      staleTime: 5 * 60 * 1000,
      
      // 垃圾回收：10分钟后清除未使用的缓存
      gcTime: 10 * 60 * 1000,
      
      // 重试策略
      retry: (failureCount, error) => {
        // 客户端错误(4xx)不重试
        if (error instanceof ApiError) {
          if (error.status && error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        // 最多重试3次
        return failureCount < 3;
      },
      
      // 指数退避重试延迟
      // 第1次：1秒
      // 第2次：2秒
      // 第3次：4秒（最多30秒）
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // 窗口重新获得焦点时刷新数据
      refetchOnWindowFocus: true,
      
      // 网络重新连接时刷新数据
      refetchOnReconnect: true,
      
      // 组件重新挂载时（缓存未过期）不重新获取
      refetchOnMount: false,
    },
    mutations: {
      // 操作默认不重试
      retry: false,
    },
  },
});

// 查询键定义（缓存管理的核心）
export const queryKeys = {
  auth: ['auth'] as const,
  
  users: {
    all: ['users'] as const,
    // 根据参数生成唯一的查询键
    list: (params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      roleId?: number;
    }) => [...queryKeys.users.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.users.all, 'detail', id] as const,
  },
  
  roles: {
    all: ['roles'] as const,
    detail: (id: number) => [...queryKeys.roles.all, 'detail', id] as const,
  },
  
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    activities: ['dashboard', 'activities'] as const,
  },
  
  settings: {
    all: ['settings'] as const,
  },
} as const;
```

**useQuery使用示例**

```typescript
// src/pages/UsersPage.tsx
export function UsersPage() {
  // 筛选状态
  const [filter, setFilter] = useState<UsersFilter>({
    search: '',
    status: '',
    roleId: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 防抖搜索（300ms延迟）
  const debouncedSearch = useDebounce(filter.search, 300);
  
  // 使用React Query获取用户列表
  const {
    data: usersData,       // 数据
    isLoading,             // 加载状态
    error,                 // 错误
    refetch,               // 手动刷新
    isFetching,            // 是否正在获取（包括后台刷新）
  } = useQuery({
    // 查询键：参数变化自动触发重新获取
    queryKey: queryKeys.users.list({
      page,
      pageSize,
      search: debouncedSearch,
      status: filter.status,
      roleId: filter.roleId || undefined,
    }),
    
    // 查询函数
    queryFn: () =>
      api.getUsers({
        page,
        pageSize,
        search: debouncedSearch,
        status: filter.status,
        roleId: filter.roleId || undefined,
      }),
    
    // 可选：覆盖全局配置
    staleTime: 60 * 1000,  // 此查询1分钟内视为新鲜
    enabled: true,          // 是否启用查询
  });
  
  // 并行获取角色列表
  const { data: roles } = useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: api.getRoles,
  });
  
  // 加载状态
  if (isLoading) {
    return <Loading text="加载中..." />;
  }
  
  // 错误状态
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>重试</Button>
      </div>
    );
  }
  
  return (
    <div>
      {/* 搜索筛选区 */}
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="搜索用户名、邮箱..."
          value={filter.search}
          onChange={(e) => {
            setFilter(f => ({ ...f, search: e.target.value }));
            setPage(1);  // 搜索变更时回到第一页
          }}
        />
        <Select
          value={filter.status}
          onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
          options={[
            { value: '', label: '全部状态' },
            { value: 'active', label: '激活' },
            { value: 'inactive', label: '禁用' },
          ]}
        />
      </div>
      
      {/* 数据表格 */}
      <UserTable users={usersData?.items || []} />
      
      {/* 分页 */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={usersData?.total || 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
```

**useMutation使用示例**

```typescript
// 删除用户（带乐观更新）
const deleteMutation = useMutation({
  mutationFn: api.deleteUser,
  
  // 乐观更新：请求发送前立即更新UI
  onMutate: async (userId) => {
    // 1. 取消正在进行的查询（防止竞态条件）
    await queryClient.cancelQueries({ queryKey: queryKeys.users.all });
    
    // 2. 保存当前状态（用于回滚）
    const previousUsers = queryClient.getQueryData(
      queryKeys.users.list()
    );
    
    // 3. 乐观更新：从缓存中移除用户
    queryClient.setQueryData(
      queryKeys.users.list(),
      (oldData: any) => ({
        ...oldData,
        items: oldData.items.filter((u: User) => u.id !== userId),
        total: oldData.total - 1,
      })
    );
    
    // 返回context，用于错误时回滚
    return { previousUsers };
  },
  
  // 请求成功
  onSuccess: () => {
    // 使相关查询失效，获取最新数据
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    showSuccess('用户删除成功');
  },
  
  // 请求失败：回滚到之前的状态
  onError: (err, userId, context) => {
    if (context?.previousUsers) {
      queryClient.setQueryData(
        queryKeys.users.list(),
        context.previousUsers
      );
    }
    showError('删除失败：' + err.message);
  },
  
  // 请求完成后（无论成功失败）
  onSettled: () => {
    // 确保数据同步
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  },
});

// 创建用户
const createMutation = useMutation({
  mutationFn: api.createUser,
  onSuccess: () => {
    // 使所有用户相关查询失效
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    showSuccess('用户创建成功');
  },
  onError: (err) => {
    showError('创建失败：' + err.message);
  },
});

// 使用
const handleDelete = (userId: number) => {
  setDeletingUserId(userId);
  setIsDeleteModalOpen(true);
};

const confirmDelete = () => {
  if (deletingUserId) {
    deleteMutation.mutate(deletingUserId);
  }
};
```

#### 2.3.3 数据获取对比

| 特性 | jQuery $.ajax | React Query |
|------|--------------|-------------|
| **缓存管理** | 手动实现 | 自动缓存+失效策略 |
| **加载状态** | 手动控制 | 自动isLoading状态 |
| **错误处理** | 手动catch | 自动error状态 |
| **重试机制** | 手动实现 | 内置指数退避重试 |
| **乐观更新** | 不支持 | 内置支持 |
| **防抖搜索** | 手动实现 | useDebounce Hook |
| **竞态条件** | 无处理 | 自动取消旧请求 |
| **后台刷新** | 不支持 | 自动后台刷新 |
| **查询无效** | 手动清除缓存 | 自动invalidateQueries |
| **开发工具** | 无 | React Query DevTools |

### 2.4 表单验证迁移策略

#### 2.4.1 jQuery表单验证分析

```javascript
// ❌ jQuery方式

var Validation = {
  // 1. 硬编码的验证规则
  rules: {
    required: {
      validate: function(value) {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim().length > 0;
        return value !== undefined && value !== null;
      },
      message: '此字段为必填项'
    },
    email: {
      validate: function(value) {
        if (!value) return true;
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: '请输入有效的邮箱地址'
    },
    // ... 更多规则
  },
  
  // 2. 手动验证表单
  validateForm: function(formData, schema) {
    var result = { isValid: true, errors: {} };
    for (var fieldName in schema) {
      var value = formData[fieldName];
      var rules = schema[fieldName];
      var fieldResult = this.validateField(value, rules, formData);
      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors[fieldName] = fieldResult.errors;
      }
    }
    return result;
  },
  
  // 3. 手动显示错误
  showFormErrors: function($form, errors) {
    for (var fieldName in errors) {
      var $field = $form.find('[name="' + fieldName + '"]');
      var $errorMsg = $field.closest('.form-group').find('.error-message');
      $field.addClass('error');
      $errorMsg.text(errors[fieldName][0]).show();
    }
  },
  
  // 4. 手动清除错误
  clearFormErrors: function($form) {
    $form.find('.form-group').removeClass('has-error');
    $form.find('input, select, textarea').removeClass('error');
    $form.find('.error-message').text('').hide();
  }
};

// 使用示例
$('#user-form').on('submit', function(e) {
  e.preventDefault();
  
  var $form = $(this);
  var formData = Validation.getFormData($form);
  
  // 手动定义schema
  var userSchema = {
    username: {
      required: true,
      minLength: { min: 3 },
      maxLength: { max: 20 }
    },
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minLength: { min: 6 }
    },
    confirmPassword: {
      required: true,
      match: { field: 'password', label: '密码' }
    }
  };
  
  // 手动验证
  var result = Validation.validateForm(formData, userSchema);
  
  // 手动清除错误
  Validation.clearFormErrors($form);
  
  // 手动显示错误
  if (!result.isValid) {
    Validation.showFormErrors($form, result.errors);
    Utils.showToast('表单验证失败', 'error');
    return;
  }
  
  // 手动提交
  API.createUser(formData).then(function() {
    // ...
  });
});
```

**存在的问题**

| 问题 | 说明 |
|------|------|
| **无类型安全** | 无法在编译时发现错误 |
| **手动状态管理** | 每个表单都要手动管理验证状态 |
| **手动DOM操作** | 需要直接操作DOM显示/清除错误 |
| **schema重复定义** | 前后端schema可能不一致 |
| **字段监听困难** | 监听字段变化需要手动绑定事件 |
| **表单重置复杂** | 需要手动重置所有字段和错误状态 |

#### 2.4.2 React Hook Form + Zod方案

**架构设计**

```
┌─────────────────────────────────────────────────────────────────┐
│                         Zod Schema                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  export const createUserSchema = z.object({             │   │
│  │    username: z.string().min(3).max(20),                │   │
│  │    email: z.string().email(),                           │   │
│  │    password: z.string().min(6),                        │   │
│  │    confirmPassword: z.string(),                        │   │
│  │  })                                                       │   │
│  │  .refine((data) => data.password === data.confirmPassword,│   │
│  │    { message: '密码不一致', path: ['confirmPassword'] })  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  // 自动生成TypeScript类型                                │   │
│  │  export type CreateUserFormData = z.infer<typeof createUserSchema>
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      React Hook Form                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐ │
│  │   register    │  │ handleSubmit  │  │   formState       │ │
│  │  (字段注册)    │  │  (提交处理)   │  │  - errors         │ │
│  │               │  │               │  │  - isDirty        │ │
│  │               │  │               │  │  - isSubmitting   │ │
│  └───────────────┘  └───────────────┘  │  - touchedFields  │ │
│                                         └───────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Zod Schema定义**

```typescript
// src/schemas/index.ts
import { z } from 'zod';

// 1. 基础用户字段验证
const baseUserSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  
  email: z
    .string()
    .email('请输入有效的邮箱地址'),
  
  roleId: z.coerce
    .number({
      required_error: '请选择角色',
      invalid_type_error: '角色值无效',
    })
    .positive('请选择角色'),
  
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^1[3-9]\d{9}$/.test(val),
      '请输入有效的手机号码'
    ),
  
  address: z
    .string()
    .max(200, '地址不能超过200个字符')
    .optional(),
});

// 2. 创建用户schema（需要密码）
export const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(50, '密码不能超过50个字符'),
  
  confirmPassword: z
    .string()
    .min(6, '确认密码至少需要6个字符'),
})
// 交叉验证：密码一致
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],  // 错误关联到confirmPassword字段
  }
);

// 3. 编辑用户schema（密码可选）
export const updateUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6,
      '密码至少需要6个字符'
    ),
  confirmPassword: z.string().optional(),
})
.refine(
  (data) => !data.password || data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }
);

// 4. 登录schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符'),
  
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(50, '密码不能超过50个字符'),
  
  remember: z.boolean().optional(),
});

// 5. 自动生成TypeScript类型
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
```

**React Hook Form使用示例**

```typescript
// src/pages/UsersPage.tsx
function UserFormModal({
  isOpen,
  onClose,
  editingUser,
  roles,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: User | null;
  roles: Role[];
}) {
  const isEdit = !!editingUser;
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // 初始化React Hook Form
  const {
    register,        // 字段注册
    handleSubmit,    // 提交处理
    formState: { errors },  // 表单状态（包含错误）
    reset,           // 重置表单
    watch,           // 监听字段变化
    setValue,        // 设置字段值
    getValues,       // 获取字段值
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    // 使用Zod作为验证器
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    
    // 默认值
    defaultValues: isEdit
      ? {
          username: editingUser!.username,
          email: editingUser!.email,
          roleId: editingUser!.roleId,
          status: editingUser!.status,
          phone: editingUser!.phone || '',
          address: editingUser!.address || '',
          password: '',      // 编辑时密码为空表示不修改
          confirmPassword: '',
        }
      : {
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          roleId: '',
          status: 'active',
          phone: '',
          address: '',
        },
  });

  // React Query Mutations
  const createMutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      showSuccess('用户创建成功');
      onClose();
      reset();  // 重置表单
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserFormData }) =>
      api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      showSuccess('用户更新成功');
      onClose();
      reset();
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  // 提交处理
  const onSubmit = (data: CreateUserFormData | UpdateUserFormData) => {
    if (isEdit) {
      // 编辑时，如果密码为空则移除密码字段
      const updateData: UpdateUserFormData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.confirmPassword;
      }
      updateMutation.mutate({ id: editingUser!.id, data: updateData });
    } else {
      createMutation.mutate(data as CreateUserFormData);
    }
  };

  // 监听密码字段变化
  const password = watch('password');

  // 角色下拉选项
  const roleOptions = useMemo(
    () => roles.map((r) => ({ value: r.id, label: r.name })),
    [roles]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑用户' : '添加用户'}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              reset();  // 关闭时重置表单
            }}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            保存
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 用户名 */}
        <Input
          label="用户名"
          type="text"
          placeholder="请输入用户名"
          isRequired
          error={errors.username?.message}
          register={register('username')}
        />

        {/* 邮箱 */}
        <Input
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          isRequired
          error={errors.email?.message}
          register={register('email')}
        />

        {/* 密码（编辑时可选） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={isEdit ? '密码 (留空则不修改)' : '密码'}
            type="password"
            placeholder={isEdit ? '留空则不修改' : '请输入密码'}
            isRequired={!isEdit}
            error={errors.password?.message}
            register={register('password')}
          />

          {/* 只有输入了密码才显示确认密码 */}
          {(!isEdit || password) && (
            <Input
              label="确认密码"
              type="password"
              placeholder="请再次输入密码"
              isRequired
              error={errors.confirmPassword?.message}
              register={register('confirmPassword')}
            />
          )}
        </div>

        {/* 角色选择 */}
        <Select
          label="角色"
          placeholder="请选择角色"
          options={roleOptions}
          isRequired
          error={errors.roleId?.message}
          register={register('roleId')}
        />

        {/* 状态选择 */}
        <Select
          label="状态"
          options={[
            { value: 'active', label: '激活' },
            { value: 'inactive', label: '禁用' },
            { value: 'pending', label: '待审核' },
          ]}
          register={register('status')}
        />
      </form>
    </Modal>
  );
}
```

**Input组件（与React Hook Form集成）**

```typescript
// src/components/Input.tsx
import { forwardRef, InputHTMLAttributes } from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  isRequired?: boolean;
  fullWidth?: boolean;
  register?: UseFormRegisterReturn;  // React Hook Form注册
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      isRequired = false,
      fullWidth = false,
      className = '',
      register,
      ...props
    },
    ref
  ) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!error;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* 标签 */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* 输入框 */}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'block w-full px-3 py-2 border rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'transition-colors duration-200',
              hasError
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={errorMessage ? 'input-error' : helperText ? 'input-helper' : undefined}
            {...register}  {/* 展开React Hook Form注册 */}
            {...props}
          />
        </div>

        {/* 错误消息 */}
        {errorMessage && (
          <p id="input-error" className="mt-1 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {/* 帮助文本 */}
        {!errorMessage && helperText && (
          <p id="input-helper" className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

#### 2.4.3 表单验证对比

| 特性 | 自定义jQuery验证 | React Hook Form + Zod |
|------|-----------------|----------------------|
| **验证定义** | JavaScript对象 | Zod Schema（类型安全） |
| **类型推断** | 无 | TypeScript自动推断 |
| **表单状态** | 手动管理 | formState对象 |
| **错误显示** | 手动DOM操作 | 自动传递错误消息 |
| **字段监听** | 手动事件绑定 | watch()函数 |
| **表单重置** | 手动reset | 内置reset() |
| **交叉验证** | 手动实现 | Zod .refine() |
| **性能** | 每次全表单验证 | 按需验证 + 防抖 |
| **开发体验** | 命令式操作 | 声明式API |
| **前后端共享** | 难以共享 | Zod可在前后端复用 |

---

## 3. 详细迁移步骤

### 3.1 第一阶段：项目初始化（第1周）

#### 3.1.1 创建React项目骨架

```bash
# 1. 使用Vite创建React+TypeScript项目
npm create vite@latest . -- --template react-ts

# 2. 安装核心依赖
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form @hookform/resolvers zod
npm install tailwindcss postcss autoprefixer

# 3. 安装开发依赖
npm install -D @types/node @types/react @types/react-dom
npm install -D typescript eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D @playwright/test @storybook/react @storybook/react-vite
```

#### 3.1.2 配置文件

**tsconfig.json（严格模式）**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    
    /* 严格类型检查 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    
    /* 模块解析 */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    
    /* 路径别名 */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

**vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

#### 3.1.3 创建目录结构

```
src/
├── types/           # TypeScript类型定义
├── context/         # React Context
├── hooks/           # 自定义Hook
├── services/        # API服务和React Query配置
├── schemas/         # Zod验证Schema
├── components/      # UI组件
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Pagination.tsx
│   ├── Loading.tsx
│   ├── ToastContainer.tsx
│   └── Layout.tsx
├── pages/           # 页面组件
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── UsersPage.tsx
│   ├── RolesPage.tsx
│   ├── PermissionsPage.tsx
│   └── SettingsPage.tsx
├── router/          # 路由相关
│   └── PrivateRoute.tsx
├── App.tsx          # 主应用
├── main.tsx         # 入口文件
└── index.css        # 全局样式
```

### 3.2 第二阶段：类型定义（第1周）

#### 3.2.1 从jQuery代码提取类型

```typescript
// src/types/index.ts

// 1. 分析jQuery代码中的数据结构
// legacy/js/api.js
// var mockData = {
//   users: [
//     { 
//       id: 1, 
//       username: 'admin', 
//       email: 'admin@example.com',
//       roleId: 1,
//       status: 'active',
//       createdAt: '2024-01-01T00:00:00Z'
//     }
//   ]
// };

// 2. 转换为TypeScript类型
export interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  status: 'active' | 'inactive' | 'pending';  // 字面量联合类型
  phone?: string;
  address?: string;
  role?: Role;
  createdAt: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  userCount: number;
  status: 'active' | 'inactive';
  permissions: number[];
  createdAt: string;
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'action';
  parentId: number | null;
  status: 'active' | 'inactive';
}

// 3. API请求/响应类型
export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User & {
    role: Role;
    permissions: Permission[];
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 4. 状态类型
export interface AuthState {
  isAuthenticated: boolean;
  user: (User & { role: Role; permissions: Permission[] }) | null;
  token: string | null;
}
```

#### 3.2.2 类型定义最佳实践

| 实践 | 说明 |
|------|------|
| **使用字面量联合类型** | `status: 'active' | 'inactive'` 而不是 `string` |
| **可选属性标记** | `phone?: string` 而不是 `phone: string | undefined` |
| **类型别名复用** | 使用 `type` 和 `interface` 定义可复用类型 |
| **泛型类型** | `PaginatedResponse<T>` 用于分页响应 |
| **类型守卫** | 用于运行时类型检查 |

### 3.3 第三阶段：API服务层迁移（第2周）

#### 3.3.1 保持相同的数据结构

```typescript
// src/services/api.ts

// ✅ 关键：与jQuery版本使用相同的mock数据结构
const mockData = {
  users: [
    { 
      id: 1, 
      username: 'admin', 
      email: 'admin@example.com',
      roleId: 1,
      status: 'active' as const,  // 使用as const保持字面量类型
      // ... 与legacy/js/api.js完全相同
    },
    // ...
  ],
  // ... 其他数据
};

// ✅ 保持相同的API方法签名
export const api = {
  // 登录
  async login(data: LoginRequest): Promise<LoginResponse> {
    // 相同的业务逻辑
    const user = mockData.users.find(
      (u) => u.username === data.username && u.password === data.password
    );
    
    if (!user) {
      throw new ApiError('用户名或密码错误', 401);
    }
    
    // 相同的响应结构
    const role = mockData.roles.find((r) => r.id === user.roleId);
    const permissions = getPermissionsByRoleId(user.roleId);
    
    return {
      token: `mock-jwt-token-${Date.now()}`,
      user: {
        ...user,
        role: role!,
        permissions,
      },
    };
  },
  
  // 获取用户列表
  async getUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    roleId?: number;
  } = {}): Promise<PaginatedResponse<User>> {
    // 相同的筛选逻辑
    let users = [...mockData.users];
    
    if (params.search) {
      const search = params.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }
    
    // ... 相同的分页逻辑
    
    return {
      items: usersWithRole,
      total: users.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      totalPages: Math.ceil(users.length / (params.pageSize || 10)),
    };
  },
  
  // ... 其他API方法
};
```

#### 3.3.2 自定义错误类

```typescript
// 自定义错误类，便于错误处理
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 使用示例
try {
  const user = await api.getUser(999);
} catch (error) {
  if (error instanceof ApiError) {
    console.log('HTTP状态码:', error.status);  // 404
    console.log('错误消息:', error.message);   // '用户不存在'
  }
}
```

### 3.4 第四阶段：状态管理迁移（第2周）

#### 3.4.1 迁移Auth模块

```typescript
// 原jQuery代码
// legacy/js/auth.js
var Auth = {
    currentUser: null,      // 全局变量
    token: null,
    permissions: [],
    
    login: function(data) {
        var self = this;
        API.login(data).then(function(response) {
            self.currentUser = response.user;   // 手动更新
            self.token = response.token;
            self.permissions = response.user.permissions;
            
            // 手动同步到Storage
            Utils.setSessionStorage('auth', {
                token: response.token,
                user: response.user
            });
        });
    },
    
    logout: function() {
        this.currentUser = null;
        this.token = null;
        this.permissions = [];
        Utils.removeSessionStorage('auth');
    },
    
    hasPermission: function(code) {
        if (!this.permissions) return false;
        return this.permissions.some(function(p) {
            return p.code === code;
        });
    }
};
```

迁移到React Context：

```typescript
// src/context/AuthContext.tsx

// 1. 定义状态类型
interface AuthState {
  isAuthenticated: boolean;
  user: (User & { role: Role; permissions: Permission[] }) | null;
  token: string | null;
}

// 2. 定义Action（可追溯的状态变更）
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: LoginResponse }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_AUTH'; payload: AuthState };

// 3. Reducer纯函数
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
    case 'LOGIN_FAILURE':
      return initialState;
    case 'RESTORE_AUTH':
      return action.payload;
    default:
      return state;
  }
}

// 4. Context类型
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 5. Provider组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 自动恢复认证状态
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData: AuthState = JSON.parse(storedAuth);
        if (authData.token && authData.user) {
          dispatch({ type: 'RESTORE_AUTH', payload: authData });
        }
      } catch {
        sessionStorage.removeItem('auth');
      }
    }
  }, []);

  // 登录（使用useCallback优化）
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await api.login(credentials);
      
      const authState: AuthState = {
        isAuthenticated: true,
        user: response.user,
        token: response.token,
      };

      // 自动同步到Storage
      sessionStorage.setItem('auth', JSON.stringify(authState));
      sessionStorage.setItem('token', response.token);
      
      if (credentials.remember) {
        localStorage.setItem('auth_remember', JSON.stringify(authState));
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败';
      setError(message);
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 登出
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      // 清理Storage
      sessionStorage.removeItem('auth');
      sessionStorage.removeItem('token');
      localStorage.removeItem('auth_remember');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // 权限检查
  const hasPermission = useCallback(
    (code: string): boolean => {
      if (!state.user?.permissions) return false;
      return state.user.permissions.some((p) => p.code === code);
    },
    [state.user]
  );

  const hasAnyPermission = useCallback(
    (codes: string[]): boolean => codes.some((code) => hasPermission(code)),
    [hasPermission]
  );

  const isAdmin = useCallback(
    (): boolean => state.user?.role?.code === 'admin',
    [state.user]
  );

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 6. 自定义Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 3.4.2 迁移Toast通知

```typescript
// src/context/ToastContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ToastMessage } from '@/types';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  hideToast: (id: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const generateId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback(
