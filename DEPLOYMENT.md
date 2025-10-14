# Leap GEO Platform - 部署指南

本文档提供 Leap GEO Platform 的完整部署指南，涵盖前端（Vercel）和后端（Render/Railway/Fly.io）的部署步骤。

---

## 📋 目录

1. [部署架构概览](#部署架构概览)
2. [前端部署（Vercel）](#前端部署vercel)
3. [后端部署选项](#后端部署选项)
4. [数据库部署](#数据库部署)
5. [环境变量配置](#环境变量配置)
6. [域名配置](#域名配置)
7. [监控和日志](#监控和日志)
8. [故障排查](#故障排查)

---

## 🏗️ 部署架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              前端 (Vercel)                                   │
│              https://leapgeo2.vercel.app                     │
│              - React 19 + TypeScript                         │
│              - Vite 构建                                     │
│              - 静态文件托管                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ API 请求
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              后端 API (Render/Railway)                       │
│              https://leapgeo2-api.onrender.com              │
│              - FastAPI + Python 3.13                         │
│              - RESTful API                                   │
│              - CORS 配置                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              数据库层                                        │
│              - PostgreSQL (Supabase/Neon)                   │
│              - Neo4j (AuraDB)                               │
│              - Redis (Upstash)                              │
│              - MongoDB (Atlas)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 前端部署（Vercel）

### 方法 1: GitHub 自动部署（推荐）

#### 1. 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New" → "Project"
3. 选择 "Import Git Repository"
4. 选择 `keevingfu/leapgeo2`
5. 点击 "Import"

#### 2. 配置项目设置

Vercel 会自动检测 `vercel.json` 配置，但请确认以下设置：

**Framework Preset**: `Vite`

**Build Settings**:
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `cd frontend && npm install`

**Environment Variables**: (稍后配置)

#### 3. 部署

点击 "Deploy" 按钮，Vercel 会自动：
1. 克隆仓库
2. 安装依赖
3. 运行构建
4. 部署到 CDN

**预期构建时间**: 2-3 分钟

#### 4. 验证部署

部署完成后，你会获得一个 URL，如：
```
https://leapgeo2-xxxxx.vercel.app
```

访问该 URL 验证前端是否正常运行。

---

### 方法 2: Vercel CLI 部署

如果 GitHub 自动部署有问题，可以使用 CLI：

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署到生产环境
vercel --prod

# 4. 按提示操作
# - 选择 scope
# - 确认项目名称
# - 确认构建设置
```

---

### Vercel 环境变量配置

前端需要配置后端 API 地址：

1. 进入 Vercel 项目设置
2. 导航到 "Settings" → "Environment Variables"
3. 添加以下变量：

```bash
# 生产环境
VITE_API_URL=https://your-backend-api.onrender.com

# 预览环境（可选）
VITE_API_URL_PREVIEW=https://your-backend-api-preview.onrender.com
```

4. 重新部署以应用更改

---

### 修复构建配置

如果遇到 "no files were prepared" 错误，检查：

#### 1. 确认 `vercel.json` 存在

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite"
}
```

#### 2. 确认根目录 `package.json` 存在

```json
{
  "name": "leapgeo2",
  "scripts": {
    "build": "cd frontend && npm install && npm run build"
  }
}
```

#### 3. 测试本地构建

```bash
# 在项目根目录
cd frontend
npm install
npm run build

# 检查输出
ls -la dist/
# 应该看到 index.html 和 assets/ 目录
```

#### 4. 清除 Vercel 缓存

在 Vercel Dashboard:
1. 进入项目设置
2. "General" → "Build & Development Settings"
3. 找到 "Build Cache"
4. 点击 "Clear Cache"
5. 重新部署

---

## 🔧 后端部署选项

由于 Vercel 主要用于静态前端，后端需要单独部署。

### 选项 1: Render.com（推荐）

**优势**: 免费套餐、自动 HTTPS、简单部署

#### 部署步骤

1. **创建账户**
   - 访问 [Render.com](https://render.com)
   - 使用 GitHub 登录

2. **创建 Web Service**
   - Dashboard → "New" → "Web Service"
   - 连接 GitHub 仓库 `keevingfu/leapgeo2`
   - 选择 `backend` 目录

3. **配置设置**

   **Basic Settings**:
   - **Name**: `leapgeo2-api`
   - **Region**: `Oregon (US West)` 或最近的区域
   - **Branch**: `main`
   - **Root Directory**: `backend`

   **Build & Deploy**:
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

4. **环境变量**

   添加以下环境变量：

   ```bash
   # PostgreSQL
   POSTGRES_HOST=your-db-host.supabase.co
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-password
   POSTGRES_DB=your-database

   # Neo4j
   NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your-password

   # Redis
   REDIS_HOST=your-redis.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password

   # CORS
   FRONTEND_URL=https://leapgeo2.vercel.app
   ```

5. **部署**

   点击 "Create Web Service"，Render 会自动：
   - 克隆仓库
   - 安装依赖
   - 启动服务
   - 分配 URL（如 `https://leapgeo2-api.onrender.com`）

---

### 选项 2: Railway.app

**优势**: 更快的构建、更好的性能

#### 部署步骤

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
cd backend
railway init

# 4. 添加环境变量
railway variables set POSTGRES_HOST=your-host
railway variables set POSTGRES_PASSWORD=your-password

# 5. 部署
railway up

# 6. 获取 URL
railway domain
```

---

### 选项 3: Fly.io

**优势**: 边缘计算、全球分布

```bash
# 1. 安装 Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. 登录
fly auth login

# 3. 启动项目
cd backend
fly launch

# 4. 部署
fly deploy
```

---

## 💾 数据库部署

### PostgreSQL

**推荐服务**: Supabase（免费） 或 Neon

#### Supabase 部署

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取连接字符串：
   ```
   postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
   ```
4. 运行初始化脚本：
   ```bash
   psql [connection-string] -f scripts/init_database.sql
   ```

---

### Neo4j

**推荐服务**: Neo4j AuraDB（免费套餐）

1. 访问 [Neo4j Aura](https://neo4j.com/cloud/aura/)
2. 创建免费实例
3. 获取连接信息：
   ```
   neo4j+s://xxxxx.databases.neo4j.io
   ```
4. 运行 Cypher 脚本：
   ```bash
   cypher-shell -a [uri] -u neo4j -p [password] < scripts/init_neo4j.cypher
   ```

---

### Redis

**推荐服务**: Upstash（免费）

1. 访问 [Upstash](https://upstash.com)
2. 创建 Redis 数据库
3. 获取连接 URL：
   ```
   rediss://default:[password]@xxx.upstash.io:6379
   ```

---

### MongoDB

**推荐服务**: MongoDB Atlas（免费套餐）

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串：
   ```
   mongodb+srv://username:[password]@cluster.mongodb.net/database
   ```

---

## 🔐 环境变量配置

### 前端环境变量（Vercel）

在 Vercel Dashboard 添加：

```bash
VITE_API_URL=https://leapgeo2-api.onrender.com
```

### 后端环境变量（Render）

在 Render Dashboard 添加：

```bash
# Database URLs
DATABASE_URL=postgresql://...
NEO4J_URI=neo4j+s://...
REDIS_URL=rediss://...
MONGODB_URI=mongodb+srv://...

# CORS
FRONTEND_URL=https://leapgeo2.vercel.app

# Security
SECRET_KEY=your-secret-key-here
DEBUG=false
```

---

## 🌐 域名配置

### Vercel 自定义域名

1. 进入 Vercel 项目设置
2. "Domains" → "Add Domain"
3. 输入域名（如 `leapgeo.com`）
4. 按照 DNS 配置说明添加记录：
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Render 自定义域名

1. 进入 Render 服务设置
2. "Custom Domains" → "Add Custom Domain"
3. 添加 DNS 记录：
   ```
   Type: CNAME
   Name: api
   Value: your-service.onrender.com
   ```

---

## 📊 监控和日志

### Vercel 监控

- **访问日志**: Dashboard → "Deployments" → 选择部署 → "Logs"
- **性能分析**: "Analytics" 标签
- **错误追踪**: "Logs" 标签

### Render 监控

- **实时日志**: Dashboard → 服务 → "Logs" 标签
- **性能指标**: "Metrics" 标签
- **健康检查**: 自动监控 `/health` 端点

---

## 🔧 故障排查

### 问题 1: Vercel 构建失败 "no files were prepared"

**解决方法**:

1. 确认 `vercel.json` 配置正确
2. 确认根目录有 `package.json`
3. 本地测试构建：
   ```bash
   cd frontend
   npm run build
   ls -la dist/  # 应该看到文件
   ```
4. 清除 Vercel 缓存并重新部署

---

### 问题 2: 前端无法连接后端

**症状**: CORS 错误或 API 请求失败

**解决方法**:

1. 检查后端 CORS 配置（`backend/app/config.py`）：
   ```python
   cors_origins = [
       "https://leapgeo2.vercel.app",
       "http://localhost:5173"
   ]
   ```

2. 确认前端 API URL 配置：
   ```bash
   # Vercel 环境变量
   VITE_API_URL=https://leapgeo2-api.onrender.com
   ```

3. 更新前端 API 配置（`frontend/src/services/api.ts`）：
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   ```

---

### 问题 3: 后端部署失败

**常见原因**:

1. **依赖安装失败**
   - 检查 `requirements.txt`
   - 确认 Python 版本兼容

2. **端口配置错误**
   - Render/Railway 使用 `$PORT` 环境变量
   - 确认启动命令：
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

3. **数据库连接失败**
   - 验证环境变量
   - 测试数据库连接字符串

---

### 问题 4: 数据库连接超时

**解决方法**:

1. 检查数据库服务状态
2. 验证连接字符串格式
3. 确认防火墙/安全组规则
4. 检查 IP 白名单（如果数据库有限制）

---

## 📝 部署检查清单

在部署前，确认以下项目：

### 前端（Vercel）
- [ ] `vercel.json` 配置正确
- [ ] 根目录 `package.json` 存在
- [ ] 本地构建成功（`npm run build`）
- [ ] 环境变量已配置（`VITE_API_URL`）
- [ ] GitHub 仓库已连接
- [ ] 自动部署已启用

### 后端（Render/Railway）
- [ ] `requirements.txt` 包含所有依赖
- [ ] 启动命令正确（使用 `$PORT`）
- [ ] CORS 配置包含前端域名
- [ ] 所有环境变量已设置
- [ ] 数据库连接已测试
- [ ] 健康检查端点 `/health` 正常

### 数据库
- [ ] PostgreSQL 已初始化（表结构创建）
- [ ] Neo4j 已初始化（节点和关系创建）
- [ ] Redis 可访问
- [ ] MongoDB 集合已创建
- [ ] 所有连接字符串已配置
- [ ] 数据库凭证安全存储

### 安全
- [ ] 所有密码/token 使用环境变量
- [ ] `.env` 文件已在 `.gitignore` 中
- [ ] HTTPS 已启用
- [ ] CORS 限制为特定域名
- [ ] 数据库访问限制为后端 IP

---

## 🎯 生产部署最佳实践

1. **使用环境变量**: 永远不要硬编码密码或 API 密钥
2. **启用 HTTPS**: 所有生产服务必须使用 HTTPS
3. **设置监控**: 配置错误追踪和性能监控
4. **自动备份**: 定期备份数据库
5. **负载测试**: 部署前进行压力测试
6. **回滚计划**: 准备快速回滚到上一个稳定版本
7. **文档更新**: 保持部署文档最新

---

## 🔗 有用的链接

- **Vercel 文档**: https://vercel.com/docs
- **Render 文档**: https://render.com/docs
- **Railway 文档**: https://docs.railway.app
- **Supabase 文档**: https://supabase.com/docs
- **Neo4j Aura 文档**: https://neo4j.com/docs/aura/

---

**最后更新**: 2025-10-14
**维护者**: Leap GEO Platform Team
