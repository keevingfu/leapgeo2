# Vercel 部署故障排查指南

本文档提供 Vercel 部署常见错误的诊断和解决方案。

---

## 📋 目录

1. [快速诊断](#快速诊断)
2. [构建阶段错误](#构建阶段错误)
3. [运行时错误](#运行时错误)
4. [配置错误](#配置错误)
5. [性能问题](#性能问题)
6. [完整错误代码参考](#完整错误代码参考)

---

## 🔍 快速诊断

### 步骤 1: 检查构建日志

1. 进入 Vercel Dashboard
2. 选择你的项目 `leapgeo2`
3. 点击 "Deployments" 标签
4. 选择最新的部署
5. 点击 "View Build Logs"

### 步骤 2: 识别错误类型

| 错误阶段 | 特征 | 常见原因 |
|----------|------|----------|
| **构建失败** | 红色 × 标记，Build Failed | 依赖问题、TypeScript 错误、构建命令错误 |
| **部署成功但运行时错误** | 绿色 ✓ 部署，但页面 500/404 | 路由配置、环境变量、API 路径 |
| **超时错误** | Timeout 或 504 | 构建时间过长、函数执行超时 |
| **无文件输出** | "no files prepared" | 输出目录配置错误 |

---

## 🏗️ 构建阶段错误

### 错误 1: "no files were prepared"

**症状**:
```
Deploying outputs...
Deployment completed
Skipping cache upload because no files were prepared
```

**原因**:
- ❌ 缺少 `vercel.json` 配置
- ❌ `outputDirectory` 配置错误
- ❌ 构建命令未生成文件

**解决方案**:

✅ **已修复** (通过之前的配置)

验证 `vercel.json` 配置：
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist"
}
```

验证本地构建：
```bash
cd frontend
npm run build
ls -la dist/  # 应该看到 index.html 和 assets/
```

如果本地构建成功但 Vercel 仍然失败：
1. 清除 Vercel 缓存
2. 检查 `.vercelignore` 是否误排除了必要文件
3. 确认 `frontend/dist` 目录在构建后存在

---

### 错误 2: DEPLOYMENT_BLOCKED (403)

**症状**:
```
Error: DEPLOYMENT_BLOCKED
Status: 403
```

**原因**:
- 账户被暂停
- 超出免费配额
- 项目被标记为违规

**解决方案**:
1. 检查 Vercel 账户状态
2. 检查账单和使用量
3. 联系 Vercel 支持

---

### 错误 3: 构建超时

**症状**:
```
Error: Build exceeded maximum duration
```

**原因**:
- 免费计划限制：45 秒构建时间
- 依赖安装过慢
- 构建过程过于复杂

**解决方案**:

**优化 1: 减少依赖**
```bash
# 检查未使用的依赖
cd frontend
npx depcheck

# 移除未使用的包
npm uninstall <unused-package>
```

**优化 2: 使用缓存**

在 `vercel.json` 中启用缓存：
```json
{
  "github": {
    "silent": true
  }
}
```

**优化 3: 升级计划**
- Pro 计划：构建时间 10 分钟
- Enterprise：自定义

---

### 错误 4: TypeScript 编译错误

**症状**:
```
Type error: Cannot find module '...'
src/App.tsx(10,23): error TS2307
```

**解决方案**:

1. **本地复现错误**：
```bash
cd frontend
npm run type-check
```

2. **修复类型错误**：
```bash
# 安装缺失的类型定义
npm install -D @types/[package-name]

# 或临时禁用严格模式（不推荐）
# 修改 tsconfig.json
{
  "compilerOptions": {
    "strict": false
  }
}
```

3. **验证修复**：
```bash
npm run build
```

---

### 错误 5: npm install 失败

**症状**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案**:

**方法 1: 使用 --legacy-peer-deps**

修改 `vercel.json`：
```json
{
  "installCommand": "cd frontend && npm install --legacy-peer-deps"
}
```

**方法 2: 锁定版本**

确保 `package-lock.json` 提交到 Git：
```bash
cd frontend
npm install
git add package-lock.json
git commit -m "chore: Lock dependency versions"
git push
```

**方法 3: 清理并重新安装**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build  # 测试
git add package-lock.json
git commit -m "fix: Regenerate package-lock.json"
git push
```

---

## 🚀 运行时错误

### 错误 6: NOT_FOUND (404)

**症状**:
- 主页加载正常
- 子路由返回 404（如 `/projects`, `/dashboard`）

**原因**:
SPA 路由未配置

**解决方案**:

✅ **已修复** (在 `vercel.json` 中)

验证配置：
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

测试：
```bash
# 访问这些 URL 应该都返回你的应用
https://your-app.vercel.app/
https://your-app.vercel.app/projects
https://your-app.vercel.app/dashboard
```

---

### 错误 7: CORS 错误

**症状**:
```
Access to fetch at 'https://api.example.com' from origin 'https://your-app.vercel.app'
has been blocked by CORS policy
```

**原因**:
后端未允许前端域名

**解决方案**:

**前端配置** (`frontend/src/services/api.ts`):
```typescript
// 使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

**Vercel 环境变量**:
1. Dashboard → Settings → Environment Variables
2. 添加：
   ```
   VITE_API_URL=https://your-backend-api.com
   ```
3. 重新部署

**后端配置** (如果你控制后端):
```python
# backend/app/config.py
cors_origins = [
    "https://leapgeo2.vercel.app",
    "https://leapgeo2-*.vercel.app",  # 预览部署
    "http://localhost:5173"
]
```

---

### 错误 8: 环境变量未定义

**症状**:
```javascript
console.error: VITE_API_URL is undefined
```

**解决方案**:

1. **添加环境变量**：
   - Vercel Dashboard → Settings → Environment Variables
   - 添加所有需要的变量

2. **设置环境**：
   - Production
   - Preview
   - Development

3. **重新部署**：
   - 环境变量更改后需要重新部署
   - Dashboard → Deployments → Redeploy

4. **验证**：
```typescript
// 在代码中添加调试
console.log('API URL:', import.meta.env.VITE_API_URL);
```

---

### 错误 9: FUNCTION_INVOCATION_TIMEOUT (504)

**症状**:
```
Error: FUNCTION_INVOCATION_TIMEOUT
Status: 504
```

**原因**:
- Serverless 函数超时（免费计划：10 秒）
- API 请求过慢

**解决方案**:

**本项目不使用 Serverless 函数**（纯静态部署），如果遇到此错误：

1. 检查是否误配置了 `api/` 目录
2. 确认没有 Edge Functions
3. 验证所有 API 调用指向外部后端

---

## ⚙️ 配置错误

### 错误 10: vercel.json 语法错误

**症状**:
```
Error parsing vercel.json
```

**解决方案**:

1. **验证 JSON 格式**：
```bash
# 使用 jq 验证
cat vercel.json | jq .

# 或使用 Node.js
node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'))"
```

2. **常见语法错误**：
```json
// ❌ 错误：末尾有逗号
{
  "buildCommand": "npm run build",
}

// ✅ 正确：无末尾逗号
{
  "buildCommand": "npm run build"
}
```

3. **使用 Schema 验证**：

创建 `.vscode/settings.json`：
```json
{
  "json.schemas": [
    {
      "fileMatch": ["vercel.json"],
      "url": "https://openapi.vercel.sh/vercel.json"
    }
  ]
}
```

---

### 错误 11: 构建命令错误

**症状**:
```
Error: Command "npm run build" exited with 1
```

**诊断步骤**:

1. **本地复现**：
```bash
cd frontend
npm install
npm run build
```

2. **检查 package.json**：
```json
{
  "scripts": {
    "build": "tsc -b && vite build",  // ✓ 正确
    "prebuild": "npm run type-check"  // ✓ 前置检查
  }
}
```

3. **查看完整错误日志**：
   - Vercel Dashboard → Build Logs
   - 复制完整错误信息

---

## 🎯 性能问题

### 问题 1: 构建缓慢

**优化策略**:

1. **启用依赖缓存**（默认启用）
2. **减少构建步骤**：
```json
{
  "buildCommand": "npm run build",  // 而不是多个命令
  "installCommand": "npm ci"  // 使用 ci 而不是 install
}
```

3. **使用 pnpm（更快）**：
```json
{
  "installCommand": "pnpm install --frozen-lockfile"
}
```

---

### 问题 2: 部署包过大

**症状**:
```
Warning: Lambda size exceeded
```

**解决方案**:

本项目是静态部署，不应该有此问题。如果遇到：

1. **检查输出目录大小**：
```bash
cd frontend
npm run build
du -sh dist/
```

2. **优化资源**：
```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
}
```

3. **压缩图片**：
```bash
# 使用 imagemin 或在线工具
```

---

## 📊 完整错误代码参考

### 应用程序错误（按优先级）

#### 🔴 高优先级（立即修复）

| 错误代码 | HTTP | 类别 | 常见原因 | 解决方案 |
|----------|------|------|----------|----------|
| `DEPLOYMENT_BLOCKED` | 403 | 部署 | 账户问题 | 联系支持 |
| `DEPLOYMENT_NOT_FOUND` | 404 | 部署 | 部署被删除 | 重新部署 |
| `FUNCTION_INVOCATION_FAILED` | 500 | 函数 | 代码错误 | 检查函数代码 |
| `NOT_FOUND` | 404 | 部署 | 路由错误 | 配置 rewrites |

#### 🟡 中优先级（影响用户体验）

| 错误代码 | HTTP | 类别 | 常见原因 | 解决方案 |
|----------|------|------|----------|----------|
| `FUNCTION_INVOCATION_TIMEOUT` | 504 | 函数 | 超时 | 优化代码/升级计划 |
| `MIDDLEWARE_INVOCATION_TIMEOUT` | 504 | 函数 | 中间件超时 | 优化中间件 |
| `DNS_HOSTNAME_NOT_FOUND` | 502 | DNS | DNS 配置错误 | 检查 DNS 记录 |

#### 🟢 低优先级（边缘情况）

| 错误代码 | HTTP | 类别 | 常见原因 | 解决方案 |
|----------|------|------|----------|----------|
| `RANGE_NOT_VALID` | 416 | 请求 | Range 头错误 | 客户端问题 |
| `URL_TOO_LONG` | 414 | 请求 | URL 过长 | 使用 POST |

---

## 🛠️ 调试工具和技巧

### 1. 本地预览生产构建

```bash
cd frontend
npm run build
npm run preview
# 访问 http://localhost:4173
```

### 2. 使用 Vercel CLI 本地测试

```bash
# 安装 Vercel CLI
npm install -g vercel

# 本地运行（模拟 Vercel 环境）
vercel dev

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 3. 检查构建输出

```bash
# 查看构建产物
cd frontend/dist
tree  # 或 ls -R

# 验证关键文件存在
ls index.html
ls assets/
```

### 4. 测试路由

```bash
# 测试所有路由
curl https://your-app.vercel.app/
curl https://your-app.vercel.app/dashboard
curl https://your-app.vercel.app/projects
```

---

## 📋 部署检查清单

在每次部署前，确认：

### 构建阶段
- [ ] 本地构建成功：`npm run build`
- [ ] 无 TypeScript 错误：`npm run type-check`
- [ ] 无 ESLint 错误：`npm run lint`
- [ ] `vercel.json` 语法正确
- [ ] `package.json` 脚本正确
- [ ] 所有依赖在 `package.json` 中声明

### 配置阶段
- [ ] 环境变量已设置
- [ ] CORS 配置正确
- [ ] 路由重写配置（SPA）
- [ ] `.vercelignore` 配置正确

### 运行时阶段
- [ ] API 端点可访问
- [ ] 静态资源加载
- [ ] 路由导航正常
- [ ] 控制台无错误

---

## 🆘 获取帮助

### 1. Vercel 文档
- https://vercel.com/docs
- https://vercel.com/docs/errors

### 2. Vercel 支持
- 社区：https://github.com/vercel/vercel/discussions
- 支持：https://vercel.com/support

### 3. 本项目资源
- [DEPLOYMENT.md](DEPLOYMENT.md) - 部署指南
- [README.md](README.md) - 项目概览
- [GIT-WORKFLOW-GUIDE.md](GIT-WORKFLOW-GUIDE.md) - Git 工作流

---

## 🔧 常见问题速查表

| 问题 | 快速解决方案 |
|------|-------------|
| 构建失败 | `npm run build` 本地测试 |
| 404 错误 | 检查 `vercel.json` rewrites |
| 环境变量未定义 | Vercel Dashboard → Settings → Environment Variables |
| CORS 错误 | 更新后端 CORS 配置 |
| 构建超时 | 优化依赖或升级计划 |
| 缓存问题 | 清除 Vercel 缓存并重新部署 |

---

## 📞 紧急故障处理流程

### 步骤 1: 识别问题
```bash
# 检查部署状态
vercel ls

# 查看最新日志
vercel logs [deployment-url]
```

### 步骤 2: 回滚到稳定版本
```bash
# 在 Vercel Dashboard
Deployments → 选择之前的成功部署 → Promote to Production
```

### 步骤 3: 修复问题
```bash
# 在本地修复
git checkout -b hotfix/deployment-issue
# 修改代码
git commit -m "fix: Resolve deployment issue"
git push

# 或使用 Vercel CLI
vercel --prod
```

### 步骤 4: 验证修复
```bash
# 检查构建日志
# 测试所有关键路径
# 验证环境变量
```

---

**最后更新**: 2025-10-14
**维护者**: Leap GEO Platform Team

**快速帮助**: 如果遇到未列出的错误，请复制完整错误信息并查看 Vercel 构建日志。
