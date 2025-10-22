#!/bin/bash
# Start Celery worker for processing tasks

source venv/bin/activate

celery -A app.celery_app:celery_app worker \
  --loglevel=info \
  --concurrency=2 \
  --queues=citations \
  --hostname=worker@%h
