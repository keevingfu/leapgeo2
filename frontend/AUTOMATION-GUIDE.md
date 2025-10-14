# 🚀 Leap GEO2 项目自动化开发完整指南

基于全局 CLAUDE.md 配置的综合自动化开发方案

---

## 📋 目录

1. [核心能力清单](#核心能力清单)
2. [自动化开发工作流](#自动化开发工作流)
3. [MCP 服务器能力矩阵](#mcp-服务器能力矩阵)
4. [实战场景：Leap GEO2 完整开发](#实战场景leap-geo2-完整开发)
5. [最佳实践和技巧](#最佳实践和技巧)

---

## 📦 核心能力清单

### 🎯 1. Context Engineering（上下文工程）

**位置**: `/Users/cavin/Context-Engineering-Intro`

**核心命令**:
```bash
/generate-prp [feature-file]  # 生成产品需求提示文档
/execute-prp [prp-file]       # 执行 PRP 实现功能
```

**工作流程**:
```
INITIAL.md (需求)
  ↓
/generate-prp (分析+规划)
  ↓
PRPs/feature.md (实施蓝图)
  ↓
/execute-prp (自动实现+验证)
  ↓
完成功能 + 测试报告
```

**适用场景**:
- ✅ 新功能模块开发
- ✅ 复杂组件重构
- ✅ API 集成
- ✅ 数据库 Schema 设计

---

### 🧠 2. BMAD 方法（17个专业命令）

**SuperClaude 命令目录**: `/Users/cavin/.claude/commands/sc/`

#### 分析与设计
```bash
/sc:analyze       # 代码质量、安全、性能分析
/sc:design        # 系统架构和 API 设计
/sc:load          # 加载和分析项目上下文
/sc:explain       # 代码和概念解释
```

#### 开发与实现
```bash
/sc:implement     # 功能实现（支持 MCP 集成）
/sc:improve       # 系统代码改进
/sc:cleanup       # 清理死代码
/sc:build         # 构建、编译、打包
```

#### 测试与质量
```bash
/sc:test          # 执行测试并生成报告
/sc:troubleshoot  # 诊断和解决问题
```

#### 文档与协作
```bash
/sc:document      # 创建聚焦文档
/sc:index         # 生成项目文档索引
/sc:git           # Git 操作（智能提交消息）
```

#### 项目管理
```bash
/sc:workflow      # 从 PRD 生成实施工作流
/sc:estimate      # 开发时间估算
/sc:task          # 执行复杂任务（持久化）
/sc:spawn         # 将任务分解为协调子任务
```

---

### 🔧 3. BMAD 角色代理（10个专业角色）

**位置**: `/Users/cavin/Context-Engineering-Intro/.bmad-core/`

```bash
/analyst              # 市场研究和需求分析
/architect            # 系统架构和设计
/pm                   # 项目管理和规划
/po                   # 产品负责人（愿景和优先级）
/dev                  # 开发实施
/qa                   # 质量保证和测试
/sm                   # Scrum Master（敏捷流程管理）
/ux-expert            # UX/UI 设计专家
/bmad-orchestrator    # 工作流协调
/bmad-master          # 复杂任务编排
```

---

## 🗄️ MCP 服务器能力矩阵

### 数据层（6个数据库）

| 数据库 | 端口 | 用途 | 启动命令 |
|--------|------|------|----------|
| **PostgreSQL** | 5437 | 关系型数据（用户、订单、内容元数据） | `docker start postgres-claude-mcp` |
| **MongoDB** | 27018 | 文档数据（原始内容、JSON配置） | `docker start mongodb-claude-mcp` |
| **Neo4j** | 7688/7475 | 知识图谱（产品-特性-场景关系） | `docker start neo4j-claude-mcp` |
| **Redis** | 6382 | 缓存和队列（任务队列、会话） | `docker start redis-claude-mcp` |
| **SQLite** | - | 本地轻量数据库 | 内置 |
| **MinIO** | 9000/9001 | S3对象存储（524GB可用） | `cd ~/minio-setup && docker compose up -d` |

**连接信息**: 所有凭证存储在 `~/.mcp.env`（权限600）

---

### AI 增强层（2个核心能力）

#### 🧠 Sequential Thinking（结构化推理）
```javascript
// 用途：优化算法、分析数据模式、策略推荐
const insights = await sequentialThinking.analyze({
  task: "分析高 Citation Rate 内容的共同特征",
  data: topPerformingContent
});
```

#### 💾 Memory（持久化知识图谱）
```javascript
// 用途：跨项目经验积累、最佳实践存储
await memory.save({
  topic: "GEO Platform Best Practices",
  insights: ["策略A提升32%转化", "平台B响应时间优化"]
});

const learned = await memory.recall("Content Strategy");
```

---

### Web 自动化层（3个强大工具）

#### 🕷️ Firecrawl（自建爬虫服务）
**端点**: `http://localhost:3002`
**用途**: 抓取 AI 平台引用数据

```javascript
// 批量爬取 8 个 AI 平台的 Citation 数据
const platforms = ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'];
for (const url of platformUrls) {
  const data = await firecrawl.scrape({
    url,
    extract: ['citations', 'sources', 'positions']
  });
}
```

**管理界面**: http://localhost:3002/admin/@/queues

#### 🤖 Puppeteer（浏览器自动化）
```javascript
// E2E 测试、自动发布内容到9个平台
await puppeteer.navigate('https://youtube.com');
await puppeteer.login(credentials);
await puppeteer.publishContent(script);
```

#### 🔍 Chrome DevTools
- 性能分析
- 网络请求调试
- 内存泄漏检测

---

### 协作与文档层（3个服务）

#### 📝 Feishu（飞书）- 中文文档利器
```javascript
// 自动生成周报（含 Mermaid 图表）
await feishu.createDocument({
  title: "GEO 平台周报 - Week 42",
  content: `
    ## Citation Rate 趋势
    \`\`\`mermaid
    graph LR
      A[Week 40: 28%] --> B[Week 42: 32%]
    \`\`\`

    ## 本周进展
    - ✅ Neo4j 知识图谱集成完成
    - ✅ 新增 Eufy 项目数据
  `
});
```

**功能**:
- Mermaid 图表（流程图、时序图、脑图）
- LaTeX 数学公式
- 表格创建和编辑
- 批量内容生成

#### 📚 Notion
- API 文档管理
- 项目需求文档
- 知识库

#### 💬 Slack
- Citation Rate 异常告警
- 每日数据摘要推送
- 团队协作通知

---

### 版本控制与 DevOps（2个）

#### 🐙 GitHub
```javascript
// 自动创建 Issue、PR 审查
await github.createIssue({
  title: "优化 Prompt 评分算法",
  body: "当前算法准确率85%，目标提升至92%"
});
```

#### 🦊 GitLab
- CI/CD 流水线集成
- Merge Request 管理

---

### UI 生成层（1个黑科技）

#### 🎨 Magic UI
```javascript
// AI 快速生成 Dashboard 组件
const component = await magicUI.generate({
  type: "dashboard",
  title: "Citation Tracking Dashboard",
  metrics: ["Citation Rate", "Platform Coverage", "Content Score"],
  charts: ["line", "bar", "pie"],
  style: "tailwind"
});
```

---

### 监控调试层（1个）

#### 🚨 Sentry
- 前端错误追踪
- 性能监控
- 用户行为分析

---

## 🎯 自动化开发工作流

### 工作流 1: 快速原型开发（Context Engineering）

**适用**: 新功能、新模块、概念验证

```bash
# 步骤 1: 创建需求文档
cat > INITIAL.md << EOF
# FEATURE
实现 Knowledge Graph 可视化组件，支持拖拽、缩放、节点搜索

# EXAMPLES
- 参考 D3.js Force Layout
- 参考 Cytoscape.js

# DOCUMENTATION
- Neo4j 可视化最佳实践: https://neo4j.com/docs/...
- React Force Graph 文档: https://...

# OTHER CONSIDERATIONS
- 需要支持 10,000+ 节点
- 实时更新（WebSocket）
- 移动端响应式
EOF

# 步骤 2: 生成实施蓝图
/generate-prp INITIAL.md
# 输出: PRPs/knowledge-graph-viz.md（包含完整上下文）

# 步骤 3: 自动实现
/execute-prp PRPs/knowledge-graph-viz.md
# 自动完成：
# - 代码实现
# - 单元测试
# - 集成测试
# - 文档生成
```

**优势**:
- ✅ 一次性成功率高（提供充足上下文）
- ✅ 自动验证（内置检查点）
- ✅ 完整文档输出

---

### 工作流 2: 全栈功能开发（BMAD + MCP）

**适用**: 涉及前后端、数据库、第三方集成的完整功能

**场景**: 开发 AI Citation 追踪系统

```bash
# 步骤 1: 需求分析
/analyst --research "AI Citation 追踪技术方案"
# 输出: 市场调研报告、竞品分析

# 步骤 2: 架构设计
/architect --design "Citation Tracking System"
# 输出: 系统架构图、API 接口设计、数据库 Schema

# 步骤 3: 项目规划
/pm --create-prd "Citation Tracking MVP"
# 输出: 产品需求文档、功能优先级

# 步骤 4: 创建用户故事
/sm --create-stories
# 输出: Sprint 规划、User Stories

# 步骤 5: 开发实施（使用 MCP 服务）
/sc:implement --context "Citation Tracking Backend"
# 自动完成：
# - 使用 Firecrawl 抓取 AI 平台数据
# - 使用 PostgreSQL 存储引用记录
# - 使用 Neo4j 构建引用关系图
# - 使用 Redis 缓存实时统计

# 步骤 6: 测试
/qa --test "Citation Tracking"
# 输出: 测试报告、覆盖率分析

# 步骤 7: 文档生成
/sc:document --output "API.md"
# Feishu 自动生成中文文档
```

---

### 工作流 3: 数据驱动开发（MCP 数据库组合）

**场景**: Leap GEO2 数据层完整实现

```javascript
// ========== 第一步：数据建模 ==========

// PostgreSQL: 业务数据表
await postgresql.execute(`
  CREATE TABLE projects (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    citation_rate DECIMAL,
    status VARCHAR
  );

  CREATE TABLE prompts (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR REFERENCES projects(id),
    text TEXT NOT NULL,
    score INTEGER,
    citation_rate DECIMAL
  );

  CREATE TABLE citations (
    id SERIAL PRIMARY KEY,
    platform VARCHAR,
    prompt_id INTEGER REFERENCES prompts(id),
    source VARCHAR,
    position INTEGER,
    detected_at TIMESTAMP
  );
`);

// Neo4j: 知识图谱（产品-特性-用户群关系）
await neo4j.execute(`
  CREATE (b:Brand {name: 'SweetNight'})
  CREATE (p:Product {name: 'CoolNest Mattress'})
  CREATE (f:Feature {name: 'Cooling Technology'})
  CREATE (pr:Problem {name: 'Hot Sleep'})
  CREATE (u:UserGroup {name: 'Athletes'})

  CREATE (b)-[:HAS_PRODUCT]->(p)
  CREATE (p)-[:HAS_FEATURE]->(f)
  CREATE (f)-[:SOLVES]->(pr)
  CREATE (u)-[:HAS_PROBLEM]->(pr)
`);

// MongoDB: 原始内容数据（AI 平台响应 JSON）
await mongodb.insertMany('raw_responses', [
  {
    platform: 'ChatGPT',
    prompt: 'best cooling mattress',
    full_response: { /* 完整响应数据 */ },
    timestamp: new Date()
  }
]);

// Redis: 实时统计缓存
await redis.set('citation_count:prompt_123', 456);
await redis.zadd('citation_leaderboard', 92, 'prompt_123');

// MinIO: 存储生成的内容文件
await minio.upload('content-library/youtube-scripts/script-001.txt', scriptContent);


// ========== 第二步：自动化数据流 ==========

// 使用 Firecrawl 爬取 AI 平台
const platforms = ['ChatGPT', 'Claude', 'Perplexity'];
for (const platform of platforms) {
  const citations = await firecrawl.scrape({
    url: platform.searchUrl,
    query: prompt.text
  });

  // 存储到 PostgreSQL
  await postgresql.insert('citations', {
    platform: platform.name,
    prompt_id: prompt.id,
    source: citations.source,
    position: citations.position
  });

  // 更新 Neo4j 关系
  await neo4j.execute(`
    MATCH (p:Prompt {id: $promptId})
    CREATE (c:Citation {platform: $platform, source: $source})
    CREATE (p)-[:CITED_BY]->(c)
  `, { promptId: prompt.id, platform: platform.name, source: citations.source });

  // 更新 Redis 缓存
  await redis.incr(`citation_count:${prompt.id}`);
}


// ========== 第三步：数据分析与可视化 ==========

// Sequential Thinking: 智能分析
const insights = await sequentialThinking.analyze({
  task: "识别高 Citation Rate 内容的共同特征",
  data: {
    topPrompts: await postgresql.query(`
      SELECT * FROM prompts
      WHERE citation_rate > 0.30
      ORDER BY citation_rate DESC
      LIMIT 20
    `),
    knowledgeGraph: await neo4j.query(`
      MATCH (p:Prompt)-[:RELATED_TO]->(f:Feature)
      WHERE p.citation_rate > 0.30
      RETURN p, f
    `)
  }
});

// Memory: 存储学到的策略
await memory.save({
  topic: "High Citation Rate Strategies",
  insights: insights.recommendations
});


// ========== 第四步：自动化报告生成 ==========

// Feishu: 生成可视化周报
await feishu.createDocument({
  title: `Citation Tracking Report - ${new Date().toISOString().split('T')[0]}`,
  content: `
    ## 📊 本周数据概览

    \`\`\`mermaid
    graph TD
      A[总 Citations: 1,234] --> B[Top Platform: YouTube 456]
      A --> C[Average Position: 2.3]
      B --> D[增长率: +15%]
    \`\`\`

    ## 🔥 Top Performing Content
    ${topPrompts.map(p => `- ${p.text}: ${p.citation_rate * 100}%`).join('\n')}

    ## 💡 AI 洞察
    ${insights.recommendations.map(r => `- ${r}`).join('\n')}

    ## 📈 趋势分析
    | 平台 | Citations | 增长率 |
    |------|-----------|--------|
    | YouTube | 456 | +23% |
    | Medium | 312 | +18% |
  `
});

// Slack: 发送告警
if (citationRate < 0.20) {
  await slack.notify({
    channel: "#geo-alerts",
    message: `⚠️ Citation Rate 低于阈值: ${citationRate * 100}%`
  });
}
```

---

### 工作流 4: 智能编排（BMAD Orchestrator）

**适用**: 复杂多步骤任务，需要多角色协作

```bash
# 一键启动完整功能开发流程
/bmad-orchestrator --workflow "full-stack-feature" --feature "AI Content Generator"

# 自动执行：
# 1. /analyst: 市场调研
# 2. /architect: 技术方案设计
# 3. /ux-expert: UI/UX 设计
# 4. /dev: 前端+后端实现
# 5. /qa: 自动化测试
# 6. /sc:document: 文档生成
# 7. /sc:git: 提交代码 + 创建 PR

# 输出：完整的可部署功能 + 文档 + 测试报告
```

---

## 🏗️ 实战场景：Leap GEO2 完整开发

### 场景 1: 知识图谱后端 API 开发

```bash
# ========== 方法 A: Context Engineering ==========

# 1. 创建 INITIAL.md
cat > INITIAL-knowledge-graph-api.md << EOF
# FEATURE
实现 Neo4j 知识图谱 CRUD API，支持实体管理和关系查询

# EXAMPLES
- 参考 index.tsx 中的 knowledgeGraphData 结构
- 参考 Portal.tsx 的 KnowledgeGraph 组件

# DOCUMENTATION
- Neo4j Cypher 查询语言: https://neo4j.com/docs/cypher-manual/
- FastAPI 文档: https://fastapi.tiangolo.com/

# OTHER CONSIDERATIONS
- 使用 Neo4j MCP（端口 7688）
- 使用 PostgreSQL 存储元数据
- 需要 GraphQL 接口
- 单元测试覆盖率 > 80%
EOF

# 2. 生成 PRP
/generate-prp INITIAL-knowledge-graph-api.md

# 3. 执行实现
/execute-prp PRPs/knowledge-graph-api.md


# ========== 方法 B: BMAD 命令 ==========

# 1. 设计 API
/sc:design --feature "Knowledge Graph CRUD API"

# 2. 实现
/sc:implement --context "Use Neo4j MCP + FastAPI"

# 3. 测试
/sc:test --coverage

# 4. 文档
/sc:document --output "docs/knowledge-graph-api.md"
```

---

### 场景 2: Citation Tracking 完整实现

```bash
# 使用 BMAD 角色编排

# 步骤 1: 需求分析
/analyst --research "AI Citation Tracking Solutions"

# 步骤 2: 架构设计
/architect --design "Citation Tracking System with Firecrawl + PostgreSQL + Neo4j"

# 步骤 3: 生成工作流
/sc:workflow --from-prd "Citation Tracking PRD.md"

# 步骤 4: 实施（手动 + 自动结合）
/sc:implement --task "Firecrawl Integration"
/sc:implement --task "Database Schema"
/sc:implement --task "Citation Analysis API"

# 步骤 5: 端到端测试
/sc:test --e2e --platforms "ChatGPT,Claude,Perplexity"

# 步骤 6: 部署文档
/sc:document --type "deployment-guide"
```

**完整代码示例**（自动生成）:

```python
# backend/services/citation_tracker.py
import asyncio
from firecrawl import FirecrawlClient
from databases import PostgreSQL, Neo4j, Redis

class CitationTracker:
    def __init__(self):
        self.firecrawl = FirecrawlClient("http://localhost:3002")
        self.pg = PostgreSQL("postgresql://claude:***@localhost:5437/claude_dev")
        self.neo4j = Neo4j("neo4j://localhost:7688")
        self.redis = Redis("redis://:***@localhost:6382")

    async def track_citations(self, prompt_id: int):
        """Track citations across 8 AI platforms"""
        platforms = [
            {"name": "ChatGPT", "url": "https://chat.openai.com/..."},
            {"name": "Claude", "url": "https://claude.ai/..."},
            {"name": "Perplexity", "url": "https://perplexity.ai/..."},
            # ... 5 more platforms
        ]

        tasks = [
            self._scrape_platform(platform, prompt_id)
            for platform in platforms
        ]
        results = await asyncio.gather(*tasks)

        # Aggregate and analyze
        citation_rate = self._calculate_rate(results)
        await self.redis.set(f"citation_rate:{prompt_id}", citation_rate)

        return {"citation_rate": citation_rate, "details": results}

    async def _scrape_platform(self, platform, prompt_id):
        """Scrape single platform using Firecrawl"""
        prompt = await self.pg.query("SELECT text FROM prompts WHERE id = $1", prompt_id)

        response = await self.firecrawl.scrape({
            "url": platform["url"],
            "query": prompt["text"],
            "extract": ["citations", "sources", "positions"]
        })

        # Store to PostgreSQL
        citation_id = await self.pg.insert("citations", {
            "platform": platform["name"],
            "prompt_id": prompt_id,
            "source": response["source"],
            "position": response["position"],
            "detected_at": "NOW()"
        })

        # Update Neo4j relationship
        await self.neo4j.execute("""
            MATCH (p:Prompt {id: $prompt_id})
            CREATE (c:Citation {
                id: $citation_id,
                platform: $platform,
                source: $source
            })
            CREATE (p)-[:CITED_BY]->(c)
        """, {
            "prompt_id": prompt_id,
            "citation_id": citation_id,
            "platform": platform["name"],
            "source": response["source"]
        })

        return response

    def _calculate_rate(self, results):
        """Calculate overall citation rate"""
        total = len(results)
        cited = sum(1 for r in results if r.get("source"))
        return cited / total if total > 0 else 0.0
```

---

### 场景 3: 前端组件快速生成

```bash
# 使用 Magic UI 快速生成组件

# 1. 生成 Dashboard 组件
/sc:implement --with-magic-ui "Citation Rate Dashboard"

# Magic UI 自动生成：
# - Line Chart（Citation 趋势）
# - Bar Chart（平台对比）
# - KPI Cards（关键指标）
# - Data Table（详细列表）

# 2. 集成到 Portal.tsx
# 自动添加路由和导航

# 3. 测试
/sc:test --component "CitationDashboard"
```

---

### 场景 4: 自动化部署管线

```bash
# 使用 MinIO + GitHub Actions

# 步骤 1: 构建前端
npm run build

# 步骤 2: 上传到 MinIO
mc cp -r dist/ local/leapgeo2-frontend/v1.0.0/

# 步骤 3: 备份数据库
pg_dump -h localhost -p 5437 -U claude claude_dev | gzip > backup.sql.gz
mc cp backup.sql.gz local/backups/$(date +%Y%m%d)/

# 步骤 4: 生成部署报告
/sc:document --type "deployment-report" --version "1.0.0"

# 步骤 5: 通知团队
# Slack: 发送部署通知
# Feishu: 生成部署日志文档
```

---

## 🎓 最佳实践和技巧

### 1. 选择合适的工作流

| 场景 | 推荐工作流 | 原因 |
|------|-----------|------|
| 🆕 全新功能模块 | Context Engineering | 一次性成功率高，充足上下文 |
| 🏗️ 复杂全栈功能 | BMAD 角色编排 | 多角色协作，端到端覆盖 |
| ⚡ 快速原型 | Magic UI + /sc:implement | 快速生成 + 迭代 |
| 🐛 问题诊断 | /sc:troubleshoot + Sequential Thinking | 结构化推理 + 智能分析 |
| 📊 数据分析 | Sequential Thinking + Memory | AI 洞察 + 经验积累 |

---

### 2. MCP 服务器组合策略

#### 组合 A: 知识密集型应用
```
Neo4j (知识图谱)
  + Sequential Thinking (智能推理)
  + Memory (经验积累)
  + Feishu (中文文档)
```

#### 组合 B: 数据爬虫应用
```
Firecrawl (网页抓取)
  + PostgreSQL (结构化存储)
  + MongoDB (原始数据)
  + Redis (任务队列)
```

#### 组合 C: 全栈开发
```
PostgreSQL (业务数据)
  + Neo4j (关系数据)
  + Redis (缓存)
  + MinIO (文件存储)
  + GitHub (版本控制)
  + Slack (协作通知)
```

---

### 3. 性能优化技巧

#### 使用 Redis 缓存
```javascript
// 缓存 Citation Rate 计算结果（1小时）
const cacheKey = `citation_rate:${projectId}:${date}`;
let rate = await redis.get(cacheKey);
if (!rate) {
  rate = await calculateCitationRate(projectId, date);
  await redis.setex(cacheKey, 3600, rate);
}
```

#### 使用 MinIO CDN
```javascript
// 将前端构建产物上传到 MinIO，配置为静态网站
mc cp -r dist/ local/static-sites/leapgeo2/
mc policy set download local/static-sites/leapgeo2
// 访问: http://localhost:9000/static-sites/leapgeo2/index.html
```

#### 批量数据导入
```javascript
// 使用 Neo4j LOAD CSV 批量导入节点
await neo4j.execute(`
  LOAD CSV WITH HEADERS FROM 'file:///entities.csv' AS row
  CREATE (:Entity {
    id: row.id,
    type: row.type,
    name: row.name
  })
`);
```

---

### 4. 调试和监控

#### 使用 Sentry 监控前端错误
```javascript
// 配置 Sentry
Sentry.init({
  dsn: "https://...",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0
});

// 自动捕获所有错误
```

#### 使用 Slack 告警
```javascript
// Citation Rate 异常告警
if (citationRate < 0.20) {
  await slack.notify({
    channel: "#geo-alerts",
    message: `⚠️ 项目 ${projectName} Citation Rate 低于阈值: ${citationRate * 100}%`,
    priority: "high"
  });
}
```

#### 使用 Firecrawl 监控任务队列
访问: http://localhost:3002/admin/@/queues

---

### 5. 文档自动化

#### 代码文档
```bash
# 自动生成 API 文档
/sc:document --type "api-reference" --output "docs/api.md"

# 生成中文版本（Feishu）
/sc:document --type "api-reference" --language "zh" --platform "feishu"
```

#### 架构文档
```bash
# 生成系统架构图（Mermaid）
/sc:document --type "architecture" --include-mermaid
```

#### 部署文档
```bash
# 生成部署指南
/sc:document --type "deployment-guide" --environment "production"
```

---

### 6. 团队协作模式

#### 模式 A: 异步协作
```
开发者 A: 实现功能（使用 /sc:implement）
  ↓
自动提交到 GitHub（使用 /sc:git）
  ↓
GitHub Actions: 运行测试
  ↓
Slack 通知: 测试结果
  ↓
开发者 B: Code Review
  ↓
合并到 main 分支
  ↓
自动部署 + Feishu 文档更新
```

#### 模式 B: 同步结对编程
```
开发者 A: /bmad-orchestrator --workflow "feature-x"
  ↓
实时协作编辑（共享终端）
  ↓
Sequential Thinking: 实时分析和建议
  ↓
Memory: 记录决策和经验
  ↓
完成后自动生成文档
```

---

### 7. 数据备份策略

#### 自动化备份脚本
```bash
#!/bin/bash
# backup-all.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="local/backups/$DATE"

# 备份 PostgreSQL
pg_dump -h localhost -p 5437 -U claude claude_dev | gzip > pg-backup.sql.gz
mc cp pg-backup.sql.gz $BACKUP_DIR/

# 备份 MongoDB
mongodump --uri="mongodb://claude:***@localhost:27018" --gzip --archive=mongo-backup.gz
mc cp mongo-backup.gz $BACKUP_DIR/

# 备份 Neo4j
neo4j-admin dump --database=neo4j --to=neo4j-backup.dump
mc cp neo4j-backup.dump $BACKUP_DIR/

# 备份 Redis
redis-cli -h localhost -p 6382 -a claude_redis_2025 --rdb redis-backup.rdb
mc cp redis-backup.rdb $BACKUP_DIR/

# 通知
slack-notify "✅ 数据备份完成: $BACKUP_DIR"
```

#### 定时任务
```bash
# crontab -e
0 2 * * * /path/to/backup-all.sh  # 每天凌晨2点备份
```

---

### 8. 成本优化

#### 使用自建服务替代付费 API
- ✅ Firecrawl（自建） vs Apify（付费）
- ✅ MinIO（自建） vs AWS S3（付费）
- ✅ PostgreSQL/MongoDB/Neo4j（Docker本地） vs 云数据库（付费）

**节省成本**: ~$500/月

---

## 🚀 快速启动检查清单

### 环境准备
```bash
# 1. 启动所有 Docker 数据库
docker start postgres-claude-mcp mongodb-claude-mcp neo4j-claude-mcp redis-claude-mcp

# 2. 启动 Firecrawl
cd /Users/cavin/firecrawl && docker compose up -d

# 3. 启动 MinIO
cd ~/minio-setup && docker compose up -d

# 4. 验证 MCP 服务
source ~/.mcp-load-env.sh
echo $POSTGRES_CONNECTION_STRING  # 应显示连接字符串

# 5. 测试数据库连接
psql $POSTGRES_CONNECTION_STRING -c "SELECT 1"
```

### 开发环境
```bash
# 1. 加载项目上下文
/sc:load

# 2. 分析当前项目
/sc:analyze --scope "src/"

# 3. 生成项目索引
/sc:index
```

---

## 📚 学习资源

### Context Engineering
- 文档: `/Users/cavin/Context-Engineering-Intro/README.md`
- 示例: `/Users/cavin/Context-Engineering-Intro/examples/`

### BMAD 方法
- 命令目录: `/Users/cavin/.claude/commands/sc/`
- 配置: `/Users/cavin/Context-Engineering-Intro/.bmad-core/`

### MCP 服务器
- 全局配置: `/Users/cavin/.mcp.json`
- 环境变量: `/Users/cavin/.mcp.env`
- 文档: `/Users/cavin/.mcp-setup-README.md`

### MinIO
- 文档: `~/minio-setup/README.md`
- 快速开始: `~/minio-setup/QUICKSTART.md`
- 示例代码: `~/minio-setup/examples/`

---

## 🎯 下一步行动

### 立即可做的事
1. ✅ 启动所有 Docker 服务
2. ✅ 运行 `/sc:load` 加载项目上下文
3. ✅ 创建第一个 INITIAL.md 需求文档
4. ✅ 使用 `/generate-prp` 生成实施蓝图

### 本周目标
- 🎯 完成 Knowledge Graph API 后端
- 🎯 集成 Firecrawl Citation 追踪
- 🎯 实现 PostgreSQL + Neo4j 数据同步
- 🎯 部署到 MinIO 静态网站

### 本月目标
- 🚀 完整的 Leap GEO2 平台上线
- 📊 Citation Rate > 28% 达成
- 📚 完整的中文技术文档（Feishu）
- 🤖 自动化 CI/CD 流水线

---

## 💡 专家提示

### 提示 1: 永远从小处开始
```bash
# ❌ 错误做法
/execute-prp "完整的 GEO 平台开发.md"  # 太复杂

# ✅ 正确做法
/execute-prp "Knowledge Graph 单一 API 端点.md"  # 小而完整
```

### 提示 2: 充分利用 Memory
```javascript
// 每次成功实施后，记录经验
await memory.save({
  topic: "React Performance Optimization",
  context: {
    problem: "Dashboard 渲染慢",
    solution: "使用 React.memo + useMemo",
    improvement: "渲染时间从 500ms 降至 80ms"
  }
});

// 未来可以检索
const tips = await memory.recall("Performance Optimization");
```

### 提示 3: 自动化重复任务
```bash
# 创建自定义命令
cat > ~/.claude/commands/deploy-frontend.sh << 'EOF'
#!/bin/bash
npm run build
mc mirror dist/ local/leapgeo2/latest/
slack-notify "🚀 前端已部署到 MinIO"
EOF

chmod +x ~/.claude/commands/deploy-frontend.sh
```

### 提示 4: 使用 Sequential Thinking 做决策
```javascript
// 技术方案选型
const decision = await sequentialThinking.analyze({
  task: "选择知识图谱可视化方案",
  options: ["D3.js", "Cytoscape.js", "vis.js"],
  criteria: ["性能", "学习曲线", "移动端支持", "社区活跃度"],
  constraints: ["需支持 10,000+ 节点", "React 集成"]
});
```

---

**最后更新**: 2025-10-11
**版本**: 1.0
**作者**: Claude Code (基于全局 CLAUDE.md 配置)

🎉 **开始你的自动化开发之旅吧！**
