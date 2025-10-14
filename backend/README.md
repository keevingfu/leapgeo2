# GEO Platform FastAPI Backend

FastAPI backend for the GEO (Generative Engine Optimization) Platform.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

### 2. Start the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --port 8000

# Or using the helper script
python3 -m uvicorn app.main:app --reload --port 8000
```

### 3. Access the API

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Projects
- `GET /api/v1/projects` - List all projects
- `GET /api/v1/projects/{project_id}` - Get project details
- `POST /api/v1/projects` - Create new project
- `PUT /api/v1/projects/{project_id}` - Update project
- `DELETE /api/v1/projects/{project_id}` - Delete project

### Prompts
- `GET /api/v1/projects/{project_id}/prompts` - List project prompts
- `POST /api/v1/prompts` - Create new prompt

### Citations
- `GET /api/v1/projects/{project_id}/citations` - List project citations
- `GET /api/v1/citations/recent` - Get recent citations

### Statistics
- `GET /api/v1/stats/overview` - Get overview statistics
- `GET /api/v1/stats/leaderboard` - Get citation rate leaderboard

## Database Connections

The API connects to:
- **PostgreSQL**: localhost:5437 (business data)
- **Neo4j**: localhost:7688 (knowledge graph)
- **Redis**: localhost:6382 (caching)

Make sure all Docker containers are running:
```bash
docker ps | grep claude-mcp
```

## Configuration

Edit `app/config.py` to change database connections and other settings.

## Development

### Run Tests

```bash
pytest
```

### Check Coverage

```bash
pytest --cov=app --cov-report=html
```

### Format Code

```bash
black app/
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── database.py          # Database connections
│   ├── models/              # Pydantic models
│   ├── routers/             # API routes
│   └── services/            # Business logic
├── tests/
├── requirements.txt
└── README.md
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Database Connection Error

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres-claude-mcp

# Restart if needed
docker restart postgres-claude-mcp
```

## Next Steps

1. Add GraphQL endpoint
2. Implement authentication
3. Add rate limiting
4. Set up Alembic for migrations
5. Deploy to production
