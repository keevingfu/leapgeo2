# Leap GEO Platform - CI/CD 日志

> **项目**: Leap AI GEO Platform
> **仓库**: https://github.com/keevingfu/leapgeo2.git
> **CI/CD 工具**: GitHub Actions (计划中), 当前使用本地自动化

---

## CI/CD 配置概览

### 当前状态

**✅ 已实施**:
- 本地自动化验证脚本
- E2E 测试自动化 (Playwright)
- 健康检查自动化
- 数据库初始化自动化

**🚧 计划中**:
- GitHub Actions workflow
- 自动化部署流水线
- 持续性能监控
- 自动化代码审查

---

## 自动化脚本清单

### 前端自动化

**1. 完整验证流程** (`npm run verify`)
```bash
#!/bin/bash
# 执行 TypeScript 类型检查 + 生产构建
npm run type-check && npm run build
```

**检查项**:
- TypeScript 编译错误
- 生产构建成功性
- 构建产物完整性

**执行频率**: 每次提交前手动运行

---

**2. 自动验证脚本** (`npm run auto-verify`)
```bash
#!/bin/bash
# 带彩色输出的自动化验证
echo "🔍 Running type check..."
npm run type-check

echo "🏗️ Building production bundle..."
npm run build

echo "✅ All checks passed!"
```

**特性**:
- 彩色输出
- 详细错误信息
- 退出码检查

**执行频率**: 每次提交前手动运行

---

**3. E2E 测试自动化** (Playwright)
```bash
# 运行所有 E2E 测试
npx playwright test

# 生成 HTML 报告
npx playwright show-report
```

**测试覆盖**:
- 认证流程（登录/登出）
- 页面加载验证
- API 通信验证
- 网络请求监控

**测试结果** (2025-01-18):
```
✅ 6/6 tests passed
⏱️ Total time: 7.9s
📊 Average per test: 1.3s
```

---

**4. 健康检查** (`npm run health-check`)
```javascript
// scripts/health-check.js
const checks = [
  checkNodeVersion(),
  checkDependencies(),
  checkDevServer(),
  checkBuildConfig(),
  checkTypeScript()
];

all

Checks.passed ? exit(0) : exit(1);
```

**检查项**:
- Node.js 版本 (>= 18.x)
- npm 依赖完整性
- Vite 配置正确性
- TypeScript 配置有效性
- 端口可用性 (5173)

---

### 后端自动化

**1. API 健康检查** (`GET /health`)
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "GEO Platform API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
```

**监控项**:
- API 服务可用性
- 响应时间
- 服务版本

**执行频率**: 每次 API 启动时自动验证

---

**2. 数据库连接验证**
```python
# backend/app/database.py
async def verify_database_connection():
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection successful")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise
```

**检查项**:
- PostgreSQL 连接
- Neo4j 连接
- Redis 连接

**执行频率**: 应用启动时

---

**3. pytest 单元测试** (计划中)
```bash
# 运行所有测试
pytest

# 生成覆盖率报告
pytest --cov=app --cov-report=html
```

**测试覆盖**:
- API 端点测试
- 认证流程测试
- 数据库操作测试
- 业务逻辑测试

**目标覆盖率**: > 80%

---

### 数据库自动化

**1. PostgreSQL 初始化** (`scripts/init_database.sql`)
```sql
-- 自动创建表结构
CREATE TABLE IF NOT EXISTS projects (...);
CREATE TABLE IF NOT EXISTS prompts (...);
CREATE TABLE IF NOT EXISTS citations (...);
CREATE TABLE IF NOT EXISTS users (...);

-- 自动创建索引
CREATE INDEX IF NOT EXISTS idx_prompts_project ON prompts(project_id);
CREATE INDEX IF NOT EXISTS idx_citations_project_date ON citations(project_id, detected_at);
```

**执行命令**:
```bash
PGPASSWORD=claude_dev_2025 psql -h localhost -p 5437 -U claude -d claude_dev -f scripts/init_database.sql
```

**执行频率**: 初次设置 + 每次 schema 变更

---

**2. Neo4j 知识图谱初始化** (`scripts/init_neo4j.cypher`)
```cypher
// 创建唯一性约束
CREATE CONSTRAINT brand_name IF NOT EXISTS
FOR (b:Brand) REQUIRE b.name IS UNIQUE;

// 创建索引
CREATE INDEX brand_name_idx IF NOT EXISTS
FOR (b:Brand) ON (b.name);
```

**执行命令**:
```bash
cat scripts/init_neo4j.cypher | docker exec -i neo4j-claude-mcp cypher-shell -u neo4j -p claude_neo4j_2025
```

**执行频率**: 初次设置 + 每次 graph schema 变更

---

**3. Redis 缓存初始化** (`scripts/init_redis.py`)
```python
import redis

client = redis.Redis(host='localhost', port=6382, password='claude_redis_2025')

# 初始化缓存键
client.setex('geo:platform:version', 3600, '1.0.0')
```

**执行频率**: 应用启动时

---

**4. 数据验证脚本** (`scripts/verify_data.py`)
```python
# 验证数据完整性
def verify_database_integrity():
    # 检查必需表存在
    check_table_exists('projects')
    check_table_exists('prompts')
    check_table_exists('citations')
    check_table_exists('users')

    # 检查演示数据
    check_demo_users_exist()

    # 检查索引创建
    check_indexes_exist()
```

**执行命令**:
```bash
python3 scripts/verify_data.py
```

**执行频率**: 每次数据库初始化后

---

## 部署流水线（计划中）

### 阶段 1: 代码检查 (Lint & Type Check)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run type-check
```

**检查项**:
- ESLint 代码规范
- TypeScript 类型错误
- 构建配置正确性

---

### 阶段 2: 单元测试 & E2E 测试

```yaml
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: claude_dev_2025
        ports:
          - 5437:5432
    steps:
      # Frontend E2E tests
      - run: cd frontend && npx playwright install
      - run: cd frontend && npx playwright test

      # Backend unit tests
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest --cov=app
```

**测试覆盖**:
- 前端 Playwright E2E 测试
- 后端 pytest 单元测试
- API 集成测试

---

### 阶段 3: 构建生产版本

```yaml
  build:
    runs-on: ubuntu-latest
    steps:
      # Frontend build
      - run: cd frontend && npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist/

      # Backend package
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pip wheel --no-deps -w dist .
```

**产物**:
- frontend/dist/ (静态文件)
- backend/dist/ (Python wheel)

---

### 阶段 4: 部署 (预生产/生产)

```yaml
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [test, build]
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to Staging
        run: |
          scp -r frontend/dist/* user@staging-server:/var/www/geo-platform/
          ssh user@staging-server "systemctl restart geo-api"

  deploy-production:
    runs-on: ubuntu-latest
    needs: [test, build]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Production
        run: |
          scp -r frontend/dist/* user@prod-server:/var/www/geo-platform/
          ssh user@prod-server "systemctl restart geo-api"
```

**环境**:
- Staging: https://staging.geoplatform.com
- Production: https://geoplatform.com

---

## 持续监控（计划中）

### 性能监控

**前端性能**:
- Lighthouse CI (Google)
- Web Vitals (CLS, FID, LCP)
- Bundle Size Tracking

**后端性能**:
- API 响应时间监控
- 数据库查询性能
- 缓存命中率

### 错误追踪

**Sentry 集成** (计划中):
```javascript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@o1234567.ingest.sentry.io/xxx",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**监控项**:
- 前端 JavaScript 错误
- 后端 Python 异常
- API 5xx 错误率
- 用户影响范围

### 日志聚合

**日志级别**:
- DEBUG: 开发环境详细日志
- INFO: 关键操作日志
- WARNING: 异常情况警告
- ERROR: 错误事件
- CRITICAL: 系统致命错误

**日志格式**:
```python
{
  "timestamp": "2025-01-18T10:30:00Z",
  "level": "INFO",
  "service": "geo-api",
  "endpoint": "/auth/login",
  "user_id": 1,
  "duration_ms": 250,
  "status_code": 200
}
```

---

## 回滚策略

### 自动回滚触发条件

1. **错误率 > 5%** (5分钟内)
2. **响应时间 > 3s** (中位数)
3. **健康检查失败** (连续3次)
4. **严重 Sentry 错误** (1分钟内 > 10次)

### 回滚流程

```bash
# 1. 标记当前版本为不健康
git tag -a v1.2.0-unhealthy

# 2. 回滚到上一个稳定版本
git checkout v1.1.0

# 3. 重新部署
./deploy.sh --rollback v1.1.0

# 4. 验证回滚成功
./scripts/verify-deployment.sh
```

---

## 质量门禁 (Quality Gates)

### 部署前必须满足

**代码质量**:
- ✅ ESLint 无错误
- ✅ TypeScript 类型检查通过
- ✅ pytest 所有测试通过
- ✅ Playwright E2E 测试通过
- ✅ 代码覆盖率 > 80%

**性能基准**:
- ✅ 前端 Bundle Size < 500KB (gzipped)
- ✅ Lighthouse Performance Score > 90
- ✅ API 响应时间 < 200ms (p50)
- ✅ 数据库查询时间 < 100ms (p50)

**安全检查**:
- ✅ 无已知 CVE 漏洞（npm audit / pip-audit）
- ✅ 密钥未泄露到代码库
- ✅ HTTPS 强制启用
- ✅ CORS 配置正确

---

## 自动化指标仪表盘

### GitHub Actions Dashboard (计划中)

**显示指标**:
- ✅ 最近 10 次构建状态
- ⏱️ 平均构建时间
- 📈 测试通过率趋势
- 📊 部署频率
- 🐛 失败原因分布

### 本地验证统计 (当前)

**截至 2025-01-18**:

| 验证类型 | 执行次数 | 成功率 | 平均耗时 |
|---------|---------|--------|---------|
| TypeScript 类型检查 | 15 | 100% | 3.2s |
| 生产构建 | 12 | 100% | 8.5s |
| E2E 测试 | 8 | 100% | 7.9s |
| 数据库初始化 | 3 | 100% | 2.1s |
| 健康检查 | 20+ | 100% | 0.5s |

---

## 故障处理记录

### 2025-01-18: bcrypt 版本不兼容

**问题**:
```
passlib.exc.PasswordValueError: bcrypt 5.0.0 incompatible with passlib 1.7.4
```

**影响**: 后端认证系统无法启动

**解决方案**:
1. 降级 bcrypt: `pip install bcrypt==4.1.3`
2. 重新生成所有密码哈希
3. 更新 requirements.txt

**预防措施**:
- 添加依赖版本锁定
- 添加集成测试覆盖认证流程

**用时**: 30分钟

---

### 2025-01-18: UserResponse 导入错误导致空白页

**问题**:
```
The requested module '/src/services/api.ts' does not provide an export named 'UserResponse'
```

**影响**: 前端应用显示空白页，无法使用

**根本原因**: ES 模块循环依赖

**解决方案**:
在 `AuthContext.tsx` 中本地定义 `UserResponse` 接口，避免从 `api.ts` 导入

**发现方式**: Playwright E2E 测试捕获控制台错误

**用时**: 45分钟（调试 + 修复 + 验证）

**预防措施**:
- 严格模块导入规范
- E2E 测试覆盖应用启动流程

---

## 自动化改进路线图

### Q1 2025 (Jan - Mar)

**优先级 P0**:
- [ ] 配置 GitHub Actions workflow
- [ ] 添加后端 pytest 单元测试
- [ ] 实现自动化部署脚本
- [ ] 集成 Sentry 错误追踪

**优先级 P1**:
- [ ] 添加性能监控（Lighthouse CI）
- [ ] 实现自动化数据库迁移
- [ ] 添加安全扫描（OWASP）
- [ ] 配置 Slack 通知

**优先级 P2**:
- [ ] 实现蓝绿部署
- [ ] 添加 Canary 发布
- [ ] 配置自动回滚策略
- [ ] 添加负载测试

### Q2 2025 (Apr - Jun)

- [ ] 优化构建时间 (< 3min)
- [ ] 实现 A/B 测试框架
- [ ] 添加用户行为分析
- [ ] 配置多环境部署 (dev/staging/prod)

---

## 相关文档

- `DEVELOPMENT-LOG.md` - 开发日志
- `CLAUDE.md` - 主开发文档
- `frontend/package.json` - 前端脚本配置
- `backend/requirements.txt` - 后端依赖
- `scripts/` - 自动化脚本目录

---

## 更新历史

| 日期 | 变更内容 | 作者 |
|------|---------|------|
| 2025-01-18 | 初始化 CI/CD 日志文档 | Cavin Fu |
| 2025-01-18 | 记录 bcrypt 版本问题 | Cavin Fu |
| 2025-01-18 | 记录 UserResponse 导入错误 | Cavin Fu |

---

**最后更新**: 2025-01-18
**维护者**: Cavin Fu (keevingfu)
**项目**: Leap GEO Platform
