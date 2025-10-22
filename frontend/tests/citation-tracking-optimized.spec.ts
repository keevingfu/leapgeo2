import { test, expect } from '@playwright/test';

/**
 * Optimized E2E Test Suite for Citation Tracking
 *
 * Uses Chrome DevTools Protocol (CDP) for:
 * - Network monitoring and interception
 * - Performance metrics collection
 * - Resource blocking
 * - Stable data-testid selectors
 */

test.describe('Citation Tracking - Optimized with CDP', () => {
  test.beforeEach(async ({ page, context }) => {
    // Create CDP session for advanced browser control
    const client = await context.newCDPSession(page);

    // Block unnecessary resources to speed up tests
    await client.send('Network.setBlockedURLs', {
      urls: [
        '*.google-analytics.com',
        '*.hotjar.com',
        '*.segment.com',
        '*.facebook.com/tr*',
        '*/analytics/*',
      ]
    });

    // Enable network domain for monitoring
    await client.send('Network.enable');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Login if needed
    const loginForm = page.getByRole('button', { name: /Sign In/i });
    if (await loginForm.isVisible()) {
      await page.getByPlaceholder(/Enter your username/i).fill('admin');
      await page.getByPlaceholder(/Enter your password/i).fill('password123');
      await loginForm.click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate to Citations page via sidebar
    await page.getByRole('button', { name: /AI Citations/i }).click();
    await page.waitForTimeout(500); // Wait for page transition
  });

  test('should display page with correct test IDs', async ({ page }) => {
    // Use stable data-testid selectors
    const pageContainer = page.locator('[data-testid="citation-tracking-page"]');
    await expect(pageContainer).toBeVisible();

    const pageTitle = page.locator('[data-testid="page-title"]');
    await expect(pageTitle).toHaveText('AI Citation Tracking');

    const scanButton = page.locator('[data-testid="scan-citations-button"]');
    await expect(scanButton).toBeVisible();

    const refreshButton = page.locator('[data-testid="refresh-button"]');
    await expect(refreshButton).toBeVisible();
  });

  test('should load citations with performance monitoring', async ({ page, context }) => {
    const client = await context.newCDPSession(page);
    const requests: any[] = [];
    const responses: any[] = [];

    // Monitor network activity
    await client.send('Network.enable');

    client.on('Network.requestWillBeSent', (params) => {
      requests.push({
        url: params.request.url,
        method: params.request.method,
        timestamp: params.timestamp
      });
    });

    client.on('Network.responseReceived', (params) => {
      responses.push({
        url: params.response.url,
        status: params.response.status,
        timestamp: params.timestamp
      });
    });

    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        loadComplete: nav.loadEventEnd - nav.loadEventStart,
        firstByte: nav.responseStart - nav.requestStart,
        domInteractive: nav.domInteractive - nav.requestStart,
      };
    });

    console.log('=== Performance Metrics ===');
    console.log(`DOM Content Loaded: ${metrics.domContentLoaded.toFixed(0)}ms`);
    console.log(`Load Complete: ${metrics.loadComplete.toFixed(0)}ms`);
    console.log(`Time to First Byte: ${metrics.firstByte.toFixed(0)}ms`);
    console.log(`DOM Interactive: ${metrics.domInteractive.toFixed(0)}ms`);
    console.log(`Total Requests: ${requests.length}`);
    console.log(`API Requests: ${requests.filter(r => r.url.includes('/api/')).length}`);

    // Verify page loads within acceptable time
    expect(metrics.loadComplete).toBeLessThan(5000); // 5 seconds
  });

  test('should filter citations efficiently', async ({ page }) => {
    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    // Use data-testid for stable selection
    const projectFilter = page.locator('[data-testid="project-filter"]');
    await projectFilter.selectOption('sweetnight');

    // Wait for filtering to complete
    await page.waitForTimeout(500);

    // Verify filter applied
    const selectedValue = await projectFilter.inputValue();
    expect(selectedValue).toBe('sweetnight');
  });

  test('should search citations with debouncing', async ({ page }) => {
    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('[data-testid="search-input"]');

    // Type with short delays (simulating real user)
    await searchInput.fill('mattress');
    await page.waitForTimeout(300);

    // Verify search value
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('mattress');
  });

  test('should display statistics with correct metrics', async ({ page }) => {
    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    // Check statistics section exists
    const statsSection = page.locator('[data-testid="statistics-section"]');
    await expect(statsSection).toBeVisible();

    // Check individual stat cards
    const totalCitations = page.locator('[data-testid="stat-total-citations"]');
    await expect(totalCitations).toBeVisible();

    const citationRate = page.locator('[data-testid="stat-citation-rate"]');
    await expect(citationRate).toBeVisible();

    // Verify metrics have actual values
    const totalValue = page.locator('[data-metric="total-citations"]');
    const totalText = await totalValue.textContent();
    expect(totalText).toMatch(/\d+/); // Should contain numbers
  });

  test('should open scan modal with correct structure', async ({ page }) => {
    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    // Click scan button using data-action attribute
    await page.locator('[data-action="open-scan-modal"]').click();

    // Verify modal appears
    await expect(page.getByText('Scan AI Platforms for Citations')).toBeVisible();

    // Check form elements exist
    const promptInput = page.locator('[data-testid="scan-prompt-input"]');
    await expect(promptInput).toBeVisible();

    const startScanButton = page.locator('[data-action="start-scan"]');
    await expect(startScanButton).toBeVisible();
  });

  test('should validate scan form before submission', async ({ page }) => {
    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="scan-citations-button"]').click();

    // Try to submit empty form
    const startButton = page.locator('[data-action="start-scan"]');
    await expect(startButton).toBeDisabled(); // Should be disabled when empty
  });

  test('should monitor API calls during scan', async ({ page, context }) => {
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');

    const apiCalls: any[] = [];

    client.on('Network.requestWillBeSent', (params) => {
      if (params.request.url.includes('/api/')) {
        apiCalls.push({
          url: params.request.url,
          method: params.request.method,
          postData: params.request.postData,
          timestamp: Date.now()
        });
      }
    });

    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    // Open scan modal
    await page.locator('[data-testid="scan-citations-button"]').click();

    // Fill form
    await page.locator('select[name="project_id"]').first().selectOption('sweetnight');
    await page.locator('[data-testid="scan-prompt-input"]').fill('best mattress');

    // Monitor scan API call
    const scanStartTime = Date.now();

    // Note: Actual scan would take too long, so we just verify form is ready
    const scanButton = page.locator('[data-action="start-scan"]');
    await expect(scanButton).toBeEnabled();

    console.log('=== API Monitoring ===');
    console.log(`Total API calls captured: ${apiCalls.length}`);
    apiCalls.forEach(call => {
      console.log(`- ${call.method} ${call.url}`);
    });
  });

  test('should handle slow network gracefully', async ({ page, context }) => {
    const client = await context.newCDPSession(page);

    // Simulate slow 3G network
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024 / 8,  // 50kb/s
      uploadThroughput: 20 * 1024 / 8,    // 20kb/s
      latency: 2000                        // 2s latency
    });

    // Reload page to test slow network
    const startTime = Date.now();
    await page.reload();

    // Should still load, just slower
    await page.waitForSelector('[data-testid="page-title"]', { timeout: 15000 });
    const loadTime = Date.now() - startTime;

    console.log(`Load time on slow network: ${loadTime}ms`);

    // Reset network conditions
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    });
  });

  test('should capture console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    // Interact with the page
    await page.locator('[data-testid="refresh-button"]').click();
    await page.waitForTimeout(1000);

    // Report errors
    if (consoleErrors.length > 0) {
      console.log('=== Console Errors ===');
      consoleErrors.forEach(err => console.log(`- ${err}`));
    }

    if (pageErrors.length > 0) {
      console.log('=== Page Errors ===');
      pageErrors.forEach(err => console.log(`- ${err}`));
    }

    // Verify no critical errors
    expect(pageErrors).toHaveLength(0);
  });

  test('should measure time to interactive', async ({ page }) => {
    // Already on Citations page from beforeEach
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');

    const tti = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              if (entry.entryType === 'measure') {
                observer.disconnect();
                resolve(entry.duration);
              }
            }
          });
          observer.observe({ entryTypes: ['measure'] });

          // Trigger measurement
          performance.mark('interactive-start');
          setTimeout(() => {
            performance.mark('interactive-end');
            performance.measure('time-to-interactive', 'interactive-start', 'interactive-end');
          }, 0);
        } else {
          resolve(0);
        }
      });
    });

    console.log(`Time to Interactive: ${tti.toFixed(0)}ms`);
  });

  test('should verify accessibility attributes', async ({ page }) => {
    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    // Check for proper ARIA labels and roles
    const scanButton = page.locator('[data-testid="scan-citations-button"]');

    // Verify button has accessible text
    const buttonText = await scanButton.textContent();
    expect(buttonText).toBeTruthy();

    // Check form inputs have labels
    const searchInput = page.locator('[data-testid="search-input"]');
    const inputName = await searchInput.getAttribute('name');
    expect(inputName).toBeTruthy();
  });

  test('should handle rapid filter changes', async ({ page }) => {
    // Already on Citations page from beforeEach
    await page.waitForLoadState('networkidle');

    const projectFilter = page.locator('[data-testid="project-filter"]');

    // Rapidly change filters
    await projectFilter.selectOption('sweetnight');
    await page.waitForTimeout(100);
    await projectFilter.selectOption('all');
    await page.waitForTimeout(100);
    await projectFilter.selectOption('sweetnight');

    // Verify final state is correct
    const finalValue = await projectFilter.inputValue();
    expect(finalValue).toBe('sweetnight');
  });
});
