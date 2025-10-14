import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Database, Cloud, Cpu, Network, Layers, GitBranch, Activity } from 'lucide-react';

const GEOArchitecture = () => {
  const [activeTab, setActiveTab] = useState('system');

  // 系统架构图组件
  const SystemArchitecture = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-center mb-6 text-blue-600">系统架构图 - 分层设计</h3>
      
      {/* 前端层 */}
      <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="text-blue-600" size={20} />
          <h4 className="font-bold text-blue-700">前端层 Frontend Layer</h4>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {['管理控制台\nReact + TS', '客户Portal\nNext.js', '数据看板\nGrafana', '移动端App\nReact Native'].map((item, i) => (
            <div key={i} className="bg-white border border-blue-300 rounded p-3 text-center text-sm">
              {item.split('\n').map((line, j) => <div key={j} className={j === 0 ? 'font-semibold' : 'text-xs text-gray-600'}>{line}</div>)}
            </div>
          ))}
        </div>
      </div>

      {/* 箭头 */}
      <div className="text-center text-2xl text-gray-400">↓</div>

      {/* API网关层 */}
      <div className="border-2 border-green-400 rounded-lg p-4 bg-green-50">
        <div className="flex items-center gap-2 mb-3">
          <Network className="text-green-600" size={20} />
          <h4 className="font-bold text-green-700">API网关层 Gateway Layer</h4>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {['Kong Gateway', '认证授权\nOAuth 2.0', '限流熔断\nRate Limiting', '日志追踪\nOpenTelemetry'].map((item, i) => (
            <div key={i} className="bg-white border border-green-300 rounded p-3 text-center text-sm">
              {item.split('\n').map((line, j) => <div key={j} className={j === 0 ? 'font-semibold' : 'text-xs text-gray-600'}>{line}</div>)}
            </div>
          ))}
        </div>
      </div>

      {/* 箭头 */}
      <div className="text-center text-2xl text-gray-400">↓</div>

      {/* 业务服务层 */}
      <div className="border-2 border-purple-400 rounded-lg p-4 bg-purple-50">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="text-purple-600" size={20} />
          <h4 className="font-bold text-purple-700">业务服务层 Service Layer (微服务)</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            'Prompt服务\nFastAPI',
            '内容生成\nFastAPI+Celery',
            '知识图谱\nGraphQL+Neo4j',
            'Citation追踪\nScrapy+FastAPI',
            '发布调度\nAirflow',
            'KOL管理\nDjango'
          ].map((item, i) => (
            <div key={i} className="bg-white border border-purple-300 rounded p-3 text-center text-sm">
              {item.split('\n').map((line, j) => <div key={j} className={j === 0 ? 'font-semibold' : 'text-xs text-gray-600'}>{line}</div>)}
            </div>
          ))}
        </div>
      </div>

      {/* 箭头 */}
      <div className="text-center text-2xl text-gray-400">↓</div>

      {/* AI引擎层 */}
      <div className="border-2 border-orange-400 rounded-lg p-4 bg-orange-50">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="text-orange-600" size={20} />
          <h4 className="font-bold text-orange-700">AI引擎层 AI Engine Layer</h4>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {['LLM编排\nLangChain', '内容评分\nML Models', 'NLP处理\nspaCy', '视频生成\nRunway API'].map((item, i) => (
            <div key={i} className="bg-white border border-orange-300 rounded p-3 text-center text-sm">
              {item.split('\n').map((line, j) => <div key={j} className={j === 0 ? 'font-semibold' : 'text-xs text-gray-600'}>{line}</div>)}
            </div>
          ))}
        </div>
      </div>

      {/* 箭头 */}
      <div className="text-center text-2xl text-gray-400">↓</div>

      {/* 数据层 */}
      <div className="border-2 border-indigo-400 rounded-lg p-4 bg-indigo-50">
        <div className="flex items-center gap-2 mb-3">
          <Database className="text-indigo-600" size={20} />
          <h4 className="font-bold text-indigo-700">数据层 Data Layer</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            'PostgreSQL\n业务数据',
            'Neo4j\n知识图谱',
            'Redis\n缓存队列',
            'ClickHouse\n行为分析',
            'MinIO/S3\n对象存储',
            'Elasticsearch\n全文搜索'
          ].map((item, i) => (
            <div key={i} className="bg-white border border-indigo-300 rounded p-3 text-center text-sm">
              {item.split('\n').map((line, j) => <div key={j} className={j === 0 ? 'font-semibold' : 'text-xs text-gray-600'}>{line}</div>)}
            </div>
          ))}
        </div>
      </div>

      {/* 箭头 */}
      <div className="text-center text-2xl text-gray-400">↓</div>

      {/* 基础设施层 */}
      <div className="border-2 border-gray-400 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="text-gray-600" size={20} />
          <h4 className="font-bold text-gray-700">基础设施层 Infrastructure Layer</h4>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {['Docker + K8s', 'AWS/阿里云', '监控告警\nPrometheus', '日志系统\nELK Stack'].map((item, i) => (
            <div key={i} className="bg-white border border-gray-300 rounded p-3 text-center text-sm">
              {item.split('\n').map((line, j) => <div key={j} className={j === 0 ? 'font-semibold' : 'text-xs text-gray-600'}>{line}</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 业务流程图组件
  const BusinessFlow = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-center mb-6 text-green-600">业务流程图 - 端到端工作流</h3>
      
      <div className="relative">
        {/* 主流程 */}
        <div className="space-y-4">
          {/* 阶段1 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</div>
            <div className="flex-1 border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
              <div className="font-bold text-blue-700 mb-2">Prompt管理与诊断</div>
              <div className="text-sm text-gray-600">
                • 用户输入核心Prompt<br/>
                • 系统质量评分 (0-100)<br/>
                • 预测Citation潜力<br/>
                • 推荐优化策略
              </div>
            </div>
          </div>

          <div className="text-center text-2xl text-gray-400">↓</div>

          {/* 阶段2 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">2</div>
            <div className="flex-1 border-2 border-green-400 rounded-lg p-4 bg-green-50">
              <div className="font-bold text-green-700 mb-2">知识图谱查询</div>
              <div className="text-sm text-gray-600">
                • Neo4j语义搜索<br/>
                • 查找相关产品/特性<br/>
                • 提取竞品对比数据<br/>
                • 构建上下文信息
              </div>
            </div>
          </div>

          <div className="text-center text-2xl text-gray-400">↓</div>

          {/* 阶段3 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">3</div>
            <div className="flex-1 border-2 border-purple-400 rounded-lg p-4 bg-purple-50">
              <div className="font-bold text-purple-700 mb-2">多模态内容生成</div>
              <div className="text-sm text-gray-600">
                • GPT-4o/Claude生成内容<br/>
                • 平台适配 (YouTube/Reddit/Quora)<br/>
                • 内容类型 (FAQ/视频/博客)<br/>
                • 并行生成内容矩阵
              </div>
            </div>
          </div>

          <div className="text-center text-2xl text-gray-400">↓</div>

          {/* 阶段4 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">4</div>
            <div className="flex-1 border-2 border-orange-400 rounded-lg p-4 bg-orange-50">
              <div className="font-bold text-orange-700 mb-2">内容质量评分</div>
              <div className="text-sm text-gray-600">
                • GEO优化分数 (0-100)<br/>
                • 相关性、完整性、可读性<br/>
                • AI可解析性评估<br/>
                • 人工审核队列
              </div>
            </div>
          </div>

          <div className="text-center text-2xl text-gray-400">↓</div>

          {/* 阶段5 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">5</div>
            <div className="flex-1 border-2 border-pink-400 rounded-lg p-4 bg-pink-50">
              <div className="font-bold text-pink-700 mb-2">跨平台发布调度</div>
              <div className="text-sm text-gray-600">
                • 智能排期 (最佳时间段)<br/>
                • 平台API集成发布<br/>
                • YouTube/Reddit/Quora<br/>
                • 发布状态追踪
              </div>
            </div>
          </div>

          <div className="text-center text-2xl text-gray-400">↓</div>

          {/* 阶段6 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">6</div>
            <div className="flex-1 border-2 border-indigo-400 rounded-lg p-4 bg-indigo-50">
              <div className="font-bold text-indigo-700 mb-2">AI Citation追踪</div>
              <div className="text-sm text-gray-600">
                • 8大AI平台每日扫描<br/>
                • 引用来源识别与归因<br/>
                • Citation Rate计算<br/>
                • Share of Voice分析
              </div>
            </div>
          </div>

          <div className="text-center text-2xl text-gray-400">↓</div>

          {/* 阶段7 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">7</div>
            <div className="flex-1 border-2 border-red-400 rounded-lg p-4 bg-red-50">
              <div className="font-bold text-red-700 mb-2">数据分析与优化迭代</div>
              <div className="text-sm text-gray-600">
                • 识别表现最佳内容<br/>
                • 竞品动态监测<br/>
                • 生成优化建议<br/>
                • 循环改进策略
              </div>
            </div>
          </div>
        </div>

        {/* 反馈循环箭头 */}
        <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col items-center justify-between py-8">
          <div className="text-xs text-gray-500 text-center mb-2">优化<br/>反馈</div>
          <div className="flex-1 border-r-4 border-dashed border-gray-400"></div>
          <div className="text-3xl text-gray-400">↑</div>
        </div>
      </div>
    </div>
  );

  // 数据流程图组件
  const DataFlow = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-center mb-6 text-purple-600">数据流程图 - 数据处理链路</h3>
      
      <div className="space-y-6">
        {/* 输入层 */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-6 border-2 border-blue-400">
          <div className="font-bold text-blue-800 mb-4 text-center">📥 数据输入层</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">用户输入</div>
              <div className="text-xs text-gray-600">
                • Prompt文本<br/>
                • 产品信息<br/>
                • 品牌资产<br/>
                • 竞品数据
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">外部数据源</div>
              <div className="text-xs text-gray-600">
                • 搜索量数据<br/>
                • 行业报告<br/>
                • 社交媒体<br/>
                • 竞品网站
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">AI平台数据</div>
              <div className="text-xs text-gray-600">
                • ChatGPT响应<br/>
                • Claude响应<br/>
                • Perplexity<br/>
                • 其他5平台
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-2xl text-gray-400">↓</div>

        {/* 处理层 */}
        <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-6 border-2 border-green-400">
          <div className="font-bold text-green-800 mb-4 text-center">⚙️ 数据处理层</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="font-semibold text-sm mb-2">结构化处理</div>
                <div className="text-xs text-gray-600">
                  PostgreSQL存储 → 实体抽取 → 关系识别 → 属性规范化
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="font-semibold text-sm mb-2">知识图谱构建</div>
                <div className="text-xs text-gray-600">
                  Neo4j建模 → 语义对齐 → 关系推理 → 图谱查询
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="font-semibold text-sm mb-2">内容生成处理</div>
                <div className="text-xs text-gray-600">
                  LangChain编排 → LLM生成 → 质量评分 → 格式适配
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="font-semibold text-sm mb-2">行为分析处理</div>
                <div className="text-xs text-gray-600">
                  ClickHouse存储 → 事件聚合 → 指标计算 → 趋势分析
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-2xl text-gray-400">↓</div>

        {/* 存储层 */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-6 border-2 border-purple-400">
          <div className="font-bold text-purple-800 mb-4 text-center">💾 数据存储层</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">关系型存储</div>
              <div className="text-xs text-gray-600 mb-2">
                PostgreSQL
              </div>
              <div className="text-xs bg-gray-100 rounded p-2">
                Prompts、Contents、Citations、Clients
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">图数据库</div>
              <div className="text-xs text-gray-600 mb-2">
                Neo4j
              </div>
              <div className="text-xs bg-gray-100 rounded p-2">
                Product、Feature、Problem、Prompt节点与关系
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">分析库</div>
              <div className="text-xs text-gray-600 mb-2">
                ClickHouse
              </div>
              <div className="text-xs bg-gray-100 rounded p-2">
                Events、Citation_Summary、Performance_Metrics
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-2xl text-gray-400">↓</div>

        {/* 输出层 */}
        <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg p-6 border-2 border-orange-400">
          <div className="font-bold text-orange-800 mb-4 text-center">📤 数据输出层</div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">实时监控</div>
              <div className="text-xs text-gray-600">
                • Citation Rate<br/>
                • 发布状态<br/>
                • 系统指标
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">分析报表</div>
              <div className="text-xs text-gray-600">
                • 周报/月报<br/>
                • 竞品对比<br/>
                • 归因分析
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">API接口</div>
              <div className="text-xs text-gray-600">
                • RESTful API<br/>
                • GraphQL<br/>
                • Webhook
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-sm mb-2">数据导出</div>
              <div className="text-xs text-gray-600">
                • CSV导出<br/>
                • JSON格式<br/>
                • 报表PDF
              </div>
            </div>
          </div>
        </div>

        {/* 数据流动箭头说明 */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <div className="font-bold text-gray-700 mb-3">🔄 关键数据流</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-blue-600">① 用户请求流：</span><br/>
              <span className="text-gray-600">用户输入 → API网关 → 业务服务 → 数据库 → 返回结果</span>
            </div>
            <div>
              <span className="font-semibold text-green-600">② 内容生成流：</span><br/>
              <span className="text-gray-600">Prompt → 知识图谱 → LLM → 评分 → 存储 → 发布</span>
            </div>
            <div>
              <span className="font-semibold text-purple-600">③ Citation追踪流：</span><br/>
              <span className="text-gray-600">定时任务 → 爬虫 → NLP解析 → ClickHouse → 实时更新</span>
            </div>
            <div>
              <span className="font-semibold text-orange-600">④ 分析反馈流：</span><br/>
              <span className="text-gray-600">行为数据 → 聚合计算 → 趋势分析 → 优化建议 → 策略调整</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">GEO智能内容营销平台</h1>
          <p className="text-gray-600">系统架构 · 业务流程 · 数据流程</p>
        </div>

        {/* 标签页切换 */}
        <div className="flex justify-center gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'system'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏗️ 系统架构图
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'business'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔄 业务流程图
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'data'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💾 数据流程图
          </button>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg">
          {activeTab === 'system' && <SystemArchitecture />}
          {activeTab === 'business' && <BusinessFlow />}
          {activeTab === 'data' && <DataFlow />}
        </div>

        {/* 底部说明 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-2">📌 架构设计要点：</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>微服务架构</strong>：6大核心服务独立部署，支持弹性扩展</li>
              <li>• <strong>多数据库策略</strong>：PostgreSQL(业务) + Neo4j(图谱) + ClickHouse(分析)</li>
              <li>• <strong>AI引擎集成</strong>：LangChain编排多个LLM，智能路由选择最优模型</li>
              <li>• <strong>实时追踪</strong>：8大AI平台每日自动扫描，Citation Rate实时更新</li>
              <li>• <strong>云原生部署</strong>：基于Kubernetes，支持自动扩缩容与故障自愈</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GEOArchitecture;