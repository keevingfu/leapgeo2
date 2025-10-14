# PHASE 1: Database Foundation for GEO Platform

## FEATURE

Build the complete data layer for the GEO Platform, including:

1. **PostgreSQL Schema**: Store business data (projects, prompts, citations, content)
2. **Neo4j Knowledge Graph**: Store entity relationships (Brand → Product → Feature → Problem)
3. **Redis Cache**: Real-time citation rate statistics and session management
4. **Data Migration**: Migrate all Mock data from index.tsx to databases

## EXAMPLES

### Current Mock Data Structure (from index.tsx)

**Projects Array** (line 36-73):
```javascript
const projects = [
  {
    id: 'sweetnight',
    name: 'SweetNight Mattress',
    industry: 'Consumer Electronics - Sleep Products',
    status: 'active',
    totalPrompts: 156,
    citationRate: 0.32,
    contentPublished: 289,
    platforms: ['YouTube', 'Reddit', 'Quora', ...],
  }
]
```

**Knowledge Graph Data** (line 76-147):
```javascript
const knowledgeGraphDataMap = {
  sweetnight: {
    nodes: [
      { id: 'sweetnight', type: 'Brand', label: 'SweetNight' },
      { id: 'coolnest', type: 'Product', label: 'CoolNest' },
      { id: 'cooling', type: 'Feature', label: 'Cooling Technology' },
      { id: 'hot-sleep', type: 'Problem', label: 'Hot Sleep' }
    ],
    relationships: [
      { from: 'sweetnight', to: 'coolnest', type: 'HAS_PRODUCT' },
      { from: 'coolnest', to: 'cooling', type: 'HAS_FEATURE' },
      { from: 'cooling', to: 'hot-sleep', type: 'SOLVES' }
    ]
  }
}
```

**Prompts Data** (line 1091-1219):
```javascript
const promptsDataMap = {
  sweetnight: [
    {
      id: 1,
      text: 'best mattress for hot sleepers 2025',
      intent: 'High-Intent',
      priority: 'P0',
      score: 92,
      citationRate: 0.35,
      status: 'active',
      platforms: ['YouTube', 'Reddit', 'Quora'],
      createdDate: '2024-12-15'
    }
  ]
}
```

**Citation Data** (line 1490-1605):
```javascript
const citationDataMap = {
  sweetnight: {
    platforms: [
      { name: 'ChatGPT', rate: 0.28, citations: 167, trend: 'up', change: 5.2 },
      { name: 'Perplexity', rate: 0.42, citations: 289, trend: 'up', change: 12.3 }
    ],
    recentCitations: [
      {
        platform: 'Perplexity',
        prompt: 'best cooling mattress for hot sleepers',
        source: 'SweetNight CoolNest Review - YouTube',
        position: 1,
        time: '2 hours ago'
      }
    ]
  }
}
```

## DOCUMENTATION

### PostgreSQL Schema Design
- **Reference**: https://www.postgresql.org/docs/current/ddl.html
- **Best Practices**: https://wiki.postgresql.org/wiki/Don%27t_Do_This
- **Connection**: Use MCP PostgreSQL server at `localhost:5437`

### Neo4j Knowledge Graph
- **Cypher Query**: https://neo4j.com/docs/cypher-manual/current/
- **Graph Data Model**: https://neo4j.com/developer/data-modeling/
- **Connection**: Use MCP Neo4j server at `localhost:7688`

### Redis Caching
- **Data Types**: https://redis.io/docs/data-types/
- **Caching Patterns**: https://redis.io/docs/manual/patterns/
- **Connection**: Use MCP Redis server at `localhost:6382`

## DATABASE SCHEMA

### PostgreSQL Tables

```sql
-- Projects table
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    industry VARCHAR(200),
    status VARCHAR(20) DEFAULT 'active',
    citation_rate DECIMAL(5,4),
    total_prompts INTEGER DEFAULT 0,
    content_published INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prompts table
CREATE TABLE prompts (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    intent VARCHAR(50),
    priority VARCHAR(10),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    citation_rate DECIMAL(5,4),
    status VARCHAR(20) DEFAULT 'active',
    created_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prompt platforms (many-to-many)
CREATE TABLE prompt_platforms (
    prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    PRIMARY KEY (prompt_id, platform)
);

-- Project platforms (many-to-many)
CREATE TABLE project_platforms (
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    PRIMARY KEY (project_id, platform)
);

-- Citations table
CREATE TABLE citations (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    prompt TEXT,
    source VARCHAR(500),
    position INTEGER,
    snippet TEXT,
    detected_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform statistics
CREATE TABLE platform_stats (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    citation_rate DECIMAL(5,4),
    total_citations INTEGER,
    trend VARCHAR(20),
    change_percentage DECIMAL(5,2),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, platform, date)
);

-- Indexes for performance
CREATE INDEX idx_prompts_project ON prompts(project_id);
CREATE INDEX idx_citations_project_date ON citations(project_id, detected_at);
CREATE INDEX idx_platform_stats_project_date ON platform_stats(project_id, date);
```

### Neo4j Graph Model

```cypher
// Create constraints
CREATE CONSTRAINT brand_id IF NOT EXISTS FOR (b:Brand) REQUIRE b.id IS UNIQUE;
CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT feature_id IF NOT EXISTS FOR (f:Feature) REQUIRE f.id IS UNIQUE;
CREATE CONSTRAINT problem_id IF NOT EXISTS FOR (pr:Problem) REQUIRE pr.id IS UNIQUE;

// Node labels and properties
// Brand: {id, label, project_id}
// Product: {id, label, project_id}
// Feature: {id, label, project_id}
// Problem: {id, label, project_id}
// Scenario: {id, label, project_id}
// UserGroup: {id, label, project_id}

// Relationship types
// HAS_PRODUCT, HAS_FEATURE, SOLVES, APPLIES_TO, NEEDS, HAS_PROBLEM
```

## MIGRATION SCRIPT

Create `scripts/migrate_mock_data.js`:

```javascript
// This will be generated to migrate all Mock data from index.tsx
// to PostgreSQL, Neo4j, and Redis

// Steps:
// 1. Parse index.tsx and extract all data objects
// 2. Insert projects into PostgreSQL
// 3. Insert prompts and relationships into PostgreSQL
// 4. Create knowledge graph nodes and relationships in Neo4j
// 5. Initialize Redis cache with current statistics
```

## SUCCESS CRITERIA

- [ ] PostgreSQL: All 3 projects migrated with complete data
- [ ] PostgreSQL: All prompts (156 + 89 + 45 = 290) imported
- [ ] Neo4j: Knowledge graphs for all 3 projects created
- [ ] Neo4j: All entity relationships properly linked
- [ ] Redis: Citation rate statistics cached
- [ ] Data Integrity: Foreign key constraints working
- [ ] Performance: Queries return in <100ms
- [ ] Verification: Can query any project data from databases

## OTHER CONSIDERATIONS

### Data Migration Order
1. Projects first (parent table)
2. Prompts and platforms (child tables)
3. Neo4j nodes (independent)
4. Neo4j relationships (requires nodes)
5. Redis cache (last, can be regenerated)

### Gotchas
- Citation rate stored as DECIMAL(5,4) to preserve precision (e.g., 0.3200)
- Timestamps use TIMESTAMP not DATETIME for PostgreSQL
- Neo4j node IDs must match across projects (use project_id property)
- Redis keys should use namespace pattern: `geo:project:{id}:metric`

### Performance Considerations
- Add indexes on frequently queried columns
- Use batch inserts for large datasets
- Cache frequently accessed data in Redis
- Use connection pooling for database connections

### Security
- Use parameterized queries to prevent SQL injection
- Store database credentials in ~/.mcp.env
- Validate all input data before insertion
- Use database roles with minimal required permissions
