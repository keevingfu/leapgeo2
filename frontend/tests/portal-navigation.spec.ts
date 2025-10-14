import { test, expect } from '@playwright/test';

test.describe('Portal Navigation Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Wait for Portal to render
    await page.waitForSelector('text=GEO Platform', { timeout: 10000 });
  });

  // Test all navigation items
  const navigationItems = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Analytics Hub', id: 'analytics' },
    { name: 'Knowledge Graph', id: 'knowledge-graph' },
    { name: 'Prompt Management', id: 'prompts' },
    { name: 'Content Generator', id: 'content-generator' },
    { name: 'Review Queue', id: 'content-review' },
    { name: 'Distribution', id: 'distribution' },
    { name: 'AI Citations', id: 'citations' },
    { name: 'Content Performance', id: 'performance' },
    { name: 'Product Catalog', id: 'catalog' },
    { name: 'Offer Management', id: 'offers' },
    { name: 'Orders', id: 'orders' },
    { name: 'Payments', id: 'payments' },
    { name: 'Fulfillment', id: 'fulfillment' },
    { name: 'Projects', id: 'projects' },
    { name: 'Team', id: 'team' },
    { name: 'Brands', id: 'brands' },
    { name: 'Settings', id: 'settings' }
  ];

  for (const item of navigationItems) {
    test(`should navigate to ${item.name} page`, async ({ page }) => {
      // Click the navigation item
      await page.getByRole('button', { name: item.name }).click();
      
      // Wait a bit for state update
      await page.waitForTimeout(500);
      
      // Verify the page shows the active page info
      const content = await page.textContent('body');
      expect(content).toContain(`Active Page: ${item.id}`);
      
      // Verify the button has active state (blue background)
      const button = page.getByRole('button', { name: item.name });
      const className = await button.getAttribute('class');
      expect(className).toContain('bg-blue-600');
    });
  }

  test('should display Portal Working message', async ({ page }) => {
    const heading = await page.locator('h1').textContent();
    expect(heading).toContain('Portal Working!');
  });

  test('should have functional search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test search');
    await expect(searchInput).toHaveValue('test search');
  });

  test('should have Upgrade Plan button', async ({ page }) => {
    const upgradeButton = page.getByRole('button', { name: 'Upgrade Plan' });
    await expect(upgradeButton).toBeVisible();
    const className = await upgradeButton.getAttribute('class');
    expect(className).toContain('bg-blue-600');
  });
});
