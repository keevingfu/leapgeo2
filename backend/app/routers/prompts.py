"""Prompts API router"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List

from ..database import get_db
from ..models.prompt import PromptCreate, PromptUpdate, PromptResponse

router = APIRouter()


@router.get("/projects/{project_id}/prompts", response_model=List[PromptResponse])
async def get_project_prompts(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """Get all prompts for a project"""
    conn = await db.connection()
    result = await conn.execute(text("""
        SELECT p.*, array_agg(pp.platform) as platforms
        FROM prompts p
        LEFT JOIN prompt_platforms pp ON p.id = pp.prompt_id
        WHERE p.project_id = :project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT :limit OFFSET :skip
    """), {'project_id': project_id, 'limit': limit, 'skip': skip})

    prompts = []
    for row in result.fetchall():
        prompts.append(PromptResponse(
            id=row._mapping['id'],
            project_id=row._mapping['project_id'],
            text=row._mapping['text'],
            intent=row._mapping['intent'],
            priority=row._mapping['priority'],
            score=row._mapping['score'],
            citation_rate=row._mapping['citation_rate'],
            status=row._mapping['status'],
            platforms=row._mapping['platforms'] or [],
            created_date=row._mapping['created_date'],
            created_at=row._mapping['created_at'],
            updated_at=row._mapping['updated_at'],
        ))

    return prompts


@router.post("/prompts", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    prompt: PromptCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new prompt"""
    conn = await db.connection()

    result = await conn.execute(text("""
        INSERT INTO prompts (project_id, text, intent, priority, score, citation_rate, status, created_date)
        VALUES (:project_id, :text, :intent, :priority, :score, :citation_rate, :status, :created_date)
        RETURNING id
    """), prompt.model_dump())

    prompt_id = result.fetchone()._mapping['id']

    # Insert platforms
    for platform in prompt.platforms:
        await conn.execute(text("""
            INSERT INTO prompt_platforms (prompt_id, platform)
            VALUES (:prompt_id, :platform)
        """), {'prompt_id': prompt_id, 'platform': platform})

    await db.commit()

    # Get created prompt
    result = await conn.execute(text("SELECT * FROM prompts WHERE id = :id"), {'id': prompt_id})
    row = result.fetchone()

    return PromptResponse(
        id=row._mapping['id'],
        project_id=row._mapping['project_id'],
        text=row._mapping['text'],
        intent=row._mapping['intent'],
        priority=row._mapping['priority'],
        score=row._mapping['score'],
        citation_rate=row._mapping['citation_rate'],
        status=row._mapping['status'],
        platforms=prompt.platforms,
        created_date=row._mapping['created_date'],
        created_at=row._mapping['created_at'],
        updated_at=row._mapping['updated_at'],
    )
