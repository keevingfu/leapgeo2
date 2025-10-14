# 🤖 自动检查系统说明

## 📋 概述

本项目配置了完整的自动验证系统，确保每次任务完成后项目能够正常运行，无错误。

---

## 🎯 检查类型

### 1. **类型检查** (Type Check)
- **命令**: `npm run type-check`
- **作用**: 验证 TypeScript 类型定义正确
- **何时运行**: 构建前、手动验证时

### 2. **构建检查** (Build Check)
- **命令**: `npm run build`
- **作用**: 确保项目可以成功打包
- **何时运行**: 发布前、完整验证时

### 3. **健康检查** (Health Check)
- **命令**: `npm run health-check`
- **作用**: 启动开发服务器并验证无错误
- **检查内容**:
  - ✅ 端口可用性
  - ✅ 服务器启动
  - ✅ HTTP 响应正常
  - ✅ 无编译错误
  - ✅ 无运行时错误

### 4. **快速检查** (Quick Check)
- **命令**: `npm run quick-check`
- **作用**: 快速验证类型和构建
- **适用场景**: 提交代码前快速验证

### 5. **完整验证** (Full Verify)
- **命令**: `npm run verify`
- **作用**: 运行类型检查 + 构建检查
- **适用场景**: 完成功能开发后

---

## 🚀 使用方法

### 快速开始

```bash
# 1. 快速检查（类型 + 构建）
npm run quick-check

# 2. 完整验证
npm run verify

# 3. 健康检查（启动服务器并验证）
npm run health-check

# 4. 自动验证（读取配置文件）
bash scripts/auto-verify.sh
```

### 手动运行单个检查

```bash
# 只检查类型
npm run type-check

# 只检查构建
npm run build

# 只检查代码质量
npm run lint
```

---

## ⚙️ 配置文件

### `.autocheck.config.json`

配置文件定义了自动检查的行为：

```json
{
  "enabled": true,
  "checks": {
    "typeCheck": {
      "enabled": true,
      "failOnError": true
    },
    "build": {
      "enabled": true,
      "failOnError": true
    },
    "healthCheck": {
      "enabled": true,
      "runOnDemand": true
    }
  }
}
```

**配置项说明**:
- `enabled`: 是否启用该检查
- `failOnError`: 出错时是否停止后续检查
- `runOnDemand`: 是否仅在手动触发时运行

---

## 📝 日志记录

所有检查结果会记录到 `.autocheck.log`：

```bash
# 查看日志
cat .autocheck.log

# 实时监控日志
tail -f .autocheck.log

# 清空日志
> .autocheck.log
```

---

## 🔄 自动触发时机

### 自动触发的场景

1. **安装依赖后** (`postinstall`)
   - 显示成功消息

2. **构建前** (`prebuild`)
   - 自动运行类型检查

3. **手动验证**
   - 使用 `npm run verify`
   - 使用 `bash scripts/auto-verify.sh`

### Git Hooks 集成（可选）

可以使用 Husky 在 Git 提交前自动运行检查：

```bash
# 安装 husky
npm install -D husky

# 初始化
npx husky init

# 添加 pre-commit hook
echo "npm run quick-check" > .husky/pre-commit
```

---

## 📊 检查流程图

```
开始
  ↓
类型检查 (TypeScript)
  ↓
  ✅ 通过 → 继续
  ❌ 失败 → 停止并报错
  ↓
构建检查 (Vite Build)
  ↓
  ✅ 通过 → 继续
  ❌ 失败 → 停止并报错
  ↓
健康检查 (Dev Server)
  ↓
  ✅ 通过 → 完成
  ❌ 失败 → 停止并报错
```

---

## 🛠️ 故障排除

### 问题 1: 类型检查失败

```bash
# 查看详细错误
npm run type-check

# 常见原因:
# - 缺少类型定义
# - 类型不匹配
# - 导入路径错误
```

### 问题 2: 构建失败

```bash
# 查看构建日志
cat /tmp/build.log

# 常见原因:
# - 语法错误
# - 缺少依赖
# - 环境变量未设置
```

### 问题 3: 健康检查超时

```bash
# 检查端口占用
lsof -ti:5173 | xargs kill -9

# 重新运行
npm run health-check
```

### 问题 4: 脚本权限错误

```bash
# 添加执行权限
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

---

## 📈 最佳实践

### 1. **开发前**
```bash
npm run type-check  # 确保类型正确
```

### 2. **开发中**
```bash
npm run dev  # 正常开发，热更新
```

### 3. **提交前**
```bash
npm run quick-check  # 快速验证
```

### 4. **发布前**
```bash
npm run verify        # 完整验证
npm run health-check  # 健康检查
```

### 5. **每次任务完成后**
```bash
bash scripts/auto-verify.sh  # 自动验证
```

---

## 🎨 自定义检查

### 添加新的检查项

1. 在 `.autocheck.config.json` 中添加配置：

```json
{
  "checks": {
    "myCustomCheck": {
      "enabled": true,
      "command": "npm run my-check",
      "description": "My custom validation",
      "failOnError": true
    }
  }
}
```

2. 在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "my-check": "echo 'Running custom check...'"
  }
}
```

3. 在 `scripts/auto-verify.sh` 中添加检查逻辑。

---

## 📦 相关文件

```
frontend/
├── .autocheck.config.json      # 配置文件
├── .autocheck.log              # 日志文件（自动生成）
├── AUTO-CHECK-README.md        # 本文档
├── scripts/
│   ├── health-check.js         # 健康检查脚本
│   ├── quick-check.sh          # 快速检查脚本
│   └── auto-verify.sh          # 自动验证脚本
└── package.json                # NPM 脚本配置
```

---

## ✅ 检查清单

在每次任务完成后，确保以下检查通过：

- [ ] TypeScript 类型检查无错误
- [ ] 项目可以成功构建
- [ ] 开发服务器可以正常启动
- [ ] 浏览器可以访问应用
- [ ] 控制台无错误信息
- [ ] 所有页面正常渲染
- [ ] 交互功能正常工作

---

## 🔗 相关命令速查

| 命令 | 用途 | 耗时 |
|------|------|------|
| `npm run type-check` | 类型检查 | ~3s |
| `npm run build` | 构建验证 | ~10s |
| `npm run health-check` | 健康检查 | ~30s |
| `npm run quick-check` | 快速检查 | ~15s |
| `npm run verify` | 完整验证 | ~15s |
| `bash scripts/auto-verify.sh` | 自动验证 | ~20s |

---

## 💡 提示

1. **定期运行**: 建议每完成一个功能模块就运行一次完整验证
2. **提交前必查**: 提交代码到 Git 前必须通过 `quick-check`
3. **发布前必查**: 部署到生产环境前必须通过 `verify` 和 `health-check`
4. **CI/CD 集成**: 可以将这些检查集成到 CI/CD 流程中

---

## 📞 问题反馈

如遇到问题，请检查：
1. `.autocheck.log` 日志文件
2. `/tmp/*_output.log` 临时日志
3. 浏览器控制台错误信息

---

**最后更新**: 2025-10-10
**版本**: 1.0.0
