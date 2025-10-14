#!/usr/bin/env python3
"""Fix row['column'] to row._mapping['column'] in router files"""

import re
from pathlib import Path

# Files to fix
files = [
    'app/routers/prompts.py',
    'app/routers/projects.py',
    'app/routers/citations.py',
]

for file_path in files:
    path = Path(file_path)
    if not path.exists():
        print(f"❌ File not found: {file_path}")
        continue

    content = path.read_text()
    original = content

    # Replace row['column'] with row._mapping['column']
    # Match pattern: row['any_column_name']
    content = re.sub(r"row\['(\w+)'\]", r"row._mapping['\1']", content)

    # Replace result.fetchone()['column'] with result.fetchone()._mapping['column']
    content = re.sub(
        r"\.fetchone\(\)\['(\w+)'\]",
        r".fetchone()._mapping['\1']",
        content
    )

    if content != original:
        path.write_text(content)
        print(f"✅ Fixed: {file_path}")
    else:
        print(f"ℹ️  No changes: {file_path}")

print("\n✨ Row mapping fix complete!")
