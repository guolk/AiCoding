# jQuery 到 React+TypeScript+React Query 迁移指南

## 目录

1. [概述](#概述)
2. [项目结构](#项目结构)
3. [迁移策略](#迁移策略)
4. [详细迁移步骤](#详细迁移步骤)
5. [技术栈对比](#技术栈对比)
6. [测试策略](#测试策略)
7. [常见问题](#常见问题)

---

## 概述

### 迁移目标

将一个约3000行代码的传统jQuery多页面应用迁移到现代前端技术栈：

| 原技术栈 | 新技术栈 |
|---------|---------|
| jQuery | React 18 |
| 原生JavaScript | TypeScript 5 |
| $.ajax | TanStack Query (React Query) |
| 自定义表单验证 | React Hook Form + Zod |
| 全局变量状态管理 | React Context |
| 无组件化 | 组件化开发 |
| 无类型系统 | 严格类型检查 |

### 应用功能

用户管理系统包含以下核心功能：
- 用户认证（登录/登出）
- 用户管理（CRUD操作）
- 角色管理（CRUD操作）
- 权限管理（树形权限配置）
- 系统设置（多标签页配置）
- 仪表盘统计

---

## 项目结构

### 原始jQuery项目结构

```
legacy/
├── index.html              # 单页HTML，包含所有页面DOM
├── css/
│   └── style.css           # 全局样式（约700行）
└── js/
    ├── utils.js            # 工具函数（约500行）
    ├── validation.js       # 表单验证（约400行）
    ├── api.js              # AJAX请求封装（约400行）
    ├── auth.js             # 认证模块（约150行）
    ├── dashboard.js        # 仪表盘（约100行）
    ├── users.js            # 用户管理（约500行）
    ├── roles.js            # 角色管理（约300行）
    ├── permissions.js      # 权限管理（约100行）
    ├── settings.js         # 系统设置（约250行）
    └── app.js              # 主应用入口（约150行）
```

### 迁移后React项目结构

```
src/
├── types/
│   └── index.ts            # TypeScript类型定义
├── context/
│   ├── AuthContext.tsx     # 认证状态管理
│   └── ToastContext.tsx    # 通知状态管理
├── hooks/
│   ├── usePagination.ts    # 分页Hook
│   └── useDebounce.ts      # 防抖Hook
├── services/
│   ├── api.ts              # API服务层
│   └── queryClient.ts      # React Query配置
├── schemas/
│   └── index.ts            # Zod验证Schema
├── components/
│   ├── Button.tsx          # 按钮组件
│   ├── Input.tsx           # 输入框组件
│   ├── Select.tsx          # 下拉选择组件
│   ├── Modal.tsx           # 模态框组件
│   ├── Table.tsx           # 表格组件
│   ├── Pagination.tsx      # 分页组件
│   ├── Loading.tsx         # 加载组件
│   ├── ToastContainer.tsx  # 通知容器
│   ├── Layout.tsx          # 布局组件
│   ├── Button.stories.tsx  # Storybook示例
│   └── Input.stories.tsx   # Storybook示例
├── pages/
│   ├── LoginPage.tsx       # 登录页面
│   ├── DashboardPage.tsx   # 仪表盘页面
│   ├── UsersPage.tsx       # 用户管理页面
│   ├── RolesPage.tsx       # 角色管理页面
│   ├── PermissionsPage.tsx # 权限管理页面
│   └── SettingsPage.tsx    # 系统设置页面
├── router/
│   └── PrivateRoute.tsx    # 路由守卫
├── App.tsx                 # 主应用组件
├── main.tsx                # 入口文件
└── index.css               # 全局样式（Tailwind）

e2e/
├── login.spec.ts           # 登录测试
├── dashboard.spec.ts       # 仪表盘测试
└── users.spec.ts           # 用户管理测试

.storybook/
├── main.ts                 # Storybook配置
└── preview.ts              # Storybook预览配置
```

---

## 迁移策略

### 1. Strangler Fig模式（绞杀者模式）

Strangler Fig模式是一种渐进式迁移策略，允许新旧代码共存，逐步用新代码替换旧代码。

#### 实现方式

```
┌─────────────────────────────────────────────────────────┐
│                      应用入口                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────────────┐     │
│  │  jQuery代码   │         │    React代码         │     │
│  │  (legacy/)   │         │    (src/)            │     │
│  │              │         │                      │     │
│  │  - 登录页面   │         │  - 仪表盘页面        │     │
│  │  - 用户管理   │  <----> │  - 用户管理页面      │     │
│  │  - 角色管理   │  数据   │  - 角色管理页面      │     │
│  │  - 权限管理   │  同步   │  - 权限管理页面      │     │
│  │  - 系统设置   │         │  - 系统设置页面      │     │
│  └──────────────┘         └──────────────────────┘     │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    共享数据层                            │
│  - Mock API服务（模拟后端）                              │
│  - Session Storage（认证状态）                          │
│  - Local Storage（记住登录）                            │
└─────────────────────────────────────────────────────────┘
```

#### 迁移阶段

**阶段1：并行运行**
- 保持jQuery应用正常运行
- 在同一域名下部署React应用
- 使用相同的API服务层
- 共享认证状态（通过Session Storage）

**阶段2：模块迁移**
- 按模块逐一迁移（仪表盘 → 用户管理 → 角色管理 → 权限管理 → 系统设置）
- 每个模块完成后切换路由
- 通过URL路由控制新旧代码的使用

**阶段3：完全替换**
- 所有模块迁移完成
- 移除旧的jQuery代码
- 清理临时适配层

#### 实际项目中的实现

在本示例项目中，我们创建了：

1. **legacy/** 目录：完整的jQuery应用
   - 可独立运行
   - 使用相同的mock数据结构
   - 相同的业务逻辑

2. **src/** 目录：React应用
   - 相同的功能实现
   - 相同的数据结构
   - 可与jQuery应用对比测试

### 2. 状态管理迁移

#### 原jQuery状态管理方式

```javascript
// legacy/js/auth.js
var Auth = {
    currentUser: null,  // 全局变量存储用户
    token: null,        // 全局变量存储token
    permissions: [],    // 全局变量存储权限
    
    login: function(data) {
        // 手动更新全局状态
        API.login(data).then(function(response) {
            self.currentUser = response.user;
            self.token = response.token;
            // 手动同步到Storage
            Utils.setSessionStorage('auth', {
                token: response.token,
                user: response.user
            });
        });
    }
};
```

#### 迁移后React状态管理方式

```typescript
// src/context/AuthContext.tsx
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// 使用React Context + useReducer
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return initialState;
    // ...
  }
}

// 使用useMutation处理异步操作
const login = async (credentials: LoginRequest) => {
  const response = await api.login(credentials);
  dispatch({ type: 'LOGIN_SUCCESS', payload: response });
  // 自动同步到Storage
  sessionStorage.setItem('auth', JSON.stringify({
    token: response.token,
    user: response.user
  }));
};
```

#### 状态管理对比

| 特性 | jQuery方式 | React Context方式 |
|-----|-----------|------------------|
| 状态定义 | 全局变量 | 类型化State接口 |
| 状态更新 | 手动赋值 | Reducer纯函数 |
| 状态同步 | 手动处理Storage | Effect自动同步 |
| 跨组件共享 | 全局访问 | Context Provider |
| 类型安全 | 无 | TypeScript严格类型 |
| 调试支持 | 手动console.log | React DevTools |

### 3. AJAX请求迁移

#### 原jQuery AJAX方式

```javascript
// legacy/js/api.js
var API = {
    baseUrl: '/api',
    
    getUsers: function(params) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: this.baseUrl + '/users',
                method: 'GET',
                data: params,
                success: function(response) {
                    resolve(response);
                },
                error: function(xhr) {
                    reject(new Error(xhr.responseJSON.message));
                }
            });
        });
    }
};

// legacy/js/users.js
var Users = {
    loadData: function() {
        Utils.showLoading();
        API.getUsers({
            page: self.state.currentPage,
            search: self.state.searchKeyword
        }).then(function(response) {
            self.renderUsersList(response.items);
            self.renderPagination(response);
            Utils.hideLoading();
        }).catch(function(error) {
            Utils.hideLoading();
            Utils.showToast(error.message, 'error');
        });
    }
};
```

#### 迁移后React Query方式

```typescript
// src/services/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5分钟缓存
      gcTime: 10 * 60 * 1000,     // 10分钟垃圾回收
      retry: (failureCount, error) => {
        // 智能重试策略
        if (error instanceof ApiError) {
          if (error.status && error.status >= 400 && error.status < 500) {
            return false;  // 客户端错误不重试
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// 查询键定义（用于缓存管理）
const queryKeys = {
  users: {
    all: ['users'] as const,
    list: (params?: { page?: number; search?: string }) => 
      [...queryKeys.users.all, 'list', params] as const,
    detail: (id: number) => 
      [...queryKeys.users.all, 'detail', id] as const,
  },
  // ...
};

// src/pages/UsersPage.tsx
const { data: usersData, isLoading } = useQuery({
  queryKey: queryKeys.users.list({
    page,
    search: debouncedSearch,
    status: filter.status,
  }),
  queryFn: () => api.getUsers({
    page,
    pageSize,
    search: debouncedSearch,
    status: filter.status,
    roleId: filter.roleId || undefined,
  }),
});

// 自动处理缓存失效
const deleteMutation = useMutation({
  mutationFn: api.deleteUser,
  onSuccess: () => {
    // 使相关查询失效，自动重新获取数据
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
  },
});
```

#### AJAX迁移对比

| 特性 | jQuery $.ajax | React Query |
|-----|---------------|-------------|
| 请求封装 | 手动Promise封装 | 内置Hook支持 |
| 缓存管理 | 无（每次重新请求） | 自动缓存 + 失效策略 |
| 重试机制 | 手动实现 | 内置智能重试 |
| 状态同步 | 手动管理 | 自动同步UI状态 |
| 并发请求 | 无处理 | 自动去重 + 共享状态 |
| 乐观更新 | 手动实现 | 内置支持 |
| 错误处理 | 手动catch | 内置错误状态 |
| 加载状态 | 手动控制 | 自动isLoading状态 |

### 4. 表单验证迁移

#### 原jQuery表单验证方式

```javascript
// legacy/js/validation.js
var Validation = {
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
    
    showFormErrors: function($form, errors) {
        // 手动显示错误到DOM
        for (var fieldName in errors) {
            var $field = $form.find('[name="' + fieldName + '"]');
            var $errorMsg = $field.closest('.form-group').find('.error-message');
            $field.addClass('error');
            $errorMsg.text(errors[fieldName][0]).show();
        }
    }
};

// 使用示例
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
    confirmPassword: {
        required: true,
        match: { field: 'password', label: '密码' }
    }
};

$('#user-form').on('submit', function(e) {
    e.preventDefault();
    var formData = Validation.getFormData($(this));
    var result = Validation.validateForm(formData, userSchema);
    
    if (!result.isValid) {
        Validation.showFormErrors($(this), result.errors);
        return;
    }
    
    // 提交表单...
});
```

#### 迁移后React Hook Form + Zod方式

```typescript
// src/schemas/index.ts
import { z } from 'zod';

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
})
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }
);

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// src/pages/UsersPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function UserFormModal({ isOpen, onClose, editingUser }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: isEdit
      ? {
          username: editingUser!.username,
          email: editingUser!.email,
          roleId: editingUser!.roleId,
          status: editingUser!.status,
          phone: editingUser!.phone || '',
          address: editingUser!.address || '',
          password: '',
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

  const onSubmit = (data: CreateUserFormData) => {
    if (isEdit) {
      updateMutation.mutate({ id: editingUser!.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '编辑用户' : '添加用户'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="用户名"
          type="text"
          placeholder="请输入用户名"
          isRequired
          error={errors.username?.message}
          register={register('username')}
        />
        <Input
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          isRequired
          error={errors.email?.message}
          register={register('email')}
        />
        {/* ... 更多字段 */}
      </form>
    </Modal>
  );
}
```

#### 表单验证对比

| 特性 | 自定义jQuery验证 | React Hook Form + Zod |
|-----|-----------------|----------------------|
| 验证定义 | 自定义rules对象 | Zod Schema定义 |
| 类型推断 | 无 | TypeScript自动推断 |
| 表单状态 | 手动管理DOM | 自动管理状态 |
| 错误显示 | 手动操作DOM | 错误对象自动传递 |
| 表单重置 | 手动reset | 内置reset函数 |
| 字段监听 | 手动绑定事件 | watch函数 |
| 嵌套验证 | 手动实现 | Zod原生支持 |
| 性能优化 | 每次全表单验证 | 按需验证 + 防抖 |
| 开发体验 | DOM操作繁琐 | 声明式API |

### 5. 组件化迁移

#### 原jQuery非组件化方式

```javascript
// legacy/js/users.js
var Users = {
    renderUsersList: function(users) {
        var $list = $('#users-list');
        $list.empty();
        
        if (!users || users.length === 0) {
            $list.append('<tr><td colspan="8" class="text-center">暂无用户数据</td></tr>');
            return;
        }
        
        users.forEach(function(user) {
            var statusClass = user.status === 'active' ? 'status-active' : 'status-inactive';
            var statusText = user.status === 'active' ? '激活' : '禁用';
            var roleName = user.role ? user.role.name : '-';
            
            var html = '<tr>' +
                '<td>' + user.id + '</td>' +
                '<td>' + Utils.escapeHtml(user.username) + '</td>' +
                '<td>' + Utils.escapeHtml(user.email) + '</td>' +
                '<td>' + Utils.escapeHtml(roleName) + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td class="actions">' +
                    '<button class="btn btn-sm btn-primary edit-user-btn" data-id="' + user.id + '">编辑</button>' +
                    '<button class="btn btn-sm btn-danger delete-user-btn" data-id="' + user.id + '">删除</button>' +
                '</td>' +
                '</tr>';
            
            $list.append(html);
        });
    }
};

// 事件绑定
$('#users-list').on('click', '.edit-user-btn', function(e) {
    e.preventDefault();
    var userId = parseInt($(this).data('id'));
    self.showUserForm('edit', userId);
});

$('#users-list').on('click', '.delete-user-btn', function(e) {
    e.preventDefault();
    var userId = parseInt($(this).data('id'));
    self.showDeleteConfirm(userId);
});
```

#### 迁移后React组件化方式

```typescript
// src/components/Table.tsx
import { createContext, useContext, useState, useMemo } from 'react';

interface TableContextType {
  selectedRows: (string | number)[];
  toggleRow: (id: string | number) => void;
  // ...
}

const TableContext = createContext<TableContextType | undefined>(undefined);

interface TableProps {
  children: ReactNode;
  getRowId?: (row: unknown) => string | number;
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selected: (string | number)[]) => void;
}

export function Table({
  children,
  getRowId = (row: unknown) => (row as { id: string | number }).id,
  selectable = false,
  selectedRows: externalSelected,
  onSelectionChange,
}: TableProps) {
  const [internalSelected, setInternalSelected] = useState<(string | number)[]>([]);
  const selectedRows = externalSelected ?? internalSelected;
  const setSelectedRows = onSelectionChange ?? setInternalSelected;

  const contextValue: TableContextType = {
    selectedRows,
    toggleRow: (id) => {
      const newSelected = selectedRows.includes(id)
        ? selectedRows.filter((r) => r !== id)
        : [...selectedRows, id];
      setSelectedRows(newSelected);
    },
    // ...
  };

  return (
    <TableContext.Provider value={contextValue}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">{children}</table>
      </div>
    </TableContext.Provider>
  );
}

// 子组件
export function TableRow({ row, children, onClick, className }: TableRowProps) {
  const { selectedRows, getRowId } = useTableContext();
  const id = getRowId(row);
  const isSelected = selectedRows.includes(id);

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// 使用示例
// src/pages/UsersPage.tsx
<Table>
  <TableHeader>
    <TableHeaderCell>ID</TableHeaderCell>
    <TableHeaderCell>用户名</TableHeaderCell>
    <TableHeaderCell>邮箱</TableHeaderCell>
    <TableHeaderCell>角色</TableHeaderCell>
    <TableHeaderCell>状态</TableHeaderCell>
    <TableHeaderCell className="text-right">操作</TableHeaderCell>
  </TableHeader>
  <TableBody>
    {usersData.items.map((user) => (
      <TableRow key={user.id} row={user}>
        <TableCell>{user.id}</TableCell>
        <TableCell className="font-medium">{user.username}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role?.name || '-'}</TableCell>
        <TableCell>
          <StatusBadge status={user.status} />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
              编辑
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id)}>
              删除
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### 组件化对比

| 特性 | jQuery方式 | React组件化方式 |
|-----|------------|----------------|
| UI构建 | 字符串拼接HTML | JSX声明式 |
| 状态管理 | 全局变量 | 组件内部状态 + Context |
| 事件绑定 | 事件委托 + data属性 | 直接绑定函数 |
| 数据传递 | DOM data属性 | Props传递 |
| 代码复用 | 复制粘贴代码 | 组件复用 + 组合 |
| 性能优化 | 手动DOM操作 | Virtual DOM |
| 可测试性 | 需要真实DOM | 可独立测试 |
| 开发体验 | 命令式操作DOM | 声明式描述UI |

---

## 详细迁移步骤

### 第一步：项目初始化

#### 1.1 创建React+TypeScript项目

```bash
# 使用Vite创建项目
npm create vite@latest . -- --template react-ts

# 安装基础依赖
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form @hookform/resolvers zod
npm install tailwindcss postcss autoprefixer

# 安装开发依赖
npm install -D @playwright/test @storybook/react @storybook/react-vite
npm install -D @storybook/addon-essentials @storybook/addon-interactions
npm install -D typescript @types/node @types/react @types/react-dom
```

#### 1.2 配置文件

**tsconfig.json**（严格模式）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**tailwind.config.js**

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
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
  },
})
```

### 第二步：类型定义迁移

#### 2.1 从jQuery代码中提取类型

原jQuery代码中的数据结构：

```javascript
// legacy/js/api.js
var mockData = {
    users: [
        { 
            id: 1, 
            username: 'admin', 
            email: 'admin@example.com',
            roleId: 1,
            status: 'active',
            // ...
        }
    ],
    roles: [
        {
            id: 1,
            name: '超级管理员',
            code: 'admin',
            // ...
        }
    ]
};
```

迁移为TypeScript类型：

```typescript
// src/types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  status: 'active' | 'inactive' | 'pending';
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

// ... 更多类型定义
```

#### 2.2 类型安全优势

```typescript
// 编译时错误检查
const user: User = {
  id: '1',  // ❌ 错误：类型'string'不能赋值给类型'number'
  username: 'admin',
  email: 'admin@example.com',
  roleId: 1,
  status: 'invalid',  // ❌ 错误：类型'"invalid"'不能赋值给类型'"active" | "inactive" | "pending"'
  createdAt: '2024-01-01'
};

// 自动补全
user.  // IDE自动提示: id, username, email, roleId, status...

// 重构安全
// 如果修改了User接口的属性名，所有引用处都会报错
```

### 第三步：API层迁移

#### 3.1 保持相同的数据结构

迁移时最重要的原则之一是：**保持API返回的数据结构与原jQuery应用完全一致**。

```typescript
// src/services/api.ts

// 模拟数据结构与jQuery版本完全相同
const mockData = {
  users: [
    { 
      id: 1, 
      username: 'admin', 
      email: 'admin@example.com',
      roleId: 1,
      status: 'active' as const,
      // ...
    }
  ],
  // ...
};

// API方法签名与jQuery版本一致
export const api = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    // 相同的业务逻辑
  },
  
  async getUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    roleId?: number;
  } = {}): Promise<PaginatedResponse<User>> {
    // 相同的筛选、分页逻辑
  },
  
  // ... 更多API方法
};
```

#### 3.2 错误处理改进

```typescript
// 自定义错误类
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
  const user = await api.getUser(999);  // 不存在的用户
} catch (error) {
  if (error instanceof ApiError) {
    console.log('状态码:', error.status);  // 404
    console.log('错误信息:', error.message);  // '用户不存在'
  }
}
```

### 第四步：状态管理迁移

#### 4.1 创建Context Providers

```typescript
// src/context/AuthContext.tsx

// 1. 定义状态类型
interface AuthState {
  isAuthenticated: boolean;
  user: (User & { role: Role; permissions: Permission[] }) | null;
  token: string | null;
}

// 2. 定义Action类型
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: LoginResponse }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_AUTH'; payload: AuthState };

// 3. 定义Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}

// 4. 创建Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 5. 创建Provider组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // 恢复存储的认证状态
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('auth');
    if (storedAuth) {
      const authData: AuthState = JSON.parse(storedAuth);
      dispatch({ type: 'RESTORE_AUTH', payload: authData });
    }
  }, []);
  
  // 登录方法
  const login = async (credentials: LoginRequest) => {
    const response = await api.login(credentials);
    
    // 更新状态
    dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    
    // 持久化存储
    sessionStorage.setItem('auth', JSON.stringify({
      token: response.token,
      user: response.user
    }));
  };
  
  const value: AuthContextType = {
    ...state,
    login,
    logout: async () => {
      await api.logout();
      sessionStorage.removeItem('auth');
      dispatch({ type: 'LOGOUT' });
    },
    hasPermission: (code: string) => {
      if (!state.user?.permissions) return false;
      return state.user.permissions.some((p) => p.code === code);
    },
    isAdmin: () => state.user?.role?.code === 'admin',
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 6. 创建Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 4.2 在应用中使用

```typescript
// src/App.tsx
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            {/* ... 其他路由 */}
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

// 在组件中使用
function SomeComponent() {
  const { user, logout, hasPermission, isAdmin } = useAuth();
  
  return (
    <div>
      <p>当前用户: {user?.username}</p>
      {hasPermission('user:delete') && (
        <button onClick={handleDelete}>删除用户</button>
      )}
      {isAdmin() && <button>管理员操作</button>}
      <button onClick={logout}>退出</button>
    </div>
  );
}
```

### 第五步：组件化迁移

#### 5.1 提取可复用组件

从jQuery代码中识别可复用的UI模式：

| jQuery代码中的模式 | React组件 |
|-------------------|-----------|
| `<button class="btn btn-primary">` | `<Button variant="primary">` |
| `<input>` + 错误显示 | `<Input error={errors.field?.message}>` |
| 模态框HTML结构 | `<Modal>` 组件 |
| 表格渲染逻辑 | `<Table>` 组件系列 |
| 分页HTML | `<Pagination>` 组件 |
| Toast通知 | `<ToastContainer>` + useToast Hook |

#### 5.2 组件设计原则

**单一职责原则**

```typescript
// ❌ 不好的设计：一个组件做太多事情
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // 包含了：数据获取、模态框控制、表单处理、表格渲染...
}

// ✅ 好的设计：分离关注点
function UsersPage() {
  // 页面级状态和逻辑
  const [filter, setFilter] = useState({ search: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 数据获取委托给React Query
  const { data: usersData } = useQuery({
    queryKey: queryKeys.users.list(filter),
    queryFn: () => api.getUsers(filter),
  });
  
  return (
    <div>
      <FilterSection filter={filter} onFilterChange={setFilter} />
      <UserTable users={usersData?.items || []} onEdit={handleEdit} onDelete={handleDelete} />
      <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

// 独立的表格组件
function UserTable({ users, onEdit, onDelete }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableHeaderCell>ID</TableHeaderCell>
        {/* ... */}
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} row={user}>
            <TableCell>{user.id}</TableCell>
            {/* ... */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**可测试性设计**

```typescript
// ✅ 组件不依赖外部状态，易于测试
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  onClick,
  children 
}: ButtonProps) {
  // 纯UI逻辑，无副作用
  return (
    <button 
      className={cn(variantClasses[variant], sizeClasses[size])}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}

// 测试用例
// Button.stories.tsx - Storybook可视化测试
// Button.test.tsx - 单元测试
```

### 第六步：表单迁移

#### 6.1 创建Zod Schema

```typescript
// src/schemas/index.ts
import { z } from 'zod';

// 基础字段验证
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
});

// 创建用户时需要密码
export const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(6, '密码至少需要6个字符'),
  confirmPassword: z
    .string()
    .min(6, '确认密码至少需要6个字符'),
})
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],  // 错误关联到confirmPassword字段
  }
);

// 编辑用户时密码可选
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

// 自动生成类型
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
```

#### 6.2 使用React Hook Form

```typescript
function UserFormModal({ isOpen, onClose, editingUser, roles }: Props) {
  const isEdit = !!editingUser;
  
  const {
    register,        // 注册表单字段
    handleSubmit,    // 处理提交
    formState: { errors },  // 错误状态
    reset,           // 重置表单
    watch,           // 监听字段变化
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: isEdit
      ? {
          username: editingUser!.username,
          email: editingUser!.email,
          roleId: editingUser!.roleId,
          status: editingUser!.status,
          password: '',  // 编辑时密码为空表示不修改
          confirmPassword: '',
        }
      : {
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          roleId: '',  // 空字符串表示未选择
          status: 'active',
        },
  });
  
  // 监听密码变化
  const password = watch('password');
  
  // 使用React Query mutation
  const createMutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onClose();
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserFormData }) =>
      api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onClose();
    },
  });
  
  const onSubmit = (data: CreateUserFormData) => {
    if (isEdit) {
      // 编辑时，如果密码为空则不发送密码字段
      const updateData: UpdateUserFormData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.confirmPassword;
      }
      updateMutation.mutate({ id: editingUser!.id, data: updateData });
    } else {
      createMutation.mutate(data);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '编辑用户' : '添加用户'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="用户名"
          type="text"
          placeholder="请输入用户名"
          isRequired
          error={errors.username?.message}
          register={register('username')}
        />
        
        <Input
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          isRequired
          error={errors.email?.message}
          register={register('email')}
        />
        
        <Input
          label={isEdit ? '密码 (留空则不修改)' : '密码'}
          type="password"
          placeholder={isEdit ? '留空则不修改' : '请输入密码'}
          isRequired={!isEdit}
          error={errors.password?.message}
          register={register('password')}
        />
        
        {/* 只有输入了密码才需要确认密码 */}
        {password && (
          <Input
            label="确认密码"
            type="password"
            placeholder="请再次输入密码"
            isRequired
            error={errors.confirmPassword?.message}
            register={register('confirmPassword')}
          />
        )}
        
        <Select
          label="角色"
          options={roles.map((r) => ({ value: r.id, label: r.name }))}
          placeholder="请选择角色"
          isRequired
          error={errors.roleId?.message}
          register={register('roleId')}
        />
        
        <Button 
          type="submit" 
          isLoading={createMutation.isPending || updateMutation.isPending}
        >
          保存
        </Button>
      </form>
    </Modal>
  );
}
```

### 第七步：React Query集成

#### 7.1 配置Query Client

```typescript
// src/services/queryClient.ts
import { QueryClient, QueryFunction } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 缓存时间：5分钟内视为新鲜，不重新请求
      staleTime: 5 * 60 * 1000,
      
      // 垃圾回收时间：10分钟后清除缓存
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
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // 窗口重新获得焦点时重新获取数据
      refetchOnWindowFocus: true,
      
      // 网络重新连接时重新获取数据
      refetchOnReconnect: true,
    },
    mutations: {
      // 操作默认不重试
      retry: false,
    },
  },
});

// 查询键定义 - 用于缓存管理
export const queryKeys = {
  users: {
    all: ['users'] as const,
    list: (params?: { page?: number; search?: string; status?: string }) =>
      [...queryKeys.users.all, 'list', params] as const,
    detail: (id: number) =>
      [...queryKeys.users.all, 'detail', id] as const,
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

#### 7.2 使用useQuery获取数据

```typescript
// src/pages/UsersPage.tsx
export function UsersPage() {
  const [filter, setFilter] = useState<UsersFilter>({
    search: '',
    status: '',
    roleId: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 防抖搜索
  const debouncedSearch = useDebounce(filter.search, 300);
  
  // 使用React Query获取用户列表
  const { 
    data: usersData, 
    isLoading: isLoadingUsers,
    error: usersError,
    refetch,
  } = useQuery({
    // 查询键 - 根据参数自动管理缓存
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
    // 可选配置
    enabled: true,  // 是否启用查询
    staleTime: 60 * 1000,  // 此查询的缓存时间
  });
  
  // 获取角色列表（用于筛选下拉框）
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: api.getRoles,
  });
  
  const isLoading = isLoadingUsers || isLoadingRoles;
  
  if (isLoading) {
    return <Loading text="加载中..." />;
  }
  
  if (usersError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{usersError.message}</p>
        <Button onClick={() => refetch()}>重试</Button>
      </div>
    );
  }
  
  return (
    <div>
      <FilterSection 
        filter={filter} 
        onFilterChange={(key, value) => {
          setFilter((prev) => ({ ...prev, [key]: value }));
          setPage(1);  // 筛选变更时回到第一页
        }}
        roles={roles || []}
      />
      
      <UserTable users={usersData?.items || []} />
      
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

#### 7.3 使用useMutation修改数据

```typescript
// src/pages/UsersPage.tsx
export function UsersPage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  
  // 删除操作
  const deleteMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      // 使相关查询失效，自动重新获取数据
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      showSuccess('用户删除成功');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
  
  // 乐观更新示例
  const optimisticDeleteMutation = useMutation({
    mutationFn: api.deleteUser,
    onMutate: async (userId) => {
      // 1. 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });
      
      // 2. 保存当前状态
      const previousUsers = queryClient.getQueryData(queryKeys.users.list());
      
      // 3. 乐观更新
      queryClient.setQueryData(
        queryKeys.users.list(),
        (oldData: any) => ({
          ...oldData,
          items: oldData.items.filter((u: User) => u.id !== userId),
          total: oldData.total - 1,
        })
      );
      
      // 返回context，用于回滚
      return { previousUsers };
    },
    onError: (err, userId, context) => {
      // 回滚到之前的状态
      if (context?.previousUsers) {
        queryClient.setQueryData(
          queryKeys.users.list(),
          context.previousUsers
        );
      }
    },
    onSettled: () => {
      // 操作完成后重新获取数据以确保一致性
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
  
  const handleDeleteUser = (userId: number) => {
    // 显示确认对话框
    setDeletingUserId(userId);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (deletingUserId) {
      deleteMutation.mutate(deletingUserId);
    }
  };
  
  return (
    <>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUserId(null);
        }}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除该用户吗？此操作无法撤销。"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
```

---

## 技术栈对比

### 详细对比表

| 维度 | jQuery | React+TypeScript | 优势 |
|-----|--------|------------------|------|
| **开发体验** | 命令式DOM操作 | 声明式JSX | React更直观，代码更易读 |
| **类型安全** | 无 | TypeScript严格类型 | React减少运行时错误 |
| **状态管理** | 全局变量 | Context + Reducer | React更可预测，易调试 |
| **数据获取** | $.ajax手动封装 | React Query | React内置缓存、重试、乐观更新 |
| **表单处理** | 自定义验证 | React Hook Form + Zod | React更简洁，类型安全 |
| **组件复用** | 复制粘贴代码 | 组件化开发 | React复用性更强 |
| **性能** | 手动DOM操作 | Virtual DOM | React自动优化，减少重绘 |
| **可测试性** | 需要真实DOM | 可独立测试 | React更容易编写测试 |
| **开发工具** | Console.log | React DevTools | React提供强大的调试能力 |
| **生态系统** | jQuery插件生态 | React生态系统 | React生态更丰富、更现代 |
| **学习曲线** | 较低 | 较高 | jQuery入门更快，React长期收益更高 |
| **项目规模** | 适合小型项目 | 适合中大型项目 | React在大型项目中优势明显 |

### 具体场景对比

#### 场景1：表单验证

**jQuery方式**（约50行代码）

```javascript
// 1. 手动获取表单值
var formData = {
    username: $('#username').val(),
    email: $('#email').val(),
    password: $('#password').val(),
    confirmPassword: $('#confirmPassword').val()
};

// 2. 手动验证
var errors = {};
if (!formData.username || formData.username.length < 3) {
    errors.username = '用户名至少需要3个字符';
}
if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = '请输入有效的邮箱地址';
}
if (!formData.password || formData.password.length < 6) {
    errors.password = '密码至少需要6个字符';
}
if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致';
}

// 3. 手动显示错误
if (Object.keys(errors).length > 0) {
    $('.error-message').text('');
    $('.error').removeClass('error');
    for (var field in errors) {
        $('[name="' + field + '"]').addClass('error');
        $('[name="' + field + '"]')
            .closest('.form-group')
            .find('.error-message')
            .text(errors[field]);
    }
    return;
}

// 4. 手动提交
$.ajax({
    url: '/api/users',
    method: 'POST',
    data: formData,
    success: function(response) {
        // 手动刷新页面或更新DOM
        loadUsers();
    },
    error: function(xhr) {
        // 手动处理错误
        showToast(xhr.responseJSON.message, 'error');
    }
});
```

**React方式**（约20行代码）

```typescript
// 1. Schema定义（可复用）
const createUserSchema = z.object({
  username: z.string().min(3, '用户名至少需要3个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// 2. 使用Hook
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(createUserSchema),
  defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
});

// 3. 提交（使用React Query）
const mutation = useMutation({
  mutationFn: api.createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  },
});

// 4. 渲染（自动显示错误）
return (
  <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
    <Input label="用户名" error={errors.username?.message} register={register('username')} />
    <Input label="邮箱" error={errors.email?.message} register={register('email')} />
    <Input label="密码" type="password" error={errors.password?.message} register={register('password')} />
    <Input label="确认密码" type="password" error={errors.confirmPassword?.message} register={register('confirmPassword')} />
    <Button type="submit" isLoading={mutation.isPending}>提交</Button>
  </form>
);
```

**对比结果**

| 指标 | jQuery | React |
|-----|--------|-------|
| 代码行数 | ~50行 | ~20行 |
| 可复用性 | 验证逻辑不可复用 | Schema可复用 |
| 类型安全 | 无 | 完全类型安全 |
| 错误处理 | 手动操作DOM | 自动传递错误 |
| 状态管理 | 手动管理 | Hook自动管理 |
| 加载状态 | 手动控制 | 自动isLoading状态 |

#### 场景2：数据获取与缓存

**jQuery方式**

```javascript
var Users = {
    state: {
        currentPage: 1,
        pageSize: 10,
        searchKeyword: '',
        cachedData: null  // 手动缓存
    },
    
    loadData: function(forceRefresh) {
        var self = this;
        
        // 手动检查缓存
        if (!forceRefresh && self.state.cachedData) {
            self.renderUsersList(self.state.cachedData);
            return;
        }
        
        Utils.showLoading();
        
        // 手动处理请求
        $.ajax({
            url: '/api/users',
            method: 'GET',
            data: {
                page: self.state.currentPage,
                pageSize: self.state.pageSize,
                search: self.state.searchKeyword
            },
            success: function(response) {
                // 手动缓存
                self.state.cachedData = response;
                self.renderUsersList(response.items);
                self.renderPagination(response);
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
                // 手动清除缓存
                self.state.cachedData = null;
                // 手动重新加载
                self.loadData(true);
                Utils.showToast('创建成功', 'success');
            },
            error: function(xhr) {
                Utils.showToast(xhr.responseJSON.message, 'error');
            }
        });
    }
};

// 搜索防抖需要手动实现
$('#search-input').on('input', function() {
    var self = this;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(function() {
        Users.state.searchKeyword = $(self).val();
        Users.state.currentPage = 1;
        Users.loadData();
    }, 300);
});
```

**React方式**

```typescript
export function UsersPage() {
  const [filter, setFilter] = useState({ search: '', page: 1, pageSize: 10 });
  
  // 防抖（内置Hook）
  const debouncedSearch = useDebounce(filter.search, 300);
  
  // 数据获取（自动缓存）
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.users.list({
      page: filter.page,
      search: debouncedSearch,
    }),
    queryFn: () => api.getUsers({
      page: filter.page,
      pageSize: filter.pageSize,
      search: debouncedSearch,
    }),
    staleTime: 5 * 60 * 1000,  // 5分钟缓存
  });
  
  // 创建用户（自动失效缓存）
  const createMutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      // 自动使相关缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
  
  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error.message} />;
  
  return (
    <div>
      <Input
        placeholder="搜索..."
        value={filter.search}
        onChange={(e) => setFilter(f => ({ ...f, search: e.target.value, page: 1 }))}
      />
      <UserTable users={data?.items || []} />
      <Pagination
        page={filter.page}
        total={data?.total || 0}
        onPageChange={(page) => setFilter(f => ({ ...f, page }))}
      />
    </div>
  );
}
```

**对比结果**

| 功能 | jQuery | React Query |
|-----|--------|-------------|
| 数据获取 | 手动$.ajax | useQuery Hook |
| 缓存管理 | 手动实现 | 自动缓存+失效 |
| 防抖搜索 | 手动实现 | useDebounce Hook |
| 错误处理 | 手动catch | 自动error状态 |
| 加载状态 | 手动控制 | 自动isLoading |
| 缓存失效 | 手动清除 | 自动invalidateQueries |
| 重试机制 | 手动实现 | 内置重试策略 |
| 乐观更新 | 手动实现 | 内置支持 |

---

## 测试策略

### 1. 单元测试

#### 测试组件

```typescript
// Button.test.tsx (使用React Testing Library)
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me').closest('button')).toBeDisabled();
  });
  
  it('should show loading spinner when isLoading is true', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
```

#### 测试自定义Hook

```typescript
// usePagination.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination());
    
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.total).toBe(0);
  });
  
  it('should update page when setPage is called', () => {
    const { result } = renderHook(() => usePagination({ initialPage: 1 }));
    
    act(() => {
      result.current.setPage(2);
    });
    
    expect(result.current.page).toBe(2);
  });
  
  it('should calculate totalPages correctly', () => {
    const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));
    
    act(() => {
      result.current.setTotal(25);
    });
    
    expect(result.current.totalPages).toBe(3);
  });
  
  it('should not go to page 0', () => {
    const { result } = renderHook(() => usePagination({ initialPage: 1 }));
    
    act(() => {
      result.current.setPage(0);
    });
    
    expect(result.current.page).toBe(1);  // 保持不变
  });
});
```

### 2. Storybook组件文档

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import Button from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],  // 自动生成文档
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'success', 'warning', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export