# 测试说明文档

## 1. 测试策略概述

### 1.1 测试目标

本项目采用 Playwright 进行端到端（E2E）测试，目标是：

1. **验证迁移前后行为一致性**：确保 React 版本与 jQuery 版本功能完全一致
2. **回归测试**：确保代码修改不会破坏现有功能
3. **用户行为模拟**：模拟真实用户操作路径
4. **跨浏览器兼容**：在 Chromium、Firefox、WebKit 三个浏览器上运行

### 1.2 测试覆盖范围

| 模块 | 功能点 | 优先级 | 测试状态 |
|------|--------|--------|---------|
| **登录认证** | 表单显示 | P1 | ✅ 已覆盖 |
| | 空表单验证 | P1 | ✅ 已覆盖 |
| | 成功登录 | P1 | ✅ 已覆盖 |
| | 失败登录 | P1 | ✅ 已覆盖 |
| | 记住我选项 | P2 | ✅ 已覆盖 |
| | 错误清除 | P2 | ✅ 已覆盖 |
| | 登出功能 | P1 | ✅ 已覆盖 |
| **仪表盘** | 导航栏显示 | P1 | ✅ 已覆盖 |
| | 用户信息显示 | P1 | ✅ 已覆盖 |
| | 统计卡片 | P1 | ✅ 已覆盖 |
| | 最近活动表格 | P1 | ✅ 已覆盖 |
| | 导航功能 | P1 | ✅ 已覆盖 |
| **用户管理** | 页面标题 | P1 | ✅ 已覆盖 |
| | 添加用户按钮 | P1 | ✅ 已覆盖 |
| | 搜索筛选 | P1 | ✅ 已覆盖 |
| | 用户列表 | P1 | ✅ 已覆盖 |
| | 状态筛选 | P2 | ✅ 已覆盖 |
| | 添加用户模态框 | P1 | ✅ 已覆盖 |
| | 编辑用户模态框 | P1 | ✅ 已覆盖 |
| | 删除用户确认 | P1 | ✅ 已覆盖 |
| | 分页组件 | P2 | ✅ 已覆盖 |
| **角色管理** | 页面标题 | P1 | ❌ 未覆盖 |
| | 添加角色按钮 | P1 | ❌ 未覆盖 |
| | 角色列表 | P1 | ❌ 未覆盖 |
| | 编辑角色 | P1 | ❌ 未覆盖 |
| | 删除角色 | P1 | ❌ 未覆盖 |
| | 权限树 | P2 | ❌ 未覆盖 |
| **权限管理** | 页面标题 | P1 | ❌ 未覆盖 |
| | 权限列表 | P1 | ❌ 未覆盖 |
| | 权限树结构 | P2 | ❌ 未覆盖 |
| **系统设置** | 页面标题 | P1 | ❌ 未覆盖 |
| | 标签切换 | P1 | ❌ 未覆盖 |
| | 保存设置 | P2 | ❌ 未覆盖 |
| **表单验证** | 必填字段 | P1 | ⚠️ 部分覆盖 |
| | 格式验证 | P2 | ⚠️ 部分覆盖 |
| | 密码确认 | P2 | ❌ 未覆盖 |
| | 边界值测试 | P2 | ❌ 未覆盖 |
| **权限控制** | 不同角色访问 | P1 | ❌ 未覆盖 |
| | 未登录重定向 | P1 | ❌ 未覆盖 |

---

## 2. 现有测试分析

### 2.1 测试文件结构

```
e2e/
├── login.spec.ts      # 登录测试（6个测试用例）
├── dashboard.spec.ts  # 仪表盘测试（9个测试用例）
└── users.spec.ts      # 用户管理测试（13个测试用例）
```

### 2.2 各文件测试详情

#### login.spec.ts - 登录测试

| 测试用例 | 功能点 | 优先级 |
|---------|--------|--------|
| 应该显示登录表单 | UI显示 | P1 |
| 应该显示测试账号信息 | UI显示 | P2 |
| 空表单提交应该显示错误 | 表单验证 | P1 |
| 使用管理员账号登录成功 | 核心功能 | P1 |
| 使用错误密码登录应该显示错误 | 错误处理 | P1 |
| 记住我选项应该可勾选 | UI交互 | P2 |
| 输入用户名后应该清除错误 | 交互体验 | P2 |

#### dashboard.spec.ts - 仪表盘测试

| 测试用例 | 功能点 | 优先级 |
|---------|--------|--------|
| 应该显示导航栏 | UI显示 | P1 |
| 应该显示用户信息和退出按钮 | UI显示 | P1 |
| 应该显示统计卡片 | UI显示 | P1 |
| 应该显示最近活动表格 | UI显示 | P1 |
| 导航到用户管理页面 | 导航功能 | P1 |
| 导航到角色管理页面 | 导航功能 | P1 |
| 导航到权限管理页面 | 导航功能 | P1 |
| 导航到系统设置页面 | 导航功能 | P1 |
| 退出登录 | 核心功能 | P1 |

#### users.spec.ts - 用户管理测试

| 测试用例 | 功能点 | 优先级 |
|---------|--------|--------|
| 应该显示用户管理页面标题 | UI显示 | P1 |
| 应该显示添加用户按钮 | UI显示 | P1 |
| 应该显示搜索和筛选区域 | UI显示 | P1 |
| 应该显示用户列表表格 | UI显示 | P1 |
| 应该显示用户数据 | 数据显示 | P1 |
| 搜索功能应该可以筛选用户 | 核心功能 | P1 |
| 状态筛选应该可以筛选用户 | 核心功能 | P1 |
| 点击添加用户应该打开模态框 | 交互功能 | P1 |
| 添加用户模态框应该包含所有字段 | UI显示 | P1 |
| 关闭模态框应该隐藏添加用户表单 | 交互功能 | P1 |
| 点击编辑用户应该打开编辑模态框 | 交互功能 | P1 |
| 点击删除用户应该打开确认模态框 | 交互功能 | P1 |
| 分页组件应该显示 | UI显示 | P2 |

### 2.3 测试覆盖率评估

| 维度 | 覆盖率 | 说明 |
|------|--------|------|
| **页面覆盖** | 60% | 5个页面覆盖了3个（缺少角色、权限、设置） |
| **功能覆盖** | 40% | 大量CRUD操作和表单验证未测试 |
| **浏览器覆盖** | 100% | 配置了Chromium、Firefox、WebKit |
| **错误场景** | 30% | 缺少大量边界情况和错误处理测试 |

---

## 3. 测试扩展指南

### 3.1 需要补充的测试

#### 优先级 P1 - 必须补充

| 模块 | 测试场景 | 测试内容 |
|------|---------|---------|
| **角色管理** | 添加角色 | 成功创建新角色 |
| | 编辑角色 | 修改角色信息和权限 |
| | 删除角色 | 删除角色（无用户时成功，有用户时失败） |
| | 权限树 | 权限树展开/折叠、勾选/取消勾选 |
| **权限管理** | 页面显示 | 权限列表和权限树显示 |
| | 权限结构 | 父子权限关系 |
| **系统设置** | 标签切换 | 基本设置、安全设置、通知设置切换 |
| | 表单显示 | 各设置表单字段显示 |
| **用户管理** | 创建用户 | 完整的创建用户流程（成功/失败场景） |
| | 编辑用户 | 完整的编辑用户流程 |
| | 删除用户 | 完整的删除用户流程（确认/取消） |
| | 分页功能 | 切换页码、每页显示数量 |
| **权限控制** | 未登录访问 | 访问受保护页面自动重定向到登录 |
| | 不同角色 | editor、user1 角色的权限限制 |
| **表单验证** | 密码确认 | 两次密码不一致的错误提示 |
| | 邮箱格式 | 无效邮箱的错误提示 |
| | 用户名格式 | 包含特殊字符的错误提示 |

#### 优先级 P2 - 建议补充

| 模块 | 测试场景 | 测试内容 |
|------|---------|---------|
| **用户管理** | 角色筛选 | 按角色筛选用户 |
| | 多条件筛选 | 搜索 + 状态 + 角色组合筛选 |
| **响应式** | 移动端 | 不同屏幕尺寸的显示效果 |
| **性能** | 加载状态 | 显示加载状态时的UI |
| **通知** | 成功提示 | 操作成功后的通知显示 |
| | 错误提示 | 操作失败后的通知显示 |

### 3.2 测试编写规范

#### 命名规范

```typescript
// 测试文件：模块名.spec.ts
// 例如：users.spec.ts, roles.spec.ts

// 测试套件：使用中文描述功能
test.describe('用户管理页面', () => {
  // ...
});

// 测试用例：使用中文描述期望行为
test('应该成功创建新用户', async ({ page }) => {
  // ...
});
```

#### 选择器规范

```typescript
// ✅ 推荐：使用角色选择器（最稳定）
await page.getByRole('button', { name: '登录' }).click();
await page.getByRole('link', { name: '用户管理' }).click();
await page.getByRole('textbox', { name: '用户名' }).fill('admin');

// ✅ 推荐：使用标签选择器
await page.getByLabel('密码').fill('admin123');

// ✅ 推荐：使用占位符选择器
await page.getByPlaceholder('搜索用户名...').fill('test');

// ✅ 推荐：使用data-testid（需要在组件中添加）
await page.getByTestId('submit-button').click();

// ⚠️ 谨慎使用：文本选择器（可能因翻译或文案修改而失效）
await page.getByText('添加用户').click();

// ❌ 不推荐：CSS选择器（脆弱，DOM结构变化即失效）
await page.locator('.btn-primary').click();
```

#### 测试结构规范

```typescript
// 1. 准备阶段（Arrange）
test.beforeEach(async ({ page }) => {
  // 登录
  await page.goto('/login');
  await page.getByLabel('用户名').fill('admin');
  await page.getByLabel('密码').fill('admin123');
  await page.getByRole('button', { name: '登录' }).click();
  
  // 导航到测试页面
  await page.getByRole('link', { name: '用户管理' }).click();
});

// 2. 测试用例
test('应该成功创建新用户', async ({ page }) => {
  // 2.1 执行操作（Act）
  await page.getByRole('button', { name: '添加用户' }).click();
  await page.getByLabel('用户名').fill('newuser');
  await page.getByLabel('邮箱').fill('newuser@example.com');
  await page.getByLabel('密码').fill('password123');
  await page.getByLabel('确认密码').fill('password123');
  await page.getByRole('button', { name: '创建' }).click();
  
  // 2.2 断言结果（Assert）
  await expect(page.getByText('用户创建成功')).toBeVisible();
  await expect(page.getByText('newuser')).toBeVisible();
});

// 3. 错误场景测试
test('两次密码不一致应该显示错误', async ({ page }) => {
  await page.getByRole('button', { name: '添加用户' }).click();
  await page.getByLabel('密码').fill('password123');
  await page.getByLabel('确认密码').fill('different456');
  await page.getByRole('button', { name: '创建' }).click();
  
  // 验证错误提示
  await expect(page.getByText('两次输入的密码不一致')).toBeVisible();
});
```

#### 断言规范

```typescript
// ✅ 推荐：使用Playwright的自动等待断言
await expect(page.getByText('用户创建成功')).toBeVisible();
await expect(page).toHaveURL(/\/users/);
await expect(page.getByLabel('用户名')).toHaveValue('admin');

// ✅ 推荐：验证元素不存在
await expect(page.getByText('加载中')).not.toBeVisible();

// ⚠️ 注意：不要使用硬编码的等待
// ❌ 不推荐
await page.waitForTimeout(1000);

// ✅ 推荐：等待特定条件
await expect(page.getByText('用户创建成功')).toBeVisible();
await page.waitForURL(/\/users/);
```

### 3.3 测试辅助函数

建议创建测试辅助函数来减少重复代码：

```typescript
// e2e/helpers/auth.ts
import { Page } from '@playwright/test';

export async function loginAs(
  page: Page,
  username: string = 'admin',
  password: string = 'admin123'
) {
  await page.goto('/login');
  await page.getByLabel('用户名').fill(username);
  await page.getByLabel('密码').fill(password);
  await page.getByRole('button', { name: '登录' }).click();
  await page.waitForURL(/\/dashboard/);
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: '退出登录' }).click();
  await page.waitForURL(/\/login/);
}

// e2e/helpers/navigation.ts
import { Page } from '@playwright/test';

export async function navigateTo(page: Page, pageName: string) {
  await page.getByRole('link', { name: pageName }).click();
  await page.waitForURL(new RegExp(`/${pageName.toLowerCase()}`));
}
```

使用示例：

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { navigateTo } from './helpers/navigation';

test.describe('用户管理页面', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await navigateTo(page, '用户管理');
  });
  
  test('应该显示用户列表', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });
});
```

---

## 4. 测试用例补充示例

### 4.1 角色管理测试

创建 `e2e/roles.spec.ts`：

```typescript
import { test, expect } from '@playwright/test';

test.describe('角色管理页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('用户名').fill('admin');
    await page.getByLabel('密码').fill('admin123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL(/\/dashboard/);
    await page.getByRole('link', { name: '角色管理' }).click();
    await page.waitForURL(/\/roles/);
  });

  test('应该显示角色管理页面标题', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '角色管理' })).toBeVisible();
    await expect(page.getByText('管理系统中的所有角色')).toBeVisible();
  });

  test('应该显示添加角色按钮', async ({ page }) => {
    await expect(page.getByRole('button', { name: '添加角色' })).toBeVisible();
  });

  test('应该显示角色列表表格', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '角色名称' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '描述' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '权限数量' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '操作' })).toBeVisible();
  });

  test('应该显示预设角色', async ({ page }) => {
    await expect(page.getByText('管理员')).toBeVisible();
    await expect(page.getByText('编辑')).toBeVisible();
    await expect(page.getByText('普通用户')).toBeVisible();
  });

  test('点击添加角色应该打开模态框', async ({ page }) => {
    await page.getByRole('button', { name: '添加角色' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('添加角色')).toBeVisible();
  });

  test('添加角色模态框应该包含所有字段', async ({ page }) => {
    await page.getByRole('button', { name: '添加角色' }).click();
    
    await expect(page.getByLabel('角色名称')).toBeVisible();
    await expect(page.getByLabel('描述')).toBeVisible();
    await expect(page.getByText('权限配置')).toBeVisible();
  });

  test('点击编辑角色应该打开编辑模态框', async ({ page }) => {
    await page.getByRole('row', { name: /普通用户/ }).getByRole('button', { name: '编辑' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('编辑角色')).toBeVisible();
  });

  test('点击删除角色应该打开确认模态框', async ({ page }) => {
    // 注意：这里需要确保删除的角色没有关联用户
    // 实际测试中可能需要先创建一个测试角色再删除
    await expect(page.getByRole('row', { name: /编辑/ }).getByRole('button', { name: '删除' })).toBeVisible();
  });

  test('关闭模态框应该隐藏添加角色表单', async ({ page }) => {
    await page.getByRole('button', { name: '添加角色' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByRole('button', { name: '取消' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
```

### 4.2 权限管理测试

创建 `e2e/permissions.spec.ts`：

```typescript
import { test, expect } from '@playwright/test';

test.describe('权限管理页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('用户名').fill('admin');
    await page.getByLabel('密码').fill('admin123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL(/\/dashboard/);
    await page.getByRole('link', { name: '权限管理' }).click();
    await page.waitForURL(/\/permissions/);
  });

  test('应该显示权限管理页面标题', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '权限管理' })).toBeVisible();
    await expect(page.getByText('管理系统中的所有权限')).toBeVisible();
  });

  test('应该显示权限列表', async ({ page }) => {
    await expect(page.getByText('用户管理')).toBeVisible();
    await expect(page.getByText('角色管理')).toBeVisible();
    await expect(page.getByText('系统设置')).toBeVisible();
  });

  test('应该显示权限树结构', async ({ page }) => {
    // 验证权限树的层级结构
    await expect(page.getByText('查看用户列表')).toBeVisible();
    await expect(page.getByText('创建用户')).toBeVisible();
    await expect(page.getByText('编辑用户')).toBeVisible();
    await expect(page.getByText('删除用户')).toBeVisible();
  });
});
```

### 4.3 系统设置测试

创建 `e2e/settings.spec.ts`：

```typescript
import { test, expect } from '@playwright/test';

test.describe('系统设置页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('用户名').fill('admin');
    await page.getByLabel('密码').fill('admin123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL(/\/dashboard/);
    await page.getByRole('link', { name: '系统设置' }).click();
    await page.waitForURL(/\/settings/);
  });

  test('应该显示系统设置页面标题', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '系统设置' })).toBeVisible();
  });

  test('应该显示设置标签', async ({ page }) => {
    await expect(page.getByRole('tab', { name: '基本设置' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '安全设置' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '通知设置' })).toBeVisible();
  });

  test('点击标签应该切换设置内容', async ({ page }) => {
    // 默认显示基本设置
    await expect(page.getByText('网站名称')).toBeVisible();
    
    // 切换到安全设置
    await page.getByRole('tab', { name: '安全设置' }).click();
    await expect(page.getByText('密码最小长度')).toBeVisible();
    
    // 切换到通知设置
    await page.getByRole('tab', { name: '通知设置' }).click();
    await expect(page.getByText('邮件通知')).toBeVisible();
    
    // 切回基本设置
    await page.getByRole('tab', { name: '基本设置' }).click();
    await expect(page.getByText('网站名称')).toBeVisible();
  });

  test('基本设置应该包含所有字段', async ({ page }) => {
    await expect(page.getByLabel('网站名称')).toBeVisible();
    await expect(page.getByLabel('网站描述')).toBeVisible();
    await expect(page.getByLabel('联系邮箱')).toBeVisible();
  });

  test('安全设置应该包含所有字段', async ({ page }) => {
    await page.getByRole('tab', { name: '安全设置' }).click();
    
    await expect(page.getByLabel('密码最小长度')).toBeVisible();
    await expect(page.getByText('会话超时时间')).toBeVisible();
    await expect(page.getByText('允许连续登录失败次数')).toBeVisible();
  });

  test('通知设置应该包含所有字段', async ({ page }) => {
    await page.getByRole('tab', { name: '通知设置' }).click();
    
    await expect(page.getByText('邮件通知')).toBeVisible();
    await expect(page.getByText('短信通知')).toBeVisible();
    await expect(page.getByText('站内消息')).toBeVisible();
  });
});
```

### 4.4 表单验证详细测试

创建 `e2e/form-validation.spec.ts`：

```typescript
import { test, expect } from '@playwright/test';

test.describe('表单验证', () => {
  test.describe('登录表单验证', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('空用户名应该显示错误', async ({ page }) => {
      await page.getByLabel('密码').fill('admin123');
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page.getByText('用户名至少需要3个字符')).toBeVisible();
    });

    test('用户名太短应该显示错误', async ({ page }) => {
      await page.getByLabel('用户名').fill('ad');
      await page.getByLabel('密码').fill('admin123');
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page.getByText('用户名至少需要3个字符')).toBeVisible();
    });

    test('用户名太长应该显示错误', async ({ page }) => {
      const longUsername = 'a'.repeat(21);
      await page.getByLabel('用户名').fill(longUsername);
      await page.getByLabel('密码').fill('admin123');
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page.getByText('用户名不能超过20个字符')).toBeVisible();
    });

    test('用户名包含特殊字符应该显示错误', async ({ page }) => {
      await page.getByLabel('用户名').fill('admin@test');
      await page.getByLabel('密码').fill('admin123');
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page.getByText('用户名只能包含字母、数字和下划线')).toBeVisible();
    });
  });

  test.describe('添加用户表单验证', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel('用户名').fill('admin');
      await page.getByLabel('密码').fill('admin123');
      await page.getByRole('button', { name: '登录' }).click();
      await page.waitForURL(/\/dashboard/);
      await page.getByRole('link', { name: '用户管理' }).click();
      await page.waitForURL(/\/users/);
      await page.getByRole('button', { name: '添加用户' }).click();
    });

    test('无效邮箱格式应该显示错误', async ({ page }) => {
      await page.getByLabel('用户名').fill('testuser');
      await page.getByLabel('邮箱').fill('invalid-email');
      await page.getByLabel('密码').fill('password123');
      await page.getByLabel('确认密码').fill('password123');
      await page.getByRole('button', { name: '创建' }).click();
      
      await expect(page.getByText('请输入有效的邮箱地址')).toBeVisible();
    });

    test('密码太短应该显示错误', async ({ page }) => {
      await page.getByLabel('用户名').fill('testuser');
      await page.getByLabel('邮箱').fill('test@example.com');
      await page.getByLabel('密码').fill('123');
      await page.getByLabel('确认密码').fill('123');
      await page.getByRole('button', { name: '创建' }).click();
      
      await expect(page.getByText('密码至少需要6个字符')).toBeVisible();
    });

    test('两次密码不一致应该显示错误', async ({ page }) => {
      await page.getByLabel('用户名').fill('testuser');
      await page.getByLabel('邮箱').fill('test@example.com');
      await page.getByLabel('密码').fill('password123');
      await page.getByLabel('确认密码').fill('different456');
      await page.getByRole('button', { name: '创建' }).click();
      
      await expect(page.getByText('两次输入的密码不一致')).toBeVisible();
    });

    test('未选择角色应该显示错误', async ({ page }) => {
      await page.getByLabel('用户名').fill('testuser');
      await page.getByLabel('邮箱').fill('test@example.com');
      await page.getByLabel('密码').fill('password123');
      await page.getByLabel('确认密码').fill('password123');
      
      // 清除角色选择
      await page.getByText('普通用户').click();
      // 实际需要根据具体实现调整
      
      await page.getByRole('button', { name: '创建' }).click();
      // 验证错误（根据具体实现）
    });
  });
});
```

### 4.5 权限控制测试

创建 `e2e/permissions.spec.ts`：

```typescript
import { test, expect } from '@playwright/test';

test.describe('权限控制', () => {
  test.describe('未登录用户', () => {
    test('访问受保护页面应该重定向到登录', async ({ page }) => {
      // 直接访问仪表盘
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('访问用户管理页面应该重定向到登录', async ({ page }) => {
      await page.goto('/users');
      await expect(page).toHaveURL(/\/login/);
    });

    test('访问角色管理页面应该重定向到登录', async ({ page }) => {
      await page.goto('/roles');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('已登录用户', () => {
    test('登录后应该可以访问仪表盘', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel('用户名').fill('admin');
      await page.getByLabel('密码').fill('admin123');
      await page.getByRole('button', { name: '登录' }).click();
      
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
    });

    test('刷新页面后应该保持登录状态', async ({ page }) => {
      // 登录
      await page.goto('/login');
      await page.getByLabel('用户名').fill('admin');
      await page.getByLabel('密码').fill('admin123');
      await page.getByLabel('记住我').check();
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page).toHaveURL(/\/dashboard/);
      
      // 刷新页面
      await page.reload();
      
      // 验证仍然登录
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByText('admin')).toBeVisible();
    });

    test('登出后访问受保护页面应该重定向', async ({ page }) => {
      // 登录
      await page.goto('/login');
      await page.getByLabel('用户名').fill('admin');
      await page.getByLabel('密码').fill('admin123');
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page).toHaveURL(/\/dashboard/);
      
      // 登出
      await page.getByRole('button', { name: '退出登录' }).click();
      await expect(page).toHaveURL(/\/login/);
      
      // 访问受保护页面
      await page.goto('/users');
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
```

---

## 5. 运行测试

### 5.1 运行所有测试

```bash
# 安装Playwright浏览器（首次运行需要）
npx playwright install

# 运行所有测试
npm run test:e2e

# 或使用npx
npx playwright test
```

### 5.2 运行特定测试

```bash
# 运行特定测试文件
npx playwright test login.spec.ts

# 运行特定测试用例（按名称匹配）
npx playwright test -g "成功登录"

# 运行特定测试套件
npx playwright test -g "登录页面"
```

### 5.3 运行测试UI

```bash
# 使用Playwright UI界面运行测试（推荐开发时使用）
npm run test:e2e:ui

# 或
npx playwright test --ui
```

### 5.4 在特定浏览器运行

```bash
# 只在Chromium运行
npx playwright test --project=chromium

# 只在Firefox运行
npx playwright test --project=firefox

# 只在WebKit运行
npx playwright test --project=webkit
```

### 5.5 查看测试报告

```bash
# 测试运行后，查看HTML报告
npx playwright show-report
```

报告包含：
- 测试通过/失败统计
- 失败时的截图
- 失败时的视频录制
- 详细的跟踪信息（trace）

---

## 6. 测试最佳实践

### 6.1 测试隔离

```typescript
// ✅ 推荐：每个测试用例独立
test.beforeEach(async ({ page }) => {
  // 每个测试都重新登录，确保测试之间没有依赖
  await page.goto('/login');
  await page.getByLabel('用户名').fill('admin');
  await page.getByLabel('密码').fill('admin123');
  await page.getByRole('button', { name: '登录' }).click();
});

// ❌ 不推荐：测试之间依赖状态
let isLoggedIn = false;

test.beforeAll(async ({ browser }) => {
  // 只登录一次，后续测试依赖这个状态
  // 如果前面的测试失败，后面的测试都会失败
});
```

### 6.2 测试数据管理

```typescript
// ✅ 推荐：测试前创建数据，测试后清理
test('应该可以编辑用户', async ({ page }) => {
  // 1. 创建测试数据
  await page.getByRole('button', { name: '添加用户' }).click();
  await page.getByLabel('用户名').fill('testuser');
  // ... 填写其他字段
  await page.getByRole('button', { name: '创建' }).click();
  
  // 2. 执行测试操作
  await page.getByRole('row', { name: /testuser/ }).getByRole('button', { name: '编辑' }).click();
  await page.getByLabel('用户名').fill('updateduser');
  await page.getByRole('button', { name: '保存' }).click();
  
  // 3. 验证结果
  await expect(page.getByText('updateduser')).toBeVisible();
  
  // 4. 清理数据（可选，根据具体情况）
  // await deleteTestUser('updateduser');
});
```

### 6.3 网络请求处理

```typescript
// ✅ 推荐：使用API调用而不是UI操作来准备测试数据
test('应该显示用户列表', async ({ page, request }) => {
  // 1. 通过API创建测试数据（更快、更可靠）
  await request.post('/api/users', {
    data: {
      username: 'apitestuser',
      email: 'api@test.com',
      password: 'password123',
      roleId: 2,
    }
  });
  
  // 2. 访问页面
  await page.goto('/users');
  
  // 3. 验证
  await expect(page.getByText('apitestuser')).toBeVisible();
});
```

### 6.4 等待策略

```typescript
// ✅ 推荐：等待特定条件
await expect(page.getByText('用户创建成功')).toBeVisible();
await page.waitForURL(/\/users/);
await page.waitForResponse(response => response.url().includes('/api/users'));

// ⚠️ 谨慎使用：固定时间等待
// ❌ 不推荐
await page.waitForTimeout(1000);

// ✅ 推荐：使用自动等待的断言
await expect(page.getByRole('table')).toBeVisible();
```

---

## 7. 与jQuery版本的行为一致性测试

### 7.1 测试策略

为了确保React版本与jQuery版本行为完全一致，建议采用以下策略：

1. **相同的测试用例**：两个版本使用完全相同的测试用例
2. **相同的断言**：确保两个版本产生相同的结果
3. **A/B测试**：运行相同的测试套件在两个版本上

### 7.2 测试配置示例

```typescript
// playwright.config.ts 中添加多个项目
export default defineConfig({
  projects: [
    // React版本（当前）
    {
      name: 'react-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
    },
    
    // jQuery版本（如果需要）
    {
      name: 'jquery-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001', // jQuery版本运行在不同端口
      },
    },
  ],
});
```

### 7.3 关键行为一致性检查点

| 检查点 | 预期行为 |
|--------|---------|
| **登录** | 相同的输入产生相同的结果 |
| **表单验证** | 相同的错误提示、相同的触发时机 |
| **数据展示** | 相同的排序、相同的格式 |
| **搜索筛选** | 相同的搜索结果、相同的筛选逻辑 |
| **CRUD操作** | 相同的成功/失败反馈、相同的数据变化 |
| **权限控制** | 相同的访问限制、相同的重定向行为 |
| **通知消息** | 相同的消息内容、相同的显示时机 |

---

## 8. 测试覆盖率提升计划

### 8.1 第一阶段（P1优先级，建议1-2天）

- [ ] 补充角色管理测试（`roles.spec.ts`）
- [ ] 补充权限管理测试（`permissions.spec.ts`）
- [ ] 补充系统设置测试（`settings.spec.ts`）
- [ ] 补充表单验证详细测试（`form-validation.spec.ts`）

### 8.2 第二阶段（P2优先级，建议2-3天）

- [ ] 补充权限控制测试（`access-control.spec.ts`）
- [ ] 补充完整的CRUD操作测试（创建、编辑、删除完整流程）
- [ ] 补充分页功能测试
- [ ] 补充多条件筛选测试

### 8.3 第三阶段（优化建议，按需要）

- [ ] 创建测试辅助函数，减少重复代码
- [ ] 添加性能测试（页面加载时间）
- [ ] 添加响应式测试（移动端）
- [ ] 添加API级别的集成测试
- [ ] 添加组件单元测试（如果使用Vitest/Jest）

---

## 9. 常用命令速查

```bash
# ========== 安装 ==========
# 安装项目依赖
npm install

# 安装Playwright浏览器
npx playwright install

# 安装带依赖的浏览器（Linux）
npx playwright install --with-deps

# ========== 运行测试 ==========
# 运行所有测试
npm run test:e2e
npx playwright test

# 运行特定文件
npx playwright test login.spec.ts

# 运行匹配名称的测试
npx playwright test -g "登录"

# 使用UI模式运行
npm run test:e2e:ui
npx playwright test --ui

# 只在特定浏览器运行
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# 生成Trace（用于调试）
npx playwright test --trace on

# ========== 查看报告 ==========
# 打开HTML报告
npx playwright show-report

# 查看特定测试的Trace
npx playwright show-trace test-results/*/trace.zip

# ========== 代码生成 ==========
# 启动代码生成器（录制操作生成测试）
npx playwright codegen http://localhost:3000
```

---

## 10. 调试技巧

### 10.1 使用Playwright Inspector

```bash
# 使用--debug参数运行测试
npx playwright test --debug

# 或在代码中添加
await page.pause();
```

### 10.2 查看Trace

```bash
# 运行测试时生成trace
npx playwright test --trace on

# 查看trace
npx playwright show-trace <trace-file.zip>
```

### 10.3 截图和视频

```typescript
// playwright.config.ts 已配置：
// - screenshot: 'only-on-failure' - 失败时自动截图
// - video: 'retain-on-failure' - 失败时保留视频

// 手动截图
await page.screenshot({ path: 'screenshot.png' });
```

### 10.4 代码生成器

```bash
# 启动代码生成器，自动录制操作
npx playwright codegen http://localhost:3000

# 生成的代码可以直接复制到测试文件中
```
