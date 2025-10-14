# GEO Platform 自动化开发路线图

## 📋 项目现状

**当前状态**: 前端原型 + 设计文档
**目标状态**: 生产级全栈应用
**开发周期**: 14 天（使用自动化工具链）
**技术栈**: React + FastAPI + Neo4j + PostgreSQL + Redis

---

## 🎯 三阶段开发计划

### Phase 1: 数据层基础 (Day 1-5)
**目标**: 建立数据基础设施，迁移 Mock 数据

### Phase 2: 后端 API (Day 6-10)
**目标**: 开发 RESTful + GraphQL API，连接前后端

### Phase 3: AI 增强 (Day 11-14)
**目标**: 集成 AI 功能，实现核心竞争力

---

## 📅 Phase 1: 数据层基础（Day 1-5）

### **Day 1: 环境准备与 PostgreSQL 初始化**

#### 步骤 1: 启动数据库服务
```bash
# 启动所有 Docker 容器
docker start postgres-claude-mcp mongodb-claude-mcp neo4j-claude-mcp redis-claude-mcp

# 验证服务状态
docker ps | grep claude-mcp

# 访问管理界面
# Neo4j: http://localhost:7475
# PostgreSQL: psql -h localhost -p 5437 -U claude -d claude_dev
```

#### 步骤 2: 使用 Context Engineering 生成数据库迁移脚本
```bash
# 已创建 INITIAL-PHASE1.md，现在生成 PRP
/generate-prp INITIAL-PHASE1.md

# 这将输出: PRPs/database-foundation.md
# 包含:
# - 完整的 PostgreSQL Schema
# - Neo4j 图模型
# - Redis 缓存策略
# - 数据迁移脚本
# - 测试用例
```

#### 步骤 3: 自动执行实现
```bash
/execute-prp PRPs/database-foundation.md

# 自动执行：
# ✅ 连接 PostgreSQL MCP (port 5437)
# ✅ 创建所有表和索引
# ✅ 解析 index.tsx 提取 Mock 数据
# ✅ 批量插入 projects、prompts、citations
# ✅ 创建外键约束
# ✅ 运行数据验证测试
```

#### 预期产出
- ✅ PostgreSQL 数据库 Schema 完成
- ✅ 3 个项目 + 290 个 Prompts 迁移完成
- ✅ 所有引用数据（citations）导入
- ✅ 数据完整性验证通过

---

### **Day 2: Neo4j 知识图谱构建**

#### 步骤 1: 使用 Neo4j MCP 创建图模型
```bash
# 使用 BMAD 架构代理设计图模型
/architect --design "Neo4j Knowledge Graph for GEO Platform"

# 输出:
# - 节点类型定义 (Brand, Product, Feature, Problem, Scenario, UserGroup)
# - 关系类型定义 (HAS_PRODUCT, HAS_FEATURE, SOLVES, etc.)
# - Cypher 查询优化建议
```

#### 步骤 2: 迁移知识图谱数据
```javascript
// 使用 /sc:implement 自动生成迁移脚本
/sc:implement --feature "Knowledge Graph Migration from Mock Data"

// 生成的脚本将：
// 1. 读取 index.tsx 中的 knowledgeGraphDataMap
// 2. 为每个项目创建节点
const projects = ['sweetnight', 'eufy', 'hisense'];
for (const projectId of projects) {
  const graph = knowledgeGraphDataMap[projectId];

  // 创建节点
  for (const node of graph.nodes) {
    await neo4j.query(`
      CREATE (n:${node.type} {
        id: $id,
        label: $label,
        project_id: $projectId
      })
    `, { ...node, projectId });
  }

  // 创建关系
  for (const rel of graph.relationships) {
    await neo4j.query(`
      MATCH (a {id: $from, project_id: $projectId})
      MATCH (b {id: $to, project_id: $projectId})
      CREATE (a)-[:${rel.type}]->(b)
    `, { ...rel, projectId });
  }
}
```

#### 步骤 3: 验证图谱数据
```bash
# 使用 /sc:test 运行验证测试
/sc:test --scope "knowledge-graph"

# 测试用例:
# ✅ 所有节点已创建 (预期: 30+ 节点)
# ✅ 所有关系已建立 (预期: 40+ 关系)
# ✅ 图谱查询性能 (<50ms)
# ✅ 跨项目隔离验证
```

#### 预期产出
- ✅ 3 个项目的知识图谱完整创建
- ✅ 节点总数: 30+ (SweetNight: 11, Eufy: 14, Hisense: 6)
- ✅ 关系总数: 40+
- ✅ 图谱可视化验证

---

### **Day 3: Redis 缓存与 MongoDB 集成**

#### 步骤 1: Redis 缓存策略设计
```bash
# 使用 Sequential Thinking 优化缓存策略
# MCP Sequential Thinking 会分析:
# - 哪些数据需要缓存 (Citation Rate 实时统计)
# - 缓存失效策略 (TTL: 1小时)
# - 缓存更新触发条件

# 实现 Redis 缓存层
/sc:implement --feature "Redis Caching for Real-time Statistics"
```

#### 步骤 2: 初始化 Redis 数据
```javascript
// 自动生成的缓存初始化脚本
const projects = await postgresql.query('SELECT * FROM projects');

for (const project of projects) {
  // 缓存项目基础信息
  await redis.set(
    `geo:project:${project.id}:info`,
    JSON.stringify(project),
    'EX', 3600  // 1小时过期
  );

  // 缓存 Citation Rate
  await redis.set(
    `geo:project:${project.id}:citation_rate`,
    project.citation_rate,
    'EX', 1800  // 30分钟过期
  );

  // 初始化排行榜
  await redis.zadd(
    'geo:citation_rate_leaderboard',
    project.citation_rate,
    project.id
  );
}
```

#### 步骤 3: MongoDB 集成（原始内容存储）
```bash
# 使用 MongoDB MCP 存储非结构化数据
/sc:implement --feature "MongoDB Integration for Content Storage"

# 存储内容:
# - AI 平台原始响应 (JSON)
# - 生成的内容草稿
# - 用户交互日志
```

#### 预期产出
- ✅ Redis 缓存层完成
- ✅ 实时统计数据可查询
- ✅ MongoDB 集合创建
- ✅ 缓存命中率测试通过

---

### **Day 4-5: 数据迁移与验证**

#### 完整数据迁移脚本
```bash
# 使用 /sc:spawn 并行执行迁移任务
/sc:spawn --tasks "PostgreSQL Migration, Neo4j Migration, Redis Init, MongoDB Setup"

# 这会创建 4 个并行子任务:
# Task 1: PostgreSQL 数据迁移
# Task 2: Neo4j 图谱构建
# Task 3: Redis 缓存初始化
# Task 4: MongoDB 集合创建
```

#### 数据验证检查清单
```bash
# 使用 /qa 代理执行全面测试
/qa --test "Complete Data Layer"

# 测试项:
# ✅ PostgreSQL: 3 projects, 290 prompts, 500+ citations
# ✅ Neo4j: 30+ nodes, 40+ relationships
# ✅ Redis: All cache keys present
# ✅ MongoDB: Collections created
# ✅ 跨数据库一致性验证
# ✅ 性能基准测试 (查询 <100ms)
```

#### 生成数据报告
```bash
# 使用 Feishu MCP 自动生成中文数据报告
# 报告将包含:
# - 数据迁移统计
# - 数据库性能指标
# - Mermaid 图表可视化
# - 问题与风险列表
```

---

## 📅 Phase 2: 后端 API（Day 6-10）

### **Day 6: FastAPI 项目初始化**

#### 步骤 1: 使用 BMAD 生成后端架构
```bash
# 创建后端需求文档
cat > INITIAL-PHASE2.md << 'EOF'
# PHASE 2: FastAPI Backend for GEO Platform

## FEATURE
Build RESTful + GraphQL API with FastAPI:
- Projects CRUD API
- Prompts Management API
- Knowledge Graph GraphQL API
- Citation Tracking API
- Real-time Statistics API

## EXAMPLES
Reference existing FastAPI projects in ~/Context-Engineering-Intro

## DOCUMENTATION
- FastAPI: https://fastapi.tiangolo.com
- Strawberry GraphQL: https://strawberry.rocks
- Neo4j Python Driver: https://neo4j.com/docs/python-manual

## SUCCESS CRITERIA
- [ ] All REST endpoints documented (OpenAPI)
- [ ] GraphQL schema for knowledge graph queries
- [ ] Database connection pooling
- [ ] Input validation with Pydantic
- [ ] Unit tests coverage >80%
EOF

# 生成后端架构 PRP
/generate-prp INITIAL-PHASE2.md
```

#### 步骤 2: 自动生成 FastAPI 项目结构
```bash
/execute-prp PRPs/fastapi-backend.md

# 自动生成:
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 应用入口
│   ├── config.py               # 配置管理
│   ├── database.py             # 数据库连接
│   ├── models/                 # Pydantic 模型
│   │   ├── project.py
│   │   ├── prompt.py
│   │   └── citation.py
│   ├── routers/                # API 路由
│   │   ├── projects.py
│   │   ├── prompts.py
│   │   ├── citations.py
│   │   └── knowledge_graph.py
│   ├── services/               # 业务逻辑
│   │   ├── project_service.py
│   │   ├── neo4j_service.py
│   │   └── cache_service.py
│   └── graphql/                # GraphQL Schema
│       ├── schema.py
│       ├── types.py
│       └── resolvers.py
├── tests/
├── requirements.txt
└── Dockerfile
```

---

### **Day 7-8: 核心 API 实现**

#### Projects API
```python
# 由 /sc:implement 自动生成

# GET /api/v1/projects
# 使用 PostgreSQL MCP 查询所有项目
@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects():
    projects = await postgresql.query("SELECT * FROM projects")
    return projects

# GET /api/v1/projects/{project_id}
# 组合查询: PostgreSQL + Neo4j + Redis
@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    # 1. 尝试从 Redis 获取缓存
    cached = await redis.get(f"geo:project:{project_id}:full")
    if cached:
        return json.loads(cached)

    # 2. 查询 PostgreSQL 基础数据
    project = await postgresql.query(
        "SELECT * FROM projects WHERE id = $1",
        project_id
    )

    # 3. 查询 Neo4j 知识图谱
    graph = await neo4j.query(f"""
        MATCH (b:Brand {{project_id: '{project_id}'}})-[*]->(n)
        RETURN b, collect(n) as nodes
    """)

    # 4. 组合数据并缓存
    result = {**project, "knowledge_graph": graph}
    await redis.setex(
        f"geo:project:{project_id}:full",
        1800,  # 30分钟
        json.dumps(result)
    )

    return result
```

#### Knowledge Graph GraphQL API
```python
# 使用 Strawberry GraphQL
# 由 /sc:implement 自动生成

@strawberry.type
class KnowledgeNode:
    id: str
    type: str
    label: str
    project_id: str

@strawberry.type
class KnowledgeRelationship:
    from_node: str
    to_node: str
    type: str

@strawberry.type
class Query:
    @strawberry.field
    async def knowledge_graph(
        self,
        project_id: str
    ) -> List[KnowledgeNode]:
        # 使用 Neo4j MCP
        result = await neo4j.query(f"""
            MATCH (n {{project_id: '{project_id}'}})
            RETURN n
        """)
        return result

    @strawberry.field
    async def find_solutions(
        self,
        problem: str,
        project_id: str
    ) -> List[KnowledgeNode]:
        # 智能查询: 根据问题找特性
        result = await neo4j.query(f"""
            MATCH (pr:Problem {{label: '{problem}'}})<-[:SOLVES]-(f:Feature)
            WHERE pr.project_id = '{project_id}'
            RETURN f
        """)
        return result
```

---

### **Day 9: 前后端集成**

#### 步骤 1: 更新前端 API 调用
```bash
# 使用 /sc:improve 重构前端代码
/sc:improve --target "Replace Mock Data with API Calls"

# 自动修改 index.tsx:
# Before:
const projects = projectsData;

# After:
const [projects, setProjects] = useState([]);
useEffect(() => {
  fetch('http://localhost:8000/api/v1/projects')
    .then(r => r.json())
    .then(setProjects);
}, []);
```

#### 步骤 2: API 文档生成
```bash
# FastAPI 自动生成 OpenAPI 文档
# 访问: http://localhost:8000/docs

# 使用 /sc:document 生成额外文档
/sc:document --format "markdown" --output "API.md"

# 使用 Feishu MCP 生成中文 API 文档
# 自动推送到飞书知识库
```

---

### **Day 10: 测试与优化**

#### E2E 测试
```bash
# 使用 Puppeteer MCP 执行 E2E 测试
/sc:test --e2e

# 测试流程:
# 1. 启动后端服务
# 2. 启动前端 Dev Server
# 3. Puppeteer 自动化测试:
#    - 加载项目列表
#    - 切换项目
#    - 查询知识图谱
#    - 查看 Citation 数据
# 4. 生成测试报告
```

#### 性能优化
```bash
# 使用 /sc:analyze 分析性能瓶颈
/sc:analyze --performance

# 自动优化建议:
# ✅ 添加 Redis 缓存层
# ✅ 数据库查询优化 (添加索引)
# ✅ N+1 查询问题修复
# ✅ API 响应压缩
```

---

## 📅 Phase 3: AI 增强（Day 11-14）

### **Day 11-12: Citation Tracking 实现**

#### 步骤 1: 使用 Firecrawl 抓取 AI 平台
```bash
# 启动 Firecrawl 服务
cd /Users/cavin/firecrawl && docker compose up -d

# 创建 Citation Tracking 需求文档
cat > INITIAL-PHASE3.md << 'EOF'
# PHASE 3: AI Citation Tracking System

## FEATURE
Automated citation tracking across 8 AI platforms:
- ChatGPT, Claude, Perplexity, Gemini, Copilot, You.com, Phind, Anthropic

## IMPLEMENTATION
1. Use Firecrawl MCP to scrape AI platform responses
2. Use Sequential Thinking to analyze citation patterns
3. Store results in PostgreSQL + Neo4j
4. Real-time statistics in Redis
5. Slack notifications for anomalies

## SUCCESS CRITERIA
- [ ] Daily scans across 8 platforms
- [ ] Citation detection accuracy >95%
- [ ] Real-time citation rate updates
- [ ] Automated Slack alerts
EOF

/generate-prp INITIAL-PHASE3.md
/execute-prp PRPs/citation-tracking.md
```

#### 步骤 2: Citation 分析流水线
```python
# 自动生成的 Citation Tracking 服务

async def track_citations_for_prompt(prompt_id: int):
    prompt = await get_prompt(prompt_id)

    platforms = [
        'https://chat.openai.com',
        'https://claude.ai',
        'https://perplexity.ai',
        # ... 8个平台
    ]

    for platform_url in platforms:
        # 1. 使用 Firecrawl MCP 抓取
        response = await firecrawl.scrape({
            'url': f"{platform_url}/search?q={prompt.text}",
            'extract': ['citations', 'sources', 'positions']
        })

        # 2. 使用 Sequential Thinking 分析
        analysis = await sequential_thinking.analyze({
            'task': '识别是否引用了我们的内容',
            'data': response.content,
            'context': {
                'brand': prompt.project.name,
                'expected_sources': ['YouTube', 'Reddit', 'Medium']
            }
        })

        # 3. 如果发现引用，存储到数据库
        if analysis.is_cited:
            await postgresql.insert('citations', {
                'prompt_id': prompt_id,
                'platform': platform_url,
                'source': analysis.source,
                'position': analysis.position,
                'snippet': analysis.snippet,
                'detected_at': datetime.now()
            })

            # 4. 更新 Redis 缓存
            await redis.incr(f"citation_count:{prompt_id}")

            # 5. 如果是高位引用，发送 Slack 通知
            if analysis.position == 1:
                await slack.notify({
                    'channel': '#geo-alerts',
                    'message': f"🎉 Top-1 Citation! {prompt.text}"
                })
```

---

### **Day 13: 智能推荐系统**

#### 使用 Sequential Thinking 优化 Prompt
```python
# 由 /sc:implement 自动生成

async def optimize_prompt(prompt_id: int):
    # 1. 获取 Prompt 历史表现数据
    prompt = await get_prompt_with_stats(prompt_id)

    # 2. 获取高表现 Prompts 作为参考
    top_prompts = await postgresql.query("""
        SELECT * FROM prompts
        WHERE citation_rate > 0.35
        ORDER BY citation_rate DESC
        LIMIT 10
    """)

    # 3. 使用 Sequential Thinking 分析
    insights = await sequential_thinking.analyze({
        'task': '分析为什么这些 Prompt 有高 Citation Rate',
        'current_prompt': prompt.text,
        'top_prompts': [p.text for p in top_prompts],
        'metrics': {
            'current_rate': prompt.citation_rate,
            'target_rate': 0.35
        }
    })

    # 4. 生成优化建议
    recommendations = await sequential_thinking.recommend({
        'task': '基于分析结果，提供具体的 Prompt 优化建议',
        'insights': insights,
        'constraints': [
            '保持原意图',
            '增加问题导向',
            '添加具体场景'
        ]
    })

    return recommendations
```

#### 内容策略推荐
```python
# 基于知识图谱的内容策略

async def recommend_content_strategy(project_id: str):
    # 1. 查询知识图谱，找到未充分覆盖的关系
    gaps = await neo4j.query(f"""
        MATCH (b:Brand {{project_id: '{project_id}'}})-[:HAS_PRODUCT]->(p:Product)
        MATCH (p)-[:HAS_FEATURE]->(f:Feature)
        OPTIONAL MATCH (f)-[:SOLVES]->(pr:Problem)
        WHERE pr IS NULL
        RETURN f as uncovered_feature
    """)

    # 2. 使用 Sequential Thinking 生成内容建议
    suggestions = await sequential_thinking.plan({
        'task': '为这些未覆盖的特性生成内容策略',
        'uncovered_features': gaps,
        'platforms': ['YouTube', 'Reddit', 'Quora'],
        'goal': 'Increase Citation Rate to >30%'
    })

    return suggestions
```

---

### **Day 14: 监控与文档**

#### 配置 Sentry 监控
```bash
# 使用 Sentry MCP 自动配置
/sc:implement --feature "Sentry Error Tracking"

# 自动配置:
# - 前端错误追踪
# - 后端异常监控
# - 性能追踪
# - 告警规则
```

#### 生成完整项目文档
```bash
# 使用 /sc:document 生成文档
/sc:document --comprehensive

# 生成的文档:
docs/
├── README.md                  # 项目总览
├── ARCHITECTURE.md            # 架构设计
├── API.md                     # API 文档
├── DATABASE.md                # 数据库 Schema
├── DEPLOYMENT.md              # 部署指南
└── DEVELOPMENT.md             # 开发指南

# 使用 Feishu MCP 同步到飞书
# 自动生成中文知识库
```

#### 最终验证
```bash
# 完整的端到端测试
/qa --comprehensive

# 测试覆盖:
# ✅ 所有 API 端点
# ✅ 数据库操作
# ✅ 知识图谱查询
# ✅ Citation 追踪流程
# ✅ Redis 缓存
# ✅ 前后端集成
# ✅ 性能基准
# ✅ 安全测试
```

---

## 🎓 自动化工具使用总结

### Context Engineering 使用场景
| 阶段 | 使用方式 | 预期产出 |
|------|---------|---------|
| Phase 1 | `/generate-prp INITIAL-PHASE1.md` | 数据库迁移脚本 |
| Phase 2 | `/generate-prp INITIAL-PHASE2.md` | FastAPI 完整项目 |
| Phase 3 | `/generate-prp INITIAL-PHASE3.md` | Citation Tracking |

### SuperClaude 命令使用频率
| 命令 | 使用次数 | 主要用途 |
|------|---------|---------|
| `/sc:load` | 每日 1 次 | 加载项目上下文 |
| `/sc:implement` | 10+ 次 | 功能实现 |
| `/sc:test` | 5+ 次 | 测试执行 |
| `/sc:document` | 3 次 | 文档生成 |
| `/sc:analyze` | 3 次 | 性能分析 |
| `/sc:improve` | 5 次 | 代码优化 |

### MCP 服务器使用统计
| MCP 服务 | 使用频率 | 关键功能 |
|---------|---------|---------|
| PostgreSQL | 高 | 业务数据存储 |
| Neo4j | 高 | 知识图谱 |
| Redis | 中 | 缓存统计 |
| Firecrawl | 高 | AI 平台抓取 |
| Sequential Thinking | 中 | 智能分析 |
| Feishu | 低 | 中文文档 |
| Slack | 低 | 告警通知 |
| Sentry | 低 | 监控 |

---

## 📊 预期成果

### 技术指标
- ✅ **API 响应时间**: <100ms (P95)
- ✅ **数据库查询**: <50ms
- ✅ **测试覆盖率**: >80%
- ✅ **前端加载**: <2s
- ✅ **Citation 检测准确率**: >95%

### 业务指标
- ✅ **支持项目数**: 3+ (可扩展)
- ✅ **Prompt 管理**: 290+
- ✅ **平台覆盖**: 9 个发布平台
- ✅ **AI 平台监控**: 8 个平台
- ✅ **实时 Citation Rate**: 自动更新

### 开发效率
- ✅ **传统开发**: 60+ 天
- ✅ **自动化开发**: 14 天
- ✅ **效率提升**: 4.3x
- ✅ **代码质量**: 自动化测试保证

---

## 🚀 立即开始

### 前置检查
```bash
# 1. 验证 Docker 服务
docker ps | grep claude-mcp

# 2. 验证 MCP 配置
cat ~/.mcp.json

# 3. 验证项目文件
ls -la /Users/cavin/Desktop/dev/leapgeo2/

# 4. 启动 Firecrawl
cd /Users/cavin/firecrawl && docker compose up -d
```

### 第一步执行
```bash
# Phase 1 Day 1 开始
cd /Users/cavin/Desktop/dev/leapgeo2

# 生成数据库基础设施 PRP
/generate-prp INITIAL-PHASE1.md

# 等待 PRP 生成完成后，执行实现
/execute-prp PRPs/database-foundation.md

# 监控执行进度
# 预计时间: 30-45 分钟
```

---

## 📞 问题排查

### 常见问题
1. **Docker 服务未启动**: `docker start postgres-claude-mcp`
2. **MCP 连接失败**: 检查 `~/.mcp.env` 环境变量
3. **PRP 生成失败**: 检查 INITIAL.md 格式
4. **数据迁移错误**: 验证数据库权限

### 获取帮助
```bash
# 使用 /sc:troubleshoot 诊断问题
/sc:troubleshoot --issue "Database connection failed"

# 使用 Memory MCP 查询经验
# 自动检索相似问题的解决方案
```

---

**准备好了吗？运行第一个命令开始自动化开发之旅！** 🚀
