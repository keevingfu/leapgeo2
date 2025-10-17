# Vercel 自动部署配置指南

本文档指导您如何配置 GitHub Actions 自动部署到 Vercel。

---

## 📋 前置要求

- ✅ GitHub 账户
- ✅ Vercel 账户
- ✅ 项目已推送到 GitHub (`https://github.com/keevingfu/leapgeo2.git`)

---

## 🚀 配置步骤

### 步骤 1: 获取 Vercel Token

1. 访问 [Vercel Settings - Tokens](https://vercel.com/account/tokens)
2. 点击 **"Create Token"**
3. 填写以下信息：
   - **Token Name**: `github-actions-deploy`
   - **Scope**: 选择您的账户或团队
   - **Expiration**: 选择 **"No Expiration"** 或设置过期时间
4. 点击 **"Create Token"**
5. **复制生成的 Token** (只会显示一次！)
   - 格式类似: `vercel_token_abc123xyz...`

---

### 步骤 2: 配置 GitHub Secrets

1. 访问 GitHub 仓库设置：
   ```
   https://github.com/keevingfu/leapgeo2/settings/secrets/actions
   ```

2. 点击 **"New repository secret"**

3. 添加以下 Secret：

   **Secret Name**: `VERCEL_TOKEN`
   **Value**: 粘贴步骤 1 中复制的 Vercel Token

4. 点击 **"Add secret"**

---

### 步骤 3: 配置 Vercel 项目 (如果尚未创建)

#### 方法 1: 通过 Vercel Dashboard (推荐)

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New" → "Project"**
3. 选择 **"Import Git Repository"**
4. 搜索并选择 `keevingfu/leapgeo2`
5. 配置项目：
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (留空或选择根目录)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`
6. 点击 **"Deploy"**

#### 方法 2: 通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI (如果尚未安装)
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 在项目根目录运行
vercel link

# 4. 按提示选择：
# - Set up and deploy: Y
# - Which scope: 选择您的账户
# - Link to existing project: N (如果是新项目)
# - Project name: leapgeo2
# - In which directory: ./frontend
```

---

### 步骤 4: 验证配置文件

确认以下文件存在且配置正确：

#### ✅ `.github/workflows/vercel-deploy.yml`

```yaml
name: Vercel Deployment

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g vercel@latest
      - run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
      - run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
      - run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
```

#### ✅ `vercel.json` (项目根目录)

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite"
}
```

#### ✅ `package.json` (项目根目录)

```json
{
  "name": "leapgeo2",
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "vercel-build": "cd frontend && npm install && npm run build"
  }
}
```

---

## 🧪 测试自动部署

### 方法 1: 推送代码触发

```bash
# 1. 进行任意代码修改
echo "# Test Auto Deploy" >> README.md

# 2. 提交并推送到 main 分支
git add .
git commit -m "test: Trigger Vercel auto-deploy"
git push origin main

# 3. 查看 GitHub Actions 日志
# 访问: https://github.com/keevingfu/leapgeo2/actions
```

### 方法 2: 手动触发

1. 访问 GitHub Actions 页面：
   ```
   https://github.com/keevingfu/leapgeo2/actions
   ```

2. 选择 **"Vercel Deployment"** workflow

3. 点击 **"Run workflow"** → **"Run workflow"**

4. 等待部署完成（通常 2-3 分钟）

---

## 📊 监控部署状态

### GitHub Actions 日志

访问: `https://github.com/keevingfu/leapgeo2/actions`

查看实时构建和部署日志。

### Vercel Dashboard

访问: `https://vercel.com/keevingfu/leapgeo2`

查看：
- 部署历史
- 部署日志
- 生产环境 URL
- 性能指标

---

## 🔧 故障排查

### 问题 1: `Error: Missing required env var: VERCEL_TOKEN`

**原因**: GitHub Secret 未配置或名称不匹配

**解决方案**:
1. 检查 Secret 名称是否为 `VERCEL_TOKEN` (全大写)
2. 确认 Token 已正确添加到仓库 Secrets
3. 重新触发 workflow

### 问题 2: `Error: No token found`

**原因**: Vercel Token 无效或已过期

**解决方案**:
1. 重新生成 Vercel Token
2. 更新 GitHub Secret
3. 重新部署

### 问题 3: `Error: Project not found`

**原因**: Vercel 项目尚未创建或未正确链接

**解决方案**:
1. 先在 Vercel Dashboard 手动创建项目
2. 或者使用 `vercel link` 命令链接项目
3. 确认 `.vercel/project.json` 文件存在

### 问题 4: `Build failed`

**原因**: 构建命令或配置错误

**解决方案**:
1. 本地测试构建: `cd frontend && npm run build`
2. 检查 `vercel.json` 配置
3. 查看详细错误日志

---

## 🎯 自动部署流程图

```
本地代码修改
    ↓
git commit
    ↓
git push origin main
    ↓
GitHub 接收推送
    ↓
触发 GitHub Actions
    ↓
.github/workflows/vercel-deploy.yml
    ↓
1. Checkout 代码
2. 安装 Vercel CLI
3. Pull Vercel 配置
4. 构建项目 (npm run build)
5. 部署到 Vercel
    ↓
部署完成 ✅
    ↓
Vercel 分配 URL
    ↓
访问 https://leapgeo2.vercel.app
```

---

## 📝 环境变量配置 (可选)

如果前端需要 API 地址等环境变量：

1. 在 Vercel Dashboard 中配置：
   - 进入 **Settings** → **Environment Variables**
   - 添加变量：
     ```
     VITE_API_URL = https://your-backend-api.onrender.com
     ```

2. 在 GitHub Actions 中配置：
   ```yaml
   - name: Set Environment Variables
     run: |
       echo "VITE_API_URL=${{ secrets.API_URL }}" >> frontend/.env
   ```

---

## 🔐 安全最佳实践

1. **Never commit tokens**: 永远不要将 Vercel Token 提交到代码库
2. **Use GitHub Secrets**: 使用 GitHub Secrets 存储敏感信息
3. **Rotate tokens**: 定期轮换 Vercel Token
4. **Limit scope**: 为 Token 设置最小权限范围
5. **Monitor deployments**: 定期检查部署日志

---

## 🚦 当前状态检查清单

- [ ] Vercel Token 已生成
- [ ] GitHub Secret `VERCEL_TOKEN` 已配置
- [ ] Vercel 项目已创建
- [ ] `.github/workflows/vercel-deploy.yml` 文件存在
- [ ] `vercel.json` 配置正确
- [ ] 本地构建测试通过
- [ ] 首次部署成功
- [ ] Auto-deploy 测试通过

---

## 🎉 完成！

配置完成后，每次推送代码到 `main` 分支，GitHub Actions 会自动：

1. ✅ 构建前端项目
2. ✅ 部署到 Vercel
3. ✅ 生成部署 URL
4. ✅ 发送部署通知

**部署 URL**: `https://leapgeo2-<unique-id>.vercel.app`

---

## 📞 支持

遇到问题？查看：

- [Vercel 文档](https://vercel.com/docs)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [项目 DEPLOYMENT.md](./DEPLOYMENT.md)
- [项目 VERCEL-TROUBLESHOOTING.md](./VERCEL-TROUBLESHOOTING.md)

---

**最后更新**: 2025-10-17
**维护者**: Leap GEO Platform Team
