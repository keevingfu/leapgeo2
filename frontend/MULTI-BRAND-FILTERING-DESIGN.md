# Multi-Brand Filtering System Design

## 需求分析

GEO Platform 是一个多品牌项目管理平台，需要在所有页面提供品牌筛选功能，用户可以：
- 选择一个或多个品牌查看数据
- 全选/取消全选
- 筛选结果实时更新
- 筛选状态在所有页面保持一致

## 当前品牌数据

从代码分析发现3个品牌：
1. **SweetNight** - 床垫产品（Sleep Products）
   - ID: `sweetnight`
   - 引用率: 32%
   - Logo: 🛏️

2. **Eufy** - 智能家居（Smart Home）
   - ID: `eufy`
   - 引用率: 25%
   - Logo: 🤖

3. **Hisense** - 电子产品（Electronics）
   - ID: `hisense`
   - 引用率: 28%
   - Logo: 📺

## 架构设计

### 1. 全局状态管理（State Lifting）

在 `Portal.tsx` 中管理全局品牌筛选状态：

```typescript
// Portal.tsx
interface Brand {
  id: string;
  name: string;
  logo: string;
  industry: string;
}

const allBrands: Brand[] = [
  { id: 'sweetnight', name: 'SweetNight', logo: '🛏️', industry: 'Sleep Products' },
  { id: 'eufy', name: 'Eufy', logo: '🤖', industry: 'Smart Home' },
  { id: 'hisense', name: 'Hisense', logo: '📺', industry: 'Electronics' }
];

const [selectedBrands, setSelectedBrands] = useState<string[]>(
  allBrands.map(b => b.id) // 默认全选
);
```

### 2. BrandFilter 组件

创建独立的品牌筛选组件：

**位置**: `/src/components/common/BrandFilter.tsx`

**功能**:
- 多选复选框（Checkbox）
- 全选/取消全选按钮
- 显示选中品牌数量
- 紧凑型设计（适合放在 header）

**UI设计**:
```
┌─────────────────────────────────────────────────┐
│ 🔽 Brands (2/3)                                 │
├─────────────────────────────────────────────────┤
│ ☑️ 🛏️ SweetNight                                │
│ ☑️ 🤖 Eufy                                       │
│ ☐ 📺 Hisense                                     │
│ ─────────────────────────────────────────────── │
│ [ Select All ] [ Clear All ]                    │
└─────────────────────────────────────────────────┘
```

### 3. Props 传递机制

```typescript
// Portal.tsx 传递给各页面
<Dashboard selectedBrands={selectedBrands} />
<KnowledgeGraph selectedBrands={selectedBrands} />
<Analytics selectedBrands={selectedBrands} />
// ... 其他页面
```

### 4. 数据过滤逻辑

各页面根据 `selectedBrands` 过滤数据：

```typescript
// 示例：Dashboard.tsx
const filteredProjects = projects.filter(
  p => selectedBrands.includes(p.id)
);

const filteredStats = {
  total_projects: filteredProjects.length,
  total_prompts: filteredProjects.reduce((sum, p) => sum + p.totalPrompts, 0),
  avg_citation_rate: filteredProjects.reduce((sum, p) => sum + p.citationRate, 0) / filteredProjects.length,
  // ...
};
```

## UI/UX 设计

### 筛选器放置位置

**方案 A: Header 右侧（推荐）**
```
┌─────────────────────────────────────────────────────────────┐
│ [Search...] | 🔽 Brands (3) | 🔔 | [Upgrade Plan]          │
└─────────────────────────────────────────────────────────────┘
```

**方案 B: 页面内独立卡片**
```
┌─────────────────┐
│ 🔽 Filter Brands │
│ ☑️ SweetNight    │
│ ☑️ Eufy          │
│ ☑️ Hisense       │
└─────────────────┘
```

**选择**: 方案 A（Header 右侧），因为：
- 全局可见，用户始终可以访问
- 节省页面空间
- 符合常见筛选器设计模式

### 筛选器交互

1. **默认状态**: 全选（显示所有品牌数据）
2. **点击下拉**: 展开品牌列表
3. **切换复选框**: 实时更新数据
4. **空选警告**: 至少选择1个品牌
5. **快捷操作**: 全选/清空按钮

### 视觉反馈

- **选中品牌**: 蓝色复选框 + 高亮背景
- **未选中品牌**: 灰色复选框
- **徽章**: 显示选中数量 `(2/3)`
- **Loading**: 数据更新时显示加载动画

## 实施计划

### Phase 1: 基础组件（30分钟）
- [x] 分析现有架构
- [ ] 创建 BrandFilter 组件
- [ ] 在 Portal.tsx 添加全局状态

### Phase 2: Header 集成（20分钟）
- [ ] 将 BrandFilter 添加到 Portal header
- [ ] 实现下拉菜单交互
- [ ] 添加全选/清空功能

### Phase 3: 页面集成（60分钟）
- [ ] Dashboard - 过滤统计数据
- [ ] Projects - 过滤项目列表
- [ ] KnowledgeGraph - 过滤图谱节点
- [ ] Analytics - 过滤分析数据
- [ ] CitationTracking - 过滤引用数据
- [ ] ContentGenerator - 过滤内容
- [ ] 其他页面...

### Phase 4: 测试与优化（30分钟）
- [ ] 测试所有页面筛选功能
- [ ] 性能优化（避免重复渲染）
- [ ] 边界情况处理（空数据、单品牌）

## 技术细节

### 性能优化

1. **useMemo 缓存过滤结果**
```typescript
const filteredData = useMemo(() => {
  return data.filter(item => selectedBrands.includes(item.brandId));
}, [data, selectedBrands]);
```

2. **useCallback 稳定回调函数**
```typescript
const toggleBrand = useCallback((brandId: string) => {
  setSelectedBrands(prev =>
    prev.includes(brandId)
      ? prev.filter(id => id !== brandId)
      : [...prev, brandId]
  );
}, []);
```

### 边界情况

1. **空选保护**: 至少保留1个品牌
```typescript
if (selectedBrands.length === 1 && selectedBrands.includes(brandId)) {
  alert('至少需要选择一个品牌');
  return;
}
```

2. **无数据提示**: 筛选后无数据时显示友好提示
```typescript
{filteredData.length === 0 && (
  <div className="text-center py-12 text-gray-500">
    未找到匹配的数据，请调整筛选条件
  </div>
)}
```

### API 集成

后端 API 需要支持品牌筛选参数：

```typescript
// GET /api/stats/overview?brands=sweetnight,eufy
statsApi.getOverview(selectedBrands.join(','));

// GET /api/citations/recent?brands=sweetnight,eufy&limit=5
citationsApi.getRecentCitations(selectedBrands.join(','), 5);
```

## 预期效果

### 用户体验
- ✅ 一键切换查看不同品牌数据
- ✅ 支持多品牌对比分析
- ✅ 筛选状态全局同步
- ✅ 实时更新，无需刷新页面

### 数据准确性
- ✅ 所有统计指标按选中品牌计算
- ✅ 图表数据自动过滤
- ✅ 列表/表格只显示相关品牌

### 可扩展性
- ✅ 轻松添加新品牌
- ✅ 支持品牌分组（未来功能）
- ✅ 可扩展为高级筛选（行业、状态等）

## 后续增强

1. **筛选器持久化**: 使用 localStorage 保存筛选偏好
2. **URL 同步**: 筛选条件反映在 URL query 参数
3. **高级筛选**: 品牌 + 行业 + 状态 + 日期范围
4. **快捷视图**: 预设常用筛选组合
5. **筛选历史**: 记录常用筛选组合

---

**设计完成时间**: 2025-01-14
**预计实施时间**: 2-3 小时
**技术栈**: React + TypeScript + Tailwind CSS
