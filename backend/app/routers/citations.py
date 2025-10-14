"""Citations API router"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List

from ..database import get_db
from ..models.citation import CitationCreate, CitationResponse

router = APIRouter()


@router.get("/projects/{project_id}/citations", response_model=List[CitationResponse])
async def get_project_citations(
    project_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Get citations for a project"""
    conn = await db.connection()
    result = await conn.execute(text("""
        SELECT * FROM citations
        WHERE project_id = :project_id
        ORDER BY detected_at DESC
        LIMIT :limit
    """), {'project_id': project_id, 'limit': limit})

    return [
        CitationResponse(**row._mapping)
        for row in result.fetchall()
    ]


@router.get("/citations/recent", response_model=List[CitationResponse])
async def get_recent_citations(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    """Get recent citations across all projects"""
    conn = await db.connection()
    result = await conn.execute(text("""
        SELECT * FROM citations
        ORDER BY detected_at DESC
        LIMIT :limit
    """), {'limit': limit})

    return [CitationResponse(**row._mapping) for row in result.fetchall()]
