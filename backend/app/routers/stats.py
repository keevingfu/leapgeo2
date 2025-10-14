"""Statistics API router"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ..database import get_db
from ..services import CacheService, get_cache_service

router = APIRouter()


@router.get("/stats/leaderboard")
async def get_leaderboard(
    cache: CacheService = Depends(get_cache_service),
):
    """Get citation rate leaderboard"""
    return {
        "leaderboard": cache.get_leaderboard()
    }


@router.get("/stats/overview")
async def get_overview(
    db: AsyncSession = Depends(get_db),
):
    """Get platform overview statistics"""
    conn = await db.connection()

    # Total projects
    projects_result = await conn.execute(text("SELECT COUNT(*) as count FROM projects WHERE id != 'test'"))
    total_projects = projects_result.fetchone()._mapping['count']

    # Total prompts
    prompts_result = await conn.execute(text("SELECT COUNT(*) as count FROM prompts"))
    total_prompts = prompts_result.fetchone()._mapping['count']

    # Total citations
    citations_result = await conn.execute(text("SELECT COUNT(*) as count FROM citations"))
    total_citations = citations_result.fetchone()._mapping['count']

    # Average citation rate
    avg_result = await conn.execute(text("""
        SELECT AVG(citation_rate) as avg_rate FROM projects WHERE id != 'test'
    """))
    avg_citation_rate = avg_result.fetchone()._mapping['avg_rate']

    return {
        "total_projects": total_projects,
        "total_prompts": total_prompts,
        "total_citations": total_citations,
        "avg_citation_rate": float(avg_citation_rate) if avg_citation_rate else 0,
    }
