# 📁 Leap GEO Platform - 项目总览

**当前位置**: `/Users/cavin/Desktop/dev/leapgeo2/frontend`
**最后更新**: 2025-10-22

---

## 🎯 项目简介

**Leap GEO Platform** - GEO（Generative Engine Optimization）智能内容营销平台

一个帮助品牌在 AI 搜索引擎（ChatGPT、Claude、Perplexity 等）中提升引用率的综合性平台。

**技术栈**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Playwright

---

## 📂 目录结构

```
leapgeo2/frontend/
│
├── 📁 src/                          # 源代码目录
│   ├── 📁 components/               # React 组件
│   │   ├── layout/                 # 布局组件
│   │   │   └── Portal.tsx          # 主应用门户（侧边栏+路由）
│   │   ├── pages/                  # 页面组件（19个）
│   │   │   ├── Dashboard.tsx       # 仪表盘
│   │   │   ├── Projects.tsx        # 项目管理
│   │   │   ├── CitationTracking.tsx # AI 引用追踪 ✨
│   │   │   ├── PromptManagement.tsx # Prompt 管理
│   │   │   ├── KnowledgeGraph.tsx  # 知识图谱
│   │   │   ├── ContentGenerator.tsx # 内容生成
│   │   │   ├── Analytics.tsx       # 数据分析
│   │   │   └── ...                 # 其他 12 个页面
│   │   ├── common/                 # 通用组件
│   │   │   ├── BrandFilter.tsx     # 品牌过滤器
│   │   │   └── ErrorBoundary.tsx   # 错误边界
│   │   └── ui/                     # UI 基础组件
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   ├── 📁 contexts/                # React Context
│   │   └── AuthContext.tsx         # 用户认证上下文
│   ├── 📁 services/                # API 服务
│   │   └── api.ts                  # API 客户端
│   ├── 📁 types/                   # TypeScript 类型定义
│   │   └── api.ts
│   ├── 📁 utils/                   # 工具函数
│   ├── App.tsx                     # 应用根组件
│   └── main.tsx                    # Vite 入口文件
│
├── 📁 tests/                        # E2E 测试套件 (Playwright)
│   ├── citation-tracking-optimized.spec.ts  # ✨ CDP 优化测试 (13个)
│   ├── citation-tracking.spec.ts            # Citation Tracking 测试
│   ├── projects.spec.ts                     # Projects 测试
│   ├── prompt-management.spec.ts            # Prompts 测试
│   ├── portal-navigation.spec.ts            # 导航测试
│   ├── app-navigation.spec.ts               # 应用导航测试
│   ├── test-auth-flow.spec.ts               # 认证流程测试
│   ├── page-inspector.spec.ts               # 页面检查器
│   └── README-E2E-TESTS.md                  # 测试文档
│
├── 📁 scripts/                      # 自动化脚本
│   ├── performance-monitor.ts      # ✨ 性能监控脚本 (274行)
│   ├── health-check.js             # 健康检查
│   ├── auto-verify.sh              # 自动验证
│   └── quick-check.sh              # 快速检查
│
├── 📁 public/                       # 静态资源
│   └── vite.svg
│
├── 📁 test-results/                 # 测试结果 (自动生成)
│   ├── screenshots/                # 失败截图
│   └── videos/                     # 测试视频
│
├── 📁 performance-reports/          # 性能报告 (自动生成)
│   ├── performance-*.html          # HTML 可视化报告
│   └── performance-*.json          # JSON 原始数据
│
├── 📄 package.json                  # NPM 依赖 + 脚本
├── 📄 tsconfig.json                 # TypeScript 配置
├── 📄 vite.config.ts                # Vite 配置
├── 📄 tailwind.config.js            # Tailwind CSS 配置
├── 📄 playwright.config.ts          # Playwright 配置
├── 📄 eslint.config.js              # ESLint 配置
│
└── 📚 文档/
    ├── README.md                               # 项目说明
    ├── CLAUDE.md                               # Claude Code 指南
    ├── PROJECT-STRUCTURE.md                    # 项目结构详解
    ├── PROJECT-STATUS.md                       # 项目状态
    ├── DEVTOOLS-AUTOMATION-GUIDE.md            # ✨ DevTools 使用指南 (430行)
    ├── CHROME-DEVTOOLS-IMPLEMENTATION-SUMMARY.md # ✨ 实施总结 (350行)
    ├── TEST-RESULTS-SUMMARY.md                 # ✨ 测试结果报告
    ├── AUTOMATION-GUIDE.md                     # 自动化指南
    ├── MULTI-BRAND-FILTERING-DESIGN.md         # 多品牌过滤设计
    ├── CSS-ISSUES-REPORT.md                    # CSS 问题报告
    ├── TEST-REPORT.md                          # 测试报告
    ├── AUTO-CHECK-README.md                    # 自动检查说明
    └── AUTO-CHECK-SUMMARY.md                   # 自动检查总结
```

---

## 🎨 核心页面组件

### 1. Dashboard (仪表盘)
- **路径**: `src/components/pages/Dashboard.tsx`
- **功能**: 项目概览、KPI 指标、工作流状态
- **数据**: Citation Rate, GEO Score, 内容统计

### 2. Projects (项目管理)
- **路径**: `src/components/pages/Projects.tsx`
- **功能**: 多项目管理、创建新项目、项目卡片网格
- **项目**: SweetNight, Eufy, Hisense

### 3. CitationTracking (AI 引用追踪) ✨
- **路径**: `src/components/pages/CitationTracking.tsx`
- **功能**: AI 平台引用监控、扫描 Citations、统计分析
- **测试标识符**: 17 个 data-testid 属性
- **测试覆盖**: 13 个 E2E 测试用例

### 4. PromptManagement (Prompt 管理)
- **路径**: `src/components/pages/PromptManagement.tsx`
- **功能**: Prompt 评分、优先级管理、平台分发

### 5. KnowledgeGraph (知识图谱)
- **路径**: `src/components/pages/KnowledgeGraph.tsx`
- **功能**: 实体关系可视化、Neo4j 集成

### 6. ContentGenerator (内容生成器)
- **路径**: `src/components/pages/ContentGenerator.tsx`
- **功能**: AI 内容生成、多平台适配

### 7. Analytics (数据分析)
- **路径**: `src/components/pages/Analytics.tsx`
- **功能**: Citation 趋势、平台表现、归因分析

---

## 🧪 测试框架

### Playwright E2E 测试

**配置**: `playwright.config.ts`
**基础 URL**: `http://localhost:5173`

#### 测试文件结构

| 测试文件 | 测试数 | CDP集成 | 说明 |
|---------|-------|---------|------|
| `citation-tracking-optimized.spec.ts` | 13 | ✅ | CDP 深度集成测试 |
| `citation-tracking.spec.ts` | 5 | ❌ | 基础功能测试 |
| `projects.spec.ts` | 4 | ❌ | 项目管理测试 |
| `prompt-management.spec.ts` | 3 | ❌ | Prompt 管理测试 |
| `portal-navigation.spec.ts` | 2 | ❌ | 导航测试 |
| `test-auth-flow.spec.ts` | 3 | ❌ | 认证流程测试 |

#### CDP 功能集成

**citation-tracking-optimized.spec.ts** 使用的 CDP 特性：

```typescript
✅ Network.setBlockedURLs       // 屏蔽跟踪脚本
✅ Network.enable               // 网络监控
✅ Network.requestWillBeSent    // 请求追踪
✅ Network.responseReceived     // 响应监控
✅ Network.emulateNetworkConditions // 慢速网络模拟
✅ Performance API              // 性能指标收集
✅ PerformanceObserver          // 交互时间测量
✅ Console/PageError 事件       // 错误捕获
```

---

## 🚀 NPM 脚本

### 开发命令

```bash
npm run dev              # 启动开发服务器 (Vite)
npm run build            # 生产构建
npm run preview          # 预览生产构建
npm run type-check       # TypeScript 类型检查
npm run lint             # ESLint 代码检查
```

### 测试命令

```bash
npm test                 # 运行所有 Playwright 测试
npm run test:headed      # 带浏览器界面运行测试
npm run test:optimized   # 运行 CDP 优化测试 ✨
npm run test:citations   # Citation Tracking 测试
npm run test:projects    # Projects 测试
npm run test:prompts     # Prompts 测试
npm run test:report      # 查看测试报告
```

### 性能监控命令

```bash
npm run perf             # 运行性能监控脚本 ✨
npm run perf:report      # 打开性能报告 ✨
```

### 验证命令

```bash
npm run verify           # 完整验证 (type-check + build)
npm run auto-verify      # 自动验证脚本
npm run quick-check      # 快速健康检查
npm run health-check     # 详细健康检查
```

---

## 📊 性能监控

### 自动化性能监控脚本

**文件**: `scripts/performance-monitor.ts` (274 行)

**功能**:
- 测试 4 个主要页面 (Citations, Projects, Prompts, Dashboard)
- 收集 12 项性能指标
- 生成 HTML 可视化报告
- 导出 JSON 原始数据
- 捕获 Console 错误
- 分类网络请求 (API/Images/Scripts/Styles)

**运行方式**:
```bash
npm run dev              # 先启动开发服务器
npm run perf             # 在新终端运行监控
npm run perf:report      # 查看报告
```

**报告位置**: `./performance-reports/performance-{timestamp}.html`

---

## 🔧 技术栈详情

### 核心依赖

| 包 | 版本 | 用途 |
|----|------|------|
| react | 19.1.1 | UI 框架 |
| react-dom | 19.1.1 | React DOM 渲染 |
| typescript | 5.9.3 | 类型系统 |
| vite | 7.1.7 | 构建工具 |
| tailwindcss | 4.1.14 | CSS 框架 |
| axios | 1.12.2 | HTTP 客户端 |
| zustand | 5.0.8 | 状态管理 |
| lucide-react | 0.545.0 | 图标库 |
| framer-motion | 12.23.24 | 动画库 |
| recharts | 3.2.1 | 图表库 |

### 开发依赖

| 包 | 版本 | 用途 |
|----|------|------|
| @playwright/test | 1.56.0 | E2E 测试框架 |
| playwright | 1.56.0 | 浏览器自动化 |
| puppeteer | 24.25.0 | CDP 浏览器控制 |
| eslint | 9.36.0 | 代码检查 |
| @types/node | 24.6.0 | Node.js 类型定义 |

---

## 🎯 已实现的功能

### ✅ 用户认证
- 登录/登出
- 用户角色（Admin/User）
- 会话管理
- 演示账户：admin/password123

### ✅ 多项目管理
- 项目切换
- 项目创建
- 项目卡片视图
- 项目数据隔离

### ✅ Citation Tracking (重点功能)
- AI 平台引用监控
- 手动扫描功能
- 统计指标展示
- 项目过滤
- 搜索功能
- 刷新数据
- **17 个 data-testid 测试标识符**

### ✅ E2E 测试自动化
- 13 个 CDP 集成测试
- 自动登录逻辑
- 性能监控
- 网络拦截
- 错误捕获
- 可访问性验证

### ✅ 性能监控
- 自动化性能脚本
- HTML 可视化报告
- 12 项性能指标
- 4 个页面覆盖

---

## 📈 测试覆盖情况

### 最新测试结果 (2025-10-22)

```
✅ 通过率: 84.6% (11/13)
⏱️  执行时间: 1.9 分钟
📊 平均测试时间: 8.8 秒

性能指标:
- DOM Content Loaded: 0ms
- Load Complete: 0ms
- Time to First Byte: 1ms
- DOM Interactive: 4ms
```

**通过的测试**:
1. ✅ Data-testid 验证
2. ✅ 性能监控加载
3. ✅ 高效过滤
4. ✅ 去抖搜索
5. ✅ 统计指标
6. ✅ 扫描模态
7. ✅ 表单验证
8. ✅ 错误捕获
9. ✅ 交互时间
10. ✅ 无障碍属性
11. ✅ 快速过滤

**失败的测试** (需修复):
1. ❌ API 调用监控 (选择器问题)
2. ❌ 慢速网络处理 (超时问题)

---

## 🔗 后端集成

### API 端点

**Base URL**: `http://localhost:8000`
**文档**: `http://localhost:8000/docs` (Swagger UI)

**已集成的服务**:
- FastAPI 后端
- PostgreSQL (端口 5437)
- Neo4j (端口 7688)
- Redis (端口 6382)
- MongoDB (端口 27018)
- Celery Worker (后台任务)

---

## 📚 重要文档索引

### 开发指南
- **CLAUDE.md** - Claude Code 开发指南
- **PROJECT-STRUCTURE.md** - 项目结构详解
- **AUTOMATION-GUIDE.md** - 自动化开发指南

### 测试文档
- **DEVTOOLS-AUTOMATION-GUIDE.md** - ✨ DevTools 使用指南 (430行)
- **CHROME-DEVTOOLS-IMPLEMENTATION-SUMMARY.md** - ✨ 实施总结 (350行)
- **TEST-RESULTS-SUMMARY.md** - ✨ 测试结果报告
- **tests/README-E2E-TESTS.md** - E2E 测试说明

### 状态报告
- **PROJECT-STATUS.md** - 项目当前状态
- **TEST-REPORT.md** - 测试报告
- **CSS-ISSUES-REPORT.md** - CSS 问题追踪

---

## 🚧 待开发功能

### 高优先级
1. 修复 2 个失败的测试用例
2. 为 Projects 和 Prompts 页面添加 data-testid
3. 实现 API 真实数据集成
4. 配置 CI/CD 流水线

### 中优先级
1. 实现 Zustand 全局状态管理
2. 添加 React Router 路由系统
3. 优化 TypeScript 类型定义
4. 提升可访问性 (ARIA 属性)

### 低优先级
1. 移除 11 个 "Coming Soon" 占位页面
2. 实现暗黑模式
3. 添加国际化 (i18n)
4. 性能优化 (代码分割、懒加载)

---

## 🎓 学习资源

### 官方文档
- [Playwright 文档](https://playwright.dev)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [React 19 文档](https://react.dev)
- [Vite 文档](https://vitejs.dev)
- [Tailwind CSS 4](https://tailwindcss.com)

### 项目相关
- [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Testing Best Practices](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

---

## 🏆 项目亮点

### ✨ Chrome DevTools Protocol 集成
- 完整的 CDP 自动化测试框架
- 网络监控和拦截
- 性能指标实时收集
- 慢速网络模拟
- 错误自动捕获

### ✨ 稳定的测试架构
- Data-testid 模式（17 个标识符）
- 不依赖 CSS 类或文本
- 支持 UI 变更和国际化
- 自动登录机制

### ✨ 自动化性能监控
- 一键生成性能报告
- HTML 可视化展示
- 12 项关键指标
- CI/CD 友好

### ✨ 完整的文档体系
- 1,663 行技术文档
- 使用指南 + 实施总结
- 故障排查指南
- 最佳实践示例

---

## 📞 联系信息

**项目路径**: `/Users/cavin/Desktop/dev/leapgeo2/frontend`
**开发服务器**: `http://localhost:5173`
**后端 API**: `http://localhost:8000`

---

**最后更新**: 2025-10-22
**文档版本**: 1.0
**项目状态**: ✅ 开发中 (84.6% 测试通过)
