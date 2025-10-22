"""Test Celery tasks"""

from app.tasks.citation_tasks import scan_prompt_citations

# Test sending a task to the queue
result = scan_prompt_citations.delay(
    prompt_text="best cooling mattress",
    project_id="sweetnight",
    platforms=["you"]
)

print(f"Task submitted: {result.id}")
print(f"Task state: {result.state}")
print("Waiting for result...")

# Wait for result with timeout
try:
    task_result = result.get(timeout=60)
    print("\n=== Task Result ===")
    print(f"Status: Success")
    print(f"Citations found: {task_result.get('total_citations', 0)}")
    print(f"Platforms scanned: {task_result.get('platforms_scanned', 0)}")
    print(f"Timestamp: {task_result.get('timestamp', 'N/A')}")
except Exception as e:
    print(f"\n=== Task Error ===")
    print(f"Error: {str(e)}")
