"""Citations API router"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models.citation import CitationCreate, CitationResponse
from ..services.citation_tracker import get_citation_tracker_service

router = APIRouter()


class ScanRequest(BaseModel):
    """Citation scan request"""
    prompt: str
    project_id: str
    platforms: Optional[List[str]] = None  # Optional: specific platforms to scan


class ScanResponse(BaseModel):
    """Citation scan response"""
    message: str
    prompt: str
    project_id: str
    total_citations: int
    citations_saved: int
    platforms_scanned: int
    results_by_platform: dict
    timestamp: str


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


@router.post("/citations/scan", response_model=ScanResponse)
async def scan_citations(
    request: ScanRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Scan AI platforms for brand citations

    This endpoint triggers a manual citation scan across specified AI platforms.
    It uses Firecrawl to scrape platform responses and detect brand mentions.

    Supported platforms:
    - chatgpt: ChatGPT (OpenAI)
    - claude: Claude (Anthropic)
    - perplexity: Perplexity AI
    - gemini: Google Gemini
    - copilot: Microsoft Copilot
    - meta_ai: Meta AI
    - you: You.com
    - phind: Phind

    Args:
        request: Scan request with prompt, project_id, and optional platform list
        db: Database session

    Returns:
        Scan results with citation counts and details by platform

    Example:
        ```json
        {
          "prompt": "best mattress for hot sleepers",
          "project_id": "sweetnight",
          "platforms": ["perplexity", "you"]  // Optional, defaults to all
        }
        ```
    """
    try:
        # Get citation tracker service
        tracker = await get_citation_tracker_service()

        # Perform scan
        async with tracker:
            results = await tracker.scan_all_platforms(
                prompt=request.prompt,
                project_id=request.project_id,
                db=db,
                platforms=request.platforms,
            )

        return ScanResponse(
            message="Citation scan completed successfully",
            prompt=results["prompt"],
            project_id=results["project_id"],
            total_citations=results["total_citations"],
            citations_saved=results["citations_saved"],
            platforms_scanned=results["platforms_scanned"],
            results_by_platform=results["results_by_platform"],
            timestamp=results["timestamp"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Citation scan failed: {str(e)}"
        )


@router.post("/citations/scan-async")
async def scan_citations_async(
    request: ScanRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger asynchronous citation scan (background task)

    This endpoint is useful for long-running scans that might timeout.
    The scan will run in the background and save results to the database.

    Returns immediately with a task ID that can be used to check status.

    Args:
        request: Scan request with prompt and project_id
        background_tasks: FastAPI background tasks manager
        db: Database session

    Returns:
        Task acknowledgment with request details
    """
    async def run_scan():
        tracker = await get_citation_tracker_service()
        async with tracker:
            await tracker.scan_all_platforms(
                prompt=request.prompt,
                project_id=request.project_id,
                db=db,
                platforms=request.platforms,
            )

    background_tasks.add_task(run_scan)

    return {
        "message": "Citation scan started in background",
        "prompt": request.prompt,
        "project_id": request.project_id,
        "status": "processing",
    }
