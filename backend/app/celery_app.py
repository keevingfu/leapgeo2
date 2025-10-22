"""Celery application configuration

This module configures Celery for background task processing and scheduled jobs.
Uses Redis as the message broker and result backend.
"""

from celery import Celery
from celery.schedules import crontab
from .config import get_settings

settings = get_settings()

# Create Celery app
celery_app = Celery(
    "geo_platform",
    broker=f"redis://:{settings.redis_password}@{settings.redis_host}:{settings.redis_port}/0",
    backend=f"redis://:{settings.redis_password}@{settings.redis_host}:{settings.redis_port}/1",
    include=["app.tasks.citation_tasks"]  # Auto-discover tasks
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,

    # Task execution
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes max per task
    task_soft_time_limit=25 * 60,  # 25 minutes soft limit
    task_acks_late=True,  # Acknowledge task after completion
    task_reject_on_worker_lost=True,

    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour
    result_extended=True,  # Store more task info

    # Worker settings
    worker_prefetch_multiplier=1,  # One task at a time
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks

    # Beat schedule (scheduled tasks)
    beat_schedule={
        # Daily citation scan at 2 AM UTC
        "daily-citation-scan": {
            "task": "app.tasks.citation_tasks.scheduled_citation_scan",
            "schedule": crontab(hour=2, minute=0),  # Every day at 2:00 AM UTC
            "args": (),
            "options": {
                "queue": "citations",
                "priority": 5,
            },
        },

        # Weekly comprehensive scan on Monday at 3 AM UTC
        "weekly-full-scan": {
            "task": "app.tasks.citation_tasks.weekly_comprehensive_scan",
            "schedule": crontab(hour=3, minute=0, day_of_week=1),  # Monday 3:00 AM
            "args": (),
            "options": {
                "queue": "citations",
                "priority": 3,
            },
        },
    },

    # Queue routing
    task_routes={
        "app.tasks.citation_tasks.*": {"queue": "citations"},
    },
)

# Optional: Configure logging
celery_app.conf.worker_hijack_root_logger = False
