import { test, expect } from '@playwright/test';

test.describe('仪表盘页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('用户名').fill('admin');
    await page.getByLabel('密码').fill('admin123');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('应该显示导航栏', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '用户管理系统' })).toBeVisible();
    await expect(page.getByRole('link', { name: '首页' })).toBeVisible();
    await expect(page.getByRole('link', { name: '用户管理' })).toBeVisible();
    await expect(page.getByRole('link', { name: '角色管理' })).toBeVisible();
    await expect(page.getByRole('link', { name: '权限管理' })).toBeVisible();
    await expect(page.getByRole('link', { name: '系统设置' })).toBeVisible();
  });

  test('应该显示用户信息和退出按钮', async ({ page }) => {
    await expect(page.getByText('admin')).toBeVisible();
    await expect(page.getByRole('button', { name: '退出登录' })).toBeVisible();
  });

  test('应该显示统计卡片', async ({ page }) => {
    await expect(page.getByText('总用户数')).toBeVisible();
    await expect(page.getByText('活跃用户')).toBeVisible();
    await expect(page.getByText('角色数量')).toBeVisible();
    await expect(page.getByText('待处理请求')).toBeVisible();
  });

  test('应该显示最近活动表格', async ({ page }) => {
    await expect(page.getByText('最近活动')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('导航到用户管理页面', async ({ page }) => {
    await page.getByRole('link', { name: '用户管理' }).click();
    await expect(page).toHaveURL(/\/users/);
    await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible();
  });

  test('导航到角色管理页面', async ({ page }) => {
    await page.getByRole('link', { name: '角色管理' }).click();
    await expect(page).toHaveURL(/\/roles/);
    await expect(page.getByRole('heading', { name: '角色管理' })).toBeVisible();
  });

  test('导航到权限管理页面', async ({ page }) => {
    await page.getByRole('link', { name: '权限管理' }).click();
    await expect(page).toHaveURL(/\/permissions/);
    await expect(page.getByRole('heading', { name: '权限管理' })).toBeVisible();
  });

  test('导航到系统设置页面', async ({ page }) => {
    await page.getByRole('link', { name: '系统设置' }).click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole('heading', { name: '系统设置' })).toBeVisible();
  });

  test('退出登录', async ({ page }) => {
    await page.getByRole('button', { name: '退出登录' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });
});
