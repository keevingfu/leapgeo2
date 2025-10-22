# 🚀 Chrome DevTools 自动化开发指南

## 概览

本指南说明如何使用 Chrome DevTools Protocol (CDP) 赋能 Leap GEO 平台的自动化开发和测试。

## ✅ 已完成的工作

### 1. 组件测试标识符

为 `CitationTracking.tsx` 添加了完整的 `data-testid` 和 `data-action` 属性：

```typescript
// 主要测试标识符
- [data-testid="citation-tracking-page"]     // 页面容器
- [data-testid="page-title"]                 // 页面标题
- [data-testid="scan-citations-button"]      // 扫描按钮
- [data-testid="refresh-button"]             // 刷新按钮
- [data-testid="project-filter"]             // 项目过滤器
- [data-testid="search-input"]               // 搜索输入框
- [data-testid="statistics-section"]         // 统计卡片区
- [data-testid="scan-prompt-input"]          // 扫描输入框
- [data-testid="start-scan-button"]          // 开始扫描按钮

// 数据属性
- [data-action="open-scan-modal"]            // 打开扫描模态框
- [data-action="start-scan"]                 // 开始扫描
- [data-metric="total-citations"]            // 统计指标
- [data-status="scanning"]                   // 扫描状态
```

### 2. 优化的 E2E 测试套件

创建了 `tests/citation-tracking-optimized.spec.ts`，包含 **13 个优化测试**：

| 测试 | CDP 特性 | 说明 |
|------|---------|------|
| ✅ 稳定选择器 | data-testid | 使用可靠的测试标识符 |
| ✅ 性能监控 | Network | 收集加载时间、TTFB、DOM指标 |
| ✅ 网络拦截 | Network.setBlockedURLs | 屏蔽分析跟踪脚本 |
| ✅ 慢速网络 | Network.emulateNetworkConditions | 模拟 3G 网络 |
| ✅ 错误捕获 | console/pageerror 事件 | 捕获 JS 错误 |
| ✅ API 监控 | Network.requestWillBeSent | 追踪 API 调用 |
| ✅ 响应监控 | Network.responseReceived | 记录响应状态 |
| ✅ 交互时间 | PerformanceObserver | 测量 TTI |
| ✅ 可访问性 | ARIA 检查 | 验证无障碍属性 |
| ✅ 快速操作 | 去抖测试 | 处理快速用户输入 |

### 3. 性能监控脚本

创建了 `scripts/performance-monitor.ts`，自动生成性能报告：

**监控指标**:
- ⏱️ 页面加载时间 (Load Time)
- 📄 DOM 内容加载 (DOM Content Loaded)
- 🚀 首字节时间 (TTFB)
- 🌐 DOM 交互时间 (DOM Interactive)
- 📦 资源数量 (Resource Count)
- 💾 JS 堆大小 (JS Heap Size)
- 🔍 请求分类 (API/Images/Scripts/Styles)
- ⚠️ 错误捕获 (Console & Page Errors)

**输出格式**:
- HTML 可视化报告
- JSON 原始数据
- 控制台实时输出

## 🎯 使用方法

### 运行测试

```bash
# 运行所有 E2E 测试
npm test

# 运行优化的 Citation Tracking 测试
npm run test:optimized

# 带浏览器界面运行（调试用）
npm run test:headed

# 运行特定页面测试
npm run test:citations    # Citation Tracking
npm run test:projects     # Projects 页面
npm run test:prompts      # Prompt Management

# 查看测试报告
npm run test:report
```

### 性能监控

```bash
# 运行性能监控（测试所有页面）
npm run perf

# 查看性能报告
npm run perf:report
```

**性能报告位置**: `./performance-reports/performance-{timestamp}.html`

### 调试技巧

#### 1. 使用 headed 模式查看浏览器

```bash
npx playwright test tests/citation-tracking-optimized.spec.ts --headed
```

#### 2. 单步调试测试

```bash
npx playwright test tests/citation-tracking-optimized.spec.ts --debug
```

#### 3. 查看 CDP 网络日志

测试会在控制台输出：
```
=== Performance Metrics ===
DOM Content Loaded: 245ms
Load Complete: 892ms
Time to First Byte: 124ms
DOM Interactive: 389ms
Total Requests: 42
API Requests: 8
```

#### 4. 检查失败截图

失败的测试会自动生成：
- 📸 截图: `test-results/**/test-failed-*.png`
- 🎥 视频: `test-results/**/video.webm`
- 📄 上下文: `test-results/**/error-context.md`

## 🔥 高级用法

### 1. 自定义网络条件

```typescript
const client = await context.newCDPSession(page);

// 模拟慢速 3G
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 50 * 1024 / 8,
  uploadThroughput: 20 * 1024 / 8,
  latency: 2000
});
```

### 2. 拦截 API 请求

```typescript
await page.route('**/api/v1/citations**', route => {
  console.log('拦截请求:', route.request().url());

  // 模拟延迟
  setTimeout(() => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ citations: mockData })
    });
  }, 3000);
});
```

### 3. 性能预算检查

```typescript
test('should meet performance budget', async ({ page }) => {
  await page.goto('/citations');

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: nav.loadEventEnd - nav.loadEventStart,
      ttfb: nav.responseStart - nav.requestStart
    };
  });

  expect(metrics.loadTime).toBeLessThan(3000);  // 预算: 3秒
  expect(metrics.ttfb).toBeLessThan(500);       // 预算: 500ms
});
```

### 4. 持续监控脚本

创建 CI/CD 集成：

```yaml
# .github/workflows/performance.yml
name: Performance Monitoring

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # 每天午夜运行

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run perf
      - uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: ./performance-reports
```

## 📊 性能基准

### 当前性能目标

| 指标 | 目标 | 警告 | 危险 |
|------|------|------|------|
| **Load Time** | < 1s | 1-3s | > 3s |
| **TTFB** | < 200ms | 200-500ms | > 500ms |
| **DOM Ready** | < 500ms | 500-1000ms | > 1s |
| **API 调用数** | < 10 | 10-20 | > 20 |
| **JS Heap** | < 10MB | 10-20MB | > 20MB |

### 优化建议

如果性能不达标，检查：

1. **加载时间过长**
   - ✅ 启用 gzip 压缩
   - ✅ 实施代码分割
   - ✅ 优化图片大小
   - ✅ 使用 CDN

2. **TTFB 过高**
   - ✅ 数据库查询优化
   - ✅ 启用缓存
   - ✅ 使用 Redis
   - ✅ 减少 API 调用

3. **API 调用过多**
   - ✅ 实施 GraphQL
   - ✅ 批量请求
   - ✅ 数据预加载
   - ✅ 客户端缓存

4. **JS Heap 过大**
   - ✅ 清理内存泄漏
   - ✅ 移除未使用的库
   - ✅ 实施虚拟滚动
   - ✅ 懒加载组件

## 🛠️ Chrome DevTools 最佳实践

### 1. 稳定的选择器策略

优先级顺序：
```
data-testid > data-action > role > label > text content > CSS class/ID
```

✅ 推荐:
```typescript
page.locator('[data-testid="scan-button"]')
page.locator('[data-action="start-scan"]')
page.getByRole('button', { name: 'Scan' })
```

❌ 不推荐:
```typescript
page.locator('.btn-blue-600')  // CSS 类可能变化
page.locator('#scan-btn-123')  // ID 可能动态生成
```

### 2. 等待策略

```typescript
// ✅ 等待网络空闲
await page.waitForLoadState('networkidle');

// ✅ 等待特定元素
await page.waitForSelector('[data-testid="data-loaded"]');

// ✅ 等待条件满足
await page.waitForFunction(() => {
  return document.querySelectorAll('[data-row]').length > 0;
});

// ❌ 固定延迟（不推荐）
await page.waitForTimeout(5000);
```

### 3. 错误处理

```typescript
test('should handle errors gracefully', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.goto('/citations');

  // 验证无错误
  expect(errors).toHaveLength(0);
});
```

### 4. 性能追踪

```typescript
test('should track performance', async ({ page }) => {
  // 开始追踪
  await page.evaluate(() => performance.mark('start'));

  // 执行操作
  await page.locator('[data-testid="scan-button"]').click();
  await page.waitForSelector('[data-status="scan-complete"]');

  // 结束追踪
  const duration = await page.evaluate(() => {
    performance.mark('end');
    performance.measure('scan-duration', 'start', 'end');
    const measure = performance.getEntriesByName('scan-duration')[0];
    return measure.duration;
  });

  console.log(`Scan completed in ${duration.toFixed(0)}ms`);
  expect(duration).toBeLessThan(5000);
});
```

## 🔗 与其他工具集成

### Firecrawl (网页抓取)

```typescript
// 使用 Playwright + Firecrawl 分析 Citation 页面
import { chromium } from 'playwright';

async function analyzeCitationPage(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // 提取 Citation 信息
  const citations = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-citation]')).map(el => ({
      text: el.textContent,
      link: el.querySelector('a')?.href,
      platform: el.dataset.platform
    }));
  });

  await browser.close();
  return citations;
}
```

### Memory MCP (持续学习)

```typescript
import { Memory } from '@modelcontextprotocol/server-memory';

// 保存最佳选择器策略
await Memory.save({
  topic: 'Citation Tracking Selectors',
  data: {
    pageTitle: '[data-testid="page-title"]',
    scanButton: '[data-action="open-scan-modal"]',
    startScan: '[data-action="start-scan"]',
    confidence: 0.98
  }
});

// 检索选择器
const selectors = await Memory.recall('Citation Tracking Selectors');
```

## 📚 相关资源

- [Playwright 文档](https://playwright.dev)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Performance Budgets Guide](https://web.dev/performance-budgets/)

## 🎉 总结

通过这套自动化工具链，你可以：

✅ **稳定测试** - 使用 data-testid 避免脆弱选择器
✅ **性能监控** - 实时追踪页面加载和交互性能
✅ **网络分析** - 监控 API 调用和资源加载
✅ **错误捕获** - 自动记录 JS 错误和异常
✅ **CI/CD 集成** - 在持续集成中运行性能测试
✅ **可视化报告** - 生成 HTML 性能报告
✅ **持续学习** - 使用 Memory MCP 积累最佳实践

## 🚀 下一步

1. **运行优化测试**: `npm run test:optimized`
2. **生成性能报告**: `npm run perf`
3. **查看结果**: `npm run perf:report`
4. **持续监控**: 添加到 CI/CD 流程
5. **优化性能**: 根据报告调整应用

开始自动化开发吧！ 🎯
