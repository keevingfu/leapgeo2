# PHASE 2: FastAPI Backend for GEO Platform

## FEATURE

Build a complete RESTful + GraphQL API backend using FastAPI to power the GEO Platform frontend:

1. **RESTful API Endpoints**
   - Projects CRUD (`/api/v1/projects`)
   - Prompts Management (`/api/v1/prompts`)
   - Citations Tracking (`/api/v1/citations`)
   - Platform Statistics (`/api/v1/stats`)
   - Health Check & Monitoring

2. **GraphQL API**
   - Knowledge Graph Queries
   - Complex Relationship Traversals
   - Flexible Data Fetching

3. **Database Integration**
   - PostgreSQL connection pooling (SQLAlchemy)
   - Redis caching layer
   - Neo4j graph queries

4. **Data Validation**
   - Pydantic models for request/response
   - Input sanitization
   - Error handling

5. **API Documentation**
   - OpenAPI/Swagger auto-generation
   - GraphQL Playground
   - API usage examples

## EXAMPLES

### Current Frontend API Calls (from index.tsx)

The frontend currently uses Mock data. We need to replace these with real API calls:

**Project Loading** (line 36-73):
```javascript
// Current: Mock data
const projects = [
  {id: 'sweetnight', name: 'SweetNight Mattress', ...}
]

// Target: API call
const [projects, setProjects] = useState([]);
useEffect(() => {
  fetch('http://localhost:8000/api/v1/projects')
    .then(r => r.json())
    .then(setProjects);
}, []);
```

**Prompt Management** (line 1091-1219):
```javascript
// Current: Mock data
const promptsDataMap = { sweetnight: [...] }

// Target: API call
fetch(`http://localhost:8000/api/v1/projects/${projectId}/prompts`)
  .then(r => r.json())
  .then(setPrompts);
```

**Knowledge Graph Query** (line 76-147):
```javascript
// Current: Mock data
const knowledgeGraphDataMap = { sweetnight: {...} }

// Target: GraphQL query
const query = `
  query GetKnowledgeGraph($projectId: String!) {
    knowledgeGraph(projectId: $projectId) {
      nodes { id type label }
      relationships { from to type }
    }
  }
`;
```

### Reference FastAPI Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connections
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── project.py
│   │   ├── prompt.py
│   │   └── citation.py
│   │
│   ├── schemas/                # Database models (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── project.py
│   │   └── prompt.py
│   │
│   ├── routers/                # API routes
│   │   ├── __init__.py
│   │   ├── projects.py
│   │   ├── prompts.py
│   │   ├── citations.py
│   │   └── stats.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── project_service.py
│   │   ├── neo4j_service.py
│   │   └── cache_service.py
│   │
│   └── graphql/                # GraphQL
│       ├── __init__.py
│       ├── schema.py
│       ├── types.py
│       └── resolvers.py
│
├── tests/
│   ├── __init__.py
│   ├── test_projects.py
│   └── test_graphql.py
│
├── requirements.txt
├── .env
└── README.md
```

## DOCUMENTATION

### FastAPI
- **Official Docs**: https://fastapi.tiangolo.com/
- **Tutorial**: https://fastapi.tiangolo.com/tutorial/
- **Database Integration**: https://fastapi.tiangolo.com/tutorial/sql-databases/
- **Best Practices**: https://github.com/zhanymkanov/fastapi-best-practices

### SQLAlchemy
- **ORM Tutorial**: https://docs.sqlalchemy.org/en/20/tutorial/
- **Async Support**: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- **Connection Pooling**: https://docs.sqlalchemy.org/en/20/core/pooling.html

### Strawberry GraphQL
- **Docs**: https://strawberry.rocks/docs
- **FastAPI Integration**: https://strawberry.rocks/docs/integrations/fastapi
- **Schema Design**: https://strawberry.rocks/docs/general/schema-basics

### Pydantic
- **Models**: https://docs.pydantic.dev/latest/concepts/models/
- **Validation**: https://docs.pydantic.dev/latest/concepts/validators/
- **Settings**: https://docs.pydantic.dev/latest/concepts/pydantic_settings/

### Testing
- **pytest**: https://docs.pytest.org/
- **FastAPI Testing**: https://fastapi.tiangolo.com/tutorial/testing/
- **Coverage**: https://coverage.readthedocs.io/

## API SPECIFICATIONS

### RESTful Endpoints

#### Projects API
```python
# GET /api/v1/projects
# Response: List[ProjectResponse]
[
  {
    "id": "sweetnight",
    "name": "SweetNight Mattress",
    "industry": "Consumer Electronics - Sleep Products",
    "status": "active",
    "citation_rate": 0.32,
    "total_prompts": 156,
    "content_published": 289,
    "platforms": ["YouTube", "Reddit", "Quora", ...],
    "created_at": "2024-11-15T10:00:00Z"
  }
]

# GET /api/v1/projects/{project_id}
# Response: ProjectDetailResponse (includes knowledge graph preview)

# POST /api/v1/projects
# Request: ProjectCreate
# Response: ProjectResponse

# PUT /api/v1/projects/{project_id}
# Request: ProjectUpdate
# Response: ProjectResponse

# DELETE /api/v1/projects/{project_id}
# Response: 204 No Content
```

#### Prompts API
```python
# GET /api/v1/projects/{project_id}/prompts
# Query params: ?status=active&priority=P0&limit=20&offset=0
# Response: PaginatedPromptsResponse

# GET /api/v1/prompts/{prompt_id}
# Response: PromptDetailResponse

# POST /api/v1/prompts
# Request: PromptCreate
# Response: PromptResponse

# PUT /api/v1/prompts/{prompt_id}
# Request: PromptUpdate
# Response: PromptResponse

# DELETE /api/v1/prompts/{prompt_id}
# Response: 204 No Content
```

#### Citations API
```python
# GET /api/v1/projects/{project_id}/citations
# Query params: ?platform=Perplexity&start_date=2025-01-01&limit=50
# Response: PaginatedCitationsResponse

# GET /api/v1/citations/recent
# Query params: ?limit=10
# Response: List[CitationResponse]

# POST /api/v1/citations
# Request: CitationCreate
# Response: CitationResponse
```

#### Statistics API
```python
# GET /api/v1/stats/overview
# Response: PlatformOverviewStats

# GET /api/v1/stats/projects/{project_id}/platforms
# Response: List[PlatformStats]

# GET /api/v1/stats/leaderboard
# Response: CitationRateLeaderboard
```

### GraphQL Schema

```graphql
type Query {
  # Knowledge Graph
  knowledgeGraph(projectId: String!): KnowledgeGraph
  searchNodes(projectId: String!, query: String!): [Node]
  findSolutions(projectId: String!, problem: String!): [Feature]

  # Projects
  projects: [Project]
  project(id: String!): Project

  # Prompts
  prompts(projectId: String!, filters: PromptFilters): [Prompt]
}

type KnowledgeGraph {
  nodes: [Node]
  relationships: [Relationship]
}

type Node {
  id: String!
  type: NodeType!
  label: String!
  projectId: String!
}

enum NodeType {
  BRAND
  PRODUCT
  FEATURE
  PROBLEM
  SCENARIO
  USER_GROUP
}

type Relationship {
  from: String!
  to: String!
  type: RelationType!
}

enum RelationType {
  HAS_PRODUCT
  HAS_FEATURE
  SOLVES
  APPLIES_TO
  NEEDS
  HAS_PROBLEM
  BENEFITS
}

type Project {
  id: String!
  name: String!
  industry: String
  citationRate: Float
  prompts: [Prompt]
  knowledgeGraph: KnowledgeGraph
}

type Prompt {
  id: Int!
  text: String!
  intent: String
  priority: String
  score: Int
  citationRate: Float
  status: String
  platforms: [String]
}
```

## IMPLEMENTATION REQUIREMENTS

### 1. Database Connection Layer

**PostgreSQL (SQLAlchemy)**:
```python
# app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://claude:claude_dev_2025@localhost:5437/claude_dev"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session
```

**Neo4j Connection**:
```python
# app/services/neo4j_service.py
from neo4j import GraphDatabase

class Neo4jService:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            "bolt://localhost:7688",
            auth=("neo4j", "claude_neo4j_2025")
        )

    def get_knowledge_graph(self, project_id: str):
        with self.driver.session() as session:
            result = session.run("""
                MATCH (n {project_id: $project_id})
                RETURN n
            """, project_id=project_id)
            return [record for record in result]
```

**Redis Caching**:
```python
# app/services/cache_service.py
import redis
import json

class CacheService:
    def __init__(self):
        self.redis = redis.Redis(
            host='localhost',
            port=6382,
            password='claude_redis_2025',
            decode_responses=True
        )

    def get_project_info(self, project_id: str):
        key = f"geo:project:{project_id}:info"
        cached = self.redis.get(key)
        return json.loads(cached) if cached else None
```

### 2. Pydantic Models

```python
# app/models/project.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    industry: Optional[str] = None
    description: Optional[str] = None
    status: str = Field(default="active", pattern="^(active|paused|completed)$")

class ProjectCreate(ProjectBase):
    id: str = Field(..., min_length=1, max_length=50)
    platforms: List[str] = []

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    citation_rate: Optional[float] = Field(None, ge=0, le=1)

class ProjectResponse(ProjectBase):
    id: str
    citation_rate: Optional[float]
    total_prompts: int
    content_published: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### 3. API Routes

```python
# app/routers/projects.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all projects"""
    result = await db.execute(
        select(Project).offset(skip).limit(limit)
    )
    projects = result.scalars().all()
    return projects

@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    neo4j: Neo4jService = Depends(get_neo4j_service)
):
    """Get project with knowledge graph"""
    # Get from PostgreSQL
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get knowledge graph from Neo4j
    knowledge_graph = neo4j.get_knowledge_graph(project_id)

    return {
        **project.__dict__,
        "knowledge_graph": knowledge_graph
    }
```

### 4. GraphQL Integration

```python
# app/graphql/schema.py
import strawberry
from typing import List

@strawberry.type
class Node:
    id: str
    type: str
    label: str
    project_id: str

@strawberry.type
class KnowledgeGraph:
    nodes: List[Node]
    relationships: List["Relationship"]

@strawberry.type
class Query:
    @strawberry.field
    async def knowledge_graph(self, project_id: str) -> KnowledgeGraph:
        # Query Neo4j
        service = Neo4jService()
        data = service.get_knowledge_graph(project_id)
        return data

schema = strawberry.Schema(query=Query)
```

### 5. Main Application

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

app = FastAPI(
    title="GEO Platform API",
    version="1.0.0",
    description="API for GEO (Generative Engine Optimization) Platform"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects_router)
app.include_router(prompts_router)
app.include_router(citations_router)

# GraphQL endpoint
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
def root():
    return {
        "message": "GEO Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "graphql": "/graphql"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## SUCCESS CRITERIA

### Functional Requirements
- [ ] All RESTful endpoints implemented and working
- [ ] GraphQL API functional with Playground
- [ ] Database connections established (PostgreSQL, Neo4j, Redis)
- [ ] Frontend can fetch and display real data
- [ ] CRUD operations work correctly
- [ ] Pagination implemented for list endpoints
- [ ] Filtering and sorting work properly

### Non-Functional Requirements
- [ ] API response time <100ms (P95)
- [ ] OpenAPI documentation auto-generated
- [ ] Request validation with Pydantic
- [ ] Error handling with proper HTTP status codes
- [ ] Unit tests coverage >80%
- [ ] Integration tests for key flows
- [ ] CORS configured for frontend

### Data Quality
- [ ] Data consistency between frontend and backend
- [ ] Cache invalidation working correctly
- [ ] No N+1 query problems
- [ ] Connection pooling configured
- [ ] Graceful error handling

## OTHER CONSIDERATIONS

### Development Workflow
1. Set up Python virtual environment
2. Install dependencies (FastAPI, SQLAlchemy, Strawberry, etc.)
3. Create database models matching existing schema
4. Implement routers one by one
5. Add tests for each router
6. Integrate GraphQL
7. Connect frontend
8. Performance testing

### Dependencies
```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy[asyncio]==2.0.25
asyncpg==0.29.0
pydantic==2.5.3
pydantic-settings==2.1.0
strawberry-graphql[fastapi]==0.219.0
neo4j==5.16.0
redis==5.0.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.26.0
```

### Gotchas
- Use async/await for database operations (better performance)
- SQLAlchemy 2.0 syntax is different from 1.x
- Neo4j driver needs explicit session management
- Redis connection should be pooled
- Pydantic v2 has breaking changes from v1
- CORS must be configured before routes
- GraphQL resolver context needs dependency injection

### Performance Optimization
- Use async database connections (asyncpg)
- Implement Redis caching for frequently accessed data
- Use connection pooling (default: 5-20 connections)
- Lazy load relationships when possible
- Batch Neo4j queries
- Enable compression for responses >1KB

### Security
- Input validation with Pydantic (prevent SQL injection)
- Parameterized queries (SQLAlchemy)
- Rate limiting (optional for Phase 2)
- HTTPS in production (not needed for localhost dev)
- Environment variables for credentials
- No sensitive data in logs

### Testing Strategy
```python
# tests/test_projects.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_projects():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/projects")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_project():
    project_data = {
        "id": "test_project",
        "name": "Test Project",
        "industry": "Testing"
    }
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/projects", json=project_data)
    assert response.status_code == 201
```

### Deployment Considerations (Future)
- Use Gunicorn with Uvicorn workers in production
- Set up reverse proxy (Nginx)
- Configure environment-specific settings
- Database migrations with Alembic
- Health check endpoints for monitoring
- Logging configuration (structlog)

## VALIDATION

### Manual Testing Checklist
- [ ] Can start server: `uvicorn app.main:app --reload`
- [ ] OpenAPI docs accessible: http://localhost:8000/docs
- [ ] GraphQL Playground: http://localhost:8000/graphql
- [ ] GET /api/v1/projects returns data
- [ ] POST /api/v1/projects creates project
- [ ] GraphQL query returns knowledge graph
- [ ] Frontend can connect and display data
- [ ] Redis cache is being used
- [ ] No database connection leaks

### Automated Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_projects.py -v
```

## TIMELINE ESTIMATE

**With automation**: 3-4 days
- Day 1: Project setup, database models, basic CRUD
- Day 2: All REST endpoints, error handling
- Day 3: GraphQL API, frontend integration
- Day 4: Testing, documentation, optimization

**Without automation**: 10-15 days
- Setup: 1 day
- Models & DB: 2 days
- REST API: 4 days
- GraphQL: 3 days
- Testing: 2 days
- Integration: 2-3 days
