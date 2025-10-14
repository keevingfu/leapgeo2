#!/usr/bin/env python3
"""Fix %(param)s to :param in all router files"""

import re
from pathlib import Path

# Files to fix
files = [
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

    # Replace %(param)s with :param
    # Match pattern: %(any_param_name)s
    content = re.sub(r'%\((\w+)\)s', r':\1', content)

    if content != original:
        path.write_text(content)
        print(f"✅ Fixed: {file_path}")
    else:
        print(f"ℹ️  No changes: {file_path}")

print("\n✨ Parameter format fix complete!")
