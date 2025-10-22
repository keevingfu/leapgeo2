# E2E 测试套件说明

## 已创建的测试文件

已成功创建了 3 个完整的 E2E 测试套件，模拟真实用户操作：

### 1. Citation Tracking 测试 (`citation-tracking.spec.ts`)
**包含 12 个测试用例**:
- 页面加载和统计数据显示
- 打开/关闭扫描模态框
- 表单验证（必填字段）
- 执行 Citation 扫描
- 按项目过滤
- 关键词搜索
- 平台分布显示
- 表格数据展示
- 空搜索结果处理
- 加载状态
- 清除搜索
- 过滤器重置

### 2. Projects 页面测试 (`projects.spec.ts`)
**包含 13 个测试用例**:
- 项目列表显示
- 打开/关闭创建项目模态框
- 创建新项目
- 表单验证
- 项目卡片详情显示
- 导航到项目详情
- 编辑现有项目
- 删除项目（带确认）
- 按状态过滤
- 按名称搜索
- 项目统计指标
- 空列表处理
- 加载状态

### 3. Prompt Management 测试 (`prompt-management.spec.ts`)
**包含 17 个测试用例**:
- Prompts 表格显示
- 打开/关闭添加 Prompt 模态框
- 创建新 Prompt
- 按优先级过滤 (P0/P1/P2)
- 按状态过滤
- 关键词搜索
- 表格数据详情
- 编辑 Prompt
- 删除 Prompt
- 批量选择
- 批量状态更新
- 按 Score 排序
- Score 徽章颜色
- 优先级徽章颜色
- 分页导航
- 清除所有过滤器
- 加载状态

## 测试设计特点

### 真实用户行为模拟
所有测试都模拟真实用户操作流程：
1. 导航到页面
2. 等待页面加载完成
3. 与UI元素交互（点击、输入、选择）
4. 验证预期结果
5. 处理异常情况

### 完善的等待和超时处理
- 使用 `waitForLoadState('networkidle')` 确保页面完全加载
- 使用 `waitForTimeout()` 处理动态内容
- 适当的超时设置（默认 5000ms，扫描操作 120000ms）

### 灵活的元素查找
- 使用 `getByRole()` 优先选择语义化元素
- 使用 `getByText()` 查找文本内容
- 使用 `getByLabel()` 查找表单字段
- 使用 CSS 选择器作为备选方案

### 条件测试逻辑
测试会检查元素是否存在再执行操作：
```typescript
if (await element.isVisible()) {
  // 执行操作
}
```

## 当前测试状态

### ⚠️ 路由不匹配问题

测试执行时发现实际应用的路由和组件与测试假设不一致：

**预期 (根据 CitationTracking.tsx 组件)**:
- 页面标题: "AI Citation Tracking"
- 按钮文本: "Scan New Citations"

**实际 (根据应用运行时快照)**:
- 页面标题: "Citation Strength"
- 导航项: "Citation Tracker" (而非 "Citation Tracking")
- 页面功能: 三星引用分析系统 (⭐⭐⭐ / ⭐⭐ / ⭐)

### 原因分析

可能的情况：
1. **路由配置未更新**: Portal.tsx 中的 `/citations` 路由可能仍指向旧的 "Citation Strength" 组件
2. **组件未替换**: 新的 CitationTracking.tsx 组件已创建，但未在路由中启用
3. **多实例运行**: 可能有多个开发服务器运行，测试连接到了错误的端口

## 修复建议

### 方案 1: 更新路由配置
在 `src/components/Layout/Portal.tsx` 中：
```typescript
// 确保 /citations 路由指向正确的组件
case 'citations':
  return <CitationTracking selectedBrands={selectedBrands} />;
```

### 方案 2: 更新测试以匹配实际 UI
修改 `citation-tracking.spec.ts`：
```typescript
// 修改导航
await page.getByText('Citation Tracker').click();  // 不是 'Citation Tracking'

// 修改标题检查
await expect(page.getByRole('heading', { name: 'Citation Strength' })).toBeVisible();
```

### 方案 3: 验证服务器实例
```bash
# 确认只有一个开发服务器运行
lsof -i :5174

# 如果有多个，kill 掉旧的进程
kill <PID>

# 重新启动
npm run dev
```

## 运行测试

### 运行所有测试
```bash
npx playwright test
```

### 运行特定测试文件
```bash
npx playwright test tests/citation-tracking.spec.ts
npx playwright test tests/projects.spec.ts
npx playwright test tests/prompt-management.spec.ts
```

### 带可视化界面运行
```bash
npx playwright test --headed
```

### 查看测试报告
```bash
npx playwright show-report
```

### 调试特定测试
```bash
npx playwright test tests/citation-tracking.spec.ts:25 --headed --debug
```

## 测试覆盖的用户旅程

### Journey 1: Citation 追踪工作流
1. 用户导航到 Citation Tracking 页面
2. 查看当前的 Citation 统计数据
3. 点击 "Scan New Citations" 打开扫描模态框
4. 选择项目 (sweetnight)
5. 输入 Prompt ("best cooling mattress for hot sleepers")
6. 选择要扫描的平台 (ChatGPT, Perplexity)
7. 点击 "Start Scan"
8. 等待扫描完成（可能需要 1-2 分钟）
9. 查看扫描结果
10. 使用过滤器和搜索功能查找特定 citations

### Journey 2: 项目管理工作流
1. 用户导航到 Projects 页面
2. 查看所有项目列表
3. 点击 "Create Project"
4. 填写项目信息（名称、行业、描述）
5. 提交表单创建项目
6. 验证新项目出现在列表中
7. 点击项目卡片查看详情
8. 编辑项目信息
9. 使用搜索和过滤器查找项目
10. 删除测试项目

### Journey 3: Prompt 管理工作流
1. 用户导航到 Prompt Management 页面
2. 查看所有 Prompts 表格
3. 使用过滤器筛选高优先级 Prompts (P0)
4. 点击 "Add Prompt" 创建新 Prompt
5. 填写 Prompt 文本和属性（优先级、意图）
6. 提交表单
7. 在列表中找到新创建的 Prompt
8. 编辑 Prompt 更新内容
9. 批量选择多个 Prompts
10. 执行批量状态更新
11. 使用搜索功能查找特定 Prompt

## 截图和视频

测试失败时，Playwright 自动捕获：
- **截图**: `test-results/**/test-failed-*.png`
- **视频**: `test-results/**/video.webm`
- **错误上下文**: `test-results/**/error-context.md`

这些文件对调试非常有用，可以看到测试失败时的实际页面状态。

## 下一步

1. **修复路由问题**: 确保 Portal.tsx 路由指向正确的组件
2. **验证组件导入**: 检查 Portal.tsx 是否导入了更新后的 CitationTracking 组件
3. **更新测试**: 根据实际 UI 调整测试选择器和期望值
4. **重新运行测试**: `npx playwright test`
5. **查看报告**: `npx playwright show-report`

## 技术栈

- **Playwright**: ^1.56.0
- **测试浏览器**: Chromium (Desktop Chrome)
- **测试框架**: @playwright/test
- **报告格式**: list (可配置为 html, json, junit 等)

## 配置

测试配置在 `playwright.config.ts`:
- Base URL: `http://localhost:5174`
- Workers: 1 (串行执行，避免并发冲突)
- Retries: 0 (不自动重试，更容易发现问题)
- 超时: 默认 30000ms
- 截图: 仅失败时
- 视频: 仅失败时保留
- Trace: 首次重试时记录

## 联系和支持

如有测试相关问题，请检查：
1. Playwright 文档: https://playwright.dev
2. 测试报告: `npx playwright show-report`
3. 视频录像: `test-results/**/video.webm`
4. 错误上下文: `test-results/**/error-context.md`
