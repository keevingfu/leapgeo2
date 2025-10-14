# GEO Platform 前端快速启动指南

**目标**: 10分钟内启动可运行的React应用

---

## 🚀 快速启动（复制粘贴执行）

### Step 1: 创建React项目 (2分钟)
```bash
cd /Users/cavin/Desktop/dev/leapgeo2

# 创建Vite + React + TypeScript项目
npm create vite@latest frontend -- --template react-ts

# 进入项目目录
cd frontend

# 安装基础依赖
npm install

# 启动开发服务器
npm run dev
```

**✅ 验证**: 浏览器打开 http://localhost:5173，看到Vite + React欢迎页面

---

### Step 2: 安装UI依赖 (2分钟)
```bash
# 安装Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安装UI库和工具
npm install lucide-react recharts react-router-dom zustand axios

# 安装类型定义
npm install -D @types/node
```

---

### Step 3: 配置Tailwind CSS (1分钟)
```bash
# 更新 tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
EOF

# 更新 src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF
```

---

### Step 4: 创建第一个页面 (5分钟)

#### 4.1 创建基础组件
```bash
# 创建组件目录结构
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/pages
mkdir -p src/types
mkdir -p src/utils
```

#### 4.2 创建Button组件
```bash
cat > src/components/ui/Button.tsx << 'EOF'
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
  className = '',
}) => {
  const baseStyles = 'rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};
EOF
```

#### 4.3 创建Card组件
```bash
cat > src/components/ui/Card.tsx << 'EOF'
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  footer,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};
EOF
```

#### 4.4 创建Dashboard页面
```bash
cat > src/pages/Dashboard.tsx << 'EOF'
import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Projects', value: '3', icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Prompts', value: '290', icon: Users, color: 'bg-green-500' },
    { label: 'Avg Citation Rate', value: '31.7%', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Total Citations', value: '847', icon: BarChart3, color: 'bg-orange-500' },
  ];

  const projects = [
    { id: 'eufy', name: 'Eufy Robot Vacuum', citationRate: 0.35, prompts: 89 },
    { id: 'sweetnight', name: 'SweetNight Mattress', citationRate: 0.32, prompts: 156 },
    { id: 'hisense', name: 'Hisense TV', citationRate: 0.28, prompts: 45 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GEO Platform Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome to your Generative Engine Optimization platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="flex items-center space-x-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Projects List */}
        <Card title="Active Projects">
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.prompts} prompts</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {(project.citationRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">Citation Rate</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="primary" className="w-full">
              Create New Project
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
EOF
```

#### 4.5 更新App.tsx
```bash
cat > src/App.tsx << 'EOF'
import { Dashboard } from './pages/Dashboard';

function App() {
  return <Dashboard />;
}

export default App;
EOF
```

---

### Step 5: 运行项目 (1分钟)
```bash
# 确保在 frontend 目录
npm run dev
```

**✅ 验证**:
- 浏览器自动打开 http://localhost:5173
- 看到GEO Platform Dashboard
- 显示4个统计卡片
- 显示3个项目列表
- 按钮可点击（虽然暂无功能）

---

## 🎯 验证清单

### ✅ 基础功能
- [ ] 开发服务器启动无错误
- [ ] 页面正常显示
- [ ] Tailwind样式生效（颜色、间距正确）
- [ ] 图标显示正常（Lucide React）
- [ ] 组件可交互（按钮hover效果）

### ✅ 控制台检查
打开浏览器开发者工具（F12）：
- [ ] Console无红色错误
- [ ] Network标签显示资源正常加载
- [ ] 无404错误

---

## 📁 当前项目结构

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx       ✅
│   │       └── Card.tsx         ✅
│   ├── pages/
│   │   └── Dashboard.tsx        ✅
│   ├── App.tsx                  ✅
│   ├── main.tsx
│   └── index.css                ✅
├── package.json
├── vite.config.ts
├── tailwind.config.js           ✅
└── tsconfig.json
```

---

## 🚀 下一步

### 立即可做的事
1. **修改颜色**: 编辑 `tailwind.config.js` 中的颜色
2. **添加项目**: 在 `Dashboard.tsx` 的 `projects` 数组中添加数据
3. **自定义样式**: 修改组件的 Tailwind class

### 接下来的开发
1. **添加路由**: React Router for 多页面
2. **创建更多组件**: Input, Select, Modal等
3. **创建更多页面**: Prompts, Citations, Analytics
4. **连接Mock数据**: 创建 `src/utils/mockData.ts`

---

## 🐛 常见问题

### Q1: npm install 很慢
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
```

### Q2: 端口5173被占用
```bash
# 查找并关闭占用端口的进程
lsof -ti:5173 | xargs kill -9

# 或修改vite.config.ts指定其他端口
```

### Q3: Tailwind样式不生效
```bash
# 确保 index.css 被导入
# 检查 src/main.tsx 中是否有：
import './index.css'

# 重启开发服务器
npm run dev
```

### Q4: 类型错误
```bash
# 安装类型定义
npm install -D @types/node @types/react @types/react-dom
```

---

## 📊 性能检查

### 开发服务器启动时间
- **期望**: <5秒
- **实际**: 运行 `time npm run dev` 查看

### 页面加载时间
- **期望**: <1秒
- **检查**: 浏览器开发者工具 → Network → 刷新页面

### 热更新速度
- **期望**: <500ms
- **测试**: 修改 `Dashboard.tsx` 中的文字，保存后查看浏览器更新速度

---

## 🎨 自定义示例

### 修改主题颜色
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#8b5cf6',  // 改为紫色
        600: '#7c3aed',
      }
    }
  }
}
```

### 添加新的统计卡片
```tsx
// src/pages/Dashboard.tsx
const stats = [
  // ... 现有的
  {
    label: 'AI Platforms',
    value: '8',
    icon: Globe,
    color: 'bg-pink-500'
  },
];
```

### 修改项目数据
```tsx
const projects = [
  {
    id: 'myproject',
    name: 'My New Project',
    citationRate: 0.40,
    prompts: 120
  },
  // ...
];
```

---

## 📚 学习资源

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Vite**: https://vitejs.dev/
- **Lucide Icons**: https://lucide.dev/

---

## ✅ 完成检查

运行以下命令确认一切正常：
```bash
# 1. 检查依赖
npm list --depth=0

# 2. 类型检查
npm run build

# 3. 启动开发服务器
npm run dev
```

**全部通过？恭喜！你的前端环境已就绪！** 🎉

---

**下一步**: 查看 `FRONTEND-FIRST-ROADMAP.md` 继续构建完整应用！
