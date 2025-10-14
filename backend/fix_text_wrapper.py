#!/usr/bin/env python3
"""Add text() wrapper to all conn.execute() calls"""

import re
from pathlib import Path

# Files to fix
files = [
    'app/routers/projects.py',
]

for file_path in files:
    path = Path(file_path)
    if not path.exists():
        print(f"❌ File not found: {file_path}")
        continue

    content = path.read_text()
    original = content

    # Pattern 1: await conn.execute("...", {...})
    # Replace with: await conn.execute(text("..."), {...})
    content = re.sub(
        r'await conn\.execute\(\s*"([^"]+)",',
        r'await conn.execute(text("\1"),',
        content
    )

    # Pattern 2: await conn.execute("""...""", {...})
    # Replace with: await conn.execute(text("""..."""), {...})
    content = re.sub(
        r'await conn\.execute\(\s*"""',
        r'await conn.execute(text("""',
        content
    )

    # Fix closing for triple quotes that don't have proper closing
    # Pattern: text("""..."""), should be text("""...""")),
    content = re.sub(
        r'(text\("""[^"]*?"""\)),',
        r'\1),',
        content
    )

    if content != original:
        path.write_text(content)
        print(f"✅ Fixed: {file_path}")

        # Show a sample of changes
        print("  Sample changes:")
        lines_orig = original.split('\n')
        lines_new = content.split('\n')
        for i, (o, n) in enumerate(zip(lines_orig, lines_new), 1):
            if o != n:
                print(f"    Line {i}: {o.strip()[:60]}... → {n.strip()[:60]}...")
                if i > 105:  # Only show first few changes
                    break
    else:
        print(f"ℹ️  No changes: {file_path}")

print("\n✨ Text wrapper fix complete!")
