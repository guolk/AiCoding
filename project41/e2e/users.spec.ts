import { test, expect } from '@playwright/test';

test.describe('用户管理页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('用户名').fill('admin');
    await page.getByLabel('密码').fill('admin123');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole('link', { name: '用户管理' }).click();
    await expect(page).toHaveURL(/\/users/);
  });

  test('应该显示用户管理页面标题', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible();
    await expect(page.getByText('管理系统中的所有用户')).toBeVisible();
  });

  test('应该显示添加用户按钮', async ({ page }) => {
    await expect(page.getByRole('button', { name: '添加用户' })).toBeVisible();
  });

  test('应该显示搜索和筛选区域', async ({ page }) => {
    await expect(page.getByPlaceholder('搜索用户名、邮箱...')).toBeVisible();
    await expect(page.getByText('全部状态')).toBeVisible();
    await expect(page.getByText('全部角色')).toBeVisible();
  });

  test('应该显示用户列表表格', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '用户名' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '邮箱' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '角色' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '状态' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '创建时间' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '操作' })).toBeVisible();
  });

  test('应该显示用户数据', async ({ page }) => {
    await expect(page.getByText('admin')).toBeVisible();
    await expect(page.getByText('admin@example.com')).toBeVisible();
  });

  test('搜索功能应该可以筛选用户', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索用户名、邮箱...');
    await searchInput.fill('admin');
    await expect(page.getByText('admin')).toBeVisible();
  });

  test('状态筛选应该可以筛选用户', async ({ page }) => {
    await page.getByText('全部状态').click();
    await page.getByRole('option', { name: '激活' }).click();
    await expect(page.getByText('激活')).toBeVisible();
  });

  test('点击添加用户应该打开模态框', async ({ page }) => {
    await page.getByRole('button', { name: '添加用户' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('添加用户')).toBeVisible();
  });

  test('添加用户模态框应该包含所有字段', async ({ page }) => {
    await page.getByRole('button', { name: '添加用户' }).click();
    
    await expect(page.getByLabel('用户名', { exact: false })).toBeVisible();
    await expect(page.getByLabel('邮箱', { exact: false })).toBeVisible();
    await expect(page.getByLabel('密码', { exact: false })).toBeVisible();
    await expect(page.getByLabel('确认密码', { exact: false })).toBeVisible();
    await expect(page.getByLabel('角色', { exact: false })).toBeVisible();
    await expect(page.getByLabel('状态', { exact: false })).toBeVisible();
    await expect(page.getByLabel('手机号', { exact: false })).toBeVisible();
    await expect(page.getByLabel('地址', { exact: false })).toBeVisible();
  });

  test('关闭模态框应该隐藏添加用户表单', async ({ page }) => {
    await page.getByRole('button', { name: '添加用户' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByRole('button', { name: '取消' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('点击编辑用户应该打开编辑模态框', async ({ page }) => {
    await page.getByRole('row', { name: /admin/ }).getByRole('button', { name: '编辑' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('编辑用户')).toBeVisible();
  });

  test('点击删除用户应该打开确认模态框', async ({ page }) => {
    await page.getByRole('row', { name: /editor/ }).getByRole('button', { name: '删除' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('确认删除')).toBeVisible();
  });

  test('分页组件应该显示', async ({ page }) => {
    await expect(page.getByText('显示')).toBeVisible();
    await expect(page.getByText('条记录')).toBeVisible();
  });
});
