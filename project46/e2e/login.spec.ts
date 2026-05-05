import { test, expect } from '@playwright/test';

test.describe('登录页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('应该显示登录表单', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '用户管理系统' })).toBeVisible();
    await expect(page.getByText('请登录您的账户')).toBeVisible();
    await expect(page.getByLabel('用户名')).toBeVisible();
    await expect(page.getByLabel('密码')).toBeVisible();
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });

  test('应该显示测试账号信息', async ({ page }) => {
    await expect(page.getByText('测试账号：')).toBeVisible();
    await expect(page.getByText('管理员: admin / admin123')).toBeVisible();
    await expect(page.getByText('编辑: editor / editor123')).toBeVisible();
    await expect(page.getByText('用户: user1 / user123')).toBeVisible();
  });

  test('空表单提交应该显示错误', async ({ page }) => {
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('用户名至少需要3个字符')).toBeVisible();
  });

  test('使用管理员账号登录成功', async ({ page }) => {
    await page.getByLabel('用户名').fill('admin');
    await page.getByLabel('密码').fill('admin123');
    await page.getByRole('button', { name: '登录' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
    await expect(page.getByText('欢迎使用用户管理系统')).toBeVisible();
  });

  test('使用错误密码登录应该显示错误', async ({ page }) => {
    await page.getByLabel('用户名').fill('admin');
    await page.getByLabel('密码').fill('wrongpassword');
    await page.getByRole('button', { name: '登录' }).click();

    await expect(page.getByText('用户名或密码错误')).toBeVisible();
  });

  test('记住我选项应该可勾选', async ({ page }) => {
    const rememberCheckbox = page.getByLabel('记住我');
    await expect(rememberCheckbox).not.toBeChecked();
    await rememberCheckbox.check();
    await expect(rememberCheckbox).toBeChecked();
  });

  test('输入用户名后应该清除错误', async ({ page }) => {
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('用户名至少需要3个字符')).toBeVisible();
    
    await page.getByLabel('用户名').fill('admin');
    await expect(page.getByText('用户名至少需要3个字符')).not.toBeVisible();
  });
});
