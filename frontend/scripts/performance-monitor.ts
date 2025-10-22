/**
 * Performance Monitoring Script
 *
 * Uses Chrome DevTools Protocol to collect detailed performance metrics
 * for all major pages in the Leap GEO Platform
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface PerformanceMetrics {
  url: string;
  timestamp: string;
  loadTime: number;
  domContentLoaded: number;
  firstByte: number;
  domInteractive: number;
  resourceCount: number;
  jsHeapSize?: number;
  requests: {
    total: number;
    api: number;
    images: number;
    scripts: number;
    styles: number;
  };
  errors: string[];
}

interface NetworkRequest {
  url: string;
  method: string;
  resourceType: string;
  status?: number;
  size?: number;
  duration?: number;
}

const PAGES_TO_TEST = [
  { name: 'Citations', url: '/citations' },
  { name: 'Projects', url: '/projects' },
  { name: 'Prompts', url: '/prompts' },
  { name: 'Dashboard', url: '/dashboard' },
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:5174';
const REPORT_DIR = './performance-reports';

async function collectPerformanceMetrics(page: Page, url: string): Promise<PerformanceMetrics> {
  const errors: string[] = [];
  const requests: NetworkRequest[] = [];

  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  // Monitor network requests
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
    });
  });

  page.on('response', response => {
    const req = requests.find(r => r.url === response.url());
    if (req) {
      req.status = response.status();
    }
  });

  // Navigate and wait for load
  const startTime = Date.now();
  await page.goto(`${BASE_URL}${url}`);
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  // Collect performance metrics
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource');

    return {
      domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
      firstByte: nav.responseStart - nav.requestStart,
      domInteractive: nav.domInteractive - nav.requestStart,
      resourceCount: resources.length,
      jsHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
    };
  });

  // Categorize requests
  const requestStats = {
    total: requests.length,
    api: requests.filter(r => r.url.includes('/api/')).length,
    images: requests.filter(r => r.resourceType === 'image').length,
    scripts: requests.filter(r => r.resourceType === 'script').length,
    styles: requests.filter(r => r.resourceType === 'stylesheet').length,
  };

  return {
    url,
    timestamp: new Date().toISOString(),
    loadTime,
    ...metrics,
    requests: requestStats,
    errors,
  };
}

async function generatePerformanceReport(metrics: PerformanceMetrics[]): Promise<void> {
  // Ensure report directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Report - Leap GEO Platform</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #1a1a1a; margin-bottom: 10px; }
    .timestamp { color: #666; font-size: 14px; }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-card h2 {
      font-size: 16px;
      color: #666;
      margin-bottom: 15px;
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .metric-value.good { color: #10b981; }
    .metric-value.warning { color: #f59e0b; }
    .metric-value.poor { color: #ef4444; }
    .metric-label { font-size: 14px; color: #666; }
    .details {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .details h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #1a1a1a;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; }
    .detail-value { font-weight: 500; color: #1a1a1a; }
    .errors {
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
    }
    .errors ul { list-style: none; padding-left: 0; }
    .errors li {
      padding: 5px 0;
      color: #991b1b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Performance Report - Leap GEO Platform</h1>
      <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
    </div>

    ${metrics.map(metric => {
      const loadTimeClass = metric.loadTime < 1000 ? 'good' : metric.loadTime < 3000 ? 'warning' : 'poor';
      const dcl = metric.domContentLoaded.toFixed(0);
      const ttfb = metric.firstByte.toFixed(0);

      return `
      <div class="details">
        <h2>📄 ${metric.url}</h2>

        <div class="metrics-grid">
          <div class="metric-card">
            <h2>Load Time</h2>
            <div class="metric-value ${loadTimeClass}">${metric.loadTime}ms</div>
            <div class="metric-label">Total page load time</div>
          </div>

          <div class="metric-card">
            <h2>DOM Content Loaded</h2>
            <div class="metric-value">${dcl}ms</div>
            <div class="metric-label">DOM ready time</div>
          </div>

          <div class="metric-card">
            <h2>Time to First Byte</h2>
            <div class="metric-value">${ttfb}ms</div>
            <div class="metric-label">Server response time</div>
          </div>

          <div class="metric-card">
            <h2>Resources Loaded</h2>
            <div class="metric-value">${metric.resourceCount}</div>
            <div class="metric-label">Total resources</div>
          </div>
        </div>

        <div class="detail-row">
          <span class="detail-label">Total Requests</span>
          <span class="detail-value">${metric.requests.total}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">API Calls</span>
          <span class="detail-value">${metric.requests.api}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Images</span>
          <span class="detail-value">${metric.requests.images}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Scripts</span>
          <span class="detail-value">${metric.requests.scripts}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Stylesheets</span>
          <span class="detail-value">${metric.requests.styles}</span>
        </div>

        ${metric.jsHeapSize ? `
        <div class="detail-row">
          <span class="detail-label">JS Heap Size</span>
          <span class="detail-value">${(metric.jsHeapSize / 1024 / 1024).toFixed(2)} MB</span>
        </div>
        ` : ''}

        ${metric.errors.length > 0 ? `
        <div class="errors">
          <strong>⚠️ Errors Found (${metric.errors.length})</strong>
          <ul>
            ${metric.errors.map(err => `<li>${err}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
      `;
    }).join('')}
  </div>
</body>
</html>
  `;

  // Write HTML report
  const htmlPath = path.join(REPORT_DIR, `performance-${Date.now()}.html`);
  fs.writeFileSync(htmlPath, html);

  // Write JSON data
  const jsonPath = path.join(REPORT_DIR, `performance-${Date.now()}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2));

  console.log(`\n✅ Performance report generated:`);
  console.log(`   HTML: ${htmlPath}`);
  console.log(`   JSON: ${jsonPath}`);
}

async function main() {
  console.log('🚀 Starting Performance Monitoring...\n');

  const browser: Browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();
  const allMetrics: PerformanceMetrics[] = [];

  for (const pageInfo of PAGES_TO_TEST) {
    console.log(`📊 Testing: ${pageInfo.name} (${pageInfo.url})`);

    try {
      const metrics = await collectPerformanceMetrics(page, pageInfo.url);
      allMetrics.push(metrics);

      console.log(`   ✓ Load Time: ${metrics.loadTime}ms`);
      console.log(`   ✓ DOM Ready: ${metrics.domContentLoaded.toFixed(0)}ms`);
      console.log(`   ✓ TTFB: ${metrics.firstByte.toFixed(0)}ms`);
      console.log(`   ✓ Requests: ${metrics.requests.total}`);

      if (metrics.errors.length > 0) {
        console.log(`   ⚠️  Errors: ${metrics.errors.length}`);
      }

      console.log('');
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}\n`);
    }
  }

  await browser.close();

  // Generate report
  await generatePerformanceReport(allMetrics);

  console.log('\n🎉 Performance monitoring complete!\n');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { collectPerformanceMetrics, generatePerformanceReport };
