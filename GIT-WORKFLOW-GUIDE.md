# Git 工作流和自动同步指南

本文档详细说明如何使用 Leap GEO Platform 项目的 Git 工作流和自动同步功能。

---

## 📋 目录

1. [快速开始](#快速开始)
2. [自动同步功能](#自动同步功能)
3. [Git 工作流程](#git-工作流程)
4. [GitHub Actions CI/CD](#github-actions-cicd)
5. [安全最佳实践](#安全最佳实践)
6. [常见问题](#常见问题)
7. [故障排查](#故障排查)

---

## 🚀 快速开始

### 克隆仓库

```bash
git clone https://github.com/keevingfu/leapgeo2.git
cd leapgeo2
```

### 创建 .env 文件

**重要**: 这是必需的步骤！

```bash
# 创建 .env 文件
cat > .env << 'EOF'
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=https://github.com/keevingfu/leapgeo2.git
GITHUB_USERNAME=keevingfu
GITHUB_REPO_NAME=leapgeo2
EOF

# 设置安全权限（仅所有者可读写）
chmod 600 .env
```

### 验证配置

```bash
# 检查 Git 配置
git config user.name
git config user.email

# 检查远程仓库
git remote -v

# 检查当前分支
git branch
```

---

## 🔄 自动同步功能

### 工作原理

本项目使用 **Git post-commit hook** 实现自动同步：

1. 你执行 `git commit`
2. Git hook 自动触发
3. 检查当前分支（只在 main/dev/develop 分支生效）
4. 自动执行 `git push origin [branch]`
5. 显示推送结果

### 视觉效果

```bash
$ git commit -m "Update documentation"

🚀 Auto-sync to GitHub...
📤 Pushing branch: main
To https://github.com/keevingfu/leapgeo2.git
   abc1234..def5678  main -> main
✅ Successfully pushed to origin/main

[main def5678] Update documentation
 1 file changed, 10 insertions(+), 2 deletions(-)
```

### 启用/禁用自动同步

**禁用自动同步**（保留手动控制）：
```bash
chmod -x .git/hooks/post-commit
```

**重新启用**：
```bash
chmod +x .git/hooks/post-commit
```

**检查状态**：
```bash
ls -l .git/hooks/post-commit
# -rwxr-xr-x = 启用（可执行）
# -rw-r--r-- = 禁用（不可执行）
```

---

## 📝 Git 工作流程

### 标准工作流

#### 1. 更新本地代码

```bash
# 拉取最新代码
git pull origin main
```

#### 2. 创建功能分支（可选）

```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 或修复分支
git checkout -b fix/bug-description
```

#### 3. 进行修改

```bash
# 编辑文件...
# 使用你喜欢的编辑器修改代码
```

#### 4. 暂存更改

```bash
# 暂存所有更改
git add -A

# 或暂存特定文件
git add frontend/src/components/NewComponent.tsx

# 查看暂存状态
git status
```

#### 5. 提交更改

```bash
# 提交（会自动触发推送）
git commit -m "feat: Add new component"

# 🚀 自动推送到 GitHub!
```

#### 6. 合并到主分支（如果使用功能分支）

```bash
# 切换到主分支
git checkout main

# 合并功能分支
git merge feature/new-feature

# 推送（如果自动推送被禁用）
git push origin main
```

### 提交信息规范

使用 **Conventional Commits** 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（不是新功能也不是修复）
- `test`: 添加测试
- `chore`: 维护任务（构建、依赖更新等）
- `perf`: 性能优化
- `ci`: CI/CD 配置更改

**示例**:

```bash
# 简单提交
git commit -m "feat: Add user authentication"

# 详细提交
git commit -m "fix: Resolve API timeout issue

- Increased timeout from 10s to 30s
- Added retry logic for failed requests
- Updated error handling

Fixes #123"
```

---

## 🤖 GitHub Actions CI/CD

### CI/CD Pipeline

每次推送到 `main` 分支都会触发以下检查：

#### 1. **Frontend Build & Test**
```yaml
✅ Type checking (TypeScript)
✅ Production build
✅ Upload build artifacts
```

#### 2. **Backend Validation**
```yaml
✅ Python syntax check
✅ Dependency installation test
```

#### 3. **Security Scan**
```yaml
✅ Trivy vulnerability scanner
✅ SARIF results upload to GitHub Security
```

### 查看 CI/CD 状态

**方法 1: GitHub 网页**
1. 访问: https://github.com/keevingfu/leapgeo2/actions
2. 查看最近的工作流运行

**方法 2: README 徽章**
- README.md 顶部显示 CI/CD 状态徽章
- 绿色 = 通过 ✅
- 红色 = 失败 ❌

**方法 3: Git 推送输出**
```bash
# 推送后，GitHub 会返回检查状态链接
remote: Create a pull request for 'feature-branch' on GitHub by visiting:
remote:      https://github.com/keevingfu/leapgeo2/pull/new/feature-branch
```

### 自动文档同步

修改任何 Markdown 文件（`*.md`）会触发：
- 自动更新文档索引
- 生成 `DOCS-INDEX.md`
- 自动提交并推送（使用 `[skip ci]` 避免循环）

---

## 🔐 安全最佳实践

### 1. 保护 GitHub Token

**永远不要**将 token 提交到 Git！

✅ **正确做法**:
```bash
# Token 存储在 .env 文件中（已在 .gitignore）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# 文件权限设置为 600
chmod 600 .env
```

❌ **错误做法**:
```bash
# 不要硬编码在脚本中
git remote add origin "https://ghp_token@github.com/..."

# 不要提交到代码仓库
git add .env  # ❌ 危险！
```

### 2. 检查敏感文件

运行以下命令确保没有敏感文件被跟踪：

```bash
# 检查 .gitignore
cat .gitignore | grep -E "(\.env|token|password|secret)"

# 查看当前暂存文件
git status

# 查看历史提交中的敏感文件（高级）
git log --all --full-history --source -- .env
```

### 3. 撤销意外提交的敏感文件

如果不小心提交了 `.env` 文件：

```bash
# 从 Git 历史中完全移除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送（谨慎使用！）
git push origin --force --all

# 立即更换泄露的 token！
```

### 4. Token 权限最小化

创建 GitHub Personal Access Token 时，只授予必要权限：

✅ **推荐权限**:
- `repo` - 完整仓库访问权限（如果是私有仓库）
- `workflow` - 更新 GitHub Actions（如果需要）

❌ **不要授予**:
- `delete_repo` - 删除仓库
- `admin:org` - 组织管理
- `admin:gpg_key` - GPG 密钥管理

---

## 🔍 常见问题

### Q1: 自动推送失败怎么办？

**症状**:
```
❌ Failed to push to remote. Please push manually.
   Run: git push origin main
```

**解决方法**:
```bash
# 1. 检查网络连接
ping github.com

# 2. 检查 Token 是否有效
source .env
git ls-remote "https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}.git"

# 3. 手动推送
git push origin main

# 4. 如果仍然失败，检查 Token 权限或过期时间
```

### Q2: 如何查看自动推送日志？

**方法 1: 终端输出**
- 每次 commit 后会立即显示推送结果

**方法 2: Git log**
```bash
# 查看最近 5 次提交和推送
git log --oneline -5

# 查看远程分支状态
git log origin/main --oneline -5
```

### Q3: 如何暂时禁用自动推送但保留提交？

```bash
# 禁用 hook
chmod -x .git/hooks/post-commit

# 正常提交（不会自动推送）
git commit -m "Work in progress"

# 稍后手动推送
git push origin main

# 重新启用 hook
chmod +x .git/hooks/post-commit
```

### Q4: 多人协作时如何避免冲突？

**推荐工作流**:
```bash
# 1. 总是先拉取最新代码
git pull origin main

# 2. 在功能分支上工作
git checkout -b feature/my-feature

# 3. 定期合并主分支
git checkout main
git pull origin main
git checkout feature/my-feature
git merge main

# 4. 完成后创建 Pull Request 而不是直接推送到 main
```

### Q5: CI/CD 检查失败会阻止推送吗？

**不会！** CI/CD 检查是在推送**之后**运行的：

1. 你执行 `git commit`
2. 自动推送到 GitHub ✅
3. GitHub Actions 开始运行
4. 如果失败，你会收到通知，但代码已经在仓库中

**如果 CI 失败**:
```bash
# 修复问题
# 编辑文件...

# 提交修复
git add .
git commit -m "fix: Resolve CI test failures"
# 自动推送修复
```

---

## 🛠️ 故障排查

### 问题 1: "Permission denied" 错误

**错误信息**:
```
fatal: unable to access 'https://github.com/keevingfu/leapgeo2.git/':
The requested URL returned error: 403
```

**原因**: GitHub Token 无效或过期

**解决方法**:
```bash
# 1. 生成新的 GitHub Personal Access Token
# 访问: https://github.com/settings/tokens

# 2. 更新 .env 文件
nano .env
# 更新 GITHUB_TOKEN=new_token_here

# 3. 更新远程 URL
source .env
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}.git"

# 4. 测试
git push origin main
```

### 问题 2: Hook 不执行

**症状**: Commit 后没有看到自动推送消息

**检查清单**:
```bash
# 1. 检查 hook 是否存在
ls -la .git/hooks/post-commit

# 2. 检查执行权限
# 应该显示 -rwxr-xr-x（x = 可执行）
ls -l .git/hooks/post-commit

# 3. 手动执行测试
.git/hooks/post-commit

# 4. 检查分支（只在 main/dev/develop 生效）
git branch --show-current

# 5. 重新安装 hook
chmod +x .git/hooks/post-commit
```

### 问题 3: 推送缓慢

**症状**: 推送需要很长时间

**解决方法**:
```bash
# 1. 检查仓库大小
du -sh .git

# 2. 如果太大（>100MB），清理历史
git gc --aggressive --prune=now

# 3. 检查网络速度
curl -o /dev/null https://github.com/

# 4. 使用 SSH 代替 HTTPS（更快）
git remote set-url origin git@github.com:keevingfu/leapgeo2.git
```

### 问题 4: 合并冲突

**症状**: `git pull` 时出现冲突

**解决方法**:
```bash
# 1. 查看冲突文件
git status

# 2. 手动编辑冲突文件
# 查找 <<<<<<< HEAD 标记

# 3. 解决冲突后
git add .
git commit -m "fix: Resolve merge conflicts"
# 自动推送

# 或中止合并
git merge --abort
```

---

## 📚 参考资源

### Git 文档
- [Git 官方文档](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Conventional Commits](https://www.conventionalcommits.org/)

### GitHub Actions
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Workflow 语法](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

### 项目文档
- [README.md](README.md) - 项目总览
- [CLAUDE.md](CLAUDE.md) - AI 开发指南
- [HEALTH-CHECK-REPORT.md](HEALTH-CHECK-REPORT.md) - 系统健康报告

---

## 📞 获取帮助

如果遇到问题：

1. **查看日志**:
   ```bash
   git log --oneline -10
   git reflog
   ```

2. **检查配置**:
   ```bash
   git config --list
   git remote -v
   ```

3. **查看 GitHub 状态**:
   - https://www.githubstatus.com/

4. **提交 Issue**:
   - https://github.com/keevingfu/leapgeo2/issues

---

**最后更新**: 2025-10-14
**维护者**: Claude Code 🤖
