# GEO智能内容营销平台
## 技术开发文档 v1.0

---

# 一、系统架构设计

## 1.1 整体架构概览

```mermaid
graph TB
    subgraph "前端层 Frontend Layer"
        A1[管理控制台<br/>React + TypeScript]
        A2[客户Portal<br/>Next.js]
        A3[数据看板<br/>Grafana]
        A4[移动端App<br/>React Native]
    end
    
    subgraph "API网关层 Gateway Layer"
        B1[Kong API Gateway]
        B2[认证授权<br/>OAuth 2.0 + JWT]
        B3[限流熔断<br/>Rate Limiting]
        B4[日志追踪<br/>OpenTelemetry]
    end
    
    subgraph "业务服务层 Service Layer"
        C1[Prompt服务<br/>FastAPI]
        C2[内容生成服务<br/>FastAPI + Celery]
        C3[知识图谱服务<br/>GraphQL + Neo4j]
        C4[Citation追踪服务<br/>Scrapy + FastAPI]
        C5[发布调度服务<br/>Airflow]
        C6[KOL管理服务<br/>Django]
    end
    
    subgraph "AI引擎层 AI Engine Layer"
        D1[LLM编排<br/>LangChain]
        D2[内容评分<br/>ML Models]
        D3[NLP处理<br/>spaCy]
        D4[视频生成<br/>Runway API]
    end
    
    subgraph "数据层 Data Layer"
        E1[PostgreSQL<br/>业务数据]
        E2[Neo4j<br/>知识图谱]
        E3[Redis<br/>缓存队列]
        E4[ClickHouse<br/>行为分析]
        E5[MinIO/S3<br/>对象存储]
        E6[Elasticsearch<br/>全文搜索]
    end
    
    subgraph "基础设施层 Infrastructure Layer"
        F1[Docker + K8s]
        F2[AWS/阿里云]
        F3[监控告警<br/>Prometheus]
        F4[日志系统<br/>ELK Stack]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    B1 --> C1
    B1 --> C2
    B1 --> C3
    B1 --> C4
    B1 --> C5
    B1 --> C6
    C1 --> D1
    C2 --> D1
    C3 --> D3
    C4 --> D2
    C1 --> E1
    C2 --> E1
    C3 --> E2
    C4 --> E4
    C5 --> E3
    C6 --> E1
    D1 --> E5
    D2 --> E6
```

## 1.2 微服务架构设计

### 服务拆分原则

| 服务名称 | 职责范围 | 技术栈 | 数据库 | 通信方式 |
|---------|---------|--------|--------|---------|
| **prompt-service** | Prompt管理、优先级排序、意图分析 | FastAPI + Python | PostgreSQL | REST + gRPC |
| **content-service** | 内容生成、评分、审核 | FastAPI + Celery | PostgreSQL + Redis | REST + MQ |
| **knowledge-service** | 知识图谱CRUD、推理查询 | GraphQL + Neo4j Driver | Neo4j | GraphQL |
| **citation-service** | AI平台监测、引用追踪 | Scrapy + FastAPI | PostgreSQL + ClickHouse | REST |
| **publish-service** | 跨平台发布、排期管理 | Airflow + FastAPI | PostgreSQL + Redis | REST + MQ |
| **kol-service** | KOL资源管理、协调调度 | Django REST | PostgreSQL | REST |
| **analytics-service** | 数据分析、报表生成 | FastAPI + Pandas | ClickHouse | REST |
| **auth-service** | 用户认证、权限管理 | FastAPI + Casbin | PostgreSQL + Redis | REST |

---

# 二、数据库设计

## 2.1 PostgreSQL 业务数据库

### 核心数据表设计

```sql
-- 1. Prompt表
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    prompt_text TEXT NOT NULL,
    intent_type VARCHAR(50), -- High-Intent, Research, Comparison, How-to
    priority VARCHAR(10), -- P0, P1, P2
    search_volume INTEGER,
    competition_score DECIMAL(3,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE INDEX idx_prompts_client_priority ON prompts(client_id, priority);
CREATE INDEX idx_prompts_status ON prompts(status);

-- 2. 内容资产表
CREATE TABLE content_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL,
    platform VARCHAR(50), -- youtube, reddit, quora, medium, etc.
    content_type VARCHAR(50), -- video, article, post, answer
    content_url TEXT,
    content_body TEXT,
    quality_score DECIMAL(5,2),
    ai_parsability_score DECIMAL(3,2),
    status VARCHAR(50), -- draft, review, published, archived
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

CREATE INDEX idx_content_prompt_platform ON content_assets(prompt_id, platform);
CREATE INDEX idx_content_status ON content_assets(status);

-- 3. AI Citation追踪表
CREATE TABLE ai_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL,
    ai_platform VARCHAR(50), -- chatgpt, claude, perplexity, gemini
    query_text TEXT,
    response_text TEXT,
    cited_sources JSONB, -- [{url, position, relevance_score}]
    our_citation_count INTEGER DEFAULT 0,
    total_citation_count INTEGER DEFAULT 0,
    citation_rate DECIMAL(5,2),
    share_of_voice DECIMAL(5,2),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

CREATE INDEX idx_citations_prompt_platform ON ai_citations(prompt_id, ai_platform);
CREATE INDEX idx_citations_checked_at ON ai_citations(checked_at DESC);

-- 4. KOL资源表
CREATE TABLE kols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    platform VARCHAR(50),
    tier INTEGER, -- 1-4
    follower_count INTEGER,
    engagement_rate DECIMAL(5,2),
    niche VARCHAR(100),
    contact_info JSONB,
    collaboration_history JSONB,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kols_tier_platform ON kols(tier, platform);

-- 5. 发布排期表
CREATE TABLE publish_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    platform VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- pending, published, failed
    publish_config JSONB, -- 平台特定配置
    error_message TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES content_assets(id)
);

CREATE INDEX idx_schedules_time_status ON publish_schedules(scheduled_time, status);

-- 6. 客户表
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    contact_email VARCHAR(255),
    subscription_tier VARCHAR(50), -- starter, pro, enterprise
    api_key VARCHAR(255) UNIQUE,
    monthly_prompt_quota INTEGER,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2.2 Neo4j 知识图谱数据库

### 节点和关系设计

```cypher
// 1. 创建节点类型
// Product节点
CREATE CONSTRAINT ON (p:Product) ASSERT p.id IS UNIQUE;
CREATE INDEX ON :Product(name);
CREATE INDEX ON :Product(brand);

// Feature节点
CREATE CONSTRAINT ON (f:Feature) ASSERT f.id IS UNIQUE;
CREATE INDEX ON :Feature(name);
CREATE INDEX ON :Feature(category);

// Problem节点
CREATE CONSTRAINT ON (prob:Problem) ASSERT prob.id IS UNIQUE;
CREATE INDEX ON :Problem(type);

// UserScenario节点
CREATE CONSTRAINT ON (s:UserScenario) ASSERT s.id IS UNIQUE;
CREATE INDEX ON :UserScenario(name);

// Prompt节点
CREATE CONSTRAINT ON (pr:Prompt) ASSERT pr.id IS UNIQUE;
CREATE INDEX ON :Prompt(text);
CREATE INDEX ON :Prompt(intent_type);

// Content节点
CREATE CONSTRAINT ON (c:Content) ASSERT c.id IS UNIQUE;
CREATE INDEX ON :Content(platform);
CREATE INDEX ON :Content(type);

// KOL节点
CREATE CONSTRAINT ON (k:KOL) ASSERT k.id IS UNIQUE;
CREATE INDEX ON :KOL(name);
CREATE INDEX ON :KOL(platform);

// 2. 关系类型定义
// Product关系
(p:Product)-[:HAS_FEATURE]->(f:Feature)
(p:Product)-[:COMPETES_WITH]->(p2:Product)
(p:Product)-[:BELONGS_TO_CATEGORY]->(cat:Category)
(p:Product)-[:SOLVES_PROBLEM]->(prob:Problem)

// Feature关系
(f:Feature)-[:APPEALS_TO]->(s:UserScenario)
(f:Feature)-[:REQUIRES_TECHNOLOGY]->(t:Technology)

// Prompt关系
(pr:Prompt)-[:TARGETS_PRODUCT]->(p:Product)
(pr:Prompt)-[:ADDRESSES_PROBLEM]->(prob:Problem)
(pr:Prompt)-[:REQUIRES_CONTENT]->(c:Content)

// Content关系
(c:Content)-[:ANSWERS_PROMPT]->(pr:Prompt)
(c:Content)-[:MENTIONS_FEATURE]->(f:Feature)
(c:Content)-[:CREATED_BY]->(k:KOL)

// KOL关系
(k:KOL)-[:REVIEWS_PRODUCT]->(p:Product)
(k:KOL)-[:INFLUENCES_AUDIENCE]->(a:Audience)
```

## 2.3 ClickHouse 行为分析库

```sql
-- 用户行为事件表
CREATE TABLE IF NOT EXISTS events (
    event_id UUID,
    client_id UUID,
    prompt_id UUID,
    event_type String, -- view, click, conversion, citation
    platform String,
    properties String, -- JSON格式的额外属性
    timestamp DateTime,
    date Date DEFAULT toDate(timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (client_id, timestamp);

-- AI Citation汇总表
CREATE TABLE IF NOT EXISTS citation_summary (
    date Date,
    client_id UUID,
    prompt_id UUID,
    ai_platform String,
    citation_count UInt32,
    total_queries UInt32,
    citation_rate Float32,
    share_of_voice Float32
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, client_id, prompt_id, ai_platform);
```

---

# 三、核心模块开发规范

## 3.1 Prompt工程服务

### 3.1.1 API设计

```python
# prompt_service/api/v1/prompts.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/v1/prompts", tags=["prompts"])

# 数据模型
class PromptCreate(BaseModel):
    client_id: UUID
    prompt_text: str
    intent_type: str
    priority: str = "P1"
    search_volume: Optional[int] = None
    competition_score: Optional[float] = None

class PromptResponse(BaseModel):
    id: UUID
    prompt_text: str
    intent_type: str
    priority: str
    quality_score: float
    estimated_citation_rate: float
    recommended_channels: List[str]
    created_at: datetime

class PromptAnalysis(BaseModel):
    semantic_similarity: float
    competition_analysis: dict
    opportunity_score: float
    recommended_content_types: List[str]

# API端点
@router.post("/", response_model=PromptResponse)
async def create_prompt(prompt: PromptCreate):
    """创建新的Prompt并进行初步分析"""
    # 1. 语义分析
    semantic_analysis = await analyze_prompt_semantics(prompt.prompt_text)
    
    # 2. 竞争分析
    competition = await analyze_competition(prompt.prompt_text)
    
    # 3. 保存到数据库
    db_prompt = await save_prompt_to_db(prompt, semantic_analysis, competition)
    
    # 4. 触发知识图谱更新
    await update_knowledge_graph(db_prompt)
    
    # 5. 推荐内容渠道
    channels = await recommend_channels(db_prompt)
    
    return PromptResponse(**db_prompt.dict(), recommended_channels=channels)

@router.get("/{prompt_id}/analysis", response_model=PromptAnalysis)
async def analyze_prompt(prompt_id: UUID):
    """深度分析Prompt的机会和策略"""
    prompt = await get_prompt_by_id(prompt_id)
    
    # 1. 查询知识图谱获取相关实体
    entities = await query_knowledge_graph(prompt.prompt_text)
    
    # 2. 分析语义相似度
    similarity = await calculate_semantic_similarity(prompt.prompt_text, entities)
    
    # 3. 竞争态势分析
    competition = await deep_competition_analysis(prompt.prompt_text)
    
    # 4. 计算机会评分
    opportunity = calculate_opportunity_score(similarity, competition)
    
    # 5. 推荐内容类型
    content_types = recommend_content_types(prompt.intent_type, opportunity)
    
    return PromptAnalysis(
        semantic_similarity=similarity,
        competition_analysis=competition,
        opportunity_score=opportunity,
        recommended_content_types=content_types
    )

@router.post("/{prompt_id}/optimize")
async def optimize_prompt(prompt_id: UUID):
    """优化Prompt以提高AI Citation Rate"""
    prompt = await get_prompt_by_id(prompt_id)
    
    # 1. 获取当前Citation数据
    current_citations = await get_citation_data(prompt_id)
    
    # 2. 分析Citation Gap
    gaps = analyze_citation_gaps(current_citations)
    
    # 3. 生成优化建议
    optimizations = generate_optimization_suggestions(gaps)
    
    # 4. 创建优化任务
    tasks = await create_optimization_tasks(prompt_id, optimizations)
    
    return {"prompt_id": prompt_id, "optimizations": optimizations, "tasks": tasks}
```

### 3.1.2 Prompt质量评分算法

```python
# prompt_service/core/scoring.py
import numpy as np
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class PromptQualityScore:
    search_volume_score: float      # 搜索量潜力 (0-100)
    competition_score: float         # 竞争难度 (0-100, 越低越好)
    conversion_intent_score: float   # 转化意图 (0-100)
    content_gap_score: float         # 内容缺口 (0-100)
    ai_citation_potential: float     # AI引用潜力 (0-100)
    
    @property
    def total_score(self) -> float:
        """计算加权总分"""
        weights = {
            'search_volume': 0.20,
            'competition': 0.15,  # 反向指标
            'conversion_intent': 0.25,
            'content_gap': 0.20,
            'ai_citation': 0.20
        }
        
        score = (
            self.search_volume_score * weights['search_volume'] +
            (100 - self.competition_score) * weights['competition'] +
            self.conversion_intent_score * weights['conversion_intent'] +
            self.content_gap_score * weights['content_gap'] +
            self.ai_citation_potential * weights['ai_citation']
        )
        
        return round(score, 2)
    
    @property
    def priority(self) -> str:
        """根据总分确定优先级"""
        if self.total_score >= 80:
            return "P0"
        elif self.total_score >= 60:
            return "P1"
        else:
            return "P2"

class PromptScorer:
    def __init__(self):
        self.intent_keywords = {
            'high_intent': ['best', 'top', 'review', 'vs', 'compare', 'buy'],
            'research': ['how to', 'what is', 'guide', 'tutorial'],
            'problem_solving': ['fix', 'solve', 'issue', 'problem', 'error']
        }
    
    def score_prompt(self, prompt: str, metadata: Dict) -> PromptQualityScore:
        """综合评分Prompt质量"""
        
        # 1. 搜索量评分
        search_volume_score = self._score_search_volume(
            metadata.get('search_volume', 0)
        )
        
        # 2. 竞争度评分
        competition_score = self._score_competition(
            metadata.get('competition_level', 'medium')
        )
        
        # 3. 转化意图评分
        conversion_intent_score = self._score_conversion_intent(prompt)
        
        # 4. 内容缺口评分
        content_gap_score = self._score_content_gap(
            metadata.get('existing_content_count', 0),
            metadata.get('existing_quality_avg', 0)
        )
        
        # 5. AI引用潜力评分
        ai_citation_potential = self._score_ai_potential(
            prompt, 
            metadata.get('current_ai_citations', {})
        )
        
        return PromptQualityScore(
            search_volume_score=search_volume_score,
            competition_score=competition_score,
            conversion_intent_score=conversion_intent_score,
            content_gap_score=content_gap_score,
            ai_citation_potential=ai_citation_potential
        )
    
    def _score_search_volume(self, volume: int) -> float:
        """搜索量评分逻辑"""
        if volume >= 10000:
            return 100
        elif volume >= 5000:
            return 80
        elif volume >= 1000:
            return 60
        elif volume >= 100:
            return 40
        else:
            return 20
    
    def _score_competition(self, level: str) -> float:
        """竞争度评分（越低越好）"""
        competition_map = {
            'very_low': 10,
            'low': 30,
            'medium': 50,
            'high': 70,
            'very_high': 90
        }
        return competition_map.get(level, 50)
    
    def _score_conversion_intent(self, prompt: str) -> float:
        """转化意图评分"""
        prompt_lower = prompt.lower()
        score = 50  # 基础分
        
        # 高意图关键词加分
        for keyword in self.intent_keywords['high_intent']:
            if keyword in prompt_lower:
                score += 10
        
        # 包含品牌/产品比较
        if 'vs' in prompt_lower or 'compare' in prompt_lower:
            score += 15
        
        # 包含年份（时效性）
        import re
        if re.search(r'202[4-9]', prompt):
            score += 10
        
        return min(score, 100)
    
    def _score_content_gap(self, existing_count: int, quality_avg: float) -> float:
        """内容缺口评分"""
        # 现有内容越少，机会越大
        count_score = max(100 - existing_count * 10, 0)
        
        # 现有内容质量越低，机会越大
        quality_score = max(100 - quality_avg, 0)
        
        return (count_score * 0.6 + quality_score * 0.4)
    
    def _score_ai_potential(self, prompt: str, current_citations: Dict) -> float:
        """AI引用潜力评分"""
        base_score = 50
        
        # 问答式Prompt更容易被AI引用
        if prompt.endswith('?'):
            base_score += 20
        
        # 包含具体场景或条件
        if any(word in prompt.lower() for word in ['for', 'with', 'without', 'under']):
            base_score += 15
        
        # 当前引用率低说明有提升空间
        current_rate = current_citations.get('citation_rate', 0)
        if current_rate < 0.1:
            base_score += 20
        elif current_rate < 0.2:
            base_score += 10
        
        return min(base_score, 100)
```

## 3.2 内容生成服务

### 3.2.1 多模态内容生成引擎

```python
# content_service/core/generator.py
from typing import Dict, List, Optional
from enum import Enum
import asyncio
from langchain import PromptTemplate, LLMChain
from langchain.chat_models import ChatOpenAI
import json

class ContentType(Enum):
    FAQ = "faq"
    BLOG_POST = "blog_post"
    VIDEO_SCRIPT = "video_script"
    SOCIAL_POST = "social_post"
    PRODUCT_REVIEW = "product_review"
    COMPARISON = "comparison"

class MultiModalContentGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.7,
            max_tokens=4000
        )
        self.templates = self._load_templates()
    
    async def generate_content_matrix(
        self,
        prompt: str,
        knowledge_graph_data: Dict,
        target_platforms: List[str]
    ) -> Dict[str, Dict]:
        """为单个Prompt生成完整的多模态内容矩阵"""
        
        content_matrix = {}
        
        # 1. 提取知识图谱中的关键信息
        context = self._extract_context(knowledge_graph_data)
        
        # 2. 并行生成各平台内容
        tasks = []
        for platform in target_platforms:
            task = self._generate_platform_content(
                prompt, context, platform
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        
        # 3. 组装内容矩阵
        for platform, content in zip(target_platforms, results):
            content_matrix[platform] = content
        
        # 4. 生成跨平台一致性元数据
        metadata = self._generate_metadata(prompt, content_matrix)
        content_matrix['metadata'] = metadata
        
        return content_matrix
    
    async def _generate_platform_content(
        self,
        prompt: str,
        context: Dict,
        platform: str
    ) -> Dict:
        """生成特定平台的内容"""
        
        platform_configs = {
            'youtube': {
                'content_types': [ContentType.VIDEO_SCRIPT],
                'length': 'long',  # 8-15分钟
                'style': 'educational',
                'includes': ['timestamps', 'chapters', 'description']
            },
            'youtube_shorts': {
                'content_types': [ContentType.VIDEO_SCRIPT],
                'length': 'short',  # <60秒
                'style': 'engaging',
                'includes': ['hook', 'value_prop', 'cta']
            },
            'reddit': {
                'content_types': [ContentType.SOCIAL_POST],
                'style': 'conversational',
                'perspective': 'first_person',
                'includes': ['personal_story', 'questions']
            },
            'quora': {
                'content_types': [ContentType.FAQ],
                'style': 'authoritative',
                'structure': 'structured_answer',
                'includes': ['data_points', 'sources']
            },
            'medium': {
                'content_types': [ContentType.BLOG_POST],
                'length': '2000-3000_words',
                'style': 'thought_leadership',
                'includes': ['insights', 'data_viz', 'takeaways']
            },
            'official_website': {
                'content_types': [ContentType.FAQ, ContentType.COMPARISON],
                'style': 'professional',
                'seo_optimized': True,
                'includes': ['schema_markup', 'meta_tags']
            }
        }
        
        config = platform_configs.get(platform, {})
        
        # 选择内容类型
        content_type = config.get('content_types', [ContentType.FAQ])[0]
        
        # 生成内容
        content = await self._generate_by_type(
            prompt, context, content_type, config
        )
        
        # 添加平台特定优化
        optimized_content = self._optimize_for_platform(
            content, platform, config
        )
        
        return {
            'platform': platform,
            'content_type': content_type.value,
            'content': optimized_content,
            'config': config
        }
    
    async def _generate_by_type(
        self,
        prompt: str,
        context: Dict,
        content_type: ContentType,
        config: Dict
    ) -> str:
        """根据内容类型生成具体内容"""
        
        template = self.templates.get(content_type)
        
        if content_type == ContentType.FAQ:
            return await self._generate_faq(prompt, context, config)
        elif content_type == ContentType.VIDEO_SCRIPT:
            return await self._generate_video_script(prompt, context, config)
        elif content_type == ContentType.BLOG_POST:
            return await self._generate_blog_post(prompt, context, config)
        elif content_type == ContentType.SOCIAL_POST:
            return await self._generate_social_post(prompt, context, config)
        elif content_type == ContentType.COMPARISON:
            return await self._generate_comparison(prompt, context, config)
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
    
    async def _generate_faq(
        self,
        prompt: str,
        context: Dict,
        config: Dict
    ) -> Dict:
        """生成FAQ内容"""
        
        faq_prompt = PromptTemplate(
            input_variables=["question", "context", "style"],
            template="""
            Create a comprehensive FAQ answer for the question: {question}
            
            Context from knowledge graph:
            {context}
            
            Style: {style}
            
            Requirements:
            1. Start with a direct, concise answer (50-100 words)
            2. Provide detailed explanation (200-300 words)
            3. Include relevant data points and statistics
            4. Add practical tips or recommendations
            5. End with related questions
            
            Format the response as JSON with the following structure:
            {{
                "short_answer": "...",
                "detailed_answer": "...",
                "key_points": [...],
                "data_points": [...],
                "tips": [...],
                "related_questions": [...]
            }}
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=faq_prompt)
        
        response = await chain.arun(
            question=prompt,
            context=json.dumps(context),
            style=config.get('style', 'professional')
        )
        
        return json.loads(response)
    
    async def _generate_video_script(
        self,
        prompt: str,
        context: Dict,
        config: Dict
    ) -> Dict:
        """生成视频脚本"""
        
        length = config.get('length', 'long')
        
        if length == 'long':
            return await self._generate_long_video_script(prompt, context, config)
        else:
            return await self._generate_short_video_script(prompt, context, config)
    
    async def _generate_long_video_script(
        self,
        prompt: str,
        context: Dict,
        config: Dict
    ) -> Dict:
        """生成长视频脚本（8-15分钟）"""
        
        script_prompt = PromptTemplate(
            input_variables=["topic", "context", "duration"],
            template="""
            Create a YouTube video script about: {topic}
            Target duration: {duration} minutes
            
            Context: {context}
            
            Structure:
            1. Hook (0:00-0:15) - Attention-grabbing opening
            2. Introduction (0:15-0:45) - What viewers will learn
            3. Main Content (0:45-{end_time}) - Detailed explanation with examples
            4. Summary ({end_time}-{total}) - Key takeaways
            5. Call to Action - Subscribe, like, comment
            
            Include:
            - Timestamps for each section
            - B-roll suggestions
            - Graphics/animation cues
            - Speaking notes
            
            Format as JSON with sections, timestamps, and visual cues.
            """
        )
        
        # 生成脚本内容...
        # [实现细节省略]
        
        return {
            "title": f"Generated title for {prompt}",
            "duration": "12:00",
            "sections": [...],
            "timestamps": [...],
            "visual_cues": [...],
            "speaking_notes": [...]
        }
```

### 3.2.2 内容质量评分系统

```python
# content_service/core/scoring.py
import re
from typing import Dict, List
from textstat import flesch_reading_ease, flesch_kincaid_grade
import spacy
from transformers import pipeline

class ContentQualityScorer:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_lg")
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.zero_shot_classifier = pipeline("zero-shot-classification")
        
        self.scoring_weights = {
            'relevance': 0.25,
            'completeness': 0.20,
            'readability': 0.15,
            'seo_optimization': 0.15,
            'engagement_potential': 0.15,
            'authority': 0.10
        }
    
    def score_content(
        self,
        content: str,
        prompt: str,
        content_type: str,
        metadata: Dict
    ) -> Dict:
        """综合评分内容质量"""
        
        scores = {
            'relevance': self._score_relevance(content, prompt),
            'completeness': self._score_completeness(content, content_type),
            'readability': self._score_readability(content),
            'seo_optimization': self._score_seo(content, metadata),
            'engagement_potential': self._score_engagement(content),
            'authority': self._score_authority(content, metadata)
        }
        
        # 计算加权总分
        total_score = sum(
            scores[key] * self.scoring_weights[key]
            for key in scores
        )
        
        return {
            'total_score': round(total_score, 2),
            'scores': scores,
            'pass': total_score >= 70,
            'recommendations': self._generate_recommendations(scores)
        }
    
    def _score_relevance(self, content: str, prompt: str) -> float:
        """评分内容与Prompt的相关性"""
        # 使用嵌入向量计算语义相似度
        doc1 = self.nlp(prompt)
        doc2 = self.nlp(content[:1000])  # 使用前1000字符
        
        similarity = doc1.similarity(doc2)
        
        # 检查关键词覆盖
        prompt_tokens = set([token.lemma_ for token in doc1 if not token.is_stop])
        content_tokens = set([token.lemma_ for token in doc2 if not token.is_stop])
        
        keyword_coverage = len(prompt_tokens & content_tokens) / len(prompt_tokens)
        
        return (similarity * 0.7 + keyword_coverage * 0.3) * 100
    
    def _score_completeness(self, content: str, content_type: str) -> float:
        """评分内容完整性"""
        
        requirements = {
            'faq': {
                'min_length': 300,
                'required_sections': ['answer', 'explanation', 'tips'],
                'data_points': 2
            },
            'blog_post': {
                'min_length': 1500,
                'required_sections': ['introduction', 'body', 'conclusion'],
                'data_points': 5
            },
            'video_script': {
                'min_length': 800,
                'required_sections': ['hook', 'content', 'cta'],
                'timestamps': True
            }
        }
        
        req = requirements.get(content_type, requirements['faq'])
        
        score = 100
        
        # 检查长度
        if len(content.split()) < req['min_length']:
            score -= 20
        
        # 检查必需部分
        for section in req.get('required_sections', []):
            if section.lower() not in content.lower():
                score -= 10
        
        # 检查数据点
        data_pattern = r'\d+\.?\d*\s*(%|percent|times|x)'
        data_points = len(re.findall(data_pattern, content))
        if data_points < req.get('data_points', 0):
            score -= 15
        
        return max(score, 0)
    
    def _score_readability(self, content: str) -> float:
        """评分可读性"""
        
        # Flesch Reading Ease (0-100, higher is easier)
        fre_score = flesch_reading_ease(content)
        
        # Flesch-Kincaid Grade Level (目标: 8-12)
        fk_grade = flesch_kincaid_grade(content)
        
        # 句子长度分析
        sentences = content.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        # 段落结构
        paragraphs = content.split('\n\n')
        avg_paragraph_length = len(content) / len(paragraphs)
        
        # 综合评分
        score = 0
        
        # Reading ease (目标: 50-70)
        if 50 <= fre_score <= 70:
            score += 40
        elif 40 <= fre_score < 50 or 70 < fre_score <= 80:
            score += 30
        else:
            score += 20
        
        # Grade level (目标: 8-12)
        if 8 <= fk_grade <= 12:
            score += 30
        else:
            score += 15
        
        # 句子长度 (目标: 15-20词)
        if 15 <= avg_sentence_length <= 20:
            score += 15
        else:
            score += 8
        
        # 段落结构
        if 150 <= avg_paragraph_length <= 300:
            score += 15
        else:
            score += 8
        
        return score
```

## 3.3 AI Citation追踪服务

### 3.3.1 多平台Citation监测器

```python
# citation_service/core/tracker.py
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
import httpx
from bs4 import BeautifulSoup
import json
from urllib.parse import urlparse

class AICitationTracker:
    def __init__(self):
        self.platforms = {
            'chatgpt': ChatGPTTracker(),
            'claude': ClaudeTracker(),
            'perplexity': PerplexityTracker(),
            'gemini': GeminiTracker(),
            'bing_chat': BingChatTracker()
        }
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def track_citations(
        self,
        prompts: List[str],
        client_domains: List[str]
    ) -> Dict:
        """追踪多个Prompt在各AI平台的引用情况"""
        
        results = {
            'timestamp': datetime.utcnow().isoformat(),
            'prompts': {},
            'summary': {}
        }
        
        for prompt in prompts:
            prompt_results = await self._track_single_prompt(
                prompt, client_domains
            )
            results['prompts'][prompt] = prompt_results
        
        # 计算汇总指标
        results['summary'] = self._calculate_summary(results['prompts'])
        
        return results
    
    async def _track_single_prompt(
        self,
        prompt: str,
        client_domains: List[str]
    ) -> Dict:
        """追踪单个Prompt的引用"""
        
        tasks = []
        for platform_name, tracker in self.platforms.items():
            task = tracker.check_citation(prompt, client_domains)
            tasks.append(task)
        
        platform_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            'prompt': prompt,
            'platforms': dict(zip(self.platforms.keys(), platform_results)),
            'metrics': self._calculate_prompt_metrics(platform_results, client_domains)
        }
    
    def _calculate_prompt_metrics(
        self,
        platform_results: List[Dict],
        client_domains: List[str]
    ) -> Dict:
        """计算Prompt级别的Citation指标"""
        
        total_citations = 0
        our_citations = 0
        platforms_cited = []
        citation_positions = []
        
        for result in platform_results:
            if isinstance(result, Exception):
                continue
            
            if result.get('cited'):
                platforms_cited.append(result['platform'])
                total_citations += len(result.get('sources', []))
                
                # 统计我方域名被引用次数
                for source in result.get('sources', []):
                    domain = urlparse(source['url']).netloc
                    if any(cd in domain for cd in client_domains):
                        our_citations += 1
                        citation_positions.append(source.get('position', 999))
        
        citation_rate = our_citations / total_citations if total_citations > 0 else 0
        
        return {
            'total_citations': total_citations,
            'our_citations': our_citations,
            'citation_rate': round(citation_rate, 4),
            'platforms_cited': platforms_cited,
            'avg_position': sum(citation_positions) / len(citation_positions) if citation_positions else None,
            'coverage': len(platforms_cited) / len(self.platforms)
        }

class ChatGPTTracker:
    """ChatGPT Citation追踪器"""
    
    def __init__(self):
        self.api_endpoint = "https://api.openai.com/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
    
    async def check_citation(
        self,
        prompt: str,
        client_domains: List[str]
    ) -> Dict:
        """检查ChatGPT对特定Prompt的回答和引用"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.api_endpoint,
                headers=self.headers,
                json={
                    "model": "gpt-4",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 2000
                }
            )
            
            if response.status_code != 200:
                return {'error': f"API error: {response.status_code}"}
            
            data = response.json()
            content = data['choices'][0]['message']['content']
            
            # 解析引用来源
            sources = self._extract_sources(content)
            
            # 检查是否包含客户域名
            our_sources = [
                s for s in sources
                if any(domain in s['url'] for domain in client_domains)
            ]
            
            return {
                'platform': 'chatgpt',
                'prompt': prompt,
                'response': content,
                'sources': sources,
                'our_sources': our_sources,
                'cited': len(our_sources) > 0,
                'citation_count': len(our_sources),
                'total_sources': len(sources)
            }
    
    def _extract_sources(self, content: str) -> List[Dict]:
        """从回答中提取引用来源"""
        
        sources = []
        
        # 提取URL
        import re
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, content)
        
        for i, url in enumerate(urls):
            sources.append({
                'url': url,
                'position': i + 1,
                'context': self._get_url_context(content, url)
            })
        
        # 提取引用标记 [1], [2] 等
        citation_pattern = r'\[(\d+)\]'
        citations = re.findall(citation_pattern, content)
        
        # 尝试匹配引用标记和URL
        # [实现细节省略]
        
        return sources
    
    def _get_url_context(self, content: str, url: str, context_length: int = 100) -> str:
        """获取URL周围的上下文"""
        
        index = content.find(url)
        if index == -1:
            return ""
        
        start = max(0, index - context_length)
        end = min(len(content), index + len(url) + context_length)
        
        return content[start:end]

class PerplexityTracker:
    """Perplexity Citation追踪器"""
    
    async def check_citation(
        self,
        prompt: str,
        client_domains: List[str]
    ) -> Dict:
        """检查Perplexity的引用"""
        
        # 使用Perplexity API或Web抓取
        # 注意：Perplexity通常会明确列出引用来源
        
        # [实现细节类似ChatGPTTracker]
        pass
```

## 3.4 知识图谱服务

### 3.4.1 Neo4j知识图谱操作

```python
# knowledge_service/core/graph_manager.py
from neo4j import AsyncGraphDatabase
from typing import Dict, List, Optional, Any
import json

class KnowledgeGraphManager:
    def __init__(self, uri: str, auth: tuple):
        self.driver = AsyncGraphDatabase.driver(uri, auth=auth)
    
    async def close(self):
        await self.driver.close()
    
    async def create_product_node(self, product_data: Dict) -> str:
        """创建产品节点"""
        
        query = """
        CREATE (p:Product {
            id: $id,
            name: $name,
            brand: $brand,
            category: $category,
            price: $price,
            features: $features,
            created_at: datetime()
        })
        RETURN p.id as product_id
        """
        
        async with self.driver.session() as session:
            result = await session.run(query, **product_data)
            record = await result.single()
            return record['product_id']
    
    async def create_prompt_node(self, prompt_data: Dict) -> str:
        """创建Prompt节点并建立关系"""
        
        query = """
        CREATE (pr:Prompt {
            id: $id,
            text: $text,
            intent_type: $intent_type,
            priority: $priority,
            search_volume: $search_volume,
            created_at: datetime()
        })
        
        WITH pr
        MATCH (p:Product {id: $product_id})
        CREATE (pr)-[:TARGETS_PRODUCT]->(p)
        
        WITH pr
        UNWIND $problems as problem_id
        MATCH (prob:Problem {id: problem_id})
        CREATE (pr)-[:ADDRESSES_PROBLEM]->(prob)
        
        RETURN pr.id as prompt_id
        """
        
        async with self.driver.session() as session:
            result = await session.run(query, **prompt_data)
            record = await result.single()
            return record['prompt_id']
    
    async def find_related_entities(self, prompt_text: str) -> Dict:
        """查找与Prompt相关的所有实体"""
        
        # 1. 文本匹配查找相关产品
        product_query = """
        CALL db.index.fulltext.queryNodes('product_search', $search_text)
        YIELD node, score
        WHERE score > 0.5
        RETURN node as product, score
        ORDER BY score DESC
        LIMIT 5
        """
        
        # 2. 查找相关功能
        feature_query = """
        MATCH (p:Product)-[:HAS_FEATURE]->(f:Feature)
        WHERE p.id IN $product_ids
        RETURN DISTINCT f as feature
        """
        
        # 3. 查找相关问题
        problem_query = """
        MATCH (p:Product)-[:SOLVES_PROBLEM]->(prob:Problem)
        WHERE p.id IN $product_ids
        RETURN DISTINCT prob as problem
        """
        
        async with self.driver.session() as session:
            # 执行查询
            products_result = await session.run(
                product_query,
                search_text=prompt_text
            )
            products = await products_result.data()
            
            product_ids = [p['product']['id'] for p in products]
            
            features_result = await session.run(
                feature_query,
                product_ids=product_ids
            )
            features = await features_result.data()
            
            problems_result = await session.run(
                problem_query,
                product_ids=product_ids
            )
            problems = await problems_result.data()
            
            return {
                'products': products,
                'features': features,
                'problems': problems,
                'relationships': await self._get_relationships(product_ids)
            }
    
    async def _get_relationships(self, entity_ids: List[str]) -> List[Dict]:
        """获取实体间的关系"""
        
        query = """
        MATCH (e1)-[r]->(e2)
        WHERE e1.id IN $entity_ids AND e2.id IN $entity_ids
        RETURN 
            e1.id as source,
            type(r) as relationship,
            e2.id as target,
            properties(r) as properties
        """
        
        async with self.driver.session() as session:
            result = await session.run(query, entity_ids=entity_ids)
            return await result.data()
    
    async def update_citation_performance(
        self,
        prompt_id: str,
        performance_data: Dict
    ):
        """更新Prompt的Citation性能数据"""
        
        query = """
        MATCH (pr:Prompt {id: $prompt_id})
        SET pr.citation_rate = $citation_rate,
            pr.share_of_voice = $share_of_voice,
            pr.last_checked = datetime(),
            pr.performance_trend = $trend
        
        WITH pr
        MATCH (pr)-[:REQUIRES_CONTENT]->(c:Content)
        WHERE c.platform = $best_performing_platform
        SET c.is_best_performer = true
        
        RETURN pr
        """
        
        async with self.driver.session() as session:
            await session.run(
                query,
                prompt_id=prompt_id,
                **performance_data
            )
    
    async def get_optimization_opportunities(self) -> List[Dict]:
        """查找优化机会"""
        
        query = """
        // 查找Citation Rate低但潜力高的Prompt
        MATCH (pr:Prompt)
        WHERE pr.citation_rate < 0.2
        AND pr.search_volume > 1000
        AND pr.priority IN ['P0', 'P1']
        
        // 查找缺少内容的平台
        OPTIONAL MATCH (pr)-[:REQUIRES_CONTENT]->(c:Content)
        WITH pr, collect(c.platform) as existing_platforms
        
        // 查找竞品表现好的Prompt
        OPTIONAL MATCH (pr)-[:TARGETS_PRODUCT]->(p:Product)-[:COMPETES_WITH]->(comp:Product)
        OPTIONAL MATCH (comp)<-[:TARGETS_PRODUCT]-(comp_pr:Prompt)
        WHERE comp_pr.citation_rate > 0.3
        
        RETURN 
            pr as prompt,
            existing_platforms,
            collect(comp_pr) as competitor_prompts,
            ['youtube', 'reddit', 'quora', 'medium'] as recommended_platforms
        ORDER BY pr.search_volume DESC
        LIMIT 20
        """
        
        async with self.driver.session() as session:
            result = await session.run(query)
            data = await result.data()
            
            opportunities = []
            for record in data:
                missing_platforms = set(record['recommended_platforms']) - set(record['existing_platforms'])
                
                opportunities.append({
                    'prompt': record['prompt'],
                    'missing_platforms': list(missing_platforms),
                    'competitor_insights': record['competitor_prompts'],
                    'optimization_priority': self._calculate_priority(record)
                })
            
            return opportunities
    
    def _calculate_priority(self, record: Dict) -> float:
        """计算优化优先级分数"""
        
        prompt = record['prompt']
        
        # 基础分数
        score = 0
        
        # 搜索量权重
        score += min(prompt['search_volume'] / 10000, 1) * 30
        
        # Citation Rate改进空间
        improvement_potential = 0.3 - prompt.get('citation_rate', 0)
        score += improvement_potential * 100 * 40
        
        # 缺少平台数量
        missing_count = len(record.get('missing_platforms', []))
        score += missing_count * 10
        
        # 竞品表现
        if record.get('competitor_prompts'):
            score += 20
        
        return round(score, 2)
```

## 3.5 跨平台发布服务

### 3.5.1 自动化发布管线

```python
# publish_service/core/publisher.py
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
from enum import Enum

class Platform(Enum):
    YOUTUBE = "youtube"
    REDDIT = "reddit"
    QUORA = "quora"
    MEDIUM = "medium"
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"
    WORDPRESS = "wordpress"

class CrossPlatformPublisher:
    def __init__(self):
        self.publishers = {
            Platform.YOUTUBE: YouTubePublisher(),
            Platform.REDDIT: RedditPublisher(),
            Platform.QUORA: QuoraPublisher(),
            Platform.MEDIUM: MediumPublisher(),
            Platform.LINKEDIN: LinkedInPublisher(),
            Platform.TWITTER: TwitterPublisher(),
            Platform.INSTAGRAM: InstagramPublisher(),
            Platform.WORDPRESS: WordPressPublisher()
        }
        
        self.optimal_times = {
            Platform.YOUTUBE: [(19, 0), (20, 0)],  # 7PM, 8PM
            Platform.REDDIT: [(10, 0), (19, 0)],   # 10AM, 7PM
            Platform.LINKEDIN: [(9, 0), (17, 0)],   # 9AM, 5PM
            Platform.TWITTER: [(9, 0), (12, 0), (17, 0)],  # Multiple times
            Platform.INSTAGRAM: [(11, 0), (19, 0)]  # 11AM, 7PM
        }
    
    async def publish_content_matrix(
        self,
        content_matrix: Dict,
        scheduling_strategy: str = "optimal"
    ) -> Dict:
        """发布完整的内容矩阵到多个平台"""
        
        results = {
            'total_scheduled': 0,
            'total_published': 0,
            'failures': [],
            'platform_results': {}
        }
        
        # 1. 准备发布任务
        publish_tasks = self._prepare_publish_tasks(
            content_matrix,
            scheduling_strategy
        )
        
        # 2. 执行发布（可并行）
        if scheduling_strategy == "immediate":
            # 立即并行发布
            task_results = await asyncio.gather(
                *[self._publish_single(task) for task in publish_tasks],
                return_exceptions=True
            )
        else:
            # 按计划发布
            task_results = await self._scheduled_publish(publish_tasks)
        
        # 3. 汇总结果
        for task, result in zip(publish_tasks, task_results):
            platform = task['platform']
            if isinstance(result, Exception):
                results['failures'].append({
                    'platform': platform,
                    'error': str(result)
                })
            else:
                results['platform_results'][platform] = result
                if result.get('status') == 'published':
                    results['total_published'] += 1
        
        results['total_scheduled'] = len(publish_tasks)
        
        return results
    
    def _prepare_publish_tasks(
        self,
        content_matrix: Dict,
        scheduling_strategy: str
    ) -> List[Dict]:
        """准备发布任务列表"""
        
        tasks = []
        base_time = datetime.now()
        
        for platform_str, content in content_matrix.items():
            if platform_str == 'metadata':
                continue
            
            platform = Platform(platform_str)
            
            # 确定发布时间
            if scheduling_strategy == "optimal":
                publish_time = self._get_next_optimal_time(platform)
            elif scheduling_strategy == "staggered":
                # 错开发布，每个平台间隔30分钟
                publish_time = base_time + timedelta(minutes=30 * len(tasks))
            else:  # immediate
                publish_time = base_time
            
            task = {
                'platform': platform,
                'content': content,
                'publish_time': publish_time,
                'retry_count': 0,
                'max_retries': 3
            }
            
            tasks.append(task)
        
        return tasks
    
    async def _publish_single(self, task: Dict) -> Dict:
        """发布单个内容到指定平台"""
        
        platform = task['platform']
        content = task['content']
        
        # 平台特定的内容适配
        adapted_content = self._adapt_content_for_platform(content, platform)
        
        # 调用平台发布器
        publisher = self.publishers.get(platform)
        if not publisher:
            raise ValueError(f"No publisher for platform: {platform}")
        
        try:
            result = await publisher.publish(adapted_content)
            
            # 记录发布成功
            await self._log_publish_success(task, result)
            
            return {
                'platform': platform.value,
                'status': 'published',
                'url': result.get('url'),
                'metrics': result.get('initial_metrics', {}),
                'published_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            # 重试逻辑
            if task['retry_count'] < task['max_retries']:
                task['retry_count'] += 1
                await asyncio.sleep(30 * task['retry_count'])  # 递增延迟
                return await self._publish_single(task)
            else:
                await self._log_publish_failure(task, str(e))
                raise
    
    def _adapt_content_for_platform(
        self,
        content: Dict,
        platform: Platform
    ) -> Dict:
        """适配内容格式以符合平台要求"""
        
        adaptations = {
            Platform.YOUTUBE: self._adapt_for_youtube,
            Platform.REDDIT: self._adapt_for_reddit,
            Platform.TWITTER: self._adapt_for_twitter,
            Platform.LINKEDIN: self._adapt_for_linkedin,
            Platform.INSTAGRAM: self._adapt_for_instagram
        }
        
        adapter = adaptations.get(platform)
        if adapter:
            return adapter(content)
        return content
    
    def _adapt_for_youtube(self, content: Dict) -> Dict:
        """适配YouTube格式"""
        
        return {
            'title': content.get('title', ''),
            'description': self._format_youtube_description(content),
            'tags': content.get('tags', []),
            'category': content.get('category', 'Education'),
            'thumbnail': content.get('thumbnail_url'),
            'chapters': self._generate_chapters(content),
            'end_screen': content.get('end_screen'),
            'cards': content.get('cards', [])
        }
    
    def _format_youtube_description(self, content: Dict) -> str:
        """格式化YouTube描述"""
        
        description = content.get('description', '')
        
        # 添加时间戳
        if content.get('timestamps'):
            description += "\n\n⏱️ TIMESTAMPS:\n"
            for ts in content['timestamps']:
                description += f"{ts['time']} - {ts['title']}\n"
        
        # 添加链接
        if content.get('links'):
            description += "\n\n🔗 LINKS:\n"
            for link in content['links']:
                description += f"• {link['text']}: {link['url']}\n"
        
        # 添加社交媒体
        description += "\n\n📱 FOLLOW US:\n"
        description += "• Instagram: @brand\n"
        description += "• Twitter: @brand\n"
        
        return description
    
    def _adapt_for_reddit(self, content: Dict) -> Dict:
        """适配Reddit格式"""
        
        # Reddit需要更加社区化的语气
        title = content.get('title', '')
        body = content.get('content', '')
        
        # 调整为第一人称
        body = body.replace("Our product", "I've been using")
        body = body.replace("We recommend", "I'd recommend")
        
        return {
            'title': title,
            'text': body,
            'subreddit': content.get('subreddit', 'AskReddit'),
            'flair': content.get('flair')
        }
```

---

# 四、API接口设计

## 4.1 RESTful API规范

### 基础URL结构
```
https://api.geo-platform.com/v1
```

### 认证机制
```http
Authorization: Bearer {api_key}
X-Client-ID: {client_id}
```

## 4.2 核心API端点

### 4.2.1 Prompt管理API

```yaml
# 创建Prompt
POST /api/v1/prompts
Request:
  {
    "client_id": "uuid",
    "prompt_text": "string",
    "intent_type": "enum",
    "priority": "P0|P1|P2",
    "metadata": {}
  }
Response:
  {
    "id": "uuid",
    "status": "created",
    "quality_score": 85.5,
    "estimated_citation_rate": 0.28
  }

# 获取Prompt列表
GET /api/v1/prompts?client_id={id}&status={status}&page={n}

# 获取Prompt详情
GET /api/v1/prompts/{prompt_id}

# 更新Prompt
PUT /api/v1/prompts/{prompt_id}

# 删除Prompt
DELETE /api/v1/prompts/{prompt_id}

# 分析Prompt机会
POST /api/v1/prompts/{prompt_id}/analyze

# 优化Prompt
POST /api/v1/prompts/{prompt_id}/optimize
```

### 4.2.2 内容生成API

```yaml
# 生成内容矩阵
POST /api/v1/content/generate
Request:
  {
    "prompt_id": "uuid",
    "platforms": ["youtube", "reddit", "quora"],
    "content_types": ["faq", "video_script", "blog_post"],
    "options": {
      "tone": "professional",
      "length": "medium",
      "include_data": true
    }
  }
Response:
  {
    "job_id": "uuid",
    "status": "processing",
    "estimated_time": 300,
    "webhook_url": "https://..."
  }

# 获取生成状态
GET /api/v1/content/jobs/{job_id}

# 获取内容详情
GET /api/v1/content/{content_id}

# 评分内容质量
POST /api/v1/content/{content_id}/score

# 批准发布
POST /api/v1/content/{content_id}/approve
```

### 4.2.3 Citation追踪API

```yaml
# 获取Citation数据
GET /api/v1/citations?prompt_id={id}&date_from={date}&date_to={date}

# 触发Citation检查
POST /api/v1/citations/check
Request:
  {
    "prompt_ids": ["uuid1", "uuid2"],
    "platforms": ["chatgpt", "claude", "perplexity"]
  }

# 获取Citation报告
GET /api/v1/citations/report?client_id={id}&period={daily|weekly|monthly}

# 获取竞品Citation对比
GET /api/v1/citations/competitive?client_id={id}&competitors[]={domain}
```

### 4.2.4 知识图谱API

```yaml
# 查询知识图谱
POST /api/v1/knowledge-graph/query
Request:
  {
    "query": "cypher query string",
    "parameters": {}
  }

# 添加实体
POST /api/v1/knowledge-graph/entities

# 添加关系
POST /api/v1/knowledge-graph/relationships

# 获取相关实体
GET /api/v1/knowledge-graph/related?entity_id={id}&depth={n}
```

### 4.2.5 发布管理API

```yaml
# 创建发布任务
POST /api/v1/publish
Request:
  {
    "content_ids": ["uuid1", "uuid2"],
    "schedule": {
      "strategy": "optimal|immediate|custom",
      "custom_time": "2025-01-20T20:00:00Z"
    },
    "platforms": ["youtube", "reddit"]
  }

# 获取发布状态
GET /api/v1/publish/{task_id}

# 取消发布
DELETE /api/v1/publish/{task_id}

# 获取发布历史
GET /api/v1/publish/history?client_id={id}
```

---

# 五、开发计划与里程碑

## 5.1 开发阶段划分

### Phase 1: 核心基础（Week 1-4）

| 周次 | 开发任务 | 交付物 | 验收标准 |
|-----|---------|--------|---------|
| W1 | • 系统架构设计<br>• 数据库设计<br>• 开发环境搭建 | • 架构文档<br>• 数据库Schema<br>• Docker环境 | • 评审通过<br>• 环境可运行 |
| W2 | • Prompt服务基础<br>• PostgreSQL集成<br>• 基础API | • Prompt CRUD API<br>• 数据模型 | • API可调用<br>• 单元测试覆盖80% |
| W3 | • Neo4j知识图谱<br>• 实体关系设计<br>• 图查询接口 | • 知识图谱服务<br>• Cypher查询 | • 图谱可查询<br>• 性能测试通过 |
| W4 | • LLM集成<br>• 内容生成引擎<br>• 质量评分系统 | • 内容生成API<br>• 评分模型 | • 可生成内容<br>• 评分准确率>85% |

### Phase 2: 功能完善（Week 5-8）

| 周次 | 开发任务 | 交付物 | 验收标准 |
|-----|---------|--------|---------|
| W5 | • Citation追踪服务<br>• 多平台爬虫<br>• 数据采集 | • Citation API<br>• 爬虫框架 | • 5个AI平台可追踪<br>• 准确率>90% |
| W6 | • 发布服务<br>• 平台适配器<br>• 排期系统 | • 发布API<br>• 排期功能 | • 3个平台可发布<br>• 定时发布可用 |
| W7 | • 前端开发<br>• Dashboard<br>• 数据可视化 | • React前端<br>• Grafana集成 | • 界面可用<br>• 数据实时更新 |
| W8 | • 系统集成<br>• 端到端测试<br>• 性能优化 | • 完整系统<br>• 测试报告 | • 全流程可运行<br>• 响应时间<2s |

### Phase 3: 产品化（Week 9-12）

| 周次 | 开发任务 | 交付物 | 验收标准 |
|-----|---------|--------|---------|
| W9 | • 多租户支持<br>• 权限系统<br>• API限流 | • 租户隔离<br>• RBAC系统 | • 多客户可用<br>• 权限测试通过 |
| W10 | • 监控告警<br>• 日志系统<br>• 错误追踪 | • Prometheus监控<br>• ELK日志 | • 监控覆盖率>95%<br>• 告警及时 |
| W11 | • 文档编写<br>• API文档<br>• 用户手册 | • 完整文档<br>• Swagger API | • 文档完整<br>• 示例可运行 |
| W12 | • 部署上线<br>• 生产环境<br>• 客户试用 | • 生产系统<br>• SLA保障 | • 系统稳定<br>• 可用性>99% |

## 5.2 技术债务管理

```python
# 技术债务追踪
tech_debt = {
    "P0_必须解决": [
        "Citation追踪准确性优化",
        "内容生成质量一致性",
        "知识图谱查询性能"
    ],
    "P1_计划解决": [
        "代码重复优化",
        "测试覆盖率提升",
        "监控指标完善"
    ],
    "P2_待观察": [
        "架构解耦优化",
        "缓存策略优化",
        "数据库索引优化"
    ]
}
```

---

# 六、测试方案

## 6.1 测试策略

### 测试金字塔

```
         E2E测试 (10%)
        /            \
       集成测试 (30%)
      /              \
     单元测试 (60%)
    /                \
```

## 6.2 测试计划

### 6.2.1 单元测试

```python
# tests/unit/test_prompt_scorer.py
import pytest
from prompt_service.core.scoring import PromptScorer

class TestPromptScorer:
    def setup_method(self):
        self.scorer = PromptScorer()
    
    def test_high_intent_prompt_scoring(self):
        prompt = "best cooling mattress for hot sleepers 2025"
        metadata = {
            'search_volume': 5000,
            'competition_level': 'medium',
            'existing_content_count': 3
        }
        
        score = self.scorer.score_prompt(prompt, metadata)
        
        assert score.total_score >= 70
        assert score.priority == "P0"
        assert score.conversion_intent_score >= 80
    
    def test_low_quality_prompt_scoring(self):
        prompt = "mattress"
        metadata = {
            'search_volume': 100,
            'competition_level': 'very_high',
            'existing_content_count': 50
        }
        
        score = self.scorer.score_prompt(prompt, metadata)
        
        assert score.total_score < 40
        assert score.priority == "P2"
```

### 6.2.2 集成测试

```python
# tests/integration/test_content_generation.py
import pytest
import asyncio
from content_service.core.generator import MultiModalContentGenerator

class TestContentGeneration:
    @pytest.mark.asyncio
    async def test_content_matrix_generation(self):
        generator = MultiModalContentGenerator()
        
        prompt = "how to choose the right mattress firmness"
        knowledge_graph_data = {
            'products': [...],
            'features': [...],
            'problems': [...]
        }
        target_platforms = ['youtube', 'reddit', 'quora']
        
        content_matrix = await generator.generate_content_matrix(
            prompt,
            knowledge_graph_data,
            target_platforms
        )
        
        assert len(content_matrix) == len(target_platforms) + 1  # +metadata
        assert 'youtube' in content_matrix
        assert 'metadata' in content_matrix
        assert content_matrix['youtube']['content_type'] == 'video_script'
```

### 6.2.3 性能测试

```python
# tests/performance/test_load.py
import asyncio
import aiohttp
import time

async def test_concurrent_content_generation():
    """测试并发内容生成性能"""
    
    concurrent_requests = 50
    api_url = "http://localhost:8000/api/v1/content/generate"
    
    async def make_request(session, prompt_id):
        payload = {
            "prompt_id": prompt_id,
            "platforms": ["youtube", "reddit"],
            "content_types": ["faq", "blog_post"]
        }
        
        start = time.time()
        async with session.post(api_url, json=payload) as response:
            result = await response.json()
            elapsed = time.time() - start
            return elapsed, response.status
    
    async with aiohttp.ClientSession() as session:
        tasks = [
            make_request(session, f"test-prompt-{i}")
            for i in range(concurrent_requests)
        ]
        
        results = await asyncio.gather(*tasks)
        
        # 分析结果
        response_times = [r[0] for r in results]
        success_count = sum(1 for r in results if r[1] == 200)
        
        print(f"并发请求数: {concurrent_requests}")
        print(f"成功率: {success_count/concurrent_requests*100}%")
        print(f"平均响应时间: {sum(response_times)/len(response_times):.2f}秒")
        print(f"最大响应时间: {max(response_times):.2f}秒")
        
        # 断言
        assert success_count/concurrent_requests >= 0.95  # 95%成功率
        assert sum(response_times)/len(response_times) < 5  # 平均<5秒
```

---

# 七、部署方案

## 7.1 容器化部署

### 7.1.1 Docker Compose配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL主数据库
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: geo_platform
      POSTGRES_USER: geo_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  # Neo4j知识图谱
  neo4j:
    image: neo4j:5.0
    environment:
      NEO4J_AUTH: neo4j/${NEO4J_PASSWORD}
      NEO4J_PLUGINS: '["graph-data-science"]'
    volumes:
      - neo4j_data:/data
    ports:
      - "7474:7474"  # Browser
      - "7687:7687"  # Bolt
  
  # Redis缓存
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
  
  # ClickHouse分析数据库
  clickhouse:
    image: clickhouse/clickhouse-server:latest
    volumes:
      - clickhouse_data:/var/lib/clickhouse
    ports:
      - "8123:8123"
      - "9000:9000"
  
  # Prompt服务
  prompt-service:
    build:
      context: ./services/prompt-service
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://geo_user:${DB_PASSWORD}@postgres:5432/geo_platform
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    ports:
      - "8001:8000"
  
  # 内容生成服务
  content-service:
    build:
      context: ./services/content-service
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://geo_user:${DB_PASSWORD}@postgres:5432/geo_platform
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      CLAUDE_API_KEY: ${CLAUDE_API_KEY}
    depends_on:
      - postgres
      - redis
    ports:
      - "8002:8000"
  
  # Citation追踪服务
  citation-service:
    build:
      context: ./services/citation-service
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://geo_user:${DB_PASSWORD}@postgres:5432/geo_platform
      CLICKHOUSE_URL: http://clickhouse:8123
    depends_on:
      - postgres
      - clickhouse
    ports:
      - "8003:8000"
  
  # 知识图谱服务
  knowledge-service:
    build:
      context: ./services/knowledge-service
      dockerfile: Dockerfile
    environment:
      NEO4J_URI: bolt://neo4j:7687
      NEO4J_USER: neo4j
      NEO4J_PASSWORD: ${NEO4J_PASSWORD}
    depends_on:
      - neo4j
    ports:
      - "8004:8000"
  
  # API网关
  api-gateway:
    image: kong:3.0
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/declarative/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
    volumes:
      - ./kong:/kong/declarative
    ports:
      - "8000:8000"  # Proxy
      - "8444:8443"  # Proxy SSL
      - "8445:8444"  # Admin API SSL
  
  # 前端应用
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
  
  # Celery Worker
  celery-worker:
    build:
      context: ./services/content-service
      dockerfile: Dockerfile
    command: celery -A app.celery worker --loglevel=info
    environment:
      DATABASE_URL: postgresql://geo_user:${DB_PASSWORD}@postgres:5432/geo_platform
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis
      - postgres
  
  # Celery Beat
  celery-beat:
    build:
      context: ./services/content-service
      dockerfile: Dockerfile
    command: celery -A app.celery beat --loglevel=info
    environment:
      DATABASE_URL: postgresql://geo_user:${DB_PASSWORD}@postgres:5432/geo_platform
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis
      - postgres
  
  # Airflow
  airflow:
    image: apache/airflow:2.5.0
    environment:
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql://geo_user:${DB_PASSWORD}@postgres:5432/airflow
      AIRFLOW_HOME: /opt/airflow
    volumes:
      - ./airflow/dags:/opt/airflow/dags
      - ./airflow/logs:/opt/airflow/logs
    depends_on:
      - postgres
    ports:
      - "8080:8080"
  
  # Prometheus监控
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
  
  # Grafana可视化
  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3001:3000"
    depends_on:
      - prometheus

volumes:
  postgres_data:
  neo4j_data:
  redis_data:
  clickhouse_data:
  prometheus_data:
  grafana_data:
```

### 7.1.2 Kubernetes部署配置

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: geo-platform-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: geo-platform-api
  template:
    metadata:
      labels:
        app: geo-platform-api
    spec:
      containers:
      - name: api
        image: geo-platform/api:v1.0.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_URL
          value: redis://redis-service:6379
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: geo-platform-api-service
  namespace: production
spec:
  selector:
    app: geo-platform-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: geo-platform-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: geo-platform-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 7.2 CI/CD流程

### 7.2.1 GitHub Actions配置

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run tests
      env:
        DATABASE_URL: postgresql://postgres:testpass@localhost:5432/test
        REDIS_URL: redis://localhost:6379
      run: |
        pytest tests/unit --cov=src --cov-report=xml
        pytest tests/integration
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
    
    - name: Run linting
      run: |
        flake8 src/
        black --check src/
        mypy src/

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Docker images
      run: |
        docker buildx build --platform linux/amd64,linux/arm64 \
          -t geo-platform/api:${{ github.sha }} \
          -t geo-platform/api:latest \
          --push .

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v4
      with:
        manifests: |
          k8s/deployment.yaml
          k8s/service.yaml
        images: |
          geo-platform/api:${{ github.sha }}
        namespace: production
```

---

# 八、监控与运维

## 8.1 监控指标体系

### 8.1.1 业务指标

```python
# monitoring/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# 业务指标定义
prompts_created = Counter(
    'geo_prompts_created_total',
    'Total number of prompts created',
    ['client_id', 'intent_type']
)

content_generated = Counter(
    'geo_content_generated_total',
    'Total content pieces generated',
    ['client_id', 'platform', 'content_type']
)

citation_rate = Gauge(
    'geo_citation_rate',
    'Current AI citation rate',
    ['client_id', 'prompt_id', 'ai_platform']
)

content_quality_score = Histogram(
    'geo_content_quality_score',
    'Content quality scores distribution',
    ['content_type'],
    buckets=[50, 60, 70, 80, 90, 95, 100]
)

api_request_duration = Histogram(
    'geo_api_request_duration_seconds',
    'API request duration',
    ['method', 'endpoint', 'status']
)

# 系统指标
database_connections = Gauge(
    'geo_database_connections',
    'Number of database connections',
    ['database']
)

queue_size = Gauge(
    'geo_queue_size',
    'Size of task queues',
    ['queue_name']
)

cache_hit_rate = Gauge(
    'geo_cache_hit_rate',
    'Cache hit rate percentage',
    ['cache_type']
)
```

### 8.1.2 Grafana Dashboard配置

```json
{
  "dashboard": {
    "title": "GEO Platform Monitoring",
    "panels": [
      {
        "title": "AI Citation Rate Trend",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(geo_citation_rate) by (client_id)",
            "legendFormat": "{{client_id}}"
          }
        ]
      },
      {
        "title": "Content Generation Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(geo_content_generated_total[5m])",
            "legendFormat": "{{platform}}"
          }
        ]
      },
      {
        "title": "API Response Time",
        "type": "heatmap",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(geo_api_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p95"
          }
        ]
      },
      {
        "title": "Content Quality Distribution",
        "type": "histogram",
        "targets": [
          {
            "expr": "geo_content_quality_score_bucket"
          }
        ]
      }
    ]
  }
}
```

## 8.2 告警规则

```yaml
# prometheus/alerts.yml
groups:
  - name: geo_platform_alerts
    rules:
      # Citation Rate告警
      - alert: LowCitationRate
        expr: avg(geo_citation_rate) < 0.15
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Low AI Citation Rate detected"
          description: "Citation rate is below 15% for {{ $labels.client_id }}"
      
      # API响应时间告警
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, rate(geo_api_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High API latency detected"
          description: "95th percentile latency is above 2 seconds"
      
      # 内容生成失败率告警
      - alert: HighContentGenerationFailureRate
        expr: rate(geo_content_generation_failures_total[15m]) > 0.1
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "High content generation failure rate"
          description: "Failure rate is above 10%"
      
      # 数据库连接告警
      - alert: DatabaseConnectionPoolExhausted
        expr: geo_database_connections > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "{{ $value }} connections in use (>90)"
```

---

# 九、安全设计

## 9.1 安全架构

### 9.1.1 认证与授权

```python
# security/auth.py
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta
from typing import Optional
import casbin

security = HTTPBearer()

class AuthManager:
    def __init__(self):
        self.secret_key = os.getenv("JWT_SECRET_KEY")
        self.algorithm = "HS256"
        self.enforcer = self._init_casbin()
    
    def _init_casbin(self):
        """初始化Casbin RBAC"""
        enforcer = casbin.Enforcer('rbac_model.conf', 'rbac_policy.csv')
        return enforcer
    
    def create_token(self, user_id: str, client_id: str, role: str) -> str:
        """创建JWT令牌"""
        payload = {
            'user_id': user_id,
            'client_id': client_id,
            'role': role,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        return token
    
    async def verify_token(
        self,
        credentials: HTTPAuthorizationCredentials = Security(security)
    ) -> dict:
        """验证JWT令牌"""
        token = credentials.credentials
        
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            
            # 检查过期
            if payload['exp'] < datetime.utcnow().timestamp():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired"
                )
            
            return payload
            
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    def check_permission(
        self,
        user_id: str,
        resource: str,
        action: str
    ) -> bool:
        """检查权限"""
        return self.enforcer.enforce(user_id, resource, action)
    
    def require_permission(
        self,
        resource: str,
        action: str
    ):
        """装饰器：要求特定权限"""
        def decorator(func):
            async def wrapper(*args, **kwargs):
                # 从请求上下文获取用户信息
                user = kwargs.get('current_user')
                
                if not self.check_permission(user['user_id'], resource, action):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Insufficient permissions"
                    )
                
                return await func(*args, **kwargs)
            return wrapper
        return decorator
```

### 9.1.2 数据加密

```python
# security/encryption.py
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import base64
import os

class EncryptionManager:
    def __init__(self):
        self.master_key = os.getenv("MASTER_ENCRYPTION_KEY")
        self.fernet = self._init_fernet()
    
    def _init_fernet(self) -> Fernet:
        """初始化加密器"""
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'stable_salt',  # 生产环境应使用随机salt
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(
            kdf.derive(self.master_key.encode())
        )
        return Fernet(key)
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """加密敏感数据"""
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """解密敏感数据"""
        return self.fernet.decrypt(encrypted_data.encode()).decode()
    
    def hash_password(self, password: str) -> str:
        """哈希密码"""
        import bcrypt
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """验证密码"""
        import bcrypt
        return bcrypt.checkpw(
            password.encode('utf-8'),
            hashed.encode('utf-8')
        )
```

## 9.2 API安全

### 9.2.1 限流与防护

```python
# security/rate_limiter.py
from fastapi import Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
import redis
import time

# 创建限流器
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour", "1000/day"]
)

class RateLimiter:
    def __init__(self):
        self.redis_client = redis.Redis(
            host='localhost',
            port=6379,
            decode_responses=True
        )
    
    async def check_rate_limit(
        self,
        request: Request,
        client_id: str,
        limit_type: str = "api"
    ):
        """检查速率限制"""
        
        # 根据客户端订阅级别设置限制
        limits = {
            'starter': {'per_minute': 10, 'per_hour': 100},
            'pro': {'per_minute': 30, 'per_hour': 500},
            'enterprise': {'per_minute': 100, 'per_hour': 5000}
        }
        
        # 获取客户端级别
        client_tier = await self._get_client_tier(client_id)
        limit_config = limits.get(client_tier, limits['starter'])
        
        # 检查分钟级限制
        minute_key = f"rate_limit:{client_id}:{limit_type}:minute"
        minute_count = self.redis_client.incr(minute_key)
        
        if minute_count == 1:
            self.redis_client.expire(minute_key, 60)
        
        if minute_count > limit_config['per_minute']:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded (per minute)"
            )
        
        # 检查小时级限制
        hour_key = f"rate_limit:{client_id}:{limit_type}:hour"
        hour_count = self.redis_client.incr(hour_key)
        
        if hour_count == 1:
            self.redis_client.expire(hour_key, 3600)
        
        if hour_count > limit_config['per_hour']:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded (per hour)"
            )
```

---

# 十、运营支持工具

## 10.1 管理后台

### 10.1.1 客户管理界面

```typescript
// admin/src/pages/ClientManagement.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Client {
  id: string;
  companyName: string;
  industry: string;
  subscriptionTier: string;
  monthlyQuota: number;
  currentUsage: number;
  citationRate: number;
  status: string;
}

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const columns = [
    {
      title: '客户名称',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: '套餐',
      dataIndex: 'subscriptionTier',
      key: 'subscriptionTier',
      render: (tier: string) => (
        <Tag color={tier === 'enterprise' ? 'gold' : tier === 'pro' ? 'blue' : 'green'}>
          {tier.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Citation Rate',
      dataIndex: 'citationRate',
      key: 'citationRate',
      render: (rate: number) => (
        <Progress percent={rate * 100} size="small" />
      ),
    },
    {
      title: '配额使用',
      key: 'usage',
      render: (record: Client) => (
        <span>{record.currentUsage}/{record.monthlyQuota}</span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Client) => (
        <Space>
          <Button onClick={() => viewDetails(record)}>详情</Button>
          <Button onClick={() => editClient(record)}>编辑</Button>
          <Button onClick={() => generateReport(record)}>报告</Button>
        </Space>
      ),
    },
  ];
  
  const viewDetails = (client: Client) => {
    setSelectedClient(client);
    setModalVisible(true);
  };
  
  return (
    <div className="client-management">
      <Card title="客户管理">
        <Table
          columns={columns}
          dataSource={clients}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <Modal
        title="客户详情"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        {selectedClient && (
          <div>
            <Descriptions title="基本信息">
              <Descriptions.Item label="公司名称">
                {selectedClient.companyName}
              </Descriptions.Item>
              <Descriptions.Item label="行业">
                {selectedClient.industry}
              </Descriptions.Item>
              <Descriptions.Item label="套餐">
                {selectedClient.subscriptionTier}
              </Descriptions.Item>
            </Descriptions>
            
            <Card title="Citation Rate趋势" style={{ marginTop: 20 }}>
              <LineChart width={700} height={300} data={citationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#8884d8" />
              </LineChart>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};
```

## 10.2 数据分析工具

### 10.2.1 Citation分析报表

```python
# analytics/citation_report.py
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
from typing import Dict, List

class CitationAnalyzer:
    def __init__(self, clickhouse_client):
        self.ch_client = clickhouse_client
    
    def generate_citation_report(
        self,
        client_id: str,
        date_range: tuple
    ) -> Dict:
        """生成Citation分析报告"""
        
        # 1. 获取Citation数据
        citation_data = self._fetch_citation_data(client_id, date_range)
        
        # 2. 计算关键指标
        metrics = {
            'avg_citation_rate': self._calculate_avg_citation_rate(citation_data),
            'trend': self._calculate_trend(citation_data),
            'platform_breakdown': self._platform_breakdown(citation_data),
            'prompt_performance': self._prompt_performance(citation_data),
            'competitive_analysis': self._competitive_analysis(citation_data)
        }
        
        # 3. 生成可视化
        visualizations = self._generate_visualizations(citation_data, metrics)
        
        # 4. 生成优化建议
        recommendations = self._generate_recommendations(metrics)
        
        return {
            'client_id': client_id,
            'period': date_range,
            'metrics': metrics,
            'visualizations': visualizations,
            'recommendations': recommendations,
            'generated_at': datetime.now().isoformat()
        }
    
    def _fetch_citation_data(
        self,
        client_id: str,
        date_range: tuple
    ) -> pd.DataFrame:
        """从ClickHouse获取Citation数据"""
        
        query = """
        SELECT
            date,
            prompt_id,
            ai_platform,
            citation_count,
            total_queries,
            citation_rate,
            share_of_voice
        FROM citation_summary
        WHERE client_id = %(client_id)s
            AND date BETWEEN %(start_date)s AND %(end_date)s
        ORDER BY date, prompt_id
        """
        
        df = pd.read_sql(
            query,
            self.ch_client,
            params={
                'client_id': client_id,
                'start_date': date_range[0],
                'end_date': date_range[1]
            }
        )
        
        return df
    
    def _calculate_avg_citation_rate(self, df: pd.DataFrame) -> float:
        """计算平均Citation Rate"""
        return df['citation_rate'].mean()
    
    def _calculate_trend(self, df: pd.DataFrame) -> Dict:
        """计算趋势"""
        
        # 按日期分组
        daily_avg = df.groupby('date')['citation_rate'].mean()
        
        # 计算趋势（线性回归）
        from scipy import stats
        x = range(len(daily_avg))
        slope, intercept, r_value, p_value, std_err = stats.linregress(
            x, daily_avg.values
        )
        
        return {
            'slope': slope,
            'r_squared': r_value ** 2,
            'trend_direction': 'increasing' if slope > 0 else 'decreasing',
            'daily_averages': daily_avg.to_dict()
        }
    
    def _platform_breakdown(self, df: pd.DataFrame) -> Dict:
        """AI平台细分分析"""
        
        platform_stats = df.groupby('ai_platform').agg({
            'citation_rate': 'mean',
            'share_of_voice': 'mean',
            'citation_count': 'sum',
            'total_queries': 'sum'
        }).to_dict('index')
        
        return platform_stats
    
    def _generate_visualizations(
        self,
        df: pd.DataFrame,
        metrics: Dict
    ) -> Dict:
        """生成可视化图表"""
        
        visualizations = {}
        
        # 1. Citation Rate趋势图
        fig, ax = plt.subplots(figsize=(12, 6))
        daily_avg = df.groupby('date')['citation_rate'].mean()
        daily_avg.plot(ax=ax, marker='o')
        ax.set_title('AI Citation Rate Trend')
        ax.set_xlabel('Date')
        ax.set_ylabel('Citation Rate')
        ax.grid(True, alpha=0.3)
        
        # 保存图表
        fig.savefig('citation_trend.png', dpi=100, bbox_inches='tight')
        visualizations['trend_chart'] = 'citation_trend.png'
        
        # 2. 平台对比图
        fig, ax = plt.subplots(figsize=(10, 6))
        platform_data = pd.DataFrame(metrics['platform_breakdown']).T
        platform_data['citation_rate'].plot(kind='bar', ax=ax)
        ax.set_title('Citation Rate by AI Platform')
        ax.set_xlabel('Platform')
        ax.set_ylabel('Citation Rate')
        ax.set_xticklabels(ax.get_xticklabels(), rotation=45)
        
        fig.savefig('platform_comparison.png', dpi=100, bbox_inches='tight')
        visualizations['platform_chart'] = 'platform_comparison.png'
        
        return visualizations
    
    def _generate_recommendations(self, metrics: Dict) -> List[str]:
        """生成优化建议"""
        
        recommendations = []
        
        # 基于Citation Rate
        avg_rate = metrics['avg_citation_rate']
        if avg_rate < 0.15:
            recommendations.append(
                "Citation Rate低于15%，建议：增加权威信源引用、优化内容结构、增加视频内容比例"
            )
        elif avg_rate < 0.25:
            recommendations.append(
                "Citation Rate有提升空间，建议：扩展到更多平台、增加KOL背书、优化Schema标记"
            )
        
        # 基于平台表现
        platform_stats = metrics['platform_breakdown']
        weak_platforms = [
            p for p, stats in platform_stats.items()
            if stats['citation_rate'] < 0.10
        ]
        
        if weak_platforms:
            recommendations.append(
                f"以下平台表现较弱：{', '.join(weak_platforms)}。建议针对性优化内容格式"
            )
        
        # 基于趋势
        trend = metrics['trend']
        if trend['trend_direction'] == 'decreasing':
            recommendations.append(
                "Citation Rate呈下降趋势，建议：检查竞品动态、更新陈旧内容、增加内容更新频率"
            )
        
        return recommendations
```

---

# 十一、附录

## 11.1 开发规范

### 代码规范
- Python: PEP 8 + Black格式化
- TypeScript: ESLint + Prettier
- Git: Conventional Commits
- API: RESTful + OpenAPI 3.0

### 文档规范
- README.md: 项目说明
- API文档: Swagger/ReDoc
- 代码注释: Docstring
- 变更日志: CHANGELOG.md

## 11.2 工具链

| 类别 | 工具 | 用途 |
|-----|------|-----|
| IDE | VSCode / PyCharm | 开发环境 |
| API测试 | Postman / Insomnia | 接口测试 |
| 性能测试 | Locust / K6 | 负载测试 |
| 监控 | Datadog / New Relic | APM监控 |
| 日志 | ELK Stack | 日志分析 |
| 协作 | Slack / Discord | 团队沟通 |
| 项目管理 | Jira / Linear | 任务跟踪 |

## 11.3 参考资料

- [Neo4j官方文档](https://neo4j.com/docs/)
- [LangChain文档](https://docs.langchain.com/)
- [FastAPI文档](https://fastapi.tiangolo.com/)
- [Kubernetes最佳实践](https://kubernetes.io/docs/concepts/)
- [OWASP安全指南](https://owasp.org/)

---

**文档版本**: v1.0  
**创建日期**: 2025-01-XX  
**作者**: [技术团队]  
**审核**: [CTO]  
**状态**: 初稿

---

这份开发文档提供了完整的技术实现方案，包括：

1. **系统架构设计** - 微服务架构、技术选型
2. **数据库设计** - PostgreSQL、Neo4j、ClickHouse多库协同
3. **核心模块实现** - Prompt工程、内容生成、Citation追踪等详细代码
4. **API接口设计** - RESTful API规范和端点定义
5. **开发计划** - 12周详细开发里程碑
6. **测试方案** - 单元测试、集成测试、性能测试
7. **部署方案** - Docker、Kubernetes容器化部署
8. **监控运维** - Prometheus监控、Grafana可视化
9. **安全设计** - 认证授权、数据加密、API防护
10. **运营工具** - 管理后台、数据分析工具

这份文档可以直接用于指导开发团队进行系统实现。如需要更详细的某个模块实现或特定技术细节，请告诉我。