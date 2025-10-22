"""Celery tasks for citation tracking

This module contains background tasks for scanning AI platforms
and tracking brand citations on a scheduled basis.
"""

import logging
from typing import List, Dict
from datetime import datetime

from ..celery_app import celery_app
from ..database import async_session_maker
from ..services.citation_tracker import get_citation_tracker_service
from sqlalchemy import text

logger = logging.getLogger(__name__)


@celery_app.task(
    name="app.tasks.citation_tasks.scan_prompt_citations",
    bind=True,
    max_retries=3,
    default_retry_delay=300,  # 5 minutes
)
def scan_prompt_citations(
    self,
    prompt_text: str,
    project_id: str,
    platforms: List[str] = None
) -> Dict:
    """
    Scan AI platforms for citations of a specific prompt

    Args:
        prompt_text: The prompt/query to search for
        project_id: Project identifier
        platforms: Optional list of platform IDs (defaults to all)

    Returns:
        Dictionary with scan results
    """
    try:
        logger.info(f"Starting citation scan for prompt: '{prompt_text}' (project: {project_id})")

        # Run async scan in sync context
        import asyncio

        async def run_scan():
            async with async_session_maker() as db:
                tracker = await get_citation_tracker_service()
                async with tracker:
                    results = await tracker.scan_all_platforms(
                        prompt=prompt_text,
                        project_id=project_id,
                        db=db,
                        platforms=platforms,
                    )
                return results

        results = asyncio.run(run_scan())

        logger.info(
            f"Citation scan completed: {results['total_citations']} citations found "
            f"across {results['platforms_scanned']} platforms"
        )

        return results

    except Exception as exc:
        logger.error(f"Citation scan failed: {str(exc)}")
        # Retry the task
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.tasks.citation_tasks.scheduled_citation_scan",
    bind=True,
)
def scheduled_citation_scan(self) -> Dict:
    """
    Daily scheduled task to scan all active prompts across all projects

    This task runs every day at 2 AM UTC and scans the top-priority
    prompts (P0 and P1) for all active projects.

    Returns:
        Summary of all scans performed
    """
    logger.info("Starting scheduled daily citation scan")

    try:
        import asyncio

        async def run_daily_scan():
            async with AsyncSessionLocal() as db:
                # Get all active projects
                conn = await db.connection()
                projects_result = await conn.execute(
                    text("SELECT id FROM projects WHERE status = 'active' ORDER BY id")
                )
                projects = [row[0] for row in projects_result.fetchall()]

                logger.info(f"Found {len(projects)} active projects")

                # For each project, get high-priority prompts (P0 and P1)
                all_results = []

                for project_id in projects:
                    prompts_result = await conn.execute(
                        text("""
                            SELECT text FROM prompts
                            WHERE project_id = :project_id
                              AND status = 'active'
                              AND priority IN ('P0', 'P1')
                            ORDER BY priority, score DESC
                            LIMIT 10
                        """),
                        {"project_id": project_id}
                    )
                    prompts = [row[0] for row in prompts_result.fetchall()]

                    logger.info(f"Project {project_id}: scanning {len(prompts)} high-priority prompts")

                    # Scan each prompt
                    tracker = await get_citation_tracker_service()
                    async with tracker:
                        for prompt_text in prompts:
                            try:
                                results = await tracker.scan_all_platforms(
                                    prompt=prompt_text,
                                    project_id=project_id,
                                    db=db,
                                )
                                all_results.append({
                                    "project_id": project_id,
                                    "prompt": prompt_text,
                                    "citations_found": results["total_citations"],
                                    "status": "success",
                                })
                                logger.info(
                                    f"Scanned '{prompt_text}': {results['total_citations']} citations"
                                )

                            except Exception as e:
                                logger.error(f"Failed to scan prompt '{prompt_text}': {str(e)}")
                                all_results.append({
                                    "project_id": project_id,
                                    "prompt": prompt_text,
                                    "status": "failed",
                                    "error": str(e),
                                })

                return {
                    "task": "scheduled_daily_scan",
                    "projects_scanned": len(projects),
                    "total_prompts": len(all_results),
                    "successful_scans": len([r for r in all_results if r.get("status") == "success"]),
                    "total_citations": sum(r.get("citations_found", 0) for r in all_results),
                    "results": all_results,
                    "timestamp": datetime.now().isoformat(),
                }

        results = asyncio.run(run_daily_scan())

        logger.info(
            f"Daily scan completed: {results['successful_scans']}/{results['total_prompts']} "
            f"prompts scanned, {results['total_citations']} total citations found"
        )

        return results

    except Exception as exc:
        logger.error(f"Scheduled citation scan failed: {str(exc)}")
        raise


@celery_app.task(
    name="app.tasks.citation_tasks.weekly_comprehensive_scan",
    bind=True,
)
def weekly_comprehensive_scan(self) -> Dict:
    """
    Weekly comprehensive scan of all prompts (including P2)

    Runs every Monday at 3 AM UTC to perform a full scan of all active
    prompts across all projects, including lower-priority ones.

    Returns:
        Summary of comprehensive scan
    """
    logger.info("Starting weekly comprehensive citation scan")

    try:
        import asyncio

        async def run_weekly_scan():
            async with AsyncSessionLocal() as db:
                # Get all active projects
                conn = await db.connection()
                projects_result = await conn.execute(
                    text("SELECT id FROM projects WHERE status = 'active' ORDER BY id")
                )
                projects = [row[0] for row in projects_result.fetchall()]

                logger.info(f"Found {len(projects)} active projects for weekly scan")

                all_results = []

                for project_id in projects:
                    # Get ALL active prompts (no priority filter)
                    prompts_result = await conn.execute(
                        text("""
                            SELECT text FROM prompts
                            WHERE project_id = :project_id
                              AND status = 'active'
                            ORDER BY priority, score DESC
                            LIMIT 50
                        """),
                        {"project_id": project_id}
                    )
                    prompts = [row[0] for row in prompts_result.fetchall()]

                    logger.info(f"Project {project_id}: comprehensive scan of {len(prompts)} prompts")

                    tracker = await get_citation_tracker_service()
                    async with tracker:
                        for prompt_text in prompts:
                            try:
                                results = await tracker.scan_all_platforms(
                                    prompt=prompt_text,
                                    project_id=project_id,
                                    db=db,
                                )
                                all_results.append({
                                    "project_id": project_id,
                                    "prompt": prompt_text,
                                    "citations_found": results["total_citations"],
                                    "platforms_scanned": results["platforms_scanned"],
                                    "status": "success",
                                })

                            except Exception as e:
                                logger.error(f"Failed to scan prompt '{prompt_text}': {str(e)}")
                                all_results.append({
                                    "project_id": project_id,
                                    "prompt": prompt_text,
                                    "status": "failed",
                                    "error": str(e),
                                })

                return {
                    "task": "weekly_comprehensive_scan",
                    "projects_scanned": len(projects),
                    "total_prompts": len(all_results),
                    "successful_scans": len([r for r in all_results if r.get("status") == "success"]),
                    "total_citations": sum(r.get("citations_found", 0) for r in all_results),
                    "results": all_results,
                    "timestamp": datetime.now().isoformat(),
                }

        results = asyncio.run(run_weekly_scan())

        logger.info(
            f"Weekly comprehensive scan completed: {results['successful_scans']}/{results['total_prompts']} "
            f"prompts scanned, {results['total_citations']} total citations found"
        )

        return results

    except Exception as exc:
        logger.error(f"Weekly comprehensive scan failed: {str(exc)}")
        raise


@celery_app.task(
    name="app.tasks.citation_tasks.update_citation_rates",
    bind=True,
)
def update_citation_rates(self) -> Dict:
    """
    Calculate and update citation rates for all projects

    This task calculates the Citation Rate metric for each project
    based on recent citation data.

    Citation Rate = (Number of citations found) / (Number of prompts scanned)

    Returns:
        Updated citation rates for all projects
    """
    logger.info("Updating citation rates for all projects")

    try:
        import asyncio

        async def calculate_rates():
            async with AsyncSessionLocal() as db:
                conn = await db.connection()

                # Get citation counts per project (last 30 days)
                result = await conn.execute(
                    text("""
                        SELECT
                            project_id,
                            COUNT(DISTINCT id) as citation_count,
                            COUNT(DISTINCT prompt) as prompt_count
                        FROM citations
                        WHERE detected_at >= NOW() - INTERVAL '30 days'
                        GROUP BY project_id
                    """)
                )

                rates = {}
                for row in result.fetchall():
                    project_id = row[0]
                    citation_count = row[1]
                    prompt_count = row[2]

                    citation_rate = citation_count / prompt_count if prompt_count > 0 else 0.0

                    # Update project citation_rate
                    await conn.execute(
                        text("""
                            UPDATE projects
                            SET citation_rate = :rate
                            WHERE id = :project_id
                        """),
                        {"rate": citation_rate, "project_id": project_id}
                    )

                    rates[project_id] = {
                        "citation_count": citation_count,
                        "prompt_count": prompt_count,
                        "citation_rate": round(citation_rate, 3),
                    }

                await db.commit()

                return {
                    "task": "update_citation_rates",
                    "projects_updated": len(rates),
                    "rates": rates,
                    "timestamp": datetime.now().isoformat(),
                }

        results = asyncio.run(calculate_rates())

        logger.info(f"Citation rates updated for {results['projects_updated']} projects")

        return results

    except Exception as exc:
        logger.error(f"Failed to update citation rates: {str(exc)}")
        raise
