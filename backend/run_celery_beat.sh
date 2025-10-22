#!/bin/bash
# Start Celery beat scheduler for periodic tasks

source venv/bin/activate

celery -A app.celery_app:celery_app beat \
  --loglevel=info \
  --scheduler=celery.beat:PersistentScheduler
