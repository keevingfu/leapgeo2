# Leap GEO Platform - 部署配置文档

> **项目**: Leap AI GEO Platform
> **部署平台**: Vercel
> **GitHub 仓库**: https://github.com/keevingfu/leapgeo2.git
> **配置日期**: 2025-01-18

---

## 🚀 自动部署配置

### 状态总览

| 配置项 | 状态 | 说明 |
|--------|------|------|
| ✅ Git 集成 | 已启用 | 推送到 `main` 分支自动部署 |
| ✅ Vercel 配置 | 已完成 | `vercel.json` 已优化 |
| ✅ 构建命令 | 已配置 | 自动检测 Vite 项目 |
| ✅ 部署忽略 | 已配置 | `.vercelignore` 排除后端文件 |
| ✅ 环境变量 | 已保护 | `.env` 文件不会上传 |

---

## 📋 部署流程

每次推送到 GitHub main 分支时，Vercel 会自动触发部署：

1. **本地开发** → 修改代码
2. **暂存更改** → `git add .`
3. **本地提交** → `git commit -m "message"`
4. **推送到 GitHub** → `git push origin main`
5. **自动触发** → Vercel 检测到推送
6. **自动构建** → `npm install && npm run build`
7. **部署到生产** → 构建成功后自动上线

---

## ⚙️ Vercel 配置详解

### vercel.json 核心配置

\`\`\`json
{
  "version": 2,
  "name": "leapgeo2",
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",

  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
\`\`\`

**关键配置说明**：
- `git.deploymentEnabled.main: true` - 启用 main 分支自动部署
- `buildCommand` - 自动进入 frontend 目录构建
- `outputDirectory` - 指定 Vite 构建输出目录
- `framework: "vite"` - Vercel 自动优化 Vite 构建

---

## 🛠️ 常见问题排查

### 问题 1: 推送后没有触发部署

**排查步骤**:

1. **检查 Vercel Git 集成**
   - 访问 Vercel 控制台 → Settings → Git
   - 确认 GitHub 仓库已连接
   - 确认 Production Branch 设置为 `main`

2. **检查 GitHub Webhook**
   - 访问 GitHub 仓库 → Settings → Webhooks
   - 找到 Vercel webhook
   - 检查 Recent Deliveries 是否成功

3. **手动触发部署**
   - 在 Vercel 控制台
   - Deployments → Redeploy

---

### 问题 2: 部署失败 - 构建错误

**症状**: Vercel 构建失败，显示 TypeScript 错误

**解决方案**:
\`\`\`bash
# 本地先验证
cd frontend
npm run type-check
npm run build

# 修复所有错误后再推送
git add .
git commit -m "fix: resolve type errors"
git push origin main
\`\`\`

---

## 📈 部署历史记录

### 2025-01-18

**Commit**: `cac45af`
- ✅ 修复 Vercel 配置冲突错误
- ✅ 移除 deprecated `routes` 配置
- ✅ 保留现代 `rewrites` + `headers` 配置
- **部署状态**: 成功

**Commit**: `6b89bb8`
- ✅ 实现 JWT 认证系统
- ✅ 更新项目文档（CLAUDE.md, DEVELOPMENT-LOG.md, CICD-LOG.md）
- ✅ 配置环境变量保护
- **部署状态**: 成功

---

## 🎯 Vercel 控制台必须确认的设置

请访问 Vercel 项目设置页面，确认以下选项：

### 访问路径
1. 访问: https://vercel.com/dashboard
2. 选择项目: `leapgeo2`
3. 进入: Settings → Git

### 必须启用的选项

- **Production Branch**: `main` ✅
- **Automatic Deployments**: 开启 ✅
- **GitHub Integration**: 已连接到 `keevingfu/leapgeo2` ✅

---

**最后更新**: 2025-01-18
**维护者**: Cavin Fu (keevingfu)
**部署平台**: Vercel
**GitHub 仓库**: https://github.com/keevingfu/leapgeo2.git
