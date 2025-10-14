# GEO Platform 快速参考指南

## 🚀 Phase 1 完成 - 现在可以做什么？

---

## 📊 查看数据

### PostgreSQL 查询
```bash
# 查看所有项目
docker exec -i postgres-claude-mcp psql -U claude -d claude_dev -c \
  "SELECT id, name, citation_rate, total_prompts FROM projects WHERE id != 'test'"

# 查看 SweetNight 的 Prompts
docker exec -i postgres-claude-mcp psql -U claude -d claude_dev -c \
  "SELECT text, priority, score FROM prompts WHERE project_id = 'sweetnight' LIMIT 5"

# 查看最近的 Citations
docker exec -i postgres-claude-mcp psql -U claude -d claude_dev -c \
  "SELECT platform, prompt, position FROM citations ORDER BY detected_at DESC LIMIT 5"
```

### Neo4j 查询
```bash
# 查看所有节点
docker exec -i neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025 \
  "MATCH (n) RETURN labels(n)[0] as type, count(n) as count"

# 查看 SweetNight 知识图谱
docker exec -i neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025 \
  "MATCH (b:Brand {id: 'sweetnight'})-[*]->(n) RETURN b, n LIMIT 20"

# 查找解决 "Back Pain" 的特性
docker exec -i neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025 \
  "MATCH (pr:Problem {label: 'Back Pain'})<-[:SOLVES]-(f:Feature) RETURN f.label"
```

### Redis 查询
```bash
# 查看 SweetNight 项目信息
docker exec -i redis-claude-mcp redis-cli -a claude_redis_2025 \
  GET "geo:project:sweetnight:info"

# 查看 Citation Rate 排行榜
docker exec -i redis-claude-mcp redis-cli -a claude_redis_2025 \
  ZREVRANGE "geo:citation_rate_leaderboard" 0 -1 WITHSCORES

# 查看所有缓存键
docker exec -i redis-claude-mcp redis-cli -a claude_redis_2025 \
  --scan --pattern "geo:*"
```

---

## 🔧 管理脚本

### 重新初始化数据库
```bash
cd /Users/cavin/Desktop/dev/leapgeo2

# 重建 PostgreSQL
docker exec -i postgres-claude-mcp psql -U claude -d claude_dev < scripts/init_database.sql
python3 scripts/migrate_data.py

# 重建 Neo4j
docker exec -i neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025 < scripts/init_neo4j.cypher

# 重建 Redis
python3 scripts/init_redis.py
```

### 数据验证
```bash
# 完整验证
python3 scripts/verify_data.py

# 快速统计
docker exec -i postgres-claude-mcp psql -U claude -d claude_dev -c \
  "SELECT 'projects' as table, COUNT(*) as count FROM projects WHERE id != 'test'
   UNION SELECT 'prompts', COUNT(*) FROM prompts
   UNION SELECT 'citations', COUNT(*) FROM citations"
```

---

## 🌐 访问管理界面

### Neo4j Browser
```bash
# 访问: http://localhost:7475
# 用户名: neo4j
# 密码: claude_neo4j_2025

# 示例查询:
MATCH (n) RETURN n LIMIT 25
```

### PostgreSQL (使用 GUI 工具)
```bash
# 连接信息:
Host: localhost
Port: 5437
Database: claude_dev
Username: claude
Password: claude_dev_2025

# 推荐工具: DBeaver, pgAdmin, TablePlus
```

---

## 📋 Phase 2 开始清单

### ✅ 准备工作
- [x] Phase 1 完成
- [x] 数据库正常运行
- [x] 数据迁移完成
- [x] 验证通过

### 🚧 下一步

#### 1. 创建 FastAPI 项目
```bash
# 创建后端目录
mkdir -p backend/{app,tests}
cd backend

# 安装依赖
pip3 install fastapi uvicorn sqlalchemy pydantic strawberry-graphql

# 或使用虚拟环境
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 2. 使用 Context Engineering
```bash
cd /Users/cavin/Desktop/dev/leapgeo2

# 查看 Phase 2 模板 (已在 AUTOMATION-ROADMAP.md 中)
cat AUTOMATION-ROADMAP.md | grep -A 50 "INITIAL-PHASE2"

# 生成 Phase 2 PRP
/generate-prp INITIAL-PHASE2.md

# 执行实现
/execute-prp PRPs/fastapi-backend.md
```

#### 3. 手动开发（如不使用自动化）
```bash
# 1. 创建 FastAPI app
cat > backend/app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="GEO Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "GEO Platform API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
EOF

# 2. 运行服务
cd backend
uvicorn app.main:app --reload --port 8000

# 3. 访问文档
open http://localhost:8000/docs
```

---

## 🐛 常见问题

### Q1: Docker 容器无法连接
```bash
# 检查容器状态
docker ps | grep claude-mcp

# 重启容器
docker restart postgres-claude-mcp neo4j-claude-mcp redis-claude-mcp

# 查看日志
docker logs postgres-claude-mcp
```

### Q2: 数据丢失或损坏
```bash
# 重新初始化所有数据库
cd /Users/cavin/Desktop/dev/leapgeo2
./scripts/init_database.sql      # PostgreSQL
./scripts/init_neo4j.cypher      # Neo4j
python3 scripts/migrate_data.py  # 数据迁移
python3 scripts/init_redis.py    # Redis
```

### Q3: Python 模块缺失
```bash
# 安装所需模块
pip3 install psycopg2-binary redis --break-system-packages

# 或使用虚拟环境
python3 -m venv venv
source venv/bin/activate
pip install psycopg2-binary redis
```

### Q4: 端口冲突
```bash
# 检查端口占用
lsof -i :5437  # PostgreSQL
lsof -i :7688  # Neo4j
lsof -i :6382  # Redis

# 修改端口 (如需要)
# 编辑 docker-compose.yml 或停止冲突服务
```

---

## 📊 监控命令

### 实时监控
```bash
# PostgreSQL 连接数
docker exec -i postgres-claude-mcp psql -U claude -d claude_dev -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname = 'claude_dev'"

# Redis 内存使用
docker exec -i redis-claude-mcp redis-cli -a claude_redis_2025 INFO memory | grep used_memory_human

# Neo4j 节点数
docker exec -i neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025 \
  "MATCH (n) RETURN count(n) as total_nodes"
```

### 性能测试
```bash
# PostgreSQL 查询性能
time docker exec -i postgres-claude-mcp psql -U claude -d claude_dev -c \
  "SELECT * FROM projects WHERE id = 'sweetnight'"

# Neo4j 图遍历性能
time docker exec -i neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025 \
  "MATCH (b:Brand {id: 'sweetnight'})-[*]->(n) RETURN count(n)"

# Redis 缓存性能
time docker exec -i redis-claude-mcp redis-cli -a claude_redis_2025 \
  GET "geo:project:sweetnight:info"
```

---

## 🎯 关键文件位置

### 文档
- `CLAUDE.md` - 项目完整文档
- `AUTOMATION-ROADMAP.md` - 14 天开发路线图
- `PHASE1-COMPLETE.md` - Phase 1 完成报告
- `DATA-ARCHITECTURE.md` - 数据架构图
- `QUICK-REFERENCE.md` - 本文档

### 脚本
- `scripts/init_database.sql` - PostgreSQL 初始化
- `scripts/migrate_data.py` - 数据迁移
- `scripts/init_neo4j.cypher` - Neo4j 初始化
- `scripts/init_redis.py` - Redis 初始化
- `scripts/verify_data.py` - 数据验证

### 原型代码
- `index.tsx` - 前端原型 (2050+ 行)
- `Leap-geo-platform-architecture.tsx` - 架构可视化

---

## 🔗 有用的链接

### 文档
- PostgreSQL: https://www.postgresql.org/docs/
- Neo4j: https://neo4j.com/docs/
- Redis: https://redis.io/docs/
- FastAPI: https://fastapi.tiangolo.com/

### 工具
- Neo4j Browser: http://localhost:7475
- FastAPI Docs (Phase 2): http://localhost:8000/docs
- Firecrawl: http://localhost:3002

### MCP 服务器
- Global Config: `~/.mcp.json`
- Environment: `~/.mcp.env`
- Context Engineering: `/Users/cavin/Context-Engineering-Intro`

---

## 🎓 学习资源

### SQL 查询示例
```sql
-- 项目统计
SELECT
    p.name,
    COUNT(DISTINCT pr.id) as prompt_count,
    COUNT(DISTINCT c.id) as citation_count,
    p.citation_rate
FROM projects p
LEFT JOIN prompts pr ON p.id = pr.project_id
LEFT JOIN citations c ON p.id = c.project_id
WHERE p.id != 'test'
GROUP BY p.id, p.name, p.citation_rate;

-- Top Prompts by Citation Rate
SELECT text, citation_rate, score
FROM prompts
ORDER BY citation_rate DESC
LIMIT 10;
```

### Cypher 查询示例
```cypher
// 查找产品的所有特性
MATCH (p:Product {id: 'coolnest'})-[:HAS_FEATURE]->(f:Feature)
RETURN p.label as product, collect(f.label) as features;

// 查找解决特定问题的所有产品
MATCH (pr:Problem {label: 'Hot Sleep'})<-[:SOLVES]-(f:Feature)<-[:HAS_FEATURE]-(p:Product)
RETURN p.label as product, f.label as feature;

// 查找用户群的需求
MATCH (u:UserGroup {label: 'Athletes'})-[:NEEDS]->(f:Feature)
RETURN u.label as user_group, collect(f.label) as needed_features;
```

### Redis 命令示例
```bash
# 设置带 TTL 的缓存
SET geo:project:new:info '{"name": "New Project"}' EX 3600

# 排行榜操作
ZADD geo:leaderboard 0.40 "new_project"
ZREVRANGE geo:leaderboard 0 2 WITHSCORES

# 批量删除
EVAL "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 "geo:*"
```

---

## ✨ 快速命令汇总

```bash
# 查看所有项目
docker exec postgres-claude-mcp psql -U claude -d claude_dev -c "SELECT id, name FROM projects"

# 查看知识图谱
docker exec neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025 "MATCH (n) RETURN n LIMIT 10"

# 查看缓存排行榜
docker exec redis-claude-mcp redis-cli -a claude_redis_2025 ZREVRANGE geo:citation_rate_leaderboard 0 -1 WITHSCORES

# 完整验证
python3 scripts/verify_data.py

# 重新初始化
docker exec postgres-claude-mcp psql -U claude -d claude_dev < scripts/init_database.sql
python3 scripts/migrate_data.py
docker exec neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025 < scripts/init_neo4j.cypher
python3 scripts/init_redis.py
```

---

**🎉 恭喜！Phase 1 完成！**

准备好开始 Phase 2 了吗？查看 `AUTOMATION-ROADMAP.md` 继续！

---

*Quick Reference Guide*
*GEO Platform - leapgeo2*
*Last Updated: 2025-10-09*
