# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**Leap AI GEO Platform** - GEO（Generative Engine Optimization）智能内容营销平台

一个全栈应用，帮助品牌在 AI 搜索引擎（ChatGPT、Claude、Perplexity 等）中提升被引用率（Citation Rate）。采用前后端分离架构，React 前端 + FastAPI 后端 + 多数据库（PostgreSQL + Neo4j + Redis）。

## 开发环境快速启动

### 前端开发（React + Vite）

```bash
cd frontend
npm install                    # 安装依赖
npm run dev                    # 启动开发服务器（http://localhost:5173）
npm run build                  # 生产构建
npm run type-check             # TypeScript 类型检查
npm run lint                   # ESLint 代码检查
```

**重要验证脚本**：
```bash
npm run verify                 # 完整验证（type-check + build）
npm run auto-verify            # 自动验证（带彩色输出）
npm run quick-check            # 快速健康检查
npm run health-check           # 详细健康检查
```

**E2E 测试**：
```bash
npx playwright test                    # 运行所有测试
npx playwright test --headed           # 有头模式
npx playwright test --ui               # UI 模式
npx playwright show-report            # 查看测试报告
```

### 后端开发（FastAPI）

```bash
cd backend

# 安装依赖
pip3 install -r requirements.txt

# 启动开发服务器（支持热重载）
uvicorn app.main:app --reload --port 8000

# 或使用 Python 模块方式
python3 -m uvicorn app.main:app --reload --port 8000
```

**API 访问地址**：
- Swagger 文档: http://localhost:8000/docs
- ReDoc 文档: http://localhost:8000/redoc
- 健康检查: http://localhost:8000/health

**后端测试**：
```bash
pytest                                 # 运行所有测试
pytest --cov=app --cov-report=html     # 生成覆盖率报告
```

### 数据库初始化

**前置条件**：确保 Docker 容器正在运行
```bash
docker ps | grep claude-mcp
# 应该看到: postgres-claude-mcp, neo4j-claude-mcp, redis-claude-mcp
```

**初始化脚本**（在项目根目录执行）：
```bash
# PostgreSQL - 创建表结构
docker exec -i postgres-claude-mcp psql -U claude -d claude_dev < scripts/init_database.sql

# 或使用本地 psql
PGPASSWORD=claude_dev_2025 psql -h localhost -p 5437 -U claude -d claude_dev -f scripts/init_database.sql

# Neo4j - 创建知识图谱
cat scripts/init_neo4j.cypher | docker exec -i neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025

# Redis - 初始化缓存
python3 scripts/init_redis.py

# 数据迁移（可选）
python3 scripts/migrate_data.py

# 验证数据完整性
python3 scripts/verify_data.py
```

## 项目架构

### 技术栈

**前端**：
- React 19 + TypeScript
- Vite 7（构建工具）
- Tailwind CSS 4（样式）
- Lucide React（图标）
- Recharts（图表）
- React Router DOM（路由）
- Zustand（状态管理 - 已安装但未启用）
- Framer Motion（动画）
- Axios（HTTP 客户端）
- Playwright（E2E 测试）

**后端**：
- FastAPI 0.109（Web 框架）
- Uvicorn（ASGI 服务器）
- SQLAlchemy 2.0（ORM）
- Pydantic 2.5（数据验证）
- Strawberry GraphQL（GraphQL 支持）
- Python-Jose（JWT 认证）

**数据库**：
- PostgreSQL 5437（业务数据）
- Neo4j 7688（知识图谱）
- Redis 6382（缓存）

### 目录结构

```
leapgeo2/
├── frontend/                           # React 前端应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   └── Portal.tsx         # 主布局容器（路由 + 导航）
│   │   │   └── pages/                 # 独立页面组件
│   │   │       ├── Dashboard.tsx      # 仪表盘
│   │   │       ├── Projects.tsx       # 项目管理
│   │   │       ├── KnowledgeGraph.tsx # 知识图谱
│   │   │       ├── PromptManagement.tsx
│   │   │       ├── ContentGenerator.tsx
│   │   │       ├── CitationTracking.tsx
│   │   │       └── Analytics.tsx
│   │   ├── App.tsx                    # 根组件
│   │   └── main.tsx                   # Vite 入口
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── playwright.config.ts
│
├── backend/                            # FastAPI 后端应用
│   ├── app/
│   │   ├── main.py                    # FastAPI 应用入口
│   │   ├── config.py                  # 配置管理
│   │   ├── database.py                # 数据库连接
│   │   ├── models/                    # Pydantic 数据模型
│   │   │   ├── project.py
│   │   │   ├── prompt.py
│   │   │   └── citation.py
│   │   ├── routers/                   # API 路由
│   │   │   ├── projects.py
│   │   │   ├── prompts.py
│   │   │   ├── citations.py
│   │   │   └── stats.py
│   │   └── services/
│   │       └── neo4j_service.py       # Neo4j 交互服务
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
│
├── scripts/                            # 数据库初始化脚本
│   ├── init_database.sql              # PostgreSQL DDL
│   ├── init_neo4j.cypher              # Neo4j 知识图谱
│   ├── init_redis.py                  # Redis 缓存
│   ├── migrate_data.py                # 数据迁移
│   └── verify_data.py                 # 数据验证
│
└── [文档文件]
    ├── CLAUDE.md                      # 本文件
    ├── DATA-ARCHITECTURE.md           # 数据架构设计
    ├── FRONTEND-FIRST-ROADMAP.md      # 前端开发路线图
    ├── QUICKSTART-FRONTEND.md         # 前端快速入门
    └── AUTOMATION-ROADMAP.md          # 自动化开发指南
```

### 架构设计模式

#### 前端：Portal 布局模式

```typescript
// Portal.tsx 职责：
// 1. 侧边栏导航（Sidebar）
// 2. 顶部标题栏（Header）
// 3. 页面路由（Switch-based routing）
// 4. 全局状态（activePage）

const Portal: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      // ... 其他页面
    }
  };

  return (
    <div className="flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main>{renderPage()}</main>
    </div>
  );
};
```

**关键原则**：
- Portal 只负责布局和路由，不包含业务逻辑
- 每个页面组件完全独立，拥有自己的状态和 UI
- 避免使用 React Context 进行跨页面状态共享（目前）
- 未来可升级到 React Router 进行更强大的路由管理

#### 后端：RESTful API 设计

```python
# FastAPI 路由结构
app.include_router(projects.router, prefix="/api/v1", tags=["projects"])
app.include_router(prompts.router, prefix="/api/v1", tags=["prompts"])
app.include_router(citations.router, prefix="/api/v1", tags=["citations"])
app.include_router(stats.router, prefix="/api/v1", tags=["statistics"])

# API 端点示例
GET    /api/v1/projects                    # 列出所有项目
GET    /api/v1/projects/{project_id}       # 获取单个项目
POST   /api/v1/projects                    # 创建项目
PUT    /api/v1/projects/{project_id}       # 更新项目
DELETE /api/v1/projects/{project_id}       # 删除项目
```

**数据库连接管理**：
- 使用 SQLAlchemy 异步 ORM（asyncpg）
- 连接池管理（避免资源泄漏）
- Lifespan 事件处理（启动时初始化，关闭时清理）

#### 数据层：三库分工

```
PostgreSQL (5437)      → 业务数据（Projects, Prompts, Citations, Stats）
Neo4j (7688)           → 知识图谱（Brand-Product-Feature-Problem 关系）
Redis (6382)           → 缓存层（Citation Rate, 排行榜, 会话）
```

**查询优化策略**：
- PostgreSQL: 索引优化（project_id, status, created_date）
- Neo4j: 唯一性约束 + 标签索引
- Redis: TTL 缓存（项目信息 1h，统计数据 30min）

## 核心业务逻辑

### 七阶段 GEO 工作流

1. **Prompt 管理** - 输入关键词 → AI 评分（0-100）→ 优先级分类（P0/P1/P2）
2. **知识图谱查询** - 从 Neo4j 提取产品特性和用户痛点关系
3. **多模态内容生成** - 使用 GPT-4o/Claude 生成跨平台内容
4. **内容质量评分** - GEO 优化分数评估
5. **跨平台发布** - 智能调度到 9+ 平台（YouTube、Reddit、Quora 等）
6. **AI Citation 追踪** - 每日扫描 8 个 AI 平台引用情况
7. **数据分析优化** - 识别高效内容，持续迭代

### 知识图谱结构

**节点类型**：
- `Brand` - 品牌（SweetNight, Eufy, Hisense）
- `Product` - 产品线（CoolNest Mattress, RoboVac X8）
- `Feature` - 产品特性（Cooling Technology, Self-Empty Base）
- `Problem` - 用户痛点（Hot Sleep, Pet Hair Cleanup）
- `UserGroup` - 目标用户群（Athletes, Pet Owners）
- `Scenario` - 使用场景（Summer Sleep, Daily Cleaning）

**关系类型**：
```cypher
(Brand)-[:HAS_PRODUCT]->(Product)
(Product)-[:HAS_FEATURE]->(Feature)
(Feature)-[:SOLVES]->(Problem)
(Feature)-[:APPLIES_TO]->(Scenario)
(UserGroup)-[:NEEDS]->(Feature)
(UserGroup)-[:HAS_PROBLEM]->(Problem)
```

**示例查询**（SweetNight 项目）：
```cypher
MATCH (b:Brand {name: 'SweetNight'})-[:HAS_PRODUCT]->(p:Product)
      -[:HAS_FEATURE]->(f:Feature)-[:SOLVES]->(pr:Problem)
RETURN b, p, f, pr
```

### Prompt 优先级系统

```typescript
// 优先级分类逻辑
const classifyPrompt = (text: string, intent: string): Priority => {
  // P0 (Critical) - 高意图、对比、评测类
  if (intent === 'High-Intent' && (
    text.includes('best') ||
    text.includes('vs') ||
    text.includes('review')
  )) return 'P0';

  // P1 (High) - How-to、教育类
  if (text.includes('how to') || text.includes('guide')) return 'P1';

  // P2 (Medium) - 补充内容
  return 'P2';
};
```

### Citation Rate 计算

```python
# backend/app/services/stats_service.py
def calculate_citation_rate(project_id: str) -> float:
    """计算 Citation Rate = 被引用次数 / 总 Prompt 数"""
    total_prompts = db.query(Prompt).filter_by(project_id=project_id).count()
    cited_prompts = db.query(Citation).filter_by(project_id=project_id).distinct(Citation.prompt_id).count()
    return cited_prompts / total_prompts if total_prompts > 0 else 0.0
```

**基准标准**：
- `>35%` - 优秀（绿色）
- `28-35%` - 良好（蓝色）
- `20-28%` - 平均（黄色）
- `<20%` - 需改进（红色）

## 常见开发任务

### 添加新页面

1. **创建页面组件**：
```bash
# 在 frontend/src/components/pages/ 创建新文件
touch frontend/src/components/pages/NewFeature.tsx
```

2. **实现页面组件**：
```tsx
// NewFeature.tsx
const NewFeature: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Feature</h1>
        <p className="text-gray-600 mt-1">Description</p>
      </div>
      {/* Page content */}
    </div>
  );
};

export default NewFeature;
```

3. **在 Portal.tsx 中注册**：
```tsx
// 导入组件
import NewFeature from './pages/NewFeature';

// 添加导航项
const navigation = [
  // ... existing items
  { id: 'new-feature', label: 'New Feature', icon: Icon, section: 'Overview' }
];

// 添加路由
const renderPage = () => {
  switch (activePage) {
    // ... existing cases
    case 'new-feature': return <NewFeature />;
  }
};
```

### 添加新 API 端点

1. **定义 Pydantic 模型**：
```python
# backend/app/models/new_model.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NewModel(BaseModel):
    id: Optional[int] = None
    name: str
    created_at: Optional[datetime] = None
```

2. **创建路由**：
```python
# backend/app/routers/new_router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.new_model import NewModel

router = APIRouter()

@router.get("/new-endpoint")
async def get_items(db: Session = Depends(get_db)):
    return {"items": []}
```

3. **在 main.py 中注册**：
```python
from .routers import new_router

app.include_router(new_router.router, prefix="/api/v1", tags=["new-feature"])
```

### 前端调用后端 API

```typescript
// frontend/src/api/projects.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const getProjects = async () => {
  const response = await axios.get(`${API_BASE_URL}/projects`);
  return response.data;
};

export const createProject = async (data: ProjectInput) => {
  const response = await axios.post(`${API_BASE_URL}/projects`, data);
  return response.data;
};
```

**在组件中使用**：
```tsx
import { useEffect, useState } from 'react';
import { getProjects } from '../api/projects';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
};
```

## 样式规范

### Tailwind CSS 设计系统

**颜色语义**：
```
bg-blue-600      → 主要 CTA、活跃状态
bg-green-600     → 成功状态、正向指标
bg-yellow-600    → 警告状态、中等优先级
bg-red-600       → 错误状态、关键警告
bg-purple-600    → 产品分类
bg-orange-600    → 特性分类
bg-gray-100      → 背景色
bg-white         → 卡片背景
```

**组件 Class 模式**：
```tsx
// 卡片
<div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">

// 主按钮
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">

// 次按钮
<button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">

// 徽章
<span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">

// 页面标题
<h1 className="text-3xl font-bold text-gray-900">
```

**响应式布局**：
```tsx
// KPI 卡片网格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// 项目卡片网格
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// Flex 布局
<div className="flex items-center justify-between gap-4">
```

### 可访问性要求

**当前需要改进**：
1. 按钮缺少 `type` 属性（应为 `button`、`submit` 或 `reset`）
2. Select 元素缺少 `aria-label` 或关联的 `<label>`
3. 避免内联样式，使用 Tailwind classes

**正确示例**：
```tsx
// ✅ 正确
<button type="button" className="px-4 py-2 bg-blue-600">Click</button>
<label htmlFor="status-select" className="sr-only">Status</label>
<select id="status-select" aria-label="Filter by status">

// ❌ 错误
<button style={{backgroundColor: 'blue'}}>Click</button>
<select> {/* 缺少标签 */}
```

## 数据库设计

### PostgreSQL 表结构

```sql
-- 项目表
CREATE TABLE projects (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    industry VARCHAR,
    description TEXT,
    status VARCHAR DEFAULT 'active',
    citation_rate DECIMAL(5,4),
    total_prompts INTEGER DEFAULT 0,
    content_published INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prompt 表
CREATE TABLE prompts (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR REFERENCES projects(id),
    text TEXT NOT NULL,
    intent VARCHAR,
    priority VARCHAR,
    score INTEGER,
    citation_rate DECIMAL(5,4),
    status VARCHAR DEFAULT 'active',
    created_date DATE DEFAULT CURRENT_DATE
);

-- Citation 表
CREATE TABLE citations (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR REFERENCES projects(id),
    prompt_id INTEGER REFERENCES prompts(id),
    platform VARCHAR NOT NULL,
    prompt TEXT,
    source VARCHAR,
    position INTEGER,
    snippet TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 性能优化索引
CREATE INDEX idx_prompts_project ON prompts(project_id);
CREATE INDEX idx_citations_project_date ON citations(project_id, detected_at);
CREATE INDEX idx_citations_platform ON citations(platform);
```

### Redis 缓存键命名

```
geo:project:{project_id}:info               # 项目基本信息（JSON, TTL: 1h）
geo:project:{project_id}:citation_rate      # Citation Rate（String, TTL: 30min）
geo:project:{project_id}:prompt_count       # Prompt 数量（String, TTL: 30min）
geo:citation_rate_leaderboard               # 排行榜（Sorted Set, 永久）
```

**缓存策略**：
```python
import redis
from typing import Optional

redis_client = redis.Redis(host='localhost', port=6382, password='claude_redis_2025', decode_responses=True)

def get_cached_citation_rate(project_id: str) -> Optional[float]:
    """从 Redis 获取缓存的 Citation Rate"""
    key = f"geo:project:{project_id}:citation_rate"
    cached = redis_client.get(key)
    if cached:
        return float(cached)

    # Cache miss - 从数据库查询
    rate = calculate_citation_rate_from_db(project_id)
    redis_client.setex(key, 1800, str(rate))  # 30分钟 TTL
    return rate
```

## 已知技术债务

### 前端

1. **类型安全**：多个组件使用 `// @ts-nocheck` 绕过类型检查（需逐步移除）
2. **路由系统**：当前使用自定义 Switch 路由，未来应迁移到 React Router
3. **全局状态**：Zustand 已安装但未配置，各页面状态孤立
4. **Mock 数据**：所有组件使用硬编码数据数组，需替换为 API 调用
5. **可访问性**：缺少 ARIA 标签、按钮类型、语义化 HTML
6. **占位页面**：11 个导航项显示 "Coming Soon" 占位页

### 后端

1. **认证系统**：JWT 依赖已安装但未实现
2. **GraphQL**：Strawberry GraphQL 已安装但未启用
3. **数据迁移**：缺少 Alembic 迁移版本控制
4. **测试覆盖**：测试用例不完整
5. **错误处理**：缺少统一的异常处理中间件
6. **API 限流**：缺少 Rate Limiting 保护

## 测试策略

### 前端测试

**Playwright E2E 测试示例**：
```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('Dashboard loads successfully', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 验证标题
  await expect(page.locator('h1')).toContainText('GEO Platform Dashboard');

  // 验证 KPI 卡片
  await expect(page.locator('.grid')).toBeVisible();

  // 验证项目列表
  await expect(page.locator('.project-card')).toHaveCount(3);
});
```

**运行测试**：
```bash
npx playwright test                    # 无头模式
npx playwright test --headed           # 有头模式（看到浏览器）
npx playwright test --ui               # UI 模式（调试工具）
npx playwright test --debug            # 调试模式
npx playwright show-report            # 查看 HTML 报告
```

### 后端测试

**pytest 测试示例**：
```python
# tests/test_projects.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_get_projects():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/projects")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_project():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/projects", json={
            "id": "test-project",
            "name": "Test Project",
            "industry": "Tech"
        })
    assert response.status_code == 201
```

**运行测试**：
```bash
pytest                                 # 运行所有测试
pytest tests/test_projects.py          # 运行单个文件
pytest -v                              # 详细输出
pytest --cov=app                       # 生成覆盖率
pytest --cov=app --cov-report=html     # HTML 覆盖率报告
```

## 性能优化建议

### 前端优化

1. **代码分割**：使用 React.lazy() 和 Suspense 进行懒加载
```tsx
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Projects = React.lazy(() => import('./pages/Projects'));

<Suspense fallback={<LoadingSpinner />}>
  {renderPage()}
</Suspense>
```

2. **图表性能**：Recharts 大数据集使用虚拟化
```tsx
<LineChart data={data.slice(0, 100)} /> {/* 限制数据点 */}
```

3. **防抖搜索**：输入框使用 debounce
```tsx
const debouncedSearch = useDebouncedCallback(
  (value: string) => setSearchTerm(value),
  300
);
```

### 后端优化

1. **查询优化**：使用 `selectinload` 避免 N+1 查询
```python
from sqlalchemy.orm import selectinload

projects = await db.query(Project).options(
    selectinload(Project.prompts)
).all()
```

2. **分页**：大数据集使用分页
```python
@router.get("/prompts")
async def get_prompts(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return db.query(Prompt).offset(skip).limit(limit).all()
```

3. **缓存装饰器**：高频查询使用 Redis 缓存
```python
from functools import wraps
import json

def cache_result(key_prefix: str, ttl: int = 3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{key_prefix}:{args[0]}"
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache_result("project_stats", ttl=1800)
async def get_project_stats(project_id: str):
    # Expensive calculation
    pass
```

## 故障排查

### 常见问题

#### 前端端口被占用
```bash
# 查找占用端口 5173 的进程
lsof -ti:5173

# 杀死进程
lsof -ti:5173 | xargs kill -9

# 或修改 vite.config.ts 使用其他端口
export default defineConfig({
  server: { port: 3000 }
});
```

#### 后端数据库连接失败
```bash
# 检查 PostgreSQL 容器状态
docker ps | grep postgres-claude-mcp

# 查看容器日志
docker logs postgres-claude-mcp

# 重启容器
docker restart postgres-claude-mcp

# 测试连接
PGPASSWORD=claude_dev_2025 psql -h localhost -p 5437 -U claude -d claude_dev -c "SELECT 1;"
```

#### Neo4j 连接错误
```bash
# 检查 Neo4j 容器
docker ps | grep neo4j-claude-mcp

# 访问浏览器界面
open http://localhost:7475

# 使用 cypher-shell 测试
docker exec -it neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025 -d neo4j

# 重启容器
docker restart neo4j-claude-mcp
```

#### Redis 连接超时
```bash
# 检查 Redis 容器
docker ps | grep redis-claude-mcp

# 测试连接
docker exec -it redis-claude-mcp redis-cli -a claude_redis_2025 ping

# 查看所有键
docker exec -it redis-claude-mcp redis-cli -a claude_redis_2025 KEYS "geo:*"

# 重启容器
docker restart redis-claude-mcp
```

#### TypeScript 类型错误
```bash
# 清理缓存
rm -rf node_modules/.vite
rm -rf dist

# 重新安装依赖
npm install

# 运行类型检查
npm run type-check

# 如果持续报错，检查 tsconfig.json
```

#### Playwright 测试失败
```bash
# 确保浏览器已安装
npx playwright install

# 更新 Playwright
npm install -D @playwright/test@latest

# 清理旧报告
rm -rf playwright-report test-results

# 调试模式运行
npx playwright test --debug
```

## 环境变量配置

### 前端环境变量

创建 `frontend/.env`：
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=GEO Platform
VITE_APP_VERSION=1.0.0
```

**使用方式**：
```typescript
const API_URL = import.meta.env.VITE_API_BASE_URL;
```

### 后端环境变量

创建 `backend/.env`：
```bash
# 应用配置
APP_NAME=GEO Platform API
APP_VERSION=1.0.0
DEBUG=True

# 数据库连接
POSTGRES_HOST=localhost
POSTGRES_PORT=5437
POSTGRES_USER=claude
POSTGRES_PASSWORD=claude_dev_2025
POSTGRES_DB=claude_dev

NEO4J_URI=neo4j://localhost:7688
NEO4J_USER=neo4j
NEO4J_PASSWORD=claude_neo4j_2025

REDIS_HOST=localhost
REDIS_PORT=6382
REDIS_PASSWORD=claude_redis_2025

# CORS 配置
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT 配置（未启用）
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**使用方式**：
```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "GEO Platform API"
    postgres_host: str
    postgres_port: int

    class Config:
        env_file = ".env"

settings = Settings()
```

## 部署指南

### 前端部署（Vite 静态站点）

```bash
# 构建生产版本
cd frontend
npm run build

# 输出目录：dist/
# 部署到静态托管服务（Vercel, Netlify, Cloudflare Pages）

# 预览构建结果
npm run preview
```

**Nginx 配置示例**：
```nginx
server {
    listen 80;
    server_name geo-platform.example.com;
    root /var/www/geo-platform/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

### 后端部署（FastAPI + Uvicorn）

**使用 Gunicorn + Uvicorn Workers**：
```bash
# 安装 Gunicorn
pip install gunicorn

# 启动
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

**Systemd 服务配置**（`/etc/systemd/system/geo-api.service`）：
```ini
[Unit]
Description=GEO Platform API
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/opt/geo-platform/backend
Environment="PATH=/opt/geo-platform/backend/venv/bin"
ExecStart=/opt/geo-platform/backend/venv/bin/gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```

**启动服务**：
```bash
sudo systemctl daemon-reload
sudo systemctl enable geo-api
sudo systemctl start geo-api
sudo systemctl status geo-api
```

## 相关文档

- `frontend/CLAUDE.md` - 前端专属开发指南
- `DATA-ARCHITECTURE.md` - 三层数据架构详解
- `FRONTEND-FIRST-ROADMAP.md` - 前端优先开发路线图
- `QUICKSTART-FRONTEND.md` - 10 分钟前端快速启动
- `AUTOMATION-ROADMAP.md` - 自动化开发与 MCP 集成
- `backend/README.md` - 后端 API 文档

## 贡献指南

### Git 工作流

```bash
# 功能开发分支
git checkout -b feature/new-feature

# 提交代码
git add .
git commit -m "feat: add new feature"

# 合并到主分支
git checkout main
git merge feature/new-feature

# 推送到远程
git push origin main
```

### Commit Message 规范

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式（不影响代码运行）
refactor: 重构（既不是新增功能，也不是修复 Bug）
perf: 性能优化
test: 增加测试
chore: 构建过程或辅助工具的变动
```

### Code Review Checklist

- [ ] 代码符合 TypeScript/Python 类型规范
- [ ] 添加了必要的单元测试
- [ ] API 文档已更新（Swagger/ReDoc）
- [ ] 没有硬编码的敏感信息
- [ ] 遵循 Tailwind CSS 样式规范
- [ ] 可访问性标准（ARIA 标签、语义化 HTML）
- [ ] 性能优化（避免不必要的重渲染、N+1 查询）
- [ ] 错误处理完善（前端 Error Boundary，后端异常捕获）

---

**注意**：本文档随项目演进持续更新。如有疑问，请查阅相关专项文档或运行 `npm run verify`/`pytest` 验证环境配置。
