import { test, expect } from '@playwright/test';

test.describe('Authentication System E2E Test', () => {
  const BASE_URL = 'http://localhost:5173';
  const API_URL = 'http://localhost:8000';

  test.beforeEach(async ({ page }) => {
    // 清除 localStorage
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    
    // 收集控制台日志
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`[Browser ${type}]`, msg.text());
      }
    });

    // 收集页面错误
    page.on('pageerror', error => {
      console.error('[Page Error]', error.message);
    });
  });

  test('1. Page loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 检查标题
    const title = await page.title();
    console.log('Page title:', title);
    expect(title).toContain('Leap GEO Platform');
    
    // 截图
    await page.screenshot({ path: '/tmp/01-page-load.png', fullPage: true });
    console.log('✅ Screenshot saved: /tmp/01-page-load.png');
  });

  test('2. Login page renders correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 等待登录页面元素
    const loginVisible = await page.locator('input[type="text"]').first().isVisible({ timeout: 10000 });
    
    if (!loginVisible) {
      console.log('❌ Login page not visible, checking what is rendered...');
      const bodyText = await page.locator('body').textContent();
      console.log('Body text:', bodyText?.substring(0, 200));
      
      await page.screenshot({ path: '/tmp/02-login-error.png', fullPage: true });
      throw new Error('Login page did not render');
    }
    
    // 检查表单元素
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    
    // 截图
    await page.screenshot({ path: '/tmp/02-login-page.png', fullPage: true });
    console.log('✅ Login page rendered correctly');
  });

  test('3. Backend API is accessible', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('Backend health:', data);
    expect(data.status).toBe('healthy');
    console.log('✅ Backend API is accessible');
  });

  test('4. Login with valid credentials', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 等待登录表单
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });

    // 填写登录表单
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').fill('password123');

    // 截图填写后的表单
    await page.screenshot({ path: '/tmp/03-form-filled.png', fullPage: true });

    // 点击登录按钮
    await page.locator('button:has-text("Sign In")').click();

    // 等待登录完成 - 检查 localStorage 中的 token
    await page.waitForFunction(
      () => localStorage.getItem('auth_token') !== null,
      { timeout: 10000 }
    );

    // 额外等待一下确保 UI 渲染完成
    await page.waitForTimeout(1500);

    // 检查 localStorage 中是否有 token
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));

    // 检查侧边栏导航项是否出现
    const hasNavigation = await page.locator('text=Knowledge Graph').isVisible().catch(() => false);

    // 检查页面是否显示了 Dashboard
    const hasDashboardText = await page.locator('text=Total Projects').isVisible().catch(() => false);

    const loginSuccessful = (token !== null) && (hasNavigation || hasDashboardText);

    if (loginSuccessful) {
      console.log('✅ Login successful!');
      console.log('  - Token exists:', token !== null);
      console.log('  - Navigation visible:', hasNavigation);
      console.log('  - Dashboard visible:', hasDashboardText);
      await page.screenshot({ path: '/tmp/04-dashboard.png', fullPage: true });
    } else {
      console.log('❌ Login failed');
      console.log('  - Token exists:', token !== null);
      console.log('  - Navigation visible:', hasNavigation);
      console.log('  - Dashboard visible:', hasDashboardText);
      const bodyText = await page.locator('body').textContent();
      console.log('Current page text:', bodyText?.substring(0, 300));
      await page.screenshot({ path: '/tmp/04-login-failed.png', fullPage: true });
    }

    expect(loginSuccessful).toBeTruthy();
  });

  test('5. Logout functionality', async ({ page }) => {
    // 先登录
    await page.goto(BASE_URL);
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();
    
    // 等待登录完成
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });
    
    // 查找并点击登出按钮
    const logoutButton = page.locator('button[title="Logout"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      console.log('✅ Clicked logout button');
      
      // 等待重定向到登录页面
      await page.waitForSelector('input[type="text"]', { timeout: 5000 });
      console.log('✅ Redirected to login page after logout');
      
      await page.screenshot({ path: '/tmp/05-after-logout.png', fullPage: true });
    } else {
      console.log('⚠️ Logout button not found');
    }
  });

  test('6. Network requests inspection', async ({ page }) => {
    const requests: any[] = [];
    const responses: any[] = [];
    
    // 监听所有请求
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });
    
    // 监听所有响应
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== Network Requests ===');
    requests.forEach(req => {
      if (req.url.includes('localhost')) {
        console.log(`${req.method} ${req.url}`);
      }
    });
    
    console.log('\n=== Network Responses ===');
    const failedResponses = responses.filter(res => res.status >= 400);
    if (failedResponses.length > 0) {
      console.log('❌ Failed requests:');
      failedResponses.forEach(res => {
        console.log(`  ${res.status} ${res.url}`);
      });
    } else {
      console.log('✅ All requests successful');
    }
  });
});
