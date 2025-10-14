# Leap GEO Platform

[![CI/CD Pipeline](https://github.com/keevingfu/leapgeo2/actions/workflows/ci.yml/badge.svg)](https://github.com/keevingfu/leapgeo2/actions/workflows/ci.yml)

> A comprehensive GEO (Generative Engine Optimization) content marketing platform for improving brand citation rates in AI search engines (ChatGPT, Claude, Perplexity, etc.)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (for frontend)
- **Python** 3.13+ (for backend)
- **Docker Desktop** (for databases)
- **Git** (version control)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5174

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

API: http://localhost:8000

### Database Setup

All databases run in Docker containers:

```bash
# Check if containers are running
docker ps | grep -E "(postgres|neo4j|redis|mongo)"

# Start specific database if needed
docker start postgres-claude-mcp
docker start neo4j-claude-mcp
docker start redis-claude-mcp
docker start mongodb-claude-mcp
```

**Database Ports**:
- PostgreSQL: 5437
- Neo4j: 7688 (Bolt), 7475 (HTTP)
- Redis: 6382
- MongoDB: 27018

## 🏗️ Project Structure

```
leapgeo2/
├── frontend/          # React 19 + TypeScript + Vite + Tailwind CSS 4
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/    # Portal layout
│   │   │   ├── pages/     # Independent page components
│   │   │   └── common/    # Shared components
│   │   └── services/      # API client
│   └── package.json
├── backend/           # FastAPI + Python 3.13
│   ├── app/
│   │   ├── routers/       # API endpoints
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   └── config.py      # Configuration
│   └── requirements.txt
├── scripts/           # Database initialization scripts
├── .env               # Environment variables (gitignored)
└── .github/workflows/ # CI/CD pipelines
```

## 📚 Key Features

### 🎯 Multi-Project Management
Manage multiple brand campaigns (SweetNight, Eufy, Hisense) from a single platform.

### 🧠 Knowledge Graph
Neo4j-powered knowledge graph connecting brands, products, features, problems, and user groups.

### 📝 Prompt Management
Organize and prioritize AI search prompts (P0/P1/P2) with citation rate tracking.

### 📊 Citation Tracking
Monitor brand mentions across 8 AI platforms:
- ChatGPT
- Claude
- Perplexity
- Gemini
- Microsoft Copilot
- You.com
- Phind
- Anthropic

### 🚀 Multi-Platform Publishing
Distribute content across 9 platforms:
- YouTube
- Reddit
- Quora
- Medium
- Wikipedia
- LinkedIn
- Twitter/X
- Amazon
- Official Website

### 📈 Analytics & Reporting
Real-time dashboards showing:
- Citation Rate (target: >28%)
- Share of Voice
- Content Performance
- Platform Coverage

## 🔧 Technology Stack

### Frontend
- **React 19.2.0** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.1.10** - Build tool (< 1s builds)
- **Tailwind CSS 4.1.14** - Utility-first CSS
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **FastAPI 0.119.0** - Modern Python web framework
- **SQLAlchemy 2.0.44** - ORM with AsyncPG
- **Pydantic 2.12.0** - Data validation
- **Uvicorn** - ASGI server

### Databases
- **PostgreSQL 16.10** - Business data (projects, prompts, citations)
- **Neo4j** - Knowledge graph (entities and relationships)
- **Redis** - Caching and sessions
- **MongoDB** - Document storage (raw content)

## 🔄 CI/CD & Auto-Sync

This project uses **automated Git workflows** for continuous integration and deployment.

### Local Auto-Push

Every commit to `main`, `dev`, or `develop` branches automatically pushes to GitHub via Git hooks.

```bash
# Make changes
git add .
git commit -m "Your commit message"
# 🚀 Automatically pushes to GitHub!
```

**To disable auto-push**:
```bash
chmod -x .git/hooks/post-commit
```

**To re-enable**:
```bash
chmod +x .git/hooks/post-commit
```

### GitHub Actions Workflows

#### 1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)
Runs on every push to `main`:
- ✅ Frontend build & type check
- ✅ Backend validation
- ✅ Security scan (Trivy)
- ✅ Upload build artifacts

#### 2. **Auto Documentation Sync** (`.github/workflows/auto-sync.yml`)
Updates documentation index when Markdown files change.

### View CI/CD Status

Visit: https://github.com/keevingfu/leapgeo2/actions

## 🔐 Security & Environment Variables

**IMPORTANT**: Never commit sensitive credentials to Git!

### Environment Setup

1. Create `.env` file in project root:
```bash
# .env file (already gitignored)
GITHUB_TOKEN=your_token_here
POSTGRES_PASSWORD=your_password
NEO4J_PASSWORD=your_password
REDIS_PASSWORD=your_password
```

2. File permissions (for security):
```bash
chmod 600 .env
```

### Protected Files

The following are automatically excluded by `.gitignore`:
- `.env` and `.env.*` files
- `node_modules/`
- `venv/` and Python virtual environments
- `dist/` and build outputs
- `*.log` files
- Database dumps
- API keys and credentials

## 📖 Documentation

### Core Documentation
- [CLAUDE.md](CLAUDE.md) - AI development guide
- [HEALTH-CHECK-REPORT.md](HEALTH-CHECK-REPORT.md) - System health status
- [AUTOMATION-INTEGRATION-GUIDE.md](AUTOMATION-INTEGRATION-GUIDE.md) - Automation tools
- [DATA-ARCHITECTURE.md](DATA-ARCHITECTURE.md) - Database design

### Frontend Documentation
- [frontend/CLAUDE.md](frontend/CLAUDE.md) - Frontend development guide
- [frontend/PROJECT-STRUCTURE.md](frontend/PROJECT-STRUCTURE.md) - Component architecture
- [frontend/TEST-REPORT.md](frontend/TEST-REPORT.md) - E2E test results

### Backend Documentation
- [backend/README.md](backend/README.md) - API documentation

### Chinese Documentation
- [GEO智能内容营销平台开发文档.md](GEO智能内容营销平台开发文档.md)
- [GEO智能内容营销平台使用指南.md](GEO智能内容营销平台使用指南.md)

## 🧪 Testing

### Frontend E2E Tests

```bash
cd frontend
npx playwright test                 # Run all tests
npx playwright test --headed        # Run in headed mode
npx playwright show-report          # View results
```

### Backend Tests

```bash
cd backend
pytest                              # Run unit tests (when added)
```

## 📊 Project Health

**Overall Score**: 95/100 ✅

- ✅ All dependencies installed (358 frontend, 37 backend)
- ✅ Zero security vulnerabilities
- ✅ TypeScript compilation: PASS
- ✅ Production build: < 1 second
- ✅ All API endpoints: Working
- ✅ 4 databases: Healthy

**Latest health check**: See [HEALTH-CHECK-REPORT.md](HEALTH-CHECK-REPORT.md)

## 🤝 Contributing

This project uses automated Git hooks for code quality:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit with clear messages** (`git commit -m "Add amazing feature"`)
5. **Push automatically happens via hook** 🚀
6. **Open a Pull Request**

### Commit Message Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

## 📝 License

This project is proprietary software. All rights reserved.

## 🔗 Links

- **GitHub Repository**: https://github.com/keevingfu/leapgeo2
- **Issues**: https://github.com/keevingfu/leapgeo2/issues
- **CI/CD Status**: https://github.com/keevingfu/leapgeo2/actions

## 📮 Contact

For questions or support, please open an issue on GitHub.

---

**Built with** ❤️ **using Claude Code**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
