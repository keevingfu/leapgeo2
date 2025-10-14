import { test, expect } from '@playwright/test';

test.describe('GEO Platform Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
  });

  test('应用能够正常打开并显示主页面', async ({ page }) => {
    // 检查标题
    await expect(page).toHaveTitle(/Leap GEO Platform/);

    // 检查主要元素是否存在
    await expect(page.locator('text=GEO Platform')).toBeVisible();
    await expect(page.locator('text=Multi-Project Manager')).toBeVisible();
  });

  test('检查页面布局结构', async ({ page }) => {
    // 检查导航栏是否存在
    const navigation = page.locator('text=Overview').first();
    await expect(navigation).toBeVisible();

    // 检查主内容区域
    const mainContent = page.locator('text=Dashboard').first();
    await expect(mainContent).toBeVisible();

    // 截图保存布局
    await page.screenshot({ path: 'tests/screenshots/layout-check.png', fullPage: true });
  });

  test('检查 Dashboard 页面加载和数据显示', async ({ page }) => {
    // 点击 Dashboard (如果不在该页面)
    await page.locator('button:has-text("Dashboard")').first().click();
    await page.waitForTimeout(1000);

    // 检查统计数据卡片
    await expect(page.locator('text=Total Projects')).toBeVisible();
    await expect(page.locator('text=Total Prompts')).toBeVisible();
    await expect(page.locator('text=Total Citations')).toBeVisible();

    // 检查数据是否加载（应该显示数字）
    const projectCount = page.locator('text=Total Projects').locator('..').locator('text=/^\\d+$/');
    await expect(projectCount).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'tests/screenshots/dashboard.png', fullPage: true });
  });

  test('检查 Analytics Hub 菜单项', async ({ page }) => {
    await page.locator('button:has-text("Analytics Hub")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/analytics-hub.png', fullPage: true });
  });

  test('检查 Knowledge Graph 菜单项', async ({ page }) => {
    await page.locator('button:has-text("Knowledge Graph")').click();
    await page.waitForTimeout(500);

    // 检查是否显示 "Coming Soon" 或实际内容
    const pageContent = await page.textContent('body');
    console.log('Knowledge Graph page content preview:', pageContent?.substring(0, 200));

    await page.screenshot({ path: 'tests/screenshots/knowledge-graph.png', fullPage: true });
  });

  test('检查 Prompt Management 菜单项', async ({ page }) => {
    await page.locator('button:has-text("Prompt Management")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/prompt-management.png', fullPage: true });
  });

  test('检查 Content Generator 菜单项', async ({ page }) => {
    await page.locator('button:has-text("Content Generator")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/content-generator.png', fullPage: true });
  });

  test('检查 Review Queue 菜单项', async ({ page }) => {
    await page.locator('button:has-text("Review Queue")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/review-queue.png', fullPage: true });
  });

  test('检查 Distribution 菜单项', async ({ page }) => {
    await page.locator('button:has-text("Distribution")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/distribution.png', fullPage: true });
  });

  test('检查 AI Citations 菜单项', async ({ page }) => {
    await page.locator('button:has-text("AI Citations")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/ai-citations.png', fullPage: true });
  });

  test('检查 Content Performance 菜单项', async ({ page }) => {
    await page.locator('button:has-text("Content Performance")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/content-performance.png', fullPage: true });
  });

  test('检查 Product Catalog 菜单项', async ({ page }) => {
    await page.locator('button:has-text("Product Catalog")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/product-catalog.png', fullPage: true });
  });

  test('检查 Projects 菜单项', async ({ page }) => {
    await page.locator('button:has-text("Projects")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/projects.png', fullPage: true });
  });

  test('检查侧边栏可以收起和展开', async ({ page }) => {
    // 查找收起按钮
    const toggleButton = page.locator('button').filter({ hasText: 'X' }).or(page.locator('button[aria-label*="toggle"]')).or(page.locator('button[aria-label*="close"]'));

    if (await toggleButton.count() > 0) {
      await toggleButton.first().click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'tests/screenshots/sidebar-collapsed.png' });

      // 尝试重新展开
      await toggleButton.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('检查多项目选择器是否工作', async ({ page }) => {
    const projectSelector = page.locator('text=Multi-Project Manager');
    if (await projectSelector.isVisible()) {
      await projectSelector.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/project-selector.png' });
    }
  });

  test('检查是否有JavaScript错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // 导航到各个页面
    const menuItems = [
      'Dashboard',
      'Knowledge Graph',
      'Prompt Management',
      'Projects'
    ];

    for (const item of menuItems) {
      await page.locator(`button:has-text("${item}")`).first().click();
      await page.waitForTimeout(1000);
    }

    console.log('JavaScript Errors:', errors);
    expect(errors.length).toBe(0);
  });
});
