# GEO Platform 前端驱动开发路线图

**开发策略**: Frontend-First Development (前端优先)
**核心理念**: 先构建完整可运行的前端，再逐步实现后端API

---

## 📋 用户角色分析

### 核心用户角色 (3类)

#### 1. 🎯 Marketing Manager (营销经理)
**关注点**: 整体策略、ROI、竞品对比
**核心任务**:
- 查看多项目概览
- 分析Citation Rate趋势
- 制定内容策略
- 查看竞品分析报告

**主要页面**:
- Projects Overview Dashboard
- Citation Rate Leaderboard
- Competitive Analysis
- ROI Analytics

---

#### 2. ✍️ Content Creator (内容创作者)
**关注点**: Prompt管理、内容生成、发布调度
**核心任务**:
- 管理Prompts（创建、编辑、优先级）
- 使用知识图谱生成内容
- 跨平台内容发布
- 查看内容表现

**主要页面**:
- Prompt Management
- Knowledge Graph Explorer
- Content Generator (AI辅助)
- Platform Coverage
- Publishing Scheduler

---

#### 3. 📊 Data Analyst (数据分析师)
**关注点**: Citation追踪、数据分析、优化建议
**核心任务**:
- 监控AI平台引用
- 分析归因路径
- 生成报告
- 优化建议

**主要页面**:
- Citation Tracking Dashboard
- Attribution Analysis
- Analytics & Reports
- Performance Insights

---

## 🎯 业务流程 (7个阶段)

### 阶段1: 项目初始化 (Marketing Manager)
```
创建项目 → 配置平台 → 设置目标
```
**UI需求**:
- 项目创建表单
- 平台选择界面
- 目标设置（Citation Rate目标）

### 阶段2: 知识图谱构建 (Content Creator)
```
添加品牌/产品信息 → 定义特性 → 关联用户痛点
```
**UI需求**:
- 可视化知识图谱编辑器
- 实体创建表单
- 关系连接工具

### 阶段3: Prompt管理 (Content Creator)
```
输入关键词 → AI评分 → 设置优先级
```
**UI需求**:
- Prompt输入表单（支持批量）
- 实时评分展示
- 优先级标签系统

### 阶段4: 内容生成 (Content Creator)
```
选择Prompt → AI生成内容 → 平台适配
```
**UI需求**:
- 内容生成界面
- 多平台预览
- 编辑器

### 阶段5: 发布调度 (Content Creator)
```
选择平台 → 设置时间 → 自动发布
```
**UI需求**:
- 日历视图
- 发布队列
- 状态跟踪

### 阶段6: Citation追踪 (Data Analyst)
```
每日扫描 → 识别引用 → 统计分析
```
**UI需求**:
- 实时Citation仪表盘
- 平台对比图表
- 引用详情列表

### 阶段7: 数据分析 (Marketing Manager + Data Analyst)
```
查看报告 → 识别趋势 → 优化策略
```
**UI需求**:
- 综合分析报告
- 趋势图表
- 优化建议卡片

---

## 🏗️ 新的开发计划（前端优先）

### **Sprint 1: 项目搭建与核心组件 (Day 1-2)**

#### Day 1 上午: React项目初始化 ✅
```bash
# 1. 创建React + Vite项目
npm create vite@latest frontend -- --template react-ts

# 2. 安装核心依赖
cd frontend
npm install
npm install lucide-react recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. 配置Tailwind CSS

# 4. 测试运行
npm run dev  # 验证: http://localhost:5173
```

**验证点**: ✅ Vite开发服务器运行，显示默认页面

---

#### Day 1 下午: UI组件库搭建 ✅
**目标**: 构建可复用的基础组件

**组件清单** (10个核心组件):
1. `Button` - 按钮组件
2. `Card` - 卡片容器
3. `Input` - 输入框
4. `Select` - 下拉选择
5. `Modal` - 弹窗
6. `Table` - 数据表格
7. `Badge` - 标签徽章
8. `Chart` - 图表封装
9. `Sidebar` - 侧边栏
10. `Header` - 顶部导航

**实现方式**:
```tsx
// src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children
}) => {
  // Implementation with Tailwind classes
}
```

**验证点**: ✅ Storybook页面展示所有组件，可交互测试

---

### **Sprint 2: 角色导向的主要页面 (Day 3-5)**

#### Day 3: Marketing Manager视角 📊
**页面1: Projects Overview Dashboard**
```tsx
// 功能:
- 项目卡片网格（支持筛选）
- Citation Rate排行榜
- 快速统计数据
- 创建新项目按钮

// Mock数据:
const mockProjects = [
  { id: 'sweetnight', name: 'SweetNight', citationRate: 0.32, ... },
  { id: 'eufy', name: 'Eufy', citationRate: 0.35, ... }
];
```

**页面2: Competitive Analysis**
```tsx
// 功能:
- 竞品对比表格
- Share of Voice可视化
- 趋势折线图
- 差距分析
```

**验证点**: ✅ 运行 `npm run dev`，访问 `/dashboard`，看到项目概览

---

#### Day 4: Content Creator视角 ✍️
**页面3: Prompt Management**
```tsx
// 功能:
- Prompt列表（可搜索、筛选）
- 批量导入功能
- 优先级编辑
- 评分显示
- 平台标签管理

// 交互:
- 点击Prompt → 打开详情Modal
- 拖拽排序（优先级）
- 批量操作（删除、修改状态）
```

**页面4: Knowledge Graph Explorer**
```tsx
// 功能:
- D3.js/React Flow可视化图谱
- 节点点击查看详情
- 添加/编辑节点和关系
- 搜索节点
- 导出图谱

// 交互:
- 拖拽节点位置
- 右键菜单（编辑、删除）
- 缩放和平移
```

**验证点**: ✅ `/prompts` 页面显示Prompt列表，可搜索和筛选

---

#### Day 5: Data Analyst视角 📈
**页面5: Citation Tracking Dashboard**
```tsx
// 功能:
- 8个AI平台实时统计
- Citation列表（带搜索）
- 时间范围筛选
- 平台对比雷达图
- Top引用排行

// 数据可视化:
- Recharts折线图（趋势）
- 饼图（平台分布）
- 热力图（时间分布）
```

**页面6: Attribution Analysis**
```tsx
// 功能:
- 用户旅程可视化（Sankey图）
- 归因模型切换（First/Last/U-Shaped）
- 转化漏斗
- 平台贡献分析
```

**验证点**: ✅ `/citations` 页面显示实时数据，图表可交互

---

### **Sprint 3: 高级功能页面 (Day 6-7)**

#### Day 6: 内容生成与发布 🤖
**页面7: Content Generator**
```tsx
// 功能:
- Prompt选择器
- 平台选择（YouTube/Reddit/Quora...）
- AI生成预览（流式输出动画）
- 内容编辑器（Markdown支持）
- 一键发布

// AI交互模拟:
const simulateAIGeneration = async (prompt, platform) => {
  // 模拟流式输出
  for (let chunk of contentChunks) {
    setContent(prev => prev + chunk);
    await sleep(100);
  }
};
```

**页面8: Publishing Scheduler**
```tsx
// 功能:
- 日历视图（react-big-calendar）
- 拖拽调度
- 发布队列
- 状态标签（已发布/待发布/失败）
- 批量操作
```

**验证点**: ✅ `/generate` 页面可生成内容，`/schedule` 显示日历

---

#### Day 7: 设置与配置 ⚙️
**页面9: Project Settings**
```tsx
// 功能:
- 项目信息编辑
- 平台API配置
- 团队成员管理
- 通知设置
- 危险操作（删除项目）
```

**页面10: Analytics & Reports**
```tsx
// 功能:
- 自定义报告构建器
- 导出功能（PDF/CSV）
- 报告模板
- 自动邮件报告设置
```

**验证点**: ✅ 所有页面可访问，路由正常，无报错

---

### **Sprint 4: 交互优化与动画 (Day 8)**

#### 优化清单
1. **页面过渡动画** (Framer Motion)
2. **加载状态** (Skeleton screens)
3. **错误处理** (Error boundaries)
4. **空状态设计** (Empty states)
5. **Toast通知** (Success/Error提示)
6. **快捷键支持** (Keyboard shortcuts)
7. **响应式布局** (Mobile适配)
8. **暗色模式** (Dark mode toggle)

**验证点**: ✅ 所有交互流畅，无闪烁，体验优秀

---

## 🔄 前端→后端渐进式开发

### **Sprint 5: 第一个API集成 (Day 9)**

#### 选择最简单的功能开始
**目标**: Projects API

**步骤**:
1. 后端：实现 `GET /api/v1/projects` ✅
2. 前端：创建API客户端
```tsx
// src/api/projects.ts
export const getProjects = async () => {
  const response = await fetch('http://localhost:8000/api/v1/projects');
  return response.json();
};
```

3. 前端：替换Mock数据
```tsx
// Before
const [projects, setProjects] = useState(mockProjects);

// After
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  getProjects()
    .then(setProjects)
    .finally(() => setLoading(false));
}, []);
```

**验证点**: ✅ 前端显示真实数据库数据，无错误

---

### **Sprint 6-10: 逐步替换Mock数据 (Day 10-14)**

#### 替换顺序（从简单到复杂）
1. **Day 10**: Projects CRUD ✅
2. **Day 11**: Prompts CRUD ✅
3. **Day 12**: Citations查询 ✅
4. **Day 13**: Knowledge Graph (GraphQL) ✅
5. **Day 14**: Statistics & Reports ✅

每天流程:
```
1. 选择一个功能模块
2. 实现后端API（1-2小时）
3. 测试API（Postman/cURL）
4. 更新前端API客户端
5. 替换Mock数据
6. 端到端测试
7. 提交代码
```

**验证点**: ✅ 每天结束时整个应用可运行，功能正常

---

## 📁 新的项目结构

```
leapgeo2/
├── frontend/                    # 新的React项目
│   ├── src/
│   │   ├── components/          # UI组件
│   │   │   ├── ui/              # 基础组件
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/          # 布局组件
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   └── features/        # 功能组件
│   │   │       ├── ProjectCard.tsx
│   │   │       ├── PromptTable.tsx
│   │   │       └── KnowledgeGraph.tsx
│   │   │
│   │   ├── pages/               # 页面组件
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Prompts.tsx
│   │   │   ├── KnowledgeGraph.tsx
│   │   │   ├── Citations.tsx
│   │   │   ├── ContentGenerator.tsx
│   │   │   ├── Schedule.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Settings.tsx
│   │   │
│   │   ├── api/                 # API客户端
│   │   │   ├── projects.ts
│   │   │   ├── prompts.ts
│   │   │   ├── citations.ts
│   │   │   └── graphql.ts
│   │   │
│   │   ├── hooks/               # 自定义Hooks
│   │   │   ├── useProjects.ts
│   │   │   ├── usePrompts.ts
│   │   │   └── useCitations.ts
│   │   │
│   │   ├── store/               # 状态管理(Zustand)
│   │   │   ├── projectStore.ts
│   │   │   └── userStore.ts
│   │   │
│   │   ├── utils/               # 工具函数
│   │   │   ├── mockData.ts      # Mock数据（逐步移除）
│   │   │   ├── formatting.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── types/               # TypeScript类型
│   │   │   ├── project.ts
│   │   │   ├── prompt.ts
│   │   │   └── citation.ts
│   │   │
│   │   ├── App.tsx              # 主应用
│   │   ├── main.tsx             # 入口
│   │   └── router.tsx           # 路由配置
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                     # 现有后端（逐步完善）
├── scripts/                     # 现有脚本
└── docs/                        # 文档
```

---

## ✅ 每日验证清单

### 前端开发阶段 (Day 1-8)
每天结束时检查:
- [ ] `npm run dev` 无错误启动
- [ ] 所有路由可访问
- [ ] 新增页面显示正常
- [ ] UI组件可交互
- [ ] Mock数据显示正确
- [ ] Console无错误
- [ ] 响应式布局正常
- [ ] Git提交完成

### 后端集成阶段 (Day 9-14)
每天结束时检查:
- [ ] 前端 `npm run dev` 正常
- [ ] 后端 `uvicorn app.main:app --reload` 正常
- [ ] API端点返回数据
- [ ] 前端显示真实数据
- [ ] 增删改查功能正常
- [ ] 错误处理生效
- [ ] 加载状态显示
- [ ] Git提交完成

---

## 🎯 关键里程碑

### Milestone 1: 可运行的前端原型 (Day 3)
- ✅ 10个基础UI组件
- ✅ 3个主要页面（Dashboard, Prompts, Citations）
- ✅ 完整路由系统
- ✅ Mock数据驱动

### Milestone 2: 完整前端应用 (Day 8)
- ✅ 10个功能页面
- ✅ 完整用户流程
- ✅ 动画和交互优化
- ✅ 100% Mock数据

### Milestone 3: 第一个API集成 (Day 9)
- ✅ Projects API后端
- ✅ 前端显示真实数据
- ✅ 端到端测试通过

### Milestone 4: 完整全栈应用 (Day 14)
- ✅ 所有API实现
- ✅ 0% Mock数据
- ✅ 生产就绪

---

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **图表**: Recharts / D3.js
- **状态**: Zustand / Context API
- **路由**: React Router v6
- **动画**: Framer Motion
- **表单**: React Hook Form
- **HTTP**: Axios / Fetch

### 开发工具
- **包管理**: npm/pnpm
- **代码格式**: Prettier
- **类型检查**: TypeScript
- **测试**: Vitest + Testing Library
- **Storybook**: 组件文档

---

## 💡 开发原则

### 1. **可运行优先**
每次提交都确保 `npm run dev` 可以正常运行

### 2. **组件复用**
先构建基础组件库，再组合成页面

### 3. **渐进增强**
先基础功能，再高级特性

### 4. **用户导向**
基于真实用户角色和场景设计

### 5. **持续验证**
每个功能完成后立即测试

---

## 🚀 立即开始

### 第一步: 创建React项目
```bash
cd /Users/cavin/Desktop/dev/leapgeo2
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm run dev
```

**验证**: 浏览器打开 http://localhost:5173 看到Vite欢迎页面

### 第二步: 配置Tailwind
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 第三步: 安装依赖
```bash
npm install lucide-react recharts react-router-dom zustand
npm install -D @types/node
```

**下一步**: 查看 `FRONTEND-FIRST-ROADMAP.md` 继续开发！

---

**准备好开始了吗？运行第一个命令创建React项目！** 🎨
