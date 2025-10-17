import { test, expect } from '@playwright/test';

const pages = [
  { name: 'Projects', selector: 'text=Projects', click: true },
  { name: 'Dashboard', selector: 'text=Dashboard', click: true },
  { name: 'Knowledge Graph', selector: 'text=Knowledge Graph', click: true },
  { name: 'FAQ Map', selector: 'text=FAQ Knowledge Map', click: true },
  { name: 'Prompts', selector: 'text=Prompt Management', click: true },
  { name: 'Content', selector: 'text=Content Generation', click: true },
  { name: 'Citation', selector: 'text=AI Citation Tracking', click: true },
  { name: 'Publishing', selector: 'text=Publishing Scheduler', click: true },
  { name: 'Attribution', selector: 'text=Content Attribution', click: true },
  { name: 'Analytics', selector: 'text=Analytics & Reports', click: true },
  { name: 'Settings', selector: 'text=Settings', click: true },
];

test.describe('GEO Platform Page Inspector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
  });

  for (const pageInfo of pages) {
    test(`Inspect ${pageInfo.name} page`, async ({ page }) => {
      // Click the navigation item
      if (pageInfo.click) {
        await page.click(pageInfo.selector);
        await page.waitForTimeout(500);
      }

      // Take screenshot
      await page.screenshot({
        path: `tests/screenshots/${pageInfo.name.toLowerCase().replace(/ /g, '-')}.png`,
        fullPage: true
      });

      // Check for basic layout elements
      const body = await page.locator('body');
      await expect(body).toBeVisible();

      // Log viewport and content dimensions
      const dimensions = await page.evaluate(() => ({
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        content: {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight
        }
      }));

      console.log(`${pageInfo.name} dimensions:`, dimensions);

      // Check for common CSS issues
      const issues = await page.evaluate(() => {
        const problems: string[] = [];

        // Check for overflow issues
        const overflowElements = document.querySelectorAll('*');
        overflowElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.scrollWidth > htmlEl.clientWidth + 10) {
            problems.push(`Horizontal overflow in ${el.tagName}.${el.className}`);
          }
        });

        // Check for elements outside viewport
        const rect = document.body.getBoundingClientRect();
        if (rect.width > window.innerWidth) {
          problems.push(`Body width (${rect.width}px) exceeds viewport (${window.innerWidth}px)`);
        }

        return problems;
      });

      if (issues.length > 0) {
        console.log(`CSS Issues in ${pageInfo.name}:`, issues);
      }
    });
  }

  test('Initial page load analysis', async ({ page }) => {
    // Analyze initial page state
    const analysis = await page.evaluate(() => {
      return {
        hasStyles: !!document.querySelector('style, link[rel="stylesheet"]'),
        bodyClasses: document.body.className,
        mainContainer: !!document.querySelector('main'),
        tailwindLoaded: !!Array.from(document.styleSheets).some(sheet => {
          try {
            return Array.from(sheet.cssRules).some(rule =>
              rule.cssText.includes('tailwind') || rule.cssText.includes('--tw')
            );
          } catch (e) {
            return false;
          }
        })
      };
    });

    console.log('Page Analysis:', analysis);

    await page.screenshot({
      path: 'tests/screenshots/initial-load.png',
      fullPage: true
    });
  });
});
