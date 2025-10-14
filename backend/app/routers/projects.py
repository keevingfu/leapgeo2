"""Projects API router"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, func, text
from typing import List

from ..database import get_db
from ..models.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectDetailResponse,
)
from ..services import Neo4jService, get_neo4j_service, CacheService, get_cache_service
import psycopg2

router = APIRouter()


@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache_service),
):
    """
    Get all projects

    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **status**: Filter by status (active/paused/completed)
    """
    # Try to get from cache first
    cache_key = f"geo:projects:list:{status}:{skip}:{limit}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # Build query
    query = "SELECT * FROM projects WHERE id != 'test'"
    params = {}

    if status:
        query += " AND status = :status"
        params['status'] = status

    query += " ORDER BY citation_rate DESC NULLS LAST LIMIT :limit OFFSET :skip"
    params['limit'] = limit
    params['skip'] = skip

    # Execute raw SQL (since we already have the schema)
    conn = await db.connection()
    result = await conn.execute(text(query), params)
    rows = result.fetchall()

    projects = [
        ProjectResponse(
            id=row._mapping['id'],
            name=row._mapping['name'],
            industry=row._mapping['industry'],
            description=row._mapping['description'],
            status=row._mapping['status'],
            citation_rate=row._mapping['citation_rate'],
            total_prompts=row._mapping['total_prompts'],
            content_published=row._mapping['content_published'],
            created_at=row._mapping['created_at'],
            updated_at=row._mapping['updated_at'],
        )
        for row in rows
    ]

    # Cache the result (skip for now due to datetime serialization)
    # cache.set(cache_key, [p.model_dump() for p in projects], ttl=600)

    return projects


@router.get("/projects/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    neo4j: Neo4jService = Depends(get_neo4j_service),
    cache: CacheService = Depends(get_cache_service),
):
    """
    Get a specific project with knowledge graph

    - **project_id**: Project identifier
    """
    # Try cache first (skip for now due to datetime serialization)
    # cached = cache.get_project_info(project_id)
    # if cached:
    #     return ProjectDetailResponse(**cached)

    # Get from PostgreSQL
    conn = await db.connection()
    result = await conn.execute(text("SELECT * FROM projects WHERE id = :project_id"),
        {'project_id': project_id}
    )
    row = result.fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )

    # Get platforms
    platforms_result = await conn.execute(text("SELECT platform FROM project_platforms WHERE project_id = :project_id"),
        {'project_id': project_id}
    )
    platforms = [r._mapping['platform'] for r in platforms_result.fetchall()]

    # Get knowledge graph from Neo4j
    knowledge_graph = neo4j.get_knowledge_graph(project_id)

    project_data = {
        'id': row._mapping['id'],
        'name': row._mapping['name'],
        'industry': row._mapping['industry'],
        'description': row._mapping['description'],
        'status': row._mapping['status'],
        'citation_rate': row._mapping['citation_rate'],
        'total_prompts': row._mapping['total_prompts'],
        'content_published': row._mapping['content_published'],
        'created_at': row._mapping['created_at'],
        'updated_at': row._mapping['updated_at'],
        'platforms': platforms,
        'knowledge_graph': knowledge_graph,
    }

    # Cache the result (skip for now due to datetime serialization)
    # cache.set_project_info(project_id, project_data)

    return ProjectDetailResponse(**project_data)


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache_service),
):
    """
    Create a new project

    - **id**: Unique project identifier
    - **name**: Project name
    - **industry**: Industry category
    - **description**: Project description
    - **platforms**: List of platforms to use
    """
    conn = await db.connection()

    # Check if project already exists
    check_result = await conn.execute(text("SELECT id FROM projects WHERE id = :project_id"),
        {'project_id': project.id}
    )
    if check_result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project {project.id} already exists"
        )

    # Insert project
    await conn.execute(text("""
        INSERT INTO projects (id, name, industry, description, status)
        VALUES (:id, :name, :industry, :description, :status)
    """), {
        'id': project.id,
        'name': project.name,
        'industry': project.industry,
        'description': project.description,
        'status': project.status,
    })

    # Insert platforms
    for platform in project.platforms:
        await conn.execute(text("""
            INSERT INTO project_platforms (project_id, platform)
            VALUES (:project_id, :platform)
        """), {'project_id': project.id, 'platform': platform})

    await db.commit()

    # Get created project
    result = await conn.execute(text("SELECT * FROM projects WHERE id = :project_id"),
        {'project_id': project.id}
    )
    row = result.fetchone()

    # Invalidate cache
    cache.delete_pattern("geo:projects:list:*")

    return ProjectResponse(
        id=row._mapping['id'],
        name=row._mapping['name'],
        industry=row._mapping['industry'],
        description=row._mapping['description'],
        status=row._mapping['status'],
        citation_rate=row._mapping['citation_rate'],
        total_prompts=row._mapping['total_prompts'],
        content_published=row._mapping['content_published'],
        created_at=row._mapping['created_at'],
        updated_at=row._mapping['updated_at'],
    )


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache_service),
):
    """
    Update an existing project

    - **project_id**: Project identifier
    - **project_update**: Fields to update
    """
    conn = await db.connection()

    # Check if project exists
    check_result = await conn.execute(text("SELECT id FROM projects WHERE id = :project_id"),
        {'project_id': project_id}
    )
    if not check_result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )

    # Build update query
    update_data = project_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    set_clause = ", ".join([f"{k} = :{k}" for k in update_data.keys()])
    update_data['project_id'] = project_id

    await conn.execute(text(f"""
        UPDATE projects
        SET {set_clause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = :project_id
    """), update_data)

    await db.commit()

    # Get updated project
    result = await conn.execute(text("SELECT * FROM projects WHERE id = :project_id"),
        {'project_id': project_id}
    )
    row = result.fetchone()

    # Invalidate cache
    cache.invalidate_project_cache(project_id)
    cache.delete_pattern("geo:projects:list:*")

    return ProjectResponse(
        id=row._mapping['id'],
        name=row._mapping['name'],
        industry=row._mapping['industry'],
        description=row._mapping['description'],
        status=row._mapping['status'],
        citation_rate=row._mapping['citation_rate'],
        total_prompts=row._mapping['total_prompts'],
        content_published=row._mapping['content_published'],
        created_at=row._mapping['created_at'],
        updated_at=row._mapping['updated_at'],
    )


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache_service),
):
    """
    Delete a project

    - **project_id**: Project identifier
    """
    conn = await db.connection()

    # Check if project exists
    check_result = await conn.execute(text("SELECT id FROM projects WHERE id = :project_id"),
        {'project_id': project_id}
    )
    if not check_result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )

    # Delete project (CASCADE will delete related records)
    await conn.execute(text("DELETE FROM projects WHERE id = :project_id"),
        {'project_id': project_id}
    )

    await db.commit()

    # Invalidate cache
    cache.invalidate_project_cache(project_id)
    cache.delete_pattern("geo:projects:list:*")
